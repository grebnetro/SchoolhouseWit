/**
 * ============================================================================
 * BUILD SCRIPT: Generate designs/index.html
 * ============================================================================
 * Generates the complete, semantic, accessible, SEO-optimized, pre-rendered
 * designs/index.html page with all 100 concept cards statically rendered
 * for progressive enhancement (works with JS disabled or enabled).
 */

const fs = require('fs');
const path = require('path');
const { DESIGN_CATALOG, DESIGN_CATEGORIES } = require('./designs-data.js');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generatePageHtml() {
  // Render Category Filter Buttons
  const filterChipsHtml = [
    `          <li>
            <button type="button" class="filter-chip is-active" data-category="All" aria-pressed="true">
              All <span class="chip-count">100</span>
            </button>
          </li>`
  ];

  DESIGN_CATEGORIES.forEach((cat) => {
    const count = DESIGN_CATALOG.filter(d => d.category === cat).length;
    filterChipsHtml.push(`          <li>
            <button type="button" class="filter-chip" data-category="${escapeHtml(cat)}" aria-pressed="false">
              ${escapeHtml(cat)} <span class="chip-count">${count}</span>
            </button>
          </li>`);
  });

  // Render Category Groups and Cards
  const categorySectionsHtml = [];

  DESIGN_CATEGORIES.forEach((cat) => {
    const catItems = DESIGN_CATALOG.filter(d => d.category === cat);
    const catSlug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const cardsHtml = catItems.map((item) => {
      const paddedId = String(item.id).padStart(2, '0');
      const placeholderImgSrc = item.image || '/assets/shirt-placeholder.svg';
      const altText = `Artwork placeholder for ${escapeHtml(item.title)} shirt concept`;

      return `            <!-- Concept #${item.id} -->
            <article 
              class="concept-card" 
              id="concept-${item.slug}"
              data-id="${item.id}"
              data-title="${escapeHtml(item.title)}" 
              data-category="${escapeHtml(item.category)}"
            >
              <div class="card-media-slot">
                <span class="concept-id-badge">#${paddedId}</span>
                <img 
                  src="${placeholderImgSrc}" 
                  alt="${altText}" 
                  class="card-placeholder-img"
                  width="400" 
                  height="300"
                  loading="lazy"
                >
                <div class="artwork-status-pill">
                  <span class="status-dot"></span>
                  <span>Artwork coming soon</span>
                </div>
              </div>

              <div class="concept-card-body">
                <span class="concept-category-tag">${escapeHtml(item.category)}</span>
                <h3 class="concept-title">${escapeHtml(item.title)}</h3>
                <div class="concept-status-caption">
                  <span>Pre-Launch Concept</span>
                  <span>Math Drop</span>
                </div>
              </div>
            </article>`;
    }).join('\n');

    categorySectionsHtml.push(`        <!-- Category Group: ${escapeHtml(cat)} -->
        <section class="category-group-section" id="cat-${catSlug}" data-category="${escapeHtml(cat)}">
          <div class="category-header-wrap">
            <h2 class="category-title">
              <span>${escapeHtml(cat)}</span>
              <span class="category-item-count">${catItems.length} ideas</span>
            </h2>
          </div>
          <div class="concepts-grid">
${cardsHtml}
          </div>
        </section>`);
  });

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>Math Pun Shirt Ideas for Teachers | SchoolhouseWit</title>
  <meta name="title" content="Math Pun Shirt Ideas for Teachers | SchoolhouseWit">
  <meta name="description" content="Browse 100 classroom-ready math pun shirt concepts from SchoolhouseWit, organized by arithmetic, algebra, geometry, calculus, statistics, and more.">
  <meta name="author" content="SchoolhouseWit">
  <meta name="theme-color" content="#16202C">
  <link rel="canonical" href="https://schoolhousewit.com/designs/">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://schoolhousewit.com/designs/">
  <meta property="og:title" content="Math Pun Shirt Ideas for Teachers | SchoolhouseWit">
  <meta property="og:description" content="Browse 100 classroom-ready math pun shirt concepts from SchoolhouseWit, organized by arithmetic, algebra, geometry, calculus, statistics, and more.">
  <meta property="og:image" content="/assets/og-image.svg">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="https://schoolhousewit.com/designs/">
  <meta property="twitter:title" content="Math Pun Shirt Ideas for Teachers | SchoolhouseWit">
  <meta property="twitter:description" content="Browse 100 classroom-ready math pun shirt concepts from SchoolhouseWit, organized by arithmetic, algebra, geometry, calculus, statistics, and more.">
  <meta property="twitter:image" content="/assets/og-image.svg">

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">

  <!-- Google Fonts: Editorial Serif (Fraunces) + Modern Geometric Sans (Outfit) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,800;1,9..144,700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">

  <!-- Stylesheets -->
  <link rel="stylesheet" href="/styles/tokens.css">
  <link rel="stylesheet" href="/styles/main.css">
  <link rel="stylesheet" href="/styles/designs.css">

  <!-- Structured Data: CollectionPage -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "The SchoolhouseWit Design Library",
    "description": "100 classroom-ready math puns, grouped by topic. Early design concepts for future SchoolhouseWit drops.",
    "url": "https://schoolhousewit.com/designs/",
    "publisher": {
      "@type": "Organization",
      "name": "SchoolhouseWit",
      "logo": {
        "@type": "ImageObject",
        "url": "https://schoolhousewit.com/assets/logo.png"
      }
    }
  }
  </script>
