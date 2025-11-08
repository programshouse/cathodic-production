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
        <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-100 dark:border-gray-800">{`f_c = Initial Factor × (1 + Annual Degradation Rate × Design Life) × Temperature Factor × Soil Factor`}</pre>
        <ul className="list-disc pl-6">
          <li><strong>Initial Factor</strong>: base coating breakdown factor.</li>
          <li><strong>Annual Degradation Rate</strong>: yearly increase in breakdown.</li>
          <li><strong>Temperature Factor</strong>: adjustment based on operating temperature.</li>
          <li><strong>Soil Factor</strong>: adjustment based on soil type.</li>
        </ul>
      </div>
    </ModuleCard>
  );
}
