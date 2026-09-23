/**
 * ============================================================================
 * TEST SUITE: Client-Side Interactive Filtering & Search Tests
 * ============================================================================
 * Simulates user interactions in the DOM without external dependencies.
 */

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('path');
const { DESIGN_CATALOG, DESIGN_CATEGORIES } = require('./designs-data.js');

console.log('Testing Design Library Interactive Search & Filtering Logic...\n');

// Build minimal DOM element simulation
class MockClassList {
  constructor() { this.classes = new Set(); }
  add(c) { this.classes.add(c); }
  remove(c) { this.classes.delete(c); }
  toggle(c, force) {
    if (force !== undefined) {
      if (force) this.classes.add(c); else this.classes.delete(c);
      return force;
    }
    if (this.classes.has(c)) { this.classes.delete(c); return false; }
    this.classes.add(c); return true;
  }
  contains(c) { return this.classes.has(c); }
}

class MockElement {
  constructor(tag, attrs = {}) {
    this.tagName = tag.toUpperCase();
    this.attrs = { ...attrs };
    this.classList = new MockClassList();
    this.style = {};
    this.listeners = {};
    this.children = [];
    this.value = '';
    this._textContent = '';
  }
  get textContent() { return this._textContent; }
  set textContent(val) { this._textContent = String(val); }
  focus() {}
  getAttribute(name) { return this.attrs[name] !== undefined ? this.attrs[name] : null; }
  setAttribute(name, val) { this.attrs[name] = String(val); }
  removeAttribute(name) { delete this.attrs[name]; }
  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }
  dispatch(event, eventObj = {}) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(fn => fn({ ...eventObj, target: this }));
    }
  }
  querySelectorAll(sel) {
    const results = [];
    function search(node) {
      for (const child of node.children) {
        if (child.matches(sel)) results.push(child);
        search(child);
      }
    }
    search(this);
    return results;
  }
  matches(sel) {
    if (sel.startsWith('.')) return this.classList.contains(sel.slice(1));
    if (sel.startsWith('#')) return this.attrs.id === sel.slice(1);
    return this.tagName.toLowerCase() === sel.toLowerCase();
  }
}

// Build page representation matching designs/index.html
function buildMockDOM(urlSearch = '') {
  const elementsById = {};
  const allElements = [];

  function register(el) {
    if (el.attrs.id) elementsById[el.attrs.id] = el;
    allElements.push(el);
    return el;
  }

  const searchInput = register(new MockElement('input', { id: 'designSearch', type: 'search' }));
  const searchClearBtn = register(new MockElement('button', { id: 'searchClearBtn' }));
  const resultsCountEl = register(new MockElement('span', { id: 'resultsCountNumber' }));
  const activeFilterTextEl = register(new MockElement('span', { id: 'activeFilterIndicator' }));
  const resetFiltersBtn = register(new MockElement('button', { id: 'resetFiltersBtn' }));
  const emptyStateEl = register(new MockElement('div', { id: 'libraryEmptyState' }));
  const emptyStateQueryText = register(new MockElement('span', { id: 'emptyStateQuery' }));
  const emptyStateClearBtn = register(new MockElement('button', { id: 'emptyStateClearBtn' }));

  const filterChips = [];
  const chipAll = register(new MockElement('button', { class: 'filter-chip', 'data-category': 'All', 'aria-pressed': 'true' }));
  chipAll.classList.add('filter-chip');
  chipAll.classList.add('is-active');
  filterChips.push(chipAll);

  DESIGN_CATEGORIES.forEach(cat => {
    const chip = register(new MockElement('button', { class: 'filter-chip', 'data-category': cat, 'aria-pressed': 'false' }));
    chip.classList.add('filter-chip');
    filterChips.push(chip);
  });

  const categorySections = [];
  const cards = [];

  DESIGN_CATEGORIES.forEach(cat => {
    const section = register(new MockElement('section', { class: 'category-group-section', 'data-category': cat }));
    section.classList.add('category-group-section');

    const catItems = DESIGN_CATALOG.filter(d => d.category === cat);
    catItems.forEach(item => {
      const card = register(new MockElement('article', {
        class: 'concept-card',
        id: `concept-${item.slug}`,
        'data-id': String(item.id),
        'data-title': item.title,
        'data-category': item.category
      }));
      card.classList.add('concept-card');
      section.children.push(card);
      cards.push(card);
    });

    categorySections.push(section);
  });

  // Mock global document & window
  const mockDocument = {
    addEventListener: (evt, fn) => { if (evt === 'DOMContentLoaded') fn(); },
    getElementById: (id) => elementsById[id] || null,
    querySelectorAll: (sel) => {
      if (sel === '.filter-chip') return filterChips;
      if (sel === '.category-group-section') return categorySections;
      if (sel === '.concept-card') return cards;
      return [];
    }
  };

  const historyStack = [];
  const mockWindow = {
    location: {
      search: urlSearch,
      pathname: '/designs/'
    },
    history: {
      replaceState: (state, title, url) => {
        historyStack.push({ state, url });
        const qIndex = url.indexOf('?');
        mockWindow.location.search = qIndex >= 0 ? url.slice(qIndex) : '';
      }
    },
    addEventListener: () => {}
  };

  return {
    mockDocument,
    mockWindow,
    elements: {
      searchInput,
      searchClearBtn,
      resultsCountEl,
      filterChips,
      emptyStateEl,
      emptyStateClearBtn,
      resetFiltersBtn,
      categorySections,
      cards
    }
  };
}

