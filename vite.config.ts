import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import expressApp from './server/index.js';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'express-backend',
      configureServer(server) {
        server.middlewares.use(expressApp);
      },
    },
  ],
});
