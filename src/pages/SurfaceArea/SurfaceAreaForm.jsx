import React from "react";
import { STRUCTURE_TYPES, LENGTH_UNITS } from "./utils";

/**
 * Polished, brand-styled form
 * - Consistent section cards with titles
 * - Clear label/help, required asterisks
 * - Better spacing & responsive grid
 * - Accessible focus states using brand color
 * - Reuses the same props API you already have
 */
export default function SurfaceAreaForm(props) {
  const {
    structureType,
    onChangeType,
    inputs,
    units,
    onChangeUnit,
    onSubmit,
    submitting,
    headerActions,
    onReset,
    errors = {},
  } = props;

  const inputCls = [
    "w-full",
    "px-3 py-2.5",
    "rounded-xl",
    "border border-gray-200 dark:border-gray-700",
    "bg-white dark:bg-gray-800",
    "text-gray-900 dark:text-gray-100 text-base",
    "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
    "shadow-sm",
    "transition",
  ].join(" ");

  const Label = ({ children, required }) => (
    <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
      {children}
      {required && <span className="text-brand-600 dark:text-brand-400"> *</span>}
    </label>
  );

  const Help = ({ children }) => (
    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{children}</p>
  );

  const SectionCard = ({ title, subtitle, children, actions }) => (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 backdrop-blur p-4 md:p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </div>
  );

  const Header = () => (
    <div className="mb-6">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 opacity-90" />
        <div className="relative px-5 py-5 md:px-7 md:py-6">
          <h2 className="text-white text-xl md:text-2xl font-semibold tracking-tight">Surface Area Calculator</h2>
          <p className="text-brand-50/90 text-sm md:text-base mt-1">
            Select the structure type and enter dimensions with units. All fields marked * are required.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit && onSubmit(e);
      }}
      className="space-y-6"
    >
      <Header />

      {/* Structure Type */}
      <SectionCard
        title="Structure Type"
        subtitle="Choose the geometry you want to calculate for."
        actions={(
          <>
            {headerActions}
            {onReset ? (
              <button
                type="button"
                onClick={onReset}
                className="text-base px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              >
                Reset
              </button>
            ) : null}
          </>
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label required>Select Structure Type</Label>
            <select
              aria-label="Structure Type"
              value={structureType}
              onChange={(e) => onChangeType(e.target.value)}
              className={inputCls}
              required
            >
              {STRUCTURE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <Help>Pipeline, tank internal (wetted shell), or external bottom plate.</Help>
          </div>
        </div>
      </SectionCard>

      {/* Parameters */}
      <SectionCard title="Input Parameters" subtitle="Provide dimensions and select their units.">
        {(structureType === "pipeline" ||
          structureType === "tank-internal" ||
          structureType === "tank-external-bottom") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label required>Diameter</Label>
              <input
                type="number"
                step="any"
                min="0"
                inputMode="decimal"
                name="diameter"
                defaultValue={inputs.diameter || ""}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || ["-", "+", "e", "E"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onPaste={(e) => {
                  const text = (e.clipboardData || window.clipboardData).getData("text");
                  if (/^-/.test(text)) e.preventDefault();
                }}
                className={inputCls}
                placeholder="e.g., 1.2"
                required
              />
              <Help>Nominal or effective diameter.</Help>
            </div>
            <div>
              <Label required>Diameter Unit</Label>
              <select
                name="unit_diameter"
                value={units.diameter || "m"}
                onChange={(e) => onChangeUnit("diameter", e.target.value)}
                className={inputCls}
                aria-label="Diameter Unit"
                required
              >
                {LENGTH_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {structureType === "pipeline" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label required>Length</Label>
              <input
                type="number"
                step="any"
                min="0"
                inputMode="decimal"
                name="length"
                defaultValue={inputs.length || ""}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || ["-", "+", "e", "E"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onPaste={(e) => {
                  const text = (e.clipboardData || window.clipboardData).getData("text");
                  if (/^-/.test(text)) e.preventDefault();
                }}
                className={inputCls}
                placeholder="e.g., 100"
                required
              />
              <Help>Total pipeline run length.</Help>
            </div>
            <div>
              <Label required>Length Unit</Label>
              <select
                name="unit_length"
                value={units.length || "m"}
                onChange={(e) => onChangeUnit("length", e.target.value)}
                className={inputCls}
                aria-label="Length Unit"
                required
              >
                {LENGTH_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {structureType === "tank-internal" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Tank Height + Unit (two cells, standard widths) */}
            <div>
              <Label required>Tank Height</Label>
              <input
                type="number"
                step="any"
                min="0"
                inputMode="decimal"
                name="tankHeight"
                defaultValue={inputs.tankHeight || ""}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || ["-", "+", "e", "E"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onPaste={(e) => {
                  const text = (e.clipboardData || window.clipboardData).getData("text");
                  if (/^-/.test(text)) e.preventDefault();
                }}
                className={inputCls}
                placeholder="e.g., 12"
                required
              />
              <Help>Total internal tank height.</Help>
              {errors.tankHeight ? (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.tankHeight}
                </p>
              ) : null}
            </div>
            <div>
              <Label required>Tank Height Unit</Label>
              <select
                name="unit_tankHeight"
                value={units.tankHeight || "m"}
                onChange={(e) => onChangeUnit("tankHeight", e.target.value)}
                className={inputCls}
                aria-label="Tank Height Unit"
                required
              >
                {LENGTH_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* Wetted Height + Unit (one line, same widths as others) */}
            <div>
              <Label required>Wetted Height</Label>
              <input
                type="number"
                step="any"
                min="0"
                inputMode="decimal"
                name="height"
                defaultValue={inputs.height || ""}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || ["-", "+", "e", "E"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onPaste={(e) => {
                  const text = (e.clipboardData || window.clipboardData).getData("text");
                  if (/^-/.test(text)) e.preventDefault();
                }}
                className={inputCls}
                placeholder="e.g., 8"
                required
                aria-label="Wetted Height"
              />
              <Help>Liquid contact height inside the tank.</Help>
              {errors.height ? (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.height}</p>
              ) : null}
            </div>
            <div>
              <Label required>Wetted Height Unit</Label>
              <select
                name="unit_height"
                value={units.height || 'm'}
                onChange={(e) => onChangeUnit('height', e.target.value)}
                className={inputCls}
                aria-label="Wetted Height Unit"
                required
              >
                {LENGTH_UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            {/* Include Bottom full-width */}
            <div className="md:col-span-2">
              <Label>Include Bottom Plate</Label>
              <select
                name="includeBottom"
                defaultValue={String(inputs.includeBottom ?? true)}
                className={inputCls}
                aria-label="Include Bottom Plate"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
              <Help>Include the bottom plate area in the total.</Help>
            </div>
          </div>
        )}
      </SectionCard>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-medium px-5 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {submitting ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Calculating...
            </>
          ) : (
            <>Calculate Surface Area</>
          )}
        </button>
      </div>
    </form>
  );
}
