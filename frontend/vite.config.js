import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  server: {
      allowedHosts: [".ngrok-free.app"], // Allows ngrok hosts
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  plugins: [
    tailwindcss()
  ],
});