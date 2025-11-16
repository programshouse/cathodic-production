// /src/pages/history/HistoryPage.jsx
import React from "react";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import ModuleCard from "../../components/ui/ModuleCard";
import { useFoldersStore } from "../../stores/useFoldersStore";

// Recharts (same config as your GalvanicResults)
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from "recharts";

function tsFmt(v) {
  try {
    const d = typeof v === "number" ? new Date(v) : new Date(String(v));
    return isNaN(d.getTime()) ? "" : d.toLocaleString();
  } catch {
    return "";
  }
}

// Normalize a calc from /folders/:id
function normalizeCalc(row = {}) {
  return {
    ...row,
    inputs: row.input_values ?? row.inputs ?? {},
    results: row.result ?? row.results ?? {},
  };
}

// Same number formatter as in GalvanicResults
const fmt = (n, digits = 3) => {
  const num = Number(n || 0);
  const fixed = num.toFixed(digits);
  const [i, d] = fixed.split(".");
  const intFmt = i.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return d ? `${intFmt}.${d}` : intFmt;
};

function normalizeSeries(raw) {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const labels = Array.isArray(raw.labels) ? raw.labels : [];
    const series = Array.isArray(raw.series) ? raw.series : [];
    return {
      labels,
      series: series
        .filter((s) => s && Array.isArray(s.data))
        .map((s, i) => ({
          name: s.name || `Series ${i + 1}`,
          data: s.data.map((v) => {
            const n = typeof v === "number" ? v : v == null ? NaN : Number(v);
            return Number.isFinite(n) ? n : null;
          }),
        })),
    };
  }
  if (Array.isArray(raw)) {
    // If it's an array of numbers
    if (raw.every((v) => typeof v === "number" || v == null)) {
      return {
        labels: Array.from({ length: raw.length }, (_, i) => i + 1),
        series: [
          {
            name: "Series 1",
            data: raw.map((v) => {
              const n = typeof v === "number" ? v : v == null ? NaN : Number(v);
              return Number.isFinite(n) ? n : null;
            }),
          },
        ],
      };
    }
    // If it's an array of objects, attempt to detect x/y keys
    if (raw.length && typeof raw[0] === "object" && raw[0] !== null) {
      const xKey =
        ("year" in raw[0] && "year") ||
        ("x" in raw[0] && "x") ||
        ("t" in raw[0] && "t") ||
        null;
      const yKey =
        ("weight_kg" in raw[0] && "weight_kg") ||
        ("weight" in raw[0] && "weight") ||
        ("V_int" in raw[0] && "V_int") ||
        ("value" in raw[0] && "value") ||
        ("y" in raw[0] && "y") ||
        null;
      if (xKey && yKey) {
        const labels = raw
          .map((d) => String(d?.[xKey]))
          .map((s, i) =>
            s == null || s === "undefined" ? String(i + 1) : s
          );
        const data = raw.map((d) => {
          const n = Number(d?.[yKey]);
          return Number.isFinite(n) ? n : null;
        });
        const name =
          yKey === "weight_kg" || yKey === "weight"
            ? "Required Weight (kg)"
            : yKey === "V_int"
            ? "Interference Voltage (V)"
            : "Series 1";
        return { labels, series: [{ name, data }] };
      }
    }
    // Fallback: indexes
    return {
      labels: Array.from({ length: raw.length }, (_, i) => i + 1),
      series: [
        {
          name: "Series 1",
          data: raw.map((v) => {
            const n = typeof v === "number" ? v : v == null ? NaN : Number(v);
            return Number.isFinite(n) ? n : null;
          }),
        },
      ],
    };
  }
  return { labels: [], series: [] };
}

