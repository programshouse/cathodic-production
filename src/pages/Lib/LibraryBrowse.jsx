// /src/pages/Lib/LibraryBrowse.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import CardBox from "../../components/ui/CardBox";
import { useLibStore } from "../../stores/useLibStore";
import { useAuthStore } from "../../stores/useAuthStore";
import CPLogo from "../../../public/images/logo/logoos.jpg";
import Btn from "../../components/ui/Btn";


/* ===== Brand ===== */
const CP_BLUE = "#122A56";

export default function LibraryBrowse() {
  const { library, loading, error, fetchlibrary, showlibrary, deletelibrary } = useLibStore();
  const { admin, isInitialized } = useAuthStore();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchlibrary().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // admin?
  const canManage =
    isInitialized &&
    (admin?.is_admin === true ||
      admin?.role?.toLowerCase?.() === "admin" ||
      (Array.isArray(admin?.roles) &&
        admin.roles.map(String).map((r) => r.toLowerCase()).includes("admin")) ||
      (Array.isArray(admin?.permissions) &&
        admin.permissions
          .map(String)
          .map((p) => p.toLowerCase())
          .some((p) => p === "admin" || p === "manage_library")));

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
  }, [library, query, typeFilter]);

  const latest12 = useMemo(() => (filtered || []).slice(0, 12), [filtered]);

  const openDetails = async (id) => {
    try {
      const item = await showlibrary(id);
      setPreview(item);
    } catch {}
  };

  return (
    <PageLayout title="Library (Browse) | CP">
      {/* Header + admin CTAs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <img
            src={CPLogo}
            alt="CP"
            className="h-16 w-16 md:h-20 md:w-20 rounded-xl object-contain ring-2"
            style={{ boxShadow: "0 8px 24px rgba(2,6,23,.06)", borderColor: "#e5e7eb" }}
          />
          <div>
            <div className="text-3xl md:text-4xl font-black leading-tight" style={{ color: CP_BLUE }}>
              CP <span className="font-extrabold">Design</span> <span className="font-black">Pro v</span> 1.0
            </div>
            <div className="text-sm text-gray-600">Library — Users &amp; Admin</div>
          </div>
        </div>

{canManage && (
  <div className="flex items-center gap-2">
    <Btn variant="primary" size="sm" onClick={() => navigate("/admin/library/create")} data-testid="lib-create-btn">+ Create</Btn>
    <Btn variant="outline" size="sm" onClick={() => navigate("/admin/library")}>Manage Library</Btn>
  </div>
)}

      </div>

      <PageHeader
        title="Reference Library"
        description="Find and preview Cathodic Protection references. Use filters/search to narrow results."
      />

      {/* Filters */}
      <CardBox className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search in title/type/notes/url…"
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-xl border bg-white"
            >
              <option value="all">All types</option>
              <option value="image/">Images</option>
              <option value="pdf">PDF</option>
              <option value="word">Word</option>
              <option value="excel">Excel</option>
              <option value="text">Text</option>
            </select>
            <button
              onClick={() => fetchlibrary().catch(() => {})}
              className="text-xs px-3 py-2 rounded-none border bg-white hover:bg-gray-50"
              disabled={loading}
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>
      </CardBox>

      {/* Featured */}
      <CardBox className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold">Latest files</div>
          <div className="text-[12px] text-gray-500">Showing {latest12.length} of {filtered.length}</div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {latest12.map((f) => (
            <div key={f.id} className="group rounded-2xl border bg-white border-gray-200 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900 line-clamp-2">{f.title || f.filename || "Untitled"}</div>
                  <div className="text-[12px] text-gray-500 mt-0.5">{f.mime || f.mimetype || "-"}</div>
                  {f.category && (
                    <div className="text-[11px] text-gray-600 mt-0.5">Category: {String(f.category)}</div>
                  )}
                  {f.description && (
                    <div className="text-[12px] text-gray-500 line-clamp-2 mt-0.5">{f.description}</div>
                  )}
                </div>
                <div className="text-[11px] text-gray-500 whitespace-nowrap">{formatBytes(f.size)}</div>
              </div>
              <div className="text-[12px] text-gray-500 break-all line-clamp-2 min-h-[30px]">{f.url || f.path || f.file_path || ""}</div>
              <div className="flex items-center gap-2 mt-auto">
                {f.url && (<Btn href={f.url} target="_blank" rel="noreferrer" size="xs">Open</Btn>)}
                <Btn onClick={() => openDetails(f.id)} size="xs">Details</Btn>
                {canManage && (
                  <Btn variant="danger" size="xs" onClick={() => { if (window.confirm("Delete this file?")) { deletelibrary(f.id).catch(() => {}); } }}>Delete</Btn>
                )}
              </div>
            </div>
          ))}
          {latest12.length === 0 && (<div className="text-sm text-gray-500">No files yet.</div>)}
        </div>
      </CardBox>

      {/* Table */}
      <CardBox>
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
              {error && (
                <tr>
                  <td colSpan={5} className="py-3 text-rose-600">
                    {error}
                  </td>
                </tr>
              )}
              {(!filtered || filtered.length === 0) && !loading && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">
                    No files match.
                  </td>
                </tr>
              )}
              {filtered.map((f, idx) => (
                <tr key={f.id} className={`border-b ${idx % 2 ? "bg-gray-50/60" : "bg-white"}`}>
                  <Td>
                    <div className="font-medium text-gray-900">{f.title || f.filename || "Untitled"}</div>
                    {f.category && (
                      <div className="text-[12px] text-gray-600">Category: {String(f.category)}</div>
                    )}
                    {f.description && (
                      <div className="text-[12px] text-gray-500 line-clamp-2">{f.description}</div>
                    )}
                    <div className="text-[12px] text-gray-500 break-all">{f.url || f.path || f.file_path || ""}</div>
                  </Td>
                  <Td className="hidden md:table-cell">{f.category ? String(f.category) : "-"}</Td>
                  <Td className="hidden md:table-cell">{formatDateTime(f.created_at || f.uploaded_at)}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      {f.url && (
                        <Btn href={f.url} target="_blank" rel="noreferrer" size="xs">Open</Btn>
                      )}
                      <Btn onClick={() => openDetails(f.id)} size="xs">Details</Btn>
                      {canManage && (
                        <Btn
                          variant="danger"
                          size="xs"
                          onClick={() => {
                            if (window.confirm("Delete this file?")) {
                              deletelibrary(f.id).catch(() => {});
                            }
                          }}
                        >
                          Delete
                        </Btn>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBox>

      {/* Preview modal */}
      <SimplePreview item={preview} onClose={() => setPreview(null)} brand={CP_BLUE} />
    </PageLayout>
  );
}

/* ---------- helpers ---------- */
function Th({ children, className = "" }) {
  return <th className={`py-4 px-4 text-xs font-semibold tracking-wide ${className}`}>{children}</th>;
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

function SimplePreview({ item, onClose, brand }) {
  if (!item) return null;
  const isImg = (item?.mime || "").startsWith("image/");
  const isPdf = (item?.mime || "").includes("pdf");
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-[840px]">
        <div className="m-0 md:m-4 rounded-t-2xl md:rounded-2xl overflow-hidden border bg-white shadow-xl">
          <div className="flex items-center justify-between px-4 py-3" style={{ background: brand, color: "white" }}>
            <div className="text-sm font-semibold">{item.title || item.filename || `File #${item.id}`}</div>
            <button onClick={onClose} className="text-sm px-2 py-1 rounded-none bg-white text-gray-900">✕</button>
          </div>
          <div className="p-4">
            <div className="min-h-[240px] rounded-xl border bg-gray-50 flex items-center justify-center overflow-hidden">
              {isImg && item.url && <img src={item.url} alt={item.title || item.filename} className="max-h-[420px] object-contain" />}
              {!isImg && isPdf && item.url && <iframe title="preview" src={item.url} className="w-full h-[420px]" />}
              {!item.url && <div className="text-xs text-gray-500">No preview available</div>}
            </div>
            {item.notes && (
              <div className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">
                <span className="font-semibold">Notes: </span>
                {item.notes}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
