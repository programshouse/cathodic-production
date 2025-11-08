// Solar Sizing utilities

export function currentToA(value, unit) {
  const v = Number(value || 0);
  return unit === 'mA' ? v / 1000 : v;
}

export function voltageToV(value) {
  const v = Number(value || 0);
  return v;
}

export function hoursToH(value) {
  const v = Number(value || 0);
  return v; // hours assumed
}

export function efficiencyToUnit(value) {
  const v = Number(value || 0);
  // Allow users to enter 0-1 or 0-100; if >1, interpret as percentage
  return v > 1 ? v / 100 : v;
}

export function computeSolarSizing({
  I_req_A = 0,
  V_req_V = 0,
  peak_sun_hours = 0,
  efficiency = 0,
  autonomy_days = 0,
  panel_watt = 0,
}) {
  const Edaily_Wh = Number(I_req_A) * Number(V_req_V) * 24; // Wh/day
  const eff = Math.max(1e-6, efficiencyToUnit(efficiency));
  const PSH = Math.max(1e-6, Number(peak_sun_hours || 0));
  const Ppanel_W = Edaily_Wh / (PSH * eff);
  const Npanels = panel_watt > 0 ? Math.ceil(Ppanel_W / Number(panel_watt)) : 0;
  const Cbatt_Ah = (Edaily_Wh * Number(Math.max(0, autonomy_days))) / (Math.max(1e-6, Number(V_req_V)) * 0.8);

  return {
    Edaily_Wh,
    Ppanel_W,
    Npanels,
    Cbatt_Ah,
  };
}

export function buildCsvRows(results) {
  return [
    { Metric: 'Daily Energy Requirement', Value: Number(results.Edaily_Wh || 0), Unit: 'Wh/day' },
    { Metric: 'Solar Panel Power', Value: Number(results.Ppanel_W || 0), Unit: 'W' },
    { Metric: 'Number of Panels', Value: Number(results.Npanels || 0), Unit: '-' },
    { Metric: 'Battery Capacity', Value: Number(results.Cbatt_Ah || 0), Unit: 'Ah' },
  ];
}

export function buildComponents({ Npanels = 0, panel_watt = 100, V_req_V = 12 }) {
  const qtyPanels = Number(Npanels || 0);
  const components = [
    { component: 'Solar Panel', spec: `${Number(panel_watt||0)}W, ${Number(V_req_V||0)}V`, qty: qtyPanels },
    { component: 'Battery', spec: `${Number(V_req_V||0)}V`, qty: 1 },
    { component: 'Charge Controller', spec: 'PWM/MPPT', qty: 1 },
    { component: 'Mounting Structure', spec: 'Aluminium', qty: 1 },
    { component: 'Wiring and Connectors', spec: 'UV Resistant', qty: 1 },
  ];
  return components;
}
