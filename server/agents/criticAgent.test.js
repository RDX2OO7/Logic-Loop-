import { readFileSync } from "fs";
import { verifyEvidenceIntegrity, verifyPlanSanity, runCriticAgent } from "./criticAgent.js";

const gapFixture = JSON.parse(readFileSync(new URL("../fixtures/gapInnovation-foodwaste.json", import.meta.url)));
const planFixture = JSON.parse(readFileSync(new URL("../fixtures/plan-foodwaste.json", import.meta.url)));

async function main() {
  const validSourceIds = [
    "github-0-ms1fkmrw", "github-1-ms1fkmrw", "github-2-ms1fkmrw", "github-3-ms1fkmrw", "github-4-ms1fkmrw",
    "arxiv-0-ms1fkmf6", "web-0-ms1fkmwa", "web-2-ms1fkmwa", "web-3-ms1fkmwa", "web-4-ms1fkmwa",
    "openalex-2-ms1fkocg", "openalex-3-ms1fkocg",
  ];
  const draft = {
    innovation_angles: gapFixture.innovation_angles,
    validSourceIds,
    plan: planFixture,
    resources: { datasets: [], repos: [], apis: [] },
  };
  const result = await runCriticAgent(draft);
  console.log(JSON.stringify(result, null, 2));
}

main();
