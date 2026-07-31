import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { runDeepSearchAgent } from "./services/deepSearch.js";
import { filterRelevantSources } from "./services/relevanceFilter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "./.env") });

async function main() {
  console.log("Running deep search...");
  const query = "Build an AI solution to reduce food waste in college hostels";
  const deepSearchResult = await runDeepSearchAgent(query);
  console.log("Deep search returned:", {
    papers: deepSearchResult.papers.length,
    repos: deepSearchResult.repos.length,
    web: deepSearchResult.web.length,
  });

  console.log("Running relevance filter...");
  const filtered = await filterRelevantSources(deepSearchResult, query);
  console.log("Filtered count:", filtered._kept_count);
  console.log("Dropped count:", filtered._dropped_count);
  console.log("Debug scores:", JSON.stringify(filtered._debug_scores, null, 2));
}

main();
