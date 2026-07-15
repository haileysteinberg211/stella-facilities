import { useState } from "react";
import { computeRecommendations } from "../data/scoring.js";
import Anthropic from "@anthropic-ai/sdk";

const rec = computeRecommendations();

const actionBorder = {
  contact: "border-l-violet-500",
  concession: "border-l-amber-500",
  spend: "border-l-blue-500",
  alert: "border-l-red-500",
};

const actionIcon = { contact: "📞", concession: "💳", spend: "📉", alert: "⚠️" };

function OccupancyBar({ value, target }) {
  return (
    <div>
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
        <div className="h-full rounded-full bg-violet-500 transition-all duration-700" style={{ width: `${value * 100}%` }} />
        {target && (
          <div className="absolute top-0 bottom-0 w-px bg-gray-400" style={{ left: `${target * 100}%` }} />
        )}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{(value * 100).toFixed(1)}%</span>
        <span>target {(target * 100).toFixed(0)}%</span>
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

  const { community, openUnits, top5MC, concessionTargets, suggestedCredit,
          mcOpen, projectedMCMoveIns, inboundForFull, currentOccupancy } = rec;

  const revenueAtRisk = openUnits
    .filter(u => u.careType === "Memory Care")
    .reduce((s, u) => s + u.monthlyPrice, 0);

  const actions = [
    {
      type: "alert",
      action: `Memory care: ${mcOpen} units open, ~${projectedMCMoveIns} projected move-in${projectedMCMoveIns !== 1 ? "s" : ""}`,
      detail: `You are on track to miss next month's occupancy target. ${mcOpen - projectedMCMoveIns} unit${mcOpen - projectedMCMoveIns !== 1 ? "s" : ""} likely to stay empty without action.`,
      impact: `$${revenueAtRisk.toLocaleString()}/mo at risk`,
    },
    ...top5MC.slice(0, 3).map((m, i) => ({
      type: "contact",
      action: `${i === 0 ? "Call today" : "Contact"}: ${m.family.name}`,
      detail: `Fit ${m.score}/100 · ${m.family.intent.replace("-", " ")} · $${m.family.monthlyBudget.toLocaleString()}/mo · ${m.family.urgencyDays}d urgency → ${m.unit.id}`,
      impact: `+$${m.unit.monthlyPrice.toLocaleString()}/mo`,
    })),
    ...(concessionTargets.length > 0 ? [{
      type: "concession",
      action: `Offer $${suggestedCredit.toLocaleString()} move-in credit to ${concessionTargets.map(m => m.family.name).join(" & ")}`,
      detail: `${concessionTargets.length === 1 ? "This family is" : "These families are"} within $${Math.max(...concessionTargets.map(m => m.budgetGap)).toLocaleString()} of list price. A one-time credit closes the gap and recovers in < 3 months.`,
      impact: `Fills ${concessionTargets.length} unit${concessionTargets.length > 1 ? "s" : ""}`,
    }] : []),
    ...(inboundForFull.length > 0 ? [{
      type: "spend",
      action: "Pause assisted-living lead spend",
      detail: `AL is full. ${inboundForFull.length} inbound AL families can't be housed. You're paying for leads you cannot convert right now.`,
      impact: `Save ~$1,200/mo in wasted spend`,
    }] : []),
  ];

  async function runAgent() {
    if (!apiKey) { setShowKeyInput(true); return; }
    setLoading(true); setCalled(true); setShowKeyInput(false);
    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
      const prompt = `You are Stella, an AI occupancy agent for senior-living communities.

Community: ${community.name}, ${community.location}
Occupancy: ${(currentOccupancy * 100).toFixed(1)}% (target ${community.targetOccupancy * 100}%)
Memory care: ${mcOpen} units open, ~${projectedMCMoveIns} projected move-in this month

Top memory-care leads:
${top5MC.map(m => `- ${m.family.name}: fit ${m.score}, budget $${m.family.monthlyBudget.toLocaleString()}, ${m.family.urgencyDays}d urgency, ${m.family.intent}${m.isConcessionCandidate ? ` (needs $${m.budgetGap} concession)` : ""}`).join("\n")}

Assisted living is full but ${inboundForFull.length} AL leads are still inbound.

Write a 3-sentence daily briefing. Lead with the occupancy risk. Name specific families. End with the spend recommendation. Sound like a sharp colleague, not a chatbot. No bullet points.`;

      const msg = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 280,
        messages: [{ role: "user", content: prompt }],
      });
      setAgentText(msg.content[0].text);
    } catch (e) {
      setAgentText("Error: " + e.message);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Current occupancy</div>
          <div className="text-3xl font-semibold text-gray-900">{(currentOccupancy * 100).toFixed(1)}%</div>
          <OccupancyBar value={currentOccupancy} target={community.targetOccupancy} />
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Memory care open</div>
          <div className="text-3xl font-semibold text-red-600">{mcOpen}</div>
          <div className="text-xs text-gray-500 mt-1">of {community.careTypes.memoryCare.total} units</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Revenue at risk</div>
          <div className="text-3xl font-semibold text-gray-900">${revenueAtRisk.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">per month, MC only</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Inbound leads</div>
          <div className="text-3xl font-semibold text-gray-900">{rec.families.length}</div>
          <div className="text-xs text-gray-500 mt-1">{rec.families.filter(f => f.careNeed === "Memory Care").length} memory care matches</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Stella recommendations */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded bg-violet-600 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">S</span>
                </div>
                <span className="text-sm font-medium text-gray-900">Stella — Daily Briefing</span>
              </div>
              <p className="text-sm text-red-600 font-medium">
                ⚠️ You're on track to miss next month's occupancy target (memory care: {mcOpen} units open, {projectedMCMoveIns} projected move-in).
              </p>
            </div>
            <button
              onClick={runAgent}
              disabled={loading}
              className="text-xs px-3 py-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {loading ? "Thinking…" : called ? "Re-run" : "Run live agent ↗"}
            </button>
          </div>

          {showKeyInput && (
            <div className="mb-4 flex gap-2">
              <input
                type="password"
                placeholder="Paste your Anthropic API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 text-xs border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-violet-400"
              />
              <button onClick={runAgent} className="text-xs px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">Go</button>
            </div>
          )}

          {agentText && (
            <div className="bg-violet-50 border border-violet-100 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-800 leading-relaxed">{agentText}</p>
            </div>
          )}

          <div className="space-y-2">
            {actions.map((a, i) => (
              <div key={i} className={`border-l-4 ${actionBorder[a.type]} bg-gray-50 rounded-r-lg px-4 py-3`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <span className="text-base mt-0.5">{actionIcon[a.type]}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{a.action}</div>
                      <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{a.detail}</div>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded whitespace-nowrap shrink-0">
                    {a.impact}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority leads sidebar */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-sm font-medium text-gray-900 mb-3">Top 5 memory care leads</div>
          <div className="space-y-3">
            {top5MC.map((m, i) => (
              <div key={m.family.id} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold flex items-center justify-center mt-0.5 shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-medium text-gray-900 truncate">{m.family.name}</span>
                    <span className="text-xs font-semibold text-violet-700 shrink-0">{m.score}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {m.family.intent.replace("-", " ")} · {m.family.urgencyDays}d · ${m.family.monthlyBudget.toLocaleString()}/mo
                  </div>
                  {m.isConcessionCandidate && (
                    <div className="text-xs text-amber-700 mt-0.5">💳 ${m.budgetGap} gap → offer credit</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
