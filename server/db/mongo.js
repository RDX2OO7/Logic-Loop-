import { MongoClient, GridFSBucket } from "mongodb";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Always resolve .env from server/ regardless of where node is run from
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

let _client = null;
let _db = null;
let _bucket = null;

export async function getDb() {
  if (_db) return _db;
  if (!process.env.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI in .env — get a free cluster at https://www.mongodb.com/cloud/atlas/register");
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
