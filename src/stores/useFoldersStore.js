// /src/stores/useFoldersStore.js
import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";
import jsPDF from "jspdf";

const API_URL = "https://www.programshouse.com/cp/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ------------------------------ helpers ------------------------------ */
const normalizeList = (data) =>
  Array.isArray(data) ? data
  : Array.isArray(data?.data) ? data.data
  : Array.isArray(data?.items) ? data.items
  : Array.isArray(data?.result) ? data.result
  : [];

const normalizeItem = (data) => data?.data ?? data?.item ?? data?.result ?? data;

const errMsg = (err, fallback) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.message ||
  fallback;

const tsFmt = (v) => {
  try {
    const d = typeof v === "number" ? new Date(v) : new Date(String(v));
    return isNaN(d.getTime()) ? "" : d.toLocaleString();
  } catch {
    return "";
  }
};

const fmt = (n, digits = 2) => {
  const num = Number(n || 0);
  const fixed = num.toFixed(digits);
  const [i, d] = fixed.split(".");
  const intFmt = i.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return d ? `${intFmt}.${d}` : intFmt;
};

// Map API calc → { inputs, results } consistently
const normCalc = (row = {}) => ({
  ...row,
  inputs: row.input_values ?? row.inputs ?? {},
  results: row.result ?? row.results ?? {},
});

/** Draw a tiny line chart for lifeSeriesData using jsPDF primitives */
function drawLifeMiniChart(doc, data = [], yRef = null, x = 24, y = 0, w = 260, h = 120) {
  if (!Array.isArray(data) || data.length === 0) return 0;
  const xs = data.map((d) => Number(d.year) || 0);
  const ys = data.map((d) => Number(d.weight) || 0);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = 0;
  const maxY = Math.max(...ys, Number(yRef) || 0) * 1.1 || 10;

  const toX = (vx) => x + ((vx - minX) / (maxX - minX || 1)) * w;
  const toY = (vy) => y + h - ((vy - minY) / (maxY - minY || 1)) * h;

  // Frame
  doc.setDrawColor(220);
  doc.rect(x, y, w, h);

  // Ref line (W_required)
  if (Number.isFinite(yRef) && yRef > 0) {
    doc.setDrawColor(37, 99, 235); // blue
    const yLine = toY(yRef);
    doc.setLineDash([3], 0);
    doc.line(x + 2, yLine, x + w - 2, yLine);
    doc.setLineDash([]);
    doc.setTextColor(37, 99, 235);
    doc.setFontSize(8);
    doc.text(`At t: ${fmt(yRef, 2)} kg`, x + w - 4, yLine - 4, { align: "right" });
    doc.setTextColor(0);
  }

  // Series
  doc.setDrawColor(59, 130, 246); // line blue
  doc.setLineWidth(1);
  data.forEach((p, i) => {
    const xx = toX(Number(p.year) || 0);
    const yy = toY(Number(p.weight) || 0);
    if (i > 0) {
      const prev = data[i - 1];
      doc.line(toX(Number(prev.year) || 0), toY(Number(prev.weight) || 0), xx, yy);
    }
  });

  // Title
  doc.setFontSize(9);
  doc.setTextColor(17, 24, 39);
  doc.text("Required Weight vs Design Life", x, y - 4);

  // Return consumed height (chart box + spacing)
  return h + 10;
}

