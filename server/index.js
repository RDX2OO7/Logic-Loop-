import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dns from "dns";

// Fix SRV DNS lookup issues (querySrv ECONNREFUSED) for MongoDB Atlas on Windows/local networks
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {
  // Ignore fallback error
}

import { runDiscoveryPhase, runPlanningPhase, runResearchOSPipeline } from "./orchestrator.js";
import { streamFileById, listProjects, getProjectById, getDraft, saveDraft } from "./db/projectStore.js";
import { connectDB } from "./db/mongo.js";
import { startBot } from "./bot/telegramBot.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXPORTS_DIR = path.join(__dirname, "exports");
const DIST_DIR = path.join(__dirname, "../dist");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static assets from the Vite build directory
app.use(express.static(DIST_DIR));
// In-memory stores for drafts and completed projects
const draftStore = new Map();
const projectStore = new Map();

// GET /health
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// GET /api/drafts/:id
app.get("/api/drafts/:id", async (req, res) => {
  try {
    let draft = draftStore.get(req.params.id);
    if (!draft) {
      draft = await getDraft(req.params.id);
    }
    if (!draft) return res.status(404).json({ error: "Draft not found" });
    res.json(draft);
  } catch (err) {
    console.error("Get draft failed:", err);
    res.status(500).json({ error: err.message });
  }
});


// POST /api/discover - Phase 1 SSE streaming
app.post("/api/discover", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendSSE = (event, data) => {
    try {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    } catch { /* ignore */ }
  };

  // Keep-alive ping every 10s to prevent HTTP response timeout
  const keepAliveInterval = setInterval(() => {
    sendSSE("ping", { ts: Date.now() });
  }, 10000);

  try {
    const { idea, ideaRaw, studentId = "test" } = req.body || {};
    const inputIdea = idea || ideaRaw || "";

    sendSSE("progress", { message: "Starting discovery, search, and angle evaluation..." });

    const phase1Result = await runDiscoveryPhase(
      inputIdea,
      studentId,
      undefined,
      (msg) => sendSSE("progress", { message: msg })
    );

    clearInterval(keepAliveInterval);

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
    const draftRecord = { draftId, ...phase1Result };
    draftStore.set(draftId, draftRecord);
    try {
      await saveDraft(draftRecord);
    } catch (e) {
      /* ignore db error */
    }

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
    clearInterval(keepAliveInterval);
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
    try {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    } catch { /* ignore */ }
  };

  const keepAliveInterval = setInterval(() => {
    sendSSE("ping", { ts: Date.now() });
  }, 10000);

  try {
    const { draftId, selection, studentId = "test" } = req.body || {};
    let phase1Data = draftStore.get(draftId);
    if (!phase1Data) {
      phase1Data = await getDraft(draftId);
    }

    if (!phase1Data) {
      clearInterval(keepAliveInterval);
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
    clearInterval(keepAliveInterval);

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
    clearInterval(keepAliveInterval);
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

// GET /api/projects/:id/tasks — lightweight task-progress only (polled by Roadmap tab)
app.get("/api/projects/:id/tasks", async (req, res) => {
  try {
    const { getTaskProgress } = await import("./db/taskProgress.js");
    const progress = await getTaskProgress(req.params.id);
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/:id/tasks/:flatIndex/explain — explain a specific task using the explainer agent
app.get("/api/projects/:id/tasks/:flatIndex/explain", async (req, res) => {
  try {
    const { getTaskProgress } = await import("./db/taskProgress.js");
    const { getProjectById } = await import("./db/projectStore.js");
    const { runExplainerAgent } = await import("./agents/explainerAgent.js");

    const projectId = req.params.id;
    const flatIndex = parseInt(req.params.flatIndex, 10);

    const project = await getProjectById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const progress = await getTaskProgress(projectId);

    let task = null;
    for (const milestone of progress) {
      const subtask = milestone.subtasks.find(s => s.flatIndex === flatIndex);
      if (subtask) {
        task = {
          text: subtask.text,
          milestone: milestone.name,
        };
        break;
      }
    }

    if (!task) return res.status(404).json({ error: "Task not found" });

    const explanation = await runExplainerAgent(task, {
      architecture: project.projectData.plan.architecture,
      tech_stack: project.projectData.plan.tech_stack,
      angle: project.projectData.chosen_angle?.angle,
    });

    res.json({ explanation });
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

// POST /api/enhance-prompt
app.post("/api/enhance-prompt", async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const { generateJSON } = await import("./lib/geminiClient.js");

    const systemInstruction = `You are a prompt engineering expert. The user wants to write a high-quality project research or development proposal for ResearchOS.
Generate 4 distinct, highly detailed, and optimized variations of the user's input prompt.
Each variation should expand on technical stack suggestions, target audience/users, and concrete problems to solve.
Respond ONLY with a JSON object in this format:
{
  "variations": [
    "Variation 1...",
    "Variation 2...",
    "Variation 3...",
    "Variation 4..."
  ]
}`;

    const userPrompt = `Enhance this prompt: "${prompt}"`;
    const result = await generateJSON(systemInstruction, userPrompt);

    if (result && Array.isArray(result.variations)) {
      return res.json(result);
    }

    return res.json({
      variations: [
        `${prompt} with advanced ML orchestration and offline support`,
        `${prompt} focusing on UX accessibility and scalable backend API design`,
        `${prompt} deployed using docker containers on AWS with automated CI/CD`
      ]
    });
  } catch (err) {
    console.error("Error enhancing prompt:", err);
    res.status(500).json({ error: err.message });
  }
});

// Wildcard route fallback for React Router SPA navigation (Express 5 compatible)
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    return res.sendFile(path.join(DIST_DIR, "index.html"));
  }
  next();
});

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Orchestrator server listening on port ${PORT}`);
  });
  startBot();
}

startServer();

export default app;


