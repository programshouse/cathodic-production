import React from "react";

export default function SimpleCard({
  title,
  subtitle,
  actions,
  children,
  className = "",
  maxWidth = "",
}) {
  return (
    <div
      className={[
        "w-full",
        "rounded-2xl border border-gray-200 dark:border-gray-800",
        "bg-white dark:bg-gray-900/50 backdrop-blur",
        "shadow-sm hover:shadow-md transition-shadow duration-200",
        "overflow-hidden",
        maxWidth,
        className,
      ].join(" ")}
    >
      {(title || subtitle || actions) ? (
        <div className="px-4 md:px-6 pt-4 md:pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-start justify-between gap-3">
            <div>
              {title ? (
                <h3 className="text-base md:text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                  {title}
                </h3>
              ) : null}
              {subtitle ? (
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
              ) : null}
            </div>
            {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
          </div>
        </div>
      ) : null}

      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
}
