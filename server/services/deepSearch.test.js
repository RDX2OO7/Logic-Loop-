import { runDeepSearchAgent } from "./deepSearch.js";

async function main() {
  const result = await runDeepSearchAgent("use of microprocessors in plant monitring");
  console.log(`Papers: ${result.papers.length}`);
  console.log(`Repos: ${result.repos.length}`);
  console.log(`Web: ${result.web.length}`);
  console.log(JSON.stringify(result, null, 2));
}

main();
