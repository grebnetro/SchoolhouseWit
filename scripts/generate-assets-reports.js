/**
 * ============================================================================
 * SCHOOLHOUSEWIT — ASSET REPORTS GENERATOR
 * ============================================================================
 * Generates:
 * 1. design-assets/catalog.csv (for spreadsheet review)
 * 2. design-assets/contact-sheet.html (visual gallery of all approved designs)
 */

const fs = require('fs');
const path = require('path');
const { getCatalog, ROOT_DIR } = require('./catalog-storage.js');

const DESIGN_ASSETS_DIR = path.join(ROOT_DIR, 'design-assets');
const CSV_PATH = path.join(DESIGN_ASSETS_DIR, 'catalog.csv');
const CONTACT_SHEET_PATH = path.join(DESIGN_ASSETS_DIR, 'contact-sheet.html');

function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function generateCsv(catalog) {
  const headers = [
    'id',
    'slug',
    'pun',
    'category',
    'status',
    'approved_version',
    'approved_at',
    'asset_master_png',
    'asset_final_svg',
    'asset_web',
    'asset_web_2x',
    'width',
    'height',
    'sha256_master',
    'sha256_svg',
    'sha256_web',
    'model_or_tool',
    'prompt',
    'notes'
  ];

  const rows = [headers.join(',')];

  catalog.forEach((item) => {
    const row = [
      item.id,
      item.slug,
      item.pun,
      item.category,
      item.status,
      item.approved_version || '',
      item.approved_at || '',
      item.assets?.master_png || '',
      item.assets?.final_svg || '',
      item.assets?.web || '',
      item.assets?.web_2x || '',
      item.dimensions?.width || '',
      item.dimensions?.height || '',
      item.sha256?.master_png || '',
      item.sha256?.final_svg || '',
      item.sha256?.web || '',
      item.model_or_tool || '',
      item.prompt || '',
      item.notes || ''
    ];
    rows.push(row.map(escapeCsv).join(','));
  });

  return rows.join('\n');
}

function generateContactSheetHtml(catalog) {
  const approvedItems = catalog.filter((item) => item.status === 'approved');
  const approvedCount = approvedItems.length;

  const cardsHtml = approvedCount > 0
    ? approvedItems.map((item) => {
        const webImg = item.assets?.web ? `/${item.assets.web}` : '/assets/shirt-placeholder.svg';
        return `
        <article class="contact-card">
          <div class="card-preview">
            <span class="version-badge">v${item.approved_version || 1}</span>
            <img src="${webImg}" alt="${item.pun}" loading="lazy">
          </div>
          <div class="card-info">
            <span class="card-category">${item.category}</span>
            <h3 class="card-title">${item.pun}</h3>
            <p class="card-slug"><code>${item.slug}</code></p>
            <div class="card-meta">
              <span><strong>Approved:</strong> ${item.approved_at ? new Date(item.approved_at).toLocaleDateString() : 'N/A'}</span>
              <span><strong>Dimensions:</strong> ${item.dimensions?.width || 4500} &times; ${item.dimensions?.height || 5400} px</span>
            </div>
            ${item.notes ? `<p class="card-notes">${item.notes}</p>` : ''}
          </div>
        </article>`;
      }).join('\n')
    : `
      <div class="empty-sheet">
        <h2>No approved designs yet</h2>
        <p>Approve candidate graphics using: <code>npm run approve-design -- --slug &lt;slug&gt; --file &lt;path&gt;</code></p>
      </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SchoolhouseWit · Approved Designs Contact Sheet</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Fraunces:wght@700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #FBF9F5;
      --surface: #FFFFFF;
      --text: #1E293B;
      --text-muted: #57687C;
      --border: #E5DFD7;
      --gold: #D97706;
      --dark: #16202C;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Outfit', sans-serif; background-color: var(--bg); color: var(--text); padding: 2rem 1.5rem; }
    .container { max-width: 1200px; margin: 0 auto; }
    header { margin-bottom: 2.5rem; border-bottom: 2px solid var(--border); padding-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem; }
    h1 { font-family: 'Fraunces', serif; font-size: 2.25rem; font-weight: 800; color: var(--dark); }
    .subhead { color: var(--text-muted); margin-top: 0.25rem; font-size: 1.05rem; }
    .header-links a { color: var(--gold); text-decoration: none; font-weight: 600; margin-left: 1.5rem; }
    .header-links a:hover { text-decoration: underline; }
    .stats-bar { display: inline-block; background-color: #FEF3C7; color: #92400E; font-weight: 700; padding: 0.35rem 0.85rem; border-radius: 9999px; font-size: 0.875rem; margin-top: 0.5rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
    .contact-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.04); display: flex; flex-direction: column; }
    .card-preview { position: relative; aspect-ratio: 4/3; background: #16202C; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .card-preview img { width: 100%; height: 100%; object-fit: contain; }
    .version-badge { position: absolute; top: 10px; right: 10px; background: rgba(245, 158, 11, 0.95); color: #16202C; font-weight: 800; font-size: 0.75rem; padding: 2px 8px; border-radius: 6px; }
    .card-info { padding: 1rem; flex-grow: 1; display: flex; flex-direction: column; }
    .card-category { font-size: 0.75rem; text-transform: uppercase; color: var(--gold); font-weight: 700; letter-spacing: 0.05em; }
    .card-title { font-family: 'Fraunces', serif; font-size: 1.15rem; color: var(--dark); margin: 0.25rem 0 0.5rem; }
    .card-slug { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem; }
    .card-meta { font-size: 0.75rem; color: var(--text-muted); border-top: 1px dashed var(--border); padding-top: 0.5rem; display: flex; flex-direction: column; gap: 4px; }
    .card-notes { font-size: 0.8rem; background: #F3EFEA; padding: 6px 10px; border-radius: 6px; margin-top: 0.75rem; color: #475569; font-style: italic; }
    .empty-sheet { grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: var(--surface); border: 2px dashed var(--border); border-radius: 16px; }
    .empty-sheet h2 { font-family: 'Fraunces', serif; font-size: 1.75rem; margin-bottom: 0.5rem; }
    .empty-sheet p { color: var(--text-muted); }
    code { background: #E2E8F0; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.85em; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>Approved Designs Contact Sheet</h1>
        <p class="subhead">SchoolhouseWit master drop artwork inventory</p>
        <div class="stats-bar">${approvedCount} of 100 designs approved</div>
      </div>
      <div class="header-links">
        <a href="catalog.csv" download>Download Catalog CSV</a>
        <a href="/designs/" target="_blank">View Live Design Library &rarr;</a>
      </div>
    </header>

    <main class="grid">
      ${cardsHtml}
    </main>
  </div>
</body>
</html>`;
}

function generateReports() {
  fs.mkdirSync(DESIGN_ASSETS_DIR, { recursive: true });
  const catalog = getCatalog();

  const csvContent = generateCsv(catalog);
  fs.writeFileSync(CSV_PATH, csvContent, 'utf-8');

  const htmlContent = generateContactSheetHtml(catalog);
  fs.writeFileSync(CONTACT_SHEET_PATH, htmlContent, 'utf-8');

  return {
    csvPath: CSV_PATH,
    contactSheetPath: CONTACT_SHEET_PATH,
    approvedCount: catalog.filter((c) => c.status === 'approved').length
  };
}

module.exports = { generateReports };

if (require.main === module) {
  const result = generateReports();
  console.log(`Generated: ${result.csvPath}`);
  console.log(`Generated: ${result.contactSheetPath}`);
}
