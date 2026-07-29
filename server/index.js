import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { runResearchOSPipeline } from "./orchestrator.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use("/exports", express.static(path.join(__dirname, "exports")));

app.post("/api/pipeline", async (req, res) => {
  const startTime = Date.now();
  try {
    const data = req.body || {};
    const ideaText = data.idea || data.ideaRaw || "";
    const studentId = data.studentId || "demo-student";

    console.log(`\n========================================`);
    console.log(`[Orchestrator Server] Received idea from UI: "${ideaText}"`);
    console.log(`Calling runResearchOSPipeline(ideaText, "${studentId}")...`);
    console.log(`========================================\n`);

    const result = await runResearchOSPipeline(ideaText, studentId);
    const elapsedTimeMs = Date.now() - startTime;

    console.log(
      `[Orchestrator Agent Finished in ${(elapsedTimeMs / 1000).toFixed(
        1
      )}s] Status: ${result?.status}`
    );

    res.json({
      status: "success",
      message: "runResearchOSPipeline completed",
      idea: ideaText,
      studentId: studentId,
      durationMs: elapsedTimeMs,
      result: result,
    });
  } catch (err) {
    console.error("[Orchestrator API Error]", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Orchestrator server listening on http://localhost:${PORT}`);
});

export default app;
