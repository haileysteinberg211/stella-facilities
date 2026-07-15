# Stella for Facilities — Prototype Briefing & 3-Hour Build Plan

*The one thing the whole team aligns on before touching code. Last updated: 2026-07-15*

---

## The pitch (memorize this line)

**Stella is an AI occupancy agent for senior-living communities. It sits on A Place for Mom's referral demand and tells a community which incoming families to chase, which units to discount, and where they're about to miss occupancy — turning open beds and raw leads into move-ins.**

## The problem (say it in 15 seconds)

A community gets a flood of APFM leads but can't serve all of them — wrong care level, wrong budget, wrong timing. Meanwhile specific units sit empty. Today the sales director triages this by gut in a spreadsheet. Empty units are the single biggest lost revenue in the building, and nobody has a system that matches *this* demand to *these* open units.

## The demo we build toward (the money moment)

A single community — **"Maplewood Senior Living"** — with **3 empty memory-care units** and a projected occupancy miss. Stella says, on screen:

> ⚠️ **You're on track to miss next month's occupancy target (memory care: 3 units open, 1 projected move-in).**
> **Do this:** Prioritize these **5** APFM families (best fit + high intent). Offer a **$1,500 move-in credit** to the 2 price-sensitive ones. **Pause assisted-living lead spend** — AL is full and you're paying for leads you can't house.

That screen is the whole pitch. Everything else exists to earn it.

---

## Product = 3 steps (this is all the prototype shows)

1. **Capacity in** — the community's open units by care type, price, availability date, and any staffing/licensing cap.
2. **Demand in** — incoming APFM families, each with care need, budget, urgency, geography, and an intent/likelihood signal.
3. **Actions out** — rank best-fit families per open unit; flag occupancy gaps; recommend a concession on hard-to-fill units; tell the team exactly who to call and why; flag where to cut lead spend.

**In scope for 3 hrs:** the 3 screens for ONE community with realistic fake data, and the agent's ranked output + the alert.
**Out of scope:** login/auth, real APFM/PMS integration, multi-community, live model training, pricing optimization math beyond a simple rule, anything with real PII.

---

## The agent's logic (keep it simple and explainable — no black box needed for a demo)

For each incoming family, compute a **Fit Score (0–100)** against each open unit:

- **Care-type match** — hard filter. Memory-care family can only fill a memory-care unit.
- **Budget fit** — family budget vs. unit price. Full points if budget ≥ price; scaled penalty below; flag "concession candidate" if within ~10% under price.
- **Urgency / time-to-move-in** — sooner = higher (fills the gap faster).
- **Intent / likelihood** — APFM engagement signal (tour booked > inquiry only).
- **Geography** — proximity to the community.

**Recommendations derived from scores:**
- **Prioritize:** top-N families by Fit Score for units with a projected gap.
- **Concession:** if a unit's best-fit families are all "concession candidates" (budget just under price), suggest a move-in credit sized to close the gap.
- **Occupancy-gap alert:** if projected move-ins < open units for a care type next month, fire the warning.
- **Cut spend:** if a care type is full (no open units) but leads are still inbound, flag "pause lead spend here."

That's it — a weighted score + four if-then rules. Explainable, fast, and demo-proof.

---

## Synthetic data spec (make it feel real)

**Community:** Maplewood Senior Living — ~40 units total. Care types: Independent Living (full), Assisted Living (full, still getting leads → the "pause spend" moment), Memory Care (3 open → the hero). Show current occupancy ~92% with the MC gap.

**Units:** ~5 open across the building, 3 of them memory care. Each: type, monthly price ($4.5k–$9k range by care level), room type, available-from date.

**Families (~15 incoming APFM leads):** name (fake), care need, monthly budget, urgency (days to desired move-in), intent (inquiry / tour booked / deposit-ready), distance. Seed it so the math produces a clean top-5 for memory care, with exactly 2 who are "just under price" (the $1,500-credit targets), plus a couple of AL leads with no open AL unit (justifies "pause spend").

Store as one `data.json` so UI and logic teams work against the same source.

---

## The 3 screens

1. **Capacity dashboard** — Maplewood at a glance: occupancy by care type, open units highlighted, the memory-care gap called out.
2. **Incoming demand** — the ~15 APFM families as cards/rows, each with its Fit Score and best-match unit.
3. **Stella recommends** — the money screen: the alert + the prioritized 5 + the concession callout + the pause-spend flag. One click from screen 1 → "Run Stella" → this.

---

## 3-hour parallel build plan (4 computers)

Everyone works off this doc + the shared `data.json`. Fable can run on all four in parallel.

| Owner | Workstream | Deliverable | Done by |
|---|---|---|---|
| **P1 — Data** | Build `data.json` (community, units, 15 families) seeded so the demo math lands cleanly | `data.json` | 0:30 |
| **P2 — UI shell** | Build the 3-screen layout (dashboard → demand → recommendations), styled, wired to `data.json` | working front end | 2:00 |
| **P3 — Agent logic** | Implement Fit Score + the 4 rules; produce the ranked output + alert text; write the exact on-screen recommendation copy | scoring module + copy | 1:30 |
| **P4 — Pitch** | 60-second pitch script, problem framing, the "why APFM / why now," and the demo run-of-show; own the dry run | pitch + script | 2:30 |

**Checkpoints:**
- **0:30** — `data.json` frozen. UI and logic both build against it (no more schema changes after this).
- **1:30** — logic output format locked; P2 wires it into screen 3.
- **2:15** — integrate: click-through works end to end.
- **2:15–2:45** — polish the hero screen + screenshot the money moment.
- **2:45–3:00** — full dry run, twice.

**Rule for the day:** protect the demo. If something's at risk, cut scope, not the hero screen. The three-empty-memory-care-units moment is the deliverable; everything else is supporting cast.

## 60-second pitch skeleton (P4 to flesh out)

1. **Hook (10s):** "Empty units are the #1 lost revenue in senior living, and communities are drowning in leads they can't convert."
2. **Insight (10s):** "A Place for Mom owns the demand. Nobody connects that demand to which units a community can actually fill."
3. **Demo (30s):** run Maplewood → click Run Stella → read the recommendation verbatim.
4. **Why it's big (10s):** "This turns APFM from a per-referral fee into recurring software for every community — and it gets smarter with every move-in."
