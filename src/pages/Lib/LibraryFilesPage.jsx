import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import CardBox from "../../components/ui/CardBox";
import Btn from "../../components/ui/Btn";
import { useLibStore } from "../../stores/useLibStore";
import { useLibraryFoldersStore } from "../../stores/useLibraryFoldersStore";
import { useLibrarySubFoldersStore } from "../../stores/useLibrarySubFoldersStore";
import { useAuthStore } from "../../stores/useAuthStore";

export default function LibraryFilesPage() {
  const { folderId, subFolderId } = useParams();
  const navigate = useNavigate();

  const { library, fetchlibrary, loading, error, deletelibrary, showlibrary } = useLibStore();
  const { libraryFolders, getAll: getAllLibraryFolders } = useLibraryFoldersStore();
  const { librarySubFolders, getAll: getAllLibrarySubFolders } = useLibrarySubFoldersStore();
  const { admin, isInitialized } = useAuthStore();
  const [preview, setPreview] = useState(null);
  useEffect(() => {
    getAllLibraryFolders().catch(() => {});
    getAllLibrarySubFolders().catch(() => {});
    fetchlibrary({ folderId, subFolderId }).catch(() => {});
  }, [folderId, subFolderId, fetchlibrary, getAllLibraryFolders, getAllLibrarySubFolders]);

  const folder = (libraryFolders || []).find(
    (f) => String(f.id) === String(folderId)
  );
  const subFolder = (librarySubFolders || []).find(
    (sf) => String(sf.id) === String(subFolderId)
  );

  const files = library || [];

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

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <PageHeader
              title={subFolder?.name || `Sub Folder #${subFolderId}`}
              description={folder ? `Files in ${folder.name || `Folder #${folderId}`}` : "Files in selected sub folder."}
            />
          </div>
          <div className="flex gap-2">
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
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm rounded-xl overflow-hidden">
              <thead>
                <tr className="text-left bg-gray-900 text-white">
                  <th className="py-2 px-3">Title</th>
                  <th className="py-2 px-3 hidden md:table-cell">Category</th>
                  <th className="py-2 px-3 hidden md:table-cell">Uploaded</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {error && (
                  <tr>
                    <td colSpan={4} className="py-3 text-rose-600">
                      {error}
                    </td>
                  </tr>
                )}
                {(!files || files.length === 0) && !loading && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500">
                      No files in this sub folder.
                    </td>
                  </tr>
                )}
                {files.map((f, idx) => (
                  <tr key={f.id} className={`border-b ${idx % 2 ? "bg-gray-50/60" : "bg-white"}`}>
                    <td className="py-2 px-3">
                      <div className="font-medium text-gray-900">
                        {f.title || f.filename || "Untitled"}
                      </div>
                      <div className="text-[11px] text-gray-500 break-all">
                        {f.url || f.path || f.file_path || ""}
                      </div>
                    </td>
                    <td className="py-2 px-3 hidden md:table-cell">
                      {f.category ? String(f.category) : "-"}
                    </td>
                    <td className="py-2 px-3 hidden md:table-cell">
                      {f.created_at ? new Date(f.created_at).toLocaleString() : "-"}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        {f.url && (
                          <Btn
                            href={f.url}
                            target="_blank"
                            rel="noreferrer"
                            size="xs"
                          >
                            Open
                          </Btn>
                        )}
                        <Btn
                          size="xs"
                          onClick={async () => {
                            try {
                              const item = await showlibrary(f.id);
                              setPreview(item);
                            } catch (e) {
                              // eslint-disable-next-line no-alert
                              window.alert(e?.message || "Failed to load file details");
                            }
                          }}
                        >
                          Show
                        </Btn>
                        {canManage && (
                          <Btn
                            variant="danger"
                            size="xs"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this file?")) {
                                deletelibrary(f.id).catch(() => {});
                              }
                            }}
                          >
                            Delete
                          </Btn>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBox>
        {preview && (
          <div className="fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/40" onClick={() => setPreview(null)} />
            <div className="absolute inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-[640px]">
              <div className="m-0 md:m-4 rounded-t-2xl md:rounded-2xl overflow-hidden border bg-white shadow-xl">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white">
                  <div className="text-sm font-semibold">
                    {preview.title || preview.filename || `File #${preview.id}`}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreview(null)}
                    className="text-sm px-2 py-1 bg-white text-gray-900"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex gap-2">
                    <div className="w-28 text-[12px] text-gray-500">Title</div>
                    <div className="flex-1 text-[13px] text-gray-800 break-all">
                      {preview.title || preview.filename || `File #${preview.id}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-28 text-[12px] text-gray-500">Uploaded</div>
                    <div className="flex-1 text-[13px] text-gray-800 break-all">
                      {preview.created_at ? new Date(preview.created_at).toLocaleString() : "-"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-28 text-[12px] text-gray-500">URL</div>
                    <div className="flex-1 text-[13px] text-blue-600 break-all">
                      {preview.url ? (
                        <a href={preview.url} target="_blank" rel="noreferrer" className="hover:underline">
                          {preview.url}
                        </a>
                      ) : (
                        "-"
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-28 text-[12px] text-gray-500">File Path</div>
                    <div className="flex-1 text-[13px] text-gray-800 break-all">
                      {preview.file_path || preview.path || "-"}
                    </div>
                  </div>
                  {preview.description && (
                    <div className="pt-2">
                      <div className="text-[12px] text-gray-500 mb-1">Description</div>
                      <div className="text-[13px] text-gray-800 whitespace-pre-wrap">
                        {preview.description}
                      </div>
                    </div>
                  )}
                  <div className="pt-2">
                    <div className="text-[12px] text-gray-500 mb-1">Notes</div>
                    <div className="text-[13px] text-gray-800 whitespace-pre-wrap">
                      {preview.notes || "-"}
                    </div>
                  </div>
                  <div className="pt-3 flex items-center gap-2">
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
                      className="text-xs px-3 py-1.5 rounded-full border border-gray-300"
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
