import { MongoClient, GridFSBucket } from "mongodb";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import dns from "dns";

// Resolve .env from server/ or project root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

// Resolve SRV DNS query issues (querySrv ECONNREFUSED) common on Windows / local ISP DNS
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {
  // Ignore fallback error
}

let _client = null;
let _db = null;
let _bucket = null;

export async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.warn("⚠️ MONGODB_URI is not set. Operating with in-memory storage fallback.");
    return null;
  }
  try {
    const db = await getDb();
    console.log("✅ Successfully connected to MongoDB Atlas");
    return db;
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    console.warn("⚠️ Continuing with in-memory storage fallback.");
    return null;
  }
}

export async function getDb() {
  if (_db) return _db;
  if (!process.env.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI in environment variables — get a free cluster at https://www.mongodb.com/cloud/atlas/register");
  }
  _client = new MongoClient(process.env.MONGODB_URI);
  await _client.connect();
  _db = _client.db("researchos");
  return _db;
}

export async function getBucket() {
  if (_bucket) return _bucket;
  const db = await getDb();
  _bucket = new GridFSBucket(db, { bucketName: "exports" });
  return _bucket;
}

export async function closeMongoConnection() {
  if (_client) await _client.close();
  _client = null;
  _db = null;
  _bucket = null;
}

