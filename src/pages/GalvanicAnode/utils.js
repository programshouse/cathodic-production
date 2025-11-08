// Utilities for Galvanic Anode System Calculation
// Equations
// I (A) = A (m^2) × Jd (A/m^2) × f_c
// W_required (kg) = I × t(years) × 8760 (h/yr) / (U (Ah/kg) × eta)
// N = W_required / W_single

export const MATERIALS = [
  { value: "aluminum", label: "Aluminum", capacity_Ah_per_kg: 2800, eta_default: 0.90, potential_V: -1.05, density_g_cm3: 2.70, environment: "Seawater/Soil" },
  { value: "zinc", label: "Zinc", capacity_Ah_per_kg: 780, eta_default: 0.90, potential_V: -1.03, density_g_cm3: 7.13, environment: "Seawater/Soil" },
  { value: "magnesium", label: "Magnesium", capacity_Ah_per_kg: 1200, eta_default: 0.50, potential_V: -1.55, density_g_cm3: 1.74, environment: "Soil/Freshwater/Seawater" },
];

export function computeGalvanic({ area_m2, jd_mA_per_m2, design_life_years, material, eta, anode_weight_kg }) {
  const m = MATERIALS.find(x => x.value === material) || MATERIALS[0];
  const U = Number(m.capacity_Ah_per_kg);
  const etaEff = Number(eta || m.eta_default);

  const A_m2 = Number(area_m2 || 0);
  const jd_A_per_m2 = Number(jd_mA_per_m2 || 0) / 1000; // mA/m2 -> A/m2
  // Coating factor fixed to 1 per requirement
  const fc = 1;
  const t_years = Number(design_life_years || 0);
  const W_single = Number(anode_weight_kg || 1);

  const I = A_m2 * jd_A_per_m2 * fc; // A
  const W_required = (I * t_years * 8760) / (U * etaEff); // kg
  const N = W_single > 0 ? (W_required / W_single) : 0;

  return { I, W_required, N, U, etaEff };
}

export function lifeSeries({ area_m2, jd_mA_per_m2, years_max = 30, material, eta, anode_weight_kg }) {
  const points = [];
  for (let y = 0; y <= years_max; y += Math.max(1, Math.floor(years_max / 10))) {
    const { W_required } = computeGalvanic({ area_m2, jd_mA_per_m2, coating_factor: 1, design_life_years: y, material, eta, anode_weight_kg });
    points.push({ year: y, weight: W_required });
  }
  if (points[points.length - 1]?.year !== years_max) {
    const { W_required } = computeGalvanic({ area_m2, jd_mA_per_m2, coating_factor: 1, design_life_years: years_max, material, eta, anode_weight_kg });
    points.push({ year: years_max, weight: W_required });
  }
  return points;
}
