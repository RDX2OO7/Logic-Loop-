import { runDeepSearchAgent } from "./deepSearch.js";

async function main() {
  const result = await runDeepSearchAgent("food waste reduction hostels");
  console.log(`Papers: ${result.papers.length}`);
  console.log(`Repos: ${result.repos.length}`);
  console.log(`Web: ${result.web.length}`);
  console.log(JSON.stringify(result, null, 2));
}

main();
