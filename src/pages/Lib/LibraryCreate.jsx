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
    const t = toast.loading(
      `Uploading ${files.length} file${files.length > 1 ? "s" : ""}…`
    );
    try {
      for (const file of files) {
        await postlibrary({ file, title, notes });
      }
      await fetchlibrary();
      toast.update(t, {
        render: `Uploaded ${files.length} file${
          files.length > 1 ? "s" : ""
        }`,
        type: "success",
        isLoading: false,
        autoClose: 1400,
      });
      setTitle("");
      setNotes("");
      navigate("/admin/library");
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
    <PageLayout title="Library (Create) | CP">
      <PageHeader
        title="Library – Upload Files"
        description="Add new design guides, standards, and reference files to your CP Library."
      />

      <CardBox className="mb-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)] items-start">
          {/* ---- Left: Metadata form ---- */}
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                File Details
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Optional metadata to help you and your team search and filter
                library items later.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Title <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. CP Design Guide 2025.pdf"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/60 dark:border-slate-700 dark:bg-slate-950"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Shown in Library tables and search results.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Notes / Tags{" "}
                    <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Short description or tags (e.g. #attenuation #design)"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/60 dark:border-slate-700 dark:bg-slate-950"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Use tags to group by topic, project, or standard.
                  </p>
                </div>
              </div>
            </div>

            {/* Notes block */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
              <p className="font-medium text-slate-600 dark:text-slate-200">
                Notes
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4">
                <li>
                  All files are stored in the central CP Library for the whole
                  team.
                </li>
                <li>Outputs and search are unified across modules.</li>
              </ul>
            </div>
          </div>

          {/* ---- Right: Upload panel ---- */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Upload Files
            </h2>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`relative flex h-full min-h-[230px] flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed px-6 py-6 text-center text-sm transition
              ${
                dragOver
                  ? "border-blue-500 bg-blue-50/70 ring-2 ring-blue-400/60 dark:border-blue-500 dark:bg-blue-950/40"
                  : "border-slate-300 bg-slate-50/70 hover:border-blue-400/70 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900/70"
              }`}
            >
              <div className="pointer-events-none absolute inset-x-8 -top-10 h-24 rounded-full bg-gradient-to-b from-blue-500/8 to-transparent blur-2xl" />

              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm dark:bg-slate-950">
                  <span className="text-lg font-semibold text-blue-600">
                    ⬆
                  </span>
                </div>

                <div className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                  Drag &amp; drop PDF files here
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  or select from your computer
                </div>

                <Btn
                  onClick={() => fileInputRef.current?.click()}
                  size="xs"
                  disabled={loading}
                  className="mt-3"
                >
                  {loading ? "Uploading…" : "Browse PDF"}
                </Btn>

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept=".pdf"
                  onChange={handleFileChange}
                />

                <div className="mt-3 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Only PDF files are supported for Library uploads.
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardBox>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Btn variant="neutral" onClick={() => navigate(-1)}>
            Back
          </Btn>
        </div>

        <div className="flex items-center gap-2">
        </div>
      </div>
    </PageLayout>
  );
}
