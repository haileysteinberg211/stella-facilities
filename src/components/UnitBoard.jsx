import { openUnits, leads, community } from "../data/scenario.js";

const urgencyColor = {
  High: "bg-red-50 text-red-700 border-red-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-gray-100 text-gray-600 border-gray-200",
};

function MatchedLeads({ unitId }) {
  const matched = leads.filter((l) => l.recommendedUnit === unitId);
  if (!matched.length) return <div className="text-xs text-gray-400">No matched leads</div>;
  return (
    <div className="space-y-2">
      {matched.map((l) => (
        <div key={l.id} className="bg-white border border-gray-100 rounded-lg px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-gray-900 leading-tight">{l.name}</span>
            <span className="text-xs font-semibold text-violet-700 shrink-0">{l.fitScore} fit</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`text-xs px-1.5 py-0.5 rounded border ${urgencyColor[l.urgency]}`}>
              {l.urgency}
            </span>
            <span className="text-xs text-gray-500">${l.monthlyBudget.toLocaleString()}/mo · {l.moveInDays}d</span>
          </div>
          {l.recommendedConcession && (
            <div className="text-xs text-amber-700 mt-1">
              💳 ${l.recommendedConcession.amount.toLocaleString()} move-in credit
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function UnitBoard() {
  const filledUnits = community.occupiedUnits;
  const totalUnits = community.totalUnits;

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Unit Board</h2>
          <p className="text-sm text-gray-500 mt-0.5">{openUnits.length} open units · all memory care · {filledUnits} of {totalUnits} units occupied</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-400 inline-block" />Occupied</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400 inline-block" />Vacant</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />Soon vacant</span>
        </div>
      </div>

      {/* Unit grid — open units */}
      <div className="grid grid-cols-3 gap-4">
        {openUnits.map((unit) => (
          <div key={unit.id} className="bg-white border border-red-200 rounded-xl overflow-hidden">
            <div className="bg-red-50 border-b border-red-100 px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block shrink-0" />
                <span className="text-sm font-semibold text-gray-900">{unit.id}</span>
                <span className="text-xs text-gray-500">{unit.type}</span>
              </div>
              <div className="text-xs text-gray-500 mb-2">{unit.room} · {unit.sqft} sq ft · Floor {unit.floor}</div>
              <div>
                <span className="text-xl font-semibold text-gray-900">${unit.listPrice.toLocaleString()}</span>
                <span className="text-xs text-gray-500">/mo</span>
              </div>
            </div>

            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-gray-500">Vacant <span className="font-semibold text-red-600">{unit.daysVacant} days</span></div>
                <div className="text-xs text-gray-500">{unit.notes}</div>
              </div>

              <div className="text-xs font-medium text-gray-700 mb-2">Matched leads</div>
              <MatchedLeads unitId={unit.id} />

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Revenue at risk: <span className="font-semibold text-red-600">${(unit.listPrice * (unit.daysVacant / 30)).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} so far</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Occupancy mini-grid */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="text-sm font-medium text-gray-900 mb-3">Community occupancy map</div>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: totalUnits }).map((_, i) => {
            const isOpen = i >= filledUnits;
            return (
              <div
                key={i}
                title={isOpen ? `Unit open` : `Unit occupied`}
                className={`w-4 h-4 rounded-sm ${isOpen ? "bg-red-300" : "bg-green-300"}`}
              />
            );
          })}
        </div>
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-300 inline-block" />{filledUnits} occupied</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-300 inline-block" />{totalUnits - filledUnits} open</span>
        </div>
      </div>
    </div>
  );
}
