import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, "..");

const generatedDir = path.join(
  rootDir,
  "generated"
);

const galleryDir = path.join(
  rootDir,
  "gallery"
);

// Serve gallery
app.use(
  express.static(galleryDir)
);

// Serve generated images
app.use(
  "/generated",
  express.static(generatedDir)
);

// API: Get metadata
app.get("/api/images", (req, res) => {
  try {
    const files = fs.readdirSync(generatedDir);

    const metadataFiles = files.filter(
      (file) => file.endsWith(".json")
    );

    const images = metadataFiles.map(
      (file) => {
        const filePath = path.join(
          generatedDir,
          file
        );

        return JSON.parse(
          fs.readFileSync(filePath, "utf-8")
        );
      }
    );

    // Newest first
    images.sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

    res.json(images);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to load images",
    });
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(
    `🖼️ Gallery running at http://localhost:${PORT}`
  );
});