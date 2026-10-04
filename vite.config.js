import { defineConfig } from 'vite';

export default defineConfig({
  server: { port: 3002 },
  build: { outDir: 'dist', sourcemap: false }
});
