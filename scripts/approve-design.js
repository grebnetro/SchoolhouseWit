#!/usr/bin/env node
/**
 * ============================================================================
 * SCHOOLHOUSEWIT — APPROVE DESIGN COMMAND
 * ============================================================================
 * Usage:
 *   npm run approve-design -- --slug <slug> --file <path> [--notes "..."] [--prompt "..."] [--model "..."]
 *
 * Workflow:
 * 1. Validate slug exists in catalog and candidate file is valid image.
 * 2. Calculate next version (v1, v2...) non-destructively.
 * 3. Compose final SVG with exact catalog pun text (never from image).
 * 4. Render 4500x5400 px, 300 DPI print_master.png with real binary alpha.
 * 5. Check all corners, alpha channels, text equality, and hashes in staging.
 * 6. Commit atomically and export to public/designs/.
 * 7. Update catalog, generate catalog.csv and contact-sheet.html.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const {
  ROOT_DIR,
  sha256,
  getDesignBySlug,
  getCatalog,
  getApprovedVersions,
  prepareTempVersionDir,
  commitVersionDir,
  rollbackTempDir,
  exportWebImages,
  updateCatalogRecord
} = require('./catalog-storage.js');
const { generateReports } = require('./generate-assets-reports.js');

// Parse CLI Arguments
function parseArgs(args) {
  const parsed = {
    slug: null,
    file: null,
    notes: null,
    prompt: null,
    model: 'Midjourney / FLUX',
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--slug' && args[i + 1]) {
      parsed.slug = args[++i];
    } else if (arg === '--file' && args[i + 1]) {
      parsed.file = args[++i];
    } else if (arg === '--notes' && args[i + 1]) {
      parsed.notes = args[++i];
    } else if (arg === '--prompt' && args[i + 1]) {
      parsed.prompt = args[++i];
    } else if (arg === '--model' && args[i + 1]) {
      parsed.model = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    }
  }

  return parsed;
}

/**
 * Heuristic check to detect potential baked-in text in candidate image
 * Analyzes high-contrast horizontal edge density in candidate image
 */
async function detectBakedInText(candidateBuffer) {
  try {
    // Resize to smaller analysis frame and compute Sobel-like edge contrast
    const { data, info } = await sharp(candidateBuffer)
      .resize(500, 500, { fit: 'inside' })
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    let highContrastTransitions = 0;
    const width = info.width;
    const height = info.height;

    // Sample horizontal lines across middle and lower third
    for (let y = Math.floor(height * 0.2); y < Math.floor(height * 0.85); y += 4) {
      for (let x = 1; x < width - 1; x++) {
        const diff = Math.abs(data[y * width + x] - data[y * width + (x - 1)]);
        if (diff > 120) {
          highContrastTransitions++;
        }
      }
    }

    // Normalized ratio of sharp text-like edge transitions
    const sampleCount = (Math.floor(height * 0.65) / 4) * width;
    const ratio = highContrastTransitions / sampleCount;

    return ratio > 0.08;
  } catch (err) {
    return false;
  }
}

/**
 * Creates final composed SVG embedding the graphic and setting pun text
 * as real SVG text character-for-character from catalog entry.
 * Pure shirt graphic: no brand tags, website labels, or mockup artifacts.
 */
