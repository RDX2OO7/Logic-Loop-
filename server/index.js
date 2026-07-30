import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { runDiscoveryPhase, runPlanningPhase, runResearchOSPipeline } from "./orchestrator.js";
import { streamFileById, listProjects, getProjectById } from "./db/projectStore.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXPORTS_DIR = path.join(__dirname, "exports");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
// In-memory stores for drafts and completed projects
const draftStore = new Map();
const projectStore = new Map();

// GET /health
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// POST /api/discover - Phase 1 SSE streaming
app.post("/api/discover", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendSSE = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const { idea, ideaRaw, studentId = "test" } = req.body || {};
    const inputIdea = idea || ideaRaw || "";

    sendSSE("progress", { message: "Starting discovery, search, and angle evaluation..." });

    const phase1Result = await runDiscoveryPhase(inputIdea, studentId);

    if (phase1Result.status === "needs_clarification") {
      sendSSE("done", {
        status: "needs_clarification",
        question: phase1Result.question,
        log: phase1Result.log,
      });
      return res.end();
    }

    if (phase1Result.status === "insufficient_evidence") {
      sendSSE("done", {
        status: "insufficient_evidence",
        evidence_summary: phase1Result.evidence_summary,
        log: phase1Result.log,
      });
      return res.end();
    }

    const draftId = `draft-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    draftStore.set(draftId, phase1Result);

    sendSSE("done", {
      status: phase1Result.status,
      draftId,
      angles: phase1Result.ranked_angles,
      evidence_summary: phase1Result.evidence_summary,
      gaps: phase1Result.gaps,
      normalized_problem: phase1Result.normalized_problem,
      log: phase1Result.log,
    });
    res.end();
  } catch (err) {
    console.error("Error in /api/discover:", err);
    sendSSE("error", { error: err.message });
    res.end();
  }
});

// POST /api/plan - Phase 2 SSE streaming
app.post("/api/plan", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendSSE = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const { draftId, selection, studentId = "test" } = req.body || {};
    const phase1Data = draftStore.get(draftId);

    if (!phase1Data) {
      sendSSE("error", { error: `Draft ID '${draftId}' not found or expired.` });
      return res.end();
    }

    sendSSE("progress", { message: "Starting project planning phase..." });

    let targetSelection = selection;
    if (typeof selection === "number") {
      const foundAngle =
        phase1Data.ranked_angles?.find((a) => a.priority_rank === selection) ||
        phase1Data.ranked_angles?.[selection - 1];
      if (foundAngle) {
        targetSelection = foundAngle;
      }
    }

    const planResult = await runPlanningPhase(phase1Data, targetSelection, studentId);
    const finalResults = planResult.results ? planResult.results : [planResult];

    finalResults.forEach((r) => {
      if (r.projectData) {
        const projectId = `proj-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        projectStore.set(projectId, { id: projectId, ...r });
      }
    });

    sendSSE("done", {
      status: "complete",
      results: finalResults,
    });
    res.end();
  } catch (err) {
    console.error("Error in /api/plan:", err);
    sendSSE("error", { error: err.message });
    res.end();
  }
});

// GET /api/projects
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await listProjects(req.query.studentId || "anonymous");
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/:id
app.get("/api/projects/:id", async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: "Not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/files/:fileId
app.get("/api/files/:fileId", async (req, res) => {
  try {
    await streamFileById(req.params.fileId, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Legacy pipeline endpoint
app.post("/api/pipeline", async (req, res) => {
  const startTime = Date.now();
  try {
    const data = req.body || {};
    const ideaText = data.idea || data.ideaRaw || "";
    const studentId = data.studentId || "demo-student";

    const result = await runResearchOSPipeline(ideaText, studentId);
    const elapsedTimeMs = Date.now() - startTime;

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
