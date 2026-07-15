import { useState } from "react";
import { computeRecommendations } from "../data/scoring.js";
import Anthropic from "@anthropic-ai/sdk";

const rec = computeRecommendations();

const card = {
  background: "rgba(13, 18, 30, 0.65)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.09)",
  padding: "24px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
};

const intentBadge = {
  "deposit-ready": { bg: "#0D2420", color: "#5BBFB5", border: "#5BBFB5" },
  "tour-booked":   { bg: "#13143A", color: "#818CF8", border: "#6366F1" },
  "inquiry":       { bg: "#161B27", color: "#8B8FA8", border: "#252B3B" },
};

const intentLabel = {
  "deposit-ready": "Deposit ready",
  "tour-booked": "Tour booked",
  "inquiry": "Inquiry",
};

function Kpi({ label, value, sub, valueColor, children }) {
  return (
    <div style={card}>
      <div style={{ fontSize: 11, color: "#8B8FA8", fontWeight: 600, marginBottom: 8, letterSpacing: "0.07em", textTransform: "uppercase", fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 700, color: valueColor || "#E8E4DC", lineHeight: 1, marginBottom: 4, fontFamily: "'Playfair Display', Georgia, serif" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#8B8FA8", fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>{sub}</div>}
      {children}
    </div>
  );
}

function OccBar({ pct, target }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ position: "relative", height: 6, background: "#252B3B", borderRadius: 99 }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: "#5BBFB5", borderRadius: 99, boxShadow: "0 0 8px #5BBFB580" }} />
        <div style={{ position: "absolute", top: -2, bottom: -2, width: 2, background: "#3D4456", borderRadius: 1, left: `${target}%` }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 11, color: "#8B8FA8" }}>{pct.toFixed(1)}%</span>
        <span style={{ fontSize: 11, color: "#8B8FA8" }}>target {target}%</span>
      </div>
    </div>
  );
}

