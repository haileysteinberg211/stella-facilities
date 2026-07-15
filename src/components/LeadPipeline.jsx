import { leads, openUnits } from "../data/scenario.js";

const urgencyColor = {
  High: "bg-red-50 text-red-700 border-red-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-gray-100 text-gray-600 border-gray-200",
};

function FitBar({ score }) {
  const color = score >= 90 ? "bg-green-500" : score >= 75 ? "bg-violet-500" : "bg-amber-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-7 text-right">{score}</span>
    </div>
  );
}

export default function LeadPipeline() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Lead Pipeline</h2>
          <p className="text-sm text-gray-500 mt-0.5">{leads.length} APFM families · ranked by unit-level fit score</p>
        </div>
        <div className="text-xs text-gray-500 bg-violet-50 border border-violet-100 px-3 py-1.5 rounded-lg">
          Showing memory care matches only
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Priority</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Family</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Urgency</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Budget</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Move-in</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Recommended unit</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Concession</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 w-32">Fit score</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l, i) => {
              const unit = openUnits.find((u) => u.id === l.recommendedUnit);
              return (
                <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold flex items-center justify-center">
                      {i + 1}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{l.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{l.location} · Age {l.age}</div>
                    <div className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{l.notes}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded border ${urgencyColor[l.urgency]}`}>
                      {l.urgency}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">${l.monthlyBudget.toLocaleString()}</div>
                    {unit && (
                      <div className={`text-xs mt-0.5 ${l.monthlyBudget >= unit.listPrice ? "text-green-600" : "text-amber-600"}`}>
                        {l.monthlyBudget >= unit.listPrice ? "Within budget" : `$${(unit.listPrice - l.monthlyBudget).toLocaleString()} gap`}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{l.moveInDays} days</div>
                    <div className="text-xs text-gray-400">~{Math.ceil(l.moveInDays / 7)} weeks</div>
                  </td>
                  <td className="px-4 py-3">
                    {unit ? (
                      <div>
                        <div className="font-medium text-gray-900">{unit.id}</div>
                        <div className="text-xs text-gray-500">{unit.room} · ${unit.listPrice.toLocaleString()}/mo</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {l.recommendedConcession ? (
                      <div className="text-xs">
                        <span className="text-amber-700 font-medium">${l.recommendedConcession.amount.toLocaleString()}</span>
                        <span className="text-gray-500"> {l.recommendedConcession.type.toLowerCase()}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">None needed</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <FitBar score={l.fitScore} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 text-sm text-gray-700">
        <span className="font-medium">How fit scores work:</span> Stella ranks each family against each open unit across four dimensions — care needs match, budget alignment, move-in urgency, and geographic proximity — weighted by current occupancy pressure. Scores above 85 are actionable today; below 70 indicate a significant mismatch worth waiting on.
      </div>
    </div>
  );
}
