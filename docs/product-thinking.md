# Senior Living Facility Occupancy & Revenue Agent — Product Thinking

*Working notes / gut-check. Last updated: 2026-07-15*

---

## 1. The concept (as it currently stands)

**"Stella for Facilities"** — an AI revenue manager for senior-living communities. It helps communities fill the *right* units (not just generate more leads) by sitting on top of A Place for Mom's (APFM) referral demand and turning open units + inbound families into higher occupancy.

**Prototype workflow**
1. **Pull in facility capacity** — open units by care type (assisted living, memory care, independent living), price, room type, availability date, and staffing/licensing constraints.
2. **Analyze incoming demand** — which APFM families fit each open unit, by urgency, budget, care needs, move-in likelihood, and expected time-to-move-in.
3. **Recommend actions** — prioritize best-fit leads, suggest pricing/concessions for hard-to-fill units, flag upcoming occupancy gaps, tell sales teams exactly who to contact and why.

**Core demo** — a community with three empty memory-care units. The agent says: *"You are likely to miss occupancy targets next month. Prioritize these five APFM families, offer a $1,500 move-in credit to two of them, and pause assisted-living lead spend."*

**Why it's strategic for APFM** — moves APFM from a transactional per-referral fee to a recurring SaaS fee for occupancy forecasting, lead prioritization, sales workflow automation, pricing/concession recommendations, and capacity benchmarking. Expands TAM and deepens the facility relationship.

---

## 2. Gut check — is this a good idea?

**Yes on pain and instinct; the risk is that it's a feature, not a company, and it lives or dies on the APFM relationship.**

Strengths: real demand/supply mismatch; a warm channel (customers already pay APFM); a data-flywheel story (help facilities manage velocity → get occupancy/conversion data → improve matching → sell back a multi-community view). Facility-first is the right call.

Where to push:
- **Feature vs. company.** The "recommend actions" brain risks being absorbed by whoever owns the CRM/SOR or the demand. (See §5 — Aline is already shipping much of it.)
- **Fragmented, low-tech buyer.** Home-care agencies and smaller communities are mom-and-pop, thin-margin, high-churn; big operators build in-house. Who's the ICP with budget?
- **AI moat is a someday-moat.** The cross-community data flywheel is the only real defensibility and needs scale you won't have on day one.

---

## 3. The revenue-management analogy — hotels vs. senior living vs. other categories

Revenue management (RM) is a mature, **separate** software category wherever inventory is perishable and priced dynamically. It already exists (nascently) in senior living too — so "the first AI revenue manager for senior living" overstates the whitespace.

| Vertical | Demand / distribution | System of record | Revenue-management layer | Why RM is / isn't a big category |
|---|---|---|---|---|
| **Airlines** | GDS, OTAs, direct | PSS (Sabre, Amadeus) | Yield management — the *origin* of the discipline (American Airlines, 1980s) | Perishable seat, high elasticity, sub-second repricing → huge ROI |
| **Hotels** | OTAs (Booking, Expedia), GDS, brand.com | PMS (Opera/Oracle, Mews, Cloudbeds) | Distinct, well-funded category — IDeaS (SAS), Duetto | Room-night unsold today is lost forever; daily dynamic pricing |
| **Multifamily** | ILSs (Zillow, Apartments.com) | PMS (Yardi, RealPage, Entrata) | Distinct category — RealPage YieldStar, Yardi RevenueIQ; **now legally radioactive** (see §6) | Annual leases, less perishable, but scale + turnover justified it |
| **Self-storage** | Aggregators, direct | Ops platforms (storEDGE, SiteLink) | Embedded RM (existing-customer rate increases) — a feature, not standalone | Low-friction, month-to-month, high elasticity |
| **Senior living** | Referral aggregators (**APFM**, Caring.com) | PointClickCare, Yardi Senior Living, Aline, Eldermark, ECP | **Emerging, not greenfield** — Prorize (dynamic pricing since ~2017); Yardi/RealPage modules; Atria/Discovery/Holiday running programs in-house | Long length-of-stay, emotional purchase, care-level/staffing constraints → weak case for hotel-style daily yield |

