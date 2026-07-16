import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import express from 'express';

export default defineConfig(async () => {
  const { apiRouter } = await import('./src/server/index');

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-server',
        configureServer(server) {
          // Parse JSON and form payloads
          server.middlewares.use(express.json({ limit: '10mb' }));
          server.middlewares.use(express.urlencoded({ extended: true, limit: '10mb' }));
          
          // Serve uploads
          server.middlewares.use('/storage/uploads', express.static(path.resolve(__dirname, 'storage/uploads')));
          
          // API router middleware
          server.middlewares.use((req, res, next) => {
            if (req.url?.startsWith('/api')) {
              const app = express();
              app.use(express.json({ limit: '10mb' }));
              app.use('/api', apiRouter);
              app(req, res, next);
            } else {
              next();
            }
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
