const sharp = require('sharp');
const path = require('path');

const srcPath = 'C:\\Users\\micha\\.gemini\\antigravity-ide\\brain\\d49eb685-8c70-4cf5-b364-302a12e5a992\\.user_uploaded\\media_1790167804197.jpg';

async function inspect() {
  const img = sharp(srcPath);
  const meta = await img.metadata();
  console.log('Dimensions:', meta.width, 'x', meta.height, 'Channels:', meta.channels, 'Format:', meta.format);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  
  const samplePoints = [
    [0, 0],
    [info.width - 1, 0],
    [0, info.height - 1],
    [info.width - 1, info.height - 1],
    [50, 50],
    [info.width - 50, 50],
    [info.width / 2, 50] // top middle background
  ];

  samplePoints.forEach(([x, y]) => {
    const idx = (Math.floor(y) * info.width + Math.floor(x)) * info.channels;
    console.log(`Point (${x}, ${y}): R=${data[idx]}, G=${data[idx+1]}, B=${data[idx+2]}`);
  });
}

inspect().catch(console.error);
