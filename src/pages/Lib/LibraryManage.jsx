// /src/pages/Lib/LibraryManage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import CardBox from "../../components/ui/CardBox";
import { useLibStore } from "../../stores/useLibStore";
import CPLogo from "../../../dist/images/logo/logoos.jpg";
import { toast } from "react-toastify";

/* ===== Brand ===== */
const CP_BLUE = "#122A56";
const CP_GOLD = "#F4B73A";

export default function LibraryManage() {
  const {
    library,
    loading,
    error,
    fetchlibrary,
    postlibrary,
    deletelibrary,
    showlibrary,
  } = useLibStore();

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchlibrary().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --------- filtering --------- */
  const filtered = useMemo(() => {
    let list = library || [];
    if (typeFilter !== "all") {
      list = list.filter((f) => (f.mime || f.mimetype || "").includes(typeFilter));
    }
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter((f) =>
      [f.title, f.filename, f.mime, f.mimetype, f.notes, f.url, f.path]
        .filter(Boolean)
        .some((x) => String(x).toLowerCase().includes(q))
    );
  }, [library, typeFilter, query]);

  const latest5 = useMemo(() => (filtered || []).slice(0, 5), [filtered]);

  /* --------- upload handlers --------- */
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
      for (const file of files) {
        await postlibrary({ file, title, notes });
      }
      await fetchlibrary();
      toast.update(t, { render: `Uploaded ${files.length} file${files.length > 1 ? "s" : ""}`, type: "success", isLoading: false, autoClose: 1400 });
      setTitle("");
      setNotes("");
    } catch (err) {
      toast.update(t, { render: err?.message || "Upload failed", type: "error", isLoading: false, autoClose: 2600 });
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
    <PageLayout title="Library (Manage) | CP">
      <div className="flex items-center gap-3 mb-4">
        <img src={CPLogo} alt="CP" className="h-12 w-12 rounded-full object-cover ring-2" style={{ ringColor: CP_BLUE }} />
        <PageHeader
          title="Library — Admin"
          description="Upload, manage, and preview reference files for Cathodic Protection modules."
        />
      </div>

      {/* Upload + Search/Filters */}
      <CardBox className="mb-6">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {/* Left meta + search */}
          <div className="xl:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LabeledInput label="Title (optional)" value={title} onChange={setTitle} placeholder="e.g. CP Design Guide 2025.pdf" />
              <LabeledInput label="Notes (optional)" value={notes} onChange={setNotes} placeholder="Short description or tags (e.g. #attenuation #design)" />
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-6 gap-3">
              <div className="md:col-span-4">
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e)=>setQuery(e.target.value)}
                    placeholder="Search in title/type/notes/url…"
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm pl-9 focus:outline-none focus:ring-2"
                    style={{ outlineColor: CP_BLUE }}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔎</span>
                </div>
              </div>
              <div className="md:col-span-2 flex gap-2">
                <select
                  value={typeFilter}
                  onChange={(e)=>setTypeFilter(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-xl border bg-white dark:bg-gray-900"
                >
                  <option value="all">All types</option>
                  <option value="image/">Images</option>
                  <option value="pdf">PDF</option>
                  <option value="word">Word</option>
                  <option value="excel">Excel</option>
                  <option value="text">Text</option>
                </select>
                <button
                  type="button"
                  onClick={() => fetchlibrary().catch(()=>{})}
                  className="text-xs px-3 py-2 rounded-xl border bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
                  disabled={loading}
                >
                  {loading ? "Refreshing…" : "Refresh"}
                </button>
              </div>
            </div>
          </div>

          {/* Right dropzone */}
          <div
            onDragOver={(e)=>{ e.preventDefault(); setDragOver(true); }}
            onDragLeave={()=>setDragOver(false)}
            onDrop={onDrop}
            className={`rounded-2xl border-2 border-dashed p-4 text-center transition h-full flex flex-col items-center justify-center
            ${dragOver ? "bg-blue-50/50 dark:bg-blue-950/30" : ""}`}
            style={{ borderColor: dragOver ? CP_BLUE : "#cbd5e1" }}
          >
            <div className="text-sm" style={{ color: CP_BLUE }}>Drag & drop files here</div>
            <div className="text-xs text-gray-500 mb-2">or</div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs px-3 py-1.5 rounded-full border hover:opacity-90"
              style={{ borderColor: CP_BLUE, color: CP_BLUE }}
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
            <div className="mt-2 text-[11px] text-gray-500">PDF, images, docs… (multi-select supported)</div>
          </div>
        </div>
      </CardBox>

      {/* Featured */}
      <CardBox className="mb-6">
        <SectionHead count={latest5.length} total={filtered.length} title="Latest files" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {latest5.map((f) => (
            <FileCard
              key={f.id}
              f={f}
              brand={CP_BLUE}
              onOpen={() => f.url && window.open(f.url, "_blank", "noreferrer")}
              onDetails={() => handleDetails(f.id)}
              onDelete={() => confirmDelete(() => deletelibrary(f.id))}
            />
          ))}
          {latest5.length === 0 && <div className="text-sm text-gray-500">No files yet.</div>}
        </div>
      </CardBox>

      {/* Table */}
      <CardBox>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold" style={{ color: CP_BLUE }}>All Files</div>
        </div>

        {error && (
          <div className="mb-3 rounded-lg border px-3 py-2 text-sm"
               style={{ borderColor: "#fecaca", background: "#fff1f2", color: "#be123c" }}>
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm rounded-xl overflow-hidden">
            <thead style={{ background: CP_BLUE, color: "white" }}>
              <tr className="text-left">
                <Th>Title</Th>
                <Th className="hidden md:table-cell">Type</Th>
                <Th className="hidden md:table-cell">Size</Th>
                <Th className="hidden md:table-cell">Uploaded</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {(!filtered || filtered.length === 0) && !loading && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">No files match.</td>
                </tr>
              )}
              {filtered.map((f, idx) => (
                <tr key={f.id} className={`border-b ${idx % 2 ? "bg-gray-50/60" : "bg-white"}`}>
                  <Td>
                    <div className="font-medium text-gray-900">{f.title || f.filename || "Untitled"}</div>
                    <div className="text-[12px] text-gray-500 break-all">{f.url || f.path || ""}</div>
                  </Td>
                  <Td className="hidden md:table-cell">{f.mime || f.mimetype || "-"}</Td>
                  <Td className="hidden md:table-cell">{formatBytes(f.size)}</Td>
                  <Td className="hidden md:table-cell">{formatDateTime(f.created_at || f.uploaded_at)}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      {f.url && (
                        <a href={f.url} target="_blank" rel="noreferrer"
                           className="text-xs px-2 py-1 rounded-full border" style={{ borderColor: CP_BLUE, color: CP_BLUE }}>
                          Open
                        </a>
                      )}
                      <button type="button" onClick={() => handleDetails(f.id)}
                              className="text-xs px-2 py-1 rounded-full border"
                              style={{ borderColor: CP_BLUE, color: CP_BLUE }}>
                        Show
                      </button>
                      <button onClick={() => confirmDelete(() => deletelibrary(f.id))}
                              className="text-xs px-2 py-1 rounded-full border"
                              style={{ borderColor: "#fca5a5", color: "#b91c1c" }}>
                        Delete
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBox>

      {/* Details Modal */}
      <DetailsModal item={preview} onClose={() => setPreview(null)} brand={CP_BLUE} accent={CP_GOLD} />
    </PageLayout>
  );
}

/* ---------------- UI bits ---------------- */
function LabeledInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
      />
    </div>
  );
}

function SectionHead({ title, count, total }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-[12px] text-gray-500">Showing {count} of {total}</div>
    </div>
  );
}

function FileCard({ f, brand, onOpen, onDetails, onDelete }) {
  return (
    <div className="group rounded-2xl border bg-white border-gray-200 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-gray-900 line-clamp-2">
            {f.title || f.filename || "Untitled"}
          </div>
          <div className="text-[12px] text-gray-500 mt-0.5">
            {f.mime || f.mimetype || "-"}
          </div>
        </div>
        <div className="text-[11px] text-gray-500 whitespace-nowrap">{formatBytes(f.size)}</div>
      </div>
      <div className="text-[12px] text-gray-500 break-all line-clamp-2 min-h-[30px]">
        {f.url || f.path || ""}
      </div>
      <div className="flex items-center gap-2 mt-auto">
        {f.url && (
          <button onClick={onOpen} className="text-xs px-2 py-1 rounded-full border hover:bg-gray-50"
                  style={{ borderColor: brand, color: brand }}>
            Open
          </button>
        )}
        <button onClick={onDetails} className="text-xs px-2 py-1 rounded-full border hover:bg-gray-50"
                style={{ borderColor: brand, color: brand }}>
          Details
        </button>
        <button onClick={onDelete} className="text-xs px-2 py-1 rounded-full border ml-auto"
                style={{ borderColor: "#fca5a5", color: "#b91c1c" }}>
          Delete
        </button>
      </div>
    </div>
  );
}

function DetailsModal({ item, onClose, brand, accent }) {
  if (!item) return null;
  const isImg = (item?.mime || "").startsWith("image/");
  const isPdf = (item?.mime || "").includes("pdf");
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-[820px]">
        <div className="m-0 md:m-4 rounded-t-2xl md:rounded-2xl overflow-hidden border bg-white shadow-xl">
          <div className="flex items-center justify-between px-4 py-3" style={{ background: brand, color: "white" }}>
            <div className="text-sm font-semibold">{item.title || item.filename || `File #${item.id}`}</div>
            <button onClick={onClose} className="text-sm px-2 py-1 rounded-md" style={{ background: accent, color: brand }}>✕</button>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 min-h-[240px] rounded-xl border bg-gray-50 flex items-center justify-center overflow-hidden">
              {isImg && item.url && <img src={item.url} alt={item.title || item.filename} className="max-h-[420px] object-contain" />}
              {!isImg && isPdf && item.url && <iframe title="preview" src={item.url} className="w-full h-[380px]" />}
              {!item.url && <div className="text-xs text-gray-500">No preview available</div>}
            </div>
            <div className="space-y-2 text-sm">
              <MetaRow label="Type" value={item.mime || item.mimetype || "-"} />
              <MetaRow label="Size" value={formatBytes(item.size)} />
              <MetaRow label="Uploaded" value={formatDateTime(item.created_at || item.uploaded_at)} />
              <MetaRow label="URL" value={<a href={item.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">{item.url || "-"}</a>} />
              <div className="pt-2">
                <div className="text-[12px] text-gray-500 mb-1">Notes</div>
                <div className="text-[13px] text-gray-800 whitespace-pre-wrap min-h-[40px]">
                  {item.notes || "-"}
                </div>
              </div>
              <div className="pt-3 flex items-center gap-2">
                {item.url && (
                  <a href={item.url} target="_blank" rel="noreferrer"
                     className="text-xs px-3 py-1.5 rounded-full border"
                     style={{ borderColor: brand, color: brand }}>
                    Open
                  </a>
                )}
                <button onClick={onClose} className="text-xs px-3 py-1.5 rounded-full border">Close</button>
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
      <div className="w-28 text-[12px] text-gray-500">{label}</div>
      <div className="flex-1 text-[13px] text-gray-800 break-all">{value}</div>
    </div>
  );
}

function confirmDelete(action) {
  const t = toast.loading("Deleting…");
  const ok = window.confirm("Delete this file?");
  if (!ok) { toast.dismiss(t); return; }
  action()
    .then(() => toast.update(t, { render: "Deleted", type: "success", isLoading: false, autoClose: 1200 }))
    .catch((err) => toast.update(t, { render: err?.message || "Delete failed", type: "error", isLoading: false, autoClose: 2500 }));
}

function Th({ children, className = "" }) {
  return <th className={`py-3 px-4 text-xs font-semibold tracking-wide ${className}`}>{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`py-3 px-4 align-top ${className}`}>{children}</td>;
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
