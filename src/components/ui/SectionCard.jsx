import React from "react";

export default function SectionCard({ title, subtitle, actions, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 backdrop-blur p-4 md:p-6">
      {(title || subtitle || actions) && (
        <div className="mb-4 flex items-start justify-between">
          <div>
            {title ? (
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            ) : null}
            {subtitle ? (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            ) : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      )}
      {children}
    </div>
  );
}
