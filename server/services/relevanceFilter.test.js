import { filterRelevantSources } from "./relevanceFilter.js";

async function runTests() {
  console.log("=== TEST: relevanceFilter offline unit test ===");

  // Mock embed function that returns pre-defined 2D vectors
  // Query: [1, 0]
  // Relevant paper: [0.9, 0.1] => cosine ~ 0.99 >= 0.35 -> KEEP
  // Off-topic paper: [0.1, 0.9] => cosine ~ 0.11 < 0.35 -> DROP
  // Relevant repo: [0.8, 0.2] => cosine ~ 0.97 >= 0.35 -> KEEP
  // Off-topic web: [0.0, 1.0] => cosine ~ 0.0 < 0.35 -> DROP
  const fakeEmbedFn = async (texts) => {
    return texts.map((t, idx) => {
      if (idx === 0) return [1, 0];
      if (t.includes("Relevant Paper")) return [0.9, 0.1];
      if (t.includes("Off-topic Paper")) return [0.1, 0.9];
      if (t.includes("Relevant Repo")) return [0.8, 0.2];
      if (t.includes("Off-topic Web")) return [0.0, 1.0];
      return [0.5, 0.5];
    });
  };

  const mockDeepSearchResult = {
    papers: [
      { id: "p1", title: "Relevant Paper Title", snippet: "Relevant Paper content" },
      { id: "p2", title: "Off-topic Paper Title", snippet: "Off-topic Paper content" },
    ],
    repos: [
      { id: "r1", name: "Relevant Repo", description: "Relevant Repo code" },
    ],
    web: [
      { id: "w1", title: "Off-topic Web", snippet: "Off-topic Web article" },
    ],
  };

  const result = await filterRelevantSources(
    mockDeepSearchResult,
    "gamified waste tracking",
    0.35,
    fakeEmbedFn
  );

  console.log("Kept count:", result._kept_count);
  console.log("Dropped count:", result._dropped_count);
  console.log("Debug scores:", result._debug_scores);

  const pass =
    result._kept_count === 2 &&
    result._dropped_count === 2 &&
    result.papers.length === 1 &&
    result.papers[0].id === "p1" &&
    result.repos.length === 1 &&
    result.repos[0].id === "r1" &&
    result.web.length === 0;

  if (pass) {
    console.log("PASS");
  } else {
    console.log("FAIL");
    process.exit(1);
  }
}

runTests();
