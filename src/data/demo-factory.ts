// Datos 100 % INVENTADOS para la demo de DandIA: una fábrica ficticia de equipos de cocina.
// Replican la forma de los datos reales (materiales, consumo semanal, proyección con rango,
// órdenes de producción y recetas) sin ningún dato de la empresa real.

export const FACTORY = { es: 'Cocinas Demo (fábrica ficticia)', en: 'Cocinas Demo (fictional factory)' };

export type Material = {
  code: string;
  name: { es: string; en: string };
  unit: { es: string; en: string };
  stock: number;
  weekly: number; // consumo semanal promedio
  leadWeeks: number; // demora del proveedor
  supplier: string;
};

export const MATERIALS: Material[] = [
  { code: 'CH-INOX-08', name: { es: 'Chapa inox 0,8 mm', en: 'Stainless sheet 0.8 mm' }, unit: { es: 'kg', en: 'kg' }, stock: 1850, weekly: 620, leadWeeks: 3, supplier: 'Aceros del Litoral (ficticio)' },
  { code: 'CH-INOX-10', name: { es: 'Chapa inox 1,0 mm', en: 'Stainless sheet 1.0 mm' }, unit: { es: 'kg', en: 'kg' }, stock: 4200, weekly: 410, leadWeeks: 3, supplier: 'Aceros del Litoral (ficticio)' },
  { code: 'CH-GALV-05', name: { es: 'Chapa galvanizada 0,5 mm', en: 'Galvanized sheet 0.5 mm' }, unit: { es: 'kg', en: 'kg' }, stock: 2600, weekly: 300, leadWeeks: 2, supplier: 'Siderúrgica Norte (ficticio)' },
  { code: 'QM-BR-01', name: { es: 'Quemador de bronce', en: 'Bronze burner' }, unit: { es: 'unidades', en: 'units' }, stock: 80, weekly: 64, leadWeeks: 4, supplier: 'Fundición Sur (ficticio)' },
  { code: 'VL-GAS-12', name: { es: 'Válvula de gas 1/2"', en: 'Gas valve 1/2"' }, unit: { es: 'unidades', en: 'units' }, stock: 410, weekly: 70, leadWeeks: 2, supplier: 'Gasvalv (ficticio)' },
  { code: 'PE-ACE-30', name: { es: 'Perfil de acero 30x30', en: 'Steel profile 30x30' }, unit: { es: 'metros', en: 'meters' }, stock: 380, weekly: 150, leadWeeks: 2, supplier: 'Siderúrgica Norte (ficticio)' },
  { code: 'TO-INOX-M6', name: { es: 'Tornillo inox M6', en: 'Stainless screw M6' }, unit: { es: 'unidades', en: 'units' }, stock: 9800, weekly: 1200, leadWeeks: 1, supplier: 'Bulonera Central (ficticio)' },
  { code: 'AI-LANA-25', name: { es: 'Lana mineral 25 mm', en: 'Mineral wool 25 mm' }, unit: { es: 'm²', en: 'm²' }, stock: 140, weekly: 55, leadWeeks: 3, supplier: 'Aislantes Pampa (ficticio)' },
  { code: 'PI-EPOX-NG', name: { es: 'Pintura epoxi negra', en: 'Black epoxy paint' }, unit: { es: 'litros', en: 'liters' }, stock: 210, weekly: 22, leadWeeks: 2, supplier: 'Pinturas Delta (ficticio)' },
  { code: 'PE-PERILLA', name: { es: 'Perilla de baquelita', en: 'Bakelite knob' }, unit: { es: 'unidades', en: 'units' }, stock: 640, weekly: 85, leadWeeks: 2, supplier: 'Plásticos Oeste (ficticio)' },
];

export const PRODUCTS = [
  { code: 'C4', name: { es: 'Cocina industrial 4 hornallas', en: 'Industrial range, 4 burners' } },
  { code: 'C6', name: { es: 'Cocina industrial 6 hornallas', en: 'Industrial range, 6 burners' } },
  { code: 'PL-60', name: { es: 'Plancha bifera 60 cm', en: 'Griddle 60 cm' } },
  { code: 'FR-20', name: { es: 'Freidora 20 litros', en: 'Fryer 20 liters' } },
  { code: 'HP-80', name: { es: 'Horno pizzero 80 cm', en: 'Pizza oven 80 cm' } },
];

// Receta (cantidad por unidad de producto)
export const BOM: Record<string, [string, number][]> = {
  C4: [['CH-INOX-08', 38], ['CH-GALV-05', 12], ['QM-BR-01', 4], ['VL-GAS-12', 5], ['PE-ACE-30', 6], ['TO-INOX-M6', 60], ['AI-LANA-25', 2], ['PE-PERILLA', 5]],
  C6: [['CH-INOX-08', 52], ['CH-GALV-05', 16], ['QM-BR-01', 6], ['VL-GAS-12', 7], ['PE-ACE-30', 8], ['TO-INOX-M6', 80], ['AI-LANA-25', 3], ['PE-PERILLA', 7]],
  'PL-60': [['CH-INOX-10', 22], ['QM-BR-01', 2], ['VL-GAS-12', 2], ['TO-INOX-M6', 24], ['PE-PERILLA', 2]],
  'FR-20': [['CH-INOX-10', 18], ['QM-BR-01', 1], ['VL-GAS-12', 1], ['TO-INOX-M6', 20], ['AI-LANA-25', 1], ['PE-PERILLA', 1]],
  'HP-80': [['CH-INOX-10', 46], ['CH-GALV-05', 20], ['QM-BR-01', 2], ['VL-GAS-12', 2], ['AI-LANA-25', 4], ['PI-EPOX-NG', 3], ['TO-INOX-M6', 50], ['PE-PERILLA', 2]],
};

