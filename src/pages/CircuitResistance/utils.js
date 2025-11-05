// Utilities for Circuit Resistance Module
// Units:
// - Cable resistivity in Ω·mm^2/m (material property)
// - Length in m, Cross-section in mm^2
// - Anode resistance in Ω (each)
// - Pipeline resistance in Ω (total provided)

export const MATERIALS = [
  { value: "copper", label: "Copper", resistivity_ohm_mm2_per_m: 0.0172 },
  { value: "aluminum", label: "Aluminum", resistivity_ohm_mm2_per_m: 0.0282 },
  { value: "steel", label: "Steel", resistivity_ohm_mm2_per_m: 0.10 },
];

export function cableResistance({ length_m, cross_section_mm2, material }) {
  const m = MATERIALS.find((x) => x.value === material) || MATERIALS[0];
  const rho = m.resistivity_ohm_mm2_per_m; // Ω·mm^2/m
  const L = Number(length_m || 0);
  const A = Number(cross_section_mm2 || 1);
  if (A <= 0) return 0;
  return (rho * L) / A; // Ω
}

export function anodeResistanceTotal({ anode_resistance_ohm, number_of_anodes, connection }) {
  const R = Number(anode_resistance_ohm || 0);
  const n = Math.max(1, Number(number_of_anodes || 1));
  if (String(connection) === "series") return R * n;
  return R / n; // parallel
}

export function computeCircuit({ length_m, cross_section_mm2, material, anode_resistance_ohm, number_of_anodes, connection, pipeline_resistance_ohm }) {
  const R_cable = cableResistance({ length_m, cross_section_mm2, material });
  const R_anode = anodeResistanceTotal({ anode_resistance_ohm, number_of_anodes, connection });
  const R_pipeline = Number(pipeline_resistance_ohm || 0);
  const R_total = R_cable + R_anode + R_pipeline;
  return { R_cable, R_anode, R_pipeline, R_total };
}
