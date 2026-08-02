import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createReadStream } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXPORTS_DIR = path.join(__dirname, 'server', 'exports');

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'orchestrator-api-plugin',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          // Serve generated export files from server/exports/ if fallback is needed
          if (req.url?.startsWith('/exports/') && req.method === 'GET') {
            const fileName = req.url.slice('/exports/'.length);
            const filePath = path.join(EXPORTS_DIR, fileName);
            if (fs.existsSync(filePath)) {
              const ext = path.extname(fileName).toLowerCase();
              const mimeTypes: Record<string, string> = {
                '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
              };
              res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
              res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
              createReadStream(filePath).pipe(res);
              return;
            }
          }
          next();
        });
      },
    },
  ],
  server: {
    port: 3000,
    open: false,
    // SPA fallback — serves index.html for deep-links like /plan/:draftId
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
      '/exports': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
});
