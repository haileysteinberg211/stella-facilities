import { computeRecommendations } from "../data/scoring.js";
import { t, chip, card, channelColor, intentChip } from "../theme.js";

const { families, scoredMatches, units } = computeRecommendations();

const intentLabel = { "deposit-ready": "Deposit ready", "tour-booked": "Tour booked", "inquiry": "Inquiry" };

// Shared pill chip — matches the style guide `.chipst` (tinted bg + darker text).
function Chip({ tone, dot, size = 12, children }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontFamily: t.sans, fontSize: size, fontWeight: 700,
      padding: "5px 12px", borderRadius: 999, whiteSpace: "nowrap",
      background: tone.bg, color: tone.fg,
    }}>
      {dot && <span style={{ width: 7, height: 7, borderRadius: "50%", background: tone.fg, display: "inline-block" }} />}
      {children}
    </span>
  );
}

// Channel origin chip — colored from the theme's on-brand channel map (never f.channelColor).
function ChannelChip({ channel }) {
  const color = channelColor[channel] || t.gray500;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontFamily: t.sans, fontSize: 11, fontWeight: 700,
      padding: "2px 9px", borderRadius: 999,
      background: color + "22", color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
      {channel}
    </span>
  );
}

// Fill-velocity style track (see style guide `.bar`): gray-100 rail, severity-colored fill.
function FitBar({ score }) {
  const barColor = score >= 80 ? t.success : score >= 60 ? t.warning : t.danger;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <span style={{ height: 8, width: 120, borderRadius: 999, background: t.gray100, overflow: "hidden", display: "inline-block", verticalAlign: "middle" }}>
        <span style={{ display: "block", height: "100%", width: `${score}%`, borderRadius: 999, background: barColor }} />
      </span>
      <span style={{ fontFamily: t.display, fontWeight: 600, fontSize: 15, color: t.navy, fontVariantNumeric: "tabular-nums", minWidth: 22, textAlign: "right" }}>{score}</span>
    </div>
  );
}

const headers = [
  { label: "#", align: "center", width: 48 },
  { label: "Family", align: "left" },
  { label: "Care need", align: "left" },
  { label: "Intent", align: "left" },
  { label: "Budget", align: "right" },
  { label: "Move-in", align: "right" },
  { label: "Best unit", align: "left" },
  { label: "Concession", align: "left" },
  { label: "Fit score", align: "right", width: 200 },
];

const cell = { padding: "15px 16px", borderBottom: `1px solid ${t.gray100}`, verticalAlign: "middle", textAlign: "left" };
const numCell = { ...cell, textAlign: "right" };

