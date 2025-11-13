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

/* ------------ extra helper so exportFolderPdf can use it ------------ */
const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* ------------------------------ helpers ------------------------------ */
const normalizeList = (data) =>
  Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.result)
    ? data.result
    : [];

const normalizeItem = (data) =>
  data?.data ?? data?.item ?? data?.result ?? data;

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
function drawLifeMiniChart(
  doc,
  data = [],
  yRef = null,
  x = 24,
  y = 0,
  w = 260,
  h = 120
) {
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
    doc.text(`At t: ${fmt(yRef, 2)} kg`, x + w - 4, yLine - 4, {
      align: "right",
    });
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
      doc.line(
        toX(Number(prev.year) || 0),
        toY(Number(prev.weight) || 0),
        xx,
        yy
      );
    }
  });

  // Title
  doc.setFontSize(9);
  doc.setTextColor(17, 24, 39);
  doc.text("Required Weight vs Design Life", x, y - 4);

  // Return consumed height (chart box + spacing)
  return h + 10;
}

/** Draw a generic XY mini chart from an array of points */
function drawSeriesMiniChart(
  doc,
  data = [],
  {
    xKey = "x",
    yKey = "value",
    title = "Series Chart",
    xLabel = "",
    yLabel = "",
    refY = null,
  },
  x = 24,
  y = 0,
  w = 260,
  h = 120
) {
  if (!Array.isArray(data) || data.length === 0) return 0;

  const xs = data.map((d) => Number(d?.[xKey]) || 0);
  const ys = data.map((d) => Number(d?.[yKey]) || 0);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = 0;
  const maxY = Math.max(...ys, Number(refY) || 0) * 1.1 || 10;

  const toX = (vx) => x + ((vx - minX) / (maxX - minX || 1)) * w;
  const toY = (vy) => y + h - ((vy - minY) / (maxY - minY || 1)) * h;

  // Frame
  doc.setDrawColor(220);
  doc.rect(x, y, w, h);

  // Optional reference horizontal line
  if (Number.isFinite(refY) && refY > 0) {
    doc.setDrawColor(37, 99, 235);
    const yLine = toY(refY);
    doc.setLineDash([3], 0);
    doc.line(x + 2, yLine, x + w - 2, yLine);
    doc.setLineDash([]);
  }

  // Series line
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(1);
  data.forEach((p, i) => {
    const xx = toX(Number(p?.[xKey]) || 0);
    const yy = toY(Number(p?.[yKey]) || 0);
    if (i > 0) {
      const prev = data[i - 1];
      doc.line(
        toX(Number(prev?.[xKey]) || 0),
        toY(Number(prev?.[yKey]) || 0),
        xx,
        yy
      );
    }
  });

  // Title
  doc.setFontSize(9);
  doc.setTextColor(17, 24, 39);
  doc.text(title, x, y - 4);

  // Axis labels (small, optional)
  doc.setFontSize(8);
  doc.setTextColor(100);
  if (xLabel) doc.text(xLabel, x + w, y + h + 10, { align: "right" });
  if (yLabel) doc.text(yLabel, x - 6, y + 8, { angle: 90 });

  return h + 14;
}

