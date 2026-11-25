// Utilidades compartidas por las rutas /api/* (corren en el servidor, nunca en el navegador).

export const env = (k: string): string | undefined =>
  (globalThis as any).process?.env?.[k] ?? (import.meta.env as Record<string, string | undefined>)[k];

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

// ── Límite simple por IP y por ruta (por instancia; alcanza para un portfolio) ──
const hits = new Map<string, number[]>();
export function rateLimited(key: string, max = 20, windowMs = 10 * 60_000) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > max;
}

export function clientIp(clientAddress: () => string) {
  try { return clientAddress(); } catch { return 'unknown'; }
}

// ── Normalización de texto para búsquedas léxicas ──
export const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]/g, ' ');
export const stem = (w: string) => w.replace(/(es|s)$/, '');

// ── Gemini (REST) ──
export type GeminiPart = { text?: string; thought?: boolean; functionCall?: { name: string; args?: any; id?: string }; [k: string]: any };
export type GeminiContent = { role: 'user' | 'model'; parts: GeminiPart[] };

// Por modelo: si no acepta desactivar el razonamiento, se recuerda y no se vuelve a pedir.
const thinkingOff = new Map<string, boolean>();

/** Una llamada a generateContent. Devuelve el contenido del primer candidato (texto y/o llamadas a funciones). */
export async function geminiGenerate(opts: {
  system: string;
  contents: GeminiContent[];
  tools?: { name: string; description: string; parameters: any }[];
  maxOutputTokens?: number;
  timeoutMs?: number;
}): Promise<GeminiContent> {
  const key = env('GEMINI_API_KEY');
  if (!key) throw new Error('no_key');
  // Cascada de modelos: si uno está saturado (503), sin cuota (429), retirado (404) o tarda, se prueba el siguiente.
  const models = [env('GEMINI_MODEL') || 'gemini-flash-lite-latest', ...(env('GEMINI_FALLBACK_MODELS') || 'gemini-flash-latest').split(',')]
    .map((m) => m.trim())
    .filter((m, i, a) => m && a.indexOf(m) === i);
  const deadline = Date.now() + (opts.timeoutMs ?? 22_000);
  let lastErr: Error = new Error('sin modelos');

  for (const model of models) {
    const left = deadline - Date.now();
    if (left < 2_000) break;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), Math.min(left, 8_000));
    const call = (noThinking: boolean) =>
      fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: opts.system }] },
          contents: opts.contents,
          ...(opts.tools ? { tools: [{ functionDeclarations: opts.tools }] } : {}),
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: opts.maxOutputTokens ?? 500,
            ...(noThinking ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
          },
        }),
        signal: ctrl.signal,
      });
    try {
      const off = thinkingOff.get(model) ?? true;
      let res = await call(off);
      // Si el modelo no acepta desactivar el razonamiento, reintenta sin ese ajuste y lo recuerda.
      if (res.status === 400 && off) {
        thinkingOff.set(model, false);
        res = await call(false);
      }
      if (!res.ok) {
        const body = (await res.text()).slice(0, 300);
        console.error(`[gemini] ${model} respondió ${res.status}: ${body}`);
        lastErr = new Error(`Gemini ${res.status} (${model})`);
        if ([404, 429, 500, 502, 503, 504].includes(res.status)) continue;
        throw lastErr;
      }
      const data = await res.json();
      const content = data?.candidates?.[0]?.content as GeminiContent | undefined;
      if (!content?.parts?.length) throw new Error(`empty (finishReason: ${data?.candidates?.[0]?.finishReason ?? 'n/a'})`);
      return { role: 'model', parts: content.parts };
    } catch (err) {
      lastErr = (err as Error).name === 'AbortError' ? new Error(`timeout (${model})`) : (err as Error);
      if ((err as Error).name === 'AbortError') continue;
      throw lastErr;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr;
}

export const textOf = (c: GeminiContent) =>
  c.parts.filter((p) => !p.thought && typeof p.text === 'string').map((p) => p.text).join('').trim();
