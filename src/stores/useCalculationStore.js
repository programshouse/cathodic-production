// /src/stores/useCalculationStore.js
import { create } from "zustand";
import axios from "axios";

/* --------------------------- API setup --------------------------- */
const API_ROOT = "https://www.programshouse.com/cp/api"; // no trailing slash
const RESOURCE = "calculations"; // change if backend uses a different path

const api = axios.create({
  baseURL: `${API_ROOT}/${RESOURCE}`,
  headers: { Accept: "application/json" },
});

const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* -------------------- Modules map (name + path) ------------------- */
export const MODULES = [
  { name: "Attenuation & Pipeline Potential profile", path: "/pages/attenuation" },
  { name: "Barnes Layer Resistivity",                 path: "/pages/barnes-layer" },
  { name: "Circuit Resistance Module",                path: "/pages/circuit-resistance" },
  { name: "Coating Factors Calculation",              path: "/pages/coating-factors" },
  { name: "Current Density Calculation",              path: "/pages/current-density" },
  { name: "Galvanic Anode System Calculation",        path: "/pages/galvanic-anode" },
  { name: "Groundbed Resistance",                     path: "/pages/groundbed-resistance" },
  { name: "Impressed Current System Calculation",     path: "/pages/impressed-current" },
  { name: "Interference Calculation",                 path: "/pages/interference" },
  { name: "Soil Resistivity",                         path: "/pages/soil-resistivity" },
  { name: "Solar Sizing",                             path: "/pages/solar-sizing" },
  { name: "Surface Area Calculation",                 path: "/pages/surface-area" },
  { name: "Tank MMO Anode Sizing",                    path: "/pages/tank-mmo-sizing" },
  { name: "Variable Resistor & Shunt Resistor Sizing",path: "/pages/Variable-Resistor-Shunt" },
  { name: "Resistor Sizing",                          path: "/pages/resistor-sizing" },
  { name: "Voltage Gradient",                         path: "/pages/voltage-gradient" },
];

const PATH_TO_FORMULA = Object.fromEntries(MODULES.map(m => [m.path, m.name]));

/* ---------------------------- Helpers ---------------------------- */
const buildPayload = ({ folder_id, name, formula_name, title, inputs, results, status = "completed", meta }) => ({
  // server expects these exact fields
  ...(folder_id != null ? { folder_id } : {}),
  ...(name ? { name } : {}),
  formula_name,
  title: title || formula_name,
  inputs: inputs ?? {},
  results: results ?? {},
  status,
  ...(meta ? { meta } : {}),
});

// Turn "Surface Area Calculation" -> "submitSurfaceAreaCalculation"
const toMethodName = (moduleName) => {
  const cleaned = moduleName
    .replace(/&/g, " ")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
  return `submit${cleaned}`;
};

// Nicely extract API validation errors
const extractApiError = (err) => {
  const resp = err?.response?.data;
  const msg = resp?.message || resp?.error || err?.message || "Request failed";
  const errs = resp?.errors;
  if (errs && typeof errs === "object") {
    const lines = [];
    for (const [field, arr] of Object.entries(errs)) {
      if (Array.isArray(arr) && arr.length) {
        lines.push(`${field}: ${arr.join(", ")}`);
      }
    }
    if (lines.length) return `${msg}\n• ${lines.join("\n• ")}`;
  }
  return msg;
};

