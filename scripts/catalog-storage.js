/**
 * ============================================================================
 * SCHOOLHOUSEWIT — CATALOG & STORAGE ADAPTER MODULE
 * ============================================================================
 * Provides an abstracted interface for reading and writing catalog records
 * and storing approved design assets.
 *
 * MIGRATION TO SUPABASE:
 * When migrating to Supabase:
 * 1. Replace catalog functions with Supabase `designs` table queries.
 * 2. Replace local folder storage with Supabase Storage bucket (`designs/<slug>/v<N>/`).
 * The rest of the approve-design command and website will not need changes.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.join(__dirname, '..');
const CATALOG_FILE = path.join(ROOT_DIR, 'scripts', 'designs-data.js');
const APPROVED_BASE_DIR = path.join(ROOT_DIR, 'design-assets', 'approved');
const PUBLIC_DESIGNS_DIR = path.join(ROOT_DIR, 'public', 'designs');

/**
 * Calculates SHA-256 hash of a file or buffer
 * @param {string | Buffer} input
 * @returns {string}
 */
function sha256(input) {
  const buffer = typeof input === 'string' ? fs.readFileSync(input) : input;
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Reads all catalog records from scripts/designs-data.js
 * @returns {Array<Object>}
 */
function getCatalog() {
  // Clear require cache to ensure fresh read
  delete require.cache[require.resolve(CATALOG_FILE)];
  const { DESIGN_CATALOG } = require(CATALOG_FILE);
  return DESIGN_CATALOG;
}

/**
 * Gets a single design record by slug
 * @param {string} slug
 * @returns {Object | null}
 */
function getDesignBySlug(slug) {
  const catalog = getCatalog();
  return catalog.find((d) => d.slug.toLowerCase() === slug.toLowerCase()) || null;
}

/**
 * Returns existing approved version numbers on disk for a given slug
 * @param {string} slug
 * @returns {Array<number>}
 */
function getApprovedVersions(slug) {
  const designDir = path.join(APPROVED_BASE_DIR, slug);
  if (!fs.existsSync(designDir)) return [];

  const entries = fs.readdirSync(designDir, { withFileTypes: true });
  const versions = [];

  for (const entry of entries) {
    if (entry.isDirectory() && /^v\d+$/i.test(entry.name)) {
      const vNum = parseInt(entry.name.slice(1), 10);
      if (!isNaN(vNum)) versions.push(vNum);
    }
  }

  return versions.sort((a, b) => a - b);
}

/**
 * Prepares a clean temporary staging directory for version assets
 * @param {string} slug
 * @param {number} version
 * @returns {string} Path to temp staging directory
 */
function prepareTempVersionDir(slug, version) {
  const designDir = path.join(APPROVED_BASE_DIR, slug);
  fs.mkdirSync(designDir, { recursive: true });

  const tempDir = path.join(designDir, `.tmp_v${version}_${Date.now()}`);
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  fs.mkdirSync(tempDir, { recursive: true });
  return tempDir;
}

/**
 * Atomically renames temporary staging directory to final v<N> directory
 * @param {string} tempDir
 * @param {string} slug
 * @param {number} version
 * @returns {string} Final version directory path
 */
function commitVersionDir(tempDir, slug, version) {
  const finalDir = path.join(APPROVED_BASE_DIR, slug, `v${version}`);
  if (fs.existsSync(finalDir)) {
    throw new Error(`Version directory already exists: ${finalDir}. Overwrite rejected.`);
  }

  fs.renameSync(tempDir, finalDir);
  return finalDir;
}

/**
 * Rolls back and removes temporary staging directory
 * @param {string} tempDir
 */
function rollbackTempDir(tempDir) {
  if (tempDir && fs.existsSync(tempDir)) {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {
      console.warn(`[Rollback Warning] Could not delete temp dir: ${tempDir}`, e.message);
    }
  }
}

/**
 * Atomically writes WebP exports to public/designs/
 * @param {string} slug
 * @param {Buffer} webp1xBuffer
 * @param {Buffer} webp2xBuffer
 * @returns {{ web: string, web_2x: string, hashWeb: string, hashWeb2x: string }}
 */
function exportWebImages(slug, webp1xBuffer, webp2xBuffer) {
  fs.mkdirSync(PUBLIC_DESIGNS_DIR, { recursive: true });

  const webp1xPath = path.join(PUBLIC_DESIGNS_DIR, `${slug}.webp`);
  const webp2xPath = path.join(PUBLIC_DESIGNS_DIR, `${slug}@2x.webp`);

  const tmp1x = `${webp1xPath}.tmp_${Date.now()}`;
  const tmp2x = `${webp2xPath}.tmp_${Date.now()}`;

  fs.writeFileSync(tmp1x, webp1xBuffer);
  fs.writeFileSync(tmp2x, webp2xBuffer);

  fs.renameSync(tmp1x, webp1xPath);
  fs.renameSync(tmp2x, webp2xPath);

  return {
    web: `public/designs/${slug}.webp`,
    web_2x: `public/designs/${slug}@2x.webp`,
    hashWeb: sha256(webp1xBuffer),
    hashWeb2x: sha256(webp2xBuffer)
  };
}

/**
 * Updates a design record in scripts/designs-data.js atomically
 * @param {string} slug
 * @param {Object} updates
 */
function updateCatalogRecord(slug, updates) {
  const content = fs.readFileSync(CATALOG_FILE, 'utf-8');

  // Parse existing APPROVED_OVERRIDES map or initialize
  const overrideRegex = /const APPROVED_OVERRIDES = ({[\s\S]*?});/;
  const match = content.match(overrideRegex);

  if (!match) {
    throw new Error('Could not locate APPROVED_OVERRIDES in scripts/designs-data.js');
  }

  let overridesMap = {};
  try {
    // Evaluate current overrides
    const evalOverrides = new Function(`return ${match[1]}`);
    overridesMap = evalOverrides();
  } catch (err) {
    throw new Error(`Failed to parse current APPROVED_OVERRIDES: ${err.message}`);
  }

  // Update record
  overridesMap[slug] = {
    ...(overridesMap[slug] || {}),
    ...updates
  };

  const formattedOverrides = JSON.stringify(overridesMap, null, 2);
  const newContent = content.replace(overrideRegex, `const APPROVED_OVERRIDES = ${formattedOverrides};`);

  // Write atomically via temp file
  const tmpCatalog = `${CATALOG_FILE}.tmp_${Date.now()}`;
  fs.writeFileSync(tmpCatalog, newContent, 'utf-8');
  fs.renameSync(tmpCatalog, CATALOG_FILE);
}

module.exports = {
  ROOT_DIR,
  APPROVED_BASE_DIR,
  PUBLIC_DESIGNS_DIR,
  CATALOG_FILE,
  sha256,
  getCatalog,
  getDesignBySlug,
  getApprovedVersions,
  prepareTempVersionDir,
  commitVersionDir,
  rollbackTempDir,
  exportWebImages,
  updateCatalogRecord
};
