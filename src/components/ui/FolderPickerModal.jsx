// /src/components/modals/FolderPickerModal.jsx
import React from "react";
import { toast } from "react-toastify";
import { useFoldersStore } from "../../stores/useFoldersStore";

export default function FolderPickerModal({
  open,
  onClose,
  onPicked,          // (folderId, folderName) => void
  defaultName = "New Project",
}) {
  const {
    folders,
    loading,
    error,
    getAll,
    create,
  } = useFoldersStore();

  const [selectedId, setSelectedId] = React.useState(null);
  const [newName, setNewName] = React.useState("");

  React.useEffect(() => {
    if (open) {
      // refresh folders when opening
      getAll().catch(() => {});
      setSelectedId(null);
      setNewName("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleCreate = async () => {
    const name = (newName || defaultName).trim();
    if (!name) {
      toast.error("Folder name is required");
      return;
    }
    const t = toast.loading("Creating folder…");
    try {
      const created = await create(name);
      if (created?.id) {
        toast.update(t, { render: "Folder created", type: "success", isLoading: false, autoClose: 1500 });
        setSelectedId(created.id);
        setNewName("");
        // also refresh list to show the new one in the grid
        await getAll();
      } else {
        throw new Error("No ID returned.");
      }
    } catch (e) {
      toast.update(t, { render: "Failed to create folder", type: "error", isLoading: false, autoClose: 2500 });
    }
  };

  const handleConfirm = () => {
    if (!selectedId) {
      toast.error("Please select a folder or create a new one.");
      return;
    }
    const chosen = folders?.find((f) => String(f.id) === String(selectedId));
    onPicked?.(Number(selectedId), chosen?.name || `Folder ${selectedId}`);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* modal */}
      <div className="relative w-full max-w-2xl mx-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Choose a server folder
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Pick an existing folder or create a new one to save this calculation.
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* New folder input */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-3">
            <div className="text-xs font-medium text-gray-800 dark:text-gray-200 mb-2">
              Create new folder
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2"
                placeholder={defaultName}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <button
                type="button"
                onClick={handleCreate}
                className="text-xs px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Create
              </button>
            </div>
          </div>

          {/* Existing folders list */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
                Existing folders
              </div>
              <button
                type="button"
                onClick={() => getAll()}
                className="text-[11px] px-2 py-1 rounded border bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-xs text-gray-500 dark:text-gray-400">Loading…</div>
            ) : error ? (
              <div className="text-xs text-red-600">{String(error)}</div>
            ) : !folders || folders.length === 0 ? (
              <div className="text-xs text-gray-500 dark:text-gray-400">No folders yet.</div>
            ) : (
              <div className="max-h-56 overflow-auto space-y-1 pr-1">
                {folders.map((f) => (
                  <label
                    key={String(f.id)}
                    className="flex items-center gap-2 text-sm p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="folderPick"
                      value={String(f.id)}
                      checked={String(selectedId) === String(f.id)}
                      onChange={() => setSelectedId(f.id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{f.name || "Untitled Folder"}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">ID: {f.id}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-3 py-1.5 rounded-full border bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="text-xs px-3 py-1.5 rounded-full border border-blue-600 text-blue-700 bg-blue-50 hover:bg-blue-100"
          >
            Save here
          </button>
        </div>
      </div>
    </div>
  );
}
