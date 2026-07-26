import { runResourceCuratorAgent } from "./resourceCuratorAgent.js";

async function main() {
  console.log("=== LIVE: runResourceCuratorAgent ===");
  const result = await runResourceCuratorAgent(
    "food waste tracking machine learning",
    "food waste"  // HuggingFace dataset API needs short keyword queries
  );
  console.log(`datasets: ${result.datasets.length}, repos: ${result.repos.length}`);
  console.log(JSON.stringify(result, null, 2));
}

main();
