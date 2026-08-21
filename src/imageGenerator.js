import OpenAI from "openai";
import fs from "fs/promises";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function generateImage(prompt) {
  console.log("🎨 Generating image...");
  console.log("Prompt:", prompt);

  const response = await client.images.generate({
    model: "gpt-image-1",
    prompt,
    size: "1024x1024",
  });

  const imageBase64 = response.data[0].b64_json;

  if (!imageBase64) {
    throw new Error("Image was not returned from OpenAI API");
  }

  const imageBuffer = Buffer.from(imageBase64, "base64");

  await fs.mkdir("images", { recursive: true });

  const filename = `images/image-${Date.now()}.png`;

  await fs.writeFile(filename, imageBuffer);

  console.log("✅ Image saved:", filename);

  return filename;
}