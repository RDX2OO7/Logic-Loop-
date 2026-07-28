import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'orchestrator-api-plugin',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/api/pipeline' && req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', async () => {
              const startTime = Date.now();
              try {
                const data = JSON.parse(body || '{}');
                const ideaText = data.idea || data.ideaRaw || '';
                const studentId = data.studentId || 'demo-student';

                console.log(`\n========================================`);
                console.log(`[UI -> Orchestrator] Triggered with idea: "${ideaText}"`);
                console.log(`Calling runResearchOSPipeline(ideaText, "${studentId}")...`);
                console.log(`========================================\n`);

                const { runResearchOSPipeline } = await import('./server/orchestrator.js');

                // Execute orchestrator agent call and await result
                const result = await runResearchOSPipeline(ideaText, studentId);
                const elapsedTimeMs = Date.now() - startTime;

                console.log(`[Orchestrator Agent Finished in ${(elapsedTimeMs / 1000).toFixed(1)}s] Status: ${result?.status}`);

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    status: 'success',
                    message: 'runResearchOSPipeline completed',
                    idea: ideaText,
                    studentId,
                    durationMs: elapsedTimeMs,
                    result: result,
                  })
                );
              } catch (err: any) {
                console.error('[Orchestrator API Error]', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              }
            });
            return;
          }
          next();
        });
      },
    },
  ],
  server: {
    port: 3000,
    open: false,
  },
});
