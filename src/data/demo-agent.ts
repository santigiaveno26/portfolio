// Base de conocimiento de la DEMO del agente de WhatsApp.
// Empresa y productos 100 % ficticios: replican la estructura del caso real
// (dos líneas de producto, contenido comercial abierto y técnico protegido)
// sin datos ni nombres del cliente.

import type { Lang } from './profile';

export type Product = 'PF-200' | 'BV-50';
export type Level = 'comercial' | 'tecnico' | 'empresa';
export type Doc = { id: string; product: Product | 'empresa'; level: Level; title: { es: string; en: string }; text: { es: string; en: string } };

export const COMPANY = { es: 'Metalúrgica Demo (empresa ficticia)', en: 'Metalúrgica Demo (fictional company)' };

export const PRODUCTS: Record<Product, { es: string; en: string }> = {
  'PF-200': { es: 'Picadora de forraje PF-200 (línea agro)', en: 'PF-200 forage chopper (farm line)' },
  'BV-50': { es: 'Barredora vial BV-50 (línea urbana)', en: 'BV-50 street sweeper (urban line)' },
};

// "Base de datos" de propietarios: en el sistema real es una tabla consultada por código.
export const OWNERS: Record<string, Product> = { 'PF-200-1001': 'PF-200', 'BV-50-2002': 'BV-50' };

const d = (id: string, product: Doc['product'], level: Level, titleEs: string, titleEn: string, es: string, en: string): Doc => ({
  id, product, level, title: { es: titleEs, en: titleEn }, text: { es, en },
});

