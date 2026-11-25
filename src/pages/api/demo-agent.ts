import type { APIRoute } from 'astro';
import { COMPANY, OWNERS, PRODUCTS, search, type Product } from '../../data/demo-agent';
import type { Lang } from '../../data/profile';
import { clientIp, env, geminiGenerate, json, rateLimited, textOf, type GeminiContent, type GeminiPart } from '../../lib/server';

export const prerender = false;

const MAX_MSG = 400;
const MAX_STEPS = 4; // vueltas máximas del loop de herramientas por mensaje

type Step = { tool: string; args: Record<string, unknown>; status: 'ok' | 'empty' | 'denied' | 'handoff' | 'rule'; detail: string; hits?: { title: string; score: number }[] };
type State = { owner: string | null; failStreak: number };

// ── Herramientas que el modelo puede pedir ──
const TOOLS = [
  {
    name: 'buscar_info_comercial',
    description: 'Busca información comercial (qué es, capacidad, precio, financiación, garantía, dónde comprar) de un producto. Abierta a cualquier persona.',
    parameters: { type: 'object', properties: { producto: { type: 'string', enum: ['PF-200', 'BV-50', 'ambos'] }, consulta: { type: 'string' } }, required: ['producto', 'consulta'] },
  },
  {
    name: 'buscar_manual_tecnico',
    description: 'Busca en el manual técnico (mantenimiento, calibración, diagnóstico de fallas, repuestos). SOLO devuelve contenido si el cliente está verificado como propietario de ese producto.',
    parameters: { type: 'object', properties: { producto: { type: 'string', enum: ['PF-200', 'BV-50'] }, consulta: { type: 'string' } }, required: ['producto', 'consulta'] },
  },
  {
    name: 'verificar_propietario',
    description: 'Verifica si un número de serie corresponde a una máquina vendida, para habilitar el manual técnico.',
    parameters: { type: 'object', properties: { numero_serie: { type: 'string' } }, required: ['numero_serie'] },
  },
  {
    name: 'info_empresa',
    description: 'Información institucional: horarios, ubicación, envíos, quiénes somos.',
    parameters: { type: 'object', properties: { consulta: { type: 'string' } }, required: ['consulta'] },
  },
  {
    name: 'derivar_a_humano',
    description: 'Deriva la conversación a una persona del equipo (cotizaciones, reclamos, urgencias, o cuando no hay información para responder).',
    parameters: { type: 'object', properties: { motivo: { type: 'string' } }, required: ['motivo'] },
  },
];

function runTool(name: string, args: any, lang: Lang, state: State, trace: Step[]): Record<string, unknown> {
  const q = String(args?.consulta ?? '');
  const pick = (hits: ReturnType<typeof search>) => hits.map((h) => ({ titulo: h.doc.title[lang], texto: h.doc.text[lang] }));
  const hitsInfo = (hits: ReturnType<typeof search>) => hits.map((h) => ({ title: h.doc.title[lang], score: h.score }));

  switch (name) {
    case 'buscar_info_comercial': {
      const p = String(args?.producto ?? 'ambos');
      const hits = search(q, lang, (doc) => doc.level === 'comercial' && (p === 'ambos' || doc.product === p));
      trace.push({ tool: name, args, status: hits.length ? 'ok' : 'empty', detail: hits.length ? `${hits.length} fragmento(s)` : 'sin resultados', hits: hitsInfo(hits) });
      return hits.length ? { resultados: pick(hits) } : { resultados: [], nota: 'No hay información sobre eso.' };
    }
    case 'buscar_manual_tecnico': {
      const p = String(args?.producto ?? '') as Product;
      // ⚠️ El control de acceso vive acá, en el código: el modelo no puede saltearlo pidiéndolo distinto.
      const ownedProduct = state.owner ? OWNERS[state.owner] : null;
      if (!ownedProduct || ownedProduct !== p) {
        trace.push({ tool: name, args, status: 'denied', detail: ownedProduct ? `verificado para ${ownedProduct}, no para ${p}` : 'cliente no verificado' });
        return {
          acceso: 'denegado',
          motivo: ownedProduct ? `El cliente está verificado para ${ownedProduct}, no para ${p}.` : 'El cliente no está verificado como propietario.',
          instruccion: 'No des procedimientos técnicos. Pedile el número de serie de su máquina para verificarlo, u ofrecé derivarlo a una persona.',
        };
      }
      const hits = search(q, lang, (doc) => doc.level === 'tecnico' && doc.product === p);
      trace.push({ tool: name, args, status: hits.length ? 'ok' : 'empty', detail: hits.length ? `acceso permitido · ${hits.length} fragmento(s)` : 'acceso permitido · sin resultados', hits: hitsInfo(hits) });
      return hits.length ? { resultados: pick(hits) } : { resultados: [], nota: 'El manual no cubre eso.' };
    }
    case 'verificar_propietario': {
      const serial = String(args?.numero_serie ?? '').trim().toUpperCase().replace(/\s+/g, '');
      const product = OWNERS[serial];
      if (product) state.owner = serial;
      trace.push({ tool: name, args, status: product ? 'ok' : 'denied', detail: product ? `propietario verificado: ${product}` : 'número de serie no encontrado' });
      return product ? { verificado: true, producto: product } : { verificado: false, nota: 'Ese número de serie no figura en la base de máquinas vendidas.' };
    }
    case 'info_empresa': {
      const hits = search(q, lang, (doc) => doc.level === 'empresa', 2);
      trace.push({ tool: name, args, status: hits.length ? 'ok' : 'empty', detail: hits.length ? `${hits.length} fragmento(s)` : 'sin resultados', hits: hitsInfo(hits) });
      return hits.length ? { resultados: pick(hits) } : { resultados: [], nota: 'No hay información sobre eso.' };
    }
    case 'derivar_a_humano': {
      trace.push({ tool: name, args, status: 'handoff', detail: 'conversación derivada a una persona (en producción: Chatwoot)' });
      return { derivado: true, mensaje: 'Una persona del equipo va a continuar la conversación en horario de atención.' };
    }
    default:
      return { error: 'herramienta desconocida' };
  }
}

