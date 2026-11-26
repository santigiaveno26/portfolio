import type { APIRoute } from 'astro';
import {
  BOM, FACTORY, MATERIALS, ORDERS, ORDER_STATE, PRODUCTS,
  findMaterial, findProduct, forecast, history, inAlert, reorderPoint, weeksOfCover, type Material,
} from '../../data/demo-factory';
import type { Lang } from '../../data/profile';
import { clientIp, env, geminiGenerate, json, rateLimited, textOf, type GeminiContent, type GeminiPart } from '../../lib/server';

export const prerender = false;

// ── Lo que se muestra en el chat además del texto ──
type Chart = { kind: 'line' | 'bar' | 'pie'; title: string; labels: string[]; series: { name: string; values: number[] }[]; band?: { low: number[]; high: number[] }; unit?: string };
type Table = { title: string; columns: string[]; rows: (string | number)[][] };
type Kpi = { label: string; value: string; hint?: string; tone?: 'ok' | 'warn' | 'bad' };
type Visuals = { charts: Chart[]; tables: Table[]; kpis: Kpi[] };
type Step = { tool: string; args: Record<string, unknown>; detail: string };

const fmt = (x: number, lang: Lang) => x.toLocaleString(lang === 'es' ? 'es-AR' : 'en-US');
const wk = (w: number, lang: Lang) => (w === 0 ? (lang === 'es' ? 'actual' : 'now') : w > 0 ? `+${w}` : `${w}`);

function materialRow(m: Material, lang: Lang) {
  return {
    codigo: m.code, material: m.name[lang], stock: m.stock, unidad: m.unit[lang], consumo_semanal: m.weekly,
    punto_de_pedido: reorderPoint(m), semanas_de_cobertura: weeksOfCover(m), demora_proveedor_semanas: m.leadWeeks,
    proveedor: m.supplier, en_alerta: inAlert(m),
  };
}

// ── Herramientas (todas de solo lectura sobre los datos de la demo) ──
const TOOLS = [
  { name: 'stock_materiales', description: 'Stock, consumo semanal, punto de pedido, semanas de cobertura y proveedor. filtro="alerta" devuelve solo los materiales que hay que reponer.', parameters: { type: 'object', properties: { filtro: { type: 'string', enum: ['todos', 'alerta'] }, material: { type: 'string', description: 'código o nombre (opcional)' } } } },
  { name: 'proyeccion_material', description: 'Proyección de consumo de las próximas 8 semanas de un material, con rango de confianza y stock resultante. Muestra automáticamente un gráfico de línea al usuario.', parameters: { type: 'object', properties: { material: { type: 'string' } }, required: ['material'] } },
  { name: 'consumo_historico', description: 'Consumo real de las últimas semanas de un material. Muestra automáticamente un gráfico de barras.', parameters: { type: 'object', properties: { material: { type: 'string' }, semanas: { type: 'integer' } }, required: ['material'] } },
  { name: 'ordenes_produccion', description: 'Órdenes de producción (OT) con producto, cantidad, estado y semanas hasta la entrega.', parameters: { type: 'object', properties: { estado: { type: 'string', enum: ['todas', 'en_curso', 'pendiente', 'terminada'] } } } },
  { name: 'receta_producto', description: 'Materiales que lleva un producto por unidad, y si alcanza el stock para una cantidad dada.', parameters: { type: 'object', properties: { producto: { type: 'string' }, cantidad: { type: 'integer' } }, required: ['producto'] } },
  { name: 'generar_tabla', description: 'Muestra una tabla al usuario. Usala para listas de 3 o más registros con varios campos. Los valores deben salir de datos ya consultados.', parameters: { type: 'object', properties: { titulo: { type: 'string' }, columnas: { type: 'array', items: { type: 'string' } }, filas: { type: 'array', items: { type: 'array', items: { type: 'string' } } } }, required: ['titulo', 'columnas', 'filas'] } },
  { name: 'generar_kpi', description: 'Muestra de 1 a 4 tarjetas con números clave. Los valores deben salir de datos ya consultados.', parameters: { type: 'object', properties: { items: { type: 'array', items: { type: 'object', properties: { etiqueta: { type: 'string' }, valor: { type: 'string' }, ayuda: { type: 'string' }, tono: { type: 'string', enum: ['ok', 'warn', 'bad'] } }, required: ['etiqueta', 'valor'] } } }, required: ['items'] } },
  { name: 'generar_grafico', description: 'Muestra un gráfico de barras o de torta para comparar valores ya consultados (por ejemplo, stock de varios materiales).', parameters: { type: 'object', properties: { tipo: { type: 'string', enum: ['bar', 'pie'] }, titulo: { type: 'string' }, etiquetas: { type: 'array', items: { type: 'string' } }, valores: { type: 'array', items: { type: 'number' } } }, required: ['tipo', 'titulo', 'etiquetas', 'valores'] } },
];

