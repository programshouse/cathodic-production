import React from "react";

/**
 * CalculatorPanel
 *
 * Props:
 * - title, subtitle: simple header text (ignored if `header` is provided)
 * - header: custom header node (replaces title/subtitle area)
 * - headerActions: right-aligned header actions (e.g., SaveRunButton)
 * - left: main form/content column
 * - right: side column (results / tabs / info)
 * - footer: optional footer node
 *
 * Design options (all optional; sensible defaults):
 * - leftCard: wrap the left content in a card (default: true)
 * - stickyRight: make the right column sticky (default: true)
 * - rightStickyOffset: top offset (px) for sticky right (default: 16)
 * - leftClassName, rightClassName, className: extra class names
 */
export default function CalculatorPanel({
  title,
  subtitle,
  header,
  headerActions,
  left,
  right,
  footer,

  // design flags
  leftCard = true,
  stickyRight = true,
  rightStickyOffset = 16,

  // extra classes
  leftClassName = "",
  rightClassName = "",
  className = "",
}) {
  return (
    <div className={`grid grid-cols-12 gap-4 md:gap-6 ${className}`}>
      {/* Header */}
      <div className="col-span-12">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {header ? (
              <div className="w-full">{header}</div>
            ) : (
              <div>
                {title ? (
                  <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                    {title}
                  </h1>
                ) : null}
                {subtitle ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            )}
          </div>

          {headerActions ? (
            <div className="shrink-0 ml-2 mt-1 flex items-center gap-2">
              {headerActions}
            </div>
          ) : null}
        </div>
      </div>

      {/* Left column */}
      <div className={`col-span-12 lg:col-span-7 ${leftClassName}`}>
        {leftCard ? (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 backdrop-blur p-4 md:p-6">
            {left}
          </div>
        ) : (
          left
        )}
      </div>

      {/* Right column */}
      <div
        className={`col-span-12 lg:col-span-5 ${rightClassName} ${
          stickyRight ? "relative" : ""
        }`}
      >
        <div
          className={
            stickyRight
              ? `sticky space-y-4 top-[${rightStickyOffset}px]`
              : "space-y-4"
          }
          /* If your Tailwind build doesn’t allow arbitrary values inside template strings,
             you can swap the class above with:
             style={stickyRight ? { position: 'sticky', top: rightStickyOffset } : undefined}
          */
          style={stickyRight ? { position: "sticky", top: rightStickyOffset } : undefined}
        >
          {right}
        </div>
      </div>

      {/* Footer */}
      {footer ? <div className="col-span-12 pt-1">{footer}</div> : null}
    </div>
  );
}
