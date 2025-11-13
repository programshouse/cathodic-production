// /src/pages/Lib/LibraryBrowse.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

  // use showlibrary() from store when clicking Details
  const openDetails = async (id) => {
    try {
      const item = await showlibrary(id);
      setPreview(item);
    } catch (err) {
      console.error(err);
      window.alert(err.message || "Failed to fetch library item");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4">
      <div className=" mx-auto px-8 py-6">
        {/* Header + admin CTAs */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1" />
          {canManage && (
            <div className="flex items-center gap-2">
              <Btn
                size="sm"
                className="rounded-full border transition inline-flex items-center justify-center text-sm px-4 py-1.5 border-[#122A56] text-[#122A56] bg-white hover:bg-gray-50"
                onClick={() => navigate("/admin/library/create")}
                data-testid="lib-create-btn"
              >
                + Create New Lib
              </Btn>
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
                  <tr
                    key={f.id}
                    className={`border-b ${
                      idx % 2 ? "bg-gray-50/60" : "bg-white"
                    }`}
                  >
                    <Td>
                      <div className="font-medium text-gray-900">
                        {f.title || f.filename || "Untitled"}
                      </div>
                      {f.category && (
                        <div className="text-[12px] text-gray-600">
                          Category: {String(f.category)}
                        </div>
                      )}
                      {f.description && (
                        <div className="text-[12px] text-gray-500 line-clamp-2">
                          {f.description}
                        </div>
                      )}
                      <div className="text-[12px] text-gray-500 break-all">
                        {f.url || f.path || f.file_path || ""}
                      </div>
                    </Td>
                    <Td className="hidden md:table-cell">
                      {f.category ? String(f.category) : "-"}
                    </Td>
                    <Td className="hidden md:table-cell">
                      {formatDateTime(f.created_at || f.uploaded_at)}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        {f.url && (
                          <Btn href={f.url} target="_blank" rel="noreferrer" size="xs">
                            Open
                          </Btn>
                        )}
                        <Btn onClick={() => openDetails(f.id)} size="xs">
                          Details
                        </Btn>
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
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */
function Th({ children, className = "" }) {
  return (
    <th className={`py-4 px-4 text-xs font-semibold tracking-wide ${className}`}>
      {children}
    </th>
  );
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
  try {
    return new Date(s).toLocaleString();
  } catch {
    return s;
  }
}

function SimplePreview({ item, onClose, brand }) {
  if (!item) return null;
  const filePathText = item?.file_path || item?.path || "";
  const hasFilePathUrl = /^https?:\/\//i.test(filePathText || "");
  const encodedFilePath = hasFilePathUrl ? encodeURI(filePathText) : null;
  const rawUrl = item?.file_url || item?.url || null;
  const encodedUrl = rawUrl ? encodeURI(rawUrl) : null;
  const href = encodedFilePath || encodedUrl; // Prefer file_path if it's a full URL

  const Row = ({ label, children }) => (
    <div className="flex gap-2">
      <div className="w-28 text-[12px] text-gray-500">{label}</div>
      <div className="flex-1 text-[13px] text-gray-800 break-all">{children}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-[720px]">
        <div className="m-0 md:m-4 rounded-t-2xl md:rounded-2xl overflow-hidden border bg-white shadow-xl">
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: brand, color: "white" }}
          >
            <div className="text-sm font-semibold">
              {item.title || item.filename || `File #${item.id}`}
            </div>
            <button
              onClick={onClose}
              className="text-sm px-2 py-1 rounded-none bg-white text-gray-900"
            >
              ✕
            </button>
          </div>
          <div className="p-4 space-y-2 text-sm">
            <Row label="Title">{item.title || item.filename || `File #${item.id}`}</Row>
            <Row label="Uploaded">{formatDateTime(item.created_at || item.uploaded_at)}</Row>
            <Row label="Updated">{formatDateTime(item.updated_at)}</Row>
            <Row label="URL">
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {href}
                </a>
              ) : (
                "-"
              )}
            </Row>
            <Row label="File Path">
              {(() => {
                const text = filePathText || href || "-";
                const link = encodedFilePath || encodedUrl;
                return link ? (
                  <a
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-blue-600 hover:underline"
                  >
                    {text}
                  </a>
                ) : (
                  <span className="break-all">{text}</span>
                );
              })()}
            </Row>
            <Row label="Category">
              {item.category ? String(item.category) : "-"}
            </Row>
            {item.description && (
              <div className="pt-2">
                <div className="text-[12px] text-gray-500 mb-1">Description</div>
                <div className="text-[13px] text-gray-800 whitespace-pre-wrap min-h-[40px]">
                  {item.description}
                </div>
              </div>
            )}
            <div className="pt-2">
              <div className="text-[12px] text-gray-500 mb-1">Notes</div>
              <div className="text-[13px] text-gray-800 whitespace-pre-wrap min-h-[40px]">
                {item.notes || "-"}
              </div>
            </div>
            <div className="pt-3 flex items-center gap-2">
              {href && (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs px-3 py-1.5 rounded-full border"
                  style={{ borderColor: brand, color: brand }}
                >
                  Open
                </a>
              )}
              <button className="text-xs px-3 py-1.5 rounded-full border" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