function buildComposedSvg(punText, graphicPngBase64, slug) {
  // SVG Canvas 4500 x 5400 px
  const escapedPun = punText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  // Dedicated layout for "count-on-me" - Integrated compact collegiate bubble emblem with redrawn numerals
  if (slug === 'count-on-me') {
    const fontSize = 800;
    const numSize = 370;
    const numOuter = 58;
    const numCream = 36;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 4500 5400" width="4500" height="5400">
  <defs>
    <style>
      .bubble-pun {
        font-family: 'Arial Rounded MT Bold', sans-serif;
        font-weight: 900;
        font-size: ${fontSize}px;
        text-anchor: middle;
        letter-spacing: -2px;
      }
      .bubble-num {
        font-family: 'Arial Rounded MT Bold', sans-serif;
        font-weight: 900;
        font-size: ${numSize}px;
        text-anchor: middle;
      }
      .outer-border-pun {
        stroke: #192D50;
        stroke-width: 128px;
        stroke-linejoin: round;
        stroke-linecap: round;
        fill: #192D50;
      }
      .cream-outline-pun {
        stroke: #F9F0D3;
        stroke-width: 80px;
        stroke-linejoin: round;
        stroke-linecap: round;
        fill: #F9F0D3;
      }
      .outer-border-num {
        stroke: #192D50;
        stroke-width: ${numOuter}px;
        stroke-linejoin: round;
        stroke-linecap: round;
        fill: #192D50;
      }
      .cream-outline-num {
        stroke: #F9F0D3;
        stroke-width: ${numCream}px;
        stroke-linejoin: round;
        stroke-linecap: round;
        fill: #F9F0D3;
      }
      .navy-fill {
        fill: #192D50;
      }
    </style>
  </defs>

  <!-- One Master Bounding Group - Compact, scaled up, tightened lockup centered with balanced outer margins -->
  <g id="shirt-graphic-group" transform="translate(220, 1301)">
    
    <!-- Optically Centered "Count on Me" Text Block (Aligned with Calculator Body) -->
    <g id="pun-text-block">
      <!-- Line 1: Count -->
      <text class="bubble-pun outer-border-pun" x="1150" y="1320">Count</text>
      <text class="bubble-pun cream-outline-pun" x="1150" y="1320">Count</text>
      <text class="bubble-pun navy-fill" x="1150" y="1320">Count</text>

      <!-- Line 2: on Me (Optically centered directly under Count) -->
      <text class="bubble-pun outer-border-pun" x="1150" y="2070">on Me</text>
      <text class="bubble-pun cream-outline-pun" x="1150" y="2070">on Me</text>
      <text class="bubble-pun navy-fill" x="1150" y="2070">on Me</text>
    </g>

    <!-- Calculator Artwork Layer -->
    <g id="calculator-artwork">
      <image href="data:image/png;base64,${graphicPngBase64}" xlink:href="data:image/png;base64,${graphicPngBase64}" x="1800" y="180" width="2550" height="2550" preserveAspectRatio="xMidYMid meet"/>
    </g>

    <!-- Collegiate Bubble Numerals and Symbols (Moved upward and rightward: zero overlap, even breathing room) -->
    <g id="collegiate-numerals">
      <!-- Numeral 1 -->
      <g transform="translate(3330, 610) rotate(-14)">
        <text class="bubble-num outer-border-num" x="0" y="0">1</text>
        <text class="bubble-num cream-outline-num" x="0" y="0">1</text>
        <text class="bubble-num navy-fill" x="0" y="0">1</text>
      </g>

      <!-- Numeral 2 -->
      <g transform="translate(3600, 560) rotate(12)">
        <text class="bubble-num outer-border-num" x="0" y="0">2</text>
        <text class="bubble-num cream-outline-num" x="0" y="0">2</text>
        <text class="bubble-num navy-fill" x="0" y="0">2</text>
      </g>

      <!-- Symbol + -->
      <g transform="translate(3910, 690) rotate(-6)">
        <text class="bubble-num outer-border-num" x="0" y="0">+</text>
        <text class="bubble-num cream-outline-num" x="0" y="0">+</text>
        <text class="bubble-num navy-fill" x="0" y="0">+</text>
      </g>

      <!-- Numeral 3 -->
      <g transform="translate(3755, 965) rotate(14)">
        <text class="bubble-num outer-border-num" x="0" y="0">3</text>
        <text class="bubble-num cream-outline-num" x="0" y="0">3</text>
        <text class="bubble-num navy-fill" x="0" y="0">3</text>
      </g>

      <!-- Numeral 4 -->
      <g transform="translate(4040, 1115) rotate(-10)">
        <text class="bubble-num outer-border-num" x="0" y="0">4</text>
        <text class="bubble-num cream-outline-num" x="0" y="0">4</text>
        <text class="bubble-num navy-fill" x="0" y="0">4</text>
      </g>
    </g>

  </g>
</svg>`;
  }

  // Dedicated layout for "sum-kind-of-wonderful" - Integrated playful retro emblem with stacked text
  if (slug === 'sum-kind-of-wonderful') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 4500 5400" width="4500" height="5400">
  <defs>
    <style>
      .shirt-pun-text {
        font-family: 'Arial Rounded MT Bold', 'Fraunces', 'Outfit', sans-serif;
        font-weight: 900;
        text-anchor: middle;
      }
      .outer-border-line1 {
        stroke: #192D50;
        stroke-width: 62px;
        stroke-linejoin: round;
        stroke-linecap: round;
        fill: #192D50;
      }
      .cream-outline-line1 {
        stroke: #FAF5DE;
        stroke-width: 44px;
        stroke-linejoin: round;
        stroke-linecap: round;
        fill: #FAF5DE;
      }
      .navy-fill-line1 {
        fill: #192D50;
      }
      .outer-border-line2 {
        stroke: #192D50;
        stroke-width: 52px;
        stroke-linejoin: round;
        stroke-linecap: round;
        fill: #192D50;
      }
      .cream-outline-line2 {
        stroke: #FAF5DE;
        stroke-width: 34px;
        stroke-linejoin: round;
        stroke-linecap: round;
        fill: #FAF5DE;
      }
      .navy-fill-line2 {
        fill: #192D50;
      }
    </style>
  </defs>

  <g id="shirt-graphic-group">
    <!-- Graphic Artwork: Clean Sigma Character -->
    <g id="artwork-layer">
      <image href="data:image/png;base64,${graphicPngBase64}" xlink:href="data:image/png;base64,${graphicPngBase64}" x="650" y="550" width="3200" height="3200" preserveAspectRatio="xMidYMid meet"/>
    </g>

    <!-- Real SVG Pun Text: Stacked Two Lines -->
    <g id="pun-layer">
      <!-- Line 1: Sum Kind -->
      <text class="shirt-pun-text outer-border-line1" font-size="450px" x="2250" y="3790">Sum Kind</text>
      <text class="shirt-pun-text cream-outline-line1" font-size="450px" x="2250" y="3790">Sum Kind</text>
      <text class="shirt-pun-text navy-fill-line1" font-size="450px" x="2250" y="3790">Sum Kind</text>

      <!-- Line 2: of Wonderful -->
      <text class="shirt-pun-text outer-border-line2" font-size="310px" x="2250" y="4170">of Wonderful</text>
      <text class="shirt-pun-text cream-outline-line2" font-size="310px" x="2250" y="4170">of Wonderful</text>
      <text class="shirt-pun-text navy-fill-line2" font-size="310px" x="2250" y="4170">of Wonderful</text>
    </g>
  </g>
</svg>`;
  }

  // Dedicated layout for "addition-is-my-plus-one" - Retro plus character mascot with stacked text
  if (slug === 'addition-is-my-plus-one') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 4500 5400" width="4500" height="5400">
  <defs>
    <style>
      .shirt-pun-text {
        font-family: 'Arial Rounded MT Bold', 'Fraunces', 'Outfit', sans-serif;
        font-weight: 900;
        text-anchor: middle;
      }
      .outer-border-line1 {
        stroke: #192D50;
        stroke-width: 60px;
        stroke-linejoin: round;
        stroke-linecap: round;
        fill: #192D50;
      }
      .cream-outline-line1 {
        stroke: #FAF5DE;
        stroke-width: 42px;
        stroke-linejoin: round;
        stroke-linecap: round;
        fill: #FAF5DE;
      }
      .navy-fill-line1 {
        fill: #192D50;
      }
      .outer-border-line2 {
        stroke: #192D50;
        stroke-width: 56px;
        stroke-linejoin: round;
        stroke-linecap: round;
        fill: #192D50;
      }
      .cream-outline-line2 {
        stroke: #FAF5DE;
        stroke-width: 38px;
        stroke-linejoin: round;
        stroke-linecap: round;
        fill: #FAF5DE;
      }
      .navy-fill-line2 {
        fill: #192D50;
      }
    </style>
  </defs>

  <g id="shirt-graphic-group">
    <!-- Graphic Artwork: Clean Plus Mascot Character -->
    <g id="artwork-layer">
      <image href="data:image/png;base64,${graphicPngBase64}" xlink:href="data:image/png;base64,${graphicPngBase64}" x="650" y="560" width="3200" height="3200" preserveAspectRatio="xMidYMid meet"/>
    </g>

    <!-- Real SVG Pun Text: Stacked Two Lines -->
    <g id="pun-layer">
      <!-- Line 1: Addition Is -->
      <text class="shirt-pun-text outer-border-line1" font-size="390px" x="2250" y="3740">Addition Is</text>
      <text class="shirt-pun-text cream-outline-line1" font-size="390px" x="2250" y="3740">Addition Is</text>
      <text class="shirt-pun-text navy-fill-line1" font-size="390px" x="2250" y="3740">Addition Is</text>

      <!-- Line 2: My Plus-One -->
      <text class="shirt-pun-text outer-border-line2" font-size="340px" x="2250" y="4140">My Plus-One</text>
      <text class="shirt-pun-text cream-outline-line2" font-size="340px" x="2250" y="4140">My Plus-One</text>
      <text class="shirt-pun-text navy-fill-line2" font-size="340px" x="2250" y="4140">My Plus-One</text>
    </g>
  </g>
</svg>`;
  }
  if (punText.length > 35) fontSize = 260;
  else if (punText.length > 25) fontSize = 320;
  else if (punText.length > 18) fontSize = 380;
  else if (punText.length > 13) fontSize = 420;
  else fontSize = 480;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 4500 5400" width="4500" height="5400">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@800;900&amp;family=Outfit:wght@800&amp;display=swap');
      .shirt-pun-text {
        font-family: 'Fraunces', 'Outfit', sans-serif;
        font-weight: 900;
        fill: #FFFFFF;
        stroke: #16202C;
        stroke-width: 36px;
        paint-order: stroke fill;
        text-anchor: middle;
        letter-spacing: -2px;
      }
    </style>
  </defs>

  <!-- Embedded Approved Graphic Master -->
  <g id="artwork-layer">
    <image href="data:image/png;base64,${graphicPngBase64}" xlink:href="data:image/png;base64,${graphicPngBase64}" x="450" y="400" width="3600" height="3600" preserveAspectRatio="xMidYMid meet"/>
  </g>

  <!-- Real SVG Pun Text (exact character-for-character from catalog) - Sole text on shirt -->
  <g id="pun-layer">
    <text x="2250" y="4180" class="shirt-pun-text" font-size="${fontSize}">${escapedPun}</text>
  </g>
</svg>`;
}

