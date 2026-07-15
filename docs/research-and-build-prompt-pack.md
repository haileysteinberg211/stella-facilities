# Senior Living Occupancy Agent — Prompt Pack (v2, consolidated)

*6 prompts, run in order. Last updated: 2026-07-15*

---

## Setup — do this once, then never paste context again

Paste the block below into the **project's custom instructions** (or keep the two working docs
in the folder — Fable reads project context automatically). After this, each prompt just refers
to "Stella for Facilities" and Fable has the full frame.

```
PROJECT CONTEXT — Stella for Facilities
We're evaluating an AI occupancy & revenue agent for senior-living communities. It sits on top
of A Place for Mom (APFM) referral demand and tells a community which incoming families fit
which open units, flags occupancy gaps, and recommends pricing/concessions and who to contact.
Thesis: the defensible wedge is the CONNECTIVITY + MATCHING layer between APFM demand and a
community's live capacity, feeding an optimization brain — NOT a generic revenue-management
system. Key tensions: (1) APFM partner vs. competitor; (2) does a SaaS fee cannibalize APFM's
per-referral revenue; (3) feature-vs-company risk vs. incumbents like Aline; (4) Fair Housing /
RealPage-style antitrust exposure from cross-community data pooling.

STANDING RULES for every output: be opinionated, take a position; cite sources inline;
separate sourced fact from inference; label every assumed number and show the logic; use
tables for comparisons; software/SaaS lens.
```

---

## 1 — Market & demand research

```
Research the market and demand layer for Stella for Facilities. Deliver one report covering:
(a) Market size: US senior-living universe (communities/units by care type, for-profit vs.
    owner-operated), operator segmentation by portfolio size, and a bottoms-up TAM/SAM/SOM for
    a per-community SaaS agent (low/base/high, assumptions labeled).
(b) A Place for Mom: business model & referral-fee economics, scale, ownership, facility-facing
    products today, the whitespace they DON'T cover, and the cannibalization tension (does better
    conversion mean fewer referrals sold).
(c) Demand-aggregator landscape: Caring.com and other referral players, the NIH-funded entrant,
    demand concentration, and how exposed a product anchored on APFM is.
(d) ICP / buyer: which operator segment has both pain and budget, who buys vs. uses, sales cycle,
    and willingness to pay a SaaS fee on top of referral fees.
(e) Occupancy economics: occupancy rates/trend and rate by care type, cost of a vacant unit,
    conversion + concession benchmarks, and what one point of occupancy is worth per community/yr.
Cite NIC MAP and senior-housing sources. Tables throughout. End with an opinionated read on
whether APFM is more likely to partner, build, or block.
```

## 2 — Ecosystem stack & competitive landscape

```
Map the senior-living software stack and competition for Stella for Facilities, and validate our
"connectivity layer is the whitespace" thesis. Deliver:
(a) The full stack with named players and rough share per layer: demand generation, demand
    aggregation/marketplace (APFM), connectivity/channel-management, optimization/revenue-mgmt,
    sales/CRM, system-of-record/ops, data/benchmarking. Flag which layers are mature vs. gaps.
(b) Optimization layer teardown: Prorize, Aline Intelligence, Yardi RevenueIQ, RealPage senior
    living, operator in-house programs — what each actually does and how much of "Stella" is
    already shipping.
(c) SOR/CRM integration surface: PointClickCare, MatrixCare, Yardi, Eldermark, ECP, Aline,
    Continuum — who exposes APIs, who could bolt this on (feature-vs-company threat), where
    capacity data lives.
(d) Cross-vertical analogs: how revenue-management (hotels/airlines/multifamily) and channel
    managers (SiteMinder etc.) became standalone categories, and what that implies for us.
(e) Is anyone already building the APFM-connected matching layer? Then an opinionated build-vs-
    partner recommendation across three scenarios (with APFM / independent / APFM builds it).
2x2 positioning matrix + tiered competitor table + the single most important thing to validate.
```

## 3 — Regulatory & compliance memo