export const ORDERS = [
  { id: 'OT-1201', product: 'C6', qty: 12, state: 'en_curso', due: 2 },
  { id: 'OT-1202', product: 'C4', qty: 20, state: 'en_curso', due: 1 },
  { id: 'OT-1203', product: 'HP-80', qty: 6, state: 'pendiente', due: 3 },
  { id: 'OT-1204', product: 'PL-60', qty: 15, state: 'pendiente', due: 4 },
  { id: 'OT-1205', product: 'FR-20', qty: 10, state: 'terminada', due: -1 },
  { id: 'OT-1206', product: 'C6', qty: 8, state: 'pendiente', due: 5 },
  { id: 'OT-1207', product: 'C4', qty: 14, state: 'terminada', due: -2 },
] as const;

export const ORDER_STATE = {
  en_curso: { es: 'En curso', en: 'In progress' },
  pendiente: { es: 'Pendiente', en: 'Pending' },
  terminada: { es: 'Terminada', en: 'Finished' },
};

// ── Series generadas de forma determinística (misma salida siempre) ──
function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}
const seedOf = (code: string) => [...code].reduce((s, c) => s + c.charCodeAt(0), 0);

/** Consumo de las últimas `weeks` semanas (la última es la semana actual). */
export function history(m: Material, weeks = 12) {
  const s = seedOf(m.code);
  return Array.from({ length: weeks }, (_, i) => {
    const k = weeks - 1 - i; // semanas hacia atrás
    const season = 1 + 0.18 * Math.sin((i + s) * 0.9);
    const noise = 0.85 + rand(s + i) * 0.3;
    return { week: -k, value: Math.round(m.weekly * season * noise) };
  });
}

/** Proyección de 8 semanas con rango de confianza (calibrado ~90 % en el sistema real). */
export function forecast(m: Material, weeks = 8) {
  const s = seedOf(m.code);
  let stock = m.stock;
  return Array.from({ length: weeks }, (_, i) => {
    const trend = 1 + 0.015 * i;
    const mean = Math.round(m.weekly * trend * (0.95 + rand(s * 3 + i) * 0.1));
    const width = 0.15 + 0.02 * i;
    stock -= mean;
    return { week: i + 1, mean, low: Math.round(mean * (1 - width)), high: Math.round(mean * (1 + width)), stockAfter: stock };
  });
}

export const reorderPoint = (m: Material) => Math.round(m.weekly * m.leadWeeks * 1.2);
export const weeksOfCover = (m: Material) => Math.round((m.stock / m.weekly) * 10) / 10;
export const inAlert = (m: Material) => m.stock <= reorderPoint(m);

const n = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
/** Busca un material por código o por palabras del nombre. */
export function findMaterial(q: string): Material | undefined {
  const t = n(q);
  const byCode = MATERIALS.find((m) => t.includes(n(m.code)));
  if (byCode) return byCode;
  let best: { m: Material; score: number } | undefined;
  for (const m of MATERIALS) {
    const words = [...n(m.name.es).split(/[^a-z0-9,]+/), ...n(m.name.en).split(/[^a-z0-9.]+/)].filter((w) => w.length > 2);
    const score = words.filter((w) => t.includes(w)).length + (t.includes(n(m.name.es).split(' ').slice(-2).join(' ')) ? 1 : 0);
    if (score && (!best || score > best.score)) best = { m, score };
  }
  return best?.m;
}
export const findProduct = (q: string) => {
  const t = n(q);
  const nums = t.match(/\d+/g) ?? [];
  const words = (s: string) => n(s).split(/[^a-z0-9-]+/).filter((w) => w.length > 4);
  let best: { p: (typeof PRODUCTS)[number]; score: number } | undefined;
  for (const p of PRODUCTS) {
    let score = new RegExp(`\\b${n(p.code)}\\b`).test(t) ? 10 : 0;
    score += [...words(p.name.es), ...words(p.name.en)].filter((w) => t.includes(w)).length;
    // "6 hornallas" / "six-burner": el número del nombre desempata entre productos parecidos
    const pn = `${p.name.es} ${p.name.en}`.match(/\d+/g) ?? [];
    if (pn.some((x) => nums.includes(x)) || (/six|seis/.test(t) && pn.includes('6')) || (/four|cuatro/.test(t) && pn.includes('4'))) score += 3;
    if (score && (!best || score > best.score)) best = { p, score };
  }
  return best?.p;
};
