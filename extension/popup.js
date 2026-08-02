// ResearchOS Extension - Popup UI Controller (v1.1.0)

const BACKEND_URL = "http://localhost:3001";

// DOM Elements
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");

const inputView = document.getElementById("inputView");
const progressView = document.getElementById("progressView");
const resultsView = document.getElementById("resultsView");

const ideaEl = document.getElementById("ideaInput") || document.getElementById("ideaEl");
const submitEl = document.getElementById("generateBtn") || document.getElementById("submitEl");
const sampleBtn = document.getElementById("sampleBtn");
const clearBtn = document.getElementById("clearBtn");

const stepText = document.getElementById("stepText");
const consoleLog = document.getElementById("consoleLog");

const resTitle = document.getElementById("resTitle");
const resAngle = document.getElementById("resAngle");
const resSummary = document.getElementById("resSummary");
const docxBtn = document.getElementById("docxBtn");
const pptxBtn = document.getElementById("pptxBtn");
const dashboardLink = document.getElementById("dashboardLink");
const newResearchBtn = document.getElementById("newResearchBtn");

const viewAnglesAppBtn = document.getElementById("viewAnglesAppBtn");

// Check backend connection
async function checkBackendStatus() {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { method: "GET" });
    if (res.ok) {
      statusDot.className = "status-dot online";
      statusText.textContent = "Backend Online (http://localhost:3001)";
      if (submitEl) submitEl.disabled = false;
    } else {
      throw new Error(`Status ${res.status}`);
    }
  } catch (err) {
    statusDot.className = "status-dot offline";
    statusText.textContent = "Backend Offline (Start node server in /server)";
  }
}

// Switch UI views
function showView(viewId) {
  inputView.classList.remove("active");
  progressView.classList.remove("active");
  resultsView.classList.remove("active");

  if (viewId === "input") inputView.classList.add("active");
  if (viewId === "progress") progressView.classList.add("active");
  if (viewId === "results") resultsView.classList.add("active");
}

// Append single log entry to DOM console log
function appendLogEntry(logObj) {
  const { time, message, isHighlight } = logObj;

  const entry = document.createElement("div");
  entry.className = `log-entry ${isHighlight ? "highlight" : ""}`;

  const timeSpan = document.createElement("span");
  timeSpan.className = "time";
  timeSpan.textContent = `[${time || ""}]`;

  const msgSpan = document.createElement("span");
  msgSpan.className = "msg";
  msgSpan.textContent = message || "";

  entry.appendChild(timeSpan);
  entry.appendChild(msgSpan);

  consoleLog.appendChild(entry);
  consoleLog.scrollTop = consoleLog.scrollHeight;
}

// Render full logs array
function renderLogs(logsArray = []) {
  consoleLog.innerHTML = "";
  logsArray.forEach((log) => appendLogEntry(log));
}

// Render results view
function renderResults(results) {
  if (!results) return;
  resTitle.textContent = results.title || "ResearchOS Project Plan";
  resAngle.textContent = results.angle || "Verified Innovation Angle";
  resSummary.textContent = results.summary || "Architecture and project roadmap generated successfully.";

  if (results.docxUrl) {
    docxBtn.href = results.docxUrl;
    docxBtn.style.display = "flex";
  } else {
    docxBtn.style.display = "none";
  }

  if (results.pptxUrl) {
    pptxBtn.href = results.pptxUrl;
    pptxBtn.style.display = "flex";
  } else {
    pptxBtn.style.display = "none";
  }

  if (results.projectId) {
    dashboardLink.href = `http://localhost:5173/?projectId=${results.projectId}`;
  } else {
    dashboardLink.href = `http://localhost:5173/`;
  }

  showView("results");
}

// Sync UI from storage state
function syncFromStorage() {
  chrome.storage.local.get(
    ["pipelineState", "currentStep", "logs", "results", "ideaText", "pendingIdea", "draftId", "angleCount"],
    (data) => {
      const state = data.pipelineState || "idle";

      if (data.draftId && viewAnglesAppBtn) {
        viewAnglesAppBtn.href = `http://localhost:5173/plan/${data.draftId}`;
        viewAnglesAppBtn.textContent = `View ${data.angleCount || "all"} directions in full app 🚀`;
        viewAnglesAppBtn.style.display = "block";
      }

      if (state === "running") {
        showView("progress");
        stepText.textContent = data.currentStep || "Processing...";
        renderLogs(data.logs || []);
      } else if (state === "completed") {
        renderResults(data.results);
      } else {
        showView("input");
        if (data.pendingIdea && !ideaEl.value) {
          ideaEl.value = data.pendingIdea;
          chrome.storage.local.remove(["pendingIdea"]);
        } else if (data.ideaText && !ideaEl.value) {
          ideaEl.value = data.ideaText;
        }
      }
    }
  );
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  checkBackendStatus();
  syncFromStorage();

  // Submit button event listener
  submitEl.addEventListener("click", () => {
    const idea = ideaEl.value.trim();
    if (!idea) return;
    showView("progress");
    stepText.textContent = "Starting Multi-Agent Pipeline...";
    consoleLog.innerHTML = "";
    chrome.runtime.sendMessage({ type: "startRun", action: "START_PIPELINE", idea });
  });

  // Example chip click listener
  document.querySelectorAll(".example-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      ideaEl.value = chip.dataset.idea;
    });
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      ideaEl.value = "";
    });
  }

  if (newResearchBtn) {
    newResearchBtn.addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "resetRun", action: "RESET_PIPELINE" }, () => {
        ideaEl.value = "";
        showView("input");
      });
    });
  }

  // Listen for live background updates while popup is open
  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "NEW_LOG" && request.log) {
      appendLogEntry(request.log);
    } else if (request.action === "STATE_UPDATED" && request.state) {
      if (request.state.currentStep) {
        stepText.textContent = request.state.currentStep;
      }
      // Show "View directions in full app" button as soon as draftId is available
      if (request.state.draftId && viewAnglesAppBtn) {
        viewAnglesAppBtn.href = `http://localhost:5173/plan/${request.state.draftId}`;
        viewAnglesAppBtn.textContent = `View ${request.state.angleCount || "all"} directions in full app 🚀`;
        viewAnglesAppBtn.style.display = "block";
      }
      if (request.state.pipelineState === "completed" && request.state.results) {
        renderResults(request.state.results);
      }
    }
  });
});
