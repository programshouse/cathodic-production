import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b"]; // cable, anode, pipeline

export default function CircuitResistanceResults({ results }) {
  if (!results) return null;
  const { R_cable, R_anode, R_pipeline, R_total } = results;

  const fmt = (n, digits = 3) => {
    const num = Number(n || 0);
    const fixed = num.toFixed(digits);
    const [i, d] = fixed.split(".");
    const intFmt = i.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return d ? `${intFmt}.${d}` : intFmt;
  };

  const data = [
    { name: "Cable", value: R_cable },
    { name: "Anode Groundbed", value: R_anode },
    { name: "Pipeline", value: R_pipeline },
  ];

  return (
    <div className="space-y-4">
      <ModuleCard title="Equation" subtitle="R_total = R_cable + R_anode_groundbed + R_pipeline">
        <pre className="text-sm md:text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-100 dark:border-gray-800">{`Cable: R_cable = (ρ_material × Length) / Cross Section
Anode (Series): R_anode,total = R_anode × n
Anode (Parallel): R_anode,total = R_anode / n
Total: R_total = R_cable + R_anode,total + R_pipeline`}</pre>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Circuit Resistance</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">{fmt(R_total)} Ω</div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-end">Breakdown: Cable {fmt(R_cable)} Ω • Anode {fmt(R_anode)} Ω • Pipeline {fmt(R_pipeline)} Ω</div>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Circuit Resistance Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(e)=>`${e.name}: ${fmt(e.value)} Ω`}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v)=>`${fmt(v)} Ω`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ModuleCard>
    </div>
  );
}
