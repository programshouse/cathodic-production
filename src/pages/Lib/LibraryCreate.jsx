// /src/pages/Lib/LibraryCreate.jsx
import React, { useEffect, useRef, useState } from "react";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import CardBox from "../../components/ui/CardBox";
import Btn from "../../components/ui/Btn";
import { useLibStore } from "../../stores/useLibStore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function LibraryCreate() {
  const { postlibrary, fetchlibrary, loading } = useLibStore();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // no-op, page is for create only
  }, []);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) await doMultiUpload(files);
    e.target.value = "";
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
      for (const file of files) {
        await postlibrary({ file, title, notes });
      }
      await fetchlibrary();
      toast.update(t, { render: `Uploaded ${files.length} file${files.length > 1 ? "s" : ""}` , type: "success", isLoading: false, autoClose: 1400 });
      setTitle("");
      setNotes("");
      navigate("/admin/library");
    } catch (err) {
      toast.update(t, { render: err?.message || "Upload failed", type: "error", isLoading: false, autoClose: 2600 });
    }
  };

  return (
    <PageLayout title="Library (Create) | CP">
      <PageHeader title="Create Library Item" description="Upload a new file to the Library." />

      <CardBox className="mb-6">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title (optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e)=>setTitle(e.target.value)}
                  placeholder="e.g. CP Design Guide 2025.pdf"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e)=>setNotes(e.target.value)}
                  placeholder="Short description or tags (e.g. #attenuation #design)"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div
            onDragOver={(e)=>{ e.preventDefault(); setDragOver(true); }}
            onDragLeave={()=>setDragOver(false)}
            onDrop={onDrop}
            className={`rounded-2xl border-2 border-dashed p-4 text-center transition h-full flex flex-col items-center justify-center ${dragOver ? "border-blue-400 bg-blue-50/50 dark:border-blue-600/70 dark:bg-blue-950/30" : "border-gray-300 dark:border-gray-700"}`}
          >
            <div className="text-sm text-gray-700 dark:text-gray-200">Drag & drop files here</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">or</div>
            <Btn onClick={() => fileInputRef.current?.click()} size="xs" disabled={loading}>
              {loading ? "…" : "Choose files"}
            </Btn>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.svg,.txt"
              onChange={handleFileChange}
            />
            <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">PDF, images, docs… (multi‑select supported)</div>
          </div>
        </div>
      </CardBox>

      <div className="flex items-center gap-2">
        <Btn variant="neutral" onClick={() => navigate(-1)}>Back</Btn>
        <Btn variant="outline" onClick={() => fileInputRef.current?.click()}>Upload</Btn>
      </div>
    </PageLayout>
  );
}
