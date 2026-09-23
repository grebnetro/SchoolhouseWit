/**
 * ============================================================================
 * SCHOOLHOUSEWIT — DESIGN CATALOG DATA
 * ============================================================================
 * Pre-launch collection of 100 classroom-ready math-pun shirt concepts.
 * Organized across 10 categories.
 *
 * Each design entry schema:
 * {
 *   id: number (1-100),
 *   slug: string (unique URL-safe slug),
 *   title: string (exact title),
 *   category: string (one of the 10 exact categories),
 *   image: string | null (null for placeholder, path when real asset exists),
 *   status: "concept"
 * }
 */

const DESIGN_CATEGORIES = [
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

const DESIGN_CATALOG = [
  // 1. Arithmetic & fractions (1-10)
  { id: 1, slug: "count-on-me", title: "Count on Me", category: "Arithmetic & fractions", image: null, status: "concept" },
  { id: 2, slug: "sum-kind-of-wonderful", title: "Sum Kind of Wonderful", category: "Arithmetic & fractions", image: null, status: "concept" },
  { id: 3, slug: "addition-is-my-plus-one", title: "Addition Is My Plus-One", category: "Arithmetic & fractions", image: null, status: "concept" },
  { id: 4, slug: "divide-and-conquer-the-day", title: "Divide and Conquer the Day", category: "Arithmetic & fractions", image: null, status: "concept" },
  { id: 5, slug: "multiply-the-good", title: "Multiply the Good", category: "Arithmetic & fractions", image: null, status: "concept" },
  { id: 6, slug: "less-drama-more-decimal", title: "Less Drama, More Decimal", category: "Arithmetic & fractions", image: null, status: "concept" },
  { id: 7, slug: "remainder-of-the-day-be-kind", title: "Remainder of the Day: Be Kind", category: "Arithmetic & fractions", image: null, status: "concept" },
  { id: 8, slug: "operation-positive", title: "Operation: Positive", category: "Arithmetic & fractions", image: null, status: "concept" },
  { id: 9, slug: "make-it-count", title: "Make It Count", category: "Arithmetic & fractions", image: null, status: "concept" },
  { id: 10, slug: "fractionally-fabulous", title: "Fractionally Fabulous", category: "Arithmetic & fractions", image: null, status: "concept" },

  // 2. Algebra (11-20)
  { id: 11, slug: "find-your-why", title: "Find Your Why", category: "Algebra", image: null, status: "concept" },
  { id: 12, slug: "x-marks-the-solution", title: "X Marks the Solution", category: "Algebra", image: null, status: "concept" },
  { id: 13, slug: "keep-it-on-the-same-side", title: "Keep It on the Same Side", category: "Algebra", image: null, status: "concept" },
  { id: 14, slug: "variable-by-nature", title: "Variable by Nature", category: "Algebra", image: null, status: "concept" },
  { id: 15, slug: "solve-for-awesome", title: "Solve for Awesome", category: "Algebra", image: null, status: "concept" },
  { id: 16, slug: "life-has-many-variables", title: "Life Has Many Variables", category: "Algebra", image: null, status: "concept" },
  { id: 17, slug: "functioning-beautifully", title: "Functioning Beautifully", category: "Algebra", image: null, status: "concept" },
  { id: 18, slug: "stay-balanced", title: "Stay Balanced", category: "Algebra", image: null, status: "concept" },
  { id: 19, slug: "express-yourself-algebraically", title: "Express Yourself Algebraically", category: "Algebra", image: null, status: "concept" },
  { id: 20, slug: "why-fear-x-its-just-a-variable", title: "Why Fear X? It's Just a Variable", category: "Algebra", image: null, status: "concept" },

  // 3. Geometry (21-30)
  { id: 21, slug: "acute-teacher", title: "Acute Teacher", category: "Geometry", image: null, status: "concept" },
  { id: 22, slug: "youre-just-my-type-of-angle", title: "You're Just My Type of Angle", category: "Geometry", image: null, status: "concept" },
  { id: 23, slug: "dont-be-obtuse", title: "Don't Be Obtuse", category: "Geometry", image: null, status: "concept" },
  { id: 24, slug: "right-on-the-angle", title: "Right on the Angle", category: "Geometry", image: null, status: "concept" },
  { id: 25, slug: "the-proof-is-in-the-polygon", title: "The Proof Is in the Polygon", category: "Geometry", image: null, status: "concept" },
  { id: 26, slug: "i-have-a-point", title: "I Have a Point", category: "Geometry", image: null, status: "concept" },
  { id: 27, slug: "stay-in-shape", title: "Stay in Shape", category: "Geometry", image: null, status: "concept" },
  { id: 28, slug: "lines-meet-me-halfway", title: "Lines, Meet Me Halfway", category: "Geometry", image: null, status: "concept" },
  { id: 29, slug: "parallel-lines-have-so-much-in-common", title: "Parallel Lines Have So Much in Common", category: "Geometry", image: null, status: "concept" },
  { id: 30, slug: "im-well-rounded", title: "I'm Well-Rounded", category: "Geometry", image: null, status: "concept" },

  // 4. Trigonometry (31-40)
  { id: 31, slug: "sine-of-a-great-day", title: "Sine of a Great Day", category: "Trigonometry", image: null, status: "concept" },
  { id: 32, slug: "cosine-here-often", title: "Cosine Here Often?", category: "Trigonometry", image: null, status: "concept" },
  { id: 33, slug: "just-another-sine-day", title: "Just Another Sine-Day", category: "Trigonometry", image: null, status: "concept" },
  { id: 34, slug: "tan-lines-are-part-of-the-equation", title: "Tan Lines Are Part of the Equation", category: "Trigonometry", image: null, status: "concept" },
  { id: 35, slug: "sine-me-up", title: "Sine Me Up", category: "Trigonometry", image: null, status: "concept" },
  { id: 36, slug: "good-vibes-great-sines", title: "Good Vibes, Great Sines", category: "Trigonometry", image: null, status: "concept" },
  { id: 37, slug: "finding-my-angle", title: "Finding My Angle", category: "Trigonometry", image: null, status: "concept" },
  { id: 38, slug: "secant-to-none", title: "Secant to None", category: "Trigonometry", image: null, status: "concept" },
  { id: 39, slug: "trigonometry-has-its-ups-and-downs", title: "Trigonometry Has Its Ups and Downs", category: "Trigonometry", image: null, status: "concept" },
  { id: 40, slug: "ive-got-rhythm-and-sine", title: "I've Got Rhythm and Sine", category: "Trigonometry", image: null, status: "concept" },

  // 5. Calculus (41-50)
  { id: 41, slug: "limitless-potential", title: "Limitless Potential", category: "Calculus", image: null, status: "concept" },
  { id: 42, slug: "derivative-i-prefer-original", title: "Derivative? I Prefer Original", category: "Calculus", image: null, status: "concept" },
  { id: 43, slug: "integrate-kindness", title: "Integrate Kindness", category: "Calculus", image: null, status: "concept" },
  { id: 44, slug: "change-is-constant", title: "Change Is Constant", category: "Calculus", image: null, status: "concept" },
  { id: 45, slug: "approach-greatness", title: "Approach Greatness", category: "Calculus", image: null, status: "concept" },
  { id: 46, slug: "area-under-construction", title: "Area Under Construction", category: "Calculus", image: null, status: "concept" },
  { id: 47, slug: "born-to-differentiate", title: "Born to Differentiate", category: "Calculus", image: null, status: "concept" },
  { id: 48, slug: "find-your-inflection-point", title: "Find Your Inflection Point", category: "Calculus", image: null, status: "concept" },
  { id: 49, slug: "no-limits-just-possibilities", title: "No Limits, Just Possibilities", category: "Calculus", image: null, status: "concept" },
  { id: 50, slug: "calculus-its-about-time", title: "Calculus: It's About Time", category: "Calculus", image: null, status: "concept" },

  // 6. Statistics & probability (51-60)
  { id: 51, slug: "above-average", title: "Above Average", category: "Statistics & probability", image: null, status: "concept" },
  { id: 52, slug: "statistically-significant", title: "Statistically Significant", category: "Statistics & probability", image: null, status: "concept" },
  { id: 53, slug: "mean-what-you-say", title: "Mean What You Say", category: "Statistics & probability", image: null, status: "concept" },
  { id: 54, slug: "mode-math", title: "Mode: Math", category: "Statistics & probability", image: null, status: "concept" },
  { id: 55, slug: "normal-is-overrated", title: "Normal Is Overrated", category: "Statistics & probability", image: null, status: "concept" },
  { id: 56, slug: "data-has-a-story", title: "Data Has a Story", category: "Statistics & probability", image: null, status: "concept" },
  { id: 57, slug: "plot-twist-check-the-data", title: "Plot Twist: Check the Data", category: "Statistics & probability", image: null, status: "concept" },
  { id: 58, slug: "spread-good-vibes", title: "Spread Good Vibes", category: "Statistics & probability", image: null, status: "concept" },
  { id: 59, slug: "confidence-level-100", title: "Confidence Level: 100%", category: "Statistics & probability", image: null, status: "concept" },
  { id: 60, slug: "outlier-and-proud", title: "Outlier and Proud", category: "Statistics & probability", image: null, status: "concept" },

  // 7. Numbers & number theory (61-70)
  { id: 61, slug: "prime-time-teacher", title: "Prime Time Teacher", category: "Numbers & number theory", image: null, status: "concept" },
  { id: 62, slug: "oddly-even", title: "Oddly Even", category: "Numbers & number theory", image: null, status: "concept" },
  { id: 63, slug: "im-in-my-prime", title: "I'm in My Prime", category: "Numbers & number theory", image: null, status: "concept" },
  { id: 64, slug: "real-rational-remarkable", title: "Real, Rational, Remarkable", category: "Numbers & number theory", image: null, status: "concept" },
  { id: 65, slug: "natural-number-enthusiast", title: "Natural Number Enthusiast", category: "Numbers & number theory", image: null, status: "concept" },
  { id: 66, slug: "rooting-for-the-irrationals", title: "Rooting for the Irrationals", category: "Numbers & number theory", image: null, status: "concept" },
  { id: 67, slug: "a-whole-lot-of-numbers", title: "A Whole Lot of Numbers", category: "Numbers & number theory", image: null, status: "concept" },
  { id: 68, slug: "count-me-among-the-integers", title: "Count Me Among the Integers", category: "Numbers & number theory", image: null, status: "concept" },
  { id: 69, slug: "perfectly-imperfect-number", title: "Perfectly Imperfect Number", category: "Numbers & number theory", image: null, status: "concept" },
  { id: 70, slug: "zero-is-my-hero", title: "Zero Is My Hero", category: "Numbers & number theory", image: null, status: "concept" },

  // 8. Graphs & coordinates (71-80)
  { id: 71, slug: "plot-your-own-course", title: "Plot Your Own Course", category: "Graphs & coordinates", image: null, status: "concept" },
  { id: 72, slug: "i-have-my-coordinates-together", title: "I Have My Coordinates Together", category: "Graphs & coordinates", image: null, status: "concept" },
  { id: 73, slug: "slope-happens", title: "Slope Happens", category: "Graphs & coordinates", image: null, status: "concept" },
  { id: 74, slug: "rise-to-the-occasion", title: "Rise to the Occasion", category: "Graphs & coordinates", image: null, status: "concept" },
  { id: 75, slug: "intercepting-bright-ideas", title: "Intercepting Bright Ideas", category: "Graphs & coordinates", image: null, status: "concept" },
  { id: 76, slug: "stay-on-the-positive-axis", title: "Stay on the Positive Axis", category: "Graphs & coordinates", image: null, status: "concept" },
  { id: 77, slug: "this-is-where-i-draw-the-line", title: "This Is Where I Draw the Line", category: "Graphs & coordinates", image: null, status: "concept" },
  { id: 78, slug: "graph-goals", title: "Graph Goals", category: "Graphs & coordinates", image: null, status: "concept" },
  { id: 79, slug: "on-an-upward-curve", title: "On an Upward Curve", category: "Graphs & coordinates", image: null, status: "concept" },
  { id: 80, slug: "origin-story", title: "Origin Story", category: "Graphs & coordinates", image: null, status: "concept" },

  // 9. Math teacher energy (81-90)
  { id: 81, slug: "math-teachers-have-all-the-problems", title: "Math Teachers Have All the Problems", category: "Math teacher energy", image: null, status: "concept" },
  { id: 82, slug: "no-problem-too-negative", title: "No Problem Too Negative", category: "Math teacher energy", image: null, status: "concept" },
  { id: 83, slug: "ask-me-y", title: "Ask Me Y", category: "Math teacher energy", image: null, status: "concept" },
  { id: 84, slug: "my-class-is-sum-thing-special", title: "My Class Is Sum-thing Special", category: "Math teacher energy", image: null, status: "concept" },
  { id: 85, slug: "powered-by-patterns", title: "Powered by Patterns", category: "Math teacher energy", image: null, status: "concept" },
  { id: 86, slug: "every-day-is-a-math-day", title: "Every Day Is a Math Day", category: "Math teacher energy", image: null, status: "concept" },
  { id: 87, slug: "teach-solve-repeat", title: "Teach, Solve, Repeat", category: "Math teacher energy", image: null, status: "concept" },
  { id: 88, slug: "pencils-down-confidence-up", title: "Pencils Down, Confidence Up", category: "Math teacher energy", image: null, status: "concept" },
  { id: 89, slug: "mistakes-are-data", title: "Mistakes Are Data", category: "Math teacher energy", image: null, status: "concept" },
  { id: 90, slug: "show-your-work-share-your-wonder", title: "Show Your Work, Share Your Wonder", category: "Math teacher energy", image: null, status: "concept" },

  // 10. Cutesy math creatures (91-100)
  { id: 91, slug: "hypote-moose", title: "Hypote-moose", category: "Cutesy math creatures", image: null, status: "concept" },
  { id: 92, slug: "alge-bear", title: "Alge-bear", category: "Cutesy math creatures", image: null, status: "concept" },
  { id: 93, slug: "calcu-later-alligator", title: "Calcu-later, Alligator", category: "Cutesy math creatures", image: null, status: "concept" },
  { id: 94, slug: "pi-thon-powered", title: "Pi-thon Powered", category: "Cutesy math creatures", image: null, status: "concept" },
  { id: 95, slug: "geo-me-tree-hugger", title: "Geo-me-tree Hugger", category: "Cutesy math creatures", image: null, status: "concept" },
  { id: 96, slug: "the-purr-fect-square", title: "The Purr-fect Square", category: "Cutesy math creatures", image: null, status: "concept" },
  { id: 97, slug: "radical-raccoon", title: "Radical Raccoon", category: "Cutesy math creatures", image: null, status: "concept" },
  { id: 98, slug: "sine-o-saur", title: "Sine-o-saur", category: "Cutesy math creatures", image: null, status: "concept" },
  { id: 99, slug: "count-a-pillar", title: "Count-a-pillar", category: "Cutesy math creatures", image: null, status: "concept" },
  { id: 100, slug: "sum-bunny-loves-math", title: "Sum Bunny Loves Math", category: "Cutesy math creatures", image: null, status: "concept" }
];

// Development-time integrity assertion
(function validateCatalog() {
  const isDev = typeof window !== 'undefined'
    ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    : true;

  if (isDev) {
    if (DESIGN_CATALOG.length !== 100) {
      console.error(`[Design Catalog Assertion Failed] Expected 100 items, found ${DESIGN_CATALOG.length}`);
    }

    const ids = new Set();
    const slugs = new Set();

    DESIGN_CATALOG.forEach((item, index) => {
      if (item.id !== index + 1) {
        console.error(`[Design Catalog Assertion Failed] Item ${item.title} has invalid ID ${item.id}, expected ${index + 1}`);
      }
      if (ids.has(item.id)) {
        console.error(`[Design Catalog Assertion Failed] Duplicate ID ${item.id} detected on ${item.title}`);
      }
      ids.add(item.id);

      if (slugs.has(item.slug)) {
        console.error(`[Design Catalog Assertion Failed] Duplicate slug "${item.slug}" on item ID ${item.id}`);
      }
      slugs.add(item.slug);

      if (!DESIGN_CATEGORIES.includes(item.category)) {
        console.error(`[Design Catalog Assertion Failed] Invalid category "${item.category}" on ${item.title}`);
      }
    });
  }
})();

// Export for Node.js test environment and browser window
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DESIGN_CATALOG, DESIGN_CATEGORIES };
}
if (typeof window !== 'undefined') {
  window.DESIGN_CATALOG = DESIGN_CATALOG;
  window.DESIGN_CATEGORIES = DESIGN_CATEGORIES;
}
