# APFM Design Profile & Style Guide

_For the "Stella" prototype. Goal: make the demo look like an A Place for Mom product — warm, human, trustworthy — NOT a generic AI-tool default. Built from the live aplaceformom.com site + the Nov 12, 2025 brand refresh ("Where love finds its place")._

> **Source note (canary):** Charcoal text `#333333` and the named brand colors "Dove Blue" / "Nile Blue" are confirmed (live site `theme-color`; Awin brand profile). Exact brand-guide hex values are behind a JS bundle I couldn't read, so the specific hexes below are a **derived, harmonious APFM-aligned palette** — swap in official brand-guide values if you have them. Typography is a recommendation matched to the brand's empathetic/editorial voice, not confirmed from their CSS.

## Brand personality (from the Nov 2025 refresh)
Empathy **and** authority. Warmth, confidence, connection, and love — "the force that motivates difficult decisions." Photography-forward (real caregiver stories, warm candid portraits, polaroid collages). APFM now positions as both a **trusted guide for caregivers** and a **growth partner for providers** — which is exactly Stella's audience. Tagline: *"Where love finds its place."*

Translation for Stella (a B2B provider tool): keep the warmth and humanity of the consumer brand, but make it operational and confident — a calm, premium ops product, not a cold enterprise dashboard and not a playful consumer app.

## Color palette

### Brand core
| Token | Hex | Use |
|---|---|---|
| `--apfm-ink` | `#333333` | Primary text (confirmed from live site) |
| `--apfm-navy` (Nile Blue) | `#1F3D54` | Primary brand color: headers, nav, primary surfaces, data emphasis |
| `--apfm-navy-tint` | `#E7EFF4` | Tinted backgrounds, selected states |
| `--apfm-blue` (Dove Blue) | `#6C9BB8` | Secondary/supporting blue, links, info, chart series |

### Warm accents (the "love" side — use sparingly, high impact)
| Token | Hex | Use |
|---|---|---|
| `--apfm-coral` | `#E4735E` | Primary CTA / accent, key highlights, the "heart" |
| `--apfm-coral-dark` | `#C85A47` | CTA hover/active |
| `--apfm-apricot` | `#F4C77B` | Soft highlight, badges, warm data accent |
| `--apfm-cream` | `#FBF7F1` | Default page background (NOT stark white) |
| `--apfm-sand` | `#F1E8DA` | Warm dividers, secondary surface |

### Support + semantic (for the dashboard)
| Token | Hex | Use |
|---|---|---|
| `--apfm-sage` | `#6FA890` | Positive/growth accent |
| `--success` | `#3F8E6C` | Occupancy up, capacity available |
| `--warning` | `#E0A23B` | Vacancy risk, watch |
| `--danger` | `#C4503B` | Urgent / demand you can't serve |
| `--apfm-white` | `#FFFFFF` | Cards / elevated surfaces |
| `--gray-50/100/300/500/700` | `#F7F6F4 / #EEEDEA / #D6D3CD / #8A867E / #55524C` | Neutrals, borders, muted text |

## Typography
Recommended pairing (both free Google Fonts — embeddable in the prototype):
- **Display / headlines — `Fraunces`** (soft, warm serif). This is the anti-generic move: an editorial serif carries the empathy/"love" voice and instantly reads as *not* an AI default. Use for page titles, big numbers, and the marketing/pitch cover.
- **UI / body — `Mulish`** (friendly humanist sans, rounded terminals). Section headers, tables, forms, labels, paragraphs.

```
--font-display: 'Fraunces', Georgia, 'Times New Roman', serif;
--font-sans: 'Mulish', -apple-system, 'Segoe UI', Roboto, sans-serif;
```

Scale (desktop): Display 44/48 · H1 34/40 · H2 26/32 · H3 20/28 · Body-lg 18/28 · Body 16/26 · Small 14/20 · Caption 12/16. Headline weight 500–600 (Fraunces looks best mid-weight, slight optical softness); body 400/600. Big dashboard numbers: Fraunces 600, tabular figures.

