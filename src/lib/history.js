// src/lib/historyStore.js
// Lightweight in-memory history helper used by some legacy UI pieces.
// It no longer persists anything to localStorage – all data lives only
// for the duration of the current page session.

const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

// Single-process in-memory store. This avoids any browser storage usage
// while keeping the same public API as before.
let projects = [{ id: "default", name: "Default Project", items: [] }];
let activeProjectId = "default";

/** Ensure projects array is always a non-empty list. */
function ensureProjects() {
  if (!Array.isArray(projects) || projects.length === 0) {
    projects = [{ id: "default", name: "Default Project", items: [] }];
    activeProjectId = projects[0].id;
  }
  return projects;
}

export function getProjects() {
  return ensureProjects();
}

export function getActiveProjectId() {
  const list = ensureProjects();
  if (activeProjectId && list.some((p) => p.id === activeProjectId)) {
    return activeProjectId;
  }
  const first = list[0]?.id || "";
  activeProjectId = first || "";
  return activeProjectId;
}

export function setActiveProjectId(id) {
  const list = ensureProjects();
  if (!list.some((p) => p.id === id)) return;
  activeProjectId = id;
}

export function getProject(id) {
  const list = ensureProjects();
  return list.find((p) => p.id === id) || null;
}

export function createProject(name) {
  const list = ensureProjects();
  const p = { id: uid(), name: name || "Untitled", items: [] };
  list.push(p);
  activeProjectId = p.id;
  return p;
}

export function renameProject(id, name) {
  const list = ensureProjects();
  const idx = list.findIndex((p) => p.id === id);
  if (idx < 0) return;
  list[idx] = { ...list[idx], name: name || list[idx].name };
}

export function deleteProject(id) {
  const list = ensureProjects();
  projects = list.filter((p) => p.id !== id);
  if (activeProjectId === id) {
    const next = projects[0]?.id || "";
    activeProjectId = next || "";
  }
}

/**
 * Add a history entry to the active project.
 * item: { moduleKey, label, inputs, results, imageDataUrl?, ts? }
 */
export function addItem(item) {
  const list = ensureProjects();
  const activeId = getActiveProjectId();
  const idx = list.findIndex((p) => p.id === activeId);
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

  list[idx].items.unshift(payload); // newest first
  return payload;
}

/** Optional migration: pull last single-saves into Default project */
export function migrateLegacyIntoDefault() {
  // No-op: legacy migration from localStorage has been removed because
  // we no longer persist any calculation data in browser storage.
  return;
}
