import React, { useState, useEffect, useRef } from "react";
import PageHeader from "../../components/ui/PageHeader";
import CardBox from "../../components/ui/CardBox";
import Btn from "../../components/ui/Btn";
import { useLibStore } from "../../stores/useLibStore";
import { useLibraryFoldersStore } from "../../stores/useLibraryFoldersStore";
import { useLibrarySubFoldersStore } from "../../stores/useLibrarySubFoldersStore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function LibraryCreate() {
  const { postlibrary, fetchlibrary, loading } = useLibStore();
  const { libraryFolders, getAll: getAllLibraryFolders, create: createLibraryFolder } = useLibraryFoldersStore();
  const { librarySubFolders, getAll: getAllLibrarySubFolders, create: createLibrarySubFolder } = useLibrarySubFoldersStore();

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedSubFolderId, setSelectedSubFolderId] = useState(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newSubFolderName, setNewSubFolderName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch initial data for folders and subfolders
  useEffect(() => {
    getAllLibraryFolders().catch(() => {});
    getAllLibrarySubFolders().catch(() => {});
  }, []);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) await doMultiUpload(files);
    e.target.value = ""; // Clear file input after use
  };

  const onDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) await doMultiUpload(files);
  };

  const doMultiUpload = async (files) => {
    const t = toast.loading(`Uploading ${files.length} file${files.length > 1 ? "s" : ""}…`);
    try {
      let folderId = selectedFolderId;
      let subFolderId = selectedSubFolderId;

      // Create folder if needed
      if (!folderId && newFolderName.trim()) {
        const createdFolder = await createLibraryFolder(newFolderName.trim());
        folderId = createdFolder?.id || folderId;
      }

      // Create subfolder if needed
      if (!subFolderId && newSubFolderName.trim() && folderId) {
        const createdSubFolder = await createLibrarySubFolder(newSubFolderName.trim(), folderId);
        subFolderId = createdSubFolder?.id || subFolderId;
      }

      // Loop through the files and upload each
      for (const file of files) {
        await postlibrary({
          file,
          title,
          notes,
          folderId,
          subFolderId,
        });
      }

      await fetchlibrary();
      toast.update(t, {
        render: `Uploaded ${files.length} file${files.length > 1 ? "s" : ""} successfully`,
        type: "success",
        isLoading: false,
        autoClose: 1500,
      });

      // Reset the form
      setTitle("");
      setNotes("");
      setNewFolderName("");
      setNewSubFolderName("");
      navigate("/admin/library"); // Redirect after successful upload
    } catch (err) {
      toast.update(t, {
        render: err?.message || "Upload failed",
        type: "error",
        isLoading: false,
        autoClose: 2600,
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Upload Files" description="Add new design guides, standards, and reference files to your CP Library." />

      <CardBox>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* File details section */}
          <div className="space-y-6">
            <h2 className="text-sm font-semibold text-gray-700">File Details</h2>
            <div className="bg-white p-4 shadow-lg rounded-xl">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Title input */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. CP Design Guide 2025.pdf"
                    className="w-full border rounded-xl p-2 text-sm"
                  />
                </div>

                {/* Notes input */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium">Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. CP Design Guide for 2025"
                    className="w-full border rounded-xl p-2 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Folder selection */}
            <div className="bg-white p-4 shadow-lg rounded-xl">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium">Folder</label>
                  <select
                    value={selectedFolderId || ""}
                    onChange={(e) => setSelectedFolderId(e.target.value)}
                    className="w-full border rounded-xl p-2 text-sm"
                  >
                    <option value="">Select a folder</option>
                    {libraryFolders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium">Sub Folder</label>
                  <select
                    value={selectedSubFolderId || ""}
                    onChange={(e) => setSelectedSubFolderId(e.target.value)}
                    className="w-full border rounded-xl p-2 text-sm"
                  >
                    <option value="">Select a subfolder</option>
                    {librarySubFolders
                      .filter((sf) => sf.folder_id === selectedFolderId)
                      .map((subFolder) => (
                        <option key={subFolder.id} value={subFolder.id}>
                          {subFolder.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {/* New folder/subfolder creation */}
            <div className="bg-white p-4 shadow-lg rounded-xl">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium">New Folder</label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Create a new folder"
                    className="w-full border rounded-xl p-2 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium">New Subfolder</label>
                  <input
                    type="text"
                    value={newSubFolderName}
                    onChange={(e) => setNewSubFolderName(e.target.value)}
                    placeholder="Create a new subfolder"
                    className="w-full border rounded-xl p-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* File upload section */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700">Upload Files</h2>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`border-dashed border-2 rounded-xl p-6 text-center ${dragOver ? "border-blue-500 bg-blue-100" : "border-gray-300"}`}
            >
              <div className="text-lg font-semibold text-blue-600">⬆</div>
              <div className="text-sm text-gray-700">Drag & drop PDF, DOC, JPG, PNG files here</div>
              <div className="text-xs text-gray-500">or select from your computer</div>
              <Btn onClick={() => fileInputRef.current?.click()} size="sm" disabled={loading} className="mt-3">
                {loading ? "Uploading…" : "Browse Files"}
              </Btn>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept=".pdf, .jpg, .jpeg, .png, .docx, .txt"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
      </CardBox>

      <div className="flex justify-between gap-3 mt-6">
        <Btn variant="neutral" onClick={() => navigate(-1)}>
          Back
        </Btn>
        <Btn variant="primary" onClick={doMultiUpload} disabled={loading}>
          {loading ? "Uploading..." : "Save All"}
        </Btn>
      </div>
    </div>
  );
}
