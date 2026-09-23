/**
 * ============================================================================
 * SCHOOLHOUSEWIT — DESIGN CATALOG DATA
 * ============================================================================
 * Single source of truth for all SchoolhouseWit design concepts and approved drops.
 *
 * Each design entry schema:
 * {
 *   id: number (1-100),
 *   slug: string (unique URL-safe slug),
 *   pun: string (exact text),
 *   category: string (one of the 10 exact categories),
 *   prompt: string | null,
 *   status: "idea" | "generating" | "in_review" | "approved" | "retired",
 *   approved_version: number | null,
 *   approved_at: string | null (ISO 8601),
 *   assets: {
 *     master_png: string | null,
 *     final_svg: string | null,
 *     web: string | null,
 *     web_2x: string | null
 *   },
 *   sha256: {
 *     master_png: string | null,
 *     final_svg: string | null,
 *     web: string | null,
 *     web_2x: string | null
 *   },
 *   dimensions: {
 *     width: number | null,
 *     height: number | null
 *   },
 *   model_or_tool: string | null,
 *   notes: string | null,
 *   // Backwards compatibility aliases
 *   title: string,
 *   image: string | null
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

function createDesignEntry(id, slug, pun, category, overrides = {}) {
  const assets = {
    master_png: null,
    final_svg: null,
    web: null,
    web_2x: null,
    ...(overrides.assets || {})
  };

  const sha256 = {
    master_png: null,
    final_svg: null,
    web: null,
    web_2x: null,
    ...(overrides.sha256 || {})
  };

  const dimensions = {
    width: null,
    height: null,
    ...(overrides.dimensions || {})
  };

  return {
    id,
    slug,
    pun,
    category,
    prompt: overrides.prompt || null,
    status: overrides.status || "idea",
    approved_version: overrides.approved_version || null,
    approved_at: overrides.approved_at || null,
    assets,
    sha256,
    dimensions,
    model_or_tool: overrides.model_or_tool || null,
    notes: overrides.notes || null,
    // Backwards compatibility accessors
    get title() { return this.pun; },
    set title(val) { this.pun = val; },
    get image() { return this.assets.web || null; },
    set image(val) { this.assets.web = val; }
  };
}

const RAW_CATALOG_RECORDS = [
  // 1. Arithmetic & fractions (1-10)
  [1, "count-on-me", "Count on Me", "Arithmetic & fractions"],
  [2, "sum-kind-of-wonderful", "Sum Kind of Wonderful", "Arithmetic & fractions"],
  [3, "addition-is-my-plus-one", "Addition Is My Plus-One", "Arithmetic & fractions"],
  [4, "divide-and-conquer-the-day", "Divide and Conquer the Day", "Arithmetic & fractions"],
  [5, "multiply-the-good", "Multiply the Good", "Arithmetic & fractions"],
  [6, "less-drama-more-decimal", "Less Drama, More Decimal", "Arithmetic & fractions"],
  [7, "remainder-of-the-day-be-kind", "Remainder of the Day: Be Kind", "Arithmetic & fractions"],
  [8, "operation-positive", "Operation: Positive", "Arithmetic & fractions"],
  [9, "make-it-count", "Make It Count", "Arithmetic & fractions"],
  [10, "fractionally-fabulous", "Fractionally Fabulous", "Arithmetic & fractions"],

  // 2. Algebra (11-20)
  [11, "find-your-why", "Find Your Why", "Algebra"],
  [12, "x-marks-the-solution", "X Marks the Solution", "Algebra"],
  [13, "keep-it-on-the-same-side", "Keep It on the Same Side", "Algebra"],
  [14, "variable-by-nature", "Variable by Nature", "Algebra"],
  [15, "solve-for-awesome", "Solve for Awesome", "Algebra"],
  [16, "life-has-many-variables", "Life Has Many Variables", "Algebra"],
  [17, "functioning-beautifully", "Functioning Beautifully", "Algebra"],
  [18, "stay-balanced", "Stay Balanced", "Algebra"],
  [19, "express-yourself-algebraically", "Express Yourself Algebraically", "Algebra"],
  [20, "why-fear-x-its-just-a-variable", "Why Fear X? It's Just a Variable", "Algebra"],

  // 3. Geometry (21-30)
  [21, "acute-teacher", "Acute Teacher", "Geometry"],
  [22, "youre-just-my-type-of-angle", "You're Just My Type of Angle", "Geometry"],
  [23, "dont-be-obtuse", "Don't Be Obtuse", "Geometry"],
  [24, "right-on-the-angle", "Right on the Angle", "Geometry"],
  [25, "the-proof-is-in-the-polygon", "The Proof Is in the Polygon", "Geometry"],
  [26, "i-have-a-point", "I Have a Point", "Geometry"],
  [27, "stay-in-shape", "Stay in Shape", "Geometry"],
  [28, "lines-meet-me-halfway", "Lines, Meet Me Halfway", "Geometry"],
  [29, "parallel-lines-have-so-much-in-common", "Parallel Lines Have So Much in Common", "Geometry"],
  [30, "im-well-rounded", "I'm Well-Rounded", "Geometry"],

  // 4. Trigonometry (31-40)
  [31, "sine-of-a-great-day", "Sine of a Great Day", "Trigonometry"],
  [32, "cosine-here-often", "Cosine Here Often?", "Trigonometry"],
  [33, "just-another-sine-day", "Just Another Sine-Day", "Trigonometry"],
  [34, "tan-lines-are-part-of-the-equation", "Tan Lines Are Part of the Equation", "Trigonometry"],
  [35, "sine-me-up", "Sine Me Up", "Trigonometry"],
  [36, "good-vibes-great-sines", "Good Vibes, Great Sines", "Trigonometry"],
  [37, "finding-my-angle", "Finding My Angle", "Trigonometry"],
  [38, "secant-to-none", "Secant to None", "Trigonometry"],
  [39, "trigonometry-has-its-ups-and-downs", "Trigonometry Has Its Ups and Downs", "Trigonometry"],
  [40, "ive-got-rhythm-and-sine", "I've Got Rhythm and Sine", "Trigonometry"],

  // 5. Calculus (41-50)
  [41, "limitless-potential", "Limitless Potential", "Calculus"],
  [42, "derivative-i-prefer-original", "Derivative? I Prefer Original", "Calculus"],
  [43, "integrate-kindness", "Integrate Kindness", "Calculus"],
  [44, "change-is-constant", "Change Is Constant", "Calculus"],
  [45, "approach-greatness", "Approach Greatness", "Calculus"],
  [46, "area-under-construction", "Area Under Construction", "Calculus"],
  [47, "born-to-differentiate", "Born to Differentiate", "Calculus"],
  [48, "find-your-inflection-point", "Find Your Inflection Point", "Calculus"],
  [49, "no-limits-just-possibilities", "No Limits, Just Possibilities", "Calculus"],
  [50, "calculus-its-about-time", "Calculus: It's About Time", "Calculus"],

  // 6. Statistics & probability (51-60)
  [51, "above-average", "Above Average", "Statistics & probability"],
  [52, "statistically-significant", "Statistically Significant", "Statistics & probability"],
  [53, "mean-what-you-say", "Mean What You Say", "Statistics & probability"],
  [54, "mode-math", "Mode: Math", "Statistics & probability"],
  [55, "normal-is-overrated", "Normal Is Overrated", "Statistics & probability"],
  [56, "data-has-a-story", "Data Has a Story", "Statistics & probability"],
  [57, "plot-twist-check-the-data", "Plot Twist: Check the Data", "Statistics & probability"],
  [58, "spread-good-vibes", "Spread Good Vibes", "Statistics & probability"],
  [59, "confidence-level-100", "Confidence Level: 100%", "Statistics & probability"],
  [60, "outlier-and-proud", "Outlier and Proud", "Statistics & probability"],

  // 7. Numbers & number theory (61-70)
  [61, "prime-time-teacher", "Prime Time Teacher", "Numbers & number theory"],
  [62, "oddly-even", "Oddly Even", "Numbers & number theory"],
  [63, "im-in-my-prime", "I'm in My Prime", "Numbers & number theory"],
  [64, "real-rational-remarkable", "Real, Rational, Remarkable", "Numbers & number theory"],
  [65, "natural-number-enthusiast", "Natural Number Enthusiast", "Numbers & number theory"],
  [66, "rooting-for-the-irrationals", "Rooting for the Irrationals", "Numbers & number theory"],
  [67, "a-whole-lot-of-numbers", "A Whole Lot of Numbers", "Numbers & number theory"],
  [68, "count-me-among-the-integers", "Count Me Among the Integers", "Numbers & number theory"],
  [69, "perfectly-imperfect-number", "Perfectly Imperfect Number", "Numbers & number theory"],
  [70, "zero-is-my-hero", "Zero Is My Hero", "Numbers & number theory"],

  // 8. Graphs & coordinates (71-80)
  [71, "plot-your-own-course", "Plot Your Own Course", "Graphs & coordinates"],
  [72, "i-have-my-coordinates-together", "I Have My Coordinates Together", "Graphs & coordinates"],
  [73, "slope-happens", "Slope Happens", "Graphs & coordinates"],
  [74, "rise-to-the-occasion", "Rise to the Occasion", "Graphs & coordinates"],
  [75, "intercepting-bright-ideas", "Intercepting Bright Ideas", "Graphs & coordinates"],
  [76, "stay-on-the-positive-axis", "Stay on the Positive Axis", "Graphs & coordinates"],
  [77, "this-is-where-i-draw-the-line", "This Is Where I Draw the Line", "Graphs & coordinates"],
  [78, "graph-goals", "Graph Goals", "Graphs & coordinates"],
  [79, "on-an-upward-curve", "On an Upward Curve", "Graphs & coordinates"],
  [80, "origin-story", "Origin Story", "Graphs & coordinates"],

  // 9. Math teacher energy (81-90)
  [81, "math-teachers-have-all-the-problems", "Math Teachers Have All the Problems", "Math teacher energy"],
  [82, "no-problem-too-negative", "No Problem Too Negative", "Math teacher energy"],
  [83, "ask-me-y", "Ask Me Y", "Math teacher energy"],
  [84, "my-class-is-sum-thing-special", "My Class Is Sum-thing Special", "Math teacher energy"],
  [85, "powered-by-patterns", "Powered by Patterns", "Math teacher energy"],
  [86, "every-day-is-a-math-day", "Every Day Is a Math Day", "Math teacher energy"],
  [87, "teach-solve-repeat", "Teach, Solve, Repeat", "Math teacher energy"],
  [88, "pencils-down-confidence-up", "Pencils Down, Confidence Up", "Math teacher energy"],
  [89, "mistakes-are-data", "Mistakes Are Data", "Math teacher energy"],
  [90, "show-your-work-share-your-wonder", "Show Your Work, Share Your Wonder", "Math teacher energy"],

  // 10. Cutesy math creatures (91-100)
  [91, "hypote-moose", "Hypote-moose", "Cutesy math creatures"],
  [92, "alge-bear", "Alge-bear", "Cutesy math creatures"],
  [93, "calcu-later-alligator", "Calcu-later, Alligator", "Cutesy math creatures"],
  [94, "pi-thon-powered", "Pi-thon Powered", "Cutesy math creatures"],
  [95, "geo-me-tree-hugger", "Geo-me-tree Hugger", "Cutesy math creatures"],
  [96, "the-purr-fect-square", "The Purr-fect Square", "Cutesy math creatures"],
  [97, "radical-raccoon", "Radical Raccoon", "Cutesy math creatures"],
  [98, "sine-o-saur", "Sine-o-saur", "Cutesy math creatures"],
  [99, "count-a-pillar", "Count-a-pillar", "Cutesy math creatures"],
  [100, "sum-bunny-loves-math", "Sum Bunny Loves Math", "Cutesy math creatures"]
];

// Optional saved approvals overrides map (kept updated by the approval workflow)
const APPROVED_OVERRIDES = {
  "count-on-me": {
    "status": "approved",
    "approved_version": 7,
    "approved_at": "2026-09-23T17:56:21.386Z",
    "assets": {
      "master_png": "design-assets/approved/count-on-me/v7/print_master.png",
      "final_svg": "design-assets/approved/count-on-me/v7/final.svg",
      "web": "public/designs/count-on-me.webp",
      "web_2x": "public/designs/count-on-me@2x.webp"
    },
    "sha256": {
      "master_png": "907f0a7199347887a354ef5a22f3ca2a86fccc36cb6ea88bad17f8501c6cb76b",
      "final_svg": "2216376258fcf7dd60e30d8114f506cbc92d34c2e09c24d7e4b5033d1c80572c",
      "web": "c418aa0477bc450b8502ab4ed0ef26ffed729b593bd64fe4cfe317c7f8a5a5c3",
      "web_2x": "bf08f15ba7a0a8581593b281b849cd205807221e4c500b6e12f830b332073aca"
    },
    "dimensions": {
      "width": 4500,
      "height": 5400
    },
    "model_or_tool": "Midjourney / FLUX",
    "prompt": null,
    "notes": "Approved print finalization: verified transparent background, exact shirt text Count on Me, collegiate outlines, zero semi-transparent pixels, no stray specks"
  },
  "sum-kind-of-wonderful": {
    "status": "approved",
    "approved_version": 2,
    "approved_at": "2026-09-23T18:32:28.979Z",
    "assets": {
      "master_png": "design-assets/approved/sum-kind-of-wonderful/v2/print_master.png",
      "final_svg": "design-assets/approved/sum-kind-of-wonderful/v2/final.svg",
      "web": "public/designs/sum-kind-of-wonderful.webp",
      "web_2x": "public/designs/sum-kind-of-wonderful@2x.webp"
    },
    "sha256": {
      "master_png": "2d6078abea5b3498751e5fc416b1279aaaca0eb1f548b0ed79a3cd7f3555ec7a",
      "final_svg": "a53b05e19b6e48b0280c7fd284c3eac41a63447b62b029c0b58ee3a97b06c4d3",
      "web": "a77b962ea34cf8ec708c4a1757d5e41fc03f02b9cc126cd82d53fa611c2de966",
      "web_2x": "98793dcd7ac42e1ad26712822a3fcd0770bb620ab7eb03221e15ec632c8e25db"
    },
    "dimensions": {
      "width": 4500,
      "height": 5400
    },
    "model_or_tool": "Midjourney / FLUX",
    "prompt": null,
    "notes": "Approved v2: Stacked Sum Kind / of Wonderful lettering, tight clear gap, optically centered composition"
  },
  "addition-is-my-plus-one": {
    "status": "approved",
    "approved_version": 2,
    "approved_at": "2026-09-23T20:11:00.912Z",
    "assets": {
      "master_png": "design-assets/approved/addition-is-my-plus-one/v2/print_master.png",
      "final_svg": "design-assets/approved/addition-is-my-plus-one/v2/final.svg",
      "web": "public/designs/addition-is-my-plus-one.webp",
      "web_2x": "public/designs/addition-is-my-plus-one@2x.webp"
    },
    "sha256": {
      "master_png": "792e8f24f6db7d133f36f6369eabc510a28a21eee643c36a38a030310e49d34a",
      "final_svg": "c3ff7df5dd9b4f00cb24c439efd054bebb87f81fcf4b2d5806fc9f02ea6b6019",
      "web": "363d397339c3d62e7631edd3c520028ffbfc8720aa68c7e22e05ab90c6e37cdf",
      "web_2x": "36060e5602d30d4f16def0ef32e3e6f2e7c632c2cf3ee5c8fa12151bf45bb1da"
    },
    "dimensions": {
      "width": 4500,
      "height": 5400
    },
    "model_or_tool": "Midjourney / FLUX",
    "prompt": null,
    "notes": "Approved v2: Stacked Addition Is / My Plus-One lettering, tight clear gap, optically centered composition"
  }
};

const DESIGN_CATALOG = RAW_CATALOG_RECORDS.map(([id, slug, pun, category]) => {
  return createDesignEntry(id, slug, pun, category, APPROVED_OVERRIDES[slug] || {});
});

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
        console.error(`[Design Catalog Assertion Failed] Item ${item.pun} has invalid ID ${item.id}, expected ${index + 1}`);
      }
      if (ids.has(item.id)) {
        console.error(`[Design Catalog Assertion Failed] Duplicate ID ${item.id} detected on ${item.pun}`);
      }
      ids.add(item.id);

      if (slugs.has(item.slug)) {
        console.error(`[Design Catalog Assertion Failed] Duplicate slug "${item.slug}" on item ID ${item.id}`);
      }
      slugs.add(item.slug);

      if (!DESIGN_CATEGORIES.includes(item.category)) {
        console.error(`[Design Catalog Assertion Failed] Invalid category "${item.category}" on ${item.pun}`);
      }
    });
  }
})();

// Export for Node.js environment and browser window
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DESIGN_CATALOG, DESIGN_CATEGORIES, createDesignEntry };
}
if (typeof window !== 'undefined') {
  window.DESIGN_CATALOG = DESIGN_CATALOG;
  window.DESIGN_CATEGORIES = DESIGN_CATEGORIES;
}
