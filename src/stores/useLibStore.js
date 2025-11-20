// /src/stores/useLibStore.js
import { create } from "zustand";
import axios from "axios";

/* --------------------------- API setup --------------------------- */
const API_ROOT = "https://www.programshouse.com/cp/api"; // same root
const RESOURCE = "library"; // <-- API PATH base (adjust if needed)

const api = axios.create({
  baseURL: `${API_ROOT}/${RESOURCE}`,
  headers: { Accept: "application/json" },
});

const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const extractApiError = (err) => {
  const resp = err?.response?.data;
  const msg = resp?.message || resp?.error || err?.message || "Request failed";
  const errs = resp?.errors;
  if (errs && typeof errs === "object") {
    const lines = [];
    for (const [field, arr] of Object.entries(errs)) {
      if (Array.isArray(arr) && arr.length) lines.push(`${field}: ${arr.join(", ")}`);
    }
    if (lines.length) return `${msg}\n• ${lines.join("\n• ")}`;
  }
  return msg;
};

/* ----------------------------- Store ----------------------------- */
export const useLibStore = create((set, get) => ({
  loading: false,
  error: null,
  library: [],      // [{id, title, url, size, mime, notes, created_at, ...}]
  page: 1,
  hasMore: false,



fetchlibrary: async (params = {}) => {
  set({ loading: true, error: null });
  try {
    const query = { ...params };
    if (query.folderId) {
      query.folder_id = query.folderId;
      delete query.folderId;
    }
    if (query.subFolderId) {
      query.sub_folder_id = query.subFolderId;
      delete query.subFolderId;
    }

    const res = await api.get("", { headers: authHeaders(), params: query });
    const payload = res?.data ?? {};

    // Normalise list from various possible envelopes
    const rawList =
      Array.isArray(payload.data) ? payload.data :
      Array.isArray(payload.items) ? payload.items :
      Array.isArray(payload.result) ? payload.result :
      Array.isArray(payload) ? payload : [];

    // If API returns folders with nested `files` arrays, flatten to a file list
    let list = rawList;
    if (Array.isArray(rawList) && rawList.length && rawList[0] && Array.isArray(rawList[0].files)) {
      list = rawList.flatMap((folder) => {
        const files = Array.isArray(folder.files) ? folder.files : [];
        return files.map((file) => ({
          ...file,
          // Ensure folder_id is set and carry folder name for convenience
          folder_id: file.folder_id ?? folder.id,
          folder_name: folder.name ?? folder.title ?? undefined,
        }));
      });
    }
    const page = payload?.meta?.current_page ?? params.page ?? 1;
    const hasMore = !!payload?.links?.next || (payload?.meta?.current_page ?? 1) < (payload?.meta?.last_page ?? 1);
    set({ library: list, loading: false, page, hasMore });
    return list;
  } catch (err) {
    set({ error: extractApiError(err) || "Failed to fetch library", loading: false });
    throw err;
  }
},

postlibrary: async ({ file, title = "", notes = "", category = "", description = "", folderId, subFolderId }) => {
  if (!file) throw new Error("postlibrary: 'file' is required");
  set({ loading: true, error: null });
  try {
    const form = new FormData();
    form.append("file", file);
    if (title) form.append("title", title);
    if (notes) form.append("notes", notes);
    if (category) form.append("category", category);
    if (description) form.append("description", description);
    if (folderId) form.append("folder_id", folderId);
    if (subFolderId) form.append("sub_folder_id", subFolderId);

    const res = await api.post("", form, {
      headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
    });

    try { await get().fetchlibrary(); } catch (err) {throw new Error(`File uploaded but failed to refresh library: ${err?.message || err}`); }
    set({ loading: false });
    return res?.data?.data ?? res?.data ?? true;
  } catch (err) {
    const msg = extractApiError(err) || "Failed to add library";
    set({ error: msg, loading: false });
    throw new Error(msg);
  }
},


showlibrary: async (id) => {
  if (!id) throw new Error("showlibrary: 'id' is required");
  set({ loading: true, error: null });
  try {
    const res = await api.get(`${id}`, { headers: authHeaders() });
    const item =
      res?.data?.data ?? res?.data?.item ?? res?.data ?? null;

    if (!item || typeof item !== "object") {
      throw new Error("Invalid response while fetching library item");
    }

    // Upsert into current list
    const { library } = get();
    const idx = Array.isArray(library)
      ? library.findIndex((x) => String(x.id) === String(item.id))
      : -1;

    let next = Array.isArray(library) ? [...library] : [];
    if (idx >= 0) next[idx] = { ...next[idx], ...item };
    else next.unshift(item);

    set({ library: next, loading: false });
    return item;
  } catch (err) {
    const msg = extractApiError(err) || "Failed to fetch library item";
    set({ error: msg, loading: false });
    throw new Error(msg);
  }
},


deletelibrary: async (id) => {
  if (!id) { const msg = "deleteLibrary: missing id"; set({ error: msg }); throw new Error(msg); }
  set({ loading: true, error: null });
  try {
    await api.delete(`${id}`, { headers: authHeaders() });
    try { await get().fetchlibrary(); } catch (err) {
      throw new Error(`File deleted but failed to refresh library: ${err?.message || err}`);
    }
    set({ loading: false });
    return true;
  } catch (err) {
    const msg = extractApiError(err) || "Failed to delete file";
    set({ error: msg, loading: false });
    throw new Error(msg);
  }
},

}));
