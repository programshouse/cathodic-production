// /src/pages/Lib/LibraryFilesPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import CardBox from "../../components/ui/CardBox";
import Btn from "../../components/ui/Btn";
import { useLibStore } from "../../stores/useLibStore";
import { useLibraryFoldersStore } from "../../stores/useLibraryFoldersStore";
import { useLibrarySubFoldersStore } from "../../stores/useLibrarySubFoldersStore";
import { useAuthStore } from "../../stores/useAuthStore";

// file icons
import {
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileImage,
  FaFileAlt,
} from "react-icons/fa";

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

function getFileExtension(file) {
  const name =
    file.filename || file.title || file.original_name || file.file_path || "";
  const parts = String(name).split(".");
  if (parts.length < 2) return "";
  return parts[parts.length - 1].toLowerCase();
}

function isHttpUrl(str) {
  return /^https?:\/\//i.test(str || "");
}

function getIconByExt(ext) {
  if (["pdf"].includes(ext)) return { Icon: FaFilePdf, color: "text-red-500" };
  if (["doc", "docx"].includes(ext))
    return { Icon: FaFileWord, color: "text-blue-500" };
  if (["xls", "xlsx", "csv"].includes(ext))
    return { Icon: FaFileExcel, color: "text-emerald-500" };
  if (["ppt", "pptx"].includes(ext))
    return { Icon: FaFilePowerpoint, color: "text-orange-500" };
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext))
    return { Icon: FaFileImage, color: "text-violet-500" };
  return { Icon: FaFileAlt, color: "text-slate-500" };
}

function FileTile({ file, canManage, onOpen, onDetails, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const ext = getFileExtension(file);
  const createdAt = file.created_at
    ? new Date(file.created_at).toLocaleString()
    : null;

  const pathText = file.file_path || file.path || "";
  const openUrl = isHttpUrl(pathText)
    ? pathText
    : file.url && isHttpUrl(file.url)
    ? file.url
    : null;

  const title = file.title || file.filename || "Untitled";

  const { Icon, color } = getIconByExt(ext);

  const handleOpen = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onOpen(openUrl);
  };

  const handleDetails = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onDetails();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete();
  };

  return (
    <div className="relative flex flex-col items-center gap-1 text-center">
      {/* Card */}
      <div
        className="relative flex h-28 w-28 flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
        onClick={() => onOpen(openUrl)}
      >
        {/* 3-dots */}
        <div className="absolute right-1 top-1 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="File actions"
          >
            <KebabIcon />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-1 w-36 rounded-md border border-gray-200 bg-white py-1 text-xs text-gray-700 shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              {openUrl && (
                <button
                  type="button"
                  onClick={handleOpen}
                  className="flex w-full items-center px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Open
                </button>
              )}
              <button
                type="button"
                onClick={handleDetails}
                className="flex w-full items-center px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Details
              </button>
              {canManage && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    if (!onEdit) return;
                    onEdit();
                  }}
                  className="flex w-full items-center px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Edit
                </button>
              )}
              {canManage && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex w-full items-center px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/40"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>

        {/* Icon */}
        <Icon className={`h-8 w-8 ${color}`} />
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
          {ext || "file"}
        </span>
      </div>

      {/* Name + date */}
      <div className="flex flex-col items-center gap-0.5">
        <span className="max-w-[7rem] truncate text-xs font-medium text-gray-800 dark:text-gray-100">
          {title}
        </span>
        <span className="max-w-[7rem] truncate text-[10px] text-gray-400">
          {createdAt || "-"}
        </span>
      </div>
    </div>
  );
}

