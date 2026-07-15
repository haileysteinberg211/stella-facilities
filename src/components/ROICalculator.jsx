import { useState } from "react";
import { t, card } from "../theme.js";

// ── Shared inline style fragments (APFM / Stella brand) ───────────────────────
const sectionLabel = {
  fontFamily: t.sans,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: t.gray500,
  marginBottom: 12,
};

const kpiLabel = {
  fontFamily: t.sans,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: t.gray500,
};

const cardTitle = {
  fontFamily: t.display,
  fontWeight: 600,
  fontSize: 18,
  color: t.navy,
  marginBottom: 16,
};

function Slider({ label, value, min, max, step = 1, format, onChange, hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <label style={{ fontFamily: t.sans, fontSize: 14, fontWeight: 600, color: t.gray700 }}>{label}</label>
        <span
          style={{
            fontFamily: t.sans,
            fontSize: 14,
            fontWeight: 700,
            color: t.navy,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: t.coral, cursor: "pointer" }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontFamily: t.sans,
          fontSize: 12,
          color: t.gray500,
        }}
      >
        <span>{format(min)}</span>
        {hint && <span style={{ color: t.blue, fontWeight: 600 }}>{hint}</span>}
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, dark, valueColor }) {
  return (
    <div
      style={{
        ...card,
        padding: "20px 22px",
        ...(dark ? { background: t.navy, border: `1px solid ${t.navy}` } : {}),
      }}
    >
      <div style={{ ...kpiLabel, color: dark ? "#A9C2D1" : t.gray500 }}>{label}</div>
      <div
        style={{
          fontFamily: t.display,
          fontWeight: 600,
          fontSize: 40,
          lineHeight: 1.1,
          margin: "6px 0 4px",
          color: valueColor || (dark ? t.white : t.navy),
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily: t.sans, fontSize: 13, color: dark ? "#A9C2D1" : t.gray500, lineHeight: 1.5 }}>
          {sub}
        </div>
      )}
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
    <div style={{ maxWidth: 1160, margin: "0 auto", padding: "28px 24px", background: t.cream }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: t.display, fontWeight: 600, fontSize: 26, lineHeight: 1.2, color: t.navy, margin: 0 }}>
          ROI Calculator
        </h2>
        <p
          style={{
            fontFamily: t.sans,
            fontSize: 15,
            color: t.gray700,
            margin: "8px 0 0",
            maxWidth: "72ch",
            lineHeight: 1.6,
          }}
        >
          Estimate the revenue impact of Stella for your community. All figures are projections —{" "}
          <span style={{ fontStyle: "italic" }}>label them as assumptions in any conversation.</span>
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 2fr", gap: 24, alignItems: "start" }}>
        {/* Inputs */}
        <div style={{ ...card, display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <div style={sectionLabel}>Community profile</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Slider label="Total units" value={units} min={40} max={400} onChange={setUnits} format={(v) => v + " units"} />
              <Slider label="Avg monthly rate" value={avgRate} min={2500} max={9000} step={100} onChange={setAvgRate} format={fmt$} />
              <Slider label="Current occupancy" value={currentOcc} min={65} max={95} step={0.5} onChange={setCurrentOcc} format={fmtPct} hint="industry avg ~85%" />
            </div>
          </div>

          <div>
            <div style={sectionLabel}>Stella assumptions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Slider label="Occupancy lift" value={occupancyLift} min={0.5} max={6} step={0.5} onChange={setOccupancyLift} format={fmtPct} hint="conservative: 2–3%" />
              <Slider label="Lead spend efficiency gain" value={leadSpendSavings} min={0} max={40} step={5} onChange={setLeadSpendSavings} format={fmtPct} />
              <Slider label="Units receiving concession" value={concessionRate} min={0} max={50} step={5} onChange={setConcessionRate} format={fmtPct} />
              <Slider label="Concession amount" value={concessionAmt} min={500} max={5000} step={250} onChange={setConcessionAmt} format={fmt$} />
            </div>
          </div>

          <div>
            <div style={sectionLabel}>Pricing</div>
            <Slider label="Stella monthly fee" value={saasPrice} min={50} max={500} step={25} onChange={setSaasPrice} format={fmt$} hint="~$150–$250/mo typical" />
          </div>
        </div>

        {/* Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <MetricCard label="Annual revenue lift" value={fmt$(annualRevenueLift)} sub={`${fmt$(monthlyRevenueLift)}/mo from +${fmtPct(occupancyLift)} occupancy`} dark />
            <MetricCard label="Net annual benefit" value={fmt$(netAnnualBenefit)} sub="after SaaS cost & concessions" valueColor={netAnnualBenefit >= 0 ? t.success : t.danger} />
            <MetricCard label="ROI multiple" value={fmtX(roiMultiple)} sub="annual benefit ÷ SaaS cost" />
            <MetricCard label="Payback period" value={paybackMonths < 1 ? "<1 mo" : `${paybackMonths.toFixed(1)} mo`} sub="Stella pays for itself" />
          </div>

          {/* RevPAU comparison */}
          <div style={{ ...card }}>
            <div style={cardTitle}>Revenue per available unit (RevPAU)</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <div style={{ ...kpiLabel, marginBottom: 6 }}>Without Stella</div>
                <div style={{ fontFamily: t.display, fontWeight: 600, fontSize: 34, color: t.gray500, fontVariantNumeric: "tabular-nums" }}>
                  {fmt$(revPAUBefore)}
                </div>
                <div style={{ fontFamily: t.sans, fontSize: 12, color: t.gray500, marginTop: 4 }}>per unit per month</div>
                <div style={{ marginTop: 12, height: 12, background: t.gray100, borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: t.gray300, borderRadius: 999, width: `${(revPAUBefore / avgRate) * 100}%` }} />
                </div>
              </div>
              <div>
                <div style={{ ...kpiLabel, marginBottom: 6 }}>With Stella</div>
                <div style={{ fontFamily: t.display, fontWeight: 600, fontSize: 34, color: t.coral, fontVariantNumeric: "tabular-nums" }}>
                  {fmt$(revPAUAfter)}
                </div>
                <div style={{ fontFamily: t.sans, fontSize: 12, color: t.gray500, marginTop: 4 }}>
                  per unit per month
                  <span style={{ color: t.success, fontWeight: 700, marginLeft: 6 }}>+{fmt$(revPAUAfter - revPAUBefore)}</span>
                </div>
                <div style={{ marginTop: 12, height: 12, background: t.gray100, borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: t.coral, borderRadius: 999, width: `${(revPAUAfter / avgRate) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Waterfall breakdown */}
          <div style={{ ...card }}>
            <div style={cardTitle}>Annual P&L impact breakdown</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Occupancy revenue lift", value: annualRevenueLift, color: t.success, positive: true },
                { label: "Lead spend efficiency savings", value: annualLeadSavings, color: t.blue, positive: true },
                { label: "Concession cost", value: -annualConcessionCost, color: t.warning, positive: false },
                { label: "Stella SaaS subscription", value: -annualSaasCost, color: t.apricot, positive: false },
              ].map((row) => {
                const maxVal = annualRevenueLift + annualLeadSavings;
                const barWidth = maxVal > 0 ? (Math.abs(row.value) / maxVal) * 100 : 0;
                return (
                  <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 176, flexShrink: 0, fontFamily: t.sans, fontSize: 12, color: t.gray700 }}>{row.label}</div>
                    <div style={{ flex: 1, height: 8, background: t.gray100, borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: row.color, borderRadius: 999, width: `${Math.min(barWidth, 100)}%` }} />
                    </div>
                    <div
                      style={{
                        width: 96,
                        textAlign: "right",
                        fontFamily: t.sans,
                        fontSize: 14,
                        fontWeight: 700,
                        fontVariantNumeric: "tabular-nums",
                        color: row.positive ? t.success : t.danger,
                      }}
                    >
                      {row.positive ? "+" : ""}{fmt$(row.value)}
                    </div>
                  </div>
                );
              })}
              <div
                style={{
                  paddingTop: 12,
                  borderTop: `1px solid ${t.gray100}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontFamily: t.sans, fontSize: 14, fontWeight: 700, color: t.navy }}>Net annual benefit</span>
                <span
                  style={{
                    fontFamily: t.display,
                    fontSize: 20,
                    fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
                    color: netAnnualBenefit >= 0 ? t.success : t.danger,
                  }}
                >
                  {netAnnualBenefit >= 0 ? "+" : ""}{fmt$(netAnnualBenefit)}
                </span>
              </div>
            </div>
          </div>

          {/* Assumptions note */}
          <div
            style={{
              background: "#FBF0DC",
              border: `1px solid ${t.apricot}`,
              borderLeft: `3px solid ${t.warning}`,
              borderRadius: t.radius,
              padding: "14px 16px",
              fontFamily: t.sans,
              fontSize: 12.5,
              color: "#9A6B18",
              lineHeight: 1.7,
            }}
          >
            <strong>Assumptions:</strong> Occupancy lift is modeled as a direct rate increase — actual results depend on market conditions, sales team adoption, and time to trust the agent's recommendations. Lead spend savings assume ~$25/unit/month in referral spend; your actual spend may differ. Concession cost uses a one-time credit amortized over a 12-month stay. ROI attribution methodology must be designed into the pilot before quoting these numbers to buyers.
          </div>
        </div>
      </div>
    </div>
  );
}
