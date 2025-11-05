export const ENVIRONMENTS = [
  { label: 'Soil', value: 'soil' },
  { label: 'Freshwater', value: 'freshwater' },
  { label: 'Seawater', value: 'seawater' },
];

export const MOISTURE = [
  { label: 'Dry', value: 'dry', factor: 0 },
  { label: 'Moist', value: 'moist', factor: 0.10 },
  { label: 'Wet', value: 'wet', factor: 0.20 },
];

export const CONDITIONS = [
  { label: 'Excellent', value: 'Excellent' },
  { label: 'Good', value: 'Good' },
  { label: 'Fair', value: 'Fair' },
  { label: 'Poor', value: 'Poor' },
];

// Reference tables. Values are ranges [min, max] in mA/m^2 at 25°C
export const TABLES = {
  soil: [
    { condition: 'Excellent', type: 'FBE, 3LPE, 3LPP', range: [0.01, 0.02] },
    { condition: 'Excellent', type: 'Liquid Epoxy', range: [0.01, 0.03] },
    { condition: 'Excellent', type: 'Coal Tar Enamel', range: [0.02, 0.04] },
    { condition: 'Good', type: 'FBE, 3LPE, 3LPP', range: [0.03, 0.05] },
    { condition: 'Good', type: 'Liquid Epoxy', range: [0.03, 0.06] },
    { condition: 'Good', type: 'Coal Tar Enamel', range: [0.04, 0.07] },
    { condition: 'Fair', type: 'Bitumen, Asphalt', range: [0.05, 0.10] },
    { condition: 'Fair', type: 'Coal Tar Enamel', range: [0.06, 0.15] },
    { condition: 'Poor', type: 'Bare Steel/Damaged Coating', range: [0.10, 0.30] },
  ],
  freshwater: [
    { condition: 'Excellent', type: 'FBE, 3LPE, 3LPP', range: [0.10, 0.15] },
    { condition: 'Excellent', type: 'Liquid Epoxy', range: [0.12, 0.18] },
    { condition: 'Good', type: 'Coal Tar Enamel', range: [0.15, 0.25] },
    { condition: 'Good', type: 'Bitumen, Asphalt', range: [0.20, 0.30] },
    { condition: 'Fair', type: 'Any aged/defective coating', range: [0.30, 0.60] },
    { condition: 'Poor', type: 'Bare Steel', range: [1.00, 2.00] },
  ],
  seawater: [
    { condition: 'Excellent', type: 'FBE, 3LPE, 3LPP', range: [0.10, 0.20] },
    { condition: 'Excellent', type: 'Fusion Bonded Epoxy', range: [0.12, 0.22] },
    { condition: 'Good', type: 'Coal Tar Enamel', range: [0.20, 0.35] },
    { condition: 'Good', type: 'Bitumen, Asphalt', range: [0.25, 0.40] },
    { condition: 'Fair', type: 'Any aged/defective coating', range: [0.35, 0.70] },
    { condition: 'Poor', type: 'Bare Steel', range: [1.00, 2.00] },
  ],
};

export function correctedCurrentDensityAtTemp(jd25, temperatureC) {
  // Jd_final = Jd_25C * [1 + 0.02 * (T - 25)]
  const t = Number(temperatureC);
  if (!isFinite(t)) return jd25;
  return jd25 * (1 + 0.02 * (t - 25));
}

export function applyMoistureFactor(jd, moistureValue) {
  const m = MOISTURE.find((x) => x.value === moistureValue);
  const factor = m ? m.factor : 0;
  return jd * (1 + factor);
}

export function midpoint([min, max]) {
  return (Number(min) + Number(max)) / 2;
}
