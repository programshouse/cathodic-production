import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";

export default function CoatingFactorsInfoCard({ onCsv, onReset }) {
  return (
    <ModuleCard
      title="Coating Breakdown Factors"
      subtitle="Equation and definitions"
      actions={
        <div className="flex items-center gap-2">
          <button type="button" onClick={onCsv} className="text-xs px-2 py-1 rounded-full border bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800">CSV</button>
          {onReset ? (
            <button type="button" onClick={onReset} className="text-xs px-2 py-1 rounded-full border bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800">Reset</button>
          ) : null}
        </div>
      }
    >
      <div className="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-100 dark:border-gray-800">{`Coating breakdown factor (linear):

f_f = f_i + (Δf × t_dl)

where f_i is the initial coating breakdown factor at start of operation,
Δf is the average yearly increase, and t_dl is design life (years).`}</pre>
      </div>
    </ModuleCard>
  );
}
