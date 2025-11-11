// /src/components/ui/HeaderSaveBar.jsx
import React, { useState } from "react";
import { getActiveProjectId, getProject } from "../../lib/history";
import { toast } from "react-toastify";
import { useCalculationStore } from "../../stores/useCalculationStore";
import FolderPickerModal from "../ui/FolderPickerModal";
import { exportHtmlToPdf } from "../../lib/exportPdf"; // ⬅️ adjust path if needed

// Recharts + helpers to snapshot the chart as PNG
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { createRoot } from "react-dom/client";
import { Canvg } from "canvg";

// Map your moduleKey → formula_name
const KEY_TO_FORMULA = {
  voltage_gradient_calc: "Voltage Gradient",
  attenuation_calc: "Attenuation & Pipeline Potential profile",
  interference_calc: "Interference Calculation",
  soil_resistivity_calc: "Soil Resistivity",
  barnes_layer_calc: "Barnes Layer Resistivity",
  coating_factors_calc: "Coating Factors Calculation",
  groundbed_resistance_calc: "Groundbed Resistance",
  galvanic_calc: "Galvanic Anode System Calculation",
  impressed_current_calc: "Impressed Current System Calculation",
  variable_resistor_calc: "Variable Resistor & Shunt Resistor Sizing",
  circuit_resistance_calc: "Circuit Resistance Module",
  surface_area_calc: "Surface Area Calculation",
  solar_sizing_calc: "Solar Sizing",
  tank_mmo_calc: "Tank MMO Anode Sizing",
  resistor_sizing_calc: "Resistor Sizing",
};

