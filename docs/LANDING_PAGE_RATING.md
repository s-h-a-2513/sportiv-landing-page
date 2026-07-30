# Landing Page Rating Formula

A 100-point score for evaluating a landing page across **design**, **copy**, **information**, **technical stack**, **speed**, and **security**.

---

## Score formula

```
Total = Design + Copy + Information + Stack + Speed + Security
      = D(25) + C(20) + I(20) + T(10) + S(15) + Sec(10)
      = 100
```

| Category | Weight | Code |
|----------|-------:|------|
| Design | 25 | D |
| Copy | 20 | C |
| Information conveyed | 20 | I |
| Technical stack | 10 | T |
| Speed / performance | 15 | S |
| Security | 10 | Sec |
| **Total** | **100** | |

**Grade bands**

| Score | Grade | Meaning |
|------:|-------|---------|
| 90–100 | A | Ship-ready; minor polish only |
| 80–89 | B | Strong; a few clear gaps |
| 70–79 | C | Usable; needs focused work |
| 60–69 | D | Weak; redesign or rewrite likely |
| 0–59 | F | Not ready for production |

---

## 1. Design — 25 points

Score how the page looks, feels, and guides attention. Prefer one clear composition over dashboard clutter.

| Criterion | Max | How to score |
|-----------|----:|--------------|
| Visual hierarchy & first viewport | 6 | Brand/product is hero-level; one headline, one support line, one CTA group; no competing stats/promos in the fold |
| Brand identity & atmosphere | 5 | Distinct color system, expressive type (not default Inter/Roboto/system), non-flat background (gradient/image/pattern) that fits the product |
| Imagery & visual anchor | 5 | Real product/place/context imagery; full-bleed hero where appropriate; no decorative-only abstract as the main idea |
| Layout, spacing & motion | 5 | Consistent rhythm; intentional motion (2–3 purposeful cues); no card soup or pill clusters unless interaction needs them |
| Responsiveness & polish | 4 | Desktop + mobile; no overflow, broken images, or uneven alignment |

**Subtotal D = sum of criteria (0–25)**

**Quick deducts:** generic purple-on-white AI look (−3); cream + terracotta serif cliché (−2); hero overlays/badges (−2); inset/side-panel hero when full-bleed is expected (−2).

---

## 2. Copy — 20 points

Score clarity, voice, and persuasion—not word count.

| Criterion | Max | How to score |
|-----------|----:|--------------|
| Headline clarity | 5 | States who it’s for and what it does in one scan |
| Supporting copy | 5 | Short, concrete, benefit-led; no jargon walls |
| CTA language | 4 | Specific action (“Join waitlist”, “Book a court”) vs vague (“Learn more” only) |
| Tone & consistency | 3 | Matches brand; same voice across sections |
| Trust & proof language | 3 | Credible claims; social proof / specifics where claimed |

**Subtotal C = sum of criteria (0–20)**

**Quick deducts:** headline overpowers brand (−2); buzzword stuffing (−2); multiple competing CTAs with unclear primary (−2).

---

## 3. Information conveyed — 20 points

Score whether a first-time visitor can answer: *What is this? Who is it for? Why care? What do I do next?*

| Criterion | Max | How to score |
|-----------|----:|--------------|
| Value proposition | 5 | Problem → solution is obvious without scrolling past fold |
| Audience & use case | 4 | Clear who it’s for (and not for, if relevant) |
| Product understanding | 5 | Features/flows explained enough to decide; no mystery product |
| Next step / conversion path | 4 | Waitlist, signup, download, or contact is obvious and complete |
| Secondary info architecture | 2 | Privacy, contact, legal findable without hunting |

**Subtotal I = sum of criteria (0–20)**

**Quick deducts:** first viewport packed with schedules/stats/metadata (−3); critical facts only below long scroll with no nav anchors (−2).

---

## 4. Technical stack — 10 points

Score whether the implementation choices fit a marketing site: maintainable, deployable, and appropriate—not over-engineered.

| Criterion | Max | How to score |
|-----------|----:|--------------|
| Fit for purpose | 3 | Static/SSR marketing stack (e.g. Vite/Next/Astro) vs heavy app shell for a brochure page |
| Maintainability | 3 | Clear structure, typed or consistent patterns, reusable components |
| Hosting & delivery | 2 | CDN/edge hosting, HTTPS, sensible SPA/SSR routing |
| Dependencies hygiene | 2 | Lean deps; no abandoned/critical-vuln packages left unaddressed |

**Subtotal T = sum of criteria (0–10)**

**Examples (illustrative):** Vite + React + Tailwind on Vercel ≈ strong fit for a single marketing site; full SSR app + unused BaaS client for a static waitlist page ≈ deduct on fit.

---

## 5. Speed / performance — 15 points

