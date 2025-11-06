import React from "react";

export default function ResultValue({
  label,
  formula,
  value,
  unit,
  unitOptions = [],
  onUnitChange,
  precision = 3,
  csvData, // optional: array of arrays or array of objects
  csvFilename = "result.csv",
}) {
  const formatted = (v) => {
    if (v === null || v === undefined || Number.isNaN(v)) return "—";
    return Number(v).toFixed(precision);
  };

  const copyToClipboard = () => {
    const text = `${formatted(value)} ${unit || ""}`.trim();
    try { navigator.clipboard?.writeText(text); } catch { /* ignore */ }
  };

  const toCSV = (rows) => {
    if (!rows || !rows.length) return "";
    if (Array.isArray(rows[0])) {
      return rows.map((r) => r.map((c) => `"${String(c ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    }
    const headers = Object.keys(rows[0]);
    const head = headers.join(",");
    const body = rows.map((row) => headers.map((h) => `"${String(row[h] ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    return `${head}\n${body}`;
  };

  const downloadCSV = () => {
    if (!csvData || !csvData.length) return;
    const csv = toCSV(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = csvFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base md:text-lg font-semibold">{label}</h3>
          {formula ? (
            <div className="text-xs md:text-sm text-gray-500">{formula}</div>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {csvData && csvData.length > 0 && (
            <button
              type="button"
              onClick={downloadCSV}
              className="text-xs px-2 py-1 rounded-full border bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              CSV
            </button>
          )}
          {unitOptions.length > 0 && (
            <select
              className="text-sm rounded-md border px-2 py-1 bg-white dark:bg-gray-900"
              value={unit}
              onChange={(e) => onUnitChange?.(e.target.value)}
            >
              {unitOptions.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="text-2xl md:text-3xl font-semibold tracking-tight">
          {formatted(value)} {unit}
        </div>
        <button
          type="button"
          onClick={copyToClipboard}
          className="text-xs px-2 py-1 rounded-full border bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Copy
        </button>
      </div>
    </div>
  );
}
