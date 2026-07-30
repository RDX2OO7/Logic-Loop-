import { saveProjectRecord, getProjectById } from "./projectStore.js";

async function main() {
  const saved = await saveProjectRecord({
    studentId: "test-student",
    projectData: { title: "Test Project", normalized_problem: "x" },
    critic: { approved: true, issues: [] },
    docxBuffer: Buffer.from("fake docx content"),
    pptxBuffer: Buffer.from("fake pptx content"),
  });
  console.log("Saved:", saved);

  const fetched = await getProjectById(saved.projectId);
  console.log("Fetched title:", fetched.projectData.title);
  console.log(fetched.projectData.title === "Test Project" ? "PASS" : "FAIL");
  process.exit(0);
}

main();
