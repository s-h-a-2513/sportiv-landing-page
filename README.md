# Sportiv landing page

Vite + React + Tailwind marketing site for [sportiv.app](https://sportiv.app) — soft Court Orange neumorphism, Anime.js page motion, and Motion Primitives for nav/dialog/tabs.

## Local preview

```powershell
npm install
npm run dev
```

Production build:

```powershell
npm run build
npm run preview
```

## Deploy (Vercel)

`vercel.json` at the repo root builds and serves `dist` as an SPA.

1. Connect this repo in the [Vercel dashboard](https://vercel.com).
2. Set environment variables (see `.env.example`):

```
VITE_FORMSPREE_WAITLIST_ID=
VITE_FORMSPREE_CONTACT_ID=
```

3. Deploy. Point `sportiv.app` / `www.sportiv.app` at the Vercel project when ready.

If Formspree IDs are unset, waitlist and contact forms use a mailto fallback to support@sportiv.app.