```
Assess legal/regulatory exposure for Stella for Facilities and turn it into design rules. Cover
Fair Housing risk in ranking/prioritizing prospective residents by budget or move-in likelihood;
the RealPage/DOJ antitrust matter (what was prohibited — pooling nonpublic competitor pricing —
and what it means for any cross-community benchmarking/data flywheel in housing); senior-living
licensing limits on pricing flexibility; referral-practice scrutiny (Senate probe of APFM); and
data/PHI considerations from using care needs. Deliver a plain-English 1-2 page memo with concrete
design principles Stella must follow (e.g., own-community-data-only pricing, no pooled competitor
pricing, auditable non-discriminatory lead logic), a red-line checklist, and what needs outside
counsel before any pricing/lead-ranking demo. Cite sources.
```

## 4 — Product briefing

```
Write a 2-3 page product briefing for Stella for Facilities with these sections: (1) positioning +
elevator pitch; (2) problem — the demand/supply mismatch and what it costs operators; (3) target
user, buyer, and ICP; (4) product — expand the 3-step workflow (pull capacity → analyze incoming
APFM demand → recommend actions) into inputs, decision logic, outputs, and human-in-the-loop;
(5) use cases, leading with the demo (community with three empty memory-care units → "prioritize
these five families, offer $1,500 credit to two, pause AL lead spend"); (6) value prop & ROI
(occupancy lift, revenue-per-available-unit, marketing efficiency); (7) why it's strategic for
APFM (referral-fee → recurring-SaaS shift, TAM expansion); (8) data & AI — data needed, the
cross-community flywheel, the defensible moat; (9) competitive landscape (Aline, Prorize, Yardi,
PointClickCare) and why this isn't just a feature; (10) risks & open questions; (11) MVP scope +
rollout. Opinionated, executive-ready, tables for the landscape and ROI, assumptions labeled.
```

## 5 — Unit economics & cannibalization model

```
Spec and build a formula-driven Excel model (inputs blue, formulas black, low/base/high case
switch, nothing hardcoded) that answers: (1) community-level ROI — occupancy lift x revenue-per-
available-unit vs. SaaS cost, with payback; (2) APFM-level cannibalization — does incremental SaaS
revenue exceed referral revenue displaced by higher conversion efficiency; (3) company build-up —
TAM x penetration x ACV x retention → ARR. Define every input (community count, occupancy
baseline/lift, rate by care type, referral fee size, conversion-rate change, ACV, churn, gross
margin), lay out the tab structure and key formulas, and pull baseline numbers from the market
research (prompt 1). Flag which inputs are the swing factors.
```

## 6 — Path to real (MVP, discovery, APFM pitch, GTM)

```
Produce the execution package to make Stella for Facilities real, in four parts:
(a) MVP / demo spec: the narrowest valuable slice (recommend memory-care occupancy-gap detection
    + APFM lead-fit ranking for one community), data inputs and sources, agent decision logic, the
    exact demo script, what's faked vs. real in v1, human-in-the-loop checkpoints, and a build
    task list — buildable in days.
(b) Customer-discovery guide: 10-15 non-leading questions each for (i) community sales directors/
    EDs and (ii) enterprise operator ops leaders, plus a "signals we're looking for" rubric and
    the top 3 hypotheses to test.
(c) APFM partnership pitch: frame the referral-fee → SaaS expansion, quantify TAM upside, address
    cannibalization head-on, define who-does-what, propose a data-sharing pilot, and prep the
    counter-case (why APFM shouldn't just build it themselves).
(d) GTM: beachhead ICP, land-and-expand motion, pricing/packaging, partner-vs-direct channel call,
    12-month milestones, key metrics, and top 3 risks with mitigations.
```

---

**Run order:** 1 → 2 → 3 anchor the facts; 4 (briefing) and 5 (model) consume them; 6 is the build package. **Validate before building:** the cannibalization math (1 → 5) and partner-vs-compete with APFM (1, 2 → 6).