export const DOCS: Doc[] = [
  // ── PF-200 · comercial ──
  d('pf-que-es', 'PF-200', 'comercial', 'Qué es la PF-200', 'What the PF-200 is',
    'La PF-200 es una picadora de forraje de arrastre para tambos y feedlots chicos y medianos. Pica pasturas, maíz y sorgo para silo o para dar fresco. Se acopla al tractor por la toma de fuerza (540 rpm) y necesita un tractor de 60 HP o más.',
    'The PF-200 is a tow-behind forage chopper for small and mid-size dairy and feedlot farms. It chops pasture, corn and sorghum for silage or fresh feed. It hitches to the tractor PTO (540 rpm) and needs a 60 HP tractor or larger.'),
  d('pf-capacidad', 'PF-200', 'comercial', 'Capacidad y rendimiento', 'Capacity and performance',
    'Procesa hasta 12 toneladas por hora según el cultivo y la humedad. El largo de picado se regula entre 5 y 25 mm. Tiene tolva con descarga lateral orientable 180°.',
    'It processes up to 12 tons per hour depending on the crop and moisture. Cut length is adjustable from 5 to 25 mm. It has a hopper with a 180° adjustable side discharge.'),
  d('pf-compra', 'PF-200', 'comercial', 'Precio, financiación y dónde comprar', 'Price, financing and where to buy',
    'El precio se cotiza según configuración. Hay financiación de hasta 12 cuotas y se vende a través de concesionarios en Santa Fe, Córdoba y Buenos Aires. Para una cotización, un asesor comercial se contacta con el cliente.',
    'Pricing depends on the configuration. Financing of up to 12 installments is available, sold through dealers in Santa Fe, Córdoba and Buenos Aires. For a quote, a sales advisor contacts the customer.'),
  d('pf-garantia', 'PF-200', 'comercial', 'Garantía', 'Warranty',
    'La PF-200 tiene 12 meses de garantía de fábrica contra defectos de fabricación. La garantía no cubre cuchillas ni correas, que son piezas de desgaste.',
    'The PF-200 has a 12-month factory warranty against manufacturing defects. It does not cover blades or belts, which are wear parts.'),

  // ── PF-200 · técnico (solo propietarios) ──
  d('pf-mantenimiento', 'PF-200', 'tecnico', 'Plan de mantenimiento PF-200', 'PF-200 maintenance plan',
    'Cada 8 horas de uso: engrasar los 6 puntos marcados en amarillo (rodamientos del rotor y cardán). Cada 50 horas: revisar el filo de las cuchillas y la tensión de correas. Cada 200 horas: cambiar el aceite de la caja (SAE 80W-90, 2,5 litros).',
    'Every 8 hours of use: grease the 6 points marked in yellow (rotor bearings and driveshaft). Every 50 hours: check blade sharpness and belt tension. Every 200 hours: change the gearbox oil (SAE 80W-90, 2.5 liters).'),
  d('pf-cuchillas', 'PF-200', 'tecnico', 'Afilado y calibración de cuchillas', 'Blade sharpening and calibration',
    'Las 8 cuchillas se afilan con piedra a 30°. Después de afilar, calibrar la luz contra la contracuchilla a 0,5 mm con la galga incluida, aflojando los 2 bulones M12 de cada soporte. Siempre afilar el juego completo para mantener el rotor balanceado.',
    'The 8 blades are sharpened with a stone at 30°. After sharpening, set the gap against the counter-blade to 0.5 mm with the included feeler gauge, loosening the 2 M12 bolts on each holder. Always sharpen the full set to keep the rotor balanced.'),
  d('pf-vibracion', 'PF-200', 'tecnico', 'Diagnóstico: vibración excesiva', 'Troubleshooting: excessive vibration',
    'Si la PF-200 vibra más de lo normal: 1) detener la toma de fuerza; 2) revisar si falta o está partida alguna cuchilla (desbalancea el rotor); 3) verificar que el cardán no tenga juego; 4) revisar los rodamientos del rotor. Si persiste, no seguir usando la máquina y pedir servicio técnico.',
    'If the PF-200 vibrates more than usual: 1) stop the PTO; 2) check for a missing or broken blade (it unbalances the rotor); 3) check the driveshaft for play; 4) inspect the rotor bearings. If it persists, stop using the machine and request technical service.'),
  d('pf-correas', 'PF-200', 'tecnico', 'Tensión de correas y repuestos', 'Belt tension and spare parts',
    'Tensión correcta: la correa debe flexionar 10 mm con presión del pulgar. Repuestos frecuentes: juego de cuchillas PF-R-08, correa B-68 (x2), rodamiento 6208-2RS. Se piden con el número de serie de la máquina.',
    'Correct tension: the belt should flex 10 mm under thumb pressure. Common spare parts: blade set PF-R-08, B-68 belt (x2), 6208-2RS bearing. Order them with the machine serial number.'),

  // ── BV-50 · comercial ──
  d('bv-que-es', 'BV-50', 'comercial', 'Qué es la BV-50', 'What the BV-50 is',
    'La BV-50 es una barredora y aspiradora remolcable para municipios, parques industriales y predios grandes. Junta hojas, papeles, botellas y residuos livianos de calles, veredas y plazas. Se remolca con camioneta o tractor chico.',
    'The BV-50 is a towable sweeper and vacuum for municipalities, industrial parks and large sites. It collects leaves, paper, bottles and light waste from streets, sidewalks and parks. It can be towed by a pickup or a small tractor.'),
  d('bv-capacidad', 'BV-50', 'comercial', 'Capacidad y motor', 'Capacity and engine',
    'Tiene un contenedor de 4,5 m³ con descarga hidráulica y motor propio naftero de 25 HP, así que no depende del vehículo que la remolca. Barre un ancho de 2,2 metros.',
    'It has a 4.5 m³ container with hydraulic dumping and its own 25 HP gasoline engine, so it does not depend on the towing vehicle. Sweeping width is 2.2 meters.'),
  d('bv-compra', 'BV-50', 'comercial', 'Compra y licitaciones', 'Purchasing and public tenders',
    'La BV-50 se vende directo de fábrica a municipios y empresas, y participa en licitaciones públicas. Se entrega con capacitación para los operarios. Para una cotización, un asesor comercial se contacta con el cliente.',
    'The BV-50 is sold factory-direct to municipalities and companies, and takes part in public tenders. Delivery includes operator training. For a quote, a sales advisor contacts the customer.'),

  // ── BV-50 · técnico (solo propietarios) ──
  d('bv-mantenimiento', 'BV-50', 'tecnico', 'Plan de mantenimiento BV-50', 'BV-50 maintenance plan',
    'Diario: limpiar el filtro de aire del motor y vaciar el contenedor. Cada 50 horas: cambiar el aceite del motor (SAE 10W-30, 1,7 litros) y revisar las escobillas laterales. Cada 100 horas: revisar el nivel de aceite hidráulico y las mangueras.',
    'Daily: clean the engine air filter and empty the container. Every 50 hours: change engine oil (SAE 10W-30, 1.7 liters) and check the side brushes. Every 100 hours: check the hydraulic oil level and hoses.'),
  d('bv-succion', 'BV-50', 'tecnico', 'Diagnóstico: pierde succión', 'Troubleshooting: loss of suction',
    'Si la BV-50 pierde succión: 1) revisar que la tapa del contenedor cierre bien (el burlete gastado deja entrar aire); 2) buscar obstrucciones en la manguera de 200 mm; 3) controlar que la turbina gire a 3.200 rpm; 4) revisar el filtro de malla del contenedor.',
    'If the BV-50 loses suction: 1) check that the container lid seals properly (a worn gasket lets air in); 2) look for blockages in the 200 mm hose; 3) check that the turbine spins at 3,200 rpm; 4) inspect the container mesh filter.'),
  d('bv-escobillas', 'BV-50', 'tecnico', 'Ajuste de escobillas', 'Brush adjustment',
    'La altura de las escobillas se ajusta con la manivela lateral: deben tocar el suelo con un apoyo de 3 a 5 cm. Si dejan franjas sin barrer, igualar la altura de ambos lados. Repuesto: escobilla lateral BV-E-60.',
    'Brush height is adjusted with the side crank: they should touch the ground with 3 to 5 cm of contact. If they leave unswept strips, match the height on both sides. Spare part: side brush BV-E-60.'),

  // ── Empresa ──
  d('emp-horarios', 'empresa', 'empresa', 'Horarios y atención', 'Hours and support',
    'Atención comercial de lunes a viernes de 8 a 17 h. El servicio técnico atiende urgencias de cosecha también los sábados de 8 a 12 h. Este asistente responde las 24 horas.',
    'Sales support Monday to Friday, 8 am to 5 pm. Technical service also handles harvest emergencies on Saturdays, 8 am to noon. This assistant answers 24/7.'),
  d('emp-ubicacion', 'empresa', 'empresa', 'Ubicación y envíos', 'Location and shipping',
    'La fábrica está en un parque industrial de la provincia de Santa Fe, Argentina. Se envían máquinas y repuestos a todo el país.',
    'The factory is in an industrial park in Santa Fe province, Argentina. Machines and spare parts ship nationwide.'),
  d('emp-quienes', 'empresa', 'empresa', 'Quiénes somos', 'About the company',
    'Metalúrgica Demo es una empresa ficticia creada para esta demostración. Fabrica dos líneas: maquinaria agrícola (PF-200) y equipos urbanos (BV-50).',
    'Metalúrgica Demo is a fictional company created for this demo. It builds two lines: farm machinery (PF-200) and urban equipment (BV-50).'),
];

