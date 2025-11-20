// /src/stores/useuserstore.js
import { create } from "zustand";
import axios from "axios";

/* --------------------------- API setup --------------------------- */
const API_ROOT = "https://www.programshouse.com/cp/api"; // no trailing slash
const RESOURCE = "users"; // change if backend uses a different path

const api = axios.create({
  baseURL: `${API_ROOT}/${RESOURCE}`,
  headers: { Accept: "application/json" },
});

const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const extractApiError = (error) => {
  if (error?.response?.data) {
    const d = error.response.data;
    if (typeof d === "string") return d;
    if (d.message) return d.message;
    if (d.error) return d.error;
  }
  if (error?.message) return error.message;
  return null;
};

/* --------------------------- Zustand store --------------------------- */

export const useuserstore = create((set, get) => ({
  loading: false,
  error: null,
  users: [],

  /**
   * Fetch users from the API.
   * `params` will be sent as query string: ?page=1&search=...
   */
  async getUsers(params = {}) {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get("", {
        params,
        headers: {
          ...authHeaders(),
        },
      });

      const users = data?.data ?? data?.result ?? data?.items ?? data;

      set({
        loading: false,
        users,
      });

      return users;
    } catch (err) {
      const msg = extractApiError(err) || "Failed to get users";
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  async deleteUser(id) {
    if (!id) {
      const msg = "User ID is required to delete a user.";
      set({ error: msg });
      throw new Error(msg);
    }

    set({ loading: true, error: null });

    try {
      await api.delete(`/${id}`, {
        headers: {
          ...authHeaders(),
        },
      });
      const current = get().users || [];
      const updated = current.filter((u) => String(u.id) !== String(id));

      set({
        loading: false,
        users: updated,
      });

      return true;
    } catch (err) {
      const msg = extractApiError(err) || "Failed to delete user";
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },
}));