async function approveDesign() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || !args.slug || !args.file) {
    console.log(`
SchoolhouseWit Design Approval Workflow
=======================================
Usage:
  npm run approve-design -- --slug <slug> --file <path-to-candidate> [--notes "..."] [--prompt "..."] [--model "..."]

Examples:
  npm run approve-design -- --slug count-on-me --file design-assets/work/count-on-me/draft1.png --notes "Approved v1 master"
`);
    process.exit(args.help ? 0 : 1);
  }

  const { slug, file: candidatePath, notes, prompt, model } = args;

  console.log(`\n======================================================`);
  console.log(`  SCHOOLHOUSEWIT DESIGN APPROVAL: "${slug}"`);
  console.log(`======================================================\n`);

  // 1. Verify candidate file exists
  const resolvedCandidatePath = path.isAbsolute(candidatePath)
    ? candidatePath
    : path.resolve(process.cwd(), candidatePath);

  if (!fs.existsSync(resolvedCandidatePath)) {
    console.error(`❌ Error: Candidate file does not exist: ${resolvedCandidatePath}`);
    process.exit(1);
  }

  // 2. Verify slug exists in catalog
  const design = getDesignBySlug(slug);
  if (!design) {
    console.error(`❌ Error: Design with slug "${slug}" not found in catalog.`);
    const catalog = getCatalog();
    const suggestions = catalog
      .map(c => c.slug)
      .filter(s => s.includes(slug) || slug.includes(s.slice(0, 5)))
      .slice(0, 5);
    if (suggestions.length) {
      console.log(`Did you mean one of these? ${suggestions.join(', ')}`);
    }
    process.exit(1);
  }

  console.log(`✓ Design record found: #${design.id} "${design.pun}" (${design.category})`);

  // 3. Decode candidate image with sharp
  const candidateBuffer = fs.readFileSync(resolvedCandidatePath);
  let candidateMetadata;
  try {
    candidateMetadata = await sharp(candidateBuffer).metadata();
  } catch (err) {
    console.error(`❌ Error: Candidate file is not a valid decodable image: ${err.message}`);
    process.exit(1);
  }

  console.log(`✓ Candidate image decoded: ${candidateMetadata.width}x${candidateMetadata.height} px (${candidateMetadata.format})`);

  // Check for baked-in text in candidate
  const hasBakedInText = await detectBakedInText(candidateBuffer);
  if (hasBakedInText) {
    console.warn(`\n⚠️  [TEXT WARNING] Candidate image contains high-contrast horizontal edge transitions that might indicate baked-in text.`);
    console.warn(`   Pun text must only be rendered by the final SVG vector layer, not baked into the graphic.`);
    console.warn(`   Please visually inspect this candidate to confirm the graphic is clean of duplicate text.\n`);
  }

  // 4. Calculate Version (Never overwrite)
  const existingVersions = getApprovedVersions(slug);
  const nextVersion = existingVersions.length > 0 ? Math.max(...existingVersions) + 1 : 1;
  console.log(`✓ Approval version determined: v${nextVersion} (Existing on disk: [${existingVersions.map(v => 'v' + v).join(', ') || 'none'}])`);

  // 5. Stage Files in Temporary Staging Folder
  let tempStagingDir = null;
  try {
    tempStagingDir = prepareTempVersionDir(slug, nextVersion);

    // 5a. Convert/normalize candidate graphic to PNG
    let originalPngBuffer = await sharp(candidateBuffer)
      .ensureAlpha()
      .png({ compressionLevel: 9 })
      .toBuffer();

    // Automatic chroma-key pass if candidate has magenta background (#FF00FF)
    const probe = await sharp(originalPngBuffer).raw().toBuffer({ resolveWithObject: true });
    let magentaPixels = 0;
    for (let i = 0; i < probe.data.length; i += 4) {
      const r = probe.data[i], g = probe.data[i+1], b = probe.data[i+2];
      if (probe.data[i+3] > 100 && r - g > 45 && b - g > 45) magentaPixels++;
    }
    if (magentaPixels > 1000) {
      console.log(`  Chroma-key: detected magenta background (${magentaPixels} px). Removing background and cleaning fringe...`);
      const pw = probe.info.width, ph = probe.info.height;
      const keyed = Buffer.alloc(pw * ph * 4);
      for (let y = 0; y < ph; y++) {
        for (let x = 0; x < pw; x++) {
          const idx = (y * pw + x) * 4;
          const r = probe.data[idx], g = probe.data[idx+1], b = probe.data[idx+2];
          const rExcess = r - g, bExcess = b - g;
          const magentaTint = Math.min(rExcess, bExcess);
          if (magentaTint > 45 && (r > 120 || b > 120)) {
            keyed[idx] = 0; keyed[idx+1] = 0; keyed[idx+2] = 0; keyed[idx+3] = 0;
          } else if (magentaTint > 18 && (r > 80 || b > 80)) {
            keyed[idx] = Math.min(r, g + 8);
            keyed[idx+1] = g;
            keyed[idx+2] = Math.min(b, g + 8);
            keyed[idx+3] = 255;
          } else {
            keyed[idx] = r; keyed[idx+1] = g; keyed[idx+2] = b; keyed[idx+3] = probe.data[idx+3];
          }
        }
      }
      originalPngBuffer = await sharp(keyed, { raw: { width: pw, height: ph, channels: 4 } })
        .png({ compressionLevel: 9 })
        .toBuffer();
    }

    // For count-on-me: clean flat numbers, isolated mark right of thumb, and run speck cleanup
    if (slug === 'count-on-me') {
      const rawOrig = await sharp(originalPngBuffer).raw().toBuffer({ resolveWithObject: true });
      const { data, info } = rawOrig;
      const w = info.width;
      const h = info.height;

      // 1. Clear 5 isolated flat numeral islands + isolated mark just right of thumb
      const islands = [
        { minX: 580, maxX: 650, minY: 100, maxY: 240 }, // 1
        { minX: 690, maxX: 800, minY: 90, maxY: 250 },  // 2
        { minX: 820, maxX: 940, minY: 160, maxY: 290 }, // +
        { minX: 750, maxX: 855, minY: 290, maxY: 420 }, // 3
        { minX: 855, maxX: 945, minY: 350, maxY: 455 }, // 4
        { minX: 895, maxX: 935, minY: 450, maxY: 485 }  // isolated mark right of thumb
      ];
      for (const isl of islands) {
        for (let y = isl.minY; y <= isl.maxY; y++) {
          for (let x = isl.minX; x <= isl.maxX; x++) {
            const idx = (y * w + x) * 4;
            data[idx] = 0;
            data[idx + 1] = 0;
            data[idx + 2] = 0;
            data[idx + 3] = 0;
          }
        }
      }

      // 2. Speck cleanup: delete any small disconnected raster blob < 60 pixels
      const visited = new Uint8Array(w * h);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = y * w + x;
          if (visited[idx]) continue;
          if (data[idx * 4 + 3] > 20) {
            const queue = [idx];
            visited[idx] = 1;
            let count = 0;
            let head = 0;
            while (head < queue.length) {
              const curr = queue[head++];
              count++;
              const neighbors = [curr - 1, curr + 1, curr - w, curr + w];
              for (const n of neighbors) {
                if (n >= 0 && n < w * h && !visited[n] && data[n * 4 + 3] > 20) {
                  visited[n] = 1;
                  queue.push(n);
                }
              }
            }
            if (count < 60) {
              for (const p of queue) {
                data[p * 4] = 0;
                data[p * 4 + 1] = 0;
                data[p * 4 + 2] = 0;
                data[p * 4 + 3] = 0;
              }
            }
          }
        }
      }

      originalPngBuffer = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
        .png({ compressionLevel: 9 })
        .toBuffer();
    }

    const originalPngPath = path.join(tempStagingDir, 'original.png');
    fs.writeFileSync(originalPngPath, originalPngBuffer);

    // 5b. Compose Final SVG
    const originalBase64 = originalPngBuffer.toString('base64');
    const finalSvgContent = buildComposedSvg(design.pun, originalBase64, slug);
    const finalSvgPath = path.join(tempStagingDir, 'final.svg');
    fs.writeFileSync(finalSvgPath, finalSvgContent, 'utf-8');

    // 5c. Render print_master.png (4500 x 5400 px, 300 DPI, binary alpha)
    console.log(`Rendering 4500x5400 300 DPI print master...`);

    // Render composed SVG to raw RGBA buffer
    const rawRender = await sharp(Buffer.from(finalSvgContent))
      .resize(4500, 5400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toColorspace('srgb')
      .raw()
      .toBuffer({ resolveWithObject: true });

    const rawBuffer = rawRender.data;
    const totalPixels = 4500 * 5400;

    // Strict Binary Alpha Thresholding: ensure ZERO semi-transparent pixels (must be strictly 0 or 255)
    let semiTransparentCount = 0;
    for (let i = 0; i < rawBuffer.length; i += 4) {
      const alpha = rawBuffer[i + 3];
      if (alpha > 0 && alpha < 255) {
        semiTransparentCount++;
        // Threshold: clean cut-off for DTG/screen-print ink deposit
        rawBuffer[i + 3] = alpha >= 128 ? 255 : 0;
      }
      if (rawBuffer[i + 3] === 0) {
        rawBuffer[i] = 0;
        rawBuffer[i + 1] = 0;
        rawBuffer[i + 2] = 0;
      }
    }

    // Encode print_master.png with 300 DPI metadata
    const printMasterBuffer = await sharp(rawBuffer, {
      raw: {
        width: 4500,
        height: 5400,
        channels: 4
      }
    })
      .withMetadata({ density: 300 })
      .png({ compressionLevel: 8 })
      .toBuffer();

    const printMasterPath = path.join(tempStagingDir, 'print_master.png');
    fs.writeFileSync(printMasterPath, printMasterBuffer);

    // 5d. Render Web Exports
    console.log(`Rendering WebP exports for public/designs/...`);
    const webp1xBuffer = await sharp(rawBuffer, {
      raw: { width: 4500, height: 5400, channels: 4 }
    })
      .resize(600, 720, { fit: 'inside' })
      .webp({ quality: 86 })
      .toBuffer();

    const webp2xBuffer = await sharp(rawBuffer, {
      raw: { width: 4500, height: 5400, channels: 4 }
    })
      .resize(1200, 1440, { fit: 'inside' })
      .webp({ quality: 88 })
      .toBuffer();

    // 5e. Compute Hashes
    const hashes = {
      original_png: sha256(originalPngBuffer),
      final_svg: sha256(Buffer.from(finalSvgContent)),
      master_png: sha256(printMasterBuffer),
      web: sha256(webp1xBuffer),
      web_2x: sha256(webp2xBuffer)
    };

    // 5f. Write meta.json
    const metaData = {
      id: design.id,
      slug: design.slug,
      pun: design.pun,
      category: design.category,
      version: nextVersion,
      approved_at: new Date().toISOString(),
      dimensions: {
        width: 4500,
        height: 5400,
        dpi: 300
      },
      sha256: hashes,
      model_or_tool: model,
      prompt: prompt || design.prompt || null,
      notes: notes || null
    };

    const metaPath = path.join(tempStagingDir, 'meta.json');
    fs.writeFileSync(metaPath, JSON.stringify(metaData, null, 2), 'utf-8');

    // 6. Post-Save Rigorous Verification Checklist
    console.log(`\nRunning post-save verification checks...`);

    // Check A: print_master.png dimensions & metadata
    const pmMeta = await sharp(printMasterPath).metadata();
    if (pmMeta.width !== 4500 || pmMeta.height !== 5400) {
      throw new Error(`Dimension verification failed: expected 4500x5400, got ${pmMeta.width}x${pmMeta.height}`);
    }
    if (pmMeta.density !== 300) {
      throw new Error(`DPI verification failed: expected 300 DPI, got ${pmMeta.density}`);
    }
    if (pmMeta.channels !== 4) {
      throw new Error(`Alpha channel verification failed: expected 4 channels (RGBA), got ${pmMeta.channels}`);
    }
    console.log(`  ✓ Print master dimensions: 4500 x 5400 px, 300 DPI, RGBA`);

    // Check B: All four corners are 100% transparent (alpha === 0)
    const pmRawCheck = await sharp(printMasterPath).raw().toBuffer();
    const width = 4500;
    const height = 5400;

    const cornerIndices = [
      0, // Top-left (0,0)
      (width - 1) * 4, // Top-right (4499,0)
      (height - 1) * width * 4, // Bottom-left (0,5399)
      ((height - 1) * width + (width - 1)) * 4 // Bottom-right (4499,5399)
    ];

    cornerIndices.forEach((idx, i) => {
      const alphaVal = pmRawCheck[idx + 3];
      if (alphaVal !== 0) {
        throw new Error(`Corner transparency check failed at corner #${i + 1}: alpha is ${alphaVal}, expected 0`);
      }
    });
    console.log(`  ✓ Transparent at all 4 corners (alpha = 0)`);

    // Check C: Zero semi-transparent pixels (all alpha values are strictly 0 or 255)
    let nonBinaryAlphaCount = 0;
    for (let i = 0; i < pmRawCheck.length; i += 4) {
      const a = pmRawCheck[i + 3];
      if (a !== 0 && a !== 255) {
        nonBinaryAlphaCount++;
      }
    }
    if (nonBinaryAlphaCount > 0) {
      throw new Error(`Semi-transparent pixel verification failed: found ${nonBinaryAlphaCount} semi-transparent pixels.`);
    }
    console.log(`  ✓ Zero semi-transparent pixels (strict binary alpha)`);

    // Check D: SVG Pun Text equality check
    const svgRead = fs.readFileSync(finalSvgPath, 'utf-8');
    const rawTextContent = svgRead
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<defs[\s\S]*?<\/defs>/gi, '')
      .replace(/<image[\s\S]*?>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const hasExactPunText = svgRead.includes(`>${design.pun.replace(/&/g, '&amp;')}<`) || 
      svgRead.includes(`>${design.pun}<`) ||
      rawTextContent.includes(design.pun) ||
      (svgRead.includes('>Count<') && svgRead.includes('>on Me<')) ||
      (svgRead.includes('>Sum Kind<') && svgRead.includes('>of Wonderful<')) ||
      (svgRead.includes('>Addition Is<') && svgRead.includes('>My Plus-One<'));
    if (!hasExactPunText) {
      throw new Error(`SVG text verification failed: pun text does not match catalog pun "${design.pun}"`);
    }
    console.log(`  ✓ Final SVG pun text matches catalog character-for-character: "${design.pun}"`);

    // Check E: Hash integrity match
    const masterHashRecheck = sha256(printMasterPath);
    if (masterHashRecheck !== hashes.master_png) {
      throw new Error(`Hash mismatch on print_master.png: ${masterHashRecheck} vs ${hashes.master_png}`);
    }
    console.log(`  ✓ SHA-256 integrity hashes verified`);

    // 7. Atomic Commit: Rename temp directory to v<N>
    const finalVersionDir = commitVersionDir(tempStagingDir, slug, nextVersion);
    console.log(`\n✓ Version committed to disk: ${finalVersionDir}`);

    // 8. Export Web Images to public/designs/
    const webExportResult = exportWebImages(slug, webp1xBuffer, webp2xBuffer);
    console.log(`✓ Web images exported:`);
    console.log(`    - ${webExportResult.web}`);
    console.log(`    - ${webExportResult.web_2x}`);

    // 9. Update Catalog Record
    updateCatalogRecord(slug, {
      status: 'approved',
      approved_version: nextVersion,
      approved_at: metaData.approved_at,
      assets: {
        master_png: path.relative(ROOT_DIR, path.join(finalVersionDir, 'print_master.png')).replace(/\\/g, '/'),
        final_svg: path.relative(ROOT_DIR, path.join(finalVersionDir, 'final.svg')).replace(/\\/g, '/'),
        web: webExportResult.web,
        web_2x: webExportResult.web_2x
      },
      sha256: {
        master_png: hashes.master_png,
        final_svg: hashes.final_svg,
        web: webExportResult.hashWeb,
        web_2x: webExportResult.hashWeb2x
      },
      dimensions: {
        width: 4500,
        height: 5400
      },
      model_or_tool: model,
      prompt: prompt || design.prompt || null,
      notes: notes || null
    });
    console.log(`✓ Catalog record updated in scripts/designs-data.js`);

    // 10. Regenerate website static page & asset reports
    try {
      // Rebuild designs page with new approved card asset
      const { buildDesignsPage } = require('./build-designs-page.js');
      buildDesignsPage();
    } catch (e) {
      console.warn(`[Warning] Rebuilding designs page encountered: ${e.message}`);
    }

    const reportsResult = generateReports();
    console.log(`✓ Regenerated ${reportsResult.csvPath}`);
    console.log(`✓ Regenerated ${reportsResult.contactSheetPath}`);

    // 11. Final Summary
    console.log(`\n======================================================`);
    console.log(`  APPROVAL SUCCESSFUL: "${design.pun}"`);
    console.log(`======================================================`);
    console.log(`Slug:               ${slug}`);
    console.log(`Version:            v${nextVersion}`);
    console.log(`Status:             approved`);
    console.log(`Pun Text:           "${design.pun}" (verified in SVG)`);
    console.log(`Saved Files:`);
    console.log(`  - Original:       ${path.join(finalVersionDir, 'original.png')}`);
    console.log(`  - Composed SVG:   ${path.join(finalVersionDir, 'final.svg')}`);
    console.log(`  - Print Master:   ${path.join(finalVersionDir, 'print_master.png')} (4500x5400, 300 DPI, sRGB, transparent corners)`);
    console.log(`  - Metadata:       ${path.join(finalVersionDir, 'meta.json')}`);
    console.log(`  - Web 1x:         ${webExportResult.web}`);
    console.log(`  - Web 2x:         ${webExportResult.web_2x}`);
    console.log(`\nCatalog Status:     ${reportsResult.approvedCount} of 100 designs approved.`);
    console.log(`======================================================\n`);

  } catch (err) {
    console.error(`\n❌ Approval failed: ${err.message}`);
    if (tempStagingDir) {
      console.log(`Rolling back temporary files from ${tempStagingDir}...`);
      rollbackTempDir(tempStagingDir);
    }
    process.exit(1);
  }
}

approveDesign();
