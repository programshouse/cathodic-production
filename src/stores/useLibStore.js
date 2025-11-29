// /src/stores/useLibStore.js
import { create } from "zustand";
import axios from "axios";

/* --------------------------- API setup --------------------------- */
const API_ROOT = "https://www.programshouse.com/cp/api"; // same root
const RESOURCE = "library"; // API PATH base for library routes

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
  library: [], // list of files
  page: 1,
  hasMore: false,

  // search state (server-side search)
  searchResults: [],
  searchLoading: false,

  /* --------- list files (optionally by folder/subfolder) ---------- */
  fetchlibrary: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const query = { ...params };

      // keep friendly keys but also send API keys
      const folderId = query.folderId ?? query.folder_id ?? null;
      const subFolderId = query.subFolderId ?? query.sub_folder_id ?? null;

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

      const rawList =
        Array.isArray(payload.data) ? payload.data :
        Array.isArray(payload.items) ? payload.items :
        Array.isArray(payload.result) ? payload.result :
        Array.isArray(payload) ? payload : [];

      // if API returned folders with nested files, flatten them
      let list = rawList;
      if (Array.isArray(rawList) && rawList.length && Array.isArray(rawList[0]?.files)) {
        list = rawList.flatMap((folder) => {
          const files = Array.isArray(folder.files) ? folder.files : [];
          return files.map((file) => ({
            ...file,
            folder_id: file.folder_id ?? folder.id,
            folder_name: folder.name ?? folder.title ?? file.folder_name,
          }));
        });
      }

      // client-side filtering by folder / subfolder
      if (folderId != null) {
        list = list.filter(
          (f) => String(f.folder_id ?? f.folderId ?? "") === String(folderId)
        );
      }
      if (subFolderId != null) {
        list = list.filter(
          (f) =>
            String(f.sub_folder_id ?? f.subFolderId ?? "") ===
            String(subFolderId)
        );
      }

      const page = payload?.meta?.current_page ?? params.page ?? 1;
      const hasMore =
        !!payload?.links?.next ||
        (payload?.meta?.current_page ?? 1) < (payload?.meta?.last_page ?? 1);

      set({ library: list, loading: false, page, hasMore });
      return list;
    } catch (err) {
      set({
        error: extractApiError(err) || "Failed to fetch library",
        loading: false,
      });
      throw err;
    }
  },

  /* -------------------- server-side search (by file) -------------------- */
  searchLibrary: async (query) => {
    const q = (query || "").trim();

    // no query → don't call backend
    if (!q) {
      set({ searchResults: [], searchLoading: false });
      return [];
    }

    set({ searchLoading: true, error: null });
    try {
      // IMPORTANT: hit /cp/api/search (NOT /cp/api/library/search)
      const res = await axios.get(`${API_ROOT}/search`, {
        headers: authHeaders(),
        params: { query: q },
      });

      const payload = res?.data ?? {};
      const list =
        Array.isArray(payload.data) ? payload.data :
        Array.isArray(payload.items) ? payload.items :
        Array.isArray(payload.result) ? payload.result :
        Array.isArray(payload) ? payload : [];

      const normalized = list.map((item) => ({
        id: item.id,
        title: item.title ?? item.name ?? "",
        folder_name: item.folder_name ?? item.folder ?? null,
        file_path: item.file_path ?? item.path ?? item.url ?? "",
        raw: item,
      }));

      set({ searchResults: normalized, searchLoading: false });
      return normalized;
    } catch (err) {
      set({
        error: extractApiError(err) || "Failed to search library",
        searchLoading: false,
      });
      throw err;
    }
  },

  /* ------------------------ show / CRUD ------------------------ */
  postlibrary: async ({
    file,
    title = "",
    notes = "",
    category = "",
    description = "",
    folderId,
    subFolderId,
  }) => {
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

      try {
        await get().fetchlibrary();
      } catch (err) {
        throw new Error(
          `File uploaded but failed to refresh library: ${err?.message || err}`
        );
      }
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
      const item = res?.data?.data ?? res?.data?.item ?? res?.data ?? null;
      if (!item || typeof item !== "object") {
        throw new Error("Invalid response while fetching library item");
      }

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
    if (!id) {
      const msg = "deleteLibrary: missing id";
      set({ error: msg });
      throw new Error(msg);
    }
    set({ loading: true, error: null });
    try {
      await api.delete(`${id}`, { headers: authHeaders() });
      try {
        await get().fetchlibrary();
      } catch (err) {
        throw new Error(
          `File deleted but failed to refresh library: ${err?.message || err}`
        );
      }
      set({ loading: false });
      return true;
    } catch (err) {
      const msg = extractApiError(err) || "Failed to delete file";
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  updatelibrary: async (id, payload = {}) => {
    if (!id) {
      const msg = "updateLibrary: missing id";
      set({ error: msg });
      throw new Error(msg);
    }
    set({ loading: true, error: null });
    try {
      const res = await api.patch(`${id}`, payload, {
        headers: { ...authHeaders(), "Content-Type": "application/json" },
      });
      try {
        await get().fetchlibrary();
      } catch (err) {
        throw new Error(
          `File updated but failed to refresh library: ${err?.message || err}`
        );
      }
      set({ loading: false });
      return res?.data?.data ?? res?.data ?? true;
    } catch (err) {
      const msg = extractApiError(err) || "Failed to update file";
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },
}));
