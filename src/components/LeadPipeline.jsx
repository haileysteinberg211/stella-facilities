import { computeRecommendations } from "../data/scoring.js";

const { families, scoredMatches, units } = computeRecommendations();

const intentLabel = { "deposit-ready": "Deposit ready", "tour-booked": "Tour booked", "inquiry": "Inquiry" };

const intentStyle = {
  "deposit-ready": { background: "#0D2420", color: "#5BBFB5", border: "1px solid #5BBFB5" },
  "tour-booked":   { background: "#13143A", color: "#818CF8", border: "1px solid #6366F1" },
  "inquiry":       { background: "#161B27", color: "#8B8FA8", border: "1px solid #252B3B" },
};

function FitBar({ score }) {
  const barColor = score >= 80 ? "#5BBFB5" : score >= 60 ? "#C97B1A" : "#E05252";
  const hasGlow = score >= 80;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: "#252B3B", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${score}%`, background: barColor, borderRadius: 999, boxShadow: hasGlow ? "0 0 8px #5BBFB580" : "none" }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#E8E4DC", width: 24, textAlign: "right", fontFamily: "'Playfair Display', Georgia, serif" }}>{score}</span>
    </div>
  );
}

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
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#E8E4DC", fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", margin: 0 }}>Incoming Demand</h2>
          <p style={{ fontSize: 14, color: "#8B8FA8", marginTop: 4, marginBottom: 0, fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>{families.length} APFM families · ranked by best unit fit</p>
        </div>
        <div style={{ fontSize: 12, color: "#5BBFB5", background: "#161B27", border: "1px solid #5BBFB5", padding: "6px 14px", borderRadius: 999, fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>
          Fit scores computed against open units only
        </div>
      </div>

      <div style={{ background: "rgba(10, 14, 24, 0.88)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 860 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #252B3B", background: "#0D1117" }}>
              {["#", "Family", "Care need", "Intent", "Budget", "Move-in", "Best unit", "Concession", "Fit score"].map((h, idx) => (
                <th key={h} style={{
                  textAlign: "left", fontSize: 11, fontWeight: 600, color: "#8B8FA8",
                  padding: "10px 16px", letterSpacing: "0.05em", textTransform: "uppercase",
                  fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
                  ...(idx === 8 ? { width: 112 } : {}),
                }}>{h}</th>
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
                  style={{ borderBottom: "1px solid #252B3B", opacity: noCapacity ? 0.5 : 1, transition: "background 0.1s" }}
                  onMouseEnter={e => { if (!noCapacity) e.currentTarget.style.background = "#1E2535"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = ""; }}
                >
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%", fontSize: 11, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: noCapacity ? "#161B27" : "#5BBFB520",
                      color: noCapacity ? "#8B8FA8" : "#5BBFB5",
                    }}>
                      {i + 1}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 600, color: "#E8E4DC", fontFamily: "'Playfair Display', Georgia, serif" }}>{f.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      {f.channel && (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          fontSize: 10, fontWeight: 600, padding: "1px 6px",
                          borderRadius: 999, background: f.channelColor + "20",
                          color: f.channelColor, border: `1px solid ${f.channelColor}44`,
                          fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: f.channelColor, display: "inline-block" }} />
                          {f.channel}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: "#8B8FA8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200, fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>{f.notes}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 13, color: "#8B8FA8", fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>{f.careNeed}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 999, fontFamily: "'Inter', -apple-system, system-ui, sans-serif", ...intentStyle[f.intent] }}>
                      {intentLabel[f.intent]}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 600, color: "#E8E4DC", fontFamily: "'Playfair Display', Georgia, serif" }}>${f.monthlyBudget.toLocaleString()}</div>
                    {unit && (
                      <div style={{ fontSize: 11, marginTop: 2, color: f.monthlyBudget >= unit.monthlyPrice ? "#5BBFB5" : best?.isConcessionCandidate ? "#C97B1A" : "#E05252", fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>
                        {f.monthlyBudget >= unit.monthlyPrice ? "Fits list price" : `$${(unit.monthlyPrice - f.monthlyBudget).toLocaleString()} under`}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ color: "#E8E4DC", fontFamily: "'Playfair Display', Georgia, serif" }}>{f.urgencyDays}d</div>
                    <div style={{ fontSize: 11, color: "#8B8FA8", fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>{f.distanceMiles} mi</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {unit ? (
                      <div>
                        <div style={{ fontWeight: 600, color: "#E8E4DC", fontFamily: "'Playfair Display', Georgia, serif" }}>{unit.id}</div>
                        <div style={{ fontSize: 11, color: "#8B8FA8", fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>${unit.monthlyPrice.toLocaleString()}/mo</div>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#E05252", fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>No capacity</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {best?.isConcessionCandidate && (
                      <div style={{ fontSize: 11, color: "#C97B1A", marginBottom: 4, fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>💳 suggest credit</div>
                    )}
                    {best ? <FitBar score={best.score} /> : <span style={{ fontSize: 12, color: "#8B8FA8" }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {best?.isConcessionCandidate && (
                      <div style={{ fontSize: 11, color: "#C97B1A" }}>💳</div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ background: "#161B27", borderLeft: "3px solid #5BBFB5", border: "1px solid #252B3B", borderRadius: 16, padding: "16px 20px", fontSize: 14, color: "#8B8FA8", marginTop: 16, fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>
        <span style={{ fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", color: "#E8E4DC" }}>How fit scores work:</span>{" "}
        Stella scores each family against each compatible open unit across budget fit (40 pts), urgency (25 pts), intent signal (20 pts), and geography (15 pts). Families marked "No capacity" have a care need with no open units — those leads should not receive spend.
      </div>
    </div>
  );
}
