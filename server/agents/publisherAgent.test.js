/**
 * publisherAgent.test.js
 * Assembles a realistic draft from the foodwaste fixtures and runs the
 * Publisher Agent to generate output.docx and output.pptx in cwd.
 */

import { readFileSync } from "fs";
import { runPublisherAgent } from "./publisherAgent.js";

const gapFixture  = JSON.parse(readFileSync(new URL("../fixtures/gapInnovation-foodwaste.json", import.meta.url)));
const planFixture = JSON.parse(readFileSync(new URL("../fixtures/plan-foodwaste.json",          import.meta.url)));

const draft = {
  topic: "AI-Driven Food Waste Reduction in Hostels",
  innovation_angles: gapFixture.innovation_angles,
  plan: planFixture,
  resources: {
    datasets: [],
    repos: [
      { name: "Smartplate-AI",                         url: "https://github.com/example/smartplate-ai" },
      { name: "Smart_Food_Waste_Reduction_System",     url: "https://github.com/example/food-waste-reduction" },
    ],
    apis: [],
  },
};

const { docxPath, pptxPath } = await runPublisherAgent(draft, {
  docxPath: "output.docx",
  pptxPath: "output.pptx",
});

console.log("\nFiles generated:");
console.log(`  Word  → ${docxPath}`);
console.log(`  PowerPoint → ${pptxPath}`);
