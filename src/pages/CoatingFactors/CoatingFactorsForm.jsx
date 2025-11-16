// Constants and utilities for Coating Factors module

// Table 2 — Typical design coating breakdown factors
// Values use decimal point (e.g., 0.005 ≡ 0,005)
export const COATING_TYPES = [
  { value: "fbe", label: "FBE", initial: 0.0050, annual: 0.0030 },
  { value: "3lpe", label: "3LPE", initial: 0.0010, annual: 0.0003 },
  { value: "3lpp", label: "3LPP", initial: 0.0010, annual: 0.0003 },
  { value: "liquid_epoxy", label: "Liquid epoxy", initial: 0.0080, annual: 0.0100 },
  { value: "coal_tar_urethane", label: "Coal tar urethane", initial: 0.0080, annual: 0.0100 },
];

// Linear model: f_f = f_i + (Δf × t_dl)
export function breakdownFactor({ coatingType, designLifeYears }) {
  const c = COATING_TYPES.find((x) => x.value === coatingType);
  if (!c) throw new Error("Invalid coating type");
  const years = Number(designLifeYears || 0);
  const final = Number(c.initial) + Number(c.annual) * years;
  return { final, initial: c.initial, annual: c.annual };
}

export function seriesOverLife({ coatingType, designLifeYears }) {
  const c = COATING_TYPES.find((x) => x.value === coatingType);
  if (!c) return [];
  const years = Math.max(0, Number(designLifeYears || 0));
  const step = years <= 10 ? 1 : Math.round(years / 10);
  const data = [];
  for (let t = 0; t <= years; t += step) {
    const value = Number(c.initial) + Number(c.annual) * t;
    data.push({ year: t, value });
  }
  if (data[data.length - 1]?.year !== years) {
    data.push({ year: years, value: Number(c.initial) + Number(c.annual) * years });
  }
  return data;
}
