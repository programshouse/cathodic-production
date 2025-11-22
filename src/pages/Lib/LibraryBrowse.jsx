// /src/pages/Lib/LibraryBrowse.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import CardBox from "../../components/ui/CardBox";
import { useLibStore } from "../../stores/useLibStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { useLibraryFoldersStore } from "../../stores/useLibraryFoldersStore";
import Btn from "../../components/ui/Btn";

const CP_BLUE = "#122A56";

export default function LibraryBrowse() {
  const { library, loading, error, fetchlibrary } = useLibStore();
  const { admin, isInitialized } = useAuthStore();
  const { libraryFolders, getAll: getAllLibraryFolders, delete: deleteLibraryFolder } = useLibraryFoldersStore();

  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchlibrary().catch(() => {});
    getAllLibraryFolders().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const filteredFolders = useMemo(() => {
    if (!query) return libraryFolders || [];
    const q = query.toLowerCase();
    return (libraryFolders || []).filter((f) =>
      [f.name, f.id]
        .filter(Boolean)
        .some((x) => String(x).toLowerCase().includes(q))
    );
  }, [libraryFolders, query]);

  return (
    <div className="min-h-screen bg-gray-50 px-4">
      <div className="mx-auto px-8 py-6 max-w-6xl">
        {/* Header + admin create button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1" />
          {canManage && (
            <div className="flex items-center gap-2">
              <Btn
                size="sm"
                className="rounded-full border transition inline-flex items-center justify-center text-sm px-4 py-1.5 border-[#122A56] text-[#122A56] bg-white hover:bg-gray-50"
                onClick={() => navigate("/admin/library/create")}
              >
                + Upload To Library
              </Btn>
            </div>
          )}
        </div>

        <PageHeader
          title="Reference Library"
          description="Choose a server folder, then a subfolder, then browse its files."
        />

        {/* Filters */}
        <CardBox className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
            <div className="md:col-span-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search folder name / id…"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-2 flex gap-2 justify-end">
              <button
                onClick={() => {
                  fetchlibrary().catch(() => {});
                  getAllLibraryFolders().catch(() => {});
                }}
                className="text-xs px-3 py-2 rounded-none border bg-white hover:bg-gray-50"
                disabled={loading}
              >
                {loading ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </div>
        </CardBox>

        {/* Folder list */}
        <CardBox>
          <div className="space-y-3">
            {filteredFolders.map((folder) => (
              <div
                key={folder.id}
                className="rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {folder.name || `Folder #${folder.id}`}
                  </div>
        
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/library/folder/${folder.id}`)}
                    className="text-xs px-3 py-1.5 rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    Show
                  </button>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Delete this folder and its subfolders/files?")) {
                          deleteLibraryFolder(folder.id).catch(() => {});
                        }
                      }}
                      className="text-xs px-3 py-1.5 rounded-full border border-rose-300 text-rose-700 hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}

            {(!filteredFolders || filteredFolders.length === 0) && !loading && (
              <div className="text-sm text-gray-500">No folders found.</div>
            )}
          </div>
        </CardBox>
      </div>
    </div>
  );
}

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

function formatDateTime(s) {
  if (!s) return "-";
  try {
    return new Date(s).toLocaleString();
  } catch {
    return s;
  }
}