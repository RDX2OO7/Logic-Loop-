import { buildInitialTaskProgress, findNextIncompleteTask } from "./taskProgress.js";

const milestones = [
  { name: "Setup", subtasks: ["Init repo", "Configure DB"] },
  { name: "Build", subtasks: ["Write agent", "Test agent", "Deploy"] },
];
const progress = buildInitialTaskProgress(milestones);
console.log(JSON.stringify(progress, null, 2));

const next1 = findNextIncompleteTask(progress);
console.log(next1.flatIndex === 0 && next1.text === "Init repo" ? "PASS 1" : "FAIL 1");

progress[0].subtasks[0].done = true;
progress[0].subtasks[1].done = true;
const next2 = findNextIncompleteTask(progress);
console.log(next2.flatIndex === 2 && next2.text === "Write agent" ? "PASS 2 (crosses milestone boundary correctly)" : "FAIL 2");
