const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesDir = path.join(__dirname, '../frontend/public/assets/images');

async function optimizeImages() {
  if (!fs.existsSync(imagesDir)) {
    console.log('Images directory does not exist:', imagesDir);
    return;
  }

  const files = fs.readdirSync(imagesDir);
  console.log(`Found ${files.length} static images in public assets...`);

  // Remove exact duplicates first (e.g., "8142774 (1).webp" if "8142774.webp" exists)
  const dup = path.join(imagesDir, '8142774 (1).webp');
  if (fs.existsSync(dup)) {
    fs.unlinkSync(dup);
    console.log('Removed duplicate file: 8142774 (1).webp');
  }

  let totalSavedBytes = 0;
  let processedCount = 0;

  for (const file of files) {
    if (file === '8142774 (1).webp' || file.startsWith('temp_')) continue;
    const filePath = path.join(imagesDir, file);
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) continue;

    const ext = path.extname(file).toLowerCase();
    if (ext === '.webp' || ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.avif') {
      try {
        const originalSize = stat.size;
        const inputBuffer = fs.readFileSync(filePath);

        const outputBuffer = await sharp(inputBuffer)
          .webp({ quality: 70, effort: 6 })
          .toBuffer();

        if (outputBuffer.length < originalSize) {
          fs.writeFileSync(filePath, outputBuffer);
          const saved = originalSize - outputBuffer.length;
          totalSavedBytes += saved;
          processedCount++;
          console.log(`Optimized ${file}: ${(originalSize / 1024).toFixed(1)}KB -> ${(outputBuffer.length / 1024).toFixed(1)}KB (saved ${(saved / 1024).toFixed(1)}KB)`);
        }
      } catch (err) {
        console.error(`Failed to optimize image ${file}:`, err.message);
      }
    }
  }

  // Clean any leftover temp files
  const remainingFiles = fs.readdirSync(imagesDir);
  for (const f of remainingFiles) {
    if (f.startsWith('temp_')) {
      try { fs.unlinkSync(path.join(imagesDir, f)); } catch (_) {}
    }
  }

  console.log(`\nSuccess! Processed ${processedCount} static images. Total static image bandwidth saved: ${(totalSavedBytes / 1024).toFixed(1)} KB.`);
}

optimizeImages();