function runTool(name: string, a: any, lang: Lang, v: Visuals, trace: Step[]): Record<string, unknown> {
  const es = lang === 'es';
  const notFound = (q: string) => ({ error: `No encontré "${q}". Materiales: ${MATERIALS.map((m) => m.code + ' ' + m.name.es).join('; ')}` });
  switch (name) {
    case 'stock_materiales': {
      let list = MATERIALS;
      if (a?.material) { const m = findMaterial(String(a.material)); list = m ? [m] : []; if (!m) { trace.push({ tool: name, args: a, detail: 'material no encontrado' }); return notFound(String(a.material)); } }
      if (a?.filtro === 'alerta') list = list.filter(inAlert);
      trace.push({ tool: name, args: a ?? {}, detail: `${list.length} material(es)` });
      return { materiales: list.map((m) => materialRow(m, lang)) };
    }
    case 'proyeccion_material': {
      const m = findMaterial(String(a?.material ?? ''));
      if (!m) { trace.push({ tool: name, args: a, detail: 'material no encontrado' }); return notFound(String(a?.material)); }
      const f = forecast(m);
      const firstBreak = f.find((x) => x.stockAfter < 0);
      v.charts.push({
        kind: 'line', title: es ? `Proyección de consumo · ${m.name.es}` : `Usage forecast · ${m.name.en}`,
        labels: f.map((x) => (es ? 'Sem ' : 'Wk ') + wk(x.week, lang)),
        series: [{ name: es ? 'Consumo proyectado' : 'Projected usage', values: f.map((x) => x.mean) }],
        band: { low: f.map((x) => x.low), high: f.map((x) => x.high) }, unit: m.unit[lang],
      });
      trace.push({ tool: name, args: a, detail: `8 semanas · gráfico generado${firstBreak ? ` · quiebre en semana +${firstBreak.week}` : ''}` });
      return {
        material: m.code, unidad: m.unit[lang], stock_actual: m.stock, demora_proveedor_semanas: m.leadWeeks,
        semanas: f, quiebre_de_stock_en_semana: firstBreak?.week ?? null,
        nota: 'El gráfico ya se le mostró al usuario. Explicá en lenguaje simple y, si hay quiebre antes de la demora del proveedor, recomendá pedir ya.',
      };
    }
    case 'consumo_historico': {
      const m = findMaterial(String(a?.material ?? ''));
      if (!m) { trace.push({ tool: name, args: a, detail: 'material no encontrado' }); return notFound(String(a?.material)); }
      const weeks = Math.min(16, Math.max(4, Number(a?.semanas) || 12));
      const h = history(m, weeks);
      v.charts.push({ kind: 'bar', title: es ? `Consumo real · ${m.name.es}` : `Actual usage · ${m.name.en}`, labels: h.map((x) => (es ? 'Sem ' : 'Wk ') + wk(x.week, lang)), series: [{ name: m.unit[lang], values: h.map((x) => x.value) }], unit: m.unit[lang] });
      trace.push({ tool: name, args: a, detail: `${weeks} semanas · gráfico generado` });
      const vals = h.map((x) => x.value);
      return { material: m.code, unidad: m.unit[lang], semanas: h, promedio: Math.round(vals.reduce((s, x) => s + x, 0) / vals.length), maximo: Math.max(...vals), minimo: Math.min(...vals), nota: 'El gráfico ya se le mostró al usuario.' };
    }
    case 'ordenes_produccion': {
      const st = a?.estado && a.estado !== 'todas' ? a.estado : null;
      const list = ORDERS.filter((o) => !st || o.state === st);
      trace.push({ tool: name, args: a ?? {}, detail: `${list.length} orden(es)` });
      return { ordenes: list.map((o) => ({ ot: o.id, producto: PRODUCTS.find((p) => p.code === o.product)!.name[lang], cantidad: o.qty, estado: ORDER_STATE[o.state][lang], semanas_hasta_entrega: o.due })) };
    }
    case 'receta_producto': {
      const p = findProduct(String(a?.producto ?? ''));
      if (!p) { trace.push({ tool: name, args: a, detail: 'producto no encontrado' }); return { error: `Productos: ${PRODUCTS.map((x) => x.code + ' ' + x.name.es).join('; ')}` }; }
      const qty = Math.max(1, Number(a?.cantidad) || 1);
      const rows = BOM[p.code].map(([code, per]) => {
        const m = MATERIALS.find((x) => x.code === code)!;
        return { material: m.name[lang], por_unidad: per, necesario: per * qty, stock: m.stock, unidad: m.unit[lang], alcanza: m.stock >= per * qty };
      });
      trace.push({ tool: name, args: a, detail: `${rows.length} materiales · ${rows.filter((r) => !r.alcanza).length} no alcanzan` });
      return { producto: p.name[lang], cantidad: qty, materiales: rows };
    }
    case 'generar_tabla': {
      const cols = (a?.columnas ?? []).slice(0, 8).map(String);
      const rows = (a?.filas ?? []).slice(0, 30).filter((r: any) => Array.isArray(r) && r.length === cols.length).map((r: any[]) => r.map(String));
      if (cols.length && rows.length) v.tables.push({ title: String(a?.titulo ?? ''), columns: cols, rows });
      trace.push({ tool: name, args: { titulo: a?.titulo }, detail: `${rows.length} filas` });
      return { mostrado: rows.length > 0 };
    }
    case 'generar_kpi': {
      const items = (a?.items ?? []).slice(0, 4).map((k: any) => ({ label: String(k.etiqueta), value: String(k.valor), hint: k.ayuda ? String(k.ayuda) : undefined, tone: ['ok', 'warn', 'bad'].includes(k.tono) ? k.tono : undefined }));
      v.kpis.push(...items);
      trace.push({ tool: name, args: {}, detail: `${items.length} tarjeta(s)` });
      return { mostrado: items.length > 0 };
    }
    case 'generar_grafico': {
      const labels = (a?.etiquetas ?? []).slice(0, 12).map(String);
      const values = (a?.valores ?? []).slice(0, 12).map(Number);
      const ok = labels.length && labels.length === values.length && values.every((x: number) => Number.isFinite(x));
      if (ok) v.charts.push({ kind: a?.tipo === 'pie' ? 'pie' : 'bar', title: String(a?.titulo ?? ''), labels, series: [{ name: '', values }] });
      trace.push({ tool: name, args: { tipo: a?.tipo, titulo: a?.titulo }, detail: ok ? `${labels.length} valores` : 'datos inválidos, descartado' });
      return { mostrado: !!ok };
    }
  }
  return { error: 'herramienta desconocida' };
}

