// /src/components/ui/HeaderSaveBar.jsx
import React, { useState } from "react";
import { addItem, getActiveProjectId, getProject } from "../../lib/history";
import domtoimage from "dom-to-image-more";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import { useCalculationStore } from "../../stores/useCalculationStore";
import FolderPickerModal from "../ui/FolderPickerModal";

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
  captureRef,
  // optional
  formulaName,   // explicit override for formula name
  modulePath,    // e.g. "/pages/surface-area"
  buildName,     // function: ({ moduleLabel, inputs, results, project }) => string
}) {
  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const canSave = !!inputs && !!results;

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

  const onClickSave = () => {
    if (!canSave || busy) return;
    // Open folder picker modal
    setPickerOpen(true);
  };

  const handlePickedFolder = async (folderId /*, folderName */) => {
    // Called by modal when user confirms
    setPickerOpen(false);
    setBusy(true);

    const projectName = getProject(getActiveProjectId())?.name || "Default Project";

    const toastId = toast.loading("Saving calculation…");
    try {
      // Optional screenshot
      let imageDataUrl = null;
      if (captureRef?.current) {
        imageDataUrl = await domtoimage.toPng(captureRef.current, {
          quality: 0.95,
          bgcolor: "#ffffff",
          filter: () => true,
        });
      }

      // Local snapshot history
      addItem({
        moduleKey,
        label: moduleLabel || resolvedFormulaName,
        inputs,
        results,
        imageDataUrl,
        ts: Date.now(),
      });

      // Build title/name
      const title = `${moduleLabel || resolvedFormulaName} — ${projectName}`;
      const name =
        typeof buildName === "function"
          ? buildName({ moduleLabel, inputs, results, project: { name: projectName } })
          : makeDefaultName();

      // Remote save
      const { submitCalculation } = useCalculationStore.getState();
      await submitCalculation({
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
          screenshot_png_b64: imageDataUrl, // remove if backend rejects images
          ...(modulePath ? { module_path: modulePath } : {}),
        },
      });

      toast.update(toastId, { render: "Saved successfully", type: "success", isLoading: false, autoClose: 1500 });
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to save";
      toast.update(toastId, { render: msg, type: "error", isLoading: false, autoClose: 2500 });
    } finally {
      setBusy(false);
    }
  };

  const handleExportPdf = async () => {
    if (busy) return;
    setBusy(true);
    const t = toast.loading("Preparing PDF…");
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

      const safeBase = (moduleKey || "calc").replace(/[\\/:*?"<>|]+/g, "_");
      doc.save(`${safeBase}-export-${Date.now()}.pdf`);
      toast.update(t, { render: "PDF exported", type: "success", isLoading: false, autoClose: 1500 });
    } catch (e) {
      toast.update(t, { render: "Failed to export PDF", type: "error", isLoading: false, autoClose: 2500 });
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
            canSave ? "bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800" : "opacity-60 cursor-not-allowed"
          }`}
          title={canSave ? "Save to project history (choose server folder)" : "Run a calculation first"}
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
