// /src/stores/useAuthStore.js
import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

// No trailing slash to avoid `//` when joining
const API_URL = "https://www.programshouse.com/cp/api/";
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

export const useAuthStore = create((set) => ({
  admin: null,
  access_token: null,
  loading: false,
  error: null,
  isInitialized: false,
  profile: null,

  // ---- LOGIN ----
  login: async (email, password) => {
    try {
      set({ loading: true, error: null });

      const res = await api.post("/login", { email, password });

      // Be defensive about shape:
      const data = res?.data || {};
      const access_token =
        data.access_token ||
        data.token ||
        data?.data?.access_token ||
        data?.data?.token;

      const admin =
        data.admin ||
        data.user ||
        data?.data?.admin ||
        data?.data?.user ||
        null;

      if (!access_token) {
        // Backend sometimes returns "error" or "message" on wrong credentials
        const msg =
          data.error ||
          data.message ||
          "Login failed: token not present in response.";
        set({ loading: false, error: msg });
        toast.error(msg);
        throw new Error(msg);
      }

      // Persist
      const expiryTime = Date.now() + 24 * 60 * 60 * 1000; // 24h
      localStorage.setItem("access_token", access_token);
      if (admin) localStorage.setItem("admin", JSON.stringify(admin));
      localStorage.setItem("expiry_time", String(expiryTime));

      set({ admin, access_token, loading: false, error: null });
      return { access_token, admin };
    } catch (err) {
      // Normalize backend error message
      const msg =
        err?.response?.data?.error || // e.g. "auth.The provided credentials are incorrect."
        err?.response?.data?.message ||
        "Login failed";
      set({ error: msg, loading: false });
      toast.error(msg);
      throw err;
    }
  },

  // ---- REGISTER ----
  register: async (payload) => {
    // payload may include: { name, email, password, password_confirmation, ... }
    try {
      set({ loading: true, error: null });

      const res = await api.post("/register", payload);

      // Be defensive about the response shape (same pattern as login)
      const data = res?.data || {};
      const access_token =
        data.access_token ||
        data.token ||
        data?.data?.access_token ||
        data?.data?.token;

      const admin =
        data.admin ||
        data.user ||
        data?.data?.admin ||
        data?.data?.user ||
        null;

      if (!access_token) {
        const msg =
          data.error ||
          data.message ||
          "Registration failed: token not present in response.";
        set({ loading: false, error: msg });
        toast.error(msg);
        throw new Error(msg);
      }

      // Persist (24h session, same as login)

      localStorage.setItem("access_token", access_token);
      if (admin) localStorage.setItem("admin", JSON.stringify(admin));
      set({ admin, access_token, loading: false, error: null });
      toast.success("Account created successfully.");
      return { access_token, admin };
    } catch (err) {
      // Common backend validation format: { errors: { field: [msg, ...] } }
      const backendMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        (err?.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join("\n")
          : null) ||
        "Registration failed";
      set({ error: backendMsg, loading: false });
      toast.error(backendMsg);
      throw err;
    }
  },

  // ---- profILE ----
  getprofile: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/profile");
      const payload = res?.data?.data ?? res?.data ?? null;
      set({ profile: payload, loading: false });
      return payload;
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to get profile";
      set({ error: msg, loading: false });
      toast.error(msg);
      throw err;
    }
  },

  // ---- SESSION CHECK ----
  checkSession: () => {
    const expiry = localStorage.getItem("expiry_time");
    if (expiry && Date.now() > Number(expiry)) {
      // expire
      localStorage.removeItem("access_token");
      localStorage.removeItem("admin");
      localStorage.removeItem("expiry_time");
      set({ admin: null, access_token: null });
      toast.error("⏰ Session expired, please login again!");
      return false;
    }
    return true;
  },

  // ---- LOGOUT ----
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("admin");
    localStorage.removeItem("expiry_time");
    set({ admin: null, access_token: null, profile: null, error: null });
  },

  // ---- INIT FROM STORAGE ----
  loadUserFromStorage: () => {
    const token = localStorage.getItem("access_token");
    const adminStr = localStorage.getItem("admin");
    if (token) {
      set({
        access_token: token,
        admin: adminStr ? JSON.parse(adminStr) : null,
        isInitialized: true,
      });
    } else {
      set({ isInitialized: true });
    }
  },
}));
