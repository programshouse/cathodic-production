import React from "react";
import { captureNodeToPng } from "../../lib/capture";
import { addItem, getActiveProjectId } from "../../lib/history";

function classNames(...a) { return a.filter(Boolean).join(" "); }

export default function SaveRunButton({
  moduleKey,           // e.g., "galvanic_calc"
  label,               // human label shown in history (e.g., "Galvanic Anode")
  getPayload,          // () => { inputs, results }  (module page provides it)
  chartRef,            // React ref to chart/container DOM node
  className = "",
  onSaved,             // optional callback({projectId, item})
}) {
  const [busy, setBusy] = React.useState(false);

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const projectId = getActiveProjectId();
      if (!projectId) {
        alert("Create/select a project first in History.");
        return;
      }

      const { inputs, results } = (typeof getPayload === "function" ? getPayload() : {}) || {};
      if (!results) {
        alert("No results to save yet.");
        return;
      }

      // Screenshot chart if provided
      let chartPng = null;
      try { chartPng = await captureNodeToPng(chartRef?.current); } catch { /* ignore */ }

      const item = addItem({
        moduleKey,
        label,
        inputs: inputs ?? null,
        results,            // keep full object – helpful for later re-load
        chartPng,           // dataURL png (may be null if capture failed)
        ts: Date.now(),
      });

      if (typeof onSaved === "function") onSaved({ projectId, item });
      // little toast
      try {
        if (window?.Notification && Notification.permission === "granted") {
          new Notification("Saved to history", { body: label });
        } else {
          // fallback UX
          console.log("[history] saved", item);
        }
      } catch { /* noop */ }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={classNames(
        "inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border",
        "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800",
        "border-gray-200 dark:border-gray-700",
        busy && "opacity-60 cursor-not-allowed",
        className
      )}
      title="Save inputs + results + chart"
    >
      {/* icon */}
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M17 3H5a2 2 0 0 0-2 2v14l4-4h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z"/>
      </svg>
      {busy ? "Saving…" : "Save run"}
    </button>
  );
}