**Three takeaways:**
1. **RM is almost always a module, not a standalone company** — it lives between the PMS and the demand channel. Sharpens the feature-vs-company risk.
2. **The hotel analogy breaks where it matters.** Senior living's binding constraint is care-level/staffing, not price. The real product is demand-matching + lead-prioritization + concession-timing; dynamic pricing is one lever (and the least defensible, since Prorize/Yardi already do it).
3. **Reframe:** not "the first AI revenue manager for senior living" — rather "the demand-matching and occupancy-planning layer only APFM's referral data makes possible, with pricing as one lever." More accurate and more defensible.

---

## 4. The stack, with granularity — demand vs. optimization vs. SOR

Same taxonomy across verticals, then the senior-living map with named players.

| Layer | What it does | Hotels | Multifamily | Senior living (named players) | SL maturity |
|---|---|---|---|---|---|
| **1. Demand generation** | Creates end-customer intent | Google/metasearch, brand | Zillow, Apartments.com | APFM, Caring.com, Nursinghomes.com, paid search | Mature |
| **2. Demand aggregation / marketplace** | Routes & matches demand to supply; owns the *family* relationship | OTAs (Booking, Expedia) | ILS marketplaces | **APFM & Caring.com** (referral marketplaces w/ human advisors; paid on placement) | Mature, concentrated |
| **3. Connectivity / channel mgmt** | Real-time two-way sync of inventory ↔ demand channels | Channel managers (SiteMinder, Derbysoft) | ILS feeds | **Largely absent** — communities respond to APFM leads manually; no live unit-availability sync | **Gap** |
| **4. Optimization / decisioning (RM)** | Forecast, price, yield, lead prioritization, concession logic | IDeaS, Duetto | RealPage, Yardi RevenueIQ | Prorize (pricing); **Aline Intelligence** (conversion/readiness prediction, ML) | Emerging, fragmenting |
| **5. Sales execution / CRM** | Humans action the recs; nurture, follow-up | (thin — transactional) | Leasing CRMs | **Aline** (Enquire+Sherpa+Glennis merged), Continuum, Advantage Anywhere | Mature, consolidating |
| **6. System of record / ops** | Inventory, residents, clinical/care, billing | PMS (Opera, Mews, Cloudbeds) | PMS (Yardi, RealPage, Entrata) | PointClickCare, MatrixCare, Yardi Senior Living, Eldermark, ECP, Aline (ops) | Mature |
| **7. Data / benchmarking** | Market comps, index | STR | RealPage/CoStar analytics (now constrained) | NIC MAP | Mature (external) |

**What this reveals for Stella:**

**a) The optimization layer (4) is being absorbed by the CRM/SOR incumbent right now.** Aline (Enquire+Sherpa+Glennis) already runs "Aline Intelligence" — generative AI + ML predicting move-in readiness and conversion, automating call transcription and follow-up recs. ~50 of the top 150 operators, ~800 customers, ~5,700 communities. A standalone optimization product walks into an incumbent that owns layers 4+5+6 and has the data.

**b) The real whitespace is layer 3 — the missing connectivity between APFM's demand (layer 2) and the community's live capacity.** Hotels solved this with channel managers syncing inventory both ways in real time; senior living has no equivalent. Nobody owns the live handshake between "who APFM is about to send" and "what this building can absorb next month." That is the defensible wedge — and only APFM's demand data can power it. Reframe Stella as the **connectivity + matching layer feeding an optimization brain**, not a generic RMS.

**c) That makes the APFM partnership non-optional.** The edge is layer-3 connectivity anchored on layer-2 demand APFM owns. Aline can build the brain (it is); the SORs own the capacity data; none of them own the demand. APFM is the one irreplaceable node, and it has no facility-facing SaaS today (just referral fees + the Nursinghomes.com listing). Built *with* APFM, Stella is connective tissue nobody else can assemble. Built standalone, it's squeezed between Aline on one side and a demand source it doesn't control on the other.

**Watch-item:** an NIH-funded startup is reportedly going after senior-living referral/lead aggregation (Jan 2026), and APFM is under Senate scrutiny over referral practices. If layer 2 gets disrupted or re-regulated, anything anchored solely on APFM inherits that risk.