Prefer measured signals when available (Lighthouse, PageSpeed, Web Vitals). If unmeasured, score from observable proxies and note “estimate.”

| Criterion | Max | How to score |
|-----------|----:|--------------|
| Largest Contentful Paint (LCP) | 4 | ≤2.5s = 4; ≤4s = 2; >4s = 0–1 |
| Interaction / INP or TBT | 3 | Snappy UI; heavy JS on load deducts |
| Cumulative Layout Shift (CLS) | 3 | Stable layout; reserved image/font space |
| Asset strategy | 3 | Optimized images, modern formats, no huge unoptimized hero |
| Bundle & caching | 2 | Code-split where useful; cache headers / CDN |

**Subtotal S = sum of criteria (0–15)**

**Optional Lighthouse map (mobile Performance score):**

| Lighthouse Performance | Map to S (of 15) |
|-----------------------:|-----------------:|
| 90–100 | 13–15 |
| 75–89 | 10–12 |
| 50–74 | 6–9 |
| <50 | 0–5 |

Use the criterion table when you can; use the Lighthouse map as a cross-check.

---

## 6. Security — 10 points

Score baseline web security for a public marketing site (not a full app audit).

| Criterion | Max | How to score |
|-----------|----:|--------------|
| Transport & cookies | 3 | HTTPS everywhere; secure cookie flags if auth/session exists |
| Headers & XSS baseline | 3 | Sensible CSP/Referrer-Policy/X-Content-Type-Options (or host defaults); no inline secret leakage |
| Forms & third parties | 2 | Form endpoints over HTTPS; no open redirects; third-party scripts minimized/vetted |
| Secrets & config | 2 | No API keys/secrets in client bundle; env separation; dependency vulns addressed |

**Subtotal Sec = sum of criteria (0–10)**

**Hard fails (cap Sec at 3 even if other criteria look fine):** secrets in repo/client; mixed content; forms posting to HTTP.

---

## Scoring worksheet

Copy and fill per review:

```text
Page / URL: ____________________
Date: __________  Reviewer: __________

Design            /25   notes: ____________________
Copy              /20   notes: ____________________
Information       /20   notes: ____________________
Technical stack   /10   notes: ____________________
Speed             /15   notes: ____________________
Security          /10   notes: ____________________
─────────────────────────────────
TOTAL             /100  Grade: __

Measured?  [ ] Lighthouse  [ ] Web Vitals  [ ] Estimate only
Top 3 fixes:
1.
2.
3.
```

---

## Worked example (template)

| Category | Score | Rationale (example) |
|----------|------:|---------------------|
| Design | 20/25 | Strong brand fold; weak mobile spacing (−2); one extra card cluster (−3) |
| Copy | 16/20 | Clear headline; CTA vague on secondary sections (−4) |
| Information | 17/20 | Value clear; privacy linked; feature depth thin (−3) |
| Stack | 8/10 | Vite + Tailwind + CDN; one unused heavy dep (−2) |
| Speed | 11/15 | LCP ~3s; hero PNG not compressed (−4) |
| Security | 8/10 | HTTPS + form HTTPS; no CSP beyond defaults (−2) |
| **Total** | **80/100** | **Grade B** |

---

## How to use

1. Score each criterion independently; don’t let one strong area inflate another.
2. Prefer measurements for Speed and Security headers when possible.
3. Report **Total / 100**, **grade**, and **top 3 fixes** tied to the lowest criteria.
4. Re-score after changes; a 5+ point jump usually means a real improvement, not noise.

---

## Optional weighted variant

If the review is **conversion-focused** (pre-launch waitlist), shift weights:

```
D(20) + C(25) + I(25) + T(5) + S(15) + Sec(10) = 100
```

If the review is **engineering / launch-readiness**:

```
D(20) + C(15) + I(15) + T(15) + S(20) + Sec(15) = 100
```

Always state which weight profile you used when reporting the score.

---

## Sportiv landing — post-fix (2026-07)

After the score-to-100 pass (Formspree env + mailto fallback, proof line, no hero float chips, WebP hero, code-split dialog/tabs, CSP, `react-router-dom@7.18.2`):

| Category | Before | After (estimate) |
|----------|-------:|-----------------:|
| Design | 19 | 23–24 |
| Copy | 18 | 19–20 |
| Information | 18 | 19–20 |
| Stack | 9 | 9–10 |
| Speed | 10 | 13–14 |
| Security | 8 | 9–10 |
| **Total** | **82 (B)** | **~95–96 (A)** |

Local mobile Lighthouse after the pass: **Performance 92** (FCP ~2.3s, LCP ~3.0s). See also [LANDING.md § Rating](./LANDING.md#rating-post-fix). Remaining ceiling: production LCP ≤2.5s and real social proof / Formspree IDs.
