import React, { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import CardBox from "../../components/ui/CardBox";
import Btn from "../../components/ui/Btn";
import { useLibraryFoldersStore } from "../../stores/useLibraryFoldersStore";
import { useNavigate } from "react-router-dom";

export default function LibraryCreateFolder() {
  const { libraryFolders, getAll: getAllLibraryFolders, create: createLibraryFolder } =
    useLibraryFoldersStore();
  const [newFolderName, setNewFolderName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getAllLibraryFolders().catch(() => {});
  }, [getAllLibraryFolders]);

  const handleCreate = async () => {
    if (!newFolderName.trim()) return;
    const folder = await createLibraryFolder(newFolderName.trim());
    if (folder?.id) {
      navigate(`/admin/library/create/folder/${folder.id}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Create Folder"
        description="Step 1 of 3 – choose an existing folder or create a new one."
      />

      <CardBox>
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Existing folders</h2>
            <div className="space-y-2">
              {(libraryFolders || []).map((folder) => (
                <div
                  key={folder.id}
                  className="flex items-center justify-between rounded-xl border px-3 py-2 bg-white"
                >
                  <div className="text-sm text-gray-800">{folder.name || `Folder #${folder.id}`}</div>
                  <Btn
                    size="xs"
                    onClick={() => navigate(`/admin/library/create/folder/${folder.id}`)}
                  >
                    Choose
                  </Btn>
                </div>
              ))}
              {(!libraryFolders || libraryFolders.length === 0) && (
                <div className="text-sm text-gray-500">No folders yet.</div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t mt-2">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Create new folder</h2>
            <div className="flex flex-col md:flex-row gap-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="New folder name"
                className="flex-1 border rounded-xl p-2 text-sm"
              />
              <Btn onClick={handleCreate} size="sm">
                Save & Continue
              </Btn>
            </div>
          </div>
        </div>
      </CardBox>
    </div>
  );
}