---

## 5. Questions the team needs to answer

**On APFM (existential)**
- Is APFM building/blessing this, or are we doing it *to* them? Everything downstream depends on the answer.
- Do we have rights to APFM's family/lead data *and* the outcome data (who moved in, when, at what price)? Without outcome data the matching agent can't be trained or proven.
- **Cannibalization:** if we help a community fill units more efficiently, do they need fewer referrals — i.e., does the SaaS product eat APFM's own referral revenue? Must show the SaaS fee more than offsets displaced referral volume, or APFM won't ship it.

**On buyer & willingness to pay**
- Who's the ICP, and do they have budget? Big operators may already run RM or build in-house; mom-and-pops have the pain but thin budgets. What's the ACV?
- Will a community pay a recurring fee *on top of* per-referral fees, or does that feel like being charged twice? Pricing model — per-community, per-unit, % of incremental occupancy?
- Who inside the building uses it (sales/marketing director, ED) and will they trust an agent telling them to pause spend and hand out $1,500 credits?

**On product & data**
- Where does real-time capacity/availability data live, and can we actually pull it? (PMS/CRM: PointClickCare, Yardi, Aline — or a spreadsheet.) Integration determines whether the demo is real.
- How much human-in-the-loop? Pricing/concession and "pause lead spend" are high-stakes; who's accountable when the agent is wrong, and how do we keep trust after a bad call?
- How do we *attribute* occupancy lift to the agent vs. seasonality/sales effort? No provable ROI → no renewals.

**On defensibility**
- Why doesn't Aline / Enquire / Yardi / PointClickCare just bolt this on? (Aline already is.) What's the wedge that makes us the system of record rather than a feature?
- The moat is the cross-community data flywheel — but it needs scale we don't have on day one. What's the interim moat, and how many communities before the flywheel bites?

**Regulatory (the one people forget)**
- Prioritizing which families to contact by budget/likelihood brushes up against **Fair Housing**. Budget-based ranking + "who to contact and why" needs a compliance read *before* the demo.
- **RealPage precedent (see §6):** the benchmarking / cross-community data flywheel is structurally the mechanism DOJ went after. Design principle: use a community's *own* data + public signals only — never pool competitors' nonpublic pricing.

**If forced to pick two for this week:** (1) the cannibalization math (does the SaaS fee beat displaced referral revenue), and (2) partner-vs-compete with APFM. Everything else is solvable; those two decide whether there's a business.

---

## 6. The RealPage landmine

Late 2025: DOJ settled with RealPage and forced it to stop using nonpublic, competitively sensitive competitor data to recommend pricing. Total settlements approaching ~$360M, with a 3-year monitor. Senior living is housing. The proposed "capacity benchmarking / cross-community data flywheel" is structurally the same mechanism DOJ targeted. The defensible design uses a community's own data plus public market signals only, and must not pool competitors' nonpublic pricing. This belongs in the briefing as a stated design principle, not a footnote.

---

## 7. Prompt for Fable — build the product briefing

