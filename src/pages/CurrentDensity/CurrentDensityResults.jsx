import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceArea, ReferenceLine, Scatter } from "recharts";

export default function CurrentDensityResults({ results }) {
  if (!results) return null;
  const { range25, jdFinal } = results;
  const min = Number(range25[0] || 0);
  const max = Number(range25[1] || 0);
  const yMax = Math.max(max, jdFinal) * 1.3 || 1;
  // single point for corrected marker at x = 0.5
  const point = [{ x: 0.5, corrected: jdFinal }];

  const unitLabel = 'mA/m²';

  const fmt = (n, digits = 2) => {
    const num = Number(n || 0);
    const fixed = num.toFixed(digits);
    const [i, d] = fixed.split(".");
    const intFmt = i.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return d ? `${intFmt}.${d}` : intFmt;
  };

  return (
    <div className="space-y-4">
      <ModuleCard title="Equation">
        <pre className="text-sm md:text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-100 dark:border-gray-800">{`Jd_final = Jd_@25°C × [1 + 0.02 × (Temperature − 25)]`}</pre>

        <div className="flex items-center justify-between mb-3 mt-3">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Recommended Current Density</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">{fmt(jdFinal, 2)} {unitLabel}</div>
          </div>
        </div>

        <div className="mt-2">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Visual Representation</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={point} margin={{ top: 8, right: 16, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" dataKey="x" domain={[0, 1]} hide />
                <YAxis type="number" domain={[0, yMax]} tick={{ fontSize: 12 }} tickFormatter={(v) => fmt(v, 2)} label={{ value: unitLabel, angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(v) => `${fmt(v, 2)} ${unitLabel}`} labelFormatter={() => ""} />
                {/* Range band */}
                <ReferenceArea x1={0} x2={1} y1={min} y2={max} stroke="#60a5fa" fill="#93c5fd" fillOpacity={0.35} />
                {/* Corrected marker and reference line */}
                <ReferenceLine y={jdFinal} stroke="#2563eb" strokeDasharray="4 2" label={{ value: `Corrected ${fmt(jdFinal, 2)} ${unitLabel}`, position: 'right', fill: '#2563eb', fontSize: 12 }} />
                <Scatter dataKey="corrected" name="Corrected" fill="#1d4ed8" shape="circle" line={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ModuleCard>

      {/* Reference table removed from Results; available under the Reference tab */}
    </div>
  );
}
