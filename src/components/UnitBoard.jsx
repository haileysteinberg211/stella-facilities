import { computeRecommendations } from "../data/scoring.js";
import { t, chip, card } from "../theme.js";

const { community, units, rankedByUnit } = computeRecommendations();

// Care-type color coding: Independent Living = Dove Blue, Assisted Living =
// Nile navy, Memory Care = sage. Each drives a top accent bar + care-type chip.
const careStyle = {
  "Independent Living": { accent: t.blue, chipBg: "#EAF1F6", chipFg: "#37576B" },
  "Assisted Living":    { accent: t.navy, chipBg: t.navyTint, chipFg: t.navy },
  "Memory Care":        { accent: t.sage, chipBg: "#E7F0EB", chipFg: "#2E6B50" },
};

const ct = community.careTypes;
const occupancySummary = [
  { label: "Independent Living", occupied: ct.independentLiving.occupied, total: ct.independentLiving.total },
  { label: "Assisted Living",    occupied: ct.assistedLiving.occupied,    total: ct.assistedLiving.total },
  { label: "Memory Care",        occupied: ct.memoryCare.occupied,        total: ct.memoryCare.total },
];

// Fit-score chip: strong fit = success, moderate = warning, softer = info.
function fitChip(score) {
  if (score >= 80) return chip.success;
  if (score >= 60) return chip.warning;
  return chip.info;
}

// Availability status derived from existing unit fields (presentation only).
function unitStatus(unit, hasLeads) {
  if (unit.daysVacant === 0) return { ...chip.info, label: "Upcoming" };
  if (unit.daysVacant > 30)  return { ...chip.warning, label: "Filling slowly" };
  if (hasLeads)              return { ...chip.success, label: "Matched" };
  return { ...chip.info, label: "Open" };
}

const labelStyle = {
  fontFamily: t.sans,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: t.gray500,
};

const chipBase = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "4px 11px",
  borderRadius: 999,
  fontFamily: t.sans,
  fontSize: 12,
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const sectionHeading = {
  fontFamily: t.display,
  fontWeight: 600,
  fontSize: 20,
  color: t.navy,
  margin: "0 0 14px",
};

