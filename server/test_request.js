async function main() {
  console.log("Sending request to local server on port 3001...");
  try {
    const res = await fetch("http://localhost:3001/api/discover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea: "Build an AI solution to reduce food waste in college hostels", studentId: "demo-student" })
    });

    if (!res.ok) {
      console.error("HTTP error:", res.status);
      const text = await res.text();
      console.error("Response:", text);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      console.log(decoder.decode(value));
    }
    console.log("Stream ended.");
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

main();
