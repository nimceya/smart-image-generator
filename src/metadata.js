import fs from "fs/promises";
import path from "path";

const metadataFolder = path.join(
  process.cwd(),
  "generated",
  "metadata"
);

export async function saveMetadata(data) {
  await fs.mkdir(metadataFolder, {
    recursive: true,
  });

  const filename = `image-${Date.now()}.json`;

  const filepath = path.join(
    metadataFolder,
    filename
  );

  await fs.writeFile(
    filepath,
    JSON.stringify(data, null, 2)
  );

  return filepath;
}