import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";
import ResultValue from "../../components/ui/ResultValue";
import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function SolarSizingResults({ results }) {
  if (!results) {
    return (
      <ModuleCard title="Results" subtitle="Run a calculation to see outputs.">
        <div className="text-sm text-gray-500">No results yet.</div>
      </ModuleCard>
    );
  }

  const { Edaily_Wh = 0, Ppanel_W = 0, Npanels = 0, Cbatt_Ah = 0, components = [] } = results || {};
  const formula = "Edaily = Ireq · Vreq · 24;  Ppanel = Edaily / (PSH · Efficiency);  Npanels = ceil(Ppanel/PanelW);  Cbatt = (Edaily·Days)/(Vreq·0.8)";

  const chartData = [
    { name: "Daily Energy", Wh: Number(Edaily_Wh) || 0 },
    { name: "Panel Power", W: Number(Ppanel_W) || 0 },
    { name: "Battery Capacity", Ah: Number(Cbatt_Ah) || 0 },
  ];

  return (
    <div className="space-y-4">
      <ModuleCard
        title="Key Results"
        subtitle={<span className="inline-flex items-center gap-2"><span className="text-xs uppercase tracking-wide text-gray-500">Formula</span><span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 border text-gray-700 dark:text-gray-300">{formula}</span></span>}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResultValue label="Daily Energy Requirement" value={Number(Edaily_Wh)||0} unit="Wh/day" precision={2} />
          <ResultValue label="Solar Panel Power" value={Number(Ppanel_W)||0} unit="W" precision={2} />
          <ResultValue label="Number of Panels" value={Number(Npanels)||0} unit={"-"} precision={0} />
          <ResultValue label="Battery Capacity" value={Number(Cbatt_Ah)||0} unit="Ah" precision={2} />
        </div>
      </ModuleCard>

      <ModuleCard title="Visual Representation" subtitle="Summary bars">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, n) => `${Number(v).toFixed(2)} ${n}`} />
              <Legend />
              <Bar dataKey="Wh" name="Wh/day" fill="#3b82f6" radius={[6,6,0,0]} />
              <Bar dataKey="W" name="W" fill="#10b981" radius={[6,6,0,0]} />
              <Bar dataKey="Ah" name="Ah" fill="#f59e0b" radius={[6,6,0,0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ModuleCard>

      <ModuleCard title="Components" subtitle="Indicative bill of materials">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 dark:text-gray-300 border-b">
                <th className="py-1 pr-2">Component</th>
                <th className="py-1 pr-2">Specification</th>
                <th className="py-1 pr-2">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {(components || []).map((row, idx) => (
                <tr key={idx} className="border-b last:border-b-0">
                  <td className="py-1 pr-2">{row.component}</td>
                  <td className="py-1 pr-2">{row.spec}</td>
                  <td className="py-1 pr-2">{row.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ModuleCard>
    </div>
  );
}
