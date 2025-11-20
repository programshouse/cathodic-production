// /src/pages/Lib/LibPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import CardBox from "../../components/ui/CardBox";
import { useLibStore } from "../../stores/useLibStore";
import { useLibraryFoldersStore } from "../../stores/useLibraryFoldersStore";
import { useLibrarySubFoldersStore } from "../../stores/useLibrarySubFoldersStore";
import { toast } from "react-toastify";

export default function LibPage() {
  const {
    library,
    loading,
    error,
    fetchlibrary,
    postlibrary,
    deletelibrary,
    showlibrary,
  } = useLibStore();

  const {
    libraryFolders,
    getAll: getAllLibraryFolders,
    create: createLibraryFolder,
  } = useLibraryFoldersStore();

  const {
    librarySubFolders,
    getAll: getAllLibrarySubFolders,
    create: createLibrarySubFolder,
  } = useLibrarySubFoldersStore();

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null); // selected item for details modal
  const [query, setQuery] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedSubFolderId, setSelectedSubFolderId] = useState(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newSubFolderName, setNewSubFolderName] = useState("");
  const fileInputRef = useRef(null);

  // Initial fetch once
  useEffect(() => {
    fetchlibrary().catch(() => {});
    getAllLibraryFolders().catch(() => {});
    getAllLibrarySubFolders().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    let list = library || [];

    // If no folder/subfolder and no search, don't show anything yet
    if (!selectedFolderId && !selectedSubFolderId && !query) {
      return [];
    }

    if (selectedFolderId) {
      list = list.filter(
        (f) => Number(f.folder_id) === Number(selectedFolderId)
      );
    }

    if (selectedSubFolderId) {
      list = list.filter(
        (f) => Number(f.sub_folder_id) === Number(selectedSubFolderId)
      );
    }

    if (!query) return list;

    const q = query.toLowerCase();
    return list.filter((f) =>
      [f.title, f.filename, f.mime, f.mimetype, f.notes, f.url, f.path]
        .filter(Boolean)
        .some((x) => String(x).toLowerCase().includes(q))
    );
  }, [library, query, selectedFolderId, selectedSubFolderId]);

  const latest5 = useMemo(() => (filtered || []).slice(0, 5), [filtered]);

  // const pickFiles = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) await doMultiUpload(files);
    e.target.value = "";
  };

  const onDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) await doMultiUpload(files);
  };

  const doMultiUpload = async (files) => {
    const t = toast.loading(`Uploading ${files.length} file${files.length > 1 ? "s" : ""}…`);
    try {
      // Upload sequentially to keep backend happy (or use Promise.all if API tolerates)
      for (const file of files) {
        await postlibrary({
          file,
          title,
          notes,
          folderId: selectedFolderId,
          subFolderId: selectedSubFolderId,
        });
      }
      await fetchlibrary();
      toast.update(t, {
        render: `Uploaded ${files.length} file${files.length > 1 ? "s" : ""}`,
        type: "success",
        isLoading: false,
        autoClose: 1400,
      });
      setTitle("");
      setNotes("");
    } catch (err) {
      toast.update(t, {
        render: err?.message || "Upload failed",
        type: "error",
        isLoading: false,
        autoClose: 2600,
      });
    }
  };

  const handleDetails = async (id) => {
    const t = toast.loading("Loading details…");
    try {
      const item = await showlibrary(id);
      setPreview(item);
      toast.dismiss(t);
    } catch (err) {
      toast.update(t, { render: err?.message || "Failed to load", type: "error", isLoading: false, autoClose: 2500 });
    }
  };

  return (
    <PageLayout title="Library | CP">
      <PageHeader
        title="Library"
        description="Upload, manage, and preview reference files for Cathodic Protection modules."
      />

      {/* Upload & Search */}
      <CardBox className="mb-6">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {/* Left: meta */}
          <div className="xl:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title (optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e)=>setTitle(e.target.value)}
                  placeholder="e.g. CP Design Guide 2025.pdf"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e)=>setNotes(e.target.value)}
                  placeholder="Short description or tags (e.g. #attenuation #design)"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Folder</label>
                <select
                  value={selectedFolderId || ""}
                  onChange={(e) => {
                    const v = e.target.value || null;
                    setSelectedFolderId(v ? Number(v) : null);
                    setSelectedSubFolderId(null);
                  }}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                >
                  <option value="">— No folder —</option>
                  {(libraryFolders || []).map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name || `Folder #${f.id}`}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="New folder name"
                    className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const name = newFolderName.trim();
                      if (!name) return;
                      const created = await createLibraryFolder(name);
                      setNewFolderName("");
                      if (created?.id) setSelectedFolderId(created.id);
                    }}
                    className="text-xs px-3 py-2 rounded-xl border bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
                  >
                    + Folder
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sub Folder</label>
                <select
                  value={selectedSubFolderId || ""}
                  onChange={(e) => {
                    const v = e.target.value || null;
                    setSelectedSubFolderId(v ? Number(v) : null);
                  }}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                >
                  <option value="">— No sub folder —</option>
                  {(librarySubFolders || [])
                    .filter((sf) =>
                      selectedFolderId
                        ? Number(sf.folder_id) === Number(selectedFolderId)
                        : true
                    )
                    .map((sf) => (
                      <option key={sf.id} value={sf.id}>
                        {sf.name || `Sub Folder #${sf.id}`}
                      </option>
                    ))}
                </select>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newSubFolderName}
                    onChange={(e) => setNewSubFolderName(e.target.value)}
                    placeholder="New sub folder name"
                    className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const name = newSubFolderName.trim();
                      if (!name || !selectedFolderId) return;
                      const created = await createLibrarySubFolder(
                        name,
                        selectedFolderId
                      );
                      setNewSubFolderName("");
                      if (created?.id) setSelectedSubFolderId(created.id);
                    }}
                    className="text-xs px-3 py-2 rounded-xl border bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
                  >
                    + Sub
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e)=>setQuery(e.target.value)}
                    placeholder="Search in title/type/notes/url…"
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm pl-9"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔎</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchlibrary().catch(()=>{})}
                  className="w-full text-xs px-3 py-2 rounded-xl border bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
                  disabled={loading}
                >
                  {loading ? "Refreshing…" : "Refresh"}
                </button>
                <button
                  type="button"
                  onClick={() => { setTitle(""); setNotes(""); setQuery(""); }}
                  className="w-full text-xs px-3 py-2 rounded-xl border bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Right: dropzone */}
          <div
            onDragOver={(e)=>{ e.preventDefault(); setDragOver(true); }}
            onDragLeave={()=>setDragOver(false)}
            onDrop={onDrop}
            className={`rounded-2xl border-2 border-dashed p-4 text-center transition h-full flex flex-col items-center justify-center
              ${dragOver ? "border-blue-400 bg-blue-50/50 dark:border-blue-600/70 dark:bg-blue-950/30" : "border-gray-300 dark:border-gray-700"}`}
          >
            <div className="text-sm text-gray-700 dark:text-gray-200">Drag & drop files here</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">or</div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs px-3 py-1.5 rounded-full border bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
              disabled={loading}
            >
              {loading ? "…" : "Choose files"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.svg,.txt"
              onChange={handleFileChange}
            />
            <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">PDF, images, docs… (multi‑select supported)</div>
          </div>
        </div>
      </CardBox>

      {/* Featured Cards Grid */}
      <CardBox className="mb-6">
        {/* <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold">Latest files</div>
          <div className="text-[12px] text-gray-500 dark:text-gray-400">Showing {latest5.length} of {filtered.length}</div>
        </div> */}
        {/* <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {latest5.map((f) => (
            <FileCard key={f.id} f={f}
              onOpen={() => f.url && window.open(f.url, "_blank", "noreferrer")}
              onDetails={() => handleDetails(f.id)}
              onDelete={() => confirmDelete(() => deletelibrary(f.id))}
            />
          ))}
          {latest5.length === 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400">No files yet.</div>
          )}
        </div> */}
      </CardBox>

      {/* Full Table with actions */}
      <CardBox>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold">All Files</div>
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
              {(!filtered || filtered.length === 0) && !loading && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500 dark:text-gray-400">
                    {selectedFolderId || selectedSubFolderId || query
                      ? "No files match."
                      : "Select a folder (and optional sub folder) to view its files."}
                  </td>
                </tr>
              )}

              {filtered.map((f) => (
                <tr key={f.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2 pr-4">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{f.title || f.filename || "Untitled"}</div>
                    <div className="text-[12px] text-gray-500 dark:text-gray-400 break-all">{f.url || f.path || ""}</div>
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
                        type="button"
                        onClick={() => handleDetails(f.id)}
                        className="text-xs px-2 py-1 rounded-full border hover:bg-gray-50 dark:hover:bg-gray-800"
                        disabled={loading}
                      >
                        Show
                      </button>
                      <button
                        onClick={() => confirmDelete(() => deletelibrary(f.id))}
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

      {/* Details Modal */}
      <DetailsModal item={preview} onClose={() => setPreview(null)} />
    </PageLayout>
  );
}

/* --------------------------------- UI --------------------------------- */
function FileCard({ f, onOpen, onDetails, onDelete }) {
  return (
    <div className="group rounded-2xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
            {f.title || f.filename || "Untitled"}
          </div>
          <div className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
            {f.mime || f.mimetype || "-"}
          </div>
        </div>
        <div className="text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatBytes(f.size)}</div>
      </div>
      <div className="text-[12px] text-gray-500 dark:text-gray-400 break-all line-clamp-2 min-h-[30px]">
        {f.url || f.path || ""}
      </div>
      <div className="flex items-center gap-2 mt-auto">
        {f.url && (
          <button onClick={onOpen} className="text-xs px-2 py-1 rounded-full border hover:bg-gray-50 dark:hover:bg-gray-800">Open</button>
        )}
        <button onClick={onDetails} className="text-xs px-2 py-1 rounded-full border hover:bg-gray-50 dark:hover:bg-gray-800">Details</button>
        <button onClick={onDelete} className="text-xs px-2 py-1 rounded-full border border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/30 ml-auto">Delete</button>
      </div>
    </div>
  );
}

function DetailsModal({ item, onClose }) {
  if (!item) return null;
  const isImg = (item?.mime || "").startsWith("image/");
  const isPdf = (item?.mime || "").includes("pdf");
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-[820px]">
        <div className="m-0 md:m-4 rounded-t-2xl md:rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="text-sm font-semibold">{item.title || item.filename || `File #${item.id}`}</div>
            <button onClick={onClose} className="text-sm px-2 py-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">✕</button>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 min-h-[240px] rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/30 flex items-center justify-center overflow-hidden">
              {isImg && item.url && (
                <img src={item.url} alt={item.title || item.filename} className="max-h-[420px] object-contain" />
              )}
              {!isImg && isPdf && item.url && (
                <iframe title="preview" src={item.url} className="w-full h-[380px]" />
              )}
              {!item.url && (
                <div className="text-xs text-gray-500 dark:text-gray-400">No preview available</div>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <MetaRow label="Type" value={item.mime || item.mimetype || "-"} />
              <MetaRow label="Size" value={formatBytes(item.size)} />
              <MetaRow label="Uploaded" value={formatDateTime(item.created_at || item.uploaded_at)} />
              <MetaRow label="URL" value={<a href={item.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">{item.url || "-"}</a>} />
              <div className="pt-2">
                <div className="text-[12px] text-gray-500 dark:text-gray-400 mb-1">Notes</div>
                <div className="text-[13px] text-gray-800 dark:text-gray-200 whitespace-pre-wrap min-h-[40px]">
                  {item.notes || "-"}
                </div>
              </div>
              <div className="pt-3 flex items-center gap-2">
                {item.url && (
                  <a href={item.url} target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 rounded-full border hover:bg-gray-50 dark:hover:bg-gray-800">Open</a>
                )}
                <button onClick={onClose} className="text-xs px-3 py-1.5 rounded-full border bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800">Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value }) {
  return (
    <div className="flex gap-2">
      <div className="w-28 text-[12px] text-gray-500 dark:text-gray-400">{label}</div>
      <div className="flex-1 text-[13px] text-gray-800 dark:text-gray-200 break-all">{value}</div>
    </div>
  );
}

/* ------------------------------- utils ------------------------------- */
function confirmDelete(action) {
  const t = toast.loading("Deleting…");
  const ok = window.confirm("Delete this file?");
  if (!ok) { toast.dismiss(t); return; }
  action()
    .then(() => toast.update(t, { render: "Deleted", type: "success", isLoading: false, autoClose: 1200 }))
    .catch((err) => toast.update(t, { render: err?.message || "Delete failed", type: "error", isLoading: false, autoClose: 2500 }));
}

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
