# SchoolhouseWit — Pre-Launch Landing Page

A responsive, high-converting pre-launch landing page for **SchoolhouseWit**: a monthly subscription delivering clever, classroom-tested pun tees to educators. Launching with an exclusive math-first edition, designed to scale across all school subjects.

Built with lightweight, accessible, zero-dependency vanilla HTML, CSS, and JavaScript.

---

## 🚀 Quick Start (Running Locally)

Because this project is built with static web standards, you don't need any complex build steps or node modules:

### Option A: VS Code / IDE Live Server
Right-click `index.html` and select **"Open with Live Server"**.

### Option B: Python Local Server
```bash
python -m http.server 8000
```
Then visit [http://localhost:8000](http://localhost:8000) in your browser.

### Option C: Node `npx serve`
```bash
npx serve .
```

---

## 🎨 How to Customize Brand Tokens

All colors, fonts, typography scale, spacing, border radii, and shadows are centralized in a single file:
👉 **[`styles/tokens.css`](file:///styles/tokens.css)**

To tweak your brand styling:
1. **Colors**:
   - `--color-bg`: Canvas background color (defaults to warm cream `#FBF9F5`).
   - `--color-text-main`: Blackboard slate for primary text (`#1E293B`).
   - `--color-accent-gold`: No. 2 pencil golden yellow (`#F59E0B`).
   - `--color-accent-red`: Schoolhouse brick / apple red (`#C2410C`).
   - `--color-accent-green`: Chalk green (`#059669`).
2. **Typography**:
   - Change `--font-serif` or `--font-sans` in `styles/tokens.css`.
3. **Spacing & Radii**:
   - Adjust `--container-max-width`, `--radius-md`, or button elevations directly in the `:root` block.

---

## 🖼️ Swapping Placeholder Images & Product Mockups

All graphics live inside the **[`assets/`](file:///assets/)** folder:

| Asset | Current File | Recommended Format | Description |
| :--- | :--- | :--- | :--- |
| **Brand Logo** | `assets/logo.png` | PNG or SVG | Official SchoolhouseWit wordmark & schoolhouse bell icon |
| **Favicon** | `assets/favicon.svg` | SVG or ICO | Browser tab icon |
| **Hero T-Shirt** | `assets/shirt-hero.svg` | SVG or PNG (transparent) | First Drop mockup (*"I'm acute teacher"* pun) |
| **Featured T-Shirt** | `assets/shirt-featured.svg` | SVG or PNG (transparent) | Concept mockup (*"Parallel lines"* pun) |
| **Design Library Placeholder** | `assets/shirt-placeholder.svg` | SVG or PNG | Neutral concept artwork placeholder for `/designs/` cards |
| **Social / OpenGraph** | `assets/og-image.svg` | PNG or SVG (1200x630px) | Preview image for Twitter/Facebook/iMessage sharing |

To replace any image, drop your final file into `assets/` and update the `src=""` attribute in `index.html`.

---

## 📬 Connecting Your Real Email / Waitlist Service

The waitlist capture form is wired to a validated client-side handler in:
👉 **[`scripts/main.js`](file:///scripts/main.js#L125-L165)** (`submitWaitlist()` function)

It currently logs form submissions to the console and transitions the form to an accessible success state. To connect to your provider:

### 1. Buttondown
```javascript
const response = await fetch('https://api.buttondown.email/v1/subscribers', {
  method: 'POST',
  headers: {
    'Authorization': 'Token YOUR_BUTTONDOWN_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ email: email, tags: ['prelaunch-waitlist'] })
});
return { success: response.ok };
```

### 2. ConvertKit / Kit
```javascript
const response = await fetch('https://api.convertkit.com/v3/forms/YOUR_FORM_ID/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ api_key: 'YOUR_PUBLIC_KEY', email: email })
});
return { success: response.ok };
```

### 3. Cloudflare Pages Function / Worker
Create a `functions/api/subscribe.js` in your project:
```javascript
const response = await fetch('/api/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: email })
});
return { success: response.ok };
```

---

## 📝 List of Current Placeholders & Stubs

The following items are intentionally stubbed for pre-launch and should be updated when production assets are ready:
1. **Email Service**: Form runs client-side validation and logs to console. Needs backend endpoint (see above).
2. **Shirt Designs**: Vector placeholder graphics with sample math puns (`assets/shirt-hero.svg` and `assets/shirt-featured.svg`).
3. **Contact Link**: Footer contact link points to `mailto:hello@schoolhousewit.com`.
4. **Social Sharing Image**: `assets/og-image.svg` is an SVG template; export to 1200x630 PNG for maximum compatibility with older social crawlers.

---

## ☁️ Deploying to Cloudflare Pages

1. Push your repository to GitHub (already configured with `origin`).
2. Log into the [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Compute (Workers & Pages)** > **Create application** > **Pages**.
3. Select **Connect to Git** and choose this repository (`SchoolhouseWit`).
4. Framework preset: **None** (Root folder `/`, build command empty).
5. Click **Save and Deploy**.
6. Under **Custom Domains**, connect your Cloudflare domain in 1 click!
