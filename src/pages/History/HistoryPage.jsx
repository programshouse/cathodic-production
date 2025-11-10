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
    await create(name.trim());
    await fetchFolders();
  };

  const handleDeleteFolder = async (folderId, folderName) => {
    if (!window.confirm(`Delete folder "${folderName || folderId}"? This cannot be undone.`)) return;
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
    await exportAsPdf(folderId);
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
            {foldersLoading ? <span className="text-xs text-gray-500 dark:text-gray-400">Loading…</span> : null}
            {foldersError ? <span className="text-xs text-red-600">{String(foldersError)}</span> : null}
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
                key={f.id}
                title={`${f.name || "Untitled Folder"} (ID: ${f.id})`}
                subtitle={f.created_at ? `Created: ${tsFmt(f.created_at)}` : undefined}
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
                        <span className="text-xs text-gray-500 dark:text-gray-400">Loading…</span>
                      ) : null}
                      {detailError ? (
                        <span className="text-xs text-red-600">{String(detailError)}</span>
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
                          const status = row?.status ? String(row.status) : "";

                          const inputs = row?.inputs ?? {};
                          const results = row?.results ?? {};
                          const life = Array.isArray(results?.lifeSeriesData) ? results.lifeSeriesData : null;
                          const W_required = Number(results?.W_required || 0);

                          // yMax like in GalvanicResults
                          const yMax = life && life.length
                            ? Math.max(...life.map(d => Number(d.weight) || 0), W_required || 0) * 1.25 || 10
                            : 10;

                          // Remove lifeSeriesData from results JSON displayed
                          const { lifeSeriesData, ...resultsNoLife } = results || {};

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
                                  {tsFmt(stamp)}{status ? ` • ${status}` : ""}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                {/* Inputs */}
                                <div>
                                  <div className="font-semibold mb-1 text-gray-800 dark:text-gray-200">Inputs</div>
                                  <pre className="whitespace-pre-wrap overflow-auto bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg border border-gray-100 dark:border-gray-800 w-[1400px] max-w-full">
                                    {JSON.stringify(inputs, null, 2)}
                                  </pre>
                                </div>

                                {/* Results + Chart */}
                                <div>
                                  <div className="font-semibold mb-1 text-gray-800 dark:text-gray-200">Results</div>

                                  {/* Chart from lifeSeriesData (not shown as numbers) */}
                                  {life && life.length ? (
                                    <div className="mb-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 p-2 h-64">
                                      <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={life} margin={{ top: 8, right: 16, left: 40, bottom: 0 }}>
                                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                          <XAxis
                                            dataKey="year"
                                            tick={{ fontSize: 12 }}
                                            label={{ value: "Years", position: "insideBottomRight", offset: -4 }}
                                          />
                                          <YAxis
                                            domain={[0, yMax]}
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(v) => fmt(v, 2)}
                                            label={{ value: "kg", angle: -90, position: "insideLeft" }}
                                          />
                                          <Tooltip
                                            formatter={(v) => `${fmt(v, 2)} kg`}
                                            labelFormatter={(l) => `Year ${l}`}
                                          />
                                          {Number.isFinite(W_required) && W_required > 0 ? (
                                            <ReferenceLine
                                              y={W_required}
                                              stroke="#2563eb"
                                              strokeDasharray="4 2"
                                              label={{
                                                value: `At t: ${fmt(W_required, 2)} kg`,
                                                position: "right",
                                                fill: "#2563eb",
                                                fontSize: 12,
                                              }}
                                            />
                                          ) : null}
                                          <Line
                                            type="monotone"
                                            dataKey="weight"
                                            name="Required Weight"
                                            stroke="#3b82f6"
                                            dot={false}
                                            strokeWidth={2}
                                          />
                                        </LineChart>
                                      </ResponsiveContainer>
                                    </div>
                                  ) : null}

                                  {/* Results JSON (without the lifeSeriesData array) */}
                                  <pre className="whitespace-pre-wrap overflow-auto bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg border border-gray-100 dark:border-gray-800 w-[1400px] max-w-full">
                                    {JSON.stringify(resultsNoLife ?? {}, null, 2)}
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