function ActionRow({ icon, color, title, detail, tag, tagColor }) {
  const colors = {
    red:    { border: "#5C1A22", bg: "#2A0F12", leftBorder: "#B23A48" },
    violet: { border: "#5BBFB540", bg: "#1A2530", leftBorder: "#5BBFB5" },
    amber:  { border: "#C97B1A40", bg: "#1F1A0F", leftBorder: "#C97B1A" },
    blue:   { border: "#6366F140", bg: "#111827", leftBorder: "#6366F1" },
  };
  const c = colors[color] || colors.violet;
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "12px 14px",
      borderRadius: 10,
      border: `1px solid ${c.border}`,
      background: c.bg,
      borderLeft: `3px solid ${c.leftBorder}`,
    }}>
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 2 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#E8E4DC", fontFamily: "'Playfair Display', Georgia, serif" }}>{title}</div>
          {tag && (
            <div style={{
              fontSize: 11, fontWeight: 600,
              color: tagColor === "#b45309" ? "#C97B1A" : tagColor === "#1d4ed8" ? "#818CF8" : "#5BBFB5",
              background: tagColor === "#b45309" ? "#1F1A0F" : tagColor === "#1d4ed8" ? "#111827" : "#0D2420",
              border: `1px solid ${tagColor === "#b45309" ? "#C97B1A40" : tagColor === "#1d4ed8" ? "#6366F140" : "#5BBFB540"}`,
              borderRadius: 6, padding: "2px 7px", whiteSpace: "nowrap", flexShrink: 0,
            }}>{tag}</div>
          )}
        </div>
        <div style={{ fontSize: 12, color: "#8B8FA8", lineHeight: 1.5, marginTop: 2, fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>{detail}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [agentText, setAgentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [called, setCalled] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);

  const {
    community, openUnits, top5MC, concessionTargets, suggestedCredit,
    mcOpen, projectedMCMoveIns, inboundForFull, currentOccupancy, families,
  } = rec;

  const revenueAtRisk = openUnits
    .filter(u => u.careType === "Memory Care")
    .reduce((s, u) => s + u.monthlyPrice, 0);

  const occupancyGap = mcOpen - projectedMCMoveIns;

  const channelCounts = {};
  const channelColors = {};
  for (const f of families) {
    if (f.channel) {
      channelCounts[f.channel] = (channelCounts[f.channel] || 0) + 1;
      channelColors[f.channel] = f.channelColor;
    }
  }
  const channels = Object.entries(channelCounts).sort((a, b) => b[1] - a[1]);

  async function runAgent() {
    if (!apiKey) { setShowKeyInput(true); return; }
    setLoading(true); setCalled(true); setShowKeyInput(false);
    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
      const prompt = `You are Stella, an AI occupancy agent for senior-living communities.

Community: ${community.name} — occupancy ${(currentOccupancy * 100).toFixed(1)}% (target ${community.targetOccupancy * 100}%)
Memory care: ${mcOpen} units open, ~${projectedMCMoveIns} projected move-in this month.

Top memory-care leads:
${top5MC.map(m => `- ${m.family.name}: fit ${m.score}, $${m.family.monthlyBudget.toLocaleString()}/mo, ${m.family.urgencyDays}d urgency, ${m.family.intent}${m.isConcessionCandidate ? ` — needs $${m.budgetGap} concession` : ""}`).join("\n")}

Assisted living is full. ${inboundForFull.length} AL families inbound with nowhere to go.

Write a 3-sentence daily briefing. Lead with the occupancy miss. Name the top 2 families specifically. End with the AL spend call. Direct, no bullet points, smart colleague tone.`;

      const msg = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 260,
        messages: [{ role: "user", content: prompt }],
      });
      setAgentText(msg.content[0].text);
    } catch (e) {
      setAgentText("Error: " + e.message);
    }
    setLoading(false);
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Background orbs */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: "none", zIndex: 0, overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -200, right: -200,
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, #5BBFB520 0%, transparent 70%)",
          filter: "blur(40px)",
        }} />
        <div style={{
          position: "absolute", bottom: -100, left: -100,
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, #6366F115 0%, transparent 70%)",
          filter: "blur(40px)",
        }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "24px 24px" }}>

        {/* Hero alert banner */}
        <div style={{
          background: "linear-gradient(135deg, #2A0F12, #1A0A0D)",
          border: "1px solid #5C1A22",
          borderRadius: 16,
          padding: "16px 20px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#E05252", fontFamily: "'Playfair Display', Georgia, serif" }}>
                On track to miss occupancy target next month
              </div>
              <div style={{ fontSize: 13, color: "#E05252", marginTop: 2, opacity: 0.8, fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>
                Memory care: {mcOpen} units open, ~{projectedMCMoveIns} projected move-in — {occupancyGap} unit{occupancyGap !== 1 ? "s" : ""} likely to stay empty without action
              </div>
            </div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#E05252", background: "#2A0F12", border: "1px solid #5C1A22", borderRadius: 999, padding: "6px 16px", whiteSpace: "nowrap" }}>
            ${revenueAtRisk.toLocaleString()}/mo at risk
          </div>
        </div>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          <Kpi label="Occupancy" value={`${(currentOccupancy * 100).toFixed(1)}%`} sub={`target ${community.targetOccupancy * 100}%`}>
            <OccBar pct={currentOccupancy * 100} target={community.targetOccupancy * 100} />
          </Kpi>
          <Kpi label="Memory care open" value={mcOpen} valueColor="#E05252" sub={`of ${community.careTypes.memoryCare.total} units`} />
          <Kpi label="Revenue at risk" value={`$${revenueAtRisk.toLocaleString()}`} sub="per month, MC only" />
          <Kpi label="Inbound leads" value={families.length} sub={`${families.filter(f => f.careNeed === "Memory Care").length} memory care fits`} />
        </div>

        {/* APFM MCP channel strip */}
        <div style={{ ...card, marginBottom: 16, padding: "12px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#8B8FA8", textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0, fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>
              APFM MCP Demand Origin
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }}>
              {channels.map(([ch, count]) => (
                <div key={ch} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  fontSize: 12, fontWeight: 600,
                  padding: "4px 10px", borderRadius: 999,
                  background: channelColors[ch] + "20",
                  border: `1px solid ${channelColors[ch]}33`,
                  color: channelColors[ch],
                  fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: channelColors[ch], display: "inline-block" }} />
                  {ch}
                  <span style={{ fontWeight: 400, color: channelColors[ch] + "cc", fontSize: 11 }}>{count}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "#8B8FA8", flexShrink: 0, fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>
              {families.length} families routed via APFM MCP rails
            </div>
          </div>
        </div>

        {/* Main 2-col layout */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 260px", gap: 16, alignItems: "start" }}>

          {/* Left: Stella recommendations */}
          <div style={{ ...card, padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 18px", borderBottom: "1px solid #252B3B", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg, #5BBFB5, #3A9E96)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>S</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#E8E4DC", fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>Stella recommends</span>
              </div>
              <button
                onClick={runAgent}
                disabled={loading}
                style={{
                  fontSize: 12, fontWeight: 600, padding: "7px 18px",
                  borderRadius: 999, border: "none", cursor: loading ? "not-allowed" : "pointer",
                  background: loading ? "#252B3B" : "linear-gradient(135deg, #5BBFB5, #3A9E96)",
                  color: loading ? "#8B8FA8" : "#fff",
                  transition: "all 0.15s", opacity: loading ? 0.7 : 1,
                  whiteSpace: "nowrap", flexShrink: 0,
                  fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
                }}
              >
                {loading ? "Thinking…" : called ? "Re-run ↻" : "Run live agent ↗"}
              </button>
            </div>

            {showKeyInput && (
              <div style={{ padding: "12px 20px", borderBottom: "1px solid #252B3B", display: "flex", gap: 8 }}>
                <input
                  type="password"
                  placeholder="Paste your Anthropic API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runAgent()}
                  style={{ flex: 1, fontSize: 12, border: "1px solid #252B3B", borderRadius: 8, padding: "7px 12px", outline: "none", background: "#0D1117", color: "#E8E4DC", fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}
                />
                <button onClick={runAgent} style={{ fontSize: 12, fontWeight: 600, padding: "7px 18px", borderRadius: 999, border: "none", background: "linear-gradient(135deg, #5BBFB5, #3A9E96)", color: "#fff", cursor: "pointer" }}>Go</button>
              </div>
            )}

            {agentText && (
              <div style={{ margin: "16px 20px 0", padding: "14px 16px", background: "#0D2420", border: "1px solid #5BBFB5", borderRadius: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#5BBFB5", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>Live briefing</div>
                <p style={{ fontSize: 13, color: "#E8E4DC", lineHeight: 1.6, margin: 0, fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>{agentText}</p>
              </div>
            )}

            <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              <ActionRow
                icon="📞" color="violet"
                title={`Call today: Helen Marchetti`}
                detail={`Fit 94 · Deposit ready · $8,000/mo · 10 days urgency → MC-101. Highest urgency in the pipeline. Close this today.`}
                tag="+$6,800/mo"
              />
              <ActionRow
                icon="📞" color="violet"
                title="Contact: Dorothy Kellerman"
                detail={`Fit 89 · Tour booked · $6,800/mo · 12 days → MC-101. Daughter is sole caregiver, motivated to move fast.`}
                tag="+$6,800/mo"
              />
              <ActionRow
                icon="📞" color="violet"
                title="Contact: Eleanor Vasquez"
                detail={`Fit 81 · Tour booked · $7,200/mo · 30 days → MC-310. Touring 3 communities — reach out before she commits elsewhere.`}
                tag="+$7,400/mo"
              />
              {concessionTargets.length > 0 && (
                <ActionRow
                  icon="💳" color="amber"
                  title={`Offer $${suggestedCredit.toLocaleString()} move-in credit to ${concessionTargets.map(m => m.family.name).join(" & ")}`}
                  detail={`${concessionTargets.length === 1 ? "This family is" : "These families are"} within $${Math.max(...concessionTargets.map(m => m.budgetGap)).toLocaleString()} of list price. One-time credit recovers in under 3 months.`}
                  tag={`Fills ${concessionTargets.length} unit${concessionTargets.length > 1 ? "s" : ""}`}
                  tagColor="#b45309"
                />
              )}
              {inboundForFull.length > 0 && (
                <ActionRow
                  icon="📉" color="blue"
                  title="Pause assisted-living lead spend"
                  detail={`AL is full. ${inboundForFull.length} inbound AL families have nowhere to go. You're paying for leads you cannot convert.`}
                  tag="Save ~$1,200/mo"
                  tagColor="#1d4ed8"
                />
              )}
            </div>
          </div>

          {/* Right: top leads */}
          <div style={{ ...card, padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 18px 14px", borderBottom: "1px solid #252B3B" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#E8E4DC", fontFamily: "'Playfair Display', Georgia, serif" }}>Top 5 memory care leads</div>
              <div style={{ fontSize: 11, color: "#8B8FA8", marginTop: 2, fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>ranked by fit score</div>
            </div>
            <div style={{ padding: "8px 0" }}>
              {top5MC.map((m, i) => {
                const ib = intentBadge[m.family.intent];
                return (
                  <div key={m.family.id} style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "10px 18px",
                    borderBottom: i < top5MC.length - 1 ? "1px solid #252B3B" : "none",
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: "#5BBFB520", color: "#5BBFB5",
                      fontSize: 11, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginTop: 2,
                    }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#E8E4DC", fontFamily: "'Playfair Display', Georgia, serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.family.name}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#5BBFB5", flexShrink: 0 }}>{m.score}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4,
                          background: ib.bg, color: ib.color, border: `1px solid ${ib.border}`,
                          whiteSpace: "nowrap", fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
                        }}>{intentLabel[m.family.intent]}</span>
                        {m.family.channel && (
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 3,
                            fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4,
                            background: m.family.channelColor + "20",
                            color: m.family.channelColor,
                            border: `1px solid ${m.family.channelColor}33`,
                            whiteSpace: "nowrap", fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
                          }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: m.family.channelColor, display: "inline-block" }} />
                            {m.family.channel}
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: "#8B8FA8", fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>{m.family.urgencyDays}d · ${m.family.monthlyBudget.toLocaleString()}/mo</span>
                      </div>
                      {m.isConcessionCandidate && (
                        <div style={{ fontSize: 11, color: "#C97B1A", marginTop: 3, fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>💳 ${m.budgetGap} gap → offer credit</div>
                      )}
                      {/* Fit bar */}
                      <div style={{ marginTop: 6, height: 3, background: "#252B3B", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 99,
                          width: `${m.score}%`,
                          background: m.score >= 85 ? "#5BBFB5" : m.score >= 70 ? "#C97B1A" : "#E05252",
                          boxShadow: m.score >= 85 ? "0 0 6px #5BBFB580" : "none",
                        }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
