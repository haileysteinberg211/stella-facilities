import { useState } from "react";

function Slider({ label, value, min, max, step = 1, format, onChange, hint }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <label className="text-sm text-gray-700">{label}</label>
        <span className="text-sm font-semibold text-gray-900">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-violet-600 h-1.5 rounded-full cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{format(min)}</span>
        {hint && <span className="text-violet-500 text-xs">{hint}</span>}
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, highlight }) {
  return (
    <div className={`rounded-xl p-4 border ${highlight ? "bg-violet-50 border-violet-200" : "bg-white border-gray-200"}`}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-semibold ${highlight ? "text-violet-700" : "text-gray-900"}`}>{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

const fmt$ = (v) => "$" + Math.round(v).toLocaleString();
const fmtPct = (v) => v.toFixed(1) + "%";
const fmtX = (v) => v.toFixed(1) + "x";

export default function ROICalculator() {
  const [units, setUnits] = useState(120);
  const [avgRate, setAvgRate] = useState(4800);
  const [currentOcc, setCurrentOcc] = useState(85);
  const [occupancyLift, setOccupancyLift] = useState(2.5);
  const [leadSpendSavings, setLeadSpendSavings] = useState(15);
  const [concessionRate, setConcessionRate] = useState(20);
  const [concessionAmt, setConcessionAmt] = useState(1500);
  const [saasPrice, setSaasPrice] = useState(200);

  const newOcc = Math.min(currentOcc + occupancyLift, 98);
  const currentRevenue = units * (currentOcc / 100) * avgRate;
  const newRevenue = units * (newOcc / 100) * avgRate;
  const monthlyRevenueLift = newRevenue - currentRevenue;
  const annualRevenueLift = monthlyRevenueLift * 12;

  const estimatedLeadSpend = units * 25;
  const leadSpendSaved = estimatedLeadSpend * (leadSpendSavings / 100);
  const annualLeadSavings = leadSpendSaved * 12;

  const openUnitsAtAnyTime = units * (1 - currentOcc / 100);
  const monthlyConcessionsGiven = openUnitsAtAnyTime * (concessionRate / 100) * (concessionAmt / 12);
  const annualConcessionCost = monthlyConcessionsGiven * 12;

  const annualSaasCost = saasPrice * 12;
  const annualBenefit = annualRevenueLift + annualLeadSavings - annualConcessionCost;
  const netAnnualBenefit = annualBenefit - annualSaasCost;
  const roiMultiple = annualSaasCost > 0 ? annualBenefit / annualSaasCost : 0;
  const paybackMonths = annualSaasCost > 0 ? (annualSaasCost / (annualBenefit / 12)) : 0;

  const revPAUBefore = currentRevenue / units;
  const revPAUAfter = newRevenue / units;

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">ROI Calculator</h2>
        <p className="text-sm text-gray-500 mt-0.5">Estimate the revenue impact of Stella for your community. All figures are projections — <span className="italic">label them as assumptions in any conversation.</span></p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Inputs */}
        <div className="col-span-1 bg-white border border-gray-200 rounded-xl p-5 space-y-6">
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Community profile</div>
            <div className="space-y-4">
              <Slider label="Total units" value={units} min={40} max={400} onChange={setUnits} format={(v) => v + " units"} />
              <Slider label="Avg monthly rate" value={avgRate} min={2500} max={9000} step={100} onChange={setAvgRate} format={fmt$} />
              <Slider label="Current occupancy" value={currentOcc} min={65} max={95} step={0.5} onChange={setCurrentOcc} format={fmtPct} hint="industry avg ~85%" />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Stella assumptions</div>
            <div className="space-y-4">
              <Slider label="Occupancy lift" value={occupancyLift} min={0.5} max={6} step={0.5} onChange={setOccupancyLift} format={fmtPct} hint="conservative: 2–3%" />
              <Slider label="Lead spend efficiency gain" value={leadSpendSavings} min={0} max={40} step={5} onChange={setLeadSpendSavings} format={fmtPct} />
              <Slider label="Units receiving concession" value={concessionRate} min={0} max={50} step={5} onChange={setConcessionRate} format={fmtPct} />
              <Slider label="Concession amount" value={concessionAmt} min={500} max={5000} step={250} onChange={setConcessionAmt} format={fmt$} />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Pricing</div>
            <Slider label="Stella monthly fee" value={saasPrice} min={50} max={500} step={25} onChange={setSaasPrice} format={fmt$} hint="~$150–$250/mo typical" />
          </div>
        </div>

        {/* Results */}
        <div className="col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Annual revenue lift" value={fmt$(annualRevenueLift)} sub={`${fmt$(monthlyRevenueLift)}/mo from +${fmtPct(occupancyLift)} occupancy`} highlight />
            <MetricCard label="Net annual benefit" value={fmt$(netAnnualBenefit)} sub="after SaaS cost & concessions" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="ROI multiple" value={fmtX(roiMultiple)} sub="annual benefit ÷ SaaS cost" />
            <MetricCard label="Payback period" value={paybackMonths < 1 ? "<1 mo" : `${paybackMonths.toFixed(1)} mo`} sub="Stella pays for itself" />
          </div>

          {/* RevPAU comparison */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-sm font-medium text-gray-900 mb-4">Revenue per available unit (RevPAU)</div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-xs text-gray-500 mb-1">Without Stella</div>
                <div className="text-3xl font-semibold text-gray-400">{fmt$(revPAUBefore)}</div>
                <div className="text-xs text-gray-400 mt-1">per unit per month</div>
                <div className="mt-3 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-300 rounded-full" style={{ width: `${(revPAUBefore / avgRate) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">With Stella</div>
                <div className="text-3xl font-semibold text-violet-700">{fmt$(revPAUAfter)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  per unit per month
                  <span className="text-green-600 font-medium ml-1">+{fmt$(revPAUAfter - revPAUBefore)}</span>
                </div>
                <div className="mt-3 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(revPAUAfter / avgRate) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Waterfall breakdown */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-sm font-medium text-gray-900 mb-4">Annual P&L impact breakdown</div>
            <div className="space-y-3">
              {[
                { label: "Occupancy revenue lift", value: annualRevenueLift, color: "bg-green-500", positive: true },
                { label: "Lead spend efficiency savings", value: annualLeadSavings, color: "bg-blue-400", positive: true },
                { label: "Concession cost", value: -annualConcessionCost, color: "bg-amber-400", positive: false },
                { label: "Stella SaaS subscription", value: -annualSaasCost, color: "bg-red-400", positive: false },
              ].map((row) => {
                const maxVal = annualRevenueLift + annualLeadSavings;
                const barWidth = maxVal > 0 ? (Math.abs(row.value) / maxVal) * 100 : 0;
                return (
                  <div key={row.label} className="flex items-center gap-3">
                    <div className="w-44 text-xs text-gray-600 shrink-0">{row.label}</div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${row.color} rounded-full`} style={{ width: `${Math.min(barWidth, 100)}%` }} />
                    </div>
                    <div className={`text-sm font-semibold w-24 text-right ${row.positive ? "text-green-700" : "text-red-600"}`}>
                      {row.positive ? "+" : ""}{fmt$(row.value)}
                    </div>
                  </div>
                );
              })}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">Net annual benefit</span>
                <span className={`text-lg font-bold ${netAnnualBenefit >= 0 ? "text-green-700" : "text-red-600"}`}>
                  {netAnnualBenefit >= 0 ? "+" : ""}{fmt$(netAnnualBenefit)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-800 leading-relaxed">
            <strong>Assumptions:</strong> Occupancy lift is modeled as a direct rate increase — actual results depend on market conditions, sales team adoption, and time to trust the agent's recommendations. Lead spend savings assume ~$25/unit/month in referral spend; your actual spend may differ. Concession cost uses a one-time credit amortized over a 12-month stay. ROI attribution methodology must be designed into the pilot before quoting these numbers to buyers.
          </div>
        </div>
      </div>
    </div>
  );
}
