import { getDb } from "./mongo.js";

async function main() {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    console.log("✅ MongoDB connected successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
    process.exit(1);
  }
}

main();
