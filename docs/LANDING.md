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

Uses [`@formspree/react`](https://github.com/formspree/formspree-js/tree/master/packages/formspree-react) (`useForm` + `ValidationError`) — Ajax submit with success/error UI (no full-page redirect).

| Form | Where | Env var | Default ID |
|------|-------|---------|------------|
| Waitlist | Dialog (`WaitlistDialog.tsx`) | `VITE_FORMSPREE_WAITLIST_ID` | `xqeroeoo` |
| Contact | `#contact` (`ContactForm.tsx`) | `VITE_FORMSPREE_CONTACT_ID` | `xqeroeoo` |

Both forms share one Formspree endpoint by default; submissions include a hidden `form` field (`waitlist` | `contact`) and `_subject` so you can tell them apart in the inbox.

### Setup

1. Form already created: `https://formspree.io/f/xqeroeoo`
2. Local: `landing/.env` (gitignored) or copy from `.env.example`
3. Vercel → Environment Variables (Production):

```
VITE_FORMSPREE_WAITLIST_ID=xqeroeoo
VITE_FORMSPREE_CONTACT_ID=xqeroeoo
```

4. Optionally set notification email to `support@sportiv.app` in Formspree form settings.

Redeploy after changing Vercel env so Vite can bake the IDs into the build.

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
