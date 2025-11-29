// Barnes Layer Resistivity utilities
// Wenner apparent resistivity: ρ_a = 2 · π · a · R
// Barnes 3-layer method as per your document/table (with updated equations).

// Units (kept for compatibility with other modules if needed)
export const UNIT = {
  OHM_M: "Ω·m",
  OHM_CM: "Ω·cm",
};

export function toOhmMeter(val, unit = UNIT.OHM_M) {
  const v = Number(val || 0);
  // 1 Ω·cm = 0.01 Ω·m
  return unit === UNIT.OHM_CM ? v / 100 : v;
}

export function fromOhmMeter(val, unit = UNIT.OHM_M) {
  const v = Number(val || 0);
  return unit === UNIT.OHM_CM ? v * 100 : v;
}

// Wenner apparent resistivity ρ_a for a single spacing
export function computeApparentResistivity({ spacing_m, measured_R_ohm }) {
  const a = Number(spacing_m || 0);
  const R = Number(measured_R_ohm || 0);
  const rho_a = 2 * Math.PI * a * R; // Ω·m
  return rho_a;
}

// (Kept for compatibility; not used directly by the 3-layer routine)
export function buildSpacingTable({
  increments = [0.5, 1, 1.5, 3, 6, 9, 12, 15, 18, 21, 24, 27],
  measured_R_ohm = 1,
}) {
  const rows = [];
  increments.forEach((inc) => {
    const a = Number(inc);
    const rho_a = computeApparentResistivity({
      spacing_m: a,
      measured_R_ohm,
    });
    const depth_m = 0.75 * a; // simple Wenner depth approximation
    rows.push({
      spacing_m: a,
      R_meas_ohm: Number(measured_R_ohm || 0),
      rho_app_ohm_m: rho_a,
      depth_m,
    });
  });
  return rows;
}

// ---- Barnes 3-layer core calculation ----
//
// Inputs expected (from form):
//   a1, a2, a3  : electrode spacings (m)
//   R1, R2, R3  : measured resistances at each spacing (Ω)
//
// Step 2: Layer depths
//   L1 = a1
//   L2 = a2 − a1
//   L3 = a3 − a2
//
// Step 3: Layer resistances (UPDATED):
//   RL1 = R1
//   RL2 = (R1 R2)/(R1 − R2)
//   RL3 = (R2 R3)/(R2 − R3)
//
// Step 4: Layer resistivities
//   ρLᵢ = 2 π a1 RLᵢ
//
export function computeBarnesLayers(inputs) {
  const a1 = Number(inputs.a1 || 0);
  const a2 = Number(inputs.a2 || 0);
  const a3 = Number(inputs.a3 || 0);

  const R1 = Number(inputs.R1 || 0);
  const R2 = Number(inputs.R2 || 0);
  const R3 = Number(inputs.R3 || 0);

  // Layer depths
  const L1 = a1;
  const L2 = a2 - a1;
  const L3 = a3 - a2;

  const safeDiv = (num, den) =>
    Math.abs(den) < 1e-12 ? 0 : num / den;

  // Layer resistances (UPDATED equations)
  const RL1 = R1;
  const RL2 = safeDiv(R1 * R2, R1 - R2);
  const RL3 = safeDiv(R2 * R3, R2 - R3); // ✅ corrected to R2·R3

  // Layer resistivities (all using a1, as in the document)
  const rhoL1 = 2 * Math.PI * a1 * RL1;
  const rhoL2 = 2 * Math.PI * a1 * RL2;
  const rhoL3 = 2 * Math.PI * a1 * RL3;

  const layers = [
    {
      layer: "Layer 1",
      L: L1,
      depth_m: L1,
      resistance_ohm: RL1,
      RL: RL1,
      resistivity_ohm_m: rhoL1,
      rho_ohm_m: rhoL1,
      rho: rhoL1,
    },
    {
      layer: "Layer 2",
      L: L2,
      depth_m: L2,
      resistance_ohm: RL2,
      RL: RL2,
      resistivity_ohm_m: rhoL2,
      rho_ohm_m: rhoL2,
      rho: rhoL2,
    },
    {
      layer: "Layer 3",
      L: L3,
      depth_m: L3,
      resistance_ohm: RL3,
      RL: RL3,
      resistivity_ohm_m: rhoL3,
      rho_ohm_m: rhoL3,
      rho: rhoL3,
    },
  ];

  return {
    inputs: { ...inputs },
    layers,
  };
}

// Alias to keep older imports working if you had them
export const computeBarnesSingleLayer = computeBarnesLayers;
