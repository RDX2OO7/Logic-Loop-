import { getDb, getBucket } from "./mongo.js";
import { Readable } from "stream";

// In-memory fallback stores when MongoDB is unreachable
const inMemoryProjects = new Map();
const inMemoryFiles = new Map();
const inMemoryDrafts = new Map();

function generateMockObjectId() {
  const hex = "1234567890abcdef";
  let result = "12345678901234567890";
  for (let i = 0; i < 4; i++) {
    result += hex[Math.floor(Math.random() * 16)];
  }
  return result;
}

async function uploadBuffer(buffer, filename, contentType) {
  try {
    const bucket = await getBucket();
    return await new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(filename, { contentType });
      Readable.from(buffer).pipe(uploadStream)
        .on("error", reject)
        .on("finish", () => resolve(uploadStream.id.toString()));
    });
  } catch (err) {
    console.warn("[ProjectStore] GridFS upload failed, using memory fallback:", err.message);
    const fileId = generateMockObjectId();
    inMemoryFiles.set(fileId, { buffer, filename, contentType });
    return fileId;
  }
}

export async function streamFileById(fileId, res) {
  if (inMemoryFiles.has(fileId)) {
    const file = inMemoryFiles.get(fileId);
    res.set("Content-Type", file.contentType || "application/octet-stream");
    res.set("Content-Disposition", `attachment; filename="${file.filename}"`);
    return res.send(file.buffer);
  }

  try {
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
  } catch (err) {
    console.error("[ProjectStore] Stream file error:", err.message);
    res.status(404).json({ error: "File not found or DB offline" });
  }
}

export { uploadBuffer };

export async function saveProjectRecord({ studentId, projectData, critic, docxBuffer, pptxBuffer }) {
  const docxFileId = await uploadBuffer(docxBuffer, `${projectData.title}.docx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  const pptxFileId = await uploadBuffer(pptxBuffer, `${projectData.title}.pptx`, "application/vnd.openxmlformats-officedocument.presentationml.presentation");

  try {
    const db = await getDb();
    const result = await db.collection("projects").insertOne({
      studentId, projectData, critic, docxFileId, pptxFileId, createdAt: new Date(),
    });
    return { projectId: result.insertedId.toString(), docxFileId, pptxFileId };
  } catch (err) {
    console.warn("[ProjectStore] Mongo insertOne failed, saving to in-memory fallback:", err.message);
    const projectId = generateMockObjectId();
    const projectRecord = { _id: projectId, studentId, projectData, critic, docxFileId, pptxFileId, createdAt: new Date() };
    inMemoryProjects.set(projectId, projectRecord);
    return { projectId, docxFileId, pptxFileId };
  }
}

export async function getProjectById(projectId) {
  try {
    const db = await getDb();
    const { ObjectId } = await import("mongodb");
    const project = await db.collection("projects").findOne({ _id: new ObjectId(projectId) });
    if (project) return project;
  } catch (err) {
    console.warn("[ProjectStore] Mongo getProjectById failed:", err.message);
  }
  return inMemoryProjects.get(projectId) || null;
}

export async function listProjects(studentId, limit = 20) {
  try {
    const db = await getDb();
    return await db.collection("projects")
      .find({ studentId })
      .project({ "projectData.title": 1, status: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  } catch (err) {
    console.warn("[ProjectStore] Mongo listProjects failed, using memory store:", err.message);
    return Array.from(inMemoryProjects.values())
      .filter((p) => p.studentId === studentId)
      .slice(0, limit);
  }
}

export async function saveDraft(draftData) {
  const id = draftData.draftId || generateMockObjectId();
  const record = { draftId: id, ...draftData, createdAt: new Date() };
  inMemoryDrafts.set(id, record);
  try {
    const db = await getDb();
    await db.collection("drafts").updateOne(
      { draftId: id },
      { $set: record },
      { upsert: true }
    );
    return id;
  } catch (err) {
    console.warn("[ProjectStore] Mongo saveDraft failed, saved to memory fallback:", err.message);
    return id;
  }
}

export async function getDraft(draftId) {
  if (inMemoryDrafts.has(draftId)) {
    return inMemoryDrafts.get(draftId);
  }
  try {
    const db = await getDb();
    let draft = await db.collection("drafts").findOne({ draftId: draftId });
    if (draft) return draft;
    const { ObjectId } = await import("mongodb");
    if (ObjectId.isValid(draftId)) {
      draft = await db.collection("drafts").findOne({ _id: new ObjectId(draftId) });
      if (draft) return draft;
    }
  } catch (err) {
    console.warn("[ProjectStore] Mongo getDraft failed:", err.message);
  }
  return null;
}


