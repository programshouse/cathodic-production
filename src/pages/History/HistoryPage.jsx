// src/pages/history/HistoryPage.jsx
import React from "react";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import ModuleCard from "../../components/ui/ModuleCard";
import {
  getProjects,
  getProject,
  getActiveProjectId,
  setActiveProjectId,
  createProject,
  renameProject,
  deleteProject,
  migrateLegacyIntoDefault,
} from "../../lib/history";

// -------------------------
// Small utils
// -------------------------
const MODULE_LABELS = {
  voltage_gradient_calc: "Voltage Gradient",
  attenuation_calc: "Attenuation",
  interference_calc: "Interference",
  soil_resistivity_calc: "Soil Resistivity",
  barnes_layer_calc: "Barnes Layer",
  coating_factors_calc: "Coating Factors",
  groundbed_resistance_calc: "Groundbed Resistance",
  galvanic_calc: "Galvanic Anode",
  impressed_current_calc: "Impressed Current",
  variable_resistor_calc: "Variable Resistor",
  circuit_resistance_calc: "Circuit Resistance",
  surface_area_calc: "Surface Area",
};

function tsFmt(ts) {
  try { return new Date(ts).toLocaleString(); } catch { return ""; }
}

function sanitizeFilename(name) {
  return String(name || "export")
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, " ")
    .trim();
}

// -------------------------
// html2pdf loader + exporter
// -------------------------
let _html2pdfLoading = null;
async function loadHtml2PdfOnce() {
  if (typeof window === "undefined") return;
  if (window.html2pdf) return;
  if (_html2pdfLoading) return _html2pdfLoading;
  _html2pdfLoading = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load html2pdf.js"));
    document.head.appendChild(s);
  });
  return _html2pdfLoading;
}

/** Render HTML string into an offscreen element and export it to a PDF the user downloads. */
async function exportHtmlToPdf({ html, filename = "export.pdf" }) {
  if (typeof window === "undefined") return;
  await loadHtml2PdfOnce();
  if (!window.html2pdf) throw new Error("html2pdf not available");

  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-99999px";
  wrapper.style.top = "0";
  wrapper.style.width = "794px"; // ~A4 width at 96dpi
  wrapper.style.background = "#ffffff";

  const contentEl = document.createElement("div");
  contentEl.className = "pdf-root";
  contentEl.style.fontFamily =
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial';
  contentEl.style.color = "#111827";

  const styleEl = document.createElement("style");
  styleEl.textContent = `
    h1{font-size:20px;margin:0 0 4px;}
    h2{font-size:16px;margin:12px 0 4px;}
    .sub{color:#6B7280;font-size:12px;margin-bottom:12px;}
    .two-col{display:grid; grid-template-columns: 1fr 1fr; gap: 12px;}
    pre{white-space:pre-wrap;word-wrap:break-word;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:12px;font-size:12px;}
    section{page-break-inside:avoid;margin-bottom:24px;}
    .img-wrap{margin-top:8px;}
    .img-wrap img{max-width:100%; border:1px solid #E5E7EB; border-radius:8px;}
    .page-break{page-break-before:always;}
  `;

  contentEl.innerHTML = html;
  wrapper.appendChild(styleEl);
  wrapper.appendChild(contentEl);
  document.body.appendChild(wrapper);

  await new Promise(requestAnimationFrame);

  const opt = {
    margin: [10, 10, 10, 10],
    filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["css", "legacy"] },
  };

  try {
    await window.html2pdf().set(opt).from(contentEl).save();
  } finally {
    document.body.removeChild(wrapper);
  }
}