## Shape, depth, spacing
- **Radius:** `--radius-sm 8px`, `--radius 12px`, `--radius-lg 20px`, pill `999px` (pills only for tags/status chips, not every button).
- **Shadows (soft, warm, low):** `--shadow-sm: 0 1px 2px rgba(31,61,84,.06)`; `--shadow: 0 8px 24px rgba(31,61,84,.08)`. Never harsh black drop shadows.
- **Spacing:** 4px base; common 8/12/16/24/32/48. Generous whitespace — the brand reads calm and uncluttered.
- **Borders:** 1px `--gray-100` or `--apfm-sand`; hairline, warm.

## Components
- **Buttons:** Primary = solid `--apfm-coral`, white text, radius 12, weight 600 (hover `--apfm-coral-dark`). Secondary = `--apfm-navy` outline or solid navy for nav actions. Tertiary = text link in Dove Blue. Comfortable padding (12×20). No gradients.
- **Cards:** white on cream, radius 16–20, `--shadow`, 24px padding, optional warm 1px border. Photos with rounded corners.
- **Stat / KPI tile (Stella):** big Fraunces number, small Mulish label above in `--gray-500` uppercase-tracked, delta chip in success/warning/danger. Navy or cream background.
- **Status chips:** pill, tinted bg + darker text (e.g., success `#EAF3EE`/`#2E6B50`; warning `#FBF0DC`/`#9A6B18`; danger `#F7E4E0`/`#9E3D2C`).
- **Nav / top bar:** navy `#1F3D54` bar or cream with navy wordmark; coral used only for the key action.
- **Tables:** roomy rows (48px+), `--gray-100` row dividers, cream header row, Mulish 600 headers. Right-align numbers, tabular figures.
- **Data viz:** series in navy → dove blue → sage → apricot → coral. Cream/white plot background, no neon.

## "Do NOT look Claudey" guardrails
Hard bans for this prototype:
- ❌ No purple / indigo / violet anywhere (no `#6366F1`, no `#7C3AED`). This is the #1 tell.
- ❌ No default **Inter/Roboto** as the display face; no all-sans generic stack.
- ❌ No neon/multicolor gradients, no purple→pink "AI" gradients, no glowing "✨ AI sparkle" motifs.
- ❌ No glassmorphism / heavy blur, no dark-mode-by-default.
- ❌ No emoji used as UI icons; no everything-pill-shaped; no giant hero blob gradients.
- ❌ No stark `#FFFFFF` full-page background — use warm cream `--apfm-cream`.

Do instead: warm cream canvas, soft serif headlines, coral used surgically for the one action that matters, real photography where a hero/testimonial appears, calm navy structure, generous space, plain human copy.

## Voice / copy
Empathetic + authoritative, plain-spoken, never salesy or jargon-heavy. For the provider audience: confident "growth partner" tone — outcomes and clarity ("Fill the right units," "Demand you can actually serve"), not hype. Mirror APFM's cadence: short, warm, declarative.

## Ready-to-paste CSS variables
```css
:root{
  /* brand */
  --apfm-ink:#333333; --apfm-navy:#1F3D54; --apfm-navy-tint:#E7EFF4; --apfm-blue:#6C9BB8;
  /* warm */
  --apfm-coral:#E4735E; --apfm-coral-dark:#C85A47; --apfm-apricot:#F4C77B;
  --apfm-cream:#FBF7F1; --apfm-sand:#F1E8DA;
  /* support + semantic */
  --apfm-sage:#6FA890; --success:#3F8E6C; --warning:#E0A23B; --danger:#C4503B;
  --apfm-white:#FFFFFF; --gray-50:#F7F6F4; --gray-100:#EEEDEA; --gray-300:#D6D3CD; --gray-500:#8A867E; --gray-700:#55524C;
  /* type */
  --font-display:'Fraunces',Georgia,serif; --font-sans:'Mulish',-apple-system,'Segoe UI',Roboto,sans-serif;
  /* shape */
  --radius-sm:8px; --radius:12px; --radius-lg:20px;
  --shadow-sm:0 1px 2px rgba(31,61,84,.06); --shadow:0 8px 24px rgba(31,61,84,.08);
}
```
Google Fonts: `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Mulish:wght@400;600;700&display=swap');`

See `APFM_Style_Guide.html` for the rendered swatches, type scale, and component/Stella examples.
