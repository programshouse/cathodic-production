// /src/stores/useConsultationsStore.js
import { create } from "zustand";
import axios from "axios";

// --------------------------- API setup ---------------------------
const API_ROOT = "https://www.programshouse.com/cp/api"; // same root as other stores
const RESOURCE = "consultations"; // backend path (adjust if needed)

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

// ----------------------------- Store -----------------------------
export const useConsultationsStore = create((set) => ({
  loading: false,
  error: null,

  // Create a consultation record
  async createConsultation(payload = {}) {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post("", payload, {
        headers: { ...authHeaders(), "Content-Type": "application/json" },
      });
      const created = data?.data ?? data?.result ?? data?.item ?? data;
      set({ loading: false });
      return created;
    } catch (err) {
      const msg = extractApiError(err) || "Failed to create consultation";
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },
}));
