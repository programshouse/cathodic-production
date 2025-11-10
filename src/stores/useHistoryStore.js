// /src/stores/useHistoryStore.js
import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

// ✅ No trailing slash to avoid `//` when joining
const API_URL = "https://www.programshouse.com/cp/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { Accept: "application/json" },
});

// Attach token automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const useHistoryStore = create((set) => ({
  history: [],
  historyMeta: null,   
  loading: false,
  error: null,

  showHistory: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("calculation-history", { params });

      // Normalize common shapes
      const data = res?.data ?? {};
      const items =
        Array.isArray(data) ? data
        : Array.isArray(data?.data) ? data.data
        : Array.isArray(data?.items) ? data.items
        : Array.isArray(data?.result) ? data.result
        : [];

      // Try to pick meta if present
      const meta = data?.meta || data?.pagination || null;

      set({ history: items, historyMeta: meta, loading: false });
      return items;
    } catch (err) {
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to get calculation history";
      set({ error: apiMsg, loading: false });
      toast.error(apiMsg);
      throw err;
    }
  },

}));
