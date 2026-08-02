// ResearchOS Extension - Background Service Worker (v1.1.0)
// Runs pipeline autonomously in the background, handles storage state, notifications & context menus

const BACKEND_URL = "http://localhost:3001";

// Initialize Context Menu on Install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "researchWithResearchOS",
    title: "Research this with ResearchOS",
    contexts: ["selection"]
  });
  console.log("ResearchOS Service Worker initialized.");
});

// Helper: Format Time string [HH:MM:SS]
function getTimeString() {
  return new Date().toTimeString().split(" ")[0];
}

// Helper: Show OS Level Desktop Notification
function showNotification(title, message) {
  if (chrome.notifications) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: title,
      message: message,
      priority: 2
    });
  }
}

// Helper: Save & Broadcast state updates to storage and active popup
async function updateState(newState) {
  return new Promise((resolve) => {
    chrome.storage.local.get(["logs"], (res) => {
      const logs = res.logs || [];
      const updatedData = { ...newState };

      chrome.storage.local.set(updatedData, () => {
        // Broadcast to popup if open
        chrome.runtime.sendMessage({
          action: "STATE_UPDATED",
          state: updatedData
        }).catch(() => {
          // Popup might be closed; silent catch
        });
        resolve();
      });
    });
  });
}

// Append log entry to background state
async function addLog(message, isHighlight = false) {
  return new Promise((resolve) => {
    chrome.storage.local.get(["logs"], (res) => {
      const logs = res.logs || [];
      const newEntry = { time: getTimeString(), message, isHighlight };
      logs.push(newEntry);

      chrome.storage.local.set({ logs }, () => {
        chrome.runtime.sendMessage({
          action: "NEW_LOG",
          log: newEntry,
          logs
        }).catch(() => {
          // Popup closed; silent catch
        });
        resolve();
      });
    });
  });
}

// SSE Stream Reader for Service Worker
async function readSSEStream(url, bodyData, onProgress, onDone, onError) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData)
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop(); // keep partial line

      let currentEvent = "message";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith("event: ")) {
          currentEvent = trimmed.substring(7).trim();
        } else if (trimmed.startsWith("data: ")) {
          const rawData = trimmed.substring(6).trim();
          try {
            const data = JSON.parse(rawData);
            if (currentEvent === "progress") {
              onProgress(data.message || "Processing...");
            } else if (currentEvent === "done") {
              onDone(data);
            } else if (currentEvent === "error") {
              onError(data.error || "Unknown error occurred");
            }
          } catch (e) {
            console.warn("Could not parse SSE JSON line:", rawData);
          }
        }
      }
    }
  } catch (err) {
    onError(err.message);
  }
}

// Core Pipeline Execution (runs fully in background)
async function runPipeline(ideaText) {
  console.log("Starting pipeline for idea:", ideaText);

  // Initialize pipeline state in local storage
  await chrome.storage.local.set({
    pipelineState: "running",
    ideaText: ideaText,
    currentStep: "Phase 1: Discovery & Parallel Search...",
    logs: [],
    results: null,
    error: null
  });

  await addLog("Starting ResearchOS Multi-Agent Pipeline...", true);
  await addLog(`Topic: "${ideaText}"`);

  // Step 1: Discover Phase
  await readSSEStream(
    `${BACKEND_URL}/api/discover`,
    { idea: ideaText, studentId: "chrome-extension-user" },
    async (progressMsg) => {
      await updateState({ currentStep: progressMsg });
      await addLog(progressMsg);
    },
    async (doneData) => {
      if (doneData.status === "needs_clarification") {
        await updateState({ pipelineState: "error", error: doneData.question });
        await addLog(`[Clarification Required] ${doneData.question}`, true);
        showNotification("ResearchOS Needs Clarification", doneData.question);
        return;
      }

      if (doneData.status === "insufficient_evidence") {
        await updateState({ pipelineState: "error", error: doneData.evidence_summary });
        await addLog(`[Insufficient Evidence] ${doneData.evidence_summary}`, true);
        showNotification("ResearchOS - Insufficient Evidence", "Not enough sources found for this topic.");
        return;
      }

      const draftId = doneData.draftId;
      const angleCount = doneData.angles?.length || 0;
      await addLog(`Found ${angleCount} directions!`, true);
      await addLog("Phase 1 Complete! Innovation angles identified.", true);
      const topAngle = doneData.angles?.[0] || { angle: "Primary Innovation Angle" };

      // Step 2: Planning Phase
      await updateState({
        draftId,
        angleCount,
        currentStep: "Phase 2: Project Planning & Architecture..."
      });
      await addLog(`Selected Top Angle: "${topAngle.angle}"`, true);
      await addLog("Starting Project Planning Agent & Critic Verification...");

      await readSSEStream(
        `${BACKEND_URL}/api/plan`,
        { draftId, selection: 0, studentId: "chrome-extension-user" },
        async (planMsg) => {
          await updateState({ currentStep: planMsg });
          await addLog(planMsg);
        },
        async (finalData) => {
          await addLog("Phase 2 Complete! Project plan verified and exported.", true);

          const result = finalData.results?.[0] || finalData;
          const projectData = result.projectData || {};
          const exports = result.exports || {};
          const title = projectData.title || doneData.normalized_problem || ideaText;

          const resultsPayload = {
            title,
            angle: projectData.chosen_angle?.angle || topAngle.angle,
            summary: projectData.plan?.summary || "Verified architecture and project roadmap generated successfully.",
            projectId: result.projectId,
            docxUrl: exports.docxUrl ? `${BACKEND_URL}${exports.docxUrl}` : null,
            pptxUrl: exports.pptxUrl ? `${BACKEND_URL}${exports.pptxUrl}` : null
          };

          await updateState({
            pipelineState: "completed",
            currentStep: "Pipeline Completed Successfully!",
            results: resultsPayload
          });

          // Trigger OS Notification
          showNotification(
            "ResearchOS Plan Ready! 🚀",
            `Project plan generated for: "${title.substring(0, 60)}..."`
          );
        },
        async (planErr) => {
          await updateState({ pipelineState: "error", error: planErr });
          await addLog(`Error in Planning Phase: ${planErr}`, true);
          showNotification("ResearchOS Error", `Planning failed: ${planErr}`);
        }
      );
    },
    async (discoverErr) => {
      await updateState({ pipelineState: "error", error: discoverErr });
      await addLog(`Error in Discovery Phase: ${discoverErr}`, true);
      showNotification("ResearchOS Error", `Discovery failed: ${discoverErr}`);
    }
  );
}

// Right-click Context Menu listener
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "researchWithResearchOS" && info.selectionText) {
    const selectedText = info.selectionText.trim();
    if (selectedText) {
      showNotification("ResearchOS Pipeline Started", `Researching: "${selectedText.substring(0, 40)}..."`);
      runPipeline(selectedText);
    }
  }
});

// Runtime Message listener from Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if ((request.action === "START_PIPELINE" || request.type === "startRun") && request.idea) {
    runPipeline(request.idea);
    sendResponse({ status: "started" });
  } else if (request.action === "RESET_PIPELINE" || request.type === "resetRun") {
    chrome.storage.local.set({
      pipelineState: "idle",
      ideaText: "",
      currentStep: "",
      logs: [],
      results: null,
      error: null
    }, () => {
      sendResponse({ status: "reset" });
    });
    return true;
  }
});
