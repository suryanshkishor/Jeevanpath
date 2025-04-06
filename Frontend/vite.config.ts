import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: ["a9e2-49-249-103-234.ngrok-free.app", "b2c2-49-249-103-234.ngrok-free.app"],
  }
});
