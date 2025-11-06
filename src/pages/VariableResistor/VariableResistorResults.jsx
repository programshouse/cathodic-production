import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";
import ResultValue from "../../components/ui/ResultValue";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function VariableResistorResults({ results }) {
  if (!results) return (
    <ModuleCard title="Results" subtitle="Run a calculation to see outputs.">
      <div className="text-sm text-gray-500">No results yet.</div>
    </ModuleCard>
  );

  const { V_required = 0, I_rectifier = 0, V_rectifier = 0, P_required = 0 } = results || {};
  const allRows = [
    { Label: "Required Voltage", Value: Number(V_required)||0, Unit: "V" },
    { Label: "Power Requirement", Value: Number(P_required)||0, Unit: "W" },
    { Label: "Rectifier Current Rating", Value: Number(I_rectifier)||0, Unit: "A" },
    { Label: "Rectifier Voltage Rating", Value: Number(V_rectifier)||0, Unit: "V" },
  ];
  const filename = "variable_resistor_results.csv";
  const voltageData = [
    { name: "Voltage", Required: Number(V_required) || 0, Rated: Number(V_rectifier) || 0 },
  ];
  const ratingsData = [
    { name: "Ratings", Current: Number(I_rectifier) || 0, Power: Number(P_required) || 0 },
  ];
  const formula = "Vreq = I·R + Vdrive + Vanode;  Irated = I·SF;  Vrated = Vreq·SF;  P = Vreq·I";

  return (
    <div className="space-y-4">
      <ModuleCard
        title="Key Results"
        subtitle={<span className="inline-flex items-center gap-2"><span className="text-xs uppercase tracking-wide text-gray-500">Formula</span><span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 border text-gray-700 dark:text-gray-300">{formula}</span></span>}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResultValue label="Required Voltage" value={Number(V_required)||0} unit="V" precision={3} csvData={allRows} csvFilename={filename} />
          <ResultValue label="Power Requirement" value={Number(P_required)||0} unit="W" precision={3} csvData={allRows} csvFilename={filename} />
          <ResultValue label="Rectifier Current Rating" value={Number(I_rectifier)||0} unit="A" precision={3} csvData={allRows} csvFilename={filename} />
          <ResultValue label="Rectifier Voltage Rating" value={Number(V_rectifier)||0} unit="V" precision={3} csvData={allRows} csvFilename={filename} />
        </div>
      </ModuleCard>

      <ModuleCard title="Voltage Overview" subtitle="Required vs Rated">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={voltageData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tickFormatter={(v)=>`${v}`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, n)=>[`${Number(v).toFixed(3)} ${n === 'Current' ? 'A' : 'V'}`, n]} />
              <Legend />
              <Bar yAxisId="left" dataKey="Required" fill="#1d4ed8" radius={[6,6,0,0]} />
              <Bar yAxisId="left" dataKey="Rated" fill="#60a5fa" radius={[6,6,0,0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ModuleCard>

      <ModuleCard title="Ratings & Power" subtitle="Current vs Power (dual axis)">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={ratingsData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tickFormatter={(v)=>`${v} A`} tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(v)=>`${v} W`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, n)=>[`${Number(v).toFixed(3)} ${n === 'Current' ? 'A' : 'W'}`, n]} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="Current" stroke="#10b981" strokeWidth={2} dot={false} />
              <Bar yAxisId="right" dataKey="Power" fill="#ef4444" radius={[6,6,0,0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ModuleCard>
    </div>
  );
}
