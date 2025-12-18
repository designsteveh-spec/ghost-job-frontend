import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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