</head>
<body>

  <!-- =========================================================================
       1. HEADER & NAVIGATION
       ========================================================================= -->
  <header class="site-header" id="top">
    <div class="container header-container">
      <a href="/" class="brand-link" aria-label="SchoolhouseWit Home">
        <img src="/assets/logo.png" alt="SchoolhouseWit Wordmark and Schoolhouse Bell Logo" class="brand-logo-img">
      </a>

      <!-- Desktop Navigation -->
      <nav class="site-nav" aria-label="Main Navigation">
        <ul class="nav-list">
          <li><a href="/designs/" class="nav-link" aria-current="page" style="color: var(--color-text-main); font-weight: var(--fw-bold);">Design Library</a></li>
          <li><a href="/#how-it-works" class="nav-link">How it works</a></li>
          <li><a href="/#featured" class="nav-link">Featured Tee</a></li>
          <li><a href="/#pricing" class="nav-link">Pricing</a></li>
          <li><a href="/#faq" class="nav-link">FAQ</a></li>
        </ul>
      </nav>

      <!-- Header Action -->
      <div class="header-cta">
        <a href="#waitlist" class="btn btn-accent btn-sm">Join the waitlist</a>
        <button class="mobile-nav-toggle" id="mobileNavToggle" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="mobileNavDrawer">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>

    <!-- Mobile Navigation Drawer -->
    <div class="mobile-nav-drawer" id="mobileNavDrawer">
      <ul class="mobile-nav-list">
        <li><a href="/designs/" class="nav-link" aria-current="page" style="font-weight: var(--fw-bold);">Design Library</a></li>
        <li><a href="/#how-it-works" class="nav-link">How it works</a></li>
        <li><a href="/#featured" class="nav-link">Featured Tee</a></li>
        <li><a href="/#pricing" class="nav-link">Pricing</a></li>
        <li><a href="/#faq" class="nav-link">FAQ</a></li>
        <li><a href="#waitlist" class="btn btn-accent btn-sm" style="width: 100%; margin-top: 8px;">Join the waitlist</a></li>
      </ul>
    </div>
  </header>

  <main id="main-content">
    <!-- =======================================================================
         2. HERO SECTION
         ======================================================================= -->
    <section class="library-hero" id="hero">
      <div class="container library-hero-inner">
        <span class="library-hero-eyebrow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          THE MATH EDITION
        </span>

        <h1 class="library-hero-title">The SchoolhouseWit Design Library</h1>

        <p class="library-hero-intro">
          100 classroom-ready math puns, grouped by topic. These are early design concepts, and the final artwork and shirt colors are still to come.
        </p>
      </div>
    </section>

    <!-- =======================================================================
         3. SEARCH & CATEGORY CONTROLS
         ======================================================================= -->
    <section class="library-controls-section" aria-label="Catalog Filters">
      <div class="container controls-wrapper">
        <!-- Search bar -->
        <div class="search-form-wrap" role="search">
          <div class="search-field-container">
            <label for="designSearch" class="search-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              Search math puns &amp; topics
            </label>
            <div class="search-input-group">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input 
                type="search" 
                id="designSearch" 
                name="q" 
                class="search-input" 
                placeholder="Search by pun title, topic, or keyword (e.g. geometry, prime, kindness)..."
                autocomplete="off"
                spellcheck="false"
              >
              <button type="button" class="search-clear-btn" id="searchClearBtn" aria-label="Clear search input">
                &times;
              </button>
            </div>
          </div>
        </div>

        <!-- Category filter chips -->
        <div class="filters-scroll-wrap" role="region" aria-label="Category filters">
          <ul class="category-chips-list">
