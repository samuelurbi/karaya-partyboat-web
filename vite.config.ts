import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Misma base que Traffic Light (plantilla de GoHighLevel Vibe), aunque el destino
// previsto es Hostinger: `dist/` + `public/.htaccess` (reescritura a index.html).
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: { target: 'es2020', sourcemap: false },
});
