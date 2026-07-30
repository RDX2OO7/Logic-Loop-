import { rankAnglesByImpact } from "./projectPlannerAgent.js";

const fake = [
  { angle: "A - low impact high effort", impact_score: "low", effort_score: "high" },
  { angle: "B - high impact low effort", impact_score: "high", effort_score: "low" },
  { angle: "C - high impact high effort", impact_score: "high", effort_score: "high" },
];
const ranked = rankAnglesByImpact(fake);
ranked.forEach(r => console.log(r.priority_rank, "-", r.angle));
console.log(ranked[0].angle.startsWith("B") ? "PASS" : "FAIL");
