// /src/stores/useLibrarySubFoldersStore.js
import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "https://www.programshouse.com/cp/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const normalizeList = (data) =>
  Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.result)
    ? data.result
    : [];

const normalizeItem = (data) =>
  data?.data ?? data?.item ?? data?.result ?? data;

const errMsg = (err, fallback) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.message ||
  fallback;

export const useLibrarySubFoldersStore = create((set, get) => ({
  librarySubFolders: [],
  loading: false,
  error: null,

  async getAll() {
    set({ loading: true, error: null });
    try {
      const res = await api.get("sub-folders");
      const list = normalizeList(res?.data);
      set({ librarySubFolders: list, loading: false });
      return list;
    } catch (err) {
      const msg = errMsg(err, "Failed to fetch library sub folders");
      set({ error: msg, loading: false });
      toast.error(msg);
      throw err;
    }
  },

  async show(id) {
    if (!id) throw new Error("show: 'id' is required");
    set({ loading: true, error: null });
    try {
      const res = await api.get(`sub-folders/${id}`);
      const item = normalizeItem(res?.data);
      set({ loading: false });
      return item;
    } catch (err) {
      const msg = errMsg(err, "Failed to fetch library sub folder");
      set({ error: msg, loading: false });
      toast.error(msg);
      throw err;
    }
  },

  async create(name, folderId) {
    if (!name || !String(name).trim()) {
      const msg = "Library sub folder name is required";
      set({ error: msg });
      toast.error(msg);
      throw new Error(msg);
    }
    if (!folderId) {
      const msg = "Sub folder: 'folderId' is required";
      set({ error: msg });
      toast.error(msg);
      throw new Error(msg);
    }
    set({ loading: true, error: null });
    try {
      const res = await api.post(
        "sub-folders",
        { name: String(name).trim(), folder_id: folderId },
        { headers: { "Content-Type": "application/json" } }
      );
      const created = normalizeItem(res?.data);
      try {
        await get().getAll();
      } catch {}
      set({ loading: false });
      toast.success("Library sub folder created");
      return created;
    } catch (err) {
      const msg = errMsg(err, "Failed to create library sub folder");
      set({ error: msg, loading: false });
      toast.error(msg);
      throw err;
    }
  },

  async update(id, name) {
    if (!id) throw new Error("update: 'id' is required");
    if (!name || !String(name).trim()) {
      const msg = "Library sub folder name is required";
      set({ error: msg });
      toast.error(msg);
      throw new Error(msg);
    }
    set({ loading: true, error: null });
    try {
      const res = await api.patch(
        `sub-folders/${id}`,
        { name: String(name).trim() },
        { headers: { "Content-Type": "application/json" } }
      );
      const updated = normalizeItem(res?.data);
      try {
        await get().getAll();
      } catch {}
      set({ loading: false });
      toast.success("Library sub folder updated");
      return updated;
    } catch (err) {
      const msg = errMsg(err, "Failed to update library sub folder");
      set({ error: msg, loading: false });
      toast.error(msg);
      throw err;
    }
  },

  async delete(id) {
    if (!id) throw new Error("delete: 'id' is required");
    set({ loading: true, error: null });
    try {
      await api.delete(`sub-folders/${id}`);
      try {
        await get().getAll();
      } catch {}
      set({ loading: false });
      toast.success("Library sub folder deleted");
      return true;
    } catch (err) {
      const msg = errMsg(err, "Failed to delete library sub folder");
      set({ error: msg, loading: false });
      toast.error(msg);
      throw err;
    }
  },
}));