/**
 * ============================================================================
 * TEST SUITE: Catalog Data Verification
 * ============================================================================
 * Verifies:
 * 1. Exactly 100 items.
 * 2. Exactly 10 categories.
 * 3. Exactly 10 items per category.
 * 4. Unique IDs 1 through 100 with no gaps.
 * 5. Unique, valid URL-safe slugs.
 * 6. Valid schema for all entries (id, slug, title, category, image, status).
 * 7. Punctuation, ampersands, and capitalization intact.
 */

const assert = require('node:assert');
const { DESIGN_CATALOG, DESIGN_CATEGORIES } = require('./designs-data.js');

console.log('Running Design Catalog Verification Tests...\n');

// 1. Total Count
assert.strictEqual(DESIGN_CATALOG.length, 100, `Expected 100 items, got ${DESIGN_CATALOG.length}`);
console.log('✓ Exactly 100 catalog items present');

// 2. Exact 10 Categories
const EXPECTED_CATEGORIES = [
  "Arithmetic & fractions",
  "Algebra",
  "Geometry",
  "Trigonometry",
  "Calculus",
  "Statistics & probability",
  "Numbers & number theory",
  "Graphs & coordinates",
  "Math teacher energy",
  "Cutesy math creatures"
];

assert.strictEqual(DESIGN_CATEGORIES.length, 10, 'Expected 10 categories');
assert.deepStrictEqual(DESIGN_CATEGORIES, EXPECTED_CATEGORIES, 'Categories must match exact specifications');
console.log('✓ Exact 10 categories defined');

// 3. Category Distribution (10 items each)
const categoryCounts = {};
DESIGN_CATEGORIES.forEach(cat => { categoryCounts[cat] = 0; });

DESIGN_CATALOG.forEach(item => {
  assert(DESIGN_CATEGORIES.includes(item.category), `Unexpected category: ${item.category}`);
  categoryCounts[item.category]++;
});

Object.entries(categoryCounts).forEach(([cat, count]) => {
  assert.strictEqual(count, 10, `Category "${cat}" expected 10 items, got ${count}`);
});
console.log('✓ Each of the 10 categories has exactly 10 items');

// 4. IDs 1 through 100 Unique and Sequential
const idSet = new Set();
DESIGN_CATALOG.forEach((item, index) => {
  const expectedId = index + 1;
  assert.strictEqual(item.id, expectedId, `Item index ${index} must have id ${expectedId}`);
  assert(!idSet.has(item.id), `Duplicate ID: ${item.id}`);
  idSet.add(item.id);
});
assert.strictEqual(idSet.size, 100, 'Expected 100 unique IDs');
console.log('✓ IDs 1 through 100 are completely unique and sequential');

// 5. Slugs Unique and URL-safe
const slugSet = new Set();
const urlSafeRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

DESIGN_CATALOG.forEach(item => {
  assert(item.slug && typeof item.slug === 'string', `Invalid slug on item #${item.id}`);
  assert(urlSafeRegex.test(item.slug), `Slug "${item.slug}" on item #${item.id} is not valid URL-safe`);
  assert(!slugSet.has(item.slug), `Duplicate slug "${item.slug}" detected on item #${item.id}`);
  slugSet.add(item.slug);
});
assert.strictEqual(slugSet.size, 100, 'Expected 100 unique slugs');
console.log('✓ All 100 slugs are unique and URL-safe');

// 6. Schema and Field Checks
DESIGN_CATALOG.forEach(item => {
  assert(typeof item.id === 'number', `Item #${item.id} id is not a number`);
  assert(typeof item.title === 'string' && item.title.trim().length > 0, `Item #${item.id} title missing`);
  assert(typeof item.category === 'string', `Item #${item.id} category missing`);
  assert(item.image === null || typeof item.image === 'string', `Item #${item.id} image invalid`);
  assert.strictEqual(item.status, 'concept', `Item #${item.id} status must be "concept"`);
});
console.log('✓ All 100 records conform to required data schema (with image: null and status: "concept")');

// 7. Spot Check Specific Required Concepts
const spotChecks = [
  { id: 1, title: 'Count on Me', cat: 'Arithmetic & fractions' },
  { id: 21, title: 'Acute Teacher', cat: 'Geometry' },
  { id: 29, title: 'Parallel Lines Have So Much in Common', cat: 'Geometry' },
  { id: 43, title: 'Integrate Kindness', cat: 'Calculus' },
  { id: 61, title: 'Prime Time Teacher', cat: 'Numbers & number theory' },
  { id: 91, title: 'Hypote-moose', cat: 'Cutesy math creatures' },
  { id: 93, title: 'Calcu-later, Alligator', cat: 'Cutesy math creatures' },
  { id: 100, title: 'Sum Bunny Loves Math', cat: 'Cutesy math creatures' }
];

spotChecks.forEach(check => {
  const item = DESIGN_CATALOG.find(d => d.id === check.id);
  assert(item, `Spot check failed: item #${check.id} not found`);
  assert.strictEqual(item.title, check.title, `Spot check failed for title of #${check.id}`);
  assert.strictEqual(item.category, check.cat, `Spot check failed for category of #${check.id}`);
});
console.log('✓ Spot checks passed for titles, punctuation, and categories');

console.log('\nAll catalog validation assertions PASSED successfully! 🎯\n');
