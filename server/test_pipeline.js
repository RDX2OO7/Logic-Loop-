import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { runResearchOSPipeline } from "./orchestrator.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "./.env") });

async function main() {
  console.log("Starting full pipeline test...");
  const idea = "Build an AI solution to reduce food waste in college hostels";
  const studentId = "demo-student";
  
  try {
    const result = await runResearchOSPipeline(idea, studentId);
    console.log("Pipeline result status:", result.status);
    console.log("Result object keys:", Object.keys(result));
    if (result.projectData) {
      console.log("Project Title:", result.projectData.title);
      console.log("Sources count:", {
        papers: result.projectData.sources?.papers?.length || 0,
        repos: result.projectData.sources?.repos?.length || 0,
        web: result.projectData.sources?.web?.length || 0,
      });
      console.log("Milestones count:", result.projectData.plan?.milestones?.length || 0);
    }
  } catch (err) {
    console.error("Pipeline failed with error:", err);
  }
}

main();