function systemPrompt(lang: Lang, state: State) {
  const owner = state.owner ? `verificado como propietario de ${OWNERS[state.owner]} (serie ${state.owner})` : 'NO verificado';
  return `Sos el asistente de WhatsApp de ${COMPANY.es}. Productos: ${PRODUCTS['PF-200'].es} y ${PRODUCTS['BV-50'].es}.

Reglas:
- Respondé en el idioma del cliente (por defecto ${lang === 'es' ? 'español rioplatense' : 'inglés'}), breve, como en WhatsApp: 1 a 4 oraciones, sin títulos.
- Para cualquier dato de productos o de la empresa, usá SIEMPRE las herramientas. No inventes especificaciones, precios ni procedimientos.
- Consultas técnicas (mantenimiento, calibración, fallas, repuestos): usá buscar_manual_tecnico. Si devuelve acceso denegado, no des el procedimiento: pedí el número de serie y usá verificar_propietario cuando lo den.
- Cotizaciones, reclamos o urgencias: ofrecé derivar con derivar_a_humano.
- Si te preguntan algo que no tiene que ver con la empresa, decilo amablemente en una oración.
- Si preguntan quién hizo este asistente: es una demo creada por Santiago Giaveno, desarrollador de IA.
- Estado del cliente: ${owner}.`;
}

// ── Modo sin IA: un router simple por palabras clave, para que la demo nunca quede rota ──
function offline(message: string, lang: Lang, state: State, trace: Step[]) {
  const m = message.toLowerCase();
  const serial = m.toUpperCase().match(/\b(PF-200|BV-50)-\d{4}\b/);
  const product: Product = /bv|barre|aspir|succi|escobill/.test(m) ? 'BV-50' : 'PF-200';
  let out: Record<string, any>;
  if (serial) out = runTool('verificar_propietario', { numero_serie: serial[0] }, lang, state, trace);
  else if (/manten|calibr|cuchill|correa|falla|vibr|succi|escobill|repuest|aceite|engras|maint|blade|belt|vibrat|suction|brush|spare|oil|grease/.test(m))
    out = runTool('buscar_manual_tecnico', { producto: product, consulta: message }, lang, state, trace);
  else if (/horari|donde|dónde|ubica|envi|envío|quien|hours|where|ship|located/.test(m))
    out = runTool('info_empresa', { consulta: message }, lang, state, trace);
  else if (/humano|persona|asesor|cotiz|reclamo|human|person|quote|complaint/.test(m))
    out = runTool('derivar_a_humano', { motivo: message }, lang, state, trace);
  else out = runTool('buscar_info_comercial', { producto: /pf|picad|forraj|silo/.test(m) ? 'PF-200' : /bv|barre|munic/.test(m) ? 'BV-50' : 'ambos', consulta: message }, lang, state, trace);

  const es = lang === 'es';
  if (out.verificado === true) return es ? `Listo, verifiqué tu ${out.producto}. Ya podés consultarme mantenimiento, fallas o repuestos.` : `Done, I verified your ${out.producto}. You can now ask about maintenance, faults or spare parts.`;
  if (out.verificado === false) return es ? 'No encuentro ese número de serie. Revisalo en la chapa de la máquina.' : "I can't find that serial number. Please check the machine's plate.";
  if (out.acceso === 'denegado') return es ? 'Esa información es para clientes que ya tienen la máquina. ¿Me pasás el número de serie para verificarlo?' : 'That information is for customers who own the machine. Could you send me the serial number to verify it?';
  if (out.derivado) return es ? 'Te paso con una persona del equipo, que te escribe en horario de atención.' : "I'm handing you over to someone from the team, who will reply during business hours.";
  if (out.resultados?.length) return out.resultados[0].texto;
  return es ? 'No tengo información sobre eso. ¿Querés que te pase con una persona del equipo?' : "I don't have information on that. Do you want me to hand you over to someone from the team?";
}

