const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcPath = 'C:\\Users\\micha\\.gemini\\antigravity-ide\\brain\\d49eb685-8c70-4cf5-b364-302a12e5a992\\.user_uploaded\\media_1790167804197.jpg';
const outCandidatePath = path.join(__dirname, '..', 'design-assets', 'work', 'count-on-me', 'candidate_clean.png');

async function processKeying() {
  fs.mkdirSync(path.dirname(outCandidatePath), { recursive: true });

  const { data, info } = await sharp(srcPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const rgbaBuffer = Buffer.alloc(width * height * 4);

  let keyedPixels = 0;
  let fringeCleaned = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 3;
      const dstIdx = (y * width + x) * 4;

      let r = data[srcIdx];
      let g = data[srcIdx + 1];
      let b = data[srcIdx + 2];

      // Measure magenta excess
      // Pure magenta is R=255, G=0, B=255.
      // Margin over Green indicates magenta tint
      const rExcess = r - g;
      const bExcess = b - g;
      const magentaTint = Math.min(rExcess, bExcess);

      if (magentaTint > 45 && (r > 120 || b > 120)) {
        // Magenta background pixel -> full transparency
        rgbaBuffer[dstIdx] = 0;
        rgbaBuffer[dstIdx + 1] = 0;
        rgbaBuffer[dstIdx + 2] = 0;
        rgbaBuffer[dstIdx + 3] = 0;
        keyedPixels++;
      } else if (magentaTint > 18 && (r > 80 || b > 80)) {
        // Fringe pixel: remove magenta spill by suppressing red and blue down to green level
        // or neutral dark outline tone
        rgbaBuffer[dstIdx] = Math.min(r, g + 10);
        rgbaBuffer[dstIdx + 1] = g;
        rgbaBuffer[dstIdx + 2] = Math.min(b, g + 10);
        rgbaBuffer[dstIdx + 3] = 255;
        fringeCleaned++;
      } else {
        // Artwork pixel
        rgbaBuffer[dstIdx] = r;
        rgbaBuffer[dstIdx + 1] = g;
        rgbaBuffer[dstIdx + 2] = b;
        rgbaBuffer[dstIdx + 3] = 255;
      }
    }
  }

  // Morphological anti-fringe pass on alpha border:
  // If an opaque pixel has multiple transparent neighbors and still has magenta bias, make transparent
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        if (rgbaBuffer[idx + 3] === 255) {
          const r = rgbaBuffer[idx];
          const g = rgbaBuffer[idx + 1];
          const b = rgbaBuffer[idx + 2];

          // Check if neighboring pixels are transparent
          const neighborTransparent =
            (rgbaBuffer[((y - 1) * width + x) * 4 + 3] === 0 ? 1 : 0) +
            (rgbaBuffer[((y + 1) * width + x) * 4 + 3] === 0 ? 1 : 0) +
            (rgbaBuffer[(y * width + (x - 1)) * 4 + 3] === 0 ? 1 : 0) +
            (rgbaBuffer[(y * width + (x + 1)) * 4 + 3] === 0 ? 1 : 0);

          if (neighborTransparent >= 2) {
            // Edge pixel: if reddish/magenta fringe, despill or trim
            if (r > g + 15 || b > g + 15) {
              rgbaBuffer[idx] = Math.min(r, g);
              rgbaBuffer[idx + 2] = Math.min(b, g);
            }
          }
        }
      }
    }
  }

  await sharp(rgbaBuffer, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(outCandidatePath);

  console.log(`Keying Complete!`);
  console.log(`Keyed Background Pixels: ${keyedPixels} (${((keyedPixels / (width * height)) * 100).toFixed(1)}%)`);
  console.log(`Fringe Despilled Pixels: ${fringeCleaned}`);
  console.log(`Saved clean candidate: ${outCandidatePath}`);
}

processKeying().catch(console.error);
