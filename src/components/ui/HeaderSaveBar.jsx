// src/components/ui/HeaderSaveBar.jsx
import React, { useState } from "react";
import { addItem, getActiveProjectId, getProject } from "../../lib/history";

// If you prefer html2canvas instead of dom-to-image-more, swap the capture function below.
import domtoimage from "dom-to-image-more";
import jsPDF from "jspdf";

export default function HeaderSaveBar({
  moduleKey,
  moduleLabel,
  inputs,
  results,
  captureRef, // React.ref on the RIGHT column container you want to snapshot
}) {
  const [busy, setBusy] = useState(false);
  const canSave = !!inputs && !!results; // require both

  const handleSave = async () => {
    if (!canSave || busy) return;
    setBusy(true);
    try {
      let imageDataUrl = null;
      if (captureRef?.current) {
        // take a screenshot of the results area
        imageDataUrl = await domtoimage.toPng(captureRef.current, {
          quality: 0.95,
          bgcolor: "#ffffff",
          filter: (node) => true,
        });
      }

      addItem({
        moduleKey,
        label: moduleLabel,
        inputs,
        results,
        imageDataUrl,
        ts: Date.now(),
      });

      // Optional tiny toast:
      // eslint-disable-next-line no-alert
      alert("Saved to active project.");
    } catch (e) {
      console.error(e);
      alert("Failed to save.");
    } finally {
      setBusy(false);
    }
  };

  const handleExportPdf = async () => {
    if (busy) return;
    setBusy(true);
    try {
      // Build a one-page or two-page PDF:
      const doc = new jsPDF({ unit: "px", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      let y = 24;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(`${moduleLabel} — Export`, 24, y);
      y += 16;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Project: ${getProject(getActiveProjectId())?.name || "Default Project"}`, 24, y);
      y += 14;
      doc.text(`Date: ${new Date().toLocaleString()}`, 24, y);
      y += 18;

      // Try to add screenshot
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

        // if image too tall for the page, add page breaks as needed
        if (y + imgH > doc.internal.pageSize.getHeight() - 24) {
          doc.addPage();
          y = 24;
        }
        doc.addImage(imageDataUrl, "PNG", 24, y, imgW, imgH);
        y += imgH + 18;
      }

      // Append JSON summary of inputs + results
      const summary = [
        `Module: ${moduleLabel} (${moduleKey})`,
        "",
        "Inputs:",
        JSON.stringify(inputs ?? {}, null, 2),
        "",
        "Results:",
        JSON.stringify(results ?? {}, null, 2),
      ].join("\n");

      const lines = doc.splitTextToSize(summary, pageW - 48);
      // paginate long text
      const lineHeight = 12;
      for (let i = 0; i < lines.length; i++) {
        if (y > doc.internal.pageSize.getHeight() - 24) {
          doc.addPage();
          y = 24;
        }
        doc.text(lines[i], 24, y);
        y += lineHeight;
      }

      doc.save(`${moduleKey}-export-${Date.now()}.pdf`);
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
