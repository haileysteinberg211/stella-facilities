import { useState } from "react";
import { community, agentRecommendation, leads, openUnits } from "../data/scenario.js";
import Anthropic from "@anthropic-ai/sdk";

const urgencyColor = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-gray-100 text-gray-600 border-gray-200",
};

const actionIcon = {
  contact: "📞",
  concession: "💳",
  spend: "📉",
};

const actionBorder = {
  contact: "border-l-violet-500",
  concession: "border-l-amber-500",
  spend: "border-l-blue-500",
};

function OccupancyBar({ value, target, label, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span className="font-medium text-gray-800">{value.toFixed(1)}%</span>
      </div>
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${value}%` }}
        />
        {target && (
          <div
            className="absolute top-0 bottom-0 w-px bg-gray-400"
            style={{ left: `${target}%` }}
          />
        )}
      </div>
      {target && (
        <div className="flex justify-end mt-0.5">
          <span className="text-xs text-gray-400">target {target}%</span>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [agentText, setAgentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [called, setCalled] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);

  const rec = agentRecommendation;
  const occupancyPct = (community.occupiedUnits / community.totalUnits) * 100;
  const openCount = openUnits.length;
  const revenueAtRisk = openUnits.reduce((s, u) => s + u.listPrice, 0);

  async function runAgent() {
    if (!apiKey) { setShowKeyInput(true); return; }
    setLoading(true);
    setCalled(true);
    setShowKeyInput(false);
    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
      const prompt = `You are Stella, an AI revenue manager for senior-living communities. A community director is asking for your daily briefing.

Community: ${community.name}, ${community.location}
Total units: ${community.totalUnits} | Occupied: ${community.occupiedUnits} | Occupancy: ${occupancyPct.toFixed(1)}% | Target: ${community.targetOccupancy * 100}%

Open units (all Memory Care):
${openUnits.map(u => `- ${u.id}: ${u.room} @ $${u.listPrice}/mo, vacant ${u.daysVacant} days`).join("\n")}

Top APFM leads in pipeline:
${leads.map(l => `- ${l.name}, age ${l.age}, budget $${l.monthlyBudget}/mo, move-in in ~${l.moveInDays} days, urgency: ${l.urgency}, fit score: ${l.fitScore}`).join("\n")}

Give a concise, direct daily briefing (3-4 sentences max). Lead with the occupancy risk, then your top 3 actions in plain language. Be specific — name the families and units. No bullet points. Sound like a smart colleague, not a chatbot.`;

      const msg = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
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
      {/* Top KPI row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Current occupancy</div>
          <div className="text-3xl font-semibold text-gray-900">{occupancyPct.toFixed(1)}%</div>
          <div className="text-xs text-red-600 mt-1">Target: {community.targetOccupancy * 100}%</div>
          <div className="mt-3">
            <OccupancyBar value={occupancyPct} target={community.targetOccupancy * 100} color="bg-violet-500" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Open units</div>
          <div className="text-3xl font-semibold text-red-600">{openCount}</div>
          <div className="text-xs text-gray-500 mt-1">All memory care</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Monthly revenue at risk</div>
          <div className="text-3xl font-semibold text-gray-900">${revenueAtRisk.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">from {openCount} vacant units</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Projected monthly lift</div>
          <div className="text-3xl font-semibold text-green-600">+${rec.projectedMonthlyLift.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">if top 3 actions taken</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Agent recommendation */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded bg-violet-600 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">S</span>
                </div>
                <span className="text-sm font-medium text-gray-900">Stella — Daily Briefing</span>
              </div>
              <p className="text-sm text-red-600 font-medium">{rec.headline}</p>
            </div>
            <button
              onClick={runAgent}
              disabled={loading}
              className="text-xs px-3 py-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Thinking…" : called ? "Re-run" : "Run live agent ↗"}
            </button>
          </div>

          {showKeyInput && (
            <div className="mb-4 flex gap-2 items-center">
              <input
                type="password"
                placeholder="Paste your Anthropic API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 text-xs border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-violet-400"
              />
              <button
                onClick={runAgent}
                className="text-xs px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
              >
                Go
              </button>
            </div>
          )}

          {agentText && (
            <div className="bg-violet-50 border border-violet-100 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-800 leading-relaxed">{agentText}</p>
            </div>
          )}

          <div className="space-y-3">
            {rec.actions.map((a) => (
              <div
                key={a.priority}
                className={`border-l-4 ${actionBorder[a.type]} bg-gray-50 rounded-r-lg px-4 py-3`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <span className="text-base mt-0.5">{actionIcon[a.type]}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{a.action}</div>
                      <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{a.detail}</div>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded whitespace-nowrap">
                    {a.impact}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top leads */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-sm font-medium text-gray-900 mb-3">Priority leads</div>
          <div className="space-y-3">
            {leads.slice(0, 5).map((l, i) => (
              <div key={l.id} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold flex items-center justify-center mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900 truncate">{l.name}</div>
                    <div className="text-xs font-semibold text-violet-700 ml-2">{l.fitScore}</div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${urgencyColor[l.urgency.toLowerCase()]}`}>
                      {l.urgency}
                    </span>
                    <span className="text-xs text-gray-500">{l.moveInDays}d · ${l.monthlyBudget.toLocaleString()}/mo</span>
                  </div>
                  {l.recommendedConcession && (
                    <div className="text-xs text-amber-700 mt-0.5">
                      → Offer ${l.recommendedConcession.amount.toLocaleString()} credit
                    </div>
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
