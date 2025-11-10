// src/lib/historyStore.js
const KEY_PROJECTS = "cp_projects_v1";
const KEY_ACTIVE = "cp_projects_active_v1";

/** Utils */
const safeParse = (s, fallback) => {
  try { return JSON.parse(s); } catch { return fallback; }
};
const save = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
};

const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/** Bootstrap projects list + default project */
function ensureProjects() {
  if (typeof window === "undefined") return [];
  const list = safeParse(localStorage.getItem(KEY_PROJECTS), null);
  if (Array.isArray(list) && list.length) return list;

  const def = [{ id: uid(), name: "Default Project", items: [] }];
  save(KEY_PROJECTS, def);
  if (!localStorage.getItem(KEY_ACTIVE)) {
    localStorage.setItem(KEY_ACTIVE, def[0].id);
  }
  return def;
}

export function getProjects() {
  return ensureProjects();
}

export function getActiveProjectId() {
  if (typeof window === "undefined") return "";
  const projects = ensureProjects();
  const stored = localStorage.getItem(KEY_ACTIVE);
  if (stored && projects.some(p => p.id === stored)) return stored;
  // fallback to first project
  const first = projects[0]?.id || "";
  if (first) localStorage.setItem(KEY_ACTIVE, first);
  return first;
}

export function setActiveProjectId(id) {
  if (typeof window === "undefined") return;
  const projects = ensureProjects();
  if (!projects.some(p => p.id === id)) return;
  localStorage.setItem(KEY_ACTIVE, id);
}

export function getProject(id) {
  const projects = ensureProjects();
  return projects.find(p => p.id === id) || null;
}

export function createProject(name) {
  const projects = ensureProjects();
  const p = { id: uid(), name: name || "Untitled", items: [] };
  projects.push(p);
  save(KEY_PROJECTS, projects);
  setActiveProjectId(p.id);
  return p;
}

export function renameProject(id, name) {
  const projects = ensureProjects();
  const idx = projects.findIndex(p => p.id === id);
  if (idx < 0) return;
  projects[idx] = { ...projects[idx], name: name || projects[idx].name };
  save(KEY_PROJECTS, projects);
}

export function deleteProject(id) {
  const projects = ensureProjects().filter(p => p.id !== id);
  save(KEY_PROJECTS, projects);
  // reset active if needed
  const active = getActiveProjectId();
  if (active === id) {
    const next = projects[0]?.id || "";
    if (next) setActiveProjectId(next);
    else localStorage.removeItem(KEY_ACTIVE);
  }
}

/**
 * Add a history entry to the active project.
 * item: { moduleKey, label, inputs, results, imageDataUrl?, ts? }
 */
export function addItem(item) {
  if (typeof window === "undefined") return null;
  const projects = ensureProjects();
  const activeId = getActiveProjectId();
  const idx = projects.findIndex(p => p.id === activeId);
  if (idx < 0) return null;

  const payload = {
    id: uid(),
    moduleKey: item.moduleKey,
    label: item.label || item.moduleKey,
    inputs: item.inputs ?? null,
    results: item.results ?? null,
    imageDataUrl: item.imageDataUrl ?? null,
    ts: item.ts || Date.now(),
  };
  projects[idx].items.unshift(payload); // newest first
  save(KEY_PROJECTS, projects);
  return payload;
}

/** Optional migration: pull last single-saves into Default project */
export function migrateLegacyIntoDefault() {
  if (typeof window === "undefined") return;
  const legacyKeys = [
    "voltage_gradient_calc",
    "attenuation_calc",
    "interference_calc",
    "soil_resistivity_calc",
    "barnes_layer_calc",
    "coating_factors_calc",
    "groundbed_resistance_calc",
    "galvanic_calc",
    "impressed_current_calc",
    "variable_resistor_calc",
    "circuit_resistance_calc",
    "surface_area_calc",
  ];
  const projects = ensureProjects();
  const defId = getActiveProjectId();
  const defIdx = projects.findIndex(p => p.id === defId) ?? 0;

  let changed = false;
  legacyKeys.forEach(k => {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) return;
      const parsed = safeParse(raw, null);
      if (!parsed || (!parsed.inputs && !parsed.results)) return;

      projects[defIdx].items.unshift({
        id: uid(),
        moduleKey: k,
        label: k,
        inputs: parsed.inputs ?? null,
        results: parsed.results ?? null,
        imageDataUrl: null,
        ts: parsed.timestamp || Date.now(),
      });
      localStorage.removeItem(k);
      changed = true;
    } catch {}
  });

  if (changed) save(KEY_PROJECTS, projects);
}