// Helper to count visible cards
function getVisibleCards(cards) {
  return cards.filter(c => c.style.display !== 'none');
}

// Run interaction tests
function runInteractiveTests() {
  const code = fs.readFileSync(path.join(__dirname, 'design-library.js'), 'utf-8');

  // Test 1: Default initial state (All 100 cards)
  {
    const { mockDocument, mockWindow, elements } = buildMockDOM();
    const sandbox = new Function('document', 'window', code);
    sandbox(mockDocument, mockWindow);

    assert.strictEqual(getVisibleCards(elements.cards).length, 100, 'Initial state must show 100 cards');
    assert.strictEqual(elements.resultsCountEl.textContent, '100', 'Initial counter must display 100');
    console.log('✓ Initial state displays all 100 cards');
  }

  // Test 2: Search queries: geometry, prime, kindness, moose
  {
    const { mockDocument, mockWindow, elements } = buildMockDOM();
    const sandbox = new Function('document', 'window', code);
    sandbox(mockDocument, mockWindow);

    // Query 2a: "geometry"
    elements.searchInput.value = 'geometry';
    elements.searchInput.dispatch('input');
    const geoCards = getVisibleCards(elements.cards);
    assert(geoCards.length >= 10, 'Expected at least 10 cards for geometry');
    assert(geoCards.every(c => 
      c.attrs['data-title'].toLowerCase().includes('geometry') || 
      c.attrs['data-category'].toLowerCase().includes('geometry')
    ), 'All visible cards must match "geometry"');
    console.log(`✓ Search "geometry" found ${geoCards.length} cards`);

    // Query 2b: "prime"
    elements.searchInput.value = 'prime';
    elements.searchInput.dispatch('input');
    const primeCards = getVisibleCards(elements.cards);
    assert(primeCards.length >= 2, 'Expected prime cards');
    const primeTitles = primeCards.map(c => c.attrs['data-title']);
    assert(primeTitles.includes('Prime Time Teacher') && primeTitles.includes("I'm in My Prime"));
    console.log(`✓ Search "prime" found: ${primeTitles.join(', ')}`);

    // Query 2c: "kindness"
    elements.searchInput.value = 'kindness';
    elements.searchInput.dispatch('input');
    const kindnessCards = getVisibleCards(elements.cards);
    assert.strictEqual(kindnessCards.length, 1);
    assert.strictEqual(kindnessCards[0].attrs['data-title'], 'Integrate Kindness');
    console.log(`✓ Search "kindness" found: ${kindnessCards[0].attrs['data-title']}`);

    // Query 2d: "moose"
    elements.searchInput.value = 'moose';
    elements.searchInput.dispatch('input');
    const mooseCards = getVisibleCards(elements.cards);
    assert.strictEqual(mooseCards.length, 1);
    assert.strictEqual(mooseCards[0].attrs['data-title'], 'Hypote-moose');
    console.log(`✓ Search "moose" found: ${mooseCards[0].attrs['data-title']}`);

    // Query 2e: Clear search
    elements.searchClearBtn.dispatch('click');
    assert.strictEqual(getVisibleCards(elements.cards).length, 100);
    assert.strictEqual(elements.searchInput.value, '');
    console.log('✓ Search clear button resets query and restores 100 cards');
  }

  // Test 3: Category filtering
  {
    const { mockDocument, mockWindow, elements } = buildMockDOM();
    const sandbox = new Function('document', 'window', code);
    sandbox(mockDocument, mockWindow);

    const trigChip = elements.filterChips.find(c => c.attrs['data-category'] === 'Trigonometry');
    trigChip.dispatch('click');

    const trigCards = getVisibleCards(elements.cards);
    assert.strictEqual(trigCards.length, 10, 'Expected exactly 10 Trigonometry cards');
    assert.strictEqual(elements.resultsCountEl.textContent, '10', 'Result count must be 10');
    assert.strictEqual(trigChip.attrs['aria-pressed'], 'true', 'Active chip must have aria-pressed="true"');
    console.log('✓ Category filter for "Trigonometry" yields exactly 10 cards with active aria-pressed state');
  }

  // Test 4: Combined Category + Search
  {
    const { mockDocument, mockWindow, elements } = buildMockDOM();
    const sandbox = new Function('document', 'window', code);
    sandbox(mockDocument, mockWindow);

    // Filter to Trigonometry
    const trigChip = elements.filterChips.find(c => c.attrs['data-category'] === 'Trigonometry');
    trigChip.dispatch('click');

    // Type "sine"
    elements.searchInput.value = 'sine';
    elements.searchInput.dispatch('input');

    const sineTrigCards = getVisibleCards(elements.cards);
    assert(sineTrigCards.length > 0 && sineTrigCards.length < 10);
    assert(sineTrigCards.every(c => c.attrs['data-category'] === 'Trigonometry' && c.attrs['data-title'].toLowerCase().includes('sine')));
    console.log(`✓ Combined filter (Trigonometry + "sine") found ${sineTrigCards.length} matching cards`);
  }

  // Test 5: Zero-Results State & Clear Filters
  {
    const { mockDocument, mockWindow, elements } = buildMockDOM();
    const sandbox = new Function('document', 'window', code);
    sandbox(mockDocument, mockWindow);

    elements.searchInput.value = 'zzzznotfoundword';
    elements.searchInput.dispatch('input');

    assert.strictEqual(getVisibleCards(elements.cards).length, 0);
    assert.strictEqual(elements.resultsCountEl.textContent, '0');
    assert(elements.emptyStateEl.classList.contains('is-visible'), 'Zero-results empty state must be visible');
    console.log('✓ Zero-results query displays empty state container');

    // Click "Clear all filters" on empty state
    elements.emptyStateClearBtn.dispatch('click');
    assert.strictEqual(getVisibleCards(elements.cards).length, 100);
    assert.strictEqual(elements.searchInput.value, '');
    assert(!elements.emptyStateEl.classList.contains('is-visible'));
    console.log('✓ "Clear all filters" control restores all 100 cards');
  }

  // Test 6: Deep-linking via URL query params
  {
    const { mockDocument, mockWindow, elements } = buildMockDOM('?category=Geometry&q=angle');
    const sandbox = new Function('document', 'window', code);
    sandbox(mockDocument, mockWindow);

    const visible = getVisibleCards(elements.cards);
    assert(visible.length > 0);
    assert(visible.every(c => c.attrs['data-category'] === 'Geometry' && c.attrs['data-title'].toLowerCase().includes('angle')));
    assert.strictEqual(elements.searchInput.value, 'angle');
    console.log(`✓ Deep linking (?category=Geometry&q=angle) initialized UI to ${visible.length} matching cards`);
  }

  console.log('\nAll interactive test scenarios PASSED! ✨\n');
}

runInteractiveTests();
