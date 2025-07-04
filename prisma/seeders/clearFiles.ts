import fs from 'fs';
import path from 'path';

export const clearFolder = (folderPath: string) => {
  const fullPath = path.resolve(folderPath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`Folder "${fullPath}" does not exist.`);
    return;
  }

  const files = fs.readdirSync(fullPath);
  for (const file of files) {
    const filePath = path.join(fullPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile()) {
      fs.unlinkSync(filePath);
    }
  }

  console.log(`✅ All files removed from folder: ${fullPath}`);
};