```
You are a product strategist. Build a product briefing for a new AI product.

CONCEPT
"Stella for Facilities" — an AI revenue manager for senior-living communities. It helps
communities fill the RIGHT units, not just generate more leads. It sits on top of A Place
for Mom's (APFM) referral demand and turns open units + inbound families into higher occupancy.

WHY IT MATTERS FOR APFM
Today APFM is paid only on successful referrals (transactional, tied to conversion). This
product lets APFM charge facilities a recurring SaaS fee for occupancy forecasting, lead
prioritization, sales workflow automation, pricing/concession recommendations, and capacity
benchmarking — expanding APFM's TAM from a referral fee to a per-community software subscription.

HOW IT WORKS (prototype workflow)
1. Pull in facility capacity: open units by care type (assisted living, memory care, independent
   living), price, room type, availability date, and staffing/licensing constraints.
2. Analyze incoming demand: which APFM families fit each open unit, by urgency, budget, care
   needs, move-in likelihood, and expected time-to-move-in.
3. Recommend actions: prioritize best-fit leads, suggest pricing/concessions for hard-to-fill
   units, flag upcoming occupancy gaps, and tell sales teams exactly who to contact and why.

CORE DEMO
A community with three empty memory-care units. The agent says: "You are likely to miss
occupancy targets next month. Prioritize these five APFM families, offer a $1,500 move-in
credit to two of them, and pause assisted-living lead spend."

BUILD A BRIEFING WITH THESE SECTIONS
1. One-line positioning + elevator pitch
2. Problem: the demand/supply mismatch in senior living today (leads a community can't
   convert due to capacity, care-level, geography, or pricing) and what it costs operators
3. Target user & buyer: who inside the community uses it (sales/marketing director, ED)
   vs. who buys it, and ICP (community size/type where this has budget and pain)
4. Product: the three-step workflow above, expanded — inputs, the agent's decision logic,
   outputs, and where a human stays in the loop
5. Key use cases / demo scenarios (lead with the memory-care example above)
6. Value proposition & ROI: quantify the occupancy lift, revenue-per-available-unit, and
   marketing-spend efficiency a community should expect
7. Why this is strategic for APFM: the business-model shift from referral fee to recurring
   SaaS, and how it expands TAM and deepens the facility relationship
8. Data & AI: what data the agent needs, why it improves with more communities (the
   cross-community data flywheel), and what the defensible moat is over time
9. Competitive landscape: senior-living CRM/occupancy tools (Aline/Enquire/Sherpa, Prorize,
   Yardi, PointClickCare) — how this is differentiated and why it isn't just a feature they bolt on
10. Risks & open questions
11. MVP scope and rollout plan

REQUIREMENTS
- Software/SaaS product lens. Be concrete and opinionated; take positions, don't hedge.
- Where you assume a number (occupancy %, ACV, pricing), label it an assumption and show the logic.
- Concise, executive-ready prose. Tables for the competitive landscape and ROI.
- Distinguish clearly between what's given above and what you're inferring.
- Length: ~2-3 pages.
```

---

## Sources
- DOJ–RealPage settlement — https://www.propublica.org/article/doj-realpage-settlement-rental-price-fixing-case
- RealPage settlement terms / monitor (Mintz) — https://www.mintz.com/insights-center/viewpoints/2191/2025-12-01-last-years-rent-realpage-reaches-settlement-agreement
- Second batch of RealPage settlements, $218M (Multifamily Dive) — https://www.multifamilydive.com/news/realpage-settlement-algorithmic-pricing/820745/
- Enquire + Glennis + Sherpa → Aline; scale & AI (PR Newswire) — https://www.prnewswire.com/news-releases/enquire-glennis-solutions-and-sherpa-crm-join-forces-to-create-market-leading-senior-living-software-platform-301661438.html
- Aline CRM / Aline Intelligence — https://alineops.com/senior-living/crm-software/
- A Place for Mom model & network (Wikipedia) — https://en.wikipedia.org/wiki/A_Place_for_Mom
- APFM enters nursing home market, Nursinghomes.com (Senior Housing News) — https://seniorhousingnews.com/2023/09/06/a-place-for-mom-enters-nursing-home-market-with-new-online-platform/
- NIH-funded startup targeting senior-living referral/lead aggregation (Senior Housing News) — https://seniorhousingnews.com/2026/01/23/nih-funded-tech-startup-takes-aim-at-senior-living-referral-lead-aggregation/
- Senate probe of A Place for Mom (NBC News) — https://www.nbcnews.com/news/us-news/senate-announces-probe-place-for-mom-referral-service-rcna157282
- Prorize Senior Living Rent Optimizer — https://www.prorize.com/senior-living/
- Senior living operators exploring dynamic pricing (Senior Housing News) — https://seniorhousingnews.com/2025/04/08/senior-living-operators-explore-dynamic-pricing-models-to-boost-sales-flexibility/

---

*Inference vs. sourced: the layer taxonomy and the assignment of players to layers are my framework/inference; the RealPage settlement, Aline scale/AI, APFM model, Prorize, and referral-disruption/Senate items are sourced above. Verify Aline's exact feature set and the specific senior-living RM competitors before building competitive slides on them.*
