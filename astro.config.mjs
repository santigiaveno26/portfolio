// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// El sitio es estático; solo /api/chat corre como función (gratis en Vercel).
// Cuando tengas dominio propio, cambiá `site` (SEO y vista previa en redes).
export default defineConfig({
  site: 'https://santigiaveno.vercel.app',
  adapter: vercel(),
});
