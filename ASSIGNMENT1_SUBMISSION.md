# Assignment 1: Rapid Prototyping — Submission

**Student:** [Your Name]  
**Project:** BeaverAI — AI-Powered Calendar Web App  
**Live Gallery URL:** https://aipoweredcalendarwebapp.vercel.app/  
**GitHub URL:** https://github.com/JudyZhu45/Aipoweredcalendarwebapp

---

## Q1: What files make up your site and what does each one do?

The project is a React + Vite + TypeScript app styled with Tailwind CSS v4. The landing page iterations are organised inside `src/app/landing/`. Here is what each file does:

### Entry point & routing

| File | Role |
|------|------|
| `index.html` | HTML shell — single `<div id="root">` that Vite mounts React into |
| `src/main.tsx` | Bootstraps React; wraps `<App>` in `<BrowserRouter>` so React Router works |
| `src/app/App.tsx` | Top-level route table: `/` → Iteration28 (homepage), `/iterations` → gallery, `/app/*` → authenticated calendar app |
| `vite.config.ts` | Vite build config — sets the React plugin and resolves path aliases |
| `vercel.json` | SPA fallback — rewrites every URL to `index.html` so client-side routes like `/iterations` don't 404 on Vercel |

### Landing page — shared components

| File | Role |
|------|------|
| `src/app/landing/shared/LandingNav.tsx` | Reusable top navigation bar (logo, Sign In, Get Started CTA) used by most iterations |
| `src/app/landing/shared/LandingFooter.tsx` | Reusable footer with links and copyright, used by all iterations |
| `src/app/landing/shared/SectionDivider.tsx` | Visual banner between iterations in the gallery (shows iteration number, name, and category) |

### Landing page — gallery

| File | Role |
|------|------|
| `src/app/landing/IterationsShowcase.tsx` | The gallery page at `/iterations` — renders all 28 iterations stacked vertically with a sticky sidebar index on desktop and a `<select>` dropdown on mobile; uses `IntersectionObserver` to highlight the active section as the user scrolls |
| `src/app/landing/iterations/index.ts` | Registry — exports the `ITERATIONS` array that maps each number, name, category, and React component together so the gallery and sidebar are driven from one source of truth |

### Landing page — 28 iteration files

All 28 iterations live in `src/app/landing/iterations/`. Each is a completely self-contained React component that renders a full landing page in a different design direction:

| Range | Category | What they explore |
|-------|----------|--------------------|
| Iteration01–05 | Layout & Composition | Centered hero, split 50/50, full-bleed viewport, bento grid, stepped workflow |
| Iteration06–10 | Visual Style | Brand-default warm gold, dark mode, gradient pop, glassmorphism, minimal black & white |
| Iteration11–15 | Content Strategy | Feature showcase, social proof first, demo first, problem-solution, how-it-works |
| Iteration16–20 | Motion & Interaction | Typewriter cycling headline, scroll-reveal via IntersectionObserver, floating particles, hover cards, counting stats |
| Iteration21–25 | Section Experiments | FAQ accordion, pricing table, comparison table, timeline, app-store CTA |
| Iteration26–28 | Combos (bonus) | Best-of combinations: 26 = golden combo, 27 = hover-expand cards, 28 = aligned hover cards (final homepage) |

### Styles

| File | Role |
|------|------|
| `src/styles/theme.css` | Global CSS — Tailwind base import, CSS custom properties (`--primary: #8b6914`, event colours), and layout lock for the calendar app (`overflow: hidden` on html/body). Each landing page overrides this with a `useEffect` that sets `overflow: auto` on mount |

---

## Q2: Describe the pipeline — what happens from git push to the site updating on Vercel?

1. **Local development** — `npm run dev` starts Vite's dev server at `localhost:5173`. Changes to `.tsx` or `.css` files hot-reload instantly in the browser.

2. **Git push** — Running `git push origin main` sends the latest commit to GitHub.

