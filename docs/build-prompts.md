# Stella for Facilities — Four Parallel Build Prompts

*One prompt per person, all in Fable, all within this project (so the briefing context is inherited — no pasting). Last updated: 2026-07-15*

**The split is designed to minimize integration pain:**
- **P1** builds the interactive prototype as ONE self-contained HTML file (data + logic + UI baked in — don't split UI from logic across people, that's the trap).
- **P2** hands P1 the seeded data + the exact scoring rules so P1 can one-shot it.
- **P3** builds the HTML pitch deck (the demo artifact).
- **P4** hands P3 the proof points + the spoken script.

**Handoffs:** P2 → P1 (paste data/logic). P4 → P3 (paste content). P1's screenshots → P3 (drop into the demo slide).
**Timing:** P2 & P4 finish their specs by 0:45 so P1 & P3 have a clean 2 hrs to build.

---

## P1 — Interactive prototype (the hero deliverable)

> **Assign to your most build-comfortable person.** Run in Fable. Wait for P2's data + scoring block before finalizing, but you can scaffold the UI immediately.

```
Build a single self-contained HTML file (inline CSS + JS, no build step, no external
dependencies except optionally a chart library from a CDN) that is an interactive demo of
"Stella for Facilities," an AI occupancy agent for senior-living communities. It has three
screens with top navigation:

SCREEN 1 — CAPACITY DASHBOARD for "Maplewood Senior Living":
- Occupancy by care type (Independent Living: full; Assisted Living: full; Memory Care: 3
  units open). Overall ~92% occupancy.
- Highlight the 3 open memory-care units (price, room type, available date).
- A prominent callout: "Memory Care projected to miss next month's occupancy target."
- A big primary button: "Run Stella →".

SCREEN 2 — INCOMING DEMAND:
- ~15 incoming A Place for Mom families as cards/rows, each showing care need, monthly
  budget, urgency (days to desired move-in), intent (Inquiry / Tour booked / Deposit-ready),
  distance, and a computed Fit Score (0-100) with its best-match unit.
- Sortable by Fit Score.

SCREEN 3 — GRACE RECOMMENDS (the money screen):
- A warning banner: "You're on track to miss next month's occupancy target (Memory Care:
  3 units open, 1 projected move-in)."
- "Prioritize these 5 families" — the top 5 memory-care families by Fit Score, each with a
  one-line reason ("deposit-ready, budget above rate, moves in 12 days").
- A concession callout: "Offer a $1,500 move-in credit to [2 named families] — budget just
  under rate, closes the gap."
- A spend flag: "Pause Assisted-Living lead spend — AL is full; you're paying for leads you
  can't house."

SCORING (implement exactly): FitScore = hard filter on care-type match, then weighted sum of
budget fit, urgency, intent, and geography. [PASTE P2's exact weights + rules + the data
object here — until then use placeholder data that produces a clean top-5 for memory care.]

STYLE: clean, modern, professional SaaS look (think a polished dashboard) — generous spacing,
a calm palette, clear typography, subtle cards. It should look like a real product, not a
prototype. Make "Run Stella" feel like a moment (brief loading state is fine).

Everything embedded in one .html file so it opens with a double-click and runs offline.
```

---

## P2 — Synthetic data + agent logic spec (de-risks P1)

> Run in Fable. **Finish by 0:45** and hand the output straight to P1.

