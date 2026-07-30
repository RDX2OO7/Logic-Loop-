import { getDb, getBucket } from "./mongo.js";
import { Readable } from "stream";

async function uploadBuffer(buffer, filename, contentType) {
  const bucket = await getBucket();
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, { contentType });
    Readable.from(buffer).pipe(uploadStream)
      .on("error", reject)
      .on("finish", () => resolve(uploadStream.id.toString()));
  });
}

export async function streamFileById(fileId, res) {
  const bucket = await getBucket();
  const { ObjectId } = await import("mongodb");
  const files = await bucket.find({ _id: new ObjectId(fileId) }).toArray();
  if (files.length === 0) {
    res.status(404).json({ error: "File not found" });
    return;
  }
  const file = files[0];
  res.set("Content-Type", file.contentType || "application/octet-stream");
  res.set("Content-Disposition", `attachment; filename="${file.filename}"`);
  bucket.openDownloadStream(new ObjectId(fileId)).pipe(res);
}

export { uploadBuffer };

export async function saveProjectRecord({ studentId, projectData, critic, docxBuffer, pptxBuffer }) {
  const docxFileId = await uploadBuffer(docxBuffer, `${projectData.title}.docx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  const pptxFileId = await uploadBuffer(pptxBuffer, `${projectData.title}.pptx`, "application/vnd.openxmlformats-officedocument.presentationml.presentation");

  const db = await getDb();
  const result = await db.collection("projects").insertOne({
    studentId, projectData, critic, docxFileId, pptxFileId, createdAt: new Date(),
  });

  return { projectId: result.insertedId.toString(), docxFileId, pptxFileId };
}

export async function getProjectById(projectId) {
  const db = await getDb();
  const { ObjectId } = await import("mongodb");
  return db.collection("projects").findOne({ _id: new ObjectId(projectId) });
}

export async function listProjects(studentId, limit = 20) {
  const db = await getDb();
  return db.collection("projects")
    .find({ studentId })
    .project({ "projectData.title": 1, status: 1, createdAt: 1 })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

export async function saveDraft(draftData) {
  const db = await getDb();
  const result = await db.collection("drafts").insertOne({ ...draftData, createdAt: new Date() });
  return result.insertedId.toString();
}

export async function getDraft(draftId) {
  const db = await getDb();
  const { ObjectId } = await import("mongodb");
  return db.collection("drafts").findOne({ _id: new ObjectId(draftId) });
}