export default function UnitBoard() {
  return (
    <div style={{ background: t.cream, fontFamily: t.sans, color: t.ink }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 24px" }}>

        {/* Page heading */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ ...labelStyle, color: t.coral, marginBottom: 8 }}>Unit board</div>
          <h2 style={{ fontFamily: t.display, fontWeight: 600, fontSize: 30, lineHeight: 1.15, color: t.navy, margin: 0 }}>
            {community.name}
          </h2>
          <p style={{ fontFamily: t.sans, fontSize: 15, color: t.gray500, margin: "6px 0 0" }}>
            {units.length} open or upcoming units · {community.location}
          </p>
        </div>

        {/* Occupancy by care type */}
        <h3 style={sectionHeading}>Occupancy by care type</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16, marginBottom: 36 }}>
          {occupancySummary.map((c) => {
            const pct = c.occupied / c.total;
            const open = c.total - c.occupied;
            const isFull = open <= 0;
            // Open capacity = revenue at risk → highlight with danger; full = success.
            const status = isFull ? chip.success : chip.danger;
            const barColor = isFull ? t.success : t.danger;
            const accent = careStyle[c.label]?.accent ?? t.navy;
            return (
              <div key={c.label} style={{ ...card, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
                  <span style={{ ...labelStyle, display: "inline-flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: accent, display: "inline-block", flexShrink: 0 }} />
                    {c.label}
                  </span>
                  <span style={{ ...chipBase, background: status.bg, color: status.fg }}>
                    {isFull ? "Full" : `${open} open`}
                  </span>
                </div>
                <div style={{ fontFamily: t.display, fontWeight: 600, fontSize: 34, lineHeight: 1.1, color: t.navy, fontVariantNumeric: "tabular-nums" }}>
                  {(pct * 100).toFixed(0)}%
                </div>
                <div style={{ fontFamily: t.sans, fontSize: 13, color: t.gray500, margin: "4px 0 12px" }}>
                  {c.occupied} / {c.total} units occupied
                </div>
                <div style={{ height: 6, background: t.gray100, borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct * 100}%`, background: barColor, borderRadius: 999 }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Open unit cards */}
        <h3 style={sectionHeading}>Open units</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
          {units.map((unit) => {
            const cs = careStyle[unit.careType] ?? careStyle["Memory Care"];
            const ranked = rankedByUnit[unit.id] ?? [];
            const top = ranked.slice(0, 2);
            const status = unitStatus(unit, top.length > 0);
            return (
              <div key={unit.id} style={{ ...card, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {/* Care-type accent bar */}
                <div style={{ height: 4, background: cs.accent, flexShrink: 0 }} />

                <div style={{ padding: "16px 18px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
                    <span style={{ ...chipBase, background: cs.chipBg, color: cs.chipFg }}>{unit.careType}</span>
                    <span style={{ ...chipBase, background: status.bg, color: status.fg }}>{status.label}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontFamily: t.sans, fontSize: 15, fontWeight: 700, color: t.navy }}>{unit.id}</span>
                    <span style={{ fontFamily: t.sans, fontSize: 13, color: t.gray500 }}>{unit.room}</span>
                  </div>
                  <div style={{ fontFamily: t.sans, fontSize: 12, color: t.gray500, marginTop: 2 }}>
                    Available {unit.availableFrom}
                  </div>

                  <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{ fontFamily: t.display, fontWeight: 600, fontSize: 26, color: t.navy, fontVariantNumeric: "tabular-nums" }}>
                      ${unit.monthlyPrice.toLocaleString()}
                    </span>
                    <span style={{ fontFamily: t.sans, fontSize: 13, color: t.gray500 }}>/mo</span>
                  </div>
                </div>

                <div style={{ height: 1, background: t.gray100 }} />

                <div style={{ padding: "14px 18px 16px", flex: 1 }}>
                  {unit.daysVacant > 0 && (
                    <div style={{ fontFamily: t.sans, fontSize: 12, color: t.gray500, marginBottom: 12 }}>
                      Vacant <span style={{ fontWeight: 700, color: t.danger }}>{unit.daysVacant} days</span>
                      <span style={{ color: t.gray300, margin: "0 6px" }}>·</span>
                      <span>{unit.notes}</span>
                    </div>
                  )}

                  {top.length > 0 ? (
                    <>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
                        <span style={labelStyle}>Best-fit leads</span>
                        <span style={{ ...chipBase, background: chip.success.bg, color: chip.success.fg, fontSize: 11, padding: "3px 9px" }}>
                          {top.length} matched
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {top.map((m) => {
                          const fc = fitChip(m.score);
                          return (
                            <div key={m.family.id} style={{ background: t.gray50, border: `1px solid ${t.gray100}`, borderRadius: t.radiusSm, padding: "9px 11px" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                <span style={{ fontFamily: t.sans, fontSize: 13, fontWeight: 600, color: t.navy, lineHeight: 1.25 }}>{m.family.name}</span>
                                <span style={{ ...chipBase, background: fc.bg, color: fc.fg, fontSize: 11, padding: "3px 9px", flexShrink: 0 }}>{m.score} fit</span>
                              </div>
                              <div style={{ fontFamily: t.sans, fontSize: 12, color: t.gray500, marginTop: 3 }}>
                                {m.family.intent.replace("-", " ")} · ${m.family.monthlyBudget.toLocaleString()}/mo · {m.family.urgencyDays}d
                              </div>
                              {m.isConcessionCandidate && (
                                <span style={{ ...chipBase, background: chip.warning.bg, color: chip.warning.fg, fontSize: 11, padding: "3px 9px", marginTop: 6 }}>
                                  ${m.budgetGap} gap · suggest credit
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontFamily: t.sans, fontSize: 12, color: t.gray500 }}>No matched leads in pipeline</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
