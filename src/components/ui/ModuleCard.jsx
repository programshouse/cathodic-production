import React from "react";

export default function ModuleCard({ title, subtitle, actions, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 backdrop-blur p-4 md:p-6">
      {(title || subtitle || actions) ? (
        <div className="flex items-start justify-between mb-3">
          <div>
            {title ? (
              <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            ) : null}
            {subtitle ? (
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
            ) : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}
