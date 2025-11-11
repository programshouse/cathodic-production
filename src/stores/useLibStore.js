// /src/stores/useLibStore.js
import { create } from "zustand";
import axios from "axios";

/* --------------------------- API setup --------------------------- */
const API_ROOT = "https://www.programshouse.com/cp/api"; // same root
const RESOURCE = "lib"; // <-- API PATH base (adjust if needed)

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
    const res = await api.get("/library", { headers: authHeaders(), params });
    const payload = res?.data ?? {};
    const list =
      Array.isArray(payload.data) ? payload.data :
      Array.isArray(payload.items) ? payload.items :
      Array.isArray(payload.result) ? payload.result :
      Array.isArray(payload) ? payload : [];
    const page = payload?.meta?.current_page ?? params.page ?? 1;
    const hasMore = !!payload?.links?.next || (payload?.meta?.current_page ?? 1) < (payload?.meta?.last_page ?? 1);
    set({ library: list, loading: false, page, hasMore });
    return list;
  } catch (err) {
    set({ error: extractApiError(err) || "Failed to fetch library", loading: false });
    throw err;
  }
},

postlibrary: async ({ file, title = "", notes = "" }) => {
  if (!file) throw new Error("postlibrary: 'file' is required");
  set({ loading: true, error: null });
  try {
    const form = new FormData();
    form.append("file", file);
    if (title) form.append("title", title);
    if (notes) form.append("notes", notes);

    const res = await api.post("/library", form, {
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

deleteFile: async (id) => {
  if (!id) { const msg = "deleteFile: missing id"; set({ error: msg }); throw new Error(msg); }
  set({ loading: true, error: null });
  try {
    await api.delete(`/library/${id}`, { headers: authHeaders() });
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
