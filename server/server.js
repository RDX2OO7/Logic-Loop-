import http from 'http';
import { runResearchOSPipeline } from './orchestrator.js';

const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/api/pipeline' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      const startTime = Date.now();
      try {
        const data = JSON.parse(body || '{}');
        const ideaText = data.idea || data.ideaRaw || '';
        const studentId = data.studentId || 'demo-student';

        console.log(`\n========================================`);
        console.log(`[Orchestrator Server] Received idea from UI: "${ideaText}"`);
        console.log(`Calling runResearchOSPipeline(ideaText, "${studentId}")...`);
        console.log(`========================================\n`);

        const result = await runResearchOSPipeline(ideaText, studentId);
        const elapsedTimeMs = Date.now() - startTime;

        console.log(`[Orchestrator Agent Finished in ${(elapsedTimeMs / 1000).toFixed(1)}s] Status: ${result?.status}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'success',
          message: 'runResearchOSPipeline completed',
          idea: ideaText,
          studentId: studentId,
          durationMs: elapsedTimeMs,
          result: result
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, () => {
  console.log(`Orchestrator server listening on http://localhost:${PORT}`);
});
