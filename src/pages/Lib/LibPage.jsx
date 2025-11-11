// /src/pages/Lib/LibPage.jsx
import React, { useEffect, useRef, useState } from "react";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import CardBox from "../../components/ui/CardBox";
import { useLibStore } from "../../stores/useLibStore";
import { toast } from "react-toastify";

export default function LibPage() {
  const { library, loading, error, fetchlibrary, postlibrary, deleteFile } = useLibStore();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchlibrary().catch(() => {});
  }, [fetchlibrary]);

  const pickFile = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) await doUpload(file);
    e.target.value = "";
  };

  const onDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await doUpload(file);
  };

  const doUpload = async (file) => {
    const t = toast.loading("Uploading…");
    try {
      // Pass what your store method expects
      await postlibrary({ file, title, notes });
      toast.update(t, { render: "Uploaded", type: "success", isLoading: false, autoClose: 1200 });
      setTitle("");
      setNotes("");
      await fetchlibrary();
    } catch (err) {
      toast.update(t, { render: err?.message || "Upload failed", type: "error", isLoading: false, autoClose: 2500 });
    }
  };

  return (
    <PageLayout title="Library | CP">
      <PageHeader
        title="Library"
        description="Upload, manage, and share reference files for Cathodic Protection modules."
      />

      {/* Upload Card */}
      <CardBox className="mb-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e)=>setTitle(e.target.value)}
              placeholder="e.g. CP Design Guide 2025.pdf"
              className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
            />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-3 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e)=>setNotes(e.target.value)}
              rows={3}
              placeholder="Short description or where it is used…"
              className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-1">
            <div
              onDragOver={(e)=>{ e.preventDefault(); setDragOver(true); }}
              onDragLeave={()=>setDragOver(false)}
              onDrop={onDrop}
              className={`rounded-2xl border-2 border-dashed p-4 text-center transition
                ${dragOver ? "border-blue-400 bg-blue-50/50 dark:border-blue-600/70 dark:bg-blue-950/30"
                            : "border-gray-300 dark:border-gray-700"}`}
            >
              <div className="text-sm text-gray-700 dark:text-gray-200">Drag & drop file here</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">or</div>
              <button
                type="button"
                onClick={pickFile}
                className="text-xs px-3 py-1.5 rounded-full border bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
                disabled={loading}
              >
                {loading ? "…" : "Choose file"}
              </button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
              <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">PDF, images, docs…</div>
            </div>
          </div>
        </div>
      </CardBox>

      {/* Files List */}
      <CardBox>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold">Library Files</div>
          <button
            onClick={()=>fetchlibrary().catch(()=>{})}
            className="text-xs px-3 py-1.5 rounded-full border bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200 text-sm">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-800">
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4 hidden md:table-cell">Type</th>
                <th className="py-2 pr-4 hidden md:table-cell">Size</th>
                <th className="py-2 pr-4 hidden md:table-cell">Uploaded</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(!library || library.length === 0) && !loading && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500 dark:text-gray-400">
                    No files yet.
                  </td>
                </tr>
              )}

              {library?.map((f) => (
                <tr key={f.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2 pr-4">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {f.title || f.filename || "Untitled"}
                    </div>
                    <div className="text-[12px] text-gray-500 dark:text-gray-400 break-all">
                      {f.url || f.path || ""}
                    </div>
                  </td>
                  <td className="py-2 pr-4 hidden md:table-cell">{f.mime || f.mimetype || "-"}</td>
                  <td className="py-2 pr-4 hidden md:table-cell">{formatBytes(f.size)}</td>
                  <td className="py-2 pr-4 hidden md:table-cell">{formatDateTime(f.created_at || f.uploaded_at)}</td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      {f.url && (
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs px-2 py-1 rounded-full border hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          Open
                        </a>
                      )}
                      <button
                        onClick={async () => {
                          const ok = confirm("Delete this file?");
                          if (!ok) return;
                          const t = toast.loading("Deleting…");
                          try {
                            await deleteFile(f.id);
                            toast.update(t, { render: "Deleted", type: "success", isLoading: false, autoClose: 1200 });
                          } catch (err) {
                            toast.update(t, { render: err?.message || "Delete failed", type: "error", isLoading: false, autoClose: 2500 });
                          }
                        }}
                        className="text-xs px-2 py-1 rounded-full border border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/30"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBox>
    </PageLayout>
  );
}

/* ---------- small utils ---------- */
function formatBytes(bytes) {
  const b = Number(bytes);
  if (!Number.isFinite(b) || b <= 0) return "-";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(b) / Math.log(1024));
  return `${(b / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function formatDateTime(s) {
  if (!s) return "-";
  try { return new Date(s).toLocaleString(); } catch { return s; }
}
