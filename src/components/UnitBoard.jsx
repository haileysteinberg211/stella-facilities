import { computeRecommendations } from "../data/scoring.js";

const { community, units, rankedByUnit } = computeRecommendations();

const careColors = {
  "Memory Care":       { bg: "bg-red-50",    border: "border-red-200",    dot: "bg-red-500",    badge: "bg-red-100 text-red-700" },
  "Assisted Living":   { bg: "bg-amber-50",  border: "border-amber-200",  dot: "bg-amber-500",  badge: "bg-amber-100 text-amber-700" },
  "Independent Living":{ bg: "bg-blue-50",   border: "border-blue-200",   dot: "bg-blue-400",   badge: "bg-blue-100 text-blue-700" },
};

const ct = community.careTypes;
const occupancySummary = [
  { label: "Independent Living", occupied: ct.independentLiving.occupied, total: ct.independentLiving.total },
  { label: "Assisted Living",    occupied: ct.assistedLiving.occupied,    total: ct.assistedLiving.total },
  { label: "Memory Care",        occupied: ct.memoryCare.occupied,        total: ct.memoryCare.total },
];

export default function UnitBoard() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{community.name} — Unit Board</h2>
          <p className="text-sm text-gray-500 mt-0.5">{units.length} open or upcoming units</p>
        </div>
      </div>

      {/* Occupancy by care type */}
      <div className="grid grid-cols-3 gap-4">
        {occupancySummary.map((c) => {
          const pct = c.occupied / c.total;
          const open = c.total - c.occupied;
          const colors = careColors[c.label];
          return (
            <div key={c.label} className={`bg-white border ${open > 0 ? colors.border : "border-gray-200"} rounded-xl p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{c.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${open > 0 ? colors.badge : "bg-green-100 text-green-700"}`}>
                  {open > 0 ? `${open} open` : "Full"}
                </span>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{(pct * 100).toFixed(0)}%</div>
              <div className="text-xs text-gray-400 mb-2">{c.occupied} / {c.total} units occupied</div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${open > 0 ? "bg-violet-400" : "bg-green-400"}`} style={{ width: `${pct * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Open unit cards */}
      <div className="grid grid-cols-3 gap-4">
        {units.map((unit) => {
          const colors = careColors[unit.careType] ?? careColors["Memory Care"];
          const ranked = rankedByUnit[unit.id] ?? [];
          const top = ranked.slice(0, 2);
          return (
            <div key={unit.id} className={`bg-white border ${colors.border} rounded-xl overflow-hidden`}>
              <div className={`${colors.bg} border-b ${colors.border} px-4 py-3`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${colors.dot} inline-block shrink-0`} />
                  <span className="text-sm font-semibold text-gray-900">{unit.id}</span>
                  <span className="text-xs text-gray-500">{unit.careType}</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">{unit.room} · available {unit.availableFrom}</div>
                <div>
                  <span className="text-xl font-semibold text-gray-900">${unit.monthlyPrice.toLocaleString()}</span>
                  <span className="text-xs text-gray-500">/mo</span>
                </div>
              </div>
              <div className="px-4 py-3">
                {unit.daysVacant > 0 && (
                  <div className="text-xs text-gray-500 mb-2">
                    Vacant <span className="font-semibold text-red-600">{unit.daysVacant} days</span>
                    <span className="text-gray-400 ml-2">· {unit.notes}</span>
                  </div>
                )}
                {top.length > 0 ? (
                  <>
                    <div className="text-xs font-medium text-gray-700 mb-2">Best-fit leads</div>
                    <div className="space-y-2">
                      {top.map((m) => (
                        <div key={m.family.id} className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-gray-900 leading-tight">{m.family.name}</span>
                            <span className="text-xs font-semibold text-violet-700 shrink-0">{m.score} fit</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {m.family.intent.replace("-", " ")} · ${m.family.monthlyBudget.toLocaleString()}/mo · {m.family.urgencyDays}d
                          </div>
                          {m.isConcessionCandidate && (
                            <div className="text-xs text-amber-700 mt-0.5">💳 ${m.budgetGap} gap → suggest credit</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-gray-400">No matched leads in pipeline</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