export default function LeadPipeline() {
  const familyBestMatch = {};
  for (const m of scoredMatches) {
    const prev = familyBestMatch[m.family.id];
    if (!prev || m.score > prev.score) familyBestMatch[m.family.id] = m;
  }

  const sorted = [...families].sort((a, b) => {
    const aMatch = familyBestMatch[a.id];
    const bMatch = familyBestMatch[b.id];
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    if (aMatch && bMatch) return bMatch.score - aMatch.score;
    return 0;
  });

  return (
    <div style={{ maxWidth: 1160, margin: "0 auto", padding: "28px 24px 48px", background: t.cream }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontFamily: t.display, fontWeight: 600, fontSize: 30, color: t.navy, margin: 0, lineHeight: 1.15 }}>Incoming Demand</h2>
          <p style={{ fontFamily: t.sans, fontSize: 15, color: t.gray500, margin: "6px 0 0" }}>{families.length} APFM families · ranked by best unit fit</p>
        </div>
        <Chip tone={chip.info}>Fit scores computed against open units only</Chip>
      </div>

      {/* Table */}
      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 920, borderCollapse: "collapse", fontFamily: t.sans, fontSize: 14 }}>
            <thead>
              <tr>
                {headers.map(h => (
                  <th key={h.label} style={{
                    textAlign: h.align, fontFamily: t.sans, fontSize: 12, fontWeight: 700,
                    color: t.gray700, letterSpacing: ".06em", textTransform: "uppercase",
                    padding: "13px 16px", background: t.cream, whiteSpace: "nowrap",
                    borderBottom: `1px solid ${t.gray100}`,
                    ...(h.width ? { width: h.width } : {}),
                  }}>{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((f, i) => {
                const best = familyBestMatch[f.id];
                const unit = best ? units.find(u => u.id === best.unit.id) : null;
                const noCapacity = !best;
                return (
                  <tr
                    key={f.id}
                    style={{ opacity: noCapacity ? 0.6 : 1, transition: "background 0.12s" }}
                    onMouseEnter={e => { if (!noCapacity) e.currentTarget.style.background = t.gray50; }}
                    onMouseLeave={e => { e.currentTarget.style.background = ""; }}
                  >
                    {/* Rank */}
                    <td style={{ ...cell, textAlign: "center" }}>
                      <span style={{
                        width: 26, height: 26, borderRadius: "50%", display: "inline-flex",
                        alignItems: "center", justifyContent: "center",
                        fontFamily: t.display, fontWeight: 600, fontSize: 13, fontVariantNumeric: "tabular-nums",
                        background: noCapacity ? t.gray100 : t.navyTint,
                        color: noCapacity ? t.gray500 : t.navy,
                      }}>{i + 1}</span>
                    </td>

                    {/* Family */}
                    <td style={cell}>
                      <div style={{ fontFamily: t.display, fontWeight: 600, fontSize: 16, color: t.navy, lineHeight: 1.2 }}>{f.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                        {f.channel && <ChannelChip channel={f.channel} />}
                        <span style={{ fontFamily: t.sans, fontSize: 12, color: t.gray500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260 }}>{f.notes}</span>
                      </div>
                    </td>

                    {/* Care need */}
                    <td style={cell}>
                      <span style={{ fontFamily: t.sans, fontSize: 14, color: t.ink }}>{f.careNeed}</span>
                    </td>

                    {/* Intent */}
                    <td style={cell}>
                      <Chip tone={intentChip[f.intent]} dot>{intentLabel[f.intent]}</Chip>
                    </td>

                    {/* Budget */}
                    <td style={numCell}>
                      <div style={{ fontFamily: t.display, fontWeight: 600, fontSize: 15, color: t.navy, fontVariantNumeric: "tabular-nums" }}>${f.monthlyBudget.toLocaleString()}</div>
                      {unit && (
                        <div style={{ fontFamily: t.sans, fontSize: 12, fontWeight: 600, marginTop: 3, color: f.monthlyBudget >= unit.monthlyPrice ? t.success : best?.isConcessionCandidate ? t.warning : t.danger }}>
                          {f.monthlyBudget >= unit.monthlyPrice ? "Fits list price" : `$${(unit.monthlyPrice - f.monthlyBudget).toLocaleString()} under`}
                        </div>
                      )}
                    </td>

                    {/* Move-in */}
                    <td style={numCell}>
                      <div style={{ fontFamily: t.display, fontWeight: 600, fontSize: 15, color: t.navy, fontVariantNumeric: "tabular-nums" }}>{f.urgencyDays}d</div>
                      <div style={{ fontFamily: t.sans, fontSize: 12, color: t.gray500, marginTop: 3, fontVariantNumeric: "tabular-nums" }}>{f.distanceMiles} mi</div>
                    </td>

                    {/* Best unit */}
                    <td style={cell}>
                      {unit ? (
                        <>
                          <div style={{ fontFamily: t.display, fontWeight: 600, fontSize: 15, color: t.navy }}>{unit.id}</div>
                          <div style={{ fontFamily: t.sans, fontSize: 12, color: t.gray500, marginTop: 3, fontVariantNumeric: "tabular-nums" }}>${unit.monthlyPrice.toLocaleString()}/mo</div>
                        </>
                      ) : (
                        <Chip tone={chip.danger} dot>Can&apos;t serve</Chip>
                      )}
                    </td>

                    {/* Concession */}
                    <td style={cell}>
                      {best?.isConcessionCandidate
                        ? <Chip tone={chip.warning} dot>Suggest credit</Chip>
                        : <span style={{ color: t.gray300 }}>—</span>}
                    </td>

                    {/* Fit score */}
                    <td style={numCell}>
                      {best ? <FitBar score={best.score} /> : <span style={{ color: t.gray300 }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer note */}
      <div style={{ ...card, borderLeft: `4px solid ${t.blue}`, padding: "16px 20px", marginTop: 18, fontFamily: t.sans, fontSize: 14, color: t.gray700, lineHeight: 1.6 }}>
        <span style={{ fontFamily: t.display, fontWeight: 600, color: t.navy }}>How fit scores work:</span>{" "}
        Stella scores each family against each compatible open unit across budget fit (40 pts), urgency (25 pts), intent signal (20 pts), and geography (15 pts). Families marked &ldquo;Can&apos;t serve&rdquo; have a care need with no open units — those leads should not receive spend.
      </div>
    </div>
  );
}