${filterChipsHtml.join('\n')}
          </ul>
        </div>
      </div>
    </section>

    <!-- =======================================================================
         4. GALLERY & RESULTS
         ======================================================================= -->
    <div class="container">
      <div class="results-meta-bar">
        <div class="results-count-text" id="resultsCount" aria-live="polite">
          Showing <span class="results-count-number" id="resultsCountNumber">100</span> ideas
          <span class="active-filter-indicator" id="activeFilterIndicator"></span>
        </div>
        <button type="button" class="reset-filters-link" id="resetFiltersBtn">Reset filters</button>
      </div>
    </div>

    <section class="section library-gallery-section" id="gallery" aria-label="Math Concepts Gallery">
      <div class="container" id="galleryContainer">

        <!-- Zero-Results Empty State -->
        <div class="library-empty-state" id="libraryEmptyState" role="status" aria-live="polite">
          <div class="empty-state-icon" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
          </div>
          <h2 class="empty-state-title">No math puns found</h2>
          <p class="empty-state-desc">
            We couldn’t find any concepts matching your current filters <span id="emptyStateQuery"></span>. Try adjusting your search term or selecting another topic.
          </p>
          <button type="button" class="btn btn-primary" id="emptyStateClearBtn">
            Clear all filters
          </button>
        </div>

${categorySectionsHtml.join('\n\n')}

      </div>
    </section>

    <!-- =======================================================================
         5. WAITLIST / EMAIL CAPTURE SECTION
         ======================================================================= -->
    <section class="section waitlist-section" id="waitlist">
      <div class="container waitlist-container">
        <span class="section-badge section-badge-dark">Pre-Launch VIP Access</span>
        <h2 class="section-title" style="color: #FFFFFF;">Want the first drop?</h2>
        <p class="section-description" style="color: #CBD5E1;">
          Enter your email to claim priority access to our limited-run Math Edition drop, early subscriber pricing, and voting rights on future subjects.
        </p>

        <!-- Waitlist Capture Form (uses shared scripts/main.js handler) -->
        <form class="waitlist-form" id="waitlistForm" novalidate>
          <div class="waitlist-input-group">
            <label for="waitlistEmail" class="sr-only">Email address</label>
            <input 
              type="email" 
              id="waitlistEmail" 
              name="email" 
              class="waitlist-input" 
              placeholder="teacher@school.edu or your personal email" 
              required
              autocomplete="email"
            >
            <button type="submit" class="btn btn-accent btn-lg waitlist-submit-btn" id="waitlistSubmitBtn">
              Claim Your Spot
            </button>
          </div>

          <!-- Accessibility Live Alert Region -->
          <div id="formFeedback" class="form-feedback" aria-live="polite"></div>

          <p class="waitlist-disclaimer">
            🔒 No spam ever. We only email when the first drop is live. Unsubscribe anytime.
          </p>
        </form>
      </div>
    </section>
  </main>

  <!-- =========================================================================
       6. FOOTER
       ========================================================================= -->
  <footer class="site-footer">
    <div class="container footer-inner">
      <div class="footer-brand-wrap">
        <a href="/" aria-label="SchoolhouseWit Home">
          <img src="/assets/logo.png" alt="SchoolhouseWit Logo" class="footer-logo-img">
        </a>
        <p class="footer-prelaunch-note">
          SchoolhouseWit is currently in pre-launch. Shirts are scheduled to begin shipping soon.
        </p>
      </div>

      <nav aria-label="Footer Navigation">
        <ul class="footer-nav">
          <li><a href="/designs/" aria-current="page" style="color: var(--color-text-main); font-weight: var(--fw-semibold);">Design Library</a></li>
          <li><a href="/#how-it-works">How It Works</a></li>
          <li><a href="/#featured">Featured Design</a></li>
          <li><a href="/#pricing">Pricing</a></li>
          <li><a href="/#faq">FAQ</a></li>
          <li><a href="mailto:hello@schoolhousewit.com">Contact</a></li>
        </ul>
      </nav>

      <div class="footer-copy">
        <p>&copy; <span id="currentYear">2026</span> SchoolhouseWit. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <!-- Scripts -->
  <script src="/scripts/designs-data.js"></script>
  <script src="/scripts/design-library.js"></script>
  <script src="/scripts/main.js"></script>
  <script>
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  </script>
</body>
</html>`;

  return fullHtml;
}

// Ensure designs/ directory exists and write file
const targetDir = path.join(__dirname, '..', 'designs');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const outputPath = path.join(targetDir, 'index.html');
fs.writeFileSync(outputPath, generatePageHtml(), 'utf-8');
console.log(`Successfully generated ${outputPath} with all 100 pre-rendered concepts!`);
