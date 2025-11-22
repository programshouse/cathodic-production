import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import CardBox from "../../components/ui/CardBox";
import Btn from "../../components/ui/Btn";
import { useLibraryFoldersStore } from "../../stores/useLibraryFoldersStore";
import { useLibrarySubFoldersStore } from "../../stores/useLibrarySubFoldersStore";

export default function LibraryCreateSubFolder() {
  const { folderId } = useParams();
  const navigate = useNavigate();

  const { libraryFolders, getAll: getAllLibraryFolders } = useLibraryFoldersStore();
  const {
    librarySubFolders,
    getAll: getAllLibrarySubFolders,
    create: createLibrarySubFolder,
  } = useLibrarySubFoldersStore();

  const [newSubFolderName, setNewSubFolderName] = useState("");

  useEffect(() => {
    getAllLibraryFolders().catch(() => {});
    getAllLibrarySubFolders().catch(() => {});
  }, [getAllLibraryFolders, getAllLibrarySubFolders]);

  const folder = (libraryFolders || []).find((f) => String(f.id) === String(folderId));

  const handleCreate = async () => {
    if (!newSubFolderName.trim()) return;
    const sub = await createLibrarySubFolder(newSubFolderName.trim(), folderId);
    if (sub?.id) {
      navigate(`/admin/library/create/folder/${folderId}/subfolder/${sub.id}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={folder?.name || `Folder #${folderId}`}
        description="Step 2 of 3 – choose an existing subfolder or create a new one."
      />

      <CardBox>
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Existing subfolders</h2>
            <div className="space-y-2">
              {(librarySubFolders || [])
                .filter((sf) => String(sf.folder_id) === String(folderId))
                .map((sf) => (
                  <div
                    key={sf.id}
                    className="flex items-center justify-between rounded-xl border px-3 py-2 bg-white"
                  >
                    <div className="text-sm text-gray-800">
                      {sf.name || `Subfolder #${sf.id}`}
                    </div>
                    <Btn
                      size="xs"
                      onClick={() =>
                        navigate(
                          `/admin/library/create/folder/${folderId}/subfolder/${sf.id}`
                        )
                      }
                    >
                      Choose
                    </Btn>
                  </div>
                ))}

              {(!librarySubFolders ||
                !librarySubFolders.some(
                  (sf) => String(sf.folder_id) === String(folderId)
                )) && <div className="text-sm text-gray-500">No subfolders yet.</div>}
            </div>
          </div>

          <div className="pt-4 border-t mt-2">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Create new subfolder</h2>
            <div className="flex flex-col md:flex-row gap-2">
              <input
                type="text"
                value={newSubFolderName}
                onChange={(e) => setNewSubFolderName(e.target.value)}
                placeholder="New subfolder name"
                className="flex-1 border rounded-xl p-2 text-sm"
              />
              <Btn onClick={handleCreate} size="sm">
                Save & Continue
              </Btn>
            </div>
          </div>
        </div>
      </CardBox>

      <div className="flex justify-between gap-3 mt-6">
        <Btn variant="neutral" onClick={() => navigate("/admin/library/create")}>
          Back
        </Btn>
      </div>
    </div>
  );
}