function systemPrompt(lang: Lang) {
  return `Sos DandIA, el asistente de datos de ${FACTORY.es}, fábrica de equipos de cocina industrial. Respondés a la gerencia sobre stock, compras, consumo y producción.

Reglas:
- Respondé en el idioma del usuario (por defecto ${lang === 'es' ? 'español rioplatense' : 'inglés'}), en 2 a 5 oraciones, sin markdown ni títulos.
- Para cualquier número usá SIEMPRE las herramientas; nunca inventes datos. No podés escribir SQL ni modificar nada: solo consultar.
- Elegí el formato que mejor responda: tabla para listas de 3 o más registros con varios campos, tarjetas KPI para 1 a 4 números clave, gráfico para comparar o ver evolución. Las herramientas de proyección y de consumo ya muestran su gráfico solas. No repitas en el texto todos los números que ya están en la tabla o el gráfico.
- Traducí los rangos a lenguaje simple ("se espera entre X e Y"), sin hablar de intervalos de confianza ni porcentajes técnicos.
- Si un material está en alerta, decí concretamente qué conviene hacer (por ejemplo, pedir ya por la demora del proveedor).
- Si preguntan algo ajeno a la fábrica, decilo amablemente en una oración. Si preguntan quién hizo esto: es una demo creada por Santiago Giaveno.`;
}

