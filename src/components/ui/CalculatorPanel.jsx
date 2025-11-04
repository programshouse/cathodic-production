import React from "react";

export default function CalculatorPanel({ title, subtitle, left, right, footer }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {subtitle ? (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
          ) : null}
        </div>
        {/* {headerActions ? (
          <div className="flex items-center gap-2">{headerActions}</div>
        ) : null} */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          {left}
        </div>
        <div className="space-y-4">
          {right}
        </div>
      </div>

      {footer ? (
        <div className="pt-2">{footer}</div>
      ) : null}
    </div>
  );
}
