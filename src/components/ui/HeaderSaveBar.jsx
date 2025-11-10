// /src/components/ui/HeaderSaveBar.jsx
import React, { useState } from "react";
import { addItem, getActiveProjectId, getProject } from "../../lib/history";
import domtoimage from "dom-to-image-more";
import jsPDF from "jspdf";
import axios from "axios";
import { useCalculationStore } from "../../stores/useCalculationStore";

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

/* ---------------- Server folder resolver (inline) ---------------- */
const API_ROOT = "https://www.programshouse.com/cp/api"; // no trailing slash
const foldersApi = axios.create({ baseURL: `${API_ROOT}/folders` });

const authHeaders = () => {
  const t = localStorage.getItem("access_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

// Try to find a folder by exact name (adapt params if your API uses a different query key)
async function findServerFolderByName(name) {
  if (!name) return null;
  const { data } = await foldersApi.get("", {
    headers: authHeaders(),
    params: { name },
  });
  const list =
    Array.isArray(data) ? data :
    Array.isArray(data?.data) ? data.data :
    Array.isArray(data?.items) ? data.items :
    Array.isArray(data?.result) ? data.result : [];
  return list.find((x) => (x?.name || "").toLowerCase() === String(name).toLowerCase()) || null;
}

async function createServerFolder(name) {
  const { data } = await foldersApi.post(
    "",
    { name },
    { headers: { ...authHeaders(), "Content-Type": "application/json" } }
  );
  return data?.data ?? data?.result ?? data?.item ?? data;
}

// Ensure a server folder exists and return its numeric id
async function ensureServerFolderId(projectName) {
  const existing = await findServerFolderByName(projectName);
  if (existing?.id != null) return Number(existing.id);
  const created = await createServerFolder(projectName || "Default Project");
  if (created?.id == null) throw new Error("Folder creation returned no id");
  return Number(created.id);
}

/* ---------------------------------------------------------------- */

export default function HeaderSaveBar({
  moduleKey,
  moduleLabel,
  inputs,
  results,
  captureRef,
  // optional
  formulaName,   // explicit override for formula name
  modulePath,    // e.g. "/pages/surface-area" (goes to meta)
  buildName,     // function to build 'name' (receives {moduleLabel, inputs, results, project})
}) {
  const [busy, setBusy] = useState(false);
  const canSave = !!inputs && !!results;

  // Resolve formula name from props or fallbacks
  const resolvedFormulaName =
    formulaName ||
    KEY_TO_FORMULA[moduleKey] ||
    moduleLabel ||
    "Calculation";

  const makeDefaultName = () => {
    const dt = new Date();
    const stamp = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")} ${String(dt.getHours()).padStart(2,"0")}:${String(dt.getMinutes()).padStart(2,"0")}`;
    return `${moduleLabel || resolvedFormulaName} • ${stamp}`;
  };

  const handleSave = async () => {
    if (!canSave || busy) return;
    setBusy(true);
    try {
      // Resolve local active project
      const localProjectId = getActiveProjectId();
      const project = getProject(localProjectId);

      if (!localProjectId || !project?.name) {
        alert("No active project selected. Please choose a project/folder first.");
        return;
      }

      // Resolve a VALID SERVER folder_id by project name
      const serverFolderId = await ensureServerFolderId(project.name);

      // Optional screenshot of the right column
      let imageDataUrl = null;
      if (captureRef?.current) {
        imageDataUrl = await domtoimage.toPng(captureRef.current, {
          quality: 0.95,
          bgcolor: "#ffffff",
          filter: () => true,
        });
      }

      // Local history entry (UX/offline)
      addItem({
        moduleKey,
        label: moduleLabel || resolvedFormulaName,
        inputs,
        results,
        imageDataUrl,
        ts: Date.now(),
      });

      // Build title & name
      const title = `${moduleLabel || resolvedFormulaName} — ${project.name}`;
      const name =
        typeof buildName === "function"
          ? buildName({ moduleLabel, inputs, results, project })
          : makeDefaultName();

      // POST via store — includes folder_id, name, status
      const { submitCalculation } = useCalculationStore.getState();
      await submitCalculation({
        folder_id: Number(serverFolderId),         // ✅ server verified
        name,                                      // ✅ required
        formula_name: resolvedFormulaName,         // ✅ required
        title,
        inputs,
        results: { ...results },
        status: "completed",
        meta: {
          project_name: project.name,
          module_key: moduleKey,
          screenshot_png_b64: imageDataUrl,        // remove if server doesn't accept it
          ...(modulePath ? { module_path: modulePath } : {}),
        },
      });

      alert("Saved to project history & remote storage.");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Failed to save.");
    } finally {
      setBusy(false);
    }
  };

  const handleExportPdf = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const doc = new jsPDF({ unit: "px", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      let y = 24;

      const projectName = getProject(getActiveProjectId())?.name || "Default Project";
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(`${moduleLabel || resolvedFormulaName} — Export`, 24, y);
      y += 16;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Project: ${projectName}`, 24, y);
      y += 14;
      doc.text(`Date: ${new Date().toLocaleString()}`, 24, y);
      y += 18;

      let imageDataUrl = null;
      if (captureRef?.current) {
        imageDataUrl = await domtoimage.toPng(captureRef.current, { quality: 0.95, bgcolor: "#ffffff" });
      }

      if (imageDataUrl) {
        const imgW = pageW - 48;
        const img = new Image();
        img.src = imageDataUrl;
        await new Promise((res) => (img.onload = res));
        const scale = imgW / img.width;
        const imgH = img.height * scale;

        if (y + imgH > doc.internal.pageSize.getHeight() - 24) {
          doc.addPage();
          y = 24;
        }
        doc.addImage(imageDataUrl, "PNG", 24, y, imgW, imgH);
        y += imgH + 18;
      }

      const summary = [
        `Module: ${moduleLabel || resolvedFormulaName} (${moduleKey || "-"})`,
        "",
        "Inputs:",
        JSON.stringify(inputs ?? {}, null, 2),
        "",
        "Results:",
        JSON.stringify(results ?? {}, null, 2),
      ].join("\n");

      const lines = doc.splitTextToSize(summary, pageW - 48);
      const lineHeight = 12;
      for (let i = 0; i < lines.length; i++) {
        if (y > doc.internal.pageSize.getHeight() - 24) {
          doc.addPage();
          y = 24;
        }
        doc.text(lines[i], 24, y);
        y += lineHeight;
      }

      doc.save(`${(moduleKey || "calc")}-export-${Date.now()}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Failed to export PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleSave}
        disabled={!canSave || busy}
        className={`text-xs px-3 py-1.5 rounded-full border ${
          canSave ? "bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800" : "opacity-60 cursor-not-allowed"
        }`}
        title={canSave ? "Save to project history" : "Run a calculation first"}
      >
        {busy ? "…" : "Save"}
      </button>
      <button
        type="button"
        onClick={handleExportPdf}
        disabled={busy}
        className="text-xs px-3 py-1.5 rounded-full border bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
        title="Export PDF (screenshot + JSON summary)"
      >
        {busy ? "…" : "Export PDF"}
      </button>
    </div>
  );
}
