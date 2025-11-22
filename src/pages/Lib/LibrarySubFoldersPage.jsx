// /src/pages/Lib/LibrarySubFoldersPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import CardBox from "../../components/ui/CardBox";
import Btn from "../../components/ui/Btn";
import { useLibraryFoldersStore } from "../../stores/useLibraryFoldersStore";
import { useLibrarySubFoldersStore } from "../../stores/useLibrarySubFoldersStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { BsFolder2, BsFolder2Open } from "react-icons/bs";

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

function SubFolderTile({ subFolder, canManage, onOpen, onRename, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Do we actually have count data?
  const hasSubMeta =
    typeof subFolder.subfolders_count === "number" ||
    Array.isArray(subFolder.subfolders);
  const hasFileMeta =
    typeof subFolder.files_count === "number" ||
    Array.isArray(subFolder.files);

  const hasCountsMeta = hasSubMeta || hasFileMeta;

  const subCount = hasSubMeta
    ? subFolder.subfolders_count ?? subFolder.subfolders?.length ?? 0
    : 0;

  const fileCount = hasFileMeta
    ? subFolder.files_count ?? subFolder.files?.length ?? 0
    : 0;

  // If we don't have metadata, assume it has content (so it's not shown as "Empty")
  const hasContent = hasCountsMeta ? subCount + fileCount > 0 : true;
  const Icon = hasContent ? BsFolder2Open : BsFolder2;

  let infoLabel = "Subfolder";
  if (hasCountsMeta) {
    if (hasContent) {
      infoLabel = [
        subCount ? `${subCount} subfolder(s)` : null,
        fileCount ? `${fileCount} file(s)` : null,
      ]
        .filter(Boolean)
        .join(" • ");
    } else {
      infoLabel = "Empty";
    }
  }

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
      {/* 3-dots */}
      <div className="absolute right-0 top-0 z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
          className="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Subfolder actions"
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
          {subFolder.name || `Sub Folder #${subFolder.id}`}
        </span>
        <span className="max-w-[7rem] truncate text-[10px] text-gray-400 dark:text-gray-500">
          {infoLabel}
        </span>
      </div>
    </div>
  );
}

export default function LibrarySubFoldersPage() {
  const { folderId } = useParams();
  const navigate = useNavigate();

  const { libraryFolders, getAll: getAllLibraryFolders } =
    useLibraryFoldersStore();
  const {
    librarySubFolders,
    getAll: getAllLibrarySubFolders,
    delete: deleteLibrarySubFolder,
    update: updateLibrarySubFolder,
  } = useLibrarySubFoldersStore();
  const { admin, isInitialized } = useAuthStore();

  useEffect(() => {
    getAllLibraryFolders().catch(() => {});
    getAllLibrarySubFolders().catch(() => {});
  }, [getAllLibraryFolders, getAllLibrarySubFolders]);

  const folder = (libraryFolders || []).find(
    (f) => String(f.id) === String(folderId)
  );
  const subFolders = (librarySubFolders || []).filter(
    (sf) => String(sf.folder_id) === String(folderId)
  );

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

  return (
    <div className="min-h-screen bg-gray-50 px-8 py-4">
      <div className="mx-auto max-w-8xl space-y-4">
        <div className="flex items-center justify-between gap-2">
          <PageHeader
            title={folder?.name || `Folder #${folderId}`}
            description="Choose a subfolder to browse its files."
          />
          <Btn
            variant="neutral"
            size="xs"
            onClick={() => navigate("/library")}
          >
            ← Back to Folders
          </Btn>
        </div>

        <CardBox>
          {subFolders.length === 0 && (
            <div className="text-sm text-gray-500">
              No sub folders in this folder.
            </div>
          )}

          {subFolders.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
              {subFolders.map((sf) => (
                <SubFolderTile
                  key={sf.id}
                  subFolder={sf}
                  canManage={canManage}
                  onOpen={() =>
                    navigate(`/library/folder/${folderId}/subfolder/${sf.id}`)
                  }
                  onRename={() => {
                    const next = window.prompt(
                      "Rename subfolder:",
                      sf.name || `Subfolder #${sf.id}`
                    );
                    if (!next || !next.trim()) return;
                    updateLibrarySubFolder(sf.id, next.trim()).catch(() => {});
                  }}
                  onDelete={() => {
                    if (
                      window.confirm(
                        "Delete this subfolder and its files?"
                      )
                    ) {
                      deleteLibrarySubFolder(sf.id).catch(() => {});
                    }
                  }}
                />
              ))}
            </div>
          )}
        </CardBox>
      </div>
    </div>
  );
}
