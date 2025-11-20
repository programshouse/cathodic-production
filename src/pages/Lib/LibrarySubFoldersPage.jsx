// /src/pages/Lib/LibrarySubFoldersPage.jsx
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import CardBox from "../../components/ui/CardBox";
import Btn from "../../components/ui/Btn";
import { useLibraryFoldersStore } from "../../stores/useLibraryFoldersStore";
import { useLibrarySubFoldersStore } from "../../stores/useLibrarySubFoldersStore";

export default function LibrarySubFoldersPage() {
  const { folderId } = useParams();
  const navigate = useNavigate();

  const { libraryFolders, getAll: getAllLibraryFolders } = useLibraryFoldersStore();
  const { librarySubFolders, getAll: getAllLibrarySubFolders } = useLibrarySubFoldersStore();

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

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <PageHeader
            title={folder?.name || `Folder #${folderId}`}
            description="Choose a subfolder to browse its files."
          />
          <Btn variant="neutral" size="xs" onClick={() => navigate("/library")}>
            ← Back to Folders
          </Btn>
        </div>

        <CardBox>
          <div className="space-y-3">
            {subFolders.map((sf) => (
              <div
                key={sf.id}
                className="rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {sf.name || `Sub Folder #${sf.id}`}
                  </div>
                  <div className="text-[11px] text-gray-500">ID: {sf.id}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Btn
                    size="xs"
                    onClick={() =>
                      navigate(`/library/folder/${folderId}/subfolder/${sf.id}`)
                    }
                  >
                    Show Files
                  </Btn>
                </div>
              </div>
            ))}

            {subFolders.length === 0 && (
              <div className="text-sm text-gray-500">
                No sub folders in this folder.
              </div>
            )}
          </div>
        </CardBox>
      </div>
    </div>
  );
}