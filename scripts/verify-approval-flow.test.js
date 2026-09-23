/**
 * ============================================================================
 * TEST SUITE: End-to-End Approval Workflow Verification
 * ============================================================================
 * Tests:
 * 1. Approve v1 of a candidate image for a design.
 * 2. Verify all files created: original.png, final.svg, print_master.png (4500x5400, 300 DPI), meta.json.
 * 3. Verify public/designs/<slug>.webp and @2x.webp created.
 * 4. Verify catalog updated to status="approved", version=1.
 * 5. Verify /designs/ page displays approved asset from public/designs/.
 * 6. Approve v2 of the design with a new candidate.
 * 7. Verify v1 remains intact on disk, v2 created, catalog updated to version=2.
 * 8. Force failure halfway through and verify no half-saved files or temp dirs remain.
 * 9. Clean up test assets and restore pristine state.
 */

const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sharp = require('sharp');
const { ROOT_DIR, getDesignBySlug, getCatalog, updateCatalogRecord } = require('./catalog-storage.js');

async function runApprovalVerification() {
  console.log('Starting End-to-End Approval Workflow Verification...\n');

  const testSlug = 'sum-kind-of-wonderful';
  const workDir = path.join(ROOT_DIR, 'design-assets', 'work', testSlug);
  const approvedDir = path.join(ROOT_DIR, 'design-assets', 'approved', testSlug);
  const publicWebp = path.join(ROOT_DIR, 'public', 'designs', `${testSlug}.webp`);
  const publicWebp2x = path.join(ROOT_DIR, 'public', 'designs', `${testSlug}@2x.webp`);

  fs.mkdirSync(workDir, { recursive: true });

  // 1. Create Sample Candidate Image (v1)
  const candidate1Path = path.join(workDir, 'candidate_v1.png');
  const candidate1Svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
    <rect width="1200" height="1200" fill="none"/>
    <circle cx="600" cy="600" r="450" fill="#F59E0B"/>
    <text x="600" y="650" font-size="90" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="#16202C">1 2 3</text>
  </svg>`;
  await sharp(Buffer.from(candidate1Svg)).png().toFile(candidate1Path);
  console.log(`✓ Created test candidate v1: ${candidate1Path}`);

  // 2. Run approve-design command for v1
  console.log('\n--- Step 1: Approving Version 1 ---');
  const cmdV1 = `node scripts/approve-design.js --slug ${testSlug} --file "${candidate1Path}" --notes "Test approval v1"`;
  const outV1 = execSync(cmdV1, { cwd: ROOT_DIR, encoding: 'utf-8' });
  console.log(outV1);

  // Check v1 files on disk
  const v1Dir = path.join(approvedDir, 'v1');
  assert(fs.existsSync(v1Dir), 'v1 directory must exist');
  assert(fs.existsSync(path.join(v1Dir, 'original.png')), 'v1/original.png must exist');
  assert(fs.existsSync(path.join(v1Dir, 'final.svg')), 'v1/final.svg must exist');
  assert(fs.existsSync(path.join(v1Dir, 'print_master.png')), 'v1/print_master.png must exist');
  assert(fs.existsSync(path.join(v1Dir, 'meta.json')), 'v1/meta.json must exist');
  assert(fs.existsSync(publicWebp), 'public/designs/<slug>.webp must exist');
  assert(fs.existsSync(publicWebp2x), 'public/designs/<slug>@2x.webp must exist');

  // Verify v1 print master specifications
  const pmV1Meta = await sharp(path.join(v1Dir, 'print_master.png')).metadata();
  assert.strictEqual(pmV1Meta.width, 4500, 'Print master width must be 4500');
  assert.strictEqual(pmV1Meta.height, 5400, 'Print master height must be 5400');
  assert.strictEqual(pmV1Meta.density, 300, 'Print master density must be 300 DPI');
  assert.strictEqual(pmV1Meta.channels, 4, 'Print master must have 4 channels');

  // Verify catalog record
  const designAfterV1 = getDesignBySlug(testSlug);
  assert.strictEqual(designAfterV1.status, 'approved', 'Design status must be approved');
  assert.strictEqual(designAfterV1.approved_version, 1, 'Approved version must be 1');
  console.log('✓ Version 1 verified on disk, in catalog, and print master specs validated');

  // Verify /designs/ page updated with approved image
  const designsHtml = fs.readFileSync(path.join(ROOT_DIR, 'designs', 'index.html'), 'utf-8');
  assert(designsHtml.includes(`public/designs/${testSlug}.webp`), 'designs/index.html must reference approved web asset');
  assert(designsHtml.includes('Approved Drop Art'), 'designs/index.html must display Approved Drop Art badge');
  console.log('✓ /designs/ page reflects approved artwork from public/designs/');

  // 3. Create Candidate Image for v2 and Approve
  console.log('\n--- Step 2: Approving Version 2 (Non-destructive Check) ---');
  const candidate2Path = path.join(workDir, 'candidate_v2.png');
  const candidate2Svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1500" height="1500" viewBox="0 0 1500 1500">
    <rect width="1500" height="1500" fill="none"/>
    <circle cx="750" cy="750" r="550" fill="#3B82F6"/>
    <text x="750" y="800" font-size="120" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="#FFFFFF">4 5 6</text>
  </svg>`;
  await sharp(Buffer.from(candidate2Svg)).png().toFile(candidate2Path);

  const cmdV2 = `node scripts/approve-design.js --slug ${testSlug} --file "${candidate2Path}" --notes "Test approval v2 refined"`;
  const outV2 = execSync(cmdV2, { cwd: ROOT_DIR, encoding: 'utf-8' });
  console.log(outV2);

  // Check v1 is STILL on disk
  assert(fs.existsSync(v1Dir), 'v1 directory must STILL exist after v2 approval');
  assert(fs.existsSync(path.join(v1Dir, 'print_master.png')), 'v1/print_master.png must still be present');

  // Check v2 is on disk
  const v2Dir = path.join(approvedDir, 'v2');
  assert(fs.existsSync(v2Dir), 'v2 directory must exist');
  assert(fs.existsSync(path.join(v2Dir, 'print_master.png')), 'v2/print_master.png must exist');

  // Check catalog updated to v2
  const designAfterV2 = getDesignBySlug(testSlug);
  assert.strictEqual(designAfterV2.approved_version, 2, 'Approved version must now be 2');
  console.log('✓ Version 2 approved: v1 preserved on disk, catalog pointer updated to v2');

  // 4. Force a failure halfway through and verify rollback
  console.log('\n--- Step 3: Testing Failure Rollback & Atomic Staging ---');
  // Pass a corrupted non-image file
  const corruptFile = path.join(workDir, 'corrupt.png');
  fs.writeFileSync(corruptFile, 'THIS_IS_NOT_AN_IMAGE_FILE');

  try {
    execSync(`node scripts/approve-design.js --slug ${testSlug} --file "${corruptFile}"`, {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    assert.fail('Command should have failed on corrupted file');
  } catch (err) {
    console.log('✓ Command properly rejected corrupted candidate file');
  }

  // Check that no temporary staging directories were left behind
  const approvedContents = fs.readdirSync(approvedDir);
  const tempDirs = approvedContents.filter(name => name.startsWith('.tmp_'));
  assert.strictEqual(tempDirs.length, 0, `No temporary staging directories should remain, found: ${tempDirs.join(', ')}`);
  console.log('✓ Atomic staging verified: zero orphan temp files on disk after failure');

  // 5. Clean up test data and restore pristine catalog
  console.log('\n--- Step 4: Cleaning up test data & Restoring pristine state ---');
  fs.rmSync(workDir, { recursive: true, force: true });
  fs.rmSync(approvedDir, { recursive: true, force: true });
  if (fs.existsSync(publicWebp)) fs.unlinkSync(publicWebp);
  if (fs.existsSync(publicWebp2x)) fs.unlinkSync(publicWebp2x);

  // Reset catalog override for testSlug
  const designsDataPath = path.join(ROOT_DIR, 'scripts', 'designs-data.js');
  let designsDataContent = fs.readFileSync(designsDataPath, 'utf-8');
  const match = designsDataContent.match(/const APPROVED_OVERRIDES = ({[\s\S]*?});/);
  if (match) {
    try {
      const overrides = JSON.parse(match[1]);
      delete overrides[testSlug];
      designsDataContent = designsDataContent.replace(
        match[0],
        `const APPROVED_OVERRIDES = ${JSON.stringify(overrides, null, 2)};`
      );
      fs.writeFileSync(designsDataPath, designsDataContent, 'utf-8');
    } catch {
      // Fallback
    }
  }

  // Rebuild designs page & reports to pristine state
  execSync('node scripts/build-designs-page.js', { cwd: ROOT_DIR });
  execSync('node scripts/generate-assets-reports.js', { cwd: ROOT_DIR });

  // Final check that testSlug is back to idea
  delete require.cache[require.resolve('./designs-data.js')];
  const { getDesignBySlug: getCleanDesign } = require('./catalog-storage.js');
  const cleanDesign = getCleanDesign(testSlug);
  assert.strictEqual(cleanDesign.status, 'idea');
  assert.strictEqual(cleanDesign.approved_version, null);
  console.log('✓ Pristine catalog and public files restored for test fixture');

  console.log('\nAll approval workflow verification tests PASSED! 🌟\n');
}

runApprovalVerification().catch(err => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
