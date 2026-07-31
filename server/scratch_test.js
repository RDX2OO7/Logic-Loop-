import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { searchTavily, searchGitHub } from "./services/deepSearch.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "./.env") });

async function main() {
  console.log("Starting detailed API test inside server...");
  console.log("TAVILY_API_KEY exists:", !!process.env.TAVILY_API_KEY);
  console.log("GITHUB_TOKEN exists:", !!process.env.GITHUB_TOKEN);

  try {
    console.log("Calling Tavily...");
    const tavilyRes = await searchTavily("Build an AI solution to reduce food waste in college hostels");
    console.log("Tavily results count:", tavilyRes.length);
    console.log("Tavily sample:", tavilyRes);
  } catch (err) {
    console.error("Tavily error:", err);
  }

  try {
    console.log("Calling GitHub...");
    const gitHubRes = await searchGitHub("Build an AI solution to reduce food waste in college hostels");
    console.log("GitHub results count:", gitHubRes.length);
    console.log("GitHub sample:", gitHubRes);
  } catch (err) {
    console.error("GitHub error:", err);
  }
}

main();
