# Sportiv Landing Page — Design Guide

Complete visual and interaction reference for the Sportiv marketing site (`landing/`). Use this when designing, implementing, or reviewing UI so light/dark soft-UI stays consistent.

**Stack:** Vite · React · TypeScript · Tailwind CSS 3 · CSS custom properties · Anime.js · Motion · next-themes · Formspree React  

**Canonical code:** [`landing/src/index.css`](../landing/src/index.css), [`landing/tailwind.config.js`](../landing/tailwind.config.js)  
**Design source of truth (product UI):** [Sportiv-Web-Owner-App](https://github.com/s-h-a-2513/Sportiv-Web-Owner-App) `app/globals.css` — landing tokens and neu utilities stay in sync with that file.  
**Deploy mirror:** [sportiv-landing-page](https://github.com/s-h-a-2513/sportiv-landing-page)

---

## 1. Brand & product voice

| Attribute | Guidance |
|-----------|----------|
| Product | Pakistan-focused sports matching for **2-player** games — not dating |
| Personality | Energetic, local, clear, respectful |
| Primary CTA | **Field Owner Dashboard** → [owner app](https://sportiv-web-owner-app.vercel.app/) |
| Proof line | Sports · cities · Coming Soon on Android (honest, no fake metrics) |
| Support | `support@sportiv.app` |

**Do**

- Lead with brand (logo + wordmark) at hero level.
- Prefer real product imagery (Discover screenshot) over abstract decoration.
- Keep one primary CTA in the first viewport.

**Don’t**

- Invent download counts, testimonials, or waitlist numbers.
- Overlay floating promo chips/badges on the hero phone.
- Use generic purple/indigo AI gradients or Inter/Roboto as brand type.

---

## 2. Logo & favicon

| Asset | Path | Spec |
|-------|------|------|
| Wordmark mark | `landing/public/assets/sportiv_mark.png` | **512×512**, RGBA, transparent background, circular Court Orange “S/bolt” |
| Legacy full logo | `landing/public/assets/sportiv_logo.png` | Do **not** use in UI (non-square RGB with white bake-in) |
| Favicon | `landing/public/assets/favicon.png` | **64×64**, RGBA, same mark, no letterboxing |
| App screenshot | `app-home.webp` (+ PNG fallback) | Product Discover screen |

**Component:** [`BrandMark`](../landing/src/components/BrandMark.tsx)

| Size | Icon | Wordmark class |
|------|------|----------------|
| `sm` | 28px | `text-lg` |
| `md` | 34px | `text-[1.2rem]` (header) |
| `lg` | 48px | `text-2xl` (hero) |

Rules: always square `width`/`height`, `object-contain`, `aspect-square`. Never stretch a non-square source into a square slot.

---

## 3. Color system

Court Orange is the brand accent. Surfaces share the page base so neumorphism works.

### 3.1 Semantic Tailwind tokens

| Token | Light hex | Usage |
|-------|-----------|--------|
| `court` | `#FF6B00` | Links, active nav, accent |
| `court.dark` | `#E55F00` | Hover / pressed orange |
| `court.soft` | `#FFF4EB` | Soft orange wash (nav hover pill) |
| `ink` | `#1A1410` | Headings / primary text (light) |
| `ink.muted` | `#3D342E` | Body / secondary (light) |
| `wash` | `#FFFAF6` | Page cream (legacy name) |

Prefer CSS vars `--ink` / `--ink-muted` for theme-aware text (they flip in dark mode).

### 3.2 Runtime CSS variables

Defined on `:root` and overridden on `html.dark` in `index.css`.

| Variable | Light | Dark | Role |
|----------|-------|------|------|
| `--neu-bg` | `#FFFAF6` | `#221C18` | Page & surface fill |
| `--neu-bg-soft` | `#FFF4EB` | `#2A231E` | Soft companion |
| `--ink` | `#1A1410` | `#F5EBE3` | Primary text |
| `--ink-muted` | `#3D342E` | `#C9B8AB` | Body / secondary |
| `--neu-light` | `#FFFFFF` | `rgba(255,255,255,0.06)` | Highlight side of dual shadow |
| `--neu-dark-soft` | `rgba(26,20,16,0.16)` | `rgba(0,0,0,0.45)` | Soft shade |
| `--neu-dark` | `rgba(26,20,16,0.22)` | `rgba(0,0,0,0.55)` | Pressed / stronger shade |
| `--neu-orange-glow` | `rgba(255,107,0,0.28)` | `rgba(255,107,0,0.35)` | CTA outer glow |
| `--court` | `#FF6B00` | `#FF6B00` | Brand accent |
| `--court-dark` | `#E55F00` | `#E55F00` | Hover / pressed |
| `--court-soft` | `#FFF4EB` | `rgba(255,107,0,0.18)` | Soft accent wash |
| `--wash-scene` | Warm radial wash on cream | Same idea on charcoal | Atmosphere background |

Tailwind `court` / `ink` / `muted` / `bg` map to these CSS variables (theme-aware).

**CTA gradient (both themes):** `linear-gradient(145deg, #FF7A1A, #FF6B00)` → hover `#FF6B00` → `#E55F00`.

### 3.3 Atmosphere

Page shell uses `.bg-wash-scene` (CSS `--wash-scene`): soft Court Orange radials, not a flat single color. Keep atmosphere subtle so content stays primary.

---

## 4. Typography

| Role | Family | Source | Weight |
|------|--------|--------|--------|
| Display | **Outfit Variable** | `@fontsource-variable/outfit` | Bold (700) for titles / brand |
| Body | **DM Sans Variable** | `@fontsource-variable/dm-sans` | Medium (500) default |

| Style | Class / rule | Notes |
|-------|--------------|--------|
| Hero H1 | `font-display` + `clamp(2.15rem, 4.5vw, 3.1rem)` | Tracking tight, leading ~1.12 |
| Section title | `.section-title` | `clamp(1.65rem, 3.2vw, 2.15rem)`, bold |
| Body | `.body-copy` | ~1.05rem, medium, `--ink-muted` |
| Proof / emphasis | `text-[0.95rem] font-semibold text-ink` | Stronger than body |
| Labels | `text-sm font-semibold text-ink` | Forms |

No Inter / Roboto / system-only branding. Fallback stack may include `system-ui` after brand fonts.

---

## 5. Neumorphism (soft UI)

Surfaces use the **same fill as the page** (`--neu-bg`) plus dual light/dark shadows. Avoid glassmorphism, hard gray borders, or white cards on cream.

### 5.1 Shadow tokens

| Token | Purpose |
|-------|---------|
| `--neu-shadow-out` | Raised panels (large) |
| `--neu-shadow-out-sm` | Header, small raised |
| `--neu-shadow-in` | Inset wells (inputs, toggle track, content wells) |
| `--neu-shadow-pressed` | Active press |
| `--neu-shadow-btn` | Primary CTA (orange glow + light) |
| `--neu-shadow-knob` | Theme toggle knob |

Light mode shadows are intentionally **stronger** than early drafts so soft UI remains readable on cream.

### 5.2 Utility classes

| Class | Use |
|-------|-----|
| `.neu-raised` | Section panels (How It Works, About, Contact, footer) |
| `.neu-raised-sm` | Compact raised controls |
| `.neu-inset` | Recessed wells (forms inputs, content under tabs) |
| `.neu-header` | Sticky pill header bar |
| `.neu-btn` | Primary CTA — owner dashboard link, form submit |
| `.neu-tab` / `.neu-tab-active` | Segmented tabs (active = CTA gradient, same as owner app) |
| `.neu-input` | Text fields (inset, no 1px border) |
| `.neu-chip` | Small raised chips (if needed) |
| `.neu-theme-toggle` / `.neu-theme-knob` | Theme control track / active knob |

**Do not** wrap the hero phone in `.neu-phone` — the device uses dedicated hardware chrome (see §8).

### 5.3 Radius & spacing

| Element | Radius |
|---------|--------|
| Pills / CTAs / header | `rounded-pill` / `rounded-full` (999px) |
| Large panels / dialogs | `rounded-[28px]` |
| Inset content / inputs | `rounded-[20px]` |
| Phone outer / screen | `40px` / `30px` (see phone CSS) |

| Layout | Value |
|--------|--------|
| Content max width | `max-w-content` → **1140px** |
| Horizontal padding | `px-6 md:px-10` |
| Section vertical | Compact: `py-8 md:py-10` (avoid large empty bands) |
| Panel padding | `p-6 md:p-8` |

---

## 6. Components

### 6.1 Header — `SiteHeader`

- Sticky pill `.neu-header` in a **3-column** grid: brand | nav | actions.
- Desktop nav: inset pill + Motion Primitives `AnimatedBackground` hover.
- Actions: **NeumorphicThemeToggle** then **Field Owner Dashboard** (`neu-btn` → owner app); mobile menu button uses `.neu-raised-sm`.

### 6.2 Theme toggle — `NeumorphicThemeToggle`

- Same control as Owner App `ThemeToggle`: inset pill with **Light / Dark / System** icon buttons.
- Active mode uses `.neu-theme-knob` + Court Orange icon; inactive muted.
- `next-themes` with `attribute="class"`, `defaultTheme="light"`, `enableSystem`.

### 6.3 Primary CTA — Field Owner Dashboard

- Component: `OwnerDashboardLink` (`lib/owner.ts` URL).
- Label: **Field Owner Dashboard**; opens [sportiv-web-owner-app.vercel.app](https://sportiv-web-owner-app.vercel.app/) in a new tab.
- Class: `neu-btn` + pill radius + white semibold text.

### 6.4 How It Works tabs — `HowItWorksTabs`

- Classes: `.neu-tab` + `.neu-tab-active` when selected (owner app tab treatment).
- Content well: `.neu-inset` + Transition Panel.

### 6.5 Forms — `ContactForm`

- Labels: ink semibold; helpers muted.
- Fields: `.neu-input` + `rounded-[20px]` (owner form inputs).
- Submit: `.neu-btn` + `rounded-full`.
- Success/error via `@formspree/react` `ValidationError`.

### 6.6 Footer — `SiteFooter`

- Raised panel, three columns: brand / explore / legal.
- Skiper CssLink attribution required for free Skiper usage.

### 6.7 Dialog

- Centered with `fixed inset-0 m-auto h-fit` (avoid Motion transform breaking centering).
- Surface: `.neu-raised`, `rounded-[28px]`, no hard border (matches owner SoftCard / AuthShell).

---

## 7. Page structure

Single-page home (`/`):

1. **Hero** — BrandMark (lg) · H1 · lede · proof · Field Owner Dashboard · phone mock  
2. **How It Works** — Raised panel · CTA-style tabs · inset content  
3. **About + Contact** — Two-column raised panels on large screens  

Also: `/privacy`.

Anchors: `#how-it-works`, `#players`, `#facilities`, `#about`, `#contact`.

---

## 8. Hero phone mock (presentation)

Product screenshot stays Sportiv Discover (`app-home.webp`). Presentation is premium hardware chrome:

| Class | Role |
|-------|------|
| `.phone-stage` | Soft elliptical Court Orange glow under device |
| `.phone-device` | Dark metal/glass bezel (~11px), outer radius ~40px |
| `.phone-screen` | Clipped screenshot, radius ~30px |
| `.phone-island` | Dynamic Island capsule |
| `.phone-home` | Home indicator bar |

Float motion: Anime.js on `.hero-phone` (no forced tilt). Reduced motion: force opacity 1 on `.hero-phone`.

---

## 9. Motion

| Layer | Tool | Where |
|-------|------|--------|
| Page enter / scroll reveal | Anime.js (`usePageMotion`) | `.hero-anim`, `.hero-phone`, `.anime-reveal` |
| Nav hover | Motion Primitives AnimatedBackground | Header |
| Dialog / tabs | Motion Dialog + TransitionPanel | Waitlist, How It Works |
| Theme knob | CSS transform | Toggle |

**Reduced motion:** disable float loops / transitions; set hero/reveal opacity to 1 in CSS.

---

## 10. Light & dark themes

- Strategy: `class` on `<html>` via next-themes.
- Default: **light**; system preference allowed.
- All soft-UI surfaces must use CSS vars so they re-theme.
- Court Orange CTAs stay orange in both themes.
- `html.dark .bg-court-soft` → translucent orange wash for nav highlight.

---

## 11. Accessibility

- Focus: `outline: 2px solid court`, offset 3px.
- Theme toggle: `role="switch"`, clear `aria-label` / `aria-checked`.
- Images: meaningful `alt` on product shot; decorative logo `alt=""`.
- Forms: required email; visible validation errors.
- Don’t rely on color alone for state (active tab = fill + weight).

---

## 12. Content guidelines

| Area | Pattern |
|------|---------|
| Headline | Benefit + clarity: “Find your next game partner.” |
| Lede | What · where · not dating |
| Proof | Named sports/cities/platform only |
| About | Short line list, sports-first safety |
| Contact | 2 business days response expectation |

---

## 13. Do / don’t checklist

**Do**

- Same `--neu-bg` on page and raised/inset surfaces.
- Square transparent mark + favicon.
- One orange `neu-btn` language for primary actions and active HIW tabs.
- Tight section spacing; avoid large empty bands.

**Don’t**

- White baked into logo/favicon assets.
- Hero float chips / promo stickers on the phone.
- Flat Material cards or purple gradient chrome.
- Fake social proof.
- Putting CTAs in soft inset tracks that hide the orange CTA read.

---

## 14. File map

| Concern | File |
|---------|------|
| Tokens & neu / phone CSS | `landing/src/index.css` |
| Tailwind theme | `landing/tailwind.config.js` |
| Theme provider | `landing/src/components/theme-provider.tsx` |
| Brand | `landing/src/components/BrandMark.tsx` |
| Header / footer | `SiteHeader.tsx`, `SiteFooter.tsx` |
| Home layout | `landing/src/pages/HomePage.tsx` |
| Motion | `landing/src/hooks/useAnimeScope.ts` |
| Forms | `ContactForm.tsx`, `WaitlistDialog.tsx`, `lib/formspree.ts` |

---

## 15. Related docs

- [LANDING.md](./LANDING.md) — setup, Formspree, deploy  
- [LANDING_PAGE_RATING.md](./LANDING_PAGE_RATING.md) — scoring worksheet  
