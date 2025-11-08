import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";
import ResultValue from "../../components/ui/ResultValue";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts";

export default function InterferenceResults({ results }) {
  if (!results) return (
    <ModuleCard title="Results" subtitle="Run a calculation to see outputs."><div className="text-sm text-gray-500">No results yet.</div></ModuleCard>
  );

  const { V_int = 0, V_shift = 0, V_new = 0, k_type, k_src, status, severity, mitigations = [] } = results || {};
  const allRows = [
    { Metric: "Interference Voltage", Value: Number(V_int)||0, Unit: "V" },
    { Metric: "Potential Shift", Value: Number(V_shift)||0, Unit: "V" },
    { Metric: "New Pipe Potential", Value: Number(V_new)||0, Unit: "V" },
    { Metric: "Type Coefficient", Value: Number(k_type)||0, Unit: "-" },
    { Metric: "Source Multiplier", Value: Number(k_src)||0, Unit: "-" },
  ];
  const filename = "interference_results.csv";

  const formula = "Vint = (I · ρ) / (2π · d · k_type) × k_source";

  return (
    <div className="space-y-4">
      <ModuleCard
        title="Key Results"
        subtitle={<span className="inline-flex items-center gap-2"><span className="text-xs uppercase tracking-wide text-gray-500">Formula</span><span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 border text-gray-700 dark:text-gray-300">{formula}</span></span>}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ResultValue label="Interference Voltage" value={Number(V_int)||0} unit="V" precision={3} csvData={allRows} csvFilename={filename} />
          <ResultValue label="Potential Shift" value={Number(V_shift)||0} unit="V" precision={3} csvData={allRows} csvFilename={filename} />
          <ResultValue label="New Pipe Potential" value={Number(V_new)||0} unit="V" precision={3} csvData={allRows} csvFilename={filename} />
        </div>
      </ModuleCard>

      <ModuleCard title="Assessment" subtitle="Status and mitigation recommendations">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Status</div>
            <div className={`font-semibold ${status === 'Warning' ? 'text-red-600' : 'text-green-600'}`}>{status}</div>
          </div>
          <div>
            <div className="text-gray-500">Severity</div>
            <div className="font-semibold">{severity}</div>
          </div>
          <div>
            <div className="text-gray-500">Type / Source Coefficients</div>
            <div className="font-semibold">k_type = {Number(k_type).toFixed(2)}, k_source = {Number(k_src).toFixed(2)}</div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 dark:text-gray-300 border-b">
                <th className="py-1 pr-2">Mitigation Method</th>
                <th className="py-1 pr-2">Effectiveness</th>
                <th className="py-1 pr-2">Cost</th>
                <th className="py-1 pr-2">Recommended</th>
              </tr>
            </thead>
            <tbody>
              {mitigations.map((m, idx) => (
                <tr key={idx} className="border-b last:border-b-0">
                  <td className="py-1 pr-2">{m.Method}</td>
                  <td className="py-1 pr-2">{m.Effectiveness}</td>
                  <td className="py-1 pr-2">{m.Cost}</td>
                  <td className="py-1 pr-2">{m.Recommended}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ModuleCard>

      <ModuleCard title="Visual Representation" subtitle="Interference voltage vs. distance">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={Array.isArray(results.series) ? results.series : []} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="d_m" tick={{ fontSize: 11 }} label={{ value: "Distance d (m)", position: "insideBottomRight", offset: -2 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v)=>`${v}`} label={{ value: "Vint (V)", angle: -90, position: "insideLeft" }} />
              {Number(results?.d_m) > 0 && (
                <ReferenceLine x={Number(results.d_m)} stroke="#ef4444" strokeDasharray="4 4" label={`d=${Number(results.d_m).toFixed(2)} m`} />
              )}
              <Tooltip formatter={(v)=>`${Number(v).toFixed(3)} V`} labelFormatter={(l)=>`d=${Number(l).toFixed(2)} m`} />
              <Legend />
              <Line type="monotone" dataKey="V_int" name="Interference Voltage (V)" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ModuleCard>
    </div>
  );
}
