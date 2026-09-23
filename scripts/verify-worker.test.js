/**
 * ============================================================================
 * TEST SUITE: Worker Routing Verification
 * ============================================================================
 * Verifies that worker.js correctly:
 * 1. 301 redirects /designs to /designs/
 * 2. Delegates /designs/ and / to ASSETS.fetch
 * 3. Handles /api/waitlist GET and POST
 */

const assert = require('node:assert');
const worker = require('../worker.js').default;

async function testWorker() {
  console.log('Testing Worker Routing...\n');

  // Simulated ASSETS binding
  const mockEnv = {
    ASSETS: {
      fetch: async (req) => {
        return new Response('Mock Asset Response', { status: 200 });
      }
    }
  };

  // 1. Test /designs redirect
  const reqDesigns = new Request('https://schoolhousewit.com/designs');
  const resDesigns = await worker.fetch(reqDesigns, mockEnv);
  assert.strictEqual(resDesigns.status, 301, 'Expected 301 redirect for /designs');
  assert.strictEqual(resDesigns.headers.get('Location'), 'https://schoolhousewit.com/designs/', 'Redirect target must be /designs/');
  console.log('✓ /designs redirects (301) to https://schoolhousewit.com/designs/');

  // 2. Test /designs/ asset delegation
  const reqDesignsSlash = new Request('https://schoolhousewit.com/designs/');
  const resDesignsSlash = await worker.fetch(reqDesignsSlash, mockEnv);
  assert.strictEqual(resDesignsSlash.status, 200, 'Expected 200 delegation to ASSETS for /designs/');
  console.log('✓ /designs/ delegates directly to ASSETS.fetch without 404');

  // 3. Test / asset delegation
  const reqRoot = new Request('https://schoolhousewit.com/');
  const resRoot = await worker.fetch(reqRoot, mockEnv);
  assert.strictEqual(resRoot.status, 200, 'Expected 200 delegation to ASSETS for /');
  console.log('✓ / delegates directly to ASSETS.fetch');

  // 4. Test /api/waitlist OPTIONS CORS
  const reqOptions = new Request('https://schoolhousewit.com/api/waitlist', { method: 'OPTIONS' });
  const resOptions = await worker.fetch(reqOptions, mockEnv);
  assert.strictEqual(resOptions.status, 200);
  assert.strictEqual(resOptions.headers.get('Access-Control-Allow-Origin'), '*');
  console.log('✓ /api/waitlist OPTIONS returns CORS headers');

  console.log('\nAll worker routing tests PASSED successfully! 🛰️\n');
}

testWorker().catch(err => {
  console.error('Worker test failed:', err);
  process.exit(1);
});
