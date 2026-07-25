import { runDiscoveryAgent } from "./discoveryAgent.js";

const testIdeas = [
  "Build an AI solution to reduce food waste in college hostels",
  "make something with AI",
  "Arduino based LPG leak detection system with GSM alerts",
  "build an app",
  "A tool to help first-year ECE students find good mini-project ideas involving Ohm's Law or RC circuits",
];

async function main() {
  for (const idea of testIdeas) {
    console.log("\n---");
    console.log("INPUT:", idea);
    try {
      const result = await runDiscoveryAgent(idea);
      console.log("OUTPUT:", JSON.stringify(result, null, 2));
    } catch (err) {
      console.error("FAILED:", err.message);
    }
  }
}

main();