// ── Búsqueda BM25 (léxica). En producción el sistema real usa embeddings multilingües en ChromaDB. ──
const STOP = new Set('de la el en y a los las que un una por con para del al es se su sus lo como mas o the of and to in on for with is are what que cual cuales tiene sobre about does did you your me mi tu which this that has have how hay como mi maquina machine'.split(' '));
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]/g, ' ');
const stem = (w: string) => w.replace(/(es|s)$/, '');
const tok = (s: string) => norm(s).split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w)).map(stem);

export function search(query: string, lang: Lang, filter: (doc: Doc) => boolean, k = 2) {
  const docs = DOCS.filter(filter);
  if (!docs.length) return [];
  const toks = docs.map((doc) => tok(doc.title[lang] + ' ' + doc.text[lang]));
  const avg = toks.reduce((s, t) => s + t.length, 0) / toks.length;
  const q = [...new Set(tok(query))];
  const df = (w: string) => toks.filter((t) => t.includes(w)).length;
  const K1 = 1.4, B = 0.75, N = docs.length;
  return docs
    .map((doc, i) => {
      const t = toks[i];
      const score = q.reduce((s, w) => {
        const f = t.filter((x) => x === w).length;
        if (!f) return s;
        const idf = Math.log(1 + (N - df(w) + 0.5) / (df(w) + 0.5));
        return s + idf * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * t.length) / avg)));
      }, 0);
      return { doc, score: Math.round(score * 100) / 100 };
    })
    .filter((r) => r.score > 0.3)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
