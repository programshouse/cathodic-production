// Tank MMO Anode Sizing utilities

export function lengthToM(value, unit) {
  const v = Number(value || 0);
  if (unit === 'ft') return v * 0.3048;
  if (unit === 'cm') return v / 100;
  return v;
}

export function currentToA(value, unit) {
  const v = Number(value || 0);
  return unit === 'mA' ? v / 1000 : v;
}

export function computeTankMMO({
  diameter_m = 0,
  tank_length_m = 0,
  install_type = 'rings', // 'rings' | 'longitudinal'
  spacing_m = 1,
  nrings_manual = 0,
  num_bars = 1,
  connection_length_m = 0,
  Itotal_A = 0,
  Iconnector_max_A = 10,
}) {
  const D = Math.max(0, Number(diameter_m || 0));
  const L = Math.max(0, Number(tank_length_m || 0));
  const s = Math.max(1e-6, Number(spacing_m || 1));
  const C = Math.PI * D; // circumference

  let Nribbons = 0;
  let Lribbon_total_m = 0;

  if (install_type === 'rings') {
    const Nrings = nrings_manual > 0 ? Math.ceil(Number(nrings_manual)) : Math.ceil(L / s);
    Nribbons = Nrings; // number of rings equals number of ribbon loops
    Lribbon_total_m = Nrings * C;
  } else {
    // longitudinal: straight ribbons
    Nribbons = Math.ceil(C / s);
    Lribbon_total_m = Nribbons * L;
  }

  const L_ti_bar_m = Math.max(0, Number(num_bars || 0)) * Math.max(0, Number(connection_length_m || 0));
  const N_feeders = Math.ceil(Math.max(0, Number(Itotal_A || 0)) / Math.max(1e-6, Number(Iconnector_max_A || 1)));

  return {
    C_m: C,
    Nribbons,
    Lribbon_total_m,
    L_ti_bar_m,
    N_feeders,
  };
}

export function buildCsvRows(results) {
  return [
    { Metric: 'Tank Circumference', Value: Number(results.C_m || 0), Unit: 'm' },
    { Metric: 'Number of Ribbons', Value: Number(results.Nribbons || 0), Unit: '-' },
    { Metric: 'Total Ribbon Length', Value: Number(results.Lribbon_total_m || 0), Unit: 'm' },
    { Metric: 'Ti Bar Length', Value: Number(results.L_ti_bar_m || 0), Unit: 'm' },
    { Metric: 'Power Feeder Connectors', Value: Number(results.N_feeders || 0), Unit: '-' },
  ];
}
