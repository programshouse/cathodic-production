// /src/pages/Lib/LibraryManage.jsx
import React, { useEffect, useMemo, useState } from "react";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import CardBox from "../../components/ui/CardBox";
import { useLibStore } from "../../stores/useLibStore";
import CPLogo from "../../../public/images/logo/logoos.jpg";
import { toast } from "react-toastify";
import Btn from "../../components/ui/Btn";
import { useNavigate } from "react-router-dom";

/* ===== Brand ===== */
const CP_BLUE = "#122A56";
const CP_GOLD = "#F4B73A";

export default function LibraryManage() {
  const {
    library,
    loading,
    error,
    fetchlibrary,
    deletelibrary,
    showlibrary,
  } = useLibStore();
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

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

  const latest12 = useMemo(() => (filtered || []).slice(0, 12), [filtered]);

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


      {/* Filters */}
      <CardBox className="mb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
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
           
            <Btn size="sm" onClick={() => fetchlibrary().catch(()=>{})} disabled={loading}>{loading ? "Refreshing…" : "Refresh"}</Btn>
            <Btn variant="primary" size="sm" onClick={() => navigate("/admin/library/create")}>+ Create</Btn>
          </div>
        </div>
      </CardBox>

      {/* Featured */}
      <CardBox className="mb-6">
        <SectionHead count={latest12.length} total={filtered.length} title="Latest files" />
        {/* <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {latest12.map((f) => (
            <FileCard
              key={f.id}
              f={f}
              brand={CP_BLUE}
              onOpen={() => f.url && window.open(f.url, "_blank", "noreferrer")}
              onDetails={() => handleDetails(f.id)}
              onDelete={() => confirmDelete(() => deletelibrary(f.id))}
            />
          ))}
          {latest12.length === 0 && <div className="text-sm text-gray-500">No files yet.</div>}
        </div> */}
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
                <Th className="hidden md:table-cell">Category</Th>
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
                <tr key={f.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2 pr-4">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{f.title || f.filename || "Untitled"}</div>
                    {f.category && (
                      <div className="text-[12px] text-gray-600 dark:text-gray-400">Category: {String(f.category)}</div>
                    )}
                    {f.description && (
                      <div className="text-[12px] text-gray-500 dark:text-gray-400 line-clamp-2">{f.description}</div>
                    )}
                    <div className="text-[12px] text-gray-500 dark:text-gray-400 break-all">{f.url || f.path || f.file_path || ""}</div>
                  </td>
                  <td className="py-2 pr-4 hidden md:table-cell">{f.category ? String(f.category) : "-"}</td>
                  <td className="py-2 pr-4 hidden md:table-cell">{formatDateTime(f.created_at || f.uploaded_at)}</td>
                  <Td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      {f.url && (
                        <Btn href={f.url} target="_blank" rel="noreferrer" size="xs">Open</Btn>
                      )}
                      <Btn onClick={() => handleDetails(f.id)} size="xs">Show</Btn>
                      <Btn
                        variant="danger"
                        size="xs"
                        onClick={() => confirmDelete(() => deletelibrary(f.id))}
                      >
                        Delete
                      </Btn>
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
          {f.category && (
            <div className="text-[11px] text-gray-600 mt-0.5">Category: {String(f.category)}</div>
          )}
          {f.description && (
            <div className="text-[12px] text-gray-500 line-clamp-2 mt-0.5">{f.description}</div>
          )}
        </div>
        <div className="text-[11px] text-gray-500 whitespace-nowrap">{formatBytes(f.size)}</div>
      </div>
      <div className="text-[12px] text-gray-500 break-all line-clamp-2 min-h-[30px]">
        {f.url || f.path || f.file_path || ""}
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
            <button onClick={onClose} className="text-sm px-2 py-1 rounded-full" style={{ background: accent, color: brand }}>✕</button>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 min-h-[240px] rounded-xl border bg-gray-50 flex items-center justify-center overflow-hidden">

              {!isImg && isPdf && item.url && <iframe title="preview" src={item.url} className="w-full h-[380px]" />}
              {!item.url && <div className="text-xs text-gray-500">No preview available</div>}
            </div>
            <div className="space-y-2 text-sm">
              <MetaRow label="Title" value={item.title || item.filename || `File #${item.id}`} />
              <MetaRow label="Type" value={item.mime || item.mimetype || "-"} />
              <MetaRow label="Size" value={formatBytes(item.size)} />
              <MetaRow label="Uploaded" value={formatDateTime(item.created_at || item.uploaded_at)} />
              <MetaRow label="URL" value={<a href={item.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">{item.url || "-"}</a>} />
              <MetaRow label="File Path" value={<span className="break-all">{item.file_path || item.path || "-"}</span>} />
              <MetaRow label="Category" value={item.category ? String(item.category) : "-"} />
              <div className="pt-2">
                <div className="text-[12px] text-gray-500 mb-1">Notes</div>
                <div className="text-[13px] text-gray-800 whitespace-pre-wrap min-h-[40px]">
                  {item.notes || "-"}
                </div>
              </div>
              {item.description && (
                <div className="pt-2">
                  <div className="text-[12px] text-gray-500 mb-1">Description</div>
                  <div className="text-[13px] text-gray-800 whitespace-pre-wrap min-h-[40px]">
                    {item.description}
                  </div>
                </div>
              )}
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
