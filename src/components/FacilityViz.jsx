import { useState } from "react";
import { computeRecommendations } from "../data/scoring.js";
import { t, chip, card } from "../theme.js";

const { families } = computeRecommendations();

// ── Unit map data ──────────────────────────────────────────────────────────────
// Which MC units have matched leads?
const mcLeadMatch = { "MC-101": "Helen M.", "MC-204": "Dorothy K.", "MC-310": "Eleanor V." };

const UNIT_MAP = [
  // Independent Living — 18 units, IL-05 is open (transferring to AL)
  ...Array.from({ length: 18 }, (_, i) => ({
    id: `IL-${String(i + 1).padStart(2, "0")}`,
    wing: "IL", price: 3800,
    status: i === 4 ? "open" : "occupied",
  })),
  // Assisted Living — 14 units, AL-12 future vacancy
  ...Array.from({ length: 14 }, (_, i) => ({
    id: `AL-${String(i + 1).padStart(2, "0")}`,
    wing: "AL", price: 5600,
    status: i === 11 ? "future" : "occupied",
  })),
  // Memory Care — 10 units, first 3 are open
  ...Array.from({ length: 10 }, (_, i) => {
    const ids = ["MC-101","MC-204","MC-310","MC-401","MC-402","MC-403","MC-501","MC-502","MC-503","MC-504"];
    const prices = [6800,5200,7400,6200,6500,5800,6000,6300,6600,7000];
    return {
      id: ids[i], wing: "MC", price: prices[i],
      status: i < 3 ? "open" : "occupied",
      matchedLead: mcLeadMatch[ids[i]] || null,
    };
  }),
];

// ── Forecast data ──────────────────────────────────────────────────────────────
const MONTHS = ["Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul"];

const SCENARIOS = {
  baseline: {
    label: "No action", color: t.danger,
    occ:  [92.9, 90.5, 88.1, 85.7, 83.3, 80.9, 79.5, 79.5, 79.5, 79.5, 79.5, 79.5],
    rev:  [243,  237,  230,  224,  218,  212,  208,  208,  208,  208,  208,  208],
  },
  stella: {
    label: "With Stella", color: t.success,
    occ:  [92.9, 95.2, 97.6, 97.6, 97.6, 97.6, 97.6, 97.6, 97.6, 97.6, 97.6, 97.6],
    rev:  [243,  250,  257,  257,  257,  257,  257,  257,  257,  257,  257,  257],
  },
  aggressive: {
    label: "Aggressive (concessions)", color: t.warning,
    occ:  [92.9, 97.6, 100,  100,  100,  100,  100,  100,  100,  100,  100,  100],
    rev:  [243,  252,  260,  263,  263,  263,  263,  263,  263,  263,  263,  263],
  },
};

// ── Colors ─────────────────────────────────────────────────────────────────────
// Occupied units colored by care type (APFM data-viz family).
const WING_COLOR = {
  IL: t.blue,   // Independent Living — Dove Blue
  AL: t.navy,   // Assisted Living — Nile Blue
  MC: t.sage,   // Memory Care — Sage
};

