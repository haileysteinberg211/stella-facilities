import { useState } from "react";
import { computeRecommendations } from "../data/scoring.js";
import Anthropic from "@anthropic-ai/sdk";

const rec = computeRecommendations();

const card = {
  background: "rgba(255,255,255,0.92)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: 20,
  border: "1px solid rgba(255,255,255,0.6)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
};

const intentLabel = {
  "deposit-ready": "Deposit ready",
  "tour-booked": "Tour booked",
  "inquiry": "Inquiry",
};

const intentStyle = {
  "deposit-ready": { background: "#ECFDF5", color: "#065F46", border: "1px solid #6EE7B7" },
  "tour-booked":   { background: "#EEF2FF", color: "#3730A3", border: "1px solid #C7D2FE" },
  "inquiry":       { background: "#F9FAFB", color: "#6B7280", border: "1px solid #E5E7EB" },
};

function Kpi({ label, value, valueColor, children }) {
  return (
    <div style={{ ...card, padding: "20px 22px" }}>
      <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: valueColor || "#111827", lineHeight: 1, fontFamily: "'Playfair Display', Georgia, serif" }}>{value}</div>
      {children}
    </div>
  );
}

function OccBar({ pct, target }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ position: "relative", height: 5, background: "#E5E7EB", borderRadius: 99 }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: "#5BBFB5", borderRadius: 99 }} />
        <div style={{ position: "absolute", top: -3, bottom: -3, width: 2, background: "#9CA3AF", left: `${target}%` }} />
      </div>
      <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>target {target}%</div>
    </div>
  );
}

