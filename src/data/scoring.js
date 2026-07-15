import data from "./data.json";

const INTENT_WEIGHT = { "deposit-ready": 1.0, "tour-booked": 0.75, "inquiry": 0.4 };
const MAX_DISTANCE = 25;
const CONCESSION_THRESHOLD = 0.10; // within 10% under price = concession candidate

function fitScore(family, unit) {
  // Hard filter: care type must match
  if (family.careNeed !== unit.careType) return null;

  // 1. Budget fit (40 pts)
  const ratio = family.monthlyBudget / unit.monthlyPrice;
  let budgetScore;
  if (ratio >= 1) {
    budgetScore = 40;
  } else if (ratio >= (1 - CONCESSION_THRESHOLD)) {
    budgetScore = 30; // concession candidate
  } else {
    budgetScore = Math.max(0, 40 * (ratio - 0.7) / 0.3); // steep falloff below 90%
  }

  // 2. Urgency (25 pts) — sooner is better
  const urgencyScore = Math.max(0, 25 * (1 - family.urgencyDays / 90));

  // 3. Intent (20 pts)
  const intentScore = 20 * (INTENT_WEIGHT[family.intent] ?? 0.4);

  // 4. Geography (15 pts)
  const geoScore = Math.max(0, 15 * (1 - family.distanceMiles / MAX_DISTANCE));

  const total = Math.round(budgetScore + urgencyScore + intentScore + geoScore);
  const isConcessionCandidate =
    family.monthlyBudget < unit.monthlyPrice &&
    family.monthlyBudget >= unit.monthlyPrice * (1 - CONCESSION_THRESHOLD);

  return { score: total, isConcessionCandidate, budgetGap: unit.monthlyPrice - family.monthlyBudget };
}

export function computeRecommendations() {
  const { community, units, families } = data;

  // Score every family against every compatible unit
  const scoredMatches = [];
  for (const family of families) {
    for (const unit of units) {
      const result = fitScore(family, unit);
      if (result !== null) {
        scoredMatches.push({ family, unit, ...result });
      }
    }
  }

  // For each open unit, get ranked families
  const openUnits = units.filter(u => u.daysVacant >= 0 && u.id !== "AL-12");
  const rankedByUnit = {};
  for (const unit of openUnits) {
    rankedByUnit[unit.id] = scoredMatches
      .filter(m => m.unit.id === unit.id)
      .sort((a, b) => b.score - a.score);
  }

  // Top-5 MC families (hero screen)
  const mcMatches = scoredMatches
    .filter(m => m.unit.careType === "Memory Care")
    .sort((a, b) => b.score - a.score);

  const seen = new Set();
  const top5MC = [];
  for (const m of mcMatches) {
    if (!seen.has(m.family.id) && top5MC.length < 5) {
      seen.add(m.family.id);
      top5MC.push(m);
    }
  }

  // Concession targets within top-5
  const concessionTargets = top5MC.filter(m => m.isConcessionCandidate);
  const suggestedCredit = concessionTargets.length > 0
    ? Math.max(...concessionTargets.map(m => Math.ceil(m.budgetGap / 250) * 250))
    : 0;

  // Occupancy gap alert
  const mcOpen = units.filter(u => u.careType === "Memory Care" && u.daysVacant >= 0).length;
  // Only deposit-ready counts as a confirmed move-in; tour-booked = probable but not locked
  const mcConfirmed = top5MC.filter(m => m.family.intent === "deposit-ready").length;
  const mcProbable = top5MC.filter(m => m.family.intent === "tour-booked").length;
  const projectedMCMoveIns = Math.min(mcConfirmed + Math.floor(mcProbable * 0.5), mcOpen - 1);
  const occupancyGap = mcOpen - projectedMCMoveIns;

  // Pause-spend care types (full but still receiving leads)
  const fullCareTypes = ["Assisted Living"]; // AL is full per community data
  const inboundForFull = families.filter(f => fullCareTypes.includes(f.careNeed));

  // Overall occupancy
  const { independentLiving: il, assistedLiving: al, memoryCare: mc } = community.careTypes;
  const totalOccupied = il.occupied + al.occupied + mc.occupied;
  const totalUnits = il.total + al.total + mc.total;
  const currentOccupancy = totalOccupied / totalUnits;

  return {
    community,
    units,
    families,
    openUnits,
    top5MC,
    concessionTargets,
    suggestedCredit,
    rankedByUnit,
    occupancyGap,
    projectedMCMoveIns,
    mcOpen,
    inboundForFull,
    fullCareTypes,
    currentOccupancy,
    totalOccupied,
    totalUnits,
    scoredMatches,
  };
}
