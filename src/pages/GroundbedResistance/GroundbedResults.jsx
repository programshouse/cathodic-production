import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";
import ResultValue from "../../components/ui/ResultValue";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";

export default function GroundbedResults({ results }) {
  if (!results) return null;
  const { R_single, R_total, series, unitLabel = "Ω" } = results;

  const fmt = (n, digits = 3) => {
    const num = Number(n || 0);
    const fixed = num.toFixed(digits);
    const [i, d] = fixed.split(".");
    const intFmt = i.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return d ? `${intFmt}.${d}` : intFmt;
  };

  const yMax = Math.max(...(series || []).map((d) => d.value), R_total, R_single) * 1.25 || 10;

  return (
    <div className="space-y-4">
      <ModuleCard title="Key Results">
        <div className="space-y-4">
          <ResultValue
            label="Total Groundbed Resistance"
            formula="R_total = R_single / (N × F)"
            value={R_total}
            unit={unitLabel}
            precision={3}
            csvData={[["metric","value","unit"],["R_total", R_total, unitLabel]]}
            csvFilename={`groundbed-resistance-total.csv`}
          />
          <ResultValue
            label="Single-Anode Resistance"
            formula="Vertical/Horizontal formulas per standard"
            value={R_single}
            unit={unitLabel}
            precision={3}
            csvData={[["metric","value","unit"],["R_single", R_single, unitLabel]]}
            csvFilename={`groundbed-resistance-single.csv`}
          />
        </div>
      </ModuleCard>
      <ModuleCard title="Equations" subtitle="According to standard resistance-to-earth formulations">
        <pre className="text-sm md:text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-100 dark:border-gray-800">{`Vertical Single: R = (ρ / 2πL) [ ln(8L/d) - 1 ]
Horizontal Single: R = (ρ / 2πL) [ ln(2L/d) - 1 ]
Multiple in Parallel: R_total = R_single / (N × F)`}</pre>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Single-Anode Resistance</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">{fmt(R_single)} {unitLabel}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Resistance</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">{fmt(R_total)} {unitLabel}</div>
          </div>
        </div>

        {series && series.length ? (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Total Resistance vs Number of Anodes</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ top: 8, right: 16, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="n" tick={{ fontSize: 12 }} label={{ value: "Anodes (N)", position: "insideBottomRight", offset: -4 }} />
                  <YAxis domain={[0, yMax]} tick={{ fontSize: 12 }} tickFormatter={(v) => fmt(v)} label={{ value: unitLabel, angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(v) => `${fmt(v)} ${unitLabel}`} labelFormatter={(l) => `N = ${l}`} />
                  <ReferenceLine y={R_total} stroke="#2563eb" strokeDasharray="4 2" label={{ value: `Total ${fmt(R_total)} ${unitLabel}`, position: 'right', fill: '#2563eb', fontSize: 12 }} />
                  <Line type="monotone" dataKey="value" name="R_total" stroke="#3b82f6" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : null}
      </ModuleCard>
    </div>
  );
}
