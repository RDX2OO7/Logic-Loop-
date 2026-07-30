import { uploadBuffer } from "./projectStore.js";
import { getBucket } from "./mongo.js";

async function main() {
  const testBuffer = Buffer.from("hello researchos, this is a test file");
  const fileId = await uploadBuffer(testBuffer, "test.txt", "text/plain");
  console.log("Uploaded, fileId:", fileId);

  const bucket = await getBucket();
  const { ObjectId } = await import("mongodb");
  const chunks = [];
  await new Promise((resolve, reject) => {
    bucket.openDownloadStream(new ObjectId(fileId))
      .on("data", (chunk) => chunks.push(chunk))
      .on("end", resolve)
      .on("error", reject);
  });
  const downloaded = Buffer.concat(chunks).toString();
  console.log("Downloaded:", downloaded);
  console.log(downloaded === "hello researchos, this is a test file" ? "PASS: round-trip byte-identical" : "FAIL");
  process.exit(0);
}

main();
