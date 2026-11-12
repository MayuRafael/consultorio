import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Repassa /api para o backend: o navegador vê tudo na mesma origem
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