```
Produce two things for the "Stella for Facilities" demo, as one document.

1) A data object (JSON) for "Maplewood Senior Living":
- The community: ~40 units, occupancy ~92%, care types Independent Living (full), Assisted
  Living (full), Memory Care (3 units open).
- ~5 open units total, 3 of them Memory Care. Each unit: id, careType, monthlyPrice
  ($4,500-$9,000 by care level), roomType, availableFrom date.
- ~15 incoming A Place for Mom families. Each: name (fake), careNeed, monthlyBudget, urgency
  (days to desired move-in), intent (Inquiry / Tour booked / Deposit-ready), distanceMiles.
- SEED IT so the math produces a clean, obvious top-5 for Memory Care, of which EXACTLY 2 are
  "concession candidates" (budget 5-10% under the unit price) — these are the $1,500-credit
  targets. Include 2-3 Assisted-Living families even though AL has no open units (this
  justifies the "pause AL lead spend" recommendation).

2) The scoring + rules spec, precise enough to implement:
- FitScore (0-100): hard filter on careType match (no match = ineligible), then a weighted sum
  of budget fit, urgency, intent, and geography. Give exact weights that sum to 100 and a
  clear formula for each component.
- Rules: (a) occupancy-gap alert condition; (b) "prioritize top N" logic; (c) concession
  trigger + how to size the credit; (d) "pause lead spend" condition.
- The exact on-screen copy strings for the alert, the 5 prioritized families (with their
  one-line reasons), the concession line (naming the 2 families), and the spend flag.

Output the JSON in a code block ready to paste, then the spec below it.
```

---

## P3 — HTML pitch deck (the demo artifact)

> Run in Fable. Scaffold immediately; drop in P4's content and P1's screenshots as they arrive.

```
Build a self-contained HTML slide presentation (one .html file, arrow-key navigation, clean
modern design — you may use reveal.js from a CDN or plain CSS slides) to pitch "Stella for
Facilities," an AI occupancy agent for senior-living communities. ~8 slides:

1. Title: "Stella — the AI occupancy agent for senior living" + one-line tagline.
2. Problem: empty units are the #1 lost revenue in senior living, and communities drown in
   leads they can't convert (wrong care level, budget, timing). [P4 supplies proof points.]
3. The gap: A Place for Mom owns the demand; nobody connects that demand to which units a
   community can actually fill. Show the simple stack — demand (APFM) ... [gap] ... community
   capacity — and put Stella in the gap.
4. Product: the 3 steps — pull capacity in → analyze incoming APFM demand → recommend actions.
5. Live demo: a full-bleed screenshot of the "Stella Recommends" screen with the recommendation
   text called out. [P1 supplies screenshot; use a placeholder box until then.]
6. Why it's big for APFM: shifts APFM from a per-referral fee to recurring software for every
   community; expands TAM; gets smarter with every move-in. [P4 supplies numbers.]
7. Why now / moat: [P4 supplies — data flywheel, incumbents doing pieces but not the APFM link].
8. The ask / close.

STYLE: premium, confident, lots of whitespace, big type, one idea per slide. Presentable on a
projector. Everything in one .html that opens with a double-click.
```

---

## P4 — Proof points + pitch script (feeds P3)

> Run in Fable (use its web search for the stats). **Finish by 0:45** and hand to P3.

```
Assemble the proof points and the spoken pitch for "Stella for Facilities," an AI occupancy
agent for senior living that sits on A Place for Mom's referral demand. Deliver:

1) 6-8 punchy, sourced proof points we can put on slides — e.g., senior-living occupancy rates
   and the revenue cost of a vacant unit; A Place for Mom's scale (communities in network) and
   its per-referral business model; the size of the senior-living market; and the competitive
   whitespace (incumbents like Aline/Prorize do pieces of pricing or CRM, but nobody owns the
   APFM-demand-to-capacity match). Cite each source; flag anything that's an estimate.
2) The "why APFM should love this" economics in 2-3 lines: per-referral fee → recurring SaaS,
   and why that expands their TAM.
3) A 60-second spoken pitch script: hook → the insight (APFM owns demand, nobody connects it to
   capacity) → 30-second demo narration (Maplewood, 3 empty memory-care units, Run Stella, read
   the recommendation) → why it's big → close.
4) A demo run-of-show: the exact click sequence and what to say on each screen.

Keep the proof points slide-ready (short phrases, not paragraphs) and hand them to whoever is
building the deck.
```

---

**One rule for all four:** freeze scope at the checkpoints, and protect the hero screen (Maplewood, 3 empty memory-care units, the recommendation). If time runs short, cut everything else before you touch that.