/** Remove any array/series-like fields from results before printing JSON */
function sanitizeResults(results) {
  if (!results || typeof results !== "object") return {};
  const clean = {};
  for (const [k, v] of Object.entries(results)) {
    if (Array.isArray(v)) continue; // strip arrays entirely
    clean[k] = v;
  }
  return clean;
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

  // Back-compat alias (used in HistoryPage)
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
      try {
        await get().getAll();
      } catch {}
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
      try {
        await get().getAll();
      } catch {}
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

  // CLIENT-SIDE EXPORT AS PDF (Inputs + Results (no arrays) + charts)
  async exportAsPdf(folderId) {
    if (!folderId) {
      const msg = "exportAsPdf: 'folderId' is required";
      set({ error: msg });
      toast.error(msg);
      throw new Error(msg);
    }
    set({ loading: true, error: null });

    try {
      // 1) Folder name
      const folderRes = await api.get(`folders/${folderId}`);
      const folder =
        normalizeItem(folderRes?.data) || {
          id: folderId,
          name: `Folder ${folderId}`,
        };

      // 2) Prefer calculations in folder; fallback to history endpoint
      let calcs = Array.isArray(folder?.calculations)
        ? folder.calculations
        : [];
      if (!calcs.length) {
        try {
          const histRes = await api.get("calculation-history", {
            params: { folder_id: folderId, per_page: 1000 },
          });
          calcs = normalizeList(histRes?.data);
        } catch (e) {
          console.warn(
            "history fallback failed:",
            e?.response?.data || e?.message
          );
        }
      }

      const items = (calcs || []).map(normCalc);

      // 3) PDF
      const doc = new jsPDF({ unit: "px", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      let y = 24;

      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(
        `Folder: ${folder?.name || ""} (ID: ${folderId})`,
        24,
        y
      );
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
        headingLines.forEach((ln) => {
          doc.text(ln, 24, y);
          y += 12;
        });

        doc.setFont("helvetica", "normal");
        bodyLines.forEach((ln) => {
          doc.text(ln, 24, y);
          y += 12;
        });

        y += 6;
      };

      if (!items.length) {
        doc.text("No calculations in this folder.", 24, y);
      } else {
        items.forEach((row, idx) => {
          const title =
            row?.title ||
            row?.formula_name ||
            `Calculation #${row?.id ?? idx + 1}`;
          const stamp =
            row?.created_at || row?.updated_at || row?.ts || "";
          const status = row?.status ? String(row.status) : "";

          // Extract series (to chart), sanitize results for JSON
          const {
            lifeSeriesData,
            series,
            spacingSeries,
            distanceSeries,
            nSeries,
            ...restResults
          } = row?.results || {};
          const sanitizedResults = sanitizeResults(restResults);

          // Title
          ensureSpace(24);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.text(title, 24, y);
          y += 14;

          // Sub
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          const sub = [
            stamp ? `Date: ${tsFmt(stamp)}` : "",
            status ? `Status: ${status}` : "",
          ]
            .filter(Boolean)
            .join("  •  ");
          if (sub) {
            doc.text(sub, 24, y);
            y += 12;
          }

          // Results (NO arrays)
          renderBlock("Results", sanitizedResults);

          // Charts (visuals only)
          const charts = [];

          if (Array.isArray(lifeSeriesData) && lifeSeriesData.length) {
            charts.push({
              kind: "life",
              data: lifeSeriesData,
              params: { refY: Number(row?.results?.W_required || 0) },
            });
          }
          if (Array.isArray(series) && series.length) {
            charts.push({
              kind: "generic",
              data: series,
              options: {
                xKey: "n",
                yKey: "value",
                title: "Series",
                xLabel: "X",
                yLabel: "Value",
              },
            });
          }
          if (Array.isArray(spacingSeries) && spacingSeries.length) {
            charts.push({
              kind: "generic",
              data: spacingSeries,
              options: {
                xKey: "a",
                yKey: "value",
                title: "Resistance vs Spacing",
                xLabel: "Spacing (m)",
                yLabel: "R",
              },
            });
          }
          if (Array.isArray(distanceSeries) && distanceSeries.length) {
            charts.push({
              kind: "generic",
              data: distanceSeries,
              options: {
                xKey: "d",
                yKey: "value",
                title: "Profile vs Distance",
                xLabel: "Distance",
                yLabel: "Value",
              },
            });
          }
          if (Array.isArray(nSeries) && nSeries.length) {
            charts.push({
              kind: "generic",
              data: nSeries,
              options: {
                xKey: "n",
                yKey: "value",
                title: "Series vs N",
                xLabel: "N",
                yLabel: "Value",
              },
            });
          }

          if (charts.length) {
            ensureSpace(20);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text("Charts", 24, y);
            y += 8;

            charts.forEach((c) => {
              ensureSpace(140);
              if (c.kind === "life") {
                y += drawLifeMiniChart(
                  doc,
                  c.data,
                  c.params?.refY,
                  24,
                  y,
                  pageW - 48,
                  120
                );
              } else {
                const opts = c.options || {};
                y += drawSeriesMiniChart(
                  doc,
                  c.data,
                  {
                    xKey: opts.xKey || "x",
                    yKey: opts.yKey || "value",
                    title: opts.title || "Series Chart",
                    xLabel: opts.xLabel || "",
                    yLabel: opts.yLabel || "",
                    refY: opts.refY,
                  },
                  24,
                  y,
                  pageW - 48,
                  120
                );
              }
            });
          }

          // Divider
          if (idx !== items.length - 1) {
            ensureSpace(18);
            doc.setDrawColor(220);
            doc.line(24, y, pageW - 24, y);
            y += 12;
          }
        });
      }

      const safeName = String(
        folder?.name || `folder-${folderId}`
      )
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

  /** BACKEND EXPORT: GET /folders/:id/export -> Blob */
  async exportFolderPdf(id) {
    if (!id) {
      const msg = "exportFolderPdf: 'id' is required";
      set({ error: msg });
      toast.error(msg);
      throw new Error(msg);
    }
    set({ loading: true, error: null });
    try {
      const res = await api.get(`folders/${id}/export`, {
        responseType: "blob",
        headers: { ...authHeaders(), Accept: "application/pdf" },
      });

      set({ loading: false });

      let filename = `folder-${id}.pdf`;
      const cd =
        res.headers?.["content-disposition"] ||
        res.headers?.get?.("content-disposition");
      if (cd && /filename="?([^";]+)"?/i.test(cd)) {
        filename = decodeURIComponent(RegExp.$1);
      }

      return { blob: res.data, filename };
    } catch (err) {
      const msg = errMsg(err, "Failed to export folder PDF");
      set({ error: msg, loading: false });
      toast.error(msg);
      throw new Error(msg);
    }
  },
}));
