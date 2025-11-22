// /src/pages/Lib/LibrarySubFoldersPage.jsx
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import CardBox from "../../components/ui/CardBox";
import Btn from "../../components/ui/Btn";
import { useLibraryFoldersStore } from "../../stores/useLibraryFoldersStore";
import { useLibrarySubFoldersStore } from "../../stores/useLibrarySubFoldersStore";
import { useAuthStore } from "../../stores/useAuthStore";

export default function LibrarySubFoldersPage() {
  const { folderId } = useParams();
  const navigate = useNavigate();

  const { libraryFolders, getAll: getAllLibraryFolders } =
    useLibraryFoldersStore();
  const {
    librarySubFolders,
    getAll: getAllLibrarySubFolders,
    delete: deleteLibrarySubFolder,
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
    <div className="min-h-screen bg-gray-50 px-4 py-4">
      <div className="max-w-7xl mx-auto space-y-4">
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subFolders.map((sf) => (
              <div
                key={sf.id}
                className="group rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-gray-900 group-hover:text-[#122A56]">
                      {sf.name || `Sub Folder #${sf.id}`}
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex items-center gap-2">
                  <Btn
                    size="xs"
                    onClick={() =>
                      navigate(
                        `/library/folder/${folderId}/subfolder/${sf.id}`
                      )
                    }
                  >
                    Show Files
                  </Btn>
                  {canManage && (
                    <Btn
                      variant="danger"
                      size="xs"
                      className="ml-auto"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Delete this subfolder and its files?"
                          )
                        ) {
                          deleteLibrarySubFolder(sf.id).catch(() => {});
                        }
                      }}
                    >
                      Delete
                    </Btn>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardBox>
      </div>
    </div>
  );
}
