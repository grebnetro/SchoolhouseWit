/**
 * Cloudflare Worker for SchoolhouseWit
 * Handles static asset serving AND waitlist database storage via Cloudflare D1.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Canonical redirect /designs to /designs/
    if (url.pathname === '/designs') {
      return Response.redirect(`${url.origin}/designs/`, 301);
    }

    // 2. API: Waitlist Email Submission & Status Check
    if (url.pathname === '/api/waitlist') {
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      if (request.method === 'GET') {
        let subscriberCount = 0;
        let dbOk = false;
        let errMessage = null;
        let recent = [];

        if (env.DB) {
          try {
            const countResult = await env.DB.prepare('SELECT count(*) as count FROM subscribers').first();
            subscriberCount = countResult ? countResult.count : 0;
            const rows = await env.DB.prepare('SELECT email, created_at FROM subscribers ORDER BY id DESC LIMIT 5').all();
            recent = rows.results || [];
            dbOk = true;
          } catch (e) {
            errMessage = e.message;
          }
        }

        return new Response(JSON.stringify({
          dbConnected: !!env.DB,
          dbOk: dbOk,
          subscriberCount: subscriberCount,
          recentSubscribers: recent,
          error: errMessage
        }), {
          status: 200,
          headers: corsHeaders
        });
      }


      if (request.method === 'POST') {
        try {
          const body = await request.json().catch(() => ({}));
          const email = (body.email || '').trim().toLowerCase();

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!email || !emailRegex.test(email)) {
            return new Response(JSON.stringify({ success: false, error: 'Invalid email address' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }

          if (!env.DB) {
            return new Response(JSON.stringify({
              success: false,
              error: 'DB binding is not attached in Cloudflare Worker settings yet.'
            }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            });
          }

          // Auto-create subscribers table if it doesn't already exist
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS subscribers (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              email TEXT UNIQUE NOT NULL,
              created_at TEXT NOT NULL,
              source TEXT DEFAULT 'website'
            )
          `).run();

          // Insert subscriber
          await env.DB.prepare(`
            INSERT OR IGNORE INTO subscribers (email, created_at, source)
            VALUES (?, datetime('now'), 'waitlist')
          `).bind(email).run();

          return new Response(JSON.stringify({ 
            success: true, 
            email: email, 
            message: 'Successfully added to waitlist' 
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (err) {
          console.error('[Waitlist API Error]:', err);
          return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }


    // 2. Default: Serve static site assets (HTML, CSS, JS, Images)
    return env.ASSETS.fetch(request);
  }
};
