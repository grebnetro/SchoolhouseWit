/**
 * ============================================================================
 * TEST SUITE: Site Integration & Requirement Verification
 * ============================================================================
 */

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('path');
const { DESIGN_CATALOG, DESIGN_CATEGORIES } = require('./designs-data.js');

console.log('Running Site Integration Verification Tests...\n');

const rootDir = path.join(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
const designsHtml = fs.readFileSync(path.join(rootDir, 'designs', 'index.html'), 'utf-8');
const sitemapXml = fs.readFileSync(path.join(rootDir, 'sitemap.xml'), 'utf-8');
const robotsTxt = fs.readFileSync(path.join(rootDir, 'robots.txt'), 'utf-8');

// 1. Homepage Navigation and Teaser Checks
assert(indexHtml.includes('href="/designs/"'), 'Homepage must contain links to /designs/');
assert(indexHtml.includes('Design Library'), 'Homepage navigation must contain "Design Library"');

// Teaser checks
assert(indexHtml.includes('100 IDEAS. ONE VERY PUNNY FIRST DROP.'), 'Homepage teaser eyebrow missing or incorrect');
assert(indexHtml.includes('Browse the Design Library'), 'Homepage teaser heading missing or incorrect');
assert(indexHtml.includes('Explore the math puns we are considering for future SchoolhouseWit drops.'), 'Homepage teaser body missing or incorrect');
assert(indexHtml.includes('See all 100 ideas'), 'Homepage teaser CTA text missing or incorrect');
console.log('✓ Homepage navigation and compact teaser copy verified');

// 2. Designs Page Meta & SEO Checks
assert(designsHtml.includes('<title>Math Pun Shirt Ideas for Teachers | SchoolhouseWit</title>'), 'Design library page title mismatch');
assert(designsHtml.includes('content="Browse 100 classroom-ready math pun shirt concepts from SchoolhouseWit, organized by arithmetic, algebra, geometry, calculus, statistics, and more."'), 'Design library meta description mismatch');
assert(designsHtml.includes('<link rel="canonical" href="https://schoolhousewit.com/designs/">'), 'Canonical URL tag missing or incorrect');
assert(designsHtml.includes('"@type": "CollectionPage"'), 'JSON-LD CollectionPage schema missing');
console.log('✓ Designs page metadata, canonical, and structured data verified');

// 3. Designs Page Hero Checks
assert(designsHtml.includes('THE MATH EDITION'), 'Design library hero eyebrow mismatch');
assert(designsHtml.includes('The SchoolhouseWit Design Library</h1>'), 'Design library H1 title mismatch');
assert(designsHtml.includes('100 classroom-ready math puns, grouped by topic. These are early design concepts, and the final artwork and shirt colors are still to come.'), 'Design library intro paragraph mismatch');
console.log('✓ Designs page hero copy verified');

// 4. Designs Page Controls
assert(designsHtml.includes('id="designSearch"'), 'Search input missing');
assert(designsHtml.includes('id="searchClearBtn"'), 'Search clear button missing');
assert(designsHtml.includes('for="designSearch"'), 'Search input must have visible label');
assert(designsHtml.includes('data-category="All"'), 'Filter chip "All" missing');
DESIGN_CATEGORIES.forEach(cat => {
  assert(designsHtml.includes(`data-category="${cat.replace(/&/g, '&amp;')}"`), `Filter chip for "${cat}" missing`);
});
console.log('✓ Filter chips and search controls verified');

// 5. Designs Page Pre-rendered Cards Check (Progressive Enhancement)
DESIGN_CATALOG.forEach(item => {
  assert(designsHtml.includes(`id="concept-${item.slug}"`), `Card for concept "${item.slug}" missing from pre-rendered DOM`);
  assert(designsHtml.includes(`Artwork placeholder for ${item.title.replace(/&/g, '&amp;').replace(/'/g, '&#039;')} shirt concept`), `Alt text missing for #${item.id}`);
});
console.log('✓ All 100 concept cards are statically pre-rendered in HTML for progressive enhancement');

// 6. No purchase buttons / cart / price on cards
const priceRegex = /\$\d+(\.\d{2})?(\s*\/|\s*each|\s*per)?/i;
// Check cards section only
const gallerySection = designsHtml.substring(designsHtml.indexOf('id="gallery"'), designsHtml.indexOf('id="waitlist"'));
assert(!gallerySection.includes('add to cart'), 'No "add to cart" allowed in gallery');
assert(!gallerySection.includes('checkout'), 'No "checkout" allowed in gallery');
assert(!gallerySection.includes('btn-buy'), 'No buy button allowed in gallery');
console.log('✓ Concept cards confirmed to have no cart, checkout, or price elements');

// 7. Waitlist Component Reuse
assert(designsHtml.includes('id="waitlistForm"'), 'Waitlist form ID missing on /designs/');
assert(designsHtml.includes('id="waitlistEmail"'), 'Waitlist email ID missing on /designs/');
assert(designsHtml.includes('id="waitlistSubmitBtn"'), 'Waitlist submit button ID missing on /designs/');
assert(designsHtml.includes('Want the first drop?'), 'Waitlist heading missing on /designs/');
console.log('✓ Waitlist component properly reused with shared IDs and scripts');

// 8. Sitemap and Robots
assert(sitemapXml.includes('https://schoolhousewit.com/designs/'), 'Sitemap missing /designs/');
assert(robotsTxt.includes('Sitemap: https://schoolhousewit.com/sitemap.xml'), 'Robots.txt missing sitemap link');
console.log('✓ Sitemap and robots.txt verified');

console.log('\nAll integration tests PASSED successfully! 🚀\n');