/* ----------------------------- Store ----------------------------- */
export const useCalculationStore = create((set, get) => {
  const core = {
    loading: false,
    error: null,
    lastSubmitted: null,
    list: [],
    item: null,

    /**
     * Create/submit a calculation record
     * Backend commonly requires: folder_id (server folder/project), name (record name)
     */
    async submitCalculation({ folder_id, name, formula_name, title, inputs, results, status = "completed", meta }) {
      if (!formula_name) {
        const msg = "submitCalculation: 'formula_name' is required";
        set({ error: msg });
        throw new Error(msg);
      }

      set({ loading: true, error: null });

      try {
        const { data } = await api.post(
          "",
          buildPayload({ folder_id, name, formula_name, title, inputs, results, status, meta }),
          { headers: { ...authHeaders(), "Content-Type": "application/json" } }
        );

        const created = data?.data ?? data?.result ?? data?.item ?? data;
        set({ lastSubmitted: created, loading: false });

        // refresh list softly
        try { await get().fetchCalculations({ limit: 20 }); } catch {}

        return created;
      } catch (err) {
        // Special handling for common validation error: folder_id missing/invalid
        const is422 = err?.response?.status === 422;
        const raw = err?.response?.data;
        let friendly = extractApiError(err);

        // If server says folder id required/invalid, surface a clear hint
        const folderErrors = raw?.errors?.folder_id;
        if (is422 && folderErrors) {
          friendly =
            `${friendly}\n\nHint: The server needs a valid 'folder_id' (server project/folder).\n` +
            `• Make sure you have an active project that exists on the server (not just local).\n` +
            `• If you resolve the server folder by name first, pass its numeric id here.`;
        }

        set({ error: friendly, loading: false });
        throw new Error(friendly);
      }
    },

    /**
     * Submit by module route path
     * (Maps path -> formula_name from MODULES above)
     */
    async submitForModulePath({ path, folder_id, name, title, inputs, results, status = "completed", meta }) {
      const formula_name = PATH_TO_FORMULA[path];
      if (!formula_name) {
        const msg = `Unknown module path: ${path}`;
        set({ error: msg });
        throw new Error(msg);
      }
      return get().submitCalculation({ folder_id, name, formula_name, title, inputs, results, status, meta });
    },

    /** List calculations (optional filters/paging via params) */
    async fetchCalculations(params = {}) {
      set({ loading: true, error: null });
      try {
        const { data } = await api.get("", { headers: authHeaders(), params });
        const list =
          Array.isArray(data) ? data :
          Array.isArray(data?.data) ? data.data :
          Array.isArray(data?.items) ? data.items :
          Array.isArray(data?.result) ? data.result : [];
        set({ list, loading: false });
        return list;
      } catch (err) {
        const msg = extractApiError(err) || "Failed to fetch calculations";
        set({ error: msg, loading: false });
        throw new Error(msg);
      }
    },

    /** Retrieve a calculation by id */
    async fetchCalculationById(id) {
      if (!id) {
        const msg = "fetchCalculationById: missing id";
        set({ error: msg });
        throw new Error(msg);
      }
      set({ loading: true, error: null });
      try {
        const { data } = await api.get(`/${id}`, { headers: authHeaders() });
        const item = data?.data ?? data?.result ?? data?.item ?? data;
        set({ item, loading: false });
        return item;
      } catch (err) {
        const msg = extractApiError(err) || "Failed to get calculation";
        set({ error: msg, loading: false });
        throw new Error(msg);
      }
    },

    /** Delete a calculation by id */
    async deleteCalculation(id) {
      if (!id) {
        const msg = "deleteCalculation: missing id";
        set({ error: msg });
        throw new Error(msg);
      }
      set({ loading: true, error: null });
      try {
        const { data } = await api.delete(`/${id}`, { headers: authHeaders() });
        set({ loading: false });
        try { await get().fetchCalculations(); } catch {}
        return data?.data ?? data?.result ?? data;
      } catch (err) {
        const msg = extractApiError(err) || "Failed to delete calculation";
        set({ error: msg, loading: false });
        throw new Error(msg);
      }
    },
  };

  // Auto-generate one submitter per module: submitSurfaceAreaCalculation(), submitVoltageGradient(), ...
  const perModule = {};
  for (const m of MODULES) {
    const method = toMethodName(m.name);
    perModule[method] = async ({ folder_id, name, title, inputs, results, status = "completed", meta } = {}) =>
      core.submitCalculation({ folder_id, name, formula_name: m.name, title, inputs, results, status, meta });
  }

  return { ...core, ...perModule, MODULES };
});