export const POST: APIRoute = async (ctx) => {
  let body: any;
  try { body = await ctx.request.json(); } catch { return json({ error: 'bad_request' }, 400); }
  const lang: Lang = body?.lang === 'en' ? 'en' : 'es';
  const message = String(body?.message ?? '').trim().slice(0, MAX_MSG);
  if (!message) return json({ error: 'empty' }, 400);
  const history: { role: string; text: string }[] = Array.isArray(body?.history) ? body.history.slice(-8) : [];
  const ownerIn = typeof body?.owner === 'string' && OWNERS[body.owner] ? body.owner : null;
  const state: State = { owner: ownerIn, failStreak: Math.max(0, Number(body?.failStreak) || 0) };
  const trace: Step[] = [];

  if (rateLimited('demo:' + clientIp(() => ctx.clientAddress), 30)) {
    return json({ reply: lang === 'es' ? 'La demo llegó al límite de mensajes por ahora. Probá en unos minutos.' : 'The demo hit its message limit for now. Try again in a few minutes.', trace, ...state, escalated: false, source: 'limit' });
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
      for (let step = 0; step < MAX_STEPS; step++) {
        const res = await geminiGenerate({ system: systemPrompt(lang, state), contents, tools: TOOLS, maxOutputTokens: 400 });
        const calls = res.parts.filter((p) => p.functionCall);
        if (!calls.length) { reply = textOf(res); break; }
        contents.push(res); // se devuelve intacto: Gemini exige recibir de vuelta sus "thought signatures"
        const responses: GeminiPart[] = calls.map((p) => ({
          functionResponse: { name: p.functionCall!.name, ...(p.functionCall!.id ? { id: p.functionCall!.id } : {}), response: runTool(p.functionCall!.name, p.functionCall!.args, lang, state, trace) },
        }));
        contents.push({ role: 'user', parts: responses });
      }
      if (!reply) throw new Error('sin respuesta final');
      source = 'ai';
    } catch (err) {
      reason = (err as Error).message.slice(0, 160);
      console.error('[demo-agent] Gemini falló, uso modo sin IA:', reason);
      trace.length = 0;
    }
  }
  if (source === 'offline') reply = offline(message, lang, state, trace);

  // ── Regla de negocio en código: dos turnos seguidos sin información → derivar a una persona ──
  const searched = trace.filter((s) => s.tool.startsWith('buscar') || s.tool === 'info_empresa');
  const escalatedByModel = trace.some((s) => s.status === 'handoff');
  if (searched.length && searched.every((s) => s.status === 'empty')) state.failStreak += 1;
  else if (searched.some((s) => s.status === 'ok')) state.failStreak = 0;
  let escalated = escalatedByModel;
  if (state.failStreak >= 2 && !escalated) {
    escalated = true;
    state.failStreak = 0;
    trace.push({ tool: 'regla_dos_fallas', args: {}, status: 'rule', detail: '2 respuestas seguidas sin información → derivación automática' });
    reply += lang === 'es'
      ? '\n\nComo no estoy pudiendo ayudarte con esto, te paso con una persona del equipo.'
      : "\n\nSince I can't help you with this, I'm handing you over to someone from the team.";
  }

  return json({ reply, trace, owner: state.owner, failStreak: state.failStreak, escalated, source, ...(source === 'offline' ? { reason } : {}) });
};
