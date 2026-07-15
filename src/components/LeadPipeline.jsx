import { computeRecommendations } from "../data/scoring.js";

const { families, scoredMatches, units } = computeRecommendations();

const intentLabel = { "deposit-ready": "Deposit ready", "tour-booked": "Tour booked", "inquiry": "Inquiry" };
const intentColor = {
  "deposit-ready": "bg-green-50 text-green-700 border-green-200",
  "tour-booked":   "bg-violet-50 text-violet-700 border-violet-200",
  "inquiry":       "bg-gray-100 text-gray-600 border-gray-200",
};

const intentStyle = {
  "deposit-ready": { background: "#F0FAF9", color: "#2a7d75", border: "1px solid #5BBFB5" },
  "tour-booked":   { background: "#EEF0FB", color: "#4A52C8", border: "1px solid #b0b5e8" },
  "inquiry":       { background: "#F5F1EB", color: "#7A7A8C", border: "1px solid #E8E4DC" },
};

function FitBar({ score }) {
  const barColor = score >= 80 ? "#5BBFB5" : score >= 60 ? "#C97B1A" : "#B23A48";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: "#F5F1EB", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${score}%`, background: barColor, borderRadius: 999 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#1C1C2E", width: 24, textAlign: "right", fontFamily: "Georgia, 'Times New Roman', serif" }}>{score}</span>
    </div>
  );
}

export default function LeadPipeline() {
  // For each family, find their best match across all units
  const familyBestMatch = {};
  for (const m of scoredMatches) {
    const prev = familyBestMatch[m.family.id];
    if (!prev || m.score > prev.score) familyBestMatch[m.family.id] = m;
  }

  // Sort: MC families with matches first (by score), then others
  const sorted = [...families].sort((a, b) => {
    const aMatch = familyBestMatch[a.id];
    const bMatch = familyBestMatch[b.id];
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    if (aMatch && bMatch) return bMatch.score - aMatch.score;
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1C1C2E", fontFamily: "Georgia, 'Times New Roman', serif", margin: 0 }}>Incoming Demand</h2>
          <p style={{ fontSize: 14, color: "#7A7A8C", marginTop: 4, marginBottom: 0 }}>{families.length} APFM families · ranked by best unit fit</p>
        </div>
        <div style={{ fontSize: 12, color: "#7A7A8C", background: "#F0FAF9", border: "1px solid #5BBFB5", padding: "6px 14px", borderRadius: 999 }}>
          Fit scores computed against open units only
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #E8E4DC", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr style={{ borderBottom: "1px solid #E8E4DC", background: "#F5F1EB" }}>
              <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "#7A7A8C", padding: "10px 16px", letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "Georgia, 'Times New Roman', serif" }}>#</th>
              <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "#7A7A8C", padding: "10px 16px", letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "Georgia, 'Times New Roman', serif" }}>Family</th>
              <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "#7A7A8C", padding: "10px 16px", letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "Georgia, 'Times New Roman', serif" }}>Care need</th>
              <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "#7A7A8C", padding: "10px 16px", letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "Georgia, 'Times New Roman', serif" }}>Intent</th>
              <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "#7A7A8C", padding: "10px 16px", letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "Georgia, 'Times New Roman', serif" }}>Budget</th>
              <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "#7A7A8C", padding: "10px 16px", letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "Georgia, 'Times New Roman', serif" }}>Move-in</th>
              <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "#7A7A8C", padding: "10px 16px", letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "Georgia, 'Times New Roman', serif" }}>Best unit</th>
              <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "#7A7A8C", padding: "10px 16px", letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "Georgia, 'Times New Roman', serif" }}>Concession</th>
              <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "#7A7A8C", padding: "10px 16px", letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "Georgia, 'Times New Roman', serif", width: 112 }}>Fit score</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((f, i) => {
              const best = familyBestMatch[f.id];
              const unit = best ? units.find(u => u.id === best.unit.id) : null;
              const noCapacity = !best;
              return (
                <tr key={f.id} style={{ borderBottom: "1px solid #E8E4DC", opacity: noCapacity ? 0.5 : 1, transition: "background 0.1s" }}
                  onMouseEnter={e => { if (!noCapacity) e.currentTarget.style.background = "#FAF8F4"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = ""; }}
                >
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%", fontSize: 11, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: noCapacity ? "#F5F1EB" : "#E8F8F7",
                      color: noCapacity ? "#7A7A8C" : "#2a7d75",
                    }}>
                      {i + 1}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 600, color: "#1C1C2E", fontFamily: "Georgia, 'Times New Roman', serif" }}>{f.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      {f.channel && (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          fontSize: 10, fontWeight: 600, padding: "1px 6px",
                          borderRadius: 999, background: f.channelColor + "18",
                          color: f.channelColor, border: `1px solid ${f.channelColor}44`,
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: f.channelColor, display: "inline-block" }} />
                          {f.channel}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: "#7A7A8C", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{f.notes}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 13, color: "#3D3D4E" }}>{f.careNeed}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 999, ...intentStyle[f.intent] }}>
                      {intentLabel[f.intent]}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 600, color: "#1C1C2E", fontFamily: "Georgia, 'Times New Roman', serif" }}>${f.monthlyBudget.toLocaleString()}</div>
                    {unit && (
                      <div style={{ fontSize: 11, marginTop: 2, color: f.monthlyBudget >= unit.monthlyPrice ? "#2a7d75" : best?.isConcessionCandidate ? "#C97B1A" : "#B23A48" }}>
                        {f.monthlyBudget >= unit.monthlyPrice ? "Fits list price" : `$${(unit.monthlyPrice - f.monthlyBudget).toLocaleString()} under`}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ color: "#1C1C2E", fontFamily: "Georgia, 'Times New Roman', serif" }}>{f.urgencyDays}d</div>
                    <div style={{ fontSize: 11, color: "#7A7A8C" }}>{f.distanceMiles} mi</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {unit ? (
                      <div>
                        <div style={{ fontWeight: 600, color: "#1C1C2E", fontFamily: "Georgia, 'Times New Roman', serif" }}>{unit.id}</div>
                        <div style={{ fontSize: 11, color: "#7A7A8C" }}>${unit.monthlyPrice.toLocaleString()}/mo</div>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#B23A48" }}>No capacity</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {best?.isConcessionCandidate && (
                      <div style={{ fontSize: 11, color: "#C97B1A", marginBottom: 4 }}>💳 suggest credit</div>
                    )}
                    {best ? <FitBar score={best.score} /> : <span style={{ fontSize: 12, color: "#7A7A8C" }}>—</span>}
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

      <div style={{ background: "#F0FAF9", border: "1px solid #5BBFB5", borderRadius: 16, padding: "16px 20px", fontSize: 14, color: "#3D3D4E" }}>
        <span style={{ fontWeight: 700, fontFamily: "Georgia, 'Times New Roman', serif", color: "#1C1C2E" }}>How fit scores work:</span> Stella scores each family against each compatible open unit across budget fit (40 pts), urgency (25 pts), intent signal (20 pts), and geography (15 pts). Families marked "No capacity" have a care need with no open units — those leads should not receive spend.
      </div>
    </div>
  );
}