export default function HeaderSaveBar({
  moduleKey,
  moduleLabel,
  inputs,
  results,
  // captureRef, // kept for future use
  // optional
  formulaName,
  modulePath,
  buildName,
}) {
  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [ setLastSaved] = useState(null); // store full saved object if needed later
  const canSave = !!inputs && !!results;

  const { submitCalculation } = useCalculationStore();

  const resolvedFormulaName =
    formulaName || KEY_TO_FORMULA[moduleKey] || moduleLabel || "Calculation";

  const makeDefaultName = () => {
    const dt = new Date();
    const stamp = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(dt.getDate()).padStart(2, "0")} ${String(
      dt.getHours()
    ).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
    return `${moduleLabel || resolvedFormulaName} • ${stamp}`;
  };

  const onClickSave = () => {
    if (!canSave || busy) return;
    setPickerOpen(true);
  };

  // Save to server (no local snapshot)
  const handlePickedFolder = async (folderId) => {
    setPickerOpen(false);
    setBusy(true);

    const projectName =
      getProject(getActiveProjectId())?.name || "Default Project";
    const toastId = toast.loading("Saving calculation…");

    try {
      const title = `${moduleLabel || resolvedFormulaName} — ${projectName}`;
      const name =
        typeof buildName === "function"
          ? buildName({
              moduleLabel,
              inputs,
              results,
              project: { name: projectName },
            })
          : makeDefaultName();

      const saved = await submitCalculation({
        folder_id: Number(folderId),
        name,
        formula_name: resolvedFormulaName,
        title,
        inputs,
        results: { ...results },
        status: "completed",
        meta: {
          project_name: projectName,
          module_key: moduleKey,
          ...(modulePath ? { module_path: modulePath } : {}),
        },
      });

      setLastSaved(saved);

      toast.update(toastId, {
        render: "Saved successfully",
        type: "success",
        isLoading: false,
        autoClose: 1500,
      });
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to save";
      toast.update(toastId, {
        render: msg,
        type: "error",
        isLoading: false,
        autoClose: 2500,
      });
    } finally {
      setBusy(false);
    }
  };

  // Client export: build HTML, draw Recharts from the SAME `results`, no store export
  const handleExportPdf = async () => {
    if (busy) return;
    setBusy(true);
    const t = toast.loading("Preparing PDF…");

    try {
      const projectName =
        getProject(getActiveProjectId())?.name || "Default Project";
      const titleText = moduleLabel || resolvedFormulaName || "Calculation";
      const nowTxt = new Date().toLocaleString();

      // Normalize series from the SAME results (no refetch)
      const shape = normalizeSeries(
        results?.lifeSeriesData ??
          results?.seriesData ??
          results?.chartSeries ??
          results?.series ??
          null
      );

      // Render Recharts to PNG (off-screen)
      let chartDataUrl = "";
      if (shape.series.length) {
        chartDataUrl = await renderRechartsToPng(shape, {
          width: 560,
          height: 240,
        });
      }

      // Strip raw series arrays from Results for printing
      const resultsNoSeries = (() => {
        if (!results) return {};
        const { ...rest } =
          results;
        return rest;
      })();

      // Build export HTML for html2pdf
      const safeModule =
        (moduleKey || "calc").replace(/[\\/:*?"<>|]+/g, "_") || "calc";
      const filename = `${safeModule}-export-${Date.now()}.pdf`;

      const html = `
        <section>
          <h1>${escapeHtml(titleText)} — Export</h1>
          <p class="sub">
            Project: ${escapeHtml(projectName)}<br/>
            Date: ${escapeHtml(nowTxt)}
          </p>
        </section>

        <section>
          <h1>Inputs</h1>
          <pre>${escapeHtml(JSON.stringify(inputs ?? {}, null, 2))}</pre>
        </section>

        ${
          chartDataUrl
            ? `
        <section>
          <h1>Results Chart</h1>
          <img class="screenshot" src="${chartDataUrl}" alt="Results Chart"/>
        </section>`
            : ""
        }

        <section>
          <h1>Results (details)</h1>
          <pre>${escapeHtml(JSON.stringify(resultsNoSeries ?? {}, null, 2))}</pre>
        </section>
      `;

      // Export using your html2pdf helper
      await exportHtmlToPdf(`${titleText} — Export`, html, filename);

      toast.update(t, {
        render: "PDF exported",
        type: "success",
        isLoading: false,
        autoClose: 1500,
      });
    } catch (e) {
      toast.update(t, {
        render: "Failed to export PDF",
        type: "error",
        isLoading: false,
        autoClose: 2500,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClickSave}
          disabled={!canSave || busy}
          className={`text-xs px-3 py-1.5 rounded-full border ${
            canSave
              ? "bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
              : "opacity-60 cursor-not-allowed"
          }`}
          title={
            canSave
              ? "Save to server (choose folder)"
              : "Run a calculation first"
          }
        >
          {busy ? "…" : "Save"}
        </button>

        {/* Client-side export using SAME results; chart via Recharts; no raw series printed */}
        <button
          type="button"
          onClick={handleExportPdf}
          disabled={busy}
          className="text-xs px-3 py-1.5 rounded-full border bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
          title="Export PDF (inputs + results + Recharts chart)"
        >
          {busy ? "…" : "Export PDF"}
        </button>
      </div>

      {/* Folder picker modal */}
      <FolderPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPicked={handlePickedFolder}
        defaultName="New Project"
      />
    </>
  );
}

/* ================= Helpers (same file) ================= */

function normalizeSeries(raw) {
  // Accepts { labels, series:[{ name, data }] } or a single numeric array
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const labels = Array.isArray(raw.labels) ? raw.labels : [];
    const series = Array.isArray(raw.series) ? raw.series : [];
    return {
      labels,
      series: series
        .filter((s) => s && Array.isArray(s.data))
        .map((s, i) => ({
          name: s.name || `Series ${i + 1}`,
          data: s.data.map(toNum),
        })),
    };
  }
  if (Array.isArray(raw)) {
    return {
      labels: Array.from({ length: raw.length }, (_, i) => i + 1),
      series: [{ name: "Series 1", data: raw.map(toNum) }],
    };
  }
  return { labels: [], series: [] };
}

function toNum(v) {
  const n = typeof v === "number" ? v : v == null ? NaN : Number(v);
  return Number.isFinite(n) ? n : null; // null => line gaps
}

async function renderRechartsToPng(shape, { width = 560, height = 240 } = {}) {
  // Hidden fixed-size host
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-10000px";
  host.style.top = "0";
  host.style.width = `${width}px`;
  host.style.height = `${height}px`;
  host.style.pointerEvents = "none";
  document.body.appendChild(host);

  const root = createRoot(host);
  root.render(
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={shapeToRows(shape)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="__x" />
          <YAxis />
          <Tooltip />
          <Legend />
          {shape.series.map((s, i) => (
            <Line
              key={s.name || `S${i + 1}`}
              type="monotone"
              dataKey={s.name || `S${i + 1}`}
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  // Ensure SVG is painted
  await new Promise((r) =>
    requestAnimationFrame(() => requestAnimationFrame(r))
  );

  let dataUrl = "";
  try {
    const svg = host.querySelector("svg");
    if (svg) {
      const svgText = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      const v = Canvg.fromString(ctx, svgText);
      await v.render(); // SVG → canvas
      dataUrl = canvas.toDataURL("image/png", 1.0);
    }
  } finally {
    root.unmount();
    document.body.removeChild(host);
  }
  return dataUrl;
}

function shapeToRows(shape) {
  const maxLen = Math.max(0, ...shape.series.map((s) => s.data.length));
  const labels =
    shape.labels?.length
      ? shape.labels
      : Array.from({ length: maxLen }, (_, i) => i + 1);

  const rows = [];
  for (let i = 0; i < maxLen; i++) {
    const row = { __x: String(labels[i] ?? i + 1) };
    for (const s of shape.series) {
      const key = s.name || "Series";
      row[key] = s.data[i];
    }
    rows.push(row);
  }
  return rows;
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
