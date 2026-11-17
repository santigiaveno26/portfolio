# Portfolio · Santiago Giaveno

Sitio personal hecho con [Astro](https://astro.build), en español (`/`) e inglés (`/en/`).
Todo es estático salvo `/api/chat`, que corre como función gratuita en Vercel.

## Cómo correrlo

```bash
npm install
npm run dev      # http://localhost:4321
npm run build
```

## Dónde se edita cada cosa

| Quiero cambiar…                              | Archivo                                   |
|----------------------------------------------|-------------------------------------------|
| Textos, proyectos, experiencia, skills (ES y EN) | `src/data/profile.ts` (todo el contenido) |
| Botones, títulos de secciones (ES y EN)      | `src/i18n.ts`                             |
| La intro de los agentes (equipos, líneas)    | `src/components/Intro.astro`              |
| El chat (textos, sugerencias)                | `src/components/Chat.astro`               |
| Cómo responde el chat (reglas, modelo)       | `src/pages/api/chat.ts`                   |
| Animaciones al hacer scroll                  | `src/components/Motion.astro`             |
| Fondo animado del inicio                     | `src/components/Hero.astro`               |
| Colores y tipografía                         | `src/styles/global.css` (`:root`)         |
| Orden de las secciones                       | `src/components/Page.astro`               |

Para **agregar un proyecto**, sumá un objeto al array `projects` en `profile.ts`, con el texto en
`es` y `en`. Con `featured: true` aparece en la fila de destacados. El chat lo aprende solo.

**Privacidad:** los clientes se describen sin nombrarlos ("Empresa metalúrgica…"). Mantener esa regla.

## Idioma

- La intro pregunta primero el idioma. Si elegís el otro, salta a esa página y sigue la intro.
- La elección se guarda; quien eligió inglés y vuelve a entrar a `/` va directo a `/en/`.
- El botón `ES`/`EN` del menú cambia de idioma en cualquier momento.

## La intro

- Se muestra en la primera visita y después no vuelve a aparecer.
- Se saltea con `Esc`, "Saltar" o la opción 2. No aparece si el sistema tiene "reducir movimiento".
- Para verla de nuevo: "ver la intro de nuevo" en el pie, o entrar con `#intro` al final de la URL.
- Es una animación guionada: no llama a ninguna IA, no tiene costo por visita.

## El chat "Preguntale a mi CV"

Botón chico abajo a la derecha. Aparece después de la intro y nunca se abre solo.

- **Con clave de Gemini** (gratis en https://aistudio.google.com/apikey): responde redactando con IA,
  usando solo el contenido de `profile.ts`. Copiá `.env.example` como `.env` y completá `GEMINI_API_KEY`.
  En Vercel: Settings → Environment Variables → `GEMINI_API_KEY`.
- **Sin clave, o si la IA falla:** responde con el fragmento del perfil más relevante. Nunca queda roto.
- Límite de 20 preguntas cada 10 minutos por visitante y 500 caracteres por mensaje.

## Publicar gratis

1. Subí esta carpeta a un repo de GitHub (el `.gitignore` ya excluye `.env`, `node_modules`, etc.).
2. En vercel.com → "Add New Project" → importá el repo (detecta Astro solo).
3. Cargá `GEMINI_API_KEY` en las variables de entorno.
4. Queda en `https://<nombre>.vercel.app`. Si después usás otro dominio, actualizá `site` en `astro.config.mjs`.

## Ideas para las próximas versiones

- [ ] Foto propia en el hero (`public/retrato.jpg`)
- [ ] CV descargables sin nombres de clientes (`profile.cvs`)
- [ ] Página de detalle por proyecto, con capturas o video
- [ ] Dominio propio