// ── Modo sin IA: router por palabras clave con respuestas armadas a partir de los mismos datos ──
function offline(message: string, lang: Lang, v: Visuals, trace: Step[]): string {
  const es = lang === 'es';
  const m = message.toLowerCase();
  const mat = findMaterial(message);
  const prod = findProduct(message);
  if (/proyec|pronost|forecast|proxim|next|semanas que vienen|va a hacer falta|need/.test(m) && mat) {
    const r: any = runTool('proyeccion_material', { material: mat.code }, lang, v, trace);
    return r.quiebre_de_stock_en_semana
      ? (es ? `Con el consumo esperado, el stock de ${mat.name.es} se termina en la semana +${r.quiebre_de_stock_en_semana}. El proveedor tarda ${mat.leadWeeks} semanas, así que conviene revisar el pedido ya.` : `With the expected usage, ${mat.name.en} stock runs out in week +${r.quiebre_de_stock_en_semana}. The supplier takes ${mat.leadWeeks} weeks, so the order should be reviewed now.`)
      : (es ? `El stock de ${mat.name.es} alcanza para las próximas 8 semanas según la proyección.` : `${mat.name.en} stock covers the next 8 weeks according to the forecast.`);
  }
  if (/consum|histor|usage|used/.test(m) && mat) {
    const r: any = runTool('consumo_historico', { material: mat.code, semanas: 12 }, lang, v, trace);
    return es ? `En las últimas 12 semanas se consumieron en promedio ${fmt(r.promedio, lang)} ${mat.unit.es} por semana de ${mat.name.es}.` : `Over the last 12 weeks, average weekly usage of ${mat.name.en} was ${fmt(r.promedio, lang)} ${mat.unit.en}.`;
  }
  if (/orden|ot\b|produc|order/.test(m) && !prod) {
    const r: any = runTool('ordenes_produccion', { estado: 'todas' }, lang, v, trace);
    v.tables.push({ title: es ? 'Órdenes de producción' : 'Production orders', columns: es ? ['OT', 'Producto', 'Cantidad', 'Estado', 'Entrega (sem)'] : ['WO', 'Product', 'Qty', 'Status', 'Due (wk)'], rows: r.ordenes.map((o: any) => [o.ot, o.producto, o.cantidad, o.estado, o.semanas_hasta_entrega]) });
    const open = r.ordenes.filter((o: any) => o.estado !== ORDER_STATE.terminada[lang]).length;
    return es ? `Hay ${open} órdenes abiertas entre en curso y pendientes.` : `There are ${open} open orders, in progress or pending.`;
  }
  if (prod && (/receta|lleva|alcanza|materiales|bom|recipe|need|enough/.test(m) || /\b\d{1,3}\b/.test(m))) {
    const qty = Number(m.match(/\b(\d{1,3})\b/)?.[1]) || 10;
    const r: any = runTool('receta_producto', { producto: prod.code, cantidad: qty }, lang, v, trace);
    v.tables.push({ title: `${r.producto} × ${qty}`, columns: es ? ['Material', 'Necesario', 'Stock', '¿Alcanza?'] : ['Material', 'Needed', 'Stock', 'Enough?'], rows: r.materiales.map((x: any) => [x.material, `${fmt(x.necesario, lang)} ${x.unidad}`, fmt(x.stock, lang), x.alcanza ? '✓' : '✗']) });
    const short = r.materiales.filter((x: any) => !x.alcanza).map((x: any) => x.material);
    return short.length ? (es ? `Para ${qty} unidades falta stock de: ${short.join(', ')}.` : `For ${qty} units there is not enough: ${short.join(', ')}.`) : (es ? `El stock alcanza para ${qty} unidades.` : `Stock covers ${qty} units.`);
  }
  // Por defecto: resumen de alertas
  const r: any = runTool('stock_materiales', { filtro: 'alerta' }, lang, v, trace);
  v.kpis.push(
    { label: es ? 'Materiales en alerta' : 'Materials on alert', value: String(r.materiales.length), tone: r.materiales.length ? 'bad' : 'ok' },
    { label: es ? 'Materiales controlados' : 'Materials tracked', value: String(MATERIALS.length) },
    { label: es ? 'OT abiertas' : 'Open WOs', value: String(ORDERS.filter((o) => o.state !== 'terminada').length) },
  );
  v.tables.push({ title: es ? 'Materiales para reponer' : 'Materials to reorder', columns: es ? ['Material', 'Stock', 'Punto de pedido', 'Cobertura (sem)', 'Demora prov. (sem)'] : ['Material', 'Stock', 'Reorder point', 'Cover (wk)', 'Lead time (wk)'], rows: r.materiales.map((x: any) => [x.material, `${fmt(x.stock, lang)} ${x.unidad}`, fmt(x.punto_de_pedido, lang), x.semanas_de_cobertura, x.demora_proveedor_semanas]) });
  return es ? 'Estos materiales están por debajo de su punto de pedido. Los que tienen menos semanas de cobertura que la demora del proveedor conviene pedirlos ya.' : 'These materials are below their reorder point. Those with fewer weeks of cover than the supplier lead time should be ordered now.';
}

