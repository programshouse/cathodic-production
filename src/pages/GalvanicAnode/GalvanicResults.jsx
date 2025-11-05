import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";

export default function GalvanicResults({ results }) {
  if (!results) return null;
  const { I, W_required, N, lifeSeriesData } = results;

  const fmt = (n, digits = 3) => {
    const num = Number(n || 0);
    const fixed = num.toFixed(digits);
    const [i, d] = fixed.split(".");
    const intFmt = i.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return d ? `${intFmt}.${d}` : intFmt;
  };

  const yMax = Math.max(...(lifeSeriesData || []).map((d) => d.weight), W_required) * 1.25 || 10;

  return (
    <div className="space-y-4">
      <ModuleCard title="Equations" subtitle="I = A × Jd × f_c;  W_required = I × t × 8760 / (U × η);  N = W_required / W_single">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Current Requirement</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">{fmt(I,3)} A</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Required Anode Weight</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">{fmt(W_required,2)} kg</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Number of Anodes</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">{fmt(N,2)}</div>
          </div>
        </div>

        {lifeSeriesData && lifeSeriesData.length ? (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Required Weight vs Design Life</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lifeSeriesData} margin={{ top: 8, right: 16, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} label={{ value: "Years", position: "insideBottomRight", offset: -4 }} />
                  <YAxis domain={[0, yMax]} tick={{ fontSize: 12 }} tickFormatter={(v) => fmt(v,2)} label={{ value: "kg", angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(v) => `${fmt(v,2)} kg`} labelFormatter={(l) => `Year ${l}`} />
                  <ReferenceLine y={W_required} stroke="#2563eb" strokeDasharray="4 2" label={{ value: `At t: ${fmt(W_required,2)} kg`, position: 'right', fill: '#2563eb', fontSize: 12 }} />
                  <Line type="monotone" dataKey="weight" name="Required Weight" stroke="#3b82f6" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : null}
      </ModuleCard>
    </div>
  );
}
