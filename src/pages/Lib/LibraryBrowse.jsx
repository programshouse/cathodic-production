import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import CardBox from "../../components/ui/CardBox";
import { useLibStore } from "../../stores/useLibStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { useLibraryFoldersStore } from "../../stores/useLibraryFoldersStore";
import { useLibrarySubFoldersStore } from "../../stores/useLibrarySubFoldersStore";
import Btn from "../../components/ui/Btn";
import { BsFolder2, BsFolder2Open } from "react-icons/bs";

// small 3-dots icon
const KebabIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    className="text-gray-500"
    aria-hidden="true"
  >
    <path
      fill="currentColor"
      d="M12 7a2 2 0 1 0 0-4a2 2 0 0 0 0 4Zm0 7a2 2 0 1 0 0-4a2 2 0 0 0 0 4Zm0 7a2 2 0 1 0 0-4a2 2 0 0 0 0 4Z"
    />
  </svg>
);

function FolderTile({
  folder,
  subCount,
  fileCount,
  canManage,
  onOpen,
  onRename,
  onDelete,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const hasContent = subCount > 0 || fileCount > 0;
  const Icon = hasContent ? BsFolder2Open : BsFolder2;

  const handleOpen = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onOpen();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete();
  };

  return (
    <div
      className="relative flex flex-col items-center gap-1 text-center"
      onClick={onOpen}
    >
      {/* 3-dots menu trigger */}
      <div className="absolute right-0 top-0 z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
          className="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Folder actions"
        >
          <KebabIcon />
        </button>

        {menuOpen && (
          <div
            className="absolute right-0 mt-1 w-32 rounded-md border border-gray-200 bg-white py-1 text-xs text-gray-700 shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleOpen}
              className="flex w-full items-center px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Open
            </button>
            {canManage && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    if (!onRename) return;
                    onRename();
                  }}
                  className="flex w-full items-center px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Rename
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex w-full items-center px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/40"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        className="group flex h-28 w-24 flex-col items-center justify-center rounded-2xl bg-gray-100 text-yellow-500 shadow-sm transition hover:scale-[1.03] hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-yellow-400 dark:hover:bg-gray-700"
      >
        <Icon className="h-10 w-10" />
      </button>

      <div className="flex flex-col items-center gap-0.5">
        <span className="max-w-[7rem] truncate text-xs font-medium text-gray-800 dark:text-gray-100">
          {folder.name || `Folder #${folder.id}`}
        </span>
        <span className="max-w-[7rem] truncate text-[10px] text-gray-400 dark:text-gray-500">
          {hasContent
            ? [
                subCount ? `${subCount} subfolder(s)` : null,
                fileCount ? `${fileCount} file(s)` : null,
              ]
                .filter(Boolean)
                .join(" • ")
            : "Empty"}
        </span>
      </div>
    </div>
  );
}

export default function LibraryBrowse() {
  const { library, loading, error, fetchlibrary } = useLibStore();
  const { admin, isInitialized } = useAuthStore();
  const {
    libraryFolders,
    getAll: getAllLibraryFolders,
    delete: deleteLibraryFolder,
    update: updateLibraryFolder,
  } = useLibraryFoldersStore();
  const {
    librarySubFolders,
    getAll: getAllLibrarySubFolders,
  } = useLibrarySubFoldersStore();

  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchlibrary().catch(() => {});
    getAllLibraryFolders().catch(() => {});
    getAllLibrarySubFolders().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canManage =
    isInitialized &&
    (admin?.is_admin === true ||
      admin?.role?.toLowerCase?.() === "admin" ||
      (Array.isArray(admin?.roles) &&
        admin.roles
          .map(String)
          .map((r) => r.toLowerCase())
          .includes("admin")) ||
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
      <div className="mx-auto max-w-8xl px-2 py-6 sm:px-4 lg:px-8">
        {/* Header + admin create button */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex-1" />
          {canManage && (
            <div className="flex items-center gap-2">
              <Btn
                size="sm"
                className="inline-flex items-center justify-center rounded-full border border-[#122A56] bg-white px-4 py-1.5 text-sm text-[#122A56] transition hover:bg-gray-50"
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
          <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-6">
            <div className="md:col-span-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search folder name / id…"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="flex justify-end gap-2 md:col-span-2">
              <button
                onClick={() => {
                  fetchlibrary().catch(() => {});
                  getAllLibraryFolders().catch(() => {});
                  getAllLibrarySubFolders().catch(() => {});
                }}
                className="rounded-md border bg-white px-3 py-2 text-xs hover:bg-gray-50"
                disabled={loading}
              >
                {loading ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </div>
        </CardBox>

        {/* Folder icon grid */}
        <CardBox>
          {error && (
            <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          {(!filteredFolders || filteredFolders.length === 0) && !loading && (
            <div className="text-sm text-gray-500">No folders found.</div>
          )}

          {loading && (
            <div className="mb-3 text-xs text-gray-500">Loading folders…</div>
          )}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {filteredFolders.map((folder) => {
              const subCount = (librarySubFolders || []).filter(
                (sf) => String(sf.folder_id) === String(folder.id)
              ).length;

              const fileCount =
                folder.files_count ?? folder.files?.length ?? 0;

              return (
                <FolderTile
                  key={folder.id}
                  folder={folder}
                  subCount={subCount}
                  fileCount={fileCount}
                  canManage={canManage}
                  onOpen={() => navigate(`/library/folder/${folder.id}`)}
                  onRename={() => {
                    const next = window.prompt(
                      "Rename folder:",
                      folder.name || `Folder #${folder.id}`
                    );
                    if (!next || !next.trim()) return;
                    updateLibraryFolder(folder.id, next.trim()).catch(() => {});
                  }}
                  onDelete={() => {
                    if (
                      window.confirm(
                        "Delete this folder and its subfolders/files?"
                      )
                    ) {
                      deleteLibraryFolder(folder.id).catch(() => {});
                    }
                  }}
                />
              );
            })}
          </div>
        </CardBox>
      </div>
    </div>
  );
}