function shapeToRows(shape) {
  const maxLen = Math.max(0, ...shape.series.map((s) => s.data.length));
  const labels = shape.labels?.length
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

// Remove any array/series-like fields from results before printing JSON in History
function stripSeriesFields(results) {
  if (!results || typeof results !== "object") return {};
  const { ...rest } = results || {};
  const clean = {};
  for (const [k, v] of Object.entries(rest)) {
    if (Array.isArray(v)) continue; // drop any arrays
    clean[k] = v;
  }
  return clean;
}

// Build a single primary chart configuration per results, preferring module-style series.
// Reduce a generic chart to at most 2 series by picking those with the most data
function limitGenericToTwo(chart) {
  if (!chart || chart.kind !== "generic") return chart;
  const yKeys = Array.isArray(chart.yKeys) ? chart.yKeys.slice() : [];
  if (yKeys.length <= 2) return chart;

  // Score each series by count of finite values
  const scores = yKeys.map((k) => {
    const count = (chart.data || []).reduce(
      (acc, row) => acc + (Number.isFinite(Number(row?.[k])) ? 1 : 0),
      0
    );
    return { key: k, count };
  });
  scores.sort((a, b) => b.count - a.count);
  const keep = scores.slice(0, 2).map((s) => s.key);

  // Strip other series from data rows
  const data = (chart.data || []).map((row) => {
    const { __x } = row;
    const next = { __x };
    for (const k of keep) next[k] = row[k];
    return next;
  });

  return { ...chart, data, yKeys: keep };
}

function buildPrimaryChart(results = {}) {
  // 1) Impressed/Galvanic style: [{year, weight or weight_kg}] with optional inputs.design_life_years
  const lifeRaw = Array.isArray(results?.lifeSeriesData)
    ? results.lifeSeriesData
    : null;
  const icRaw = Array.isArray(results?.series) ? results.series : lifeRaw;
  if (
    Array.isArray(icRaw) &&
    icRaw.length &&
    (("year" in (icRaw[0] || {})) || ("x" in (icRaw[0] || {}))) &&
    (("weight" in (icRaw[0] || {})) || ("weight_kg" in (icRaw[0] || {})))
  ) {
    const data = icRaw
      .map((d) => ({
        year: Number(d?.year ?? d?.x ?? NaN),
        weight_kg: Number(d?.weight_kg ?? d?.weight ?? NaN),
      }))
      .filter((d) => Number.isFinite(d.year) && Number.isFinite(d.weight_kg));
    if (data.length) {
      const yMax =
        Math.max(1, Math.max(...data.map((d) => d.weight_kg))) * 1.25;
      const refX = Number(results?.inputs?.design_life_years);
      return {
        kind: "impressed",
        data,
        xKey: "year",
        yKey: "weight_kg",
        xLabel: "Year",
        yLabel: "Required Weight (kg)",
        yMax,
        refX: Number.isFinite(refX) && refX > 0 ? refX : null,
      };
    }
  }
  // 1a) Impressed FeSiCr fallback: rebuild series if backend stripped it
  if (results?.inputs?.anode_type === "FeSiCr") {
    const IA = Number(results?.I_A ?? 0);
    const U = Number(results?.inputs?.capacity_Ah_per_kg ?? 0);
    const eta = Number(results?.inputs?.eta ?? 0.5);
    const yearsMax = Math.max(
      1,
      Number(results?.inputs?.design_life_years ?? 10)
    );
    if (IA >= 0 && U > 0 && eta > 0) {
      const data = Array.from({ length: yearsMax }, (_, i) => {
        const year = i + 1;
        const weight_kg = (IA * year * 8760) / (U * eta);
        return { year, weight_kg };
      });
      const yMax =
        Math.max(1, Math.max(...data.map((d) => d.weight_kg))) * 1.25;
      return {
        kind: "impressed",
        data,
        xKey: "year",
        yKey: "weight_kg",
        xLabel: "Year",
        yLabel: "Required Weight (kg)",
        yMax,
        refX: yearsMax || null,
      };
    }
  }

  // 1b) Impressed MMO fallback: Quantity vs Safety Factor around current SF
  if (results?.inputs?.anode_type === "MMO") {
    const IA = Number(results?.I_A ?? 0);
    const Is = Number(
      results?.anode?.I_single_A ?? results?.inputs?.I_single_A ?? 0
    );
    const sfCenter = Number(results?.inputs?.safety_factor ?? 1.1);
    if (Is > 0 && IA >= 0) {
      const lo = Math.max(0.5, sfCenter - 0.4);
      const hi = sfCenter + 0.4;
      const step = 0.05;
      const data = [];
      for (let s = lo; s <= hi + 1e-9; s += step) {
        const sf = Number(s.toFixed(2));
        const N = (IA / Is) * sf;
        data.push({ sf, N });
      }
      return {
        kind: "mmo_sf",
        data,
        xKey: "sf",
        yKey: "N",
        xLabel: "Safety Factor (SF)",
        yLabel: "Quantity (N)",
      };
    }
  }

  // 2) Interference style: [{ d_m, V_int }]
  const intRaw = Array.isArray(results?.series) ? results.series : null;
  if (
    Array.isArray(intRaw) &&
    intRaw.length &&
    "d_m" in (intRaw[0] || {}) &&
    "V_int" in (intRaw[0] || {})
  ) {
    const data = intRaw
      .map((d) => ({
        d_m: Number(d?.d_m ?? NaN),
        V_int: Number(d?.V_int ?? NaN),
      }))
      .filter((d) => Number.isFinite(d.d_m) && Number.isFinite(d.V_int));
    if (data.length) {
      return {
        kind: "interference",
        data,
        xKey: "d_m",
        yKey: "V_int",
        xLabel: "Distance d (m)",
        yLabel: "Vint (V)",
      };
    }
  }

  // 3) Soil resistivity-like: spacingSeries [{ a, value }]
  const sp = Array.isArray(results?.spacingSeries)
    ? results.spacingSeries
    : null;
  if (
    Array.isArray(sp) &&
    sp.length &&
    "a" in (sp[0] || {}) &&
    "value" in (sp[0] || {})
  ) {
    const data = sp
      .map((d) => ({
        a: Number(d?.a ?? NaN),
        value: Number(d?.value ?? NaN),
      }))
      .filter((d) => Number.isFinite(d.a) && Number.isFinite(d.value));
    if (data.length) {
      return {
        kind: "spacing",
        data,
        xKey: "a",
        yKey: "value",
        xLabel: "Spacing (m)",
        yLabel: "R",
      };
    }
  }

  // 4) Distance profile: distanceSeries [{ d, value }]
  const dist = Array.isArray(results?.distanceSeries)
    ? results.distanceSeries
    : null;
  if (
    Array.isArray(dist) &&
    dist.length &&
    "d" in (dist[0] || {}) &&
    "value" in (dist[0] || {})
  ) {
    const data = dist
      .map((d) => ({
        d: Number(d?.d ?? NaN),
        value: Number(d?.value ?? NaN),
      }))
      .filter((d) => Number.isFinite(d.d) && Number.isFinite(d.value));
    if (data.length) {
      return {
        kind: "distance",
        data,
        xKey: "d",
        yKey: "value",
        xLabel: "Distance",
        yLabel: "Value",
      };
    }
  }

  // 5) N series: nSeries [{ n, value }]
  const ns = Array.isArray(results?.nSeries) ? results.nSeries : null;
  if (
    Array.isArray(ns) &&
    ns.length &&
    "n" in (ns[0] || {}) &&
    "value" in (ns[0] || {})
  ) {
    const data = ns
      .map((d) => ({
        n: Number(d?.n ?? NaN),
        value: Number(d?.value ?? NaN),
      }))
      .filter((d) => Number.isFinite(d.n) && Number.isFinite(d.value));
    if (data.length) {
      return {
        kind: "nseries",
        data,
        xKey: "n",
        yKey: "value",
        xLabel: "N",
        yLabel: "Value",
      };
    }
  }

  // 6) Generic: collapse any recognized structure into rows for a multi-series line chart
  const generic = normalizeSeries(
    results?.lifeSeriesData ??
      results?.seriesData ??
      results?.chartSeries ??
      results?.series ??
      null
  );

  if (generic.series.length && generic.labels.length) {
    const rows = shapeToRows(generic);
    const yKeys = generic.series.map((s) => s.name || "Series");
    const chart = {
      kind: "generic",
      data: rows,
      xKey: "__x",
      yKeys,
    };
    return limitGenericToTwo(chart);
  }

  return null;
}

export default function HistoryPage() {
  const {
    folders,
    loading: foldersLoading,
    error: foldersError,
    fetchFolders,
    show: showFolder,
    create,
    delete: deleteFolder,
    exportAsPdf,
    exportFolderPdf,
  } = useFoldersStore();

  const [openFolderId, setOpenFolderId] = React.useState(null);
  const [folderDetailsById, setFolderDetailsById] = React.useState({});
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState(null);

  React.useEffect(() => {
    fetchFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFolderDetails = async (folderId) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const res = await showFolder(folderId);
      const normalized = {
        ...res,
        calculations: Array.isArray(res?.calculations)
          ? res.calculations.map(normalizeCalc)
          : [],
      };
      setFolderDetailsById((prev) => ({ ...prev, [folderId]: normalized }));
      return normalized;
    } catch (e) {
      setDetailError(e?.message || "Failed to load folder details");
      return null;
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleFolder = async (folderId) => {
    const next = openFolderId === folderId ? null : folderId;
    setOpenFolderId(next);
    if (next && !folderDetailsById[next]) {
      await loadFolderDetails(next);
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt("Folder (project) name:");
    if (!name || !name.trim()) return;
    const created = await create(name.trim());
    // Refresh the list and auto-open the newly created folder
    await fetchFolders();
    if (created?.id) {
      setOpenFolderId(created.id);
      await loadFolderDetails(created.id);
    }
  };

  const handleDeleteFolder = async (folderId, folderName) => {
    if (
      !window.confirm(
        `Delete folder "${folderName || folderId}"? This cannot be undone.`
      )
    )
      return;
    await deleteFolder(folderId);
    setFolderDetailsById((prev) => {
      const cp = { ...prev };
      delete cp[folderId];
      return cp;
    });
    if (openFolderId === folderId) setOpenFolderId(null);
    await fetchFolders();
  };

  const handleExportFolder = async (folderId) => {
    try {
      const { blob, filename } = await exportFolderPdf(folderId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || `folder-${folderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      throw new Error("");
    }
  };

  const handleRefreshFolder = async (folderId) => {
    await loadFolderDetails(folderId);
  };

  return (
    <PageLayout title="History | CP">
      <PageHeader
        title="Server Folders & History"
        description="Browse folders (projects) and view their calculation runs from the backend."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCreateFolder}
              className="text-xs px-3 py-1.5 rounded-full border bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              New folder
            </button>
            <button
              type="button"
              onClick={() => fetchFolders()}
              className="text-xs px-3 py-1.5 rounded-full border bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Refresh folders
            </button>
            {foldersLoading ? (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Loading…
              </span>
            ) : null}
            {foldersError ? (
              <span className="text-xs text-red-600">
                {String(foldersError)}
              </span>
            ) : null}
          </div>
        }
      />

      <div className="col-span-12 space-y-6">
        {!folders || folders.length === 0 ? (
          <ModuleCard
            title="No folders"
            subtitle="No server folders found. Create one using the 'New folder' button above."
          />
        ) : (
          folders.map((f) => {
            const isOpen = openFolderId === f.id;
            const folderDetails = folderDetailsById[f.id];
            const calcs = folderDetails?.calculations ?? [];

            return (
              <ModuleCard
                key={String(f.id)}
                title={`${f.name || "Untitled Folder"} `}
                subtitle={
                  f.created_at ? `Created: ${tsFmt(f.created_at)}` : undefined
                }
                actions={
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleFolder(f.id)}
                      className="text-xs px-3 py-1.5 rounded-full border bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      {isOpen ? "Hide" : "Show"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportFolder(f.id)}
                      className="text-xs px-3 py-1.5 rounded-full border bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Export PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFolder(f.id, f.name)}
                      className="text-xs px-3 py-1.5 rounded-full border border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                }
              >
                {isOpen ? (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Folder #{f.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRefreshFolder(f.id)}
                        className="text-xs px-2 py-1 rounded-full border bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        Refresh
                      </button>
                      {detailLoading ? (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Loading…
                        </span>
                      ) : null}
                      {detailError ? (
                        <span className="text-xs text-red-600">
                          {String(detailError)}
                        </span>
                      ) : null}
                    </div>

                    {!calcs || calcs.length === 0 ? (
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        No calculations in this folder.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {calcs.map((row) => {
                          const title =
                            row?.title ||
                            row?.formula_name ||
                            "Calculation";
                          const stamp =
                            row?.created_at ||
                            row?.updated_at ||
                            row?.ts ||
                            "";
                          const status = row?.status
                            ? String(row.status)
                            : "";

                          const inputs = row?.inputs ?? {};
                          const results = row?.results ?? {};
                          const life = Array.isArray(results?.lifeSeriesData)
                            ? results.lifeSeriesData
                            : null;
                          const W_required = Number(
                            results?.W_required || 0
                          );

                          // yMax like in GalvanicResults
                          const yMax =
                            life && life.length
                              ? Math.max(
                                  ...life.map(
                                    (d) => Number(d.weight) || 0
                                  ),
                                  W_required || 0
                                ) *
                                  1.25 || 10
                              : 10;

                          const resultsNoSeries =
                            stripSeriesFields(results || {});

                          const primary = buildPrimaryChart(results);

                          return (
                            <div
                              key={row?.id || `${title}-${stamp}`}
                              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-4"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-semibold text-gray-900 dark:text-gray-100">
                                  {title}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {tsFmt(stamp)}
                                  {status ? ` • ${status}` : ""}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                {/* Inputs */}
                                <div>
                                  <div className="font-semibold mb-1 text-gray-800 dark:text-gray-200">
                                    Inputs
                                  </div>
                                  <pre className="whitespace-pre-wrap overflow-auto bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg border border-gray-100 dark:border-gray-800 w-[1400px] max-w-full">
                                    {JSON.stringify(inputs, null, 2)}
                                  </pre>
                                </div>

                                {/* Results + Chart */}
                                <div>
                                  <div className="font-semibold mb-1 text-gray-800 dark:text-gray-200">
                                    Results
                                  </div>

                                  {/* Chart from lifeSeriesData (not shown as numbers) */}
                                  {life && life.length ? (
                                    <div className="mb-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 p-2 h-64">
                                      <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                      >
                                        <LineChart
                                          data={life}
                                          margin={{
                                            top: 8,
                                            right: 16,
                                            left: 40,
                                            bottom: 0,
                                          }}
                                        >
                                          <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#e5e7eb"
                                          />
                                          <XAxis
                                            dataKey="year"
                                            tick={{ fontSize: 12 }}
                                            label={{
                                              value: "Years",
                                              position:
                                                "insideBottomRight",
                                              offset: -4,
                                            }}
                                          />
                                          <YAxis
                                            domain={[0, yMax]}
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(v) =>
                                              fmt(v, 2)
                                            }
                                            label={{
                                              value: "kg",
                                              angle: -90,
                                              position: "insideLeft",
                                            }}
                                          />
                                          <Tooltip
                                            formatter={(v) =>
                                              `${fmt(v, 2)} kg`
                                            }
                                            labelFormatter={(l) =>
                                              `Year ${l}`
                                            }
                                          />
                                          {Number.isFinite(
                                            W_required
                                          ) && W_required > 0 ? (
                                            <ReferenceLine
                                              y={W_required}
                                              stroke="#2563eb"
                                              strokeDasharray="4 2"
                                              label={{
                                                value: `At t: ${fmt(
                                                  W_required,
                                                  2
                                                )} kg`,
                                                position: "right",
                                                fill: "#2563eb",
                                                fontSize: 12,
                                              }}
                                            />
                                          ) : null}
                                        </LineChart>
                                      </ResponsiveContainer>
                                    </div>
                                  ) : null}

                                  {primary ? (
                                    <div className="mb-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 p-2 h-64">
                                      <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                      >
                                        <LineChart
                                          data={primary.data}
                                          margin={{
                                            top: 10,
                                            right: 20,
                                            left: 16,
                                            bottom: 0,
                                          }}
                                        >
                                          <CartesianGrid strokeDasharray="3 3" />
                                          <XAxis
                                            dataKey={primary.xKey}
                                            tick={{ fontSize: 12 }}
                                            label={{
                                              value:
                                                primary.xLabel || "",
                                              position:
                                                "insideBottomRight",
                                              offset: -4,
                                            }}
                                          />
                                          <YAxis
                                            domain={
                                              primary.yMax
                                                ? [0, primary.yMax]
                                                : undefined
                                            }
                                            tick={{ fontSize: 12 }}
                                            label={
                                              primary.yLabel
                                                ? {
                                                    value:
                                                      primary.yLabel,
                                                    angle: -90,
                                                    position:
                                                      "insideLeft",
                                                  }
                                                : undefined
                                            }
                                          />
                                          <Tooltip />
                                          {primary.kind ===
                                          "generic" ? (
                                            <Legend />
                                          ) : null}
                                          {primary.kind === "generic"
                                            ? (primary.yKeys || []).map(
                                                (k, i) => (
                                                  <Line
                                                    key={
                                                      k ||
                                                      `S${i + 1}`
                                                    }
                                                    type="monotone"
                                                    dataKey={
                                                      k ||
                                                      `S${i + 1}`
                                                    }
                                                    dot={false}
                                                    strokeWidth={2}
                                                  />
                                                )
                                              )
                                            : (
                                              <Line
                                                type="monotone"
                                                dataKey={primary.yKey}
                                                stroke="#2563eb"
                                                strokeWidth={2}
                                                dot={false}
                                              />
                                              )}
                                          {primary.refX ? (
                                            <ReferenceLine
                                              x={primary.refX}
                                              stroke="#ef4444"
                                              strokeDasharray="4 4"
                                              label={`t=${primary.refX}y`}
                                            />
                                          ) : null}
                                        </LineChart>
                                      </ResponsiveContainer>
                                    </div>
                                  ) : null}

                                  {/* Results JSON (without lifeSeriesData) */}
                                  <pre className="whitespace-pre-wrap overflow-auto bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg border border-gray-100 dark:border-gray-800 w-[1400px] max-w-full">
                                    {JSON.stringify(
                                      resultsNoSeries ?? {},
                                      null,
                                      2
                                    )}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : null}
              </ModuleCard>
            );
          })
        )}
      </div>
    </PageLayout>
  );
}