function Action({ icon, title, tag, color }) {
  const palette = {
    teal:   { bg: "#F0FDFA", border: "#99F6E4", tag: "#0D9488" },
    amber:  { bg: "#FFFBEB", border: "#FCD34D", tag: "#B45309" },
    indigo: { bg: "#EEF2FF", border: "#C7D2FE", tag: "#4338CA" },
  };
  const p = palette[color] || palette.teal;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "11px 14px", borderRadius: 12, background: p.bg, border: `1px solid ${p.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <span style={{ fontSize: 15, flexShrink: 0 }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{title}</span>
      </div>
      {tag && <span style={{ fontSize: 11, fontWeight: 700, color: p.tag, background: "white", border: `1px solid ${p.border}`, borderRadius: 999, padding: "2px 9px", whiteSpace: "nowrap", flexShrink: 0 }}>{tag}</span>}
    </div>
  );
}

export default function Dashboard() {
  const [agentText, setAgentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [called, setCalled] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);

  const { community, openUnits, top5MC, concessionTargets, suggestedCredit, mcOpen, projectedMCMoveIns, inboundForFull, currentOccupancy, families } = rec;

  const revenueAtRisk = openUnits.filter(u => u.careType === "Memory Care").reduce((s, u) => s + u.monthlyPrice, 0);
  const occupancyGap = mcOpen - projectedMCMoveIns;

  const channelCounts = {};
  const channelColors = {};
  for (const f of families) {
    if (f.channel) { channelCounts[f.channel] = (channelCounts[f.channel] || 0) + 1; channelColors[f.channel] = f.channelColor; }
  }
  const channels = Object.entries(channelCounts).sort((a, b) => b[1] - a[1]);

  async function runAgent() {
    if (!apiKey) { setShowKeyInput(true); return; }
    setLoading(true); setCalled(true); setShowKeyInput(false);
    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
      const msg = await client.messages.create({
        model: "claude-haiku-4-5-20251001", max_tokens: 220,
        messages: [{ role: "user", content: `You are Stella, AI revenue manager for ${community.name}. Occupancy ${(currentOccupancy*100).toFixed(1)}%, MC has ${mcOpen} open units. Top leads: ${top5MC.slice(0,2).map(m=>`${m.family.name} (fit ${m.score}, ${m.family.intent})`).join(", ")}. AL is full, ${inboundForFull.length} AL families can't be placed. Write a 2-sentence daily briefing. Direct, no fluff.` }],
      });
      setAgentText(msg.content[0].text);
    } catch (e) { setAgentText("Error: " + e.message); }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 1160, margin: "0 auto", padding: "28px 24px" }}>

      {/* Alert */}
      <div style={{ background: "rgba(255,245,245,0.95)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid #FCA5A5", borderRadius: 20, padding: "14px 20px", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#991B1B", fontFamily: "'Playfair Display', Georgia, serif" }}>On track to miss occupancy target</div>
            <div style={{ fontSize: 12, color: "#B91C1C", marginTop: 1 }}>MC: {mcOpen} open · {projectedMCMoveIns} projected move-in · {occupancyGap} unit{occupancyGap !== 1 ? "s" : ""} at risk</div>
          </div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#991B1B", background: "white", border: "1px solid #FCA5A5", borderRadius: 999, padding: "5px 14px", whiteSpace: "nowrap" }}>${revenueAtRisk.toLocaleString()}/mo at risk</div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
        <Kpi label="Occupancy" value={`${(currentOccupancy*100).toFixed(1)}%`}>
          <OccBar pct={currentOccupancy*100} target={community.targetOccupancy*100} />
        </Kpi>
        <Kpi label="MC units open" value={mcOpen} valueColor="#DC2626" />
        <Kpi label="Revenue at risk" value={`$${revenueAtRisk.toLocaleString()}`} />
        <Kpi label="Inbound leads" value={families.length} />
      </div>

      {/* Channel strip */}
      <div style={{ ...card, padding: "10px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", flexShrink: 0 }}>APFM demand origin</span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
          {channels.map(([ch, count]) => (
            <span key={ch} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: channelColors[ch] + "15", border: `1px solid ${channelColors[ch]}40`, color: channelColors[ch] }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: channelColors[ch], display: "inline-block" }} />
              {ch} <span style={{ fontWeight: 400, opacity: 0.7 }}>{count}</span>
            </span>
          ))}
        </div>
      </div>

      {/* 2-col */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: 14, alignItems: "start" }}>

        {/* Actions */}
        <div style={{ ...card, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: 7, background: "linear-gradient(135deg,#5BBFB5,#3A9E96)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>S</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#111827", fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>Today's actions</span>
            </div>
            <button onClick={runAgent} disabled={loading} style={{ fontSize: 12, fontWeight: 600, padding: "6px 16px", borderRadius: 999, border: "none", cursor: "pointer", background: loading ? "#E5E7EB" : "#5BBFB5", color: loading ? "#9CA3AF" : "#fff", whiteSpace: "nowrap" }}>
              {loading ? "Thinking…" : called ? "Re-run ↻" : "Ask Stella ↗"}
            </button>
          </div>

          {showKeyInput && (
            <div style={{ padding: "10px 18px", borderBottom: "1px solid #F3F4F6", display: "flex", gap: 8 }}>
              <input type="password" placeholder="Anthropic API key" value={apiKey} onChange={e => setApiKey(e.target.value)} onKeyDown={e => e.key === "Enter" && runAgent()} style={{ flex: 1, fontSize: 12, border: "1px solid #D1D5DB", borderRadius: 8, padding: "7px 12px", outline: "none", color: "#111827" }} />
              <button onClick={runAgent} style={{ fontSize: 12, fontWeight: 600, padding: "7px 14px", borderRadius: 8, border: "none", background: "#5BBFB5", color: "#fff", cursor: "pointer" }}>Go</button>
            </div>
          )}

          {agentText && (
            <div style={{ margin: "14px 16px 0", padding: "12px 14px", background: "#F0FDFA", border: "1px solid #99F6E4", borderRadius: 10 }}>
              <p style={{ fontSize: 13, color: "#134E4A", lineHeight: 1.6, margin: 0 }}>{agentText}</p>
            </div>
          )}

          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
            <Action icon="📞" color="teal" title="Helen Marchetti" tag="94 · deposit ready" />
            <Action icon="📞" color="teal" title="Dorothy Kellerman" tag="89 · tour booked" />
            <Action icon="📞" color="teal" title="Eleanor Vasquez" tag="81 · 3 communities" />
            {concessionTargets.length > 0 && (
              <Action icon="💳" color="amber" title={`${concessionTargets[0].family.name.split(" ")[0]} — $${suggestedCredit.toLocaleString()} credit`} tag={`$${concessionTargets[0].budgetGap} gap`} />
            )}
            {inboundForFull.length > 0 && (
              <Action icon="📉" color="indigo" title="Pause AL spend" tag="AL full" />
            )}
          </div>
        </div>

        {/* Top leads */}
        <div style={{ ...card, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid #F3F4F6" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", fontFamily: "'Playfair Display', Georgia, serif" }}>Top MC leads</div>
          </div>
          <div>
            {top5MC.map((m, i) => (
              <div key={m.family.id} style={{ padding: "10px 16px", borderBottom: i < top5MC.length - 1 ? "1px solid #F9FAFB" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4, marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#111827", fontFamily: "'Playfair Display', Georgia, serif" }}>{m.family.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#5BBFB5" }}>{m.score}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 999, ...intentStyle[m.family.intent] }}>{intentLabel[m.family.intent]}</span>
                  {m.family.channel && (
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 999, background: m.family.channelColor + "15", color: m.family.channelColor, border: `1px solid ${m.family.channelColor}40` }}>
                      {m.family.channel}
                    </span>
                  )}
                </div>
                <div style={{ marginTop: 6, height: 3, background: "#F3F4F6", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${m.score}%`, borderRadius: 99, background: m.score >= 85 ? "#5BBFB5" : m.score >= 70 ? "#F59E0B" : "#EF4444" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