/* ------------------------------ store ------------------------------ */
export const useFoldersStore = create((set, get) => ({
  folders: [],
  loading: false,
  error: null,

  // LIST
  async getAll() {
    set({ loading: true, error: null });
    try {
      const res = await api.get("folders");
      const list = normalizeList(res?.data);
      set({ folders: list, loading: false });
      return list;
    } catch (err) {
      const msg = errMsg(err, "Failed to fetch folders");
      set({ error: msg, loading: false });
      toast.error(msg);
      throw err;
    }
  },

  // Back-compat alias
  async fetchFolders() {
    return get().getAll();
  },

  // SHOW
  async show(id) {
    if (!id) throw new Error("show: 'id' is required");
    set({ loading: true, error: null });
    try {
      const res = await api.get(`folders/${id}`);
      const item = normalizeItem(res?.data);
      set({ loading: false });
      return item;
    } catch (err) {
      const msg = errMsg(err, "Failed to fetch folder");
      set({ error: msg, loading: false });
      toast.error(msg);
      throw err;
    }
  },

  // CREATE
  async create(name) {
    if (!name || !String(name).trim()) {
      const msg = "Folder name is required";
      set({ error: msg });
      toast.error(msg);
      throw new Error(msg);
    }
    set({ loading: true, error: null });
    try {
      const res = await api.post(
        "folders",
        { name: String(name).trim() },
        { headers: { "Content-Type": "application/json" } }
      );
      const created = normalizeItem(res?.data);
      try { await get().getAll(); } catch {}
      set({ loading: false });
      toast.success("Folder created");
      return created;
    } catch (err) {
      const msg = errMsg(err, "Failed to create folder");
      set({ error: msg, loading: false });
      toast.error(msg);
      throw err;
    }
  },

  // DELETE
  async delete(id) {
    if (!id) throw new Error("delete: 'id' is required");
    set({ loading: true, error: null });
    try {
      await api.delete(`folders/${id}`);
      try { await get().getAll(); } catch {}
      set({ loading: false });
      toast.success("Folder deleted");
      return true;
    } catch (err) {
      const msg = errMsg(err, "Failed to delete folder");
      set({ error: msg, loading: false });
      toast.error(msg);
      throw err;
    }
  },

  // EXPORT AS PDF (Inputs + Results + optional lifeSeriesData chart)
  async exportAsPdf(folderId) {
    if (!folderId) {
      const msg = "exportAsPdf: 'folderId' is required";
      set({ error: msg });
      toast.error(msg);
      throw new Error(msg);
    }
    set({ loading: true, error: null });

    try {
      // 1) Get folder name
      const folderRes = await api.get(`folders/${folderId}`);
      const folder = normalizeItem(folderRes?.data) || { id: folderId, name: `Folder ${folderId}` };

      // 2) Prefer calculations from folder; if empty, fallback to history endpoint
      let calcs = Array.isArray(folder?.calculations) ? folder.calculations : [];
      if (!calcs.length) {
        try {
          const histRes = await api.get("calculation-history", { params: { folder_id: folderId, per_page: 1000 } });
          calcs = normalizeList(histRes?.data);
        } catch (e) {
          // ignore; will export "no calculations"
          console.warn("history fallback failed:", e?.response?.data || e?.message);
        }
      }

      // 3) Normalize each calculation’s inputs/results keys
      const items = (calcs || []).map(normCalc);

      // 4) Build the PDF
      const doc = new jsPDF({ unit: "px", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      let y = 24;

      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(`Folder: ${folder?.name || ""} (ID: ${folderId})`, 24, y);
      y += 16;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Exported: ${tsFmt(Date.now())}`, 24, y);
      y += 18;

      const ensureSpace = (needed = 0) => {
        if (y + needed > pageH - 24) {
          doc.addPage();
          y = 24;
        }
      };

      const renderBlock = (heading, obj) => {
        const blockWidth = pageW - 48;
        const json = JSON.stringify(obj ?? {}, null, 2);
        const headingLines = doc.splitTextToSize(heading, blockWidth);
        const bodyLines = doc.splitTextToSize(json, blockWidth);
        const total = (headingLines.length + bodyLines.length) * 12 + 6;
        ensureSpace(total);

        doc.setFont("helvetica", "bold");
        headingLines.forEach((ln) => { doc.text(ln, 24, y); y += 12; });

        doc.setFont("helvetica", "normal");
        bodyLines.forEach((ln) => { doc.text(ln, 24, y); y += 12; });

        y += 6;
      };

      if (!items.length) {
        doc.text("No calculations in this folder.", 24, y);
      } else {
        items.forEach((row, idx) => {
          const title = row?.title || row?.formula_name || `Calculation #${row?.id ?? idx + 1}`;
          const stamp = row?.created_at || row?.updated_at || row?.ts || "";
          const status = row?.status ? String(row.status) : "";
          const life = Array.isArray(row?.results?.lifeSeriesData) ? row.results.lifeSeriesData : null;
          const W_required = Number(row?.results?.W_required || 0);

          // Title
          ensureSpace(24);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.text(title, 24, y);
          y += 14;

          // Sub
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          const sub = [stamp ? `Date: ${tsFmt(stamp)}` : "", status ? `Status: ${status}` : ""]
            .filter(Boolean).join("  •  ");
          if (sub) {
            doc.text(sub, 24, y);
            y += 12;
          }

          // Optional mini chart
          if (life && life.length) {
            ensureSpace(140);
            y += drawLifeMiniChart(doc, life, W_required, 24, y, pageW - 48, 120);
          }

          // Inputs / Results
          renderBlock("Inputs", row.inputs);
          // Exclude lifeSeriesData from printed JSON (chart already shows it)
          const { lifeSeriesData, ...resultsNoLife } = row.results || {};
          renderBlock("Results", resultsNoLife);

          // Divider
          if (idx !== items.length - 1) {
            ensureSpace(18);
            doc.setDrawColor(220);
            doc.line(24, y, pageW - 24, y);
            y += 12;
          }
        });
      }

      const safeName = String(folder?.name || `folder-${folderId}`)
        .replace(/[\\/:*?"<>|]+/g, "_")
        .replace(/\s+/g, " ")
        .trim();

      doc.save(`${safeName}-history.pdf`);
      set({ loading: false });
      toast.success("PDF exported");
      return true;
    } catch (err) {
      const msg = errMsg(err, "Failed to export folder as PDF");
      set({ error: msg, loading: false });
      toast.error(msg);
      throw err;
    }
  },
}));
