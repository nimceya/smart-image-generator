import "dotenv/config";
import readline from "readline";
import fs from "fs";
import path from "path";

import { enhancePrompt } from "./promptEnhancer.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function generateImage(
  theme,
  sizeName,
  aspectRatio,
  styleName,
  stylePrompt
) {
  // STEP 6: Enhance the user's prompt
  console.log("\n🤖 Enhancing prompt...");

  const enhancedPrompt = await enhancePrompt(theme);

  console.log("\n✨ Enhanced prompt:");
  console.log(enhancedPrompt);

  // Add style instructions
  const finalPrompt = `
${enhancedPrompt}

Visual style: ${stylePrompt}
High quality, detailed composition, strong lighting, visually polished.
`;

  console.log("\n🎨 Generating image...");

  const response = await fetch(
    "https://openrouter.ai/api/v1/images",
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        model: "openai/gpt-image-1",
        prompt: finalPrompt,
        aspect_ratio: aspectRatio,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error?.message || "Image generation failed"
    );
  }

  const base64Image = result.data?.[0]?.b64_json;

  if (!base64Image) {
    throw new Error("No image data returned from API");
  }

  // Convert Base64 → Buffer
  const imageBuffer = Buffer.from(base64Image, "base64");

  // Create generated folder
  const outputDir = path.join(process.cwd(), "generated");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Create safe filename
  const safeTheme = theme
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const timestamp = Date.now();

  const filename =
    `${safeTheme}-${sizeName}-${styleName}-${timestamp}.png`;

  const filePath = path.join(outputDir, filename);

  // Save image
  fs.writeFileSync(filePath, imageBuffer);

  // Metadata
  const metadata = {
    id: timestamp.toString(),

    theme,

    enhancedPrompt,

    finalPrompt: finalPrompt.trim(),

    model: "openai/gpt-image-1",

    size: sizeName,

    aspectRatio,

    style: styleName,

    stylePrompt,

    filename,

    createdAt: new Date().toISOString(),

    cost: result.usage?.cost ?? null,
  };

  const metadataFilename =
    `${safeTheme}-${sizeName}-${styleName}-${timestamp}.json`;

  const metadataPath =
    path.join(outputDir, metadataFilename);

  fs.writeFileSync(
    metadataPath,
    JSON.stringify(metadata, null, 2)
  );

  console.log("\n✅ Image generated successfully!");

  console.log(`📁 Image: ${filePath}`);

  console.log(`📝 Metadata: ${metadataPath}`);

  if (result.usage?.cost !== undefined) {
    console.log(`💰 Image cost: $${result.usage.cost}`);
  }
}

async function main() {
  try {
    // Theme
    const theme = await ask("🎨 Enter your theme: ");

    // SIZE
    console.log("\n📐 Choose image size:");

    console.log("1. Square     (1:1)");
    console.log("2. Landscape  (3:2)");
    console.log("3. Portrait   (2:3)");

    const sizeChoice = await ask(
      "\n👉 Choose 1, 2, or 3: "
    );

    let sizeName;
    let aspectRatio;

    switch (sizeChoice.trim()) {
      case "1":
        sizeName = "square";
        aspectRatio = "1:1";
        break;

      case "2":
        sizeName = "landscape";
        aspectRatio = "3:2";
        break;

      case "3":
        sizeName = "portrait";
        aspectRatio = "2:3";
        break;

      default:
        throw new Error(
          "Invalid size choice. Choose 1, 2, or 3."
        );
    }

    // STYLE
    console.log("\n🖌️ Choose image style:");

    console.log("1. Cinematic");
    console.log("2. Photorealistic");
    console.log("3. Artistic");

    const styleChoice = await ask(
      "\n👉 Choose 1, 2, or 3: "
    );

    let styleName;
    let stylePrompt;

    switch (styleChoice.trim()) {
      case "1":
        styleName = "cinematic";
        stylePrompt =
          "cinematic lighting, dramatic atmosphere, movie-like composition";
        break;

      case "2":
        styleName = "photorealistic";
        stylePrompt =
          "photorealistic, realistic materials, natural lighting, highly detailed";
        break;

      case "3":
        styleName = "artistic";
        stylePrompt =
          "creative artistic composition, expressive visual style, rich details";
        break;

      default:
        throw new Error(
          "Invalid style choice. Choose 1, 2, or 3."
        );
    }

    // Generate
    await generateImage(
      theme,
      sizeName,
      aspectRatio,
      styleName,
      stylePrompt
    );

  } catch (error) {
    console.error("\n❌ Error:", error.message);
  } finally {
    rl.close();
  }
}

main();