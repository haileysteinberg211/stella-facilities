import { computeRecommendations } from "../data/scoring.js";

const { families, scoredMatches, units } = computeRecommendations();

const intentLabel = { "deposit-ready": "Deposit ready", "tour-booked": "Tour booked", "inquiry": "Inquiry" };
const intentColor = {
  "deposit-ready": "bg-green-50 text-green-700 border-green-200",
  "tour-booked":   "bg-violet-50 text-violet-700 border-violet-200",
  "inquiry":       "bg-gray-100 text-gray-600 border-gray-200",
};

function FitBar({ score }) {
  const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-violet-500" : "bg-amber-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-6 text-right">{score}</span>
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
          <h2 className="text-lg font-semibold text-gray-900">Incoming Demand</h2>
          <p className="text-sm text-gray-500 mt-0.5">{families.length} APFM families · ranked by best unit fit</p>
        </div>
        <div className="text-xs text-gray-500 bg-violet-50 border border-violet-100 px-3 py-1.5 rounded-lg">
          Fit scores computed against open units only
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">#</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Family</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Care need</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Intent</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Budget</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Move-in</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Best unit</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Concession</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 w-28">Fit score</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((f, i) => {
              const best = familyBestMatch[f.id];
              const unit = best ? units.find(u => u.id === best.unit.id) : null;
              const noCapacity = !best;
              return (
                <tr key={f.id} className={`border-b border-gray-50 transition-colors ${noCapacity ? "opacity-50" : "hover:bg-gray-50"}`}>
                  <td className="px-4 py-3">
                    <div className={`w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center ${noCapacity ? "bg-gray-100 text-gray-400" : "bg-violet-100 text-violet-700"}`}>
                      {i + 1}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{f.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{f.notes}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-700">{f.careNeed}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded border ${intentColor[f.intent]}`}>
                      {intentLabel[f.intent]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">${f.monthlyBudget.toLocaleString()}</div>
                    {unit && (
                      <div className={`text-xs mt-0.5 ${f.monthlyBudget >= unit.monthlyPrice ? "text-green-600" : best?.isConcessionCandidate ? "text-amber-600" : "text-red-500"}`}>
                        {f.monthlyBudget >= unit.monthlyPrice ? "Fits list price" : `$${(unit.monthlyPrice - f.monthlyBudget).toLocaleString()} under`}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{f.urgencyDays}d</div>
                    <div className="text-xs text-gray-400">{f.distanceMiles} mi</div>
                  </td>
                  <td className="px-4 py-3">
                    {unit ? (
                      <div>
                        <div className="font-medium text-gray-900">{unit.id}</div>
                        <div className="text-xs text-gray-500">${unit.monthlyPrice.toLocaleString()}/mo</div>
                      </div>
                    ) : (
                      <span className="text-xs text-red-500 font-medium">No capacity</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {best?.isConcessionCandidate && (
                      <div className="text-xs text-amber-700 mb-1">💳 suggest credit</div>
                    )}
                    {best ? <FitBar score={best.score} /> : <span className="text-xs text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {best?.isConcessionCandidate && (
                      <div className="text-xs text-amber-700 mb-1">💳</div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 text-sm text-gray-700">
        <span className="font-medium">How fit scores work:</span> Stella scores each family against each compatible open unit across budget fit (40 pts), urgency (25 pts), intent signal (20 pts), and geography (15 pts). Families marked "No capacity" have a care need with no open units — those leads should not receive spend.
      </div>
    </div>
  );
}
