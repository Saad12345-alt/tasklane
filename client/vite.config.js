import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: { '/api': 'http://localhost:8080' } }, // same-origin cookies in dev
  build: { outDir: '../server/public', emptyOutDir: true }, // the API serves the built app
});
