import { useState } from "react";
import { computeRecommendations } from "../data/scoring.js";
import Anthropic from "@anthropic-ai/sdk";
import { t, chip, card, channelColor, intentChip } from "../theme.js";
import FacilityViz from "./FacilityViz.jsx";

const rec = computeRecommendations();

const intentLabel = {
  "deposit-ready": "Deposit ready",
  "tour-booked": "Tour booked",
  "inquiry": "Inquiry",
};

// ── On-brand primitives ──────────────────────────────────────────────────────
function Chip({ tone, small, children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: t.sans,
        fontWeight: 700,
        fontSize: small ? 11 : 12,
        padding: small ? "3px 9px" : "5px 12px",
        borderRadius: 999,
        background: tone.bg,
        color: tone.fg,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function Delta({ dir, dark, children }) {
  const color =
    dir === "up"
      ? dark ? "#7FD3AC" : t.success
      : dir === "down"
      ? dark ? "#EAA18F" : t.danger
      : dark ? "#A9C2D1" : t.gray500;
  const arrow = dir === "up" ? "▲ " : dir === "down" ? "▼ " : "";
  return (
    <div style={{ fontFamily: t.sans, fontSize: 13, fontWeight: 700, color, marginTop: 2 }}>
      {arrow}
      {children}
    </div>
  );
}

function Kpi({ label, value, dark, children }) {
  return (
    <div
      style={{
        ...card,
        padding: "20px 22px",
        ...(dark ? { background: t.navy, border: `1px solid ${t.navy}` } : {}),
      }}
    >
      <div
        style={{
          fontFamily: t.sans,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: dark ? "#A9C2D1" : t.gray500,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: t.display,
          fontWeight: 600,
          fontSize: 40,
          lineHeight: 1.1,
          margin: "6px 0 4px",
          color: dark ? t.white : t.navy,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      {children}
    </div>
  );
}

function OccBar({ pct, target, dark }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ position: "relative", height: 6, background: t.gray100, borderRadius: 999 }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${pct}%`,
            background: t.success,
            borderRadius: 999,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -3,
            bottom: -3,
            width: 2,
            background: dark ? "rgba(255,255,255,0.65)" : t.gray300,
            left: `${target}%`,
          }}
        />
      </div>
      <div style={{ fontFamily: t.sans, fontSize: 12, color: dark ? "#A9C2D1" : t.gray500, marginTop: 5 }}>
        target {target}%
      </div>
    </div>
  );
}

function ActionRow({ dotColor, title, tone, tag }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 12,
        background: t.gray50,
        border: `1px solid ${t.gray100}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
        <span
          style={{
            fontFamily: t.sans,
            fontSize: 14,
            fontWeight: 600,
            color: t.ink,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </span>
      </div>
      {tag && <Chip tone={tone}>{tag}</Chip>}
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
    community,
    openUnits,
    top5MC,
    concessionTargets,
    suggestedCredit,
    mcOpen,
    projectedMCMoveIns,
    inboundForFull,
    currentOccupancy,
    families,
  } = rec;

  const revenueAtRisk = openUnits
    .filter((u) => u.careType === "Memory Care")
    .reduce((s, u) => s + u.monthlyPrice, 0);
  const occupancyGap = mcOpen - projectedMCMoveIns;

  const channelCounts = {};
  for (const f of families) {
    if (f.channel) channelCounts[f.channel] = (channelCounts[f.channel] || 0) + 1;
  }
  const channels = Object.entries(channelCounts).sort((a, b) => b[1] - a[1]);

  const occPct = currentOccupancy * 100;
  const targetPct = community.targetOccupancy * 100;
  const occDelta = occPct - targetPct;

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
      <div
        style={{
          ...card,
          padding: "16px 20px",
          borderLeft: `4px solid ${t.danger}`,
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true">
            <path
              d="M12 3.2 22 20.5 H2 Z"
              fill={t.danger}
              fillOpacity="0.14"
              stroke={t.danger}
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <line x1="12" y1="9.5" x2="12" y2="14.5" stroke={t.danger} strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="17.4" r="1.15" fill={t.danger} />
          </svg>
          <div>
            <div style={{ fontFamily: t.display, fontWeight: 600, fontSize: 20, color: t.navy, lineHeight: 1.2 }}>
              On track to miss occupancy target
            </div>
            <div style={{ fontFamily: t.sans, fontSize: 14, color: t.gray700, marginTop: 4 }}>
              Memory Care: {mcOpen} open · {projectedMCMoveIns} projected move-in{projectedMCMoveIns !== 1 ? "s" : ""} ·{" "}
              {occupancyGap} unit{occupancyGap !== 1 ? "s" : ""} at risk
            </div>
          </div>
        </div>
        <Chip tone={chip.danger}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: t.danger, display: "inline-block" }} />
          ${revenueAtRisk.toLocaleString()}/mo at risk
        </Chip>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        <Kpi label="Occupancy" value={`${occPct.toFixed(1)}%`} dark>
          <Delta dir={occDelta >= 0 ? "up" : "down"} dark>
            {Math.abs(occDelta).toFixed(1)} pts vs. plan
          </Delta>
          <OccBar pct={occPct} target={targetPct} dark />
        </Kpi>
        <Kpi label="MC units open" value={mcOpen}>
          <Delta dir="down">{occupancyGap} projected unfilled</Delta>
        </Kpi>
        <Kpi label="Revenue at risk" value={`$${revenueAtRisk.toLocaleString()}`}>
          <Delta dir="down">unfilled memory care</Delta>
        </Kpi>
        <Kpi label="Inbound leads" value={families.length}>
          <Delta dir="muted">across {channels.length} channels</Delta>
        </Kpi>
      </div>

      {/* Facility map + forecast — the visual centerpiece */}
      <div style={{ marginBottom: 20 }}>
        <FacilityViz />
      </div>

      {/* 2-col: actions + top leads */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 20, alignItems: "start" }}>

        {/* Actions */}
        <div style={{ ...card, padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: `1px solid ${t.gray100}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ fontFamily: t.display, fontWeight: 600, fontSize: 20, color: t.navy }}>Today's actions</div>
            <button
              onClick={runAgent}
              disabled={loading}
              style={{
                fontFamily: t.sans,
                fontSize: 14,
                fontWeight: 600,
                padding: "10px 20px",
                borderRadius: 12,
                border: "none",
                cursor: loading ? "default" : "pointer",
                background: loading ? t.gray300 : t.coral,
                color: t.white,
                whiteSpace: "nowrap",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = t.coralDark; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = t.coral; }}
            >
              {loading ? "Thinking…" : called ? "Re-run" : "Ask Stella"}
            </button>
          </div>

          {showKeyInput && (
            <div
              style={{
                padding: "12px 20px",
                borderBottom: `1px solid ${t.gray100}`,
                display: "flex",
                gap: 8,
                background: t.gray50,
              }}
            >
              <input
                type="password"
                placeholder="Anthropic API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runAgent()}
                style={{
                  flex: 1,
                  fontFamily: t.sans,
                  fontSize: 13,
                  border: `1px solid ${t.gray300}`,
                  borderRadius: 8,
                  padding: "8px 12px",
                  outline: "none",
                  color: t.ink,
                  background: t.white,
                }}
              />
              <button
                onClick={runAgent}
                style={{
                  fontFamily: t.sans,
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: t.navy,
                  color: t.white,
                  cursor: "pointer",
                }}
              >
                Go
              </button>
            </div>
          )}

          {agentText && (
            <div
              style={{
                margin: "16px 20px 0",
                padding: "14px 16px",
                background: t.navyTint,
                border: `1px solid ${t.blue}55`,
                borderRadius: 12,
              }}
            >
              <p style={{ fontFamily: t.sans, fontSize: 14, color: t.navy, lineHeight: 1.6, margin: 0 }}>{agentText}</p>
            </div>
          )}

          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <ActionRow dotColor={t.success} title="Helen Marchetti" tone={chip.success} tag="94 · deposit ready" />
            <ActionRow dotColor={t.blue} title="Dorothy Kellerman" tone={chip.info} tag="89 · tour booked" />
            <ActionRow dotColor={t.warning} title="Eleanor Vasquez" tone={chip.warning} tag="81 · 3 communities" />
            {concessionTargets.length > 0 && (
              <ActionRow
                dotColor={t.warning}
                title={`${concessionTargets[0].family.name.split(" ")[0]} — $${suggestedCredit.toLocaleString()} credit`}
                tone={chip.warning}
                tag={`$${concessionTargets[0].budgetGap} gap`}
              />
            )}
            {inboundForFull.length > 0 && (
              <ActionRow dotColor={t.blue} title="Pause AL spend" tone={chip.info} tag="AL full" />
            )}
          </div>
        </div>

        {/* Top leads */}
        <div style={{ ...card, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.gray100}` }}>
            <div style={{ fontFamily: t.display, fontWeight: 600, fontSize: 20, color: t.navy }}>Top memory care leads</div>
          </div>
          <div>
            {top5MC.map((m, i) => {
              const cc = channelColor[m.family.channel];
              const barColor = m.score >= 85 ? t.success : m.score >= 70 ? t.warning : t.danger;
              return (
                <div
                  key={m.family.id}
                  style={{ padding: "12px 20px", borderBottom: i < top5MC.length - 1 ? `1px solid ${t.gray100}` : "none" }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 7 }}>
                    <span style={{ fontFamily: t.display, fontWeight: 600, fontSize: 16, color: t.ink }}>{m.family.name}</span>
                    <span style={{ fontFamily: t.display, fontWeight: 600, fontSize: 18, color: t.navy, fontVariantNumeric: "tabular-nums" }}>
                      {m.score}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <Chip tone={intentChip[m.family.intent] || { bg: t.gray100, fg: t.gray700 }} small>
                      {intentLabel[m.family.intent] || m.family.intent}
                    </Chip>
                    {m.family.channel && cc && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontFamily: t.sans,
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 9px",
                          borderRadius: 999,
                          background: cc + "22",
                          color: cc,
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: cc }} />
                        {m.family.channel}
                      </span>
                    )}
                  </div>
                  <div style={{ marginTop: 8, height: 5, background: t.gray100, borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${m.score}%`, borderRadius: 999, background: barColor }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Channel strip — APFM demand origin */}
      <div
        style={{
          ...card,
          padding: "14px 20px",
          marginTop: 20,
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontFamily: t.sans,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: t.gray500,
            flexShrink: 0,
          }}
        >
          APFM demand origin
        </span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }}>
          {channels.map(([ch, count]) => {
            const cc = channelColor[ch] || t.gray500;
            return (
              <span
                key={ch}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: t.sans,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "4px 11px",
                  borderRadius: 999,
                  background: cc + "22",
                  color: cc,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: cc }} />
                {ch} <span style={{ fontWeight: 600, opacity: 0.65 }}>{count}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