// -------------------------
// Escape helper for safe HTML string building
// -------------------------
function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// -------------------------
// Page Component
// -------------------------
export default function HistoryPage() {
  // one-time migration of legacy single saves into default project
  React.useEffect(() => { migrateLegacyIntoDefault(); }, []);

  const [projects, setProjects] = React.useState(getProjects());
  const [activeId, setActiveId] = React.useState(getActiveProjectId() || projects[0]?.id || "");

  React.useEffect(() => { setProjects(getProjects()); }, [activeId]);

  const active = getProject(activeId);

  const onCreateProject = () => {
    const name = prompt("Project name:", "New Project");
    if (!name) return;
    const p = createProject(name.trim());
    setActiveId(p.id);
    setActiveProjectId(p.id);
    setProjects(getProjects());
  };

  const onRenameProject = () => {
    if (!active) return;
    const name = prompt("Rename project:", active.name);
    if (!name) return;
    renameProject(active.id, name.trim());
    setProjects(getProjects());
  };

  const onDeleteProject = () => {
    if (!active) return;
    if (!confirm(`Delete project "${active.name}"? This cannot be undone.`)) return;
    deleteProject(active.id);
    const list = getProjects();
    const next = list[0]?.id || "";
    setActiveId(next);
    setActiveProjectId(next);
    setProjects(list);
  };

  const onChangeProject = (e) => {
    const id = e.target.value;
    setActiveId(id);
    setActiveProjectId(id);
  };

  // ---------- Export single entry (now with Results + optional screenshot) ----------
  const exportEntry = async (it) => {
    const label = it.label || MODULE_LABELS[it.moduleKey] || it.moduleKey;
    const title = `${label} — Inputs & Results`;

    const parts = [];
    parts.push(`<h1>${escapeHtml(title)}</h1>`);
    parts.push(`<div class="sub">${escapeHtml(tsFmt(it.ts))}</div>`);

    // Two-column Inputs/Results
    parts.push(`<div class="two-col">
      <div>
        <h2>Inputs</h2>
        <pre>${escapeHtml(it.inputs ? JSON.stringify(it.inputs, null, 2) : "No inputs")}</pre>
      </div>
      <div>
        <h2>Results</h2>
        <pre>${escapeHtml(it.results ? JSON.stringify(it.results, null, 2) : "No results")}</pre>
      </div>
    </div>`);

    // Optional screenshot
    if (it.screenshotDataUrl) {
      parts.push(`<div class="img-wrap">
        <h2>Screenshot</h2>
        <img src="${escapeHtml(it.screenshotDataUrl)}" alt="Screenshot" />
      </div>`);
    }

    const html = parts.join("\n");
    const filename = `${sanitizeFilename(title)}.pdf`;
    await exportHtmlToPdf({ html, filename });
  };

  // ---------- Export whole project (loop entries, include Results + screenshot) ----------
  const exportProject = async () => {
    if (!active || !active.items?.length) return;

    const blocks = active.items.map((it, idx) => {
      const label = it.label || MODULE_LABELS[it.moduleKey] || it.moduleKey;
      const head = `
        <section ${idx > 0 ? 'class="page-break"' : ""}>
          <h1>${escapeHtml(label)} — Inputs & Results</h1>
          <div class="sub">${escapeHtml(tsFmt(it.ts))}</div>
          <div class="two-col">
            <div>
              <h2>Inputs</h2>
              <pre>${escapeHtml(it.inputs ? JSON.stringify(it.inputs, null, 2) : "No inputs")}</pre>
            </div>
            <div>
              <h2>Results</h2>
              <pre>${escapeHtml(it.results ? JSON.stringify(it.results, null, 2) : "No results")}</pre>
            </div>
          </div>
      `;

      const shot = it.screenshotDataUrl
        ? `<div class="img-wrap">
             <h2>Screenshot</h2>
             <img src="${escapeHtml(it.screenshotDataUrl)}" alt="Screenshot" />
           </div>`
        : "";

      return `${head}${shot}</section>`;
    }).join("\n");

    const filename = `${sanitizeFilename(active.name || "Project")} - History.pdf`;
    await exportHtmlToPdf({ html: blocks, filename });
  };

  return (
    <PageLayout title="History | CP">
      <PageHeader
        title="Projects History"
        description="Organize saved calculator runs into projects (folders)."
        actions={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCreateProject}
              className="text-xs px-3 py-1.5 rounded-full border bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              New Project
            </button>
            <button
              type="button"
              onClick={exportProject}
              className="text-xs px-3 py-1.5 rounded-full border bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
              disabled={!active || !active.items?.length}
            >
              Export Project (PDF)
            </button>
          </div>
        }
      />

      {/* Project selector */}
      <div className="col-span-12 mb-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 dark:text-gray-300">Active project</label>
          <select
            value={activeId}
            onChange={onChangeProject}
            className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <button
            onClick={onRenameProject}
            className="text-xs px-2 py-1 rounded-full border bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Rename
          </button>

          <button
            onClick={onDeleteProject}
            className="text-xs px-2 py-1 rounded-full border border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Items in project */}
      <div className="space-y-6 col-span-12">
        {!active || !active.items?.length ? (
          <ModuleCard
            title="No History"
            subtitle="Run a calculation and save it into this project from the calculator page."
          />
        ) : (
          active.items.map((it) => {
            const label = it.label || MODULE_LABELS[it.moduleKey] || it.moduleKey;
            return (
              <ModuleCard
                key={it.id}
                title={label}
                subtitle={tsFmt(it.ts)}
                actions={
                  <button
                    type="button"
                    onClick={() => exportEntry(it)}
                    className="text-xs px-2 py-1 rounded-full border bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    PDF
                  </button>
                }
              >
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-3">
                  {/* Optional screenshot preview */}
                  {it.screenshotDataUrl ? (
                    <div className="mb-2">
                      <a href={it.screenshotDataUrl} target="_blank" rel="noreferrer">
                        <img
                          src={it.screenshotDataUrl}
                          alt="Screenshot"
                          className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                          style={{ maxHeight: 320 }}
                        />
                      </a>
                    </div>
                  ) : null}

                  {/* Inputs + Results side-by-side on wide screens */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div>
                      <div className="font-semibold mb-1 text-gray-800 dark:text-gray-200">Inputs</div>
                      <pre className="whitespace-pre-wrap overflow-auto bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg border border-gray-100 dark:border-gray-800 w-[1400px] max-w-full">
                        {JSON.stringify(it.inputs || {}, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <div className="font-semibold mb-1 text-gray-800 dark:text-gray-200">Results</div>
                      <pre className="whitespace-pre-wrap overflow-auto bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg border border-gray-100 dark:border-gray-800 w-[1400px] max-w-full">
                        {JSON.stringify(it.results || {}, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </ModuleCard>
            );
          })
        )}
      </div>
    </PageLayout>
  );
}
