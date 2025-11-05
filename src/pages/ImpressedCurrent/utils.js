// Calculation utilities for Impressed Current System

export const ANODE_TYPES = [
  { value: "FeSiCr", label: "FeSiCr (weight-based)" },
  { value: "MMO", label: "MMO (current-based)" },
];

export const ENVIRONMENTS = [
  { value: "soil", label: "Soil/Groundbed" },
  { value: "seawater", label: "Seawater" },
];

export const UNIT_WEIGHTS_KG = [14, 21, 50];

export function computeRequiredCurrent({ area_m2, jd_mA_per_m2, coating_factor }) {
  const I_mA = Number(area_m2 || 0) * Number(jd_mA_per_m2 || 0) * Number(coating_factor || 1);
  return { I_mA, I_A: I_mA / 1000 };
}

export function computeElectrical({ I_A, R_ohm, E_target_V, E_native_V }) {
  const IR_drop = Number(I_A || 0) * Number(R_ohm || 0);
  const deltaE = Number(E_target_V || 0) - Number(E_native_V || 0);
  const V_system = IR_drop + deltaE;
  const P_W = V_system * Number(I_A || 0);
  const E_annual_kWh = (P_W * 8760) / 1000;
  return { V_system, P_W, E_annual_kWh };
}

// FeSiCr (weight-based)
export function computeFeSiCr({ I_A, design_life_years, capacity_Ah_per_kg, eta, unit_weight_kg, safety_factor }) {
  const U = Number(capacity_Ah_per_kg || 0);
  const etaVal = Number(eta || 0.5);
  const t = Number(design_life_years || 0);
  const W_required = (Number(I_A || 0) * t * 8760) / (U * etaVal);
  const W_single = Number(unit_weight_kg || 1);
  const SF = Number(safety_factor || 1.1);
  const N = W_single > 0 ? (W_required / W_single) * SF : 0;
  return { W_required, W_single, N };
}

// MMO (current-based)
export function computeMMO({ I_A, I_single_A, safety_factor }) {
  const Is = Number(I_single_A || 1);
  const SF = Number(safety_factor || 1.1);
  const N = Is > 0 ? (Number(I_A || 0) / Is) * SF : 0;
  return { I_single_A: Is, N };
}

export function lifeSeriesWeightVsYears({ I_A, years_max = 30, capacity_Ah_per_kg, eta }) {
  const U = Number(capacity_Ah_per_kg || 0);
  const etaVal = Number(eta || 0.5);
  const data = [];
  for (let y = 1; y <= Math.max(1, years_max); y++) {
    const W = (Number(I_A || 0) * y * 8760) / (U * etaVal);
    data.push({ year: y, weight_kg: W });
  }
  return data;
}

export function computeImpressed(inputs) {
  const { I_mA, I_A } = computeRequiredCurrent(inputs);
  const electrical = computeElectrical({ I_A, R_ohm: inputs.R_ohm, E_target_V: inputs.E_target_V, E_native_V: inputs.E_native_V });

  let anode = null;
  let series = null;
  if (inputs.anode_type === "FeSiCr") {
    anode = computeFeSiCr({
      I_A,
      design_life_years: inputs.design_life_years,
      capacity_Ah_per_kg: inputs.capacity_Ah_per_kg,
      eta: inputs.eta,
      unit_weight_kg: inputs.unit_weight_kg,
      safety_factor: inputs.safety_factor,
    });
    series = lifeSeriesWeightVsYears({ I_A, years_max: Math.max(5, inputs.design_life_years || 30), capacity_Ah_per_kg: inputs.capacity_Ah_per_kg, eta: inputs.eta });
  } else if (inputs.anode_type === "MMO") {
    anode = computeMMO({ I_A, I_single_A: inputs.I_single_A, safety_factor: inputs.safety_factor });
  }

  return { I_mA, I_A, ...electrical, anode, series };
}