// ── SVG path helper ────────────────────────────────────────────────────────────
function toPath(values, W, H, minV, maxV) {
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - ((v - minV) / (maxV - minV)) * H;
    return [x, y];
  });
  return pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
}
function toArea(values, W, H, minV, maxV) {
  return toPath(values, W, H, minV, maxV) + ` L${W},${H} L0,${H} Z`;
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function FacilityViz() {
  const [wingFilter, setWingFilter] = useState("all");
  const [metric, setMetric] = useState("occ"); // occ | rev
  const [activeScenarios, setActiveScenarios] = useState(["baseline", "stella"]);
  const [hoverIdx, setHoverIdx] = useState(null);

  // Shared card surface: white on cream, soft warm shadow, hairline border.
  const surface = { ...card, padding: 0, overflow: "hidden" };
  const sectionTitle = { fontSize: 15, fontWeight: 600, color: t.navy, fontFamily: t.display };
  const sublabel = { fontSize: 11, color: t.gray500, marginTop: 2, fontFamily: t.sans };

  const visibleUnits = wingFilter === "all" ? UNIT_MAP : UNIT_MAP.filter(u => u.wing === wingFilter);

  // Group by wing for display
  const wings = wingFilter === "all" ? ["IL","AL","MC"] : [wingFilter];

  function toggleScenario(key) {
    setActiveScenarios(prev =>
      prev.includes(key) ? (prev.length > 1 ? prev.filter(k => k !== key) : prev) : [...prev, key]
    );
  }

  // Chart dimensions
  const CW = 560, CH = 140, PAD = 8;
  const metricValues = Object.entries(SCENARIOS).filter(([k]) => activeScenarios.includes(k));
  const allVals = metricValues.flatMap(([, s]) => s[metric]);
  const minV = Math.floor(Math.min(...allVals) - 4);
  const maxV = Math.ceil(Math.max(...allVals) + 2);

  // Counts
  const totalUnits = UNIT_MAP.length;
  const openUnits = UNIT_MAP.filter(u => u.status === "open").length;
  const mcOpen = UNIT_MAP.filter(u => u.wing === "MC" && u.status === "open").length;
  const matched = UNIT_MAP.filter(u => u.matchedLead).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Unit Map ── */}
      <div style={surface}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${t.gray100}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={sectionTitle}>Facility map</div>
            <div style={sublabel}>
              {totalUnits} units · <span style={{ color: t.danger, fontWeight: 700 }}>{openUnits} open</span> · <span style={{ color: t.success, fontWeight: 700 }}>{matched} leads matched</span>
            </div>
          </div>
          {/* Wing filter */}
          <div style={{ display: "flex", gap: 5 }}>
            {["all","IL","AL","MC"].map(w => (
              <button key={w} onClick={() => setWingFilter(w)} style={{
                fontSize: 11, fontWeight: 600, fontFamily: t.sans, padding: "4px 12px", borderRadius: 999, border: "none", cursor: "pointer",
                background: wingFilter === w ? t.navy : t.gray100,
                color: wingFilter === w ? t.white : t.gray700,
                transition: "all 0.15s",
              }}>{w === "all" ? "All" : w}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
          {wings.map(wing => {
            const wUnits = UNIT_MAP.filter(u => u.wing === wing);
            const wingOcc = WING_COLOR[wing];
            const wingLabels = { IL: "Independent Living", AL: "Assisted Living", MC: "Memory Care" };
            return (
              <div key={wing}>
                <div style={{ fontSize: 11, fontWeight: 700, color: t.gray500, fontFamily: t.sans, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                  {wingLabels[wing]} · {wUnits.filter(u => u.status === "occupied").length}/{wUnits.length} occupied
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {wUnits.map(unit => {
                    const isOpen = unit.status === "open";
                    const isFuture = unit.status === "future";
                    const isMatched = !!unit.matchedLead;
                    let bg = wingOcc;
                    let ring = "none";
                    let title = unit.id;
                    let opacity = 1;
                    if (isOpen && isMatched) { bg = t.success; ring = `0 0 0 3px ${t.success}33`; title = `${unit.id} → ${unit.matchedLead}`; }
                    else if (isOpen) { bg = t.danger; ring = `0 0 0 3px ${t.danger}33`; }
                    else if (isFuture) { bg = t.warning; opacity = 0.5; }

                    return (
                      <div
                        key={unit.id}
                        title={title + ` · $${unit.price.toLocaleString()}/mo`}
                        style={{
                          width: 36, height: 36, borderRadius: t.radiusSm,
                          background: bg,
                          border: "2px solid transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 9, fontWeight: 700, fontFamily: t.sans,
                          color: t.white,
                          cursor: "default",
                          position: "relative",
                          boxShadow: ring,
                          opacity,
                          transition: "transform 0.1s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.15)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      >
                        {unit.id.replace(/[A-Z]+-0*/,"")}
                        {isMatched && (
                          <div style={{ position: "absolute", top: -4, right: -4, width: 10, height: 10, borderRadius: "50%", background: t.success, border: "2px solid white" }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Legend */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", paddingTop: 10, borderTop: `1px solid ${t.gray100}` }}>
            {[
              { color: t.blue, label: "Independent Living" },
              { color: t.navy, label: "Assisted Living" },
              { color: t.sage, label: "Memory Care" },
              { color: t.danger, label: "Open — no lead", ring: true },
              { color: t.success, label: "Open — lead matched", dot: true },
              { color: t.warning, label: "Future vacancy", opacity: 0.5 },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: t.gray700, fontFamily: t.sans }}>
                <div style={{
                  position: "relative", width: 12, height: 12, borderRadius: 3, background: l.color,
                  opacity: l.opacity || 1,
                  boxShadow: l.ring ? `0 0 0 3px ${t.danger}33` : "none",
                }}>
                  {l.dot && <div style={{ position: "absolute", top: -3, right: -3, width: 6, height: 6, borderRadius: "50%", background: t.success, border: "1.5px solid white" }} />}
                </div>
                {l.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 12-month Forecast ── */}
      <div style={surface}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${t.gray100}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={sectionTitle}>12-month forecast</div>
            <div style={sublabel}>Aug 2026 — Jul 2027 · Maplewood Senior Living</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {/* Metric toggle */}
            <div style={{ display: "flex", gap: 4, background: t.gray100, borderRadius: 999, padding: 3 }}>
              {[["occ","Occupancy %"],["rev","Revenue $K"]].map(([k,lbl]) => (
                <button key={k} onClick={() => setMetric(k)} style={{
                  fontSize: 11, fontWeight: 600, fontFamily: t.sans, padding: "4px 12px", borderRadius: 999, border: "none", cursor: "pointer",
                  background: metric === k ? t.navy : "transparent",
                  color: metric === k ? t.white : t.gray700,
                  transition: "all 0.15s",
                }}>{lbl}</button>
              ))}
            </div>
            {/* Scenario toggles */}
            {Object.entries(SCENARIOS).map(([key, s]) => {
              const on = activeScenarios.includes(key);
              return (
                <button key={key} onClick={() => toggleScenario(key)} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  fontSize: 11, fontWeight: 600, fontFamily: t.sans, padding: "4px 12px", borderRadius: 999,
                  border: `1.5px solid ${on ? s.color : t.gray300}`,
                  background: on ? s.color + "1E" : "transparent",
                  color: on ? s.color : t.gray500,
                  cursor: "pointer", transition: "all 0.15s",
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: on ? s.color : t.gray300, display: "inline-block" }} />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ padding: "18px 18px 14px", overflowX: "auto" }}>
          <div style={{ position: "relative", minWidth: 520 }}>
            {/* Y-axis labels */}
            <div style={{ position: "absolute", left: 0, top: PAD, bottom: 28, width: 36, display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none" }}>
              {[maxV, Math.round((maxV+minV)/2), minV].map(v => (
                <span key={v} style={{ fontSize: 10, color: t.gray500, fontFamily: t.sans, textAlign: "right", display: "block" }}>
                  {metric === "occ" ? `${v}%` : `$${v}K`}
                </span>
              ))}
            </div>

            {/* Chart area */}
            <div style={{ marginLeft: 42, position: "relative" }}>
              <svg
                viewBox={`0 0 ${CW} ${CH + PAD * 2}`}
                style={{ width: "100%", height: CH + PAD * 2, overflow: "visible" }}
                onMouseLeave={() => setHoverIdx(null)}
              >
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(g => {
                  const y = PAD + g * CH;
                  return <line key={g} x1={0} y1={y} x2={CW} y2={y} stroke={t.gray100} strokeWidth={1} />;
                })}

                {/* Scenario paths */}
                {metricValues.map(([key, s]) => {
                  const path = toPath(s[metric], CW, CH, minV, maxV);
                  const area = toArea(s[metric], CW, CH, minV, maxV);
                  const translate = `translate(0, ${PAD})`;
                  return (
                    <g key={key} transform={translate}>
                      <path d={area} fill={s.color} fillOpacity={0.08} />
                      <path d={path} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                      {s[metric].map((v, i) => {
                        const x = (i / (MONTHS.length - 1)) * CW;
                        const y = CH - ((v - minV) / (maxV - minV)) * CH;
                        return (
                          <circle key={i} cx={x} cy={y} r={hoverIdx === i ? 5 : 3.5}
                            fill={s.color} stroke="white" strokeWidth={1.5}
                            style={{ transition: "r 0.1s" }} />
                        );
                      })}
                    </g>
                  );
                })}

                {/* Hover scrubber */}
                {hoverIdx !== null && (
                  <line
                    x1={(hoverIdx / (MONTHS.length - 1)) * CW}
                    y1={PAD}
                    x2={(hoverIdx / (MONTHS.length - 1)) * CW}
                    y2={PAD + CH}
                    stroke={t.navy} strokeWidth={1} strokeDasharray="3,3"
                  />
                )}

                {/* Invisible hover targets */}
                {MONTHS.map((_, i) => {
                  const x = (i / (MONTHS.length - 1)) * CW;
                  return (
                    <rect key={i} x={x - CW / MONTHS.length / 2} y={0} width={CW / MONTHS.length} height={CH + PAD * 2}
                      fill="transparent" onMouseEnter={() => setHoverIdx(i)} />
                  );
                })}
              </svg>

              {/* Tooltip */}
              {hoverIdx !== null && (
                <div style={{
                  position: "absolute",
                  top: PAD,
                  left: Math.min((hoverIdx / (MONTHS.length - 1)) * 100 + 2, 68) + "%",
                  background: t.navy,
                  borderRadius: t.radiusSm, padding: "8px 12px",
                  pointerEvents: "none", zIndex: 10,
                  boxShadow: t.shadow,
                  minWidth: 130,
                  fontFamily: t.sans,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.navyTint, marginBottom: 5 }}>{MONTHS[hoverIdx]} 2026</div>
                  {metricValues.map(([key, s]) => (
                    <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, display: "inline-block" }} />
                        <span style={{ fontSize: 11, color: t.gray300 }}>{s.label}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: t.white, fontVariantNumeric: "tabular-nums" }}>
                        {metric === "occ" ? `${s[metric][hoverIdx]}%` : `$${s[metric][hoverIdx]}K`}
                      </span>
                    </div>
                  ))}
                  {activeScenarios.includes("baseline") && activeScenarios.includes("stella") && (
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", marginTop: 5, paddingTop: 5, fontSize: 11, color: t.success, fontWeight: 700 }}>
                      Gap: {metric === "occ"
                        ? `+${(SCENARIOS.stella[metric][hoverIdx] - SCENARIOS.baseline[metric][hoverIdx]).toFixed(1)}%`
                        : `+$${SCENARIOS.stella[metric][hoverIdx] - SCENARIOS.baseline[metric][hoverIdx]}K`}
                    </div>
                  )}
                </div>
              )}

              {/* X-axis */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                {MONTHS.map(m => (
                  <span key={m} style={{ fontSize: 10, color: t.gray500, fontFamily: t.sans, textAlign: "center", flex: 1 }}>{m}</span>
                ))}
              </div>
            </div>

            {/* Delta callout */}
            {activeScenarios.includes("baseline") && activeScenarios.includes("stella") && (
              <div style={{ marginLeft: 42, marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div style={{ background: chip.success.bg, border: `1px solid ${t.gray100}`, borderRadius: t.radius, padding: "8px 14px", flex: 1, minWidth: 140 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: t.gray500, fontFamily: t.sans, textTransform: "uppercase", letterSpacing: "0.06em" }}>12-mo revenue uplift</div>
                  <div style={{ fontSize: 20, fontWeight: 600, color: t.success, fontFamily: t.display, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>
                    +${(SCENARIOS.stella.rev.reduce((a,b)=>a+b,0) - SCENARIOS.baseline.rev.reduce((a,b)=>a+b,0)).toLocaleString()}K
                  </div>
                </div>
                <div style={{ background: chip.warning.bg, border: `1px solid ${t.gray100}`, borderRadius: t.radius, padding: "8px 14px", flex: 1, minWidth: 140 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: t.gray500, fontFamily: t.sans, textTransform: "uppercase", letterSpacing: "0.06em" }}>Occ. gap closed</div>
                  <div style={{ fontSize: 20, fontWeight: 600, color: chip.warning.fg, fontFamily: t.display, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>
                    {(SCENARIOS.stella.occ[11] - SCENARIOS.baseline.occ[11]).toFixed(1)}pp
                  </div>
                </div>
                <div style={{ background: t.navyTint, border: `1px solid ${t.gray100}`, borderRadius: t.radius, padding: "8px 14px", flex: 1, minWidth: 140 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: t.gray500, fontFamily: t.sans, textTransform: "uppercase", letterSpacing: "0.06em" }}>Avg occ. uplift</div>
                  <div style={{ fontSize: 20, fontWeight: 600, color: t.navy, fontFamily: t.display, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>
                    +{(SCENARIOS.stella.occ.reduce((a,b)=>a+b,0)/12 - SCENARIOS.baseline.occ.reduce((a,b)=>a+b,0)/12).toFixed(1)}pp
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