3. **Vercel webhook** — Vercel monitors the repository via a GitHub webhook. Within seconds of the push landing, Vercel triggers a new deployment.

4. **Build on Vercel** — Vercel checks out the repo, reads `package.json`, and runs `npm run build` (which is `vite build`). Vite:
   - Compiles TypeScript → JavaScript
   - Bundles all React components into hashed `.js` chunks
   - Processes Tailwind CSS → a single minified `.css` file
   - Outputs everything into the `dist/` folder

5. **Environment variables** — Vercel injects the `VITE_*` secrets (AWS Cognito, AppSync) defined in the Vercel dashboard as build-time env vars. Vite bakes them into the bundle at build time (they are public — only non-secret config lives here).

6. **SPA routing fix** — `vercel.json` contains:
   ```json
   { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
   ```
   This tells Vercel's CDN to serve `index.html` for any path (`/iterations`, `/app`, etc.) instead of returning 404. React Router then handles the route on the client.

7. **Deployment & CDN** — Vercel promotes `dist/` to its global edge CDN. The live URL is updated atomically — visitors see the new version with no downtime. Each deployment gets a unique preview URL too, so old versions remain accessible.

**Total time from `git push` to live update: ~30–60 seconds.**

---

## Q3: Justify your final version — after your entire exploration, why did you land on this version (Iteration 28)?

### The exploration arc

I ran 28 iterations across five design dimensions before settling on v28. The journey can be summarised in three phases:

**Phase 1 — Breadth (01–25):** I deliberately explored orthogonal directions — layout, colour, content strategy, motion, and specialised sections — to build vocabulary. The most effective single techniques were: the full-bleed gradient hero (03), the warm brand palette (06), the problem-solution narrative (14), the pricing table (22), and scroll-reveal animation (17).

**Phase 2 — Combo (26):** I combined the four strongest single-direction experiments into one page. The result proved that they were compatible — a rich animated hero, a warm cream page skin, a pain/solution narrative, and clear pricing all coexist without competing.

**Phase 3 — Refinement (27 → 28):** I pushed two specific micro-interactions: hover-expand pricing cards and visual differentiation of the featured tier. Version 27 revealed a real alignment bug — `items-start` on the grid + `scale(1.05)` on the Pro card broke the card tops from lining up. Version 28 fixed this by removing the scale transform and instead differentiating the Pro card with a coloured top border and outline ring. The hover expansion still works via `max-height` transition, which only grows the card downward without affecting its siblings.

### Why v28 is the right answer

| Design decision | Reasoning |
|-----------------|-----------|
| **Animated gradient hero** | Motion attracts attention above the fold without requiring any JavaScript library — it's pure `@keyframes`. The drift speed (8 s) is slow enough to feel ambient, not distracting. |
| **Warm cream `#fdf8ef` body** | Avoids the "yet another blue SaaS" look. The golden-brown brand colour reads as premium and approachable at the same time. |
| **Problem-solution section** | Conversion copy research consistently shows that naming the user's pain before presenting a product increases relevance. Scroll-reveal timing reinforces the left (problem) → right (solution) reading direction. |
| **Hover-expand pricing cards** | Showing the "bonus details" only on hover reduces visual noise at rest while rewarding engaged visitors with more information — a progressive disclosure pattern. |
| **No scale on Pro card** | A scaling card in a `display: grid` context forces `items-start`, which top-aligns cards of different heights and breaks visual rhythm. A border/outline achieves the same "featured" signal without geometry side effects. |
| **`/` shows v28, `/iterations` shows gallery** | The homepage should be the product's best foot forward. The gallery is a meta-view for reviewing the design process — not what a real visitor should land on. Separating the two routes keeps both experiences clean. |

In short: v28 is the version that combines the strongest conversion narrative, the most distinctive visual identity, and the only layout that is geometrically correct across all viewport widths and hover states.
