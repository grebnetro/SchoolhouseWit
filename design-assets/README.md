# SchoolhouseWit — Design Assets & Approval System

This directory manages the artwork lifecycle for SchoolhouseWit math-pun shirts, from candidate generation to master print archive and web publishing.

---

## 📁 Directory Structure

```
design-assets/
├── work/                      # Raw generator candidates, upscales, and working drafts (.gitignored)
│   └── <slug>/                # Candidate files (e.g. draft-1.png, upscale-2.png)
│
├── approved/                  # Permanent, immutable approved masters by version
│   └── <slug>/
│       └── v<N>/              # e.g., v1, v2 (never overwritten)
│           ├── original.png   # The approved candidate graphic (as generated)
│           ├── final.svg      # Composed SVG with catalog pun text embedded
│           ├── print_master.png # 4500 x 5400 px, 300 DPI, sRGB, binary alpha master
│           └── meta.json      # Complete approval metadata & SHA-256 hashes
│
├── catalog.csv                # Regenerated CSV export of all 100 designs
└── contact-sheet.html         # Visual contact sheet of all approved designs

public/
└── designs/                   # Approved web exports read by the website
    ├── <slug>.webp            # Standard display (600px width)
    └── <slug>@2x.webp         # Retina / high-DPI display (1200px width)
```

---

## ⚡ The Approval Command

Every approved candidate **must** go through the approval CLI to ensure strict print specifications, character-for-character catalog text equality, and zero broken assets.

```bash
npm run approve-design -- --slug <slug> --file <path-to-candidate> [--notes "..."] [--prompt "..."] [--model "..."]
```

### Example
```bash
npm run approve-design -- --slug count-on-me --file design-assets/work/count-on-me/draft1.png --notes "Approved inaugural math drop art"
```

### What the Command Does Automatically
1. **Validation**: Checks that the slug exists in the catalog and candidate decodes as a valid image.
2. **Non-Destructive Versioning**: Automatically detects existing versions on disk and creates `v<N+1>` (never overwrites previous versions).
3. **SVG Composition**: Embeds the graphic and renders the pun text as real SVG text copied character-for-character from `catalog.pun` using the brand's shirt typography. Heuristically warns if candidate has baked-in text.
4. **Print Master Rendering**: Generates `print_master.png` at:
   - Exactly **4500 x 5400 px**
   - **300 DPI** density metadata
   - **sRGB** color space
   - **Real alpha channel** with **0 semi-transparent pixels** (binary alpha threshold for clean DTG/screen printing)
   - **100% transparent corners** with no leftover key colors
5. **Atomic Staging**: Writes all assets to a temporary folder (`.tmp_v<N>`) and renames in a single atomic filesystem operation only after all verification passes.
6. **Web Publishing**: Exports `<slug>.webp` and `<slug>@2x.webp` to `public/designs/`.
7. **Catalog & Reports**: Updates the single source of truth in `scripts/designs-data.js`, regenerates `design-assets/catalog.csv`, and updates `design-assets/contact-sheet.html`.

---

## 🗄️ Supabase Migration Path

All catalog updates and file operations are routed through a single adapter module:
👉 **[`scripts/catalog-storage.js`](file:///scripts/catalog-storage.js)**

### Mapping to Supabase Schema
The catalog records in `scripts/designs-data.js` map 1:1 to a future Supabase `designs` table:

| Catalog Field | Supabase Column Type | Description |
| :--- | :--- | :--- |
| `id` | `INTEGER PRIMARY KEY` | 1 through 100 |
| `slug` | `TEXT UNIQUE NOT NULL` | URL-safe slug |
| `pun` | `TEXT NOT NULL` | Exact pun copy |
| `category` | `TEXT NOT NULL` | One of 10 exact categories |
| `status` | `TEXT NOT NULL` | `'idea'`, `'generating'`, `'in_review'`, `'approved'`, `'retired'` |
| `approved_version` | `INTEGER` | Current active approved version number |
| `approved_at` | `TIMESTAMPTZ` | Timestamp of approval |
| `assets` | `JSONB` | `{ master_png, final_svg, web, web_2x }` |
| `sha256` | `JSONB` | File hashes for data integrity verification |
| `dimensions` | `JSONB` | `{ width: 4500, height: 5400 }` |
| `model_or_tool` | `TEXT` | Model used (e.g. FLUX, Midjourney) |
| `prompt` | `TEXT` | Generation prompt |
| `notes` | `TEXT` | Reviewer notes |

### Storage Bucket
Files in `design-assets/approved/<slug>/v<N>/` map directly to a Supabase Storage bucket:
`designs/<slug>/v<N>/[original.png, final.svg, print_master.png, meta.json]`

To migrate, simply implement the Supabase client inside `scripts/catalog-storage.js`. Neither the approval CLI nor the website requires any architectural refactoring.
