/**
 * ============================================================================
 * SCHOOLHOUSEWIT — DESIGN LIBRARY CLIENT SCRIPT
 * ============================================================================
 * Handles real-time search, category filtering, live result counter,
 * zero-results state, URL synchronization, and accessible keyboard navigation.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', initDesignLibrary);

  function initDesignLibrary() {
    const searchInput = document.getElementById('designSearch');
    const searchClearBtn = document.getElementById('searchClearBtn');
    const filterChips = document.querySelectorAll('.filter-chip');
    const resultCountEl = document.getElementById('resultsCountNumber');
    const activeFilterTextEl = document.getElementById('activeFilterIndicator');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const emptyStateEl = document.getElementById('libraryEmptyState');
    const emptyStateQueryText = document.getElementById('emptyStateQuery');
    const emptyStateClearBtn = document.getElementById('emptyStateClearBtn');
    const categorySections = document.querySelectorAll('.category-group-section');
    const cards = document.querySelectorAll('.concept-card');

    if (!cards.length) return;

    // State
    let currentCategory = 'All';
    let currentQuery = '';

    // Initialize state from URL params
    const initialParams = new URLSearchParams(window.location.search);
    const initialCategoryParam = initialParams.get('category');
    const initialQueryParam = initialParams.get('q');

    if (initialCategoryParam) {
      const matchingChip = Array.from(filterChips).find(
        (chip) => chip.getAttribute('data-category')?.toLowerCase() === initialCategoryParam.toLowerCase()
      );
      if (matchingChip) {
        currentCategory = matchingChip.getAttribute('data-category');
      }
    }

    if (initialQueryParam) {
      currentQuery = initialQueryParam.trim();
      if (searchInput) {
        searchInput.value = currentQuery;
        if (searchClearBtn) searchClearBtn.classList.add('is-active');
      }
    }

    // Attach Event Listeners
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentQuery = e.target.value.trim();
        if (searchClearBtn) {
          searchClearBtn.classList.toggle('is-active', currentQuery.length > 0);
        }
        applyFilters(true);
      });
    }

    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        currentQuery = '';
        searchClearBtn.classList.remove('is-active');
        applyFilters(true);
      });
    }

    filterChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const cat = chip.getAttribute('data-category') || 'All';
        if (currentCategory === cat) return;
        currentCategory = cat;
        applyFilters(true);
      });
    });

    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', resetAllFilters);
    }

    if (emptyStateClearBtn) {
      emptyStateClearBtn.addEventListener('click', resetAllFilters);
    }

    window.addEventListener('popstate', (e) => {
      const state = e.state || {};
      currentCategory = state.category || 'All';
      currentQuery = state.q || '';
      if (searchInput) {
        searchInput.value = currentQuery;
        if (searchClearBtn) searchClearBtn.classList.toggle('is-active', currentQuery.length > 0);
      }
      applyFilters(false);
    });

    // Run initial filter
    applyFilters(false);

    /**
     * Resets both search query and category to defaults
     */
    function resetAllFilters() {
      currentCategory = 'All';
      currentQuery = '';
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      if (searchClearBtn) {
        searchClearBtn.classList.remove('is-active');
      }
      applyFilters(true);
    }

    /**
     * Filters all cards and updates UI, counter, chip states, and URL
     */
    function applyFilters(updateHistory) {
      const normalizedQuery = currentQuery.toLowerCase();
      let totalVisibleCount = 0;

      // 1. Update filter chip pressed states
      filterChips.forEach((chip) => {
        const chipCat = chip.getAttribute('data-category');
        const isActive = chipCat === currentCategory;
        chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        chip.classList.toggle('is-active', isActive);
      });

      // 2. Filter cards within each category section
      categorySections.forEach((section) => {
        const sectionCat = section.getAttribute('data-category');
        const isCategoryMatch = (currentCategory === 'All' || currentCategory === sectionCat);

        if (!isCategoryMatch) {
          section.style.display = 'none';
          section.querySelectorAll('.concept-card').forEach((card) => {
            card.style.display = 'none';
          });
          return;
        }

        const sectionCards = section.querySelectorAll('.concept-card');
        let sectionVisibleCards = 0;

        sectionCards.forEach((card) => {
          const title = (card.getAttribute('data-title') || '').toLowerCase();
          const category = (card.getAttribute('data-category') || '').toLowerCase();
          const id = card.getAttribute('data-id') || '';

          const matchesSearch = !normalizedQuery ||
            title.includes(normalizedQuery) ||
            category.includes(normalizedQuery) ||
            id === normalizedQuery;

          if (matchesSearch) {
            card.style.display = '';
            sectionVisibleCards++;
            totalVisibleCount++;
          } else {
            card.style.display = 'none';
          }
        });

        // Hide entire category section if 0 matching cards in it
        section.style.display = sectionVisibleCards > 0 ? '' : 'none';
      });

      // 3. Update Result Count Text
      if (resultCountEl) {
        resultCountEl.textContent = totalVisibleCount;
      }

      // 4. Update Active Filter Indicator
      if (activeFilterTextEl) {
        let filterSummary = '';
        if (currentCategory !== 'All' && currentQuery) {
          filterSummary = `in "${currentCategory}" matching "${currentQuery}"`;
        } else if (currentCategory !== 'All') {
          filterSummary = `in "${currentCategory}"`;
        } else if (currentQuery) {
          filterSummary = `matching "${currentQuery}"`;
        }
        activeFilterTextEl.textContent = filterSummary;
      }

      // 5. Handle Zero-Results Empty State
      if (emptyStateEl) {
        const hasNoResults = totalVisibleCount === 0;
        emptyStateEl.classList.toggle('is-visible', hasNoResults);
        if (emptyStateQueryText) {
          if (currentQuery && currentCategory !== 'All') {
            emptyStateQueryText.textContent = `for "${currentQuery}" in "${currentCategory}"`;
          } else if (currentQuery) {
            emptyStateQueryText.textContent = `for "${currentQuery}"`;
          } else if (currentCategory !== 'All') {
            emptyStateQueryText.textContent = `in "${currentCategory}"`;
          } else {
            emptyStateQueryText.textContent = '';
          }
        }
      }

      // 6. Update URL without page reload
      if (updateHistory) {
        const params = new URLSearchParams();
        if (currentCategory !== 'All') {
          params.set('category', currentCategory);
        }
        if (currentQuery) {
          params.set('q', currentQuery);
        }

        const newRelativePathQuery = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        window.history.replaceState({ category: currentCategory, q: currentQuery }, '', newRelativePathQuery);
      }
    }
  }
})();
