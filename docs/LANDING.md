# Sportiv landing site

Vite + React + Tailwind marketing site for [sportiv.app](https://sportiv.app) — soft Court Orange **neumorphism**, Anime.js page motion, and Motion Primitives for nav/dialog/tabs.

## Local preview

```powershell
cd c:\Spinder\landing
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

Production build locally:

```powershell
cd c:\Spinder\landing
npm run build
npm run preview
```

## Deploy to Vercel

Repo root [`vercel.json`](../vercel.json) builds `landing/` and serves `landing/dist` as a SPA.

1. Install the [Vercel CLI](https://vercel.com/docs/cli) or connect the GitHub repo in the [Vercel dashboard](https://vercel.com).
2. Set the project **Root Directory** to the repository root (not `landing/`) so `vercel.json` applies.
3. Deploy:

```powershell
cd c:\Spinder
npx vercel --prod
```

Or push to `main` after linking the repo for automatic production deploys.

## Domain: sportiv.app

In the Vercel project → **Settings → Domains**:

1. Add `sportiv.app` and `www.sportiv.app`.
2. At your DNS provider, add the records Vercel shows (usually an `A` record for the apex and a `CNAME` for `www`).
3. Wait for SSL to provision (often a few minutes).

## Formspree waitlist & contact forms

| Form | Where | Env var |
|------|-------|---------|
| Waitlist | Dialog (`WaitlistDialog.tsx`) | `VITE_FORMSPREE_WAITLIST_ID` |
| Contact | `#contact` on home | `VITE_FORMSPREE_CONTACT_ID` |

IDs are read from Vite env (`landing/src/lib/formspree.ts`). Never hardcode Formspree placeholders in the client.

### Setup

1. Create a free account at [formspree.io](https://formspree.io).
2. Create two forms (or one form with different `_subject` values).
3. Copy each form’s ID from the endpoint URL: `https://formspree.io/f/<ID>`.
4. Set in `landing/.env` (local) and Vercel → Environment Variables (production):

```
VITE_FORMSPREE_WAITLIST_ID=<id>
VITE_FORMSPREE_CONTACT_ID=<id>
```

5. Optionally set notification email to `support@sportiv.app` in Formspree’s form settings.

If either ID is unset, that form shows a **mailto fallback** to [support@sportiv.app](mailto:support@sportiv.app) instead of posting to Formspree.

## Brand & neumorphism

Aligned with `lib/core/theme/app_theme.dart` and Tailwind theme in `landing/tailwind.config.js`:

| Token | Hex |
|-------|-----|
| Court Orange | `#FF6B00` |
| Soft | `#FFF4EB` |
| Background (neu) | `#FFFAF6` |
| Text | `#1A1410` / `#6F645C` |

Fonts: **Outfit** + **DM Sans** (self-hosted via `@fontsource-variable/*`, no Google Fonts CDN).

Neumorph utilities in `landing/src/index.css`: `.neu-raised`, `.neu-inset`, `.neu-btn`, `.neu-input`, `.neu-header`, `.neu-chip`, `.neu-tab`.

Logo: `landing/public/assets/sportiv_logo.png`.

## Site map

| Path | Page |
|------|------|
| `/` | Home (Hero → How It Works tabs → About → Contact) |
| `/privacy` | Privacy Policy |

### Home section anchors

| Anchor | Section |
|--------|---------|
| `#how-it-works` | How It Works |
| `#players` | For Players tab |
| `#facilities` | For Facility Owners tab |
| `#about` | About Us |
| `#contact` | Contact Us |

Waitlist signup opens a centered Motion Primitives dialog (custom backdrop), not a page section. Hero has a single Join waitlist CTA (no “See how it works”).

## Animation stack

| Layer | Library | Use |
|-------|---------|-----|
| Page motion | [Anime.js](https://animejs.com/documentation/getting-started/using-with-react) (`createScope`) | Hero stagger, phone float, scroll reveals — `landing/src/hooks/useAnimeScope.ts` |
| Nav hover tabs | Motion Primitives AnimatedBackground | Desktop header |
| Waitlist modal | Motion Primitives Dialog | Custom backdrop, `inset-0 m-auto h-fit` centering |
| How It Works | Motion Primitives TransitionPanel | Players / Facility Owners tabs — `HowItWorksTabs.tsx` |
| Footer / mailto links | [Skiper UI skiper40](https://skiper-ui.com/v1/skiper40) CssLink | Free tier — attribution in footer |

Motion Primitives MCP: [`.cursor/mcp.json`](../.cursor/mcp.json) (`REGISTRY_URL=https://motion-primitives.com/c/registry.json`).

## Rating (post-fix)

Worksheet: [`LANDING_PAGE_RATING.md`](./LANDING_PAGE_RATING.md).

| | Baseline | After score-to-100 pass |
|--|--------:|------------------------:|
| **Total** | **82/100 (B)** | **~95–96/100 (A)** |
| Design | 19 | 23–24 (no hero float chips; WebP phone + soft wash) |
| Copy | 18 | 19–20 (sports · cities · Android proof line) |
| Information | 18 | 19–20 (env forms + mailto fallback; set Formspree for 20) |
| Stack | 9 | 9–10 (lazy dialog/tabs; anime async; self-hosted fonts) |
| Speed | 10 | 13–14 (WebP ~16KB; Lighthouse mobile Perf **92** local preview) |
| Security | 8 | 9–10 (CSP + existing headers in `vercel.json`) |

**Measured (local `vite preview`, mobile Lighthouse):** Performance 92 · FCP ~2.3s · LCP ~3.0s · Speed Index ~2.3s.

**Ceiling to a literal 100:** production LCP ≤2.5s on a CDN edge, real waitlist or social proof (no invented counts), and both `VITE_FORMSPREE_*` IDs set in Vercel. Without Formspree IDs, Information stays ~19/20.

`npm audit` may still flag `react-router` 7.18.2 against an outdated advisory range; GitHub [GHSA-qwww-vcr4-c8h2](https://github.com/advisories/GHSA-qwww-vcr4-c8h2) patches at **≥7.18.2** (RSC-only; this site does not use unstable RSC APIs).
