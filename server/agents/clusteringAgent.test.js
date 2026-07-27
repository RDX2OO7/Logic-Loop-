import { cosineSimilarity, pickClusterCount, runClusteringAgent } from "./clusteringAgent.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log("=== PART 1: offline unit tests (no API calls) ===");
  const identical = cosineSimilarity([1, 0, 0], [1, 0, 0]);
  const opposite = cosineSimilarity([1, 0, 0], [-1, 0, 0]);
  console.log(`identical: ${identical}, opposite: ${opposite}`);
  console.log(
    identical === 1 && opposite === -1
      ? "PASS: cosineSimilarity correct"
      : "FAIL: cosineSimilarity returned unexpected values"
  );

  console.log("\npickClusterCount checks:");
  console.log(`  3 items → k=${pickClusterCount(3)}  (expect 2)`);
  console.log(`  9 items → k=${pickClusterCount(9)}  (expect 3)`);
  console.log(`  20 items → k=${pickClusterCount(20)} (expect 5)`);

  console.log("\n=== PART 2: live run — embedding + clustering on real fixture ===");
  const fixtureName = process.argv[2] || "foodwaste-full";
  const fixturePath = path.resolve(__dirname, `../fixtures/${fixtureName}.json`);
  let fixture;
  try {
    fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
  } catch {
    console.error(`Fixture not found: ${fixturePath}`);
    console.error(`Run first: node fixtures/generateFixture.js "food waste reduction hostels" foodwaste-full`);
    process.exit(1);
  }

  console.log(`Loaded fixture: ${fixtureName}.json`);
  console.log(`  papers: ${fixture.papers?.length ?? 0}, repos: ${fixture.repos?.length ?? 0}, web: ${fixture.web?.length ?? 0}`);

  const result = await runClusteringAgent(fixture);
  console.log(JSON.stringify(result, null, 2));
}

main();
