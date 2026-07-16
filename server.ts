import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter, setupApi } from './src/server/index';
import { STORAGE_DIR, UPLOADS_DIR } from './src/server/db';

// Safely resolve filename and dirname for both ESM and CJS environments
let _filename = '';
let _dirname = '';
try {
  _filename = fileURLToPath(import.meta.url);
  _dirname = path.dirname(_filename);
} catch {
  // Fallback to CommonJS globals if import.meta.url is not defined/throws
  _filename = __filename;
  _dirname = __dirname;
}

async function startServer() {
  const app = express();
  
  // Set JSON/URL payload size limits to allow base64 uploads
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Mount API router
  setupApi(app);

  // Serve storage uploads directory directly
  app.use('/storage/uploads', express.static(UPLOADS_DIR));

  const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(path.resolve(process.cwd(), 'dist'));

  if (!isProd) {
    console.log('Running server.ts in development fallback mode.');
    // Vite Dev Server middleware mode fallback
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    console.log('Running server.ts in PRODUCTION mode.');
    const distPath = path.resolve(process.cwd(), 'dist');
    // Serve static frontend from dist
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`[SERVER] Full-stack server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('[SERVER] Critical server error on startup:', err);
});