export default function LibraryFilesPage() {
  const { folderId, subFolderId } = useParams();
  const navigate = useNavigate();

  const { library, fetchlibrary, loading, error, deletelibrary, showlibrary, updatelibrary } =
    useLibStore();
  const { libraryFolders, getAll: getAllLibraryFolders } =
    useLibraryFoldersStore();
  const { librarySubFolders, getAll: getAllLibrarySubFolders } =
    useLibrarySubFoldersStore();
  const { admin, isInitialized } = useAuthStore();
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    getAllLibraryFolders().catch(() => {});
    getAllLibrarySubFolders().catch(() => {});
    fetchlibrary({ folderId, subFolderId }).catch(() => {});
  }, [
    folderId,
    subFolderId,
    fetchlibrary,
    getAllLibraryFolders,
    getAllLibrarySubFolders,
  ]);

  const folder = (libraryFolders || []).find(
    (f) => String(f.id) === String(folderId)
  );
  const subFolder = (librarySubFolders || []).find(
    (sf) => String(sf.id) === String(subFolderId)
  );

  const files = useMemo(() => library || [], [library]);

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

  const openFile = (openUrl) => {
    if (openUrl) {
      window.open(openUrl, "_blank", "noopener,noreferrer");
    }
  };

  const showDetails = async (id) => {
    try {
      const item = await showlibrary(id);
      setPreview(item);
    } catch (e) {
      window.alert(e?.message || "Failed to load file details");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4">
      <div className="mx-auto max-w-7xl space-y-4 px-2 sm:px-4 lg:px-6">
        {/* Header + back buttons */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <PageHeader
              title={subFolder?.name || `Sub Folder #${subFolderId}`}
              description={
                folder
                  ? `Files in ${folder.name || `Folder #${folderId}`}`
                  : "Files in selected sub folder."
              }
            />
          </div>
          <div className="flex gap-2 self-end">
            <Btn
              variant="neutral"
              size="xs"
              onClick={() => navigate(`/library/folder/${folderId}`)}
            >
              ← Back to Sub Folders
            </Btn>
            <Btn
              variant="neutral"
              size="xs"
              onClick={() => navigate("/library")}
            >
              Back to Folders
            </Btn>
          </div>
        </div>

        <CardBox>
          {error && (
            <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          {(!files || files.length === 0) && !loading && (
            <div className="py-6 text-center text-sm text-gray-500">
              No files in this sub folder.
            </div>
          )}

          {loading && (
            <div className="mb-3 text-xs text-gray-500">Loading files…</div>
          )}

          {/* Files grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {files.map((f) => (
              <FileTile
                key={f.id}
                file={f}
                canManage={canManage}
                onOpen={(url) => openFile(url)}
                onDetails={() => showDetails(f.id)}
                onEdit={() => {
                  const nextTitle = window.prompt(
                    "Edit title:",
                    f.title || f.filename || ""
                  );
                  if (!nextTitle || !nextTitle.trim()) return;
                  updatelibrary(f.id, { title: nextTitle.trim() }).catch(
                    () => {}
                  );
                }}
                onDelete={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this file?"
                    )
                  ) {
                    deletelibrary(f.id).catch(() => {});
                  }
                }}
              />
            ))}
          </div>
        </CardBox>

        {/* Preview / details modal */}
        {preview && (
          <div className="fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setPreview(null)}
            />
            <div className="absolute inset-x-0 bottom-0 w-full md:inset-auto md:left-1/2 md:top-1/2 md:w-[640px] md:-translate-x-1/2 md:-translate-y-1/2">
              <div className="m-0 overflow-hidden border bg-white shadow-xl md:m-4 md:rounded-2xl">
                <div className="flex items-center justify-between bg-gray-900 px-4 py-3 text-white">
                  <div className="text-sm font-semibold">
                    {preview.title || preview.filename || `File #${preview.id}`}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreview(null)}
                    className="rounded bg-white px-2 py-1 text-sm text-gray-900"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-2 p-4 text-sm">
                  <div className="flex gap-2">
                    <div className="w-28 text-[12px] text-gray-500">Title</div>
                    <div className="flex-1 break-all text-[13px] text-gray-800">
                      {preview.title ||
                        preview.filename ||
                        `File #${preview.id}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-28 text-[12px] text-gray-500">
                      Uploaded
                    </div>
                    <div className="flex-1 break-all text-[13px] text-gray-800">
                      {preview.created_at
                        ? new Date(preview.created_at).toLocaleString()
                        : "-"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-28 text-[12px] text-gray-500">URL</div>
                    <div className="flex-1 break-all text-[13px] text-blue-600">
                      {preview.url ? (
                        <a
                          href={preview.url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline"
                        >
                          {preview.url}
                        </a>
                      ) : (
                        "-"
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-28 text-[12px] text-gray-500">
                      File Path
                    </div>
                    <div className="flex-1 break-all text-[13px]">
                      {(() => {
                        const filePathText =
                          preview.file_path || preview.path || "";
                        const hasFilePathUrl = isHttpUrl(filePathText);
                        if (!filePathText) return "-";
                        if (hasFilePathUrl) {
                          return (
                            <a
                              href={filePathText}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {filePathText}
                            </a>
                          );
                        }
                        return (
                          <span className="text-gray-800">
                            {filePathText}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  {preview.description && (
                    <div className="pt-2">
                      <div className="mb-1 text-[12px] text-gray-500">
                        Description
                      </div>
                      <div className="whitespace-pre-wrap text-[13px] text-gray-800">
                        {preview.description}
                      </div>
                    </div>
                  )}
                  <div className="pt-2">
                    <div className="mb-1 text-[12px] text-gray-500">
                      Notes
                    </div>
                    <div className="whitespace-pre-wrap text-[13px] text-gray-800">
                      {preview.notes || "-"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-3">
                    {preview.url && (
                      <Btn
                        href={preview.url}
                        target="_blank"
                        rel="noreferrer"
                        size="xs"
                      >
                        Open
                      </Btn>
                    )}
                    <button
                      type="button"
                      onClick={() => setPreview(null)}
                      className="rounded-full border border-gray-300 px-3 py-1.5 text-xs"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