export const POST: APIRoute = async (ctx) => {
  let body: any;
  try { body = await ctx.request.json(); } catch { return json({ error: 'bad_request' }, 400); }
  const lang: Lang = body?.lang === 'en' ? 'en' : 'es';
  const message = String(body?.message ?? '').trim().slice(0, 400);
  if (!message) return json({ error: 'empty' }, 400);
  const history: { role: string; text: string }[] = Array.isArray(body?.history) ? body.history.slice(-6) : [];
  const visuals: Visuals = { charts: [], tables: [], kpis: [] };
  const trace: Step[] = [];

  if (rateLimited('dandia:' + clientIp(() => ctx.clientAddress), 30)) {
    return json({ reply: lang === 'es' ? 'La demo llegó al límite de mensajes por ahora. Probá en unos minutos.' : 'The demo hit its message limit for now. Try again in a few minutes.', ...visuals, trace, source: 'limit' });
  }

  let reply = '';
  let source: 'ai' | 'offline' = 'offline';
  let reason = 'no_key';
  if (env('GEMINI_API_KEY')) {
    try {
      const contents: GeminiContent[] = [
        ...history.filter((h) => typeof h?.text === 'string').map((h) => ({ role: (h.role === 'user' ? 'user' : 'model') as 'user' | 'model', parts: [{ text: String(h.text).slice(0, 800) }] })),
        { role: 'user', parts: [{ text: message }] },
      ];
      const started = Date.now();
      for (let step = 0; step < 5; step++) {
        const left = 20_000 - (Date.now() - started);
        if (left < 3_000) throw new Error('timeout total');
        const res = await geminiGenerate({ system: systemPrompt(lang), contents, tools: TOOLS, maxOutputTokens: 700, timeoutMs: left });
        const calls = res.parts.filter((p) => p.functionCall);
        if (!calls.length) { reply = textOf(res); break; }
        contents.push(res);
        const responses: GeminiPart[] = calls.map((p) => ({
          functionResponse: { name: p.functionCall!.name, ...(p.functionCall!.id ? { id: p.functionCall!.id } : {}), response: runTool(p.functionCall!.name, p.functionCall!.args, lang, visuals, trace) },
        }));
        contents.push({ role: 'user', parts: responses });
      }
      if (!reply) throw new Error('sin respuesta final');
      source = 'ai';
    } catch (err) {
      reason = (err as Error).message.slice(0, 160);
      console.error('[demo-dandia] Gemini falló, uso modo sin IA:', reason);
      visuals.charts.length = visuals.tables.length = visuals.kpis.length = 0;
      trace.length = 0;
    }
  }
  if (source === 'offline') reply = offline(message, lang, visuals, trace);

  return json({ reply, ...visuals, trace, source, ...(source === 'offline' ? { reason } : {}) });
};
