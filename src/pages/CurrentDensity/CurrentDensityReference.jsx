import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";
import { TABLES } from "./utils";

export default function CurrentDensityReference({ environment }) {
  const rows = TABLES[environment] || [];
  const unitLabel = 'mA/m²';
  const title = `Reference Table — ${environment.charAt(0).toUpperCase() + environment.slice(1)}`;
  const fmt = (n, digits = 2) => {
    const num = Number(n || 0);
    const fixed = num.toFixed(digits);
    const [i, d] = fixed.split(".");
    const intFmt = i.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return d ? `${intFmt}.${d}` : intFmt;
  };

  return (
    <ModuleCard title={title} subtitle="Standards-based dataset used by the calculator. Not user-editable.">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/60">
              <th className="px-3 py-2 font-semibold">Coating Condition</th>
              <th className="px-3 py-2 font-semibold">Coating Type</th>
              <th className="px-3 py-2 font-semibold">Current Density ({unitLabel})</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={`${r.condition}-${r.type}-${idx}`} className={idx % 2 ? 'bg-gray-50 dark:bg-gray-800/40' : ''}>
                <td className="px-3 py-2 font-medium">{r.condition}</td>
                <td className="px-3 py-2">{r.type}</td>
                <td className="px-3 py-2">{fmt(r.range[0], 2)} – {fmt(r.range[1], 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ModuleCard>
  );
}
