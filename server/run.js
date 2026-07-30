import { runResearchOSPipeline } from "./orchestrator.js";

const idea = process.argv[2] || "build an ai tool that can help visually disabled people to use android phone";
const result = await runResearchOSPipeline(idea, "demo-student");

console.log(JSON.stringify({
  status: result.status,
  log: result.log,
  criticApproved: result.critic?.approved,
  exports: result.exports,
  _debug_scores: result.sources?._debug_scores,
}, null, 2));
