import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";
import ResultValue from "../../components/ui/ResultValue";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";

export default function CoatingFactorsResults({ results }) {
  if (!results) return null;
  const { final, series, unitLabel = "(dimensionless)" } = results;

  const fmt = (n, digits = 4) => {
    const num = Number(n || 0);
    const fixed = num.toFixed(digits);
    const [i, d] = fixed.split(".");
    const intFmt = i.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return d ? `${intFmt}.${d}` : intFmt;
  };

  const yMax = Math.max(...series.map((d) => d.value), final) * 1.25 || 0.02;

  return (
    <div className="space-y-4">
      <ModuleCard title="Key Result">
        <ResultValue
          label="Final Breakdown Factor"
          formula="f_c = f_0 × (1 + r × t) × f_T × f_s"
          value={final}
          unit={unitLabel}
          precision={4}
          csvData={[["metric","value","unit"],["f_c", final, unitLabel]]}
          csvFilename={`coating-factors-result.csv`}
        />
      </ModuleCard>
      <ModuleCard title="Equation">
        <pre className="text-sm md:text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-100 dark:border-gray-800">{`f_c = Initial Factor × (1 + Annual Degradation Rate × Design Life) × Temperature Factor × Soil Factor`}</pre>
        <div className="flex items-center justify-between mb-3 mt-3">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Final Breakdown Factor</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">{fmt(final, 4)} {unitLabel}</div>
          </div>
        </div>

        <div className="mt-2">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Trend over Design Life</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 8, right: 16, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} label={{ value: "Years", position: "insideBottomRight", offset: -4 }} />
                <YAxis domain={[0, yMax]} tick={{ fontSize: 12 }} tickFormatter={(v) => fmt(v, 4)} />
                <Tooltip formatter={(v) => fmt(v, 4)} labelFormatter={(l) => `Year ${l}`} />
                <ReferenceLine y={final} stroke="#2563eb" strokeDasharray="4 2" label={{ value: `Final ${fmt(final, 4)}`, position: 'right', fill: '#2563eb', fontSize: 12 }} />
                <Line type="monotone" dataKey="value" name="Breakdown Factor" stroke="#3b82f6" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ModuleCard>
    </div>
  );
}
