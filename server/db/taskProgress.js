/**
 * taskProgress.js
 *
 * Pure-logic utilities for building and navigating task-progress state,
 * plus a MongoDB persistence helper (saveTaskProgress).
 *
 * Data shape produced by buildInitialTaskProgress:
 *
 *   Array<{
 *     name:     string,           // milestone name
 *     subtasks: Array<{
 *       text:      string,        // original subtask label
 *       done:      boolean,       // completion flag (starts false)
 *       flatIndex: number,        // global sequential index across all milestones
 *     }>
 *   }>
 */

/**
 * Build a fresh progress structure from a milestone definition array.
 *
 * @param {Array<{ name: string, subtasks: string[] }>} milestones
 * @returns {Array<{ name: string, subtasks: Array<{ text: string, done: boolean, flatIndex: number }> }>}
 */
export function buildInitialTaskProgress(milestones) {
  let flatIndex = 0;

  return milestones.map((milestone) => ({
    name: milestone.name,
    subtasks: milestone.subtasks.map((subtaskText) => ({
      text: subtaskText,
      done: false,
      flatIndex: flatIndex++,
    })),
  }));
}

/**
 * Return the first subtask that is not yet done, along with its flat index
 * and text — or null if every subtask is complete.
 *
 * Walks milestones in order and crosses milestone boundaries naturally.
 *
 * @param {ReturnType<typeof buildInitialTaskProgress>} progress
 * @returns {{ flatIndex: number, milestoneIndex: number, subtaskIndex: number, text: string } | null}
 */
export function findNextIncompleteTask(progress) {
  for (let mi = 0; mi < progress.length; mi++) {
    const milestone = progress[mi];
    for (let si = 0; si < milestone.subtasks.length; si++) {
      const subtask = milestone.subtasks[si];
      if (!subtask.done) {
        return {
          flatIndex: subtask.flatIndex,
          milestoneIndex: mi,
          subtaskIndex: si,
          text: subtask.text,
        };
      }
    }
  }
  return null; // all tasks complete
}

/**
 * Mark a subtask done by flat index.
 * Mutates the progress array in-place.
 *
 * @param {ReturnType<typeof buildInitialTaskProgress>} progress
 * @param {number} targetFlatIndex
 * @returns {boolean} true if found and marked, false if index not found
 */
export function markTaskDone(progress, targetFlatIndex) {
  for (const milestone of progress) {
    for (const subtask of milestone.subtasks) {
      if (subtask.flatIndex === targetFlatIndex) {
        subtask.done = true;
        return true;
      }
    }
  }
  return false;
}

/**
 * Look up a task by its 1-based human-facing display number.
 * Mirrors the numbering shown by /tasks so /explain 3 targets exactly what
 * the user sees labelled "3." in the task list.
 *
 * @param {ReturnType<typeof buildInitialTaskProgress>} taskProgress
 * @param {number} taskNumber - 1-based
 * @returns {{ flatIndex: number, milestone: string, text: string, done: boolean } | null}
 */
export function getTaskByNumber(taskProgress, taskNumber) {
  let counter = 1;
  for (const milestone of taskProgress) {
    for (const subtask of milestone.subtasks) {
      if (counter === taskNumber) {
        return {
          flatIndex: counter - 1,
          milestone: milestone.name,
          text: subtask.text,
          done: subtask.done,
        };
      }
      counter++;
    }
  }
  return null;
}


const inMemoryTaskProgress = new Map();
const inMemoryTelegramChats = new Map();

/**
 * Persist the progress array into the existing project document in MongoDB or in-memory fallback.
 *
 * @param {string} projectId   - The string form of the project's ObjectId
 * @param {ReturnType<typeof buildInitialTaskProgress>} taskProgress
 * @returns {Promise<void>}
 */
export async function saveTaskProgress(projectId, taskProgress) {
  inMemoryTaskProgress.set(projectId, taskProgress);
  try {
    const { getDb } = await import("./mongo.js");
    const { ObjectId } = await import("mongodb");
    const db = await getDb();
    await db.collection("projects").updateOne(
      { _id: new ObjectId(projectId) },
      { $set: { taskProgress } }
    );
  } catch (err) {
    console.warn("[TaskProgress] Mongo saveTaskProgress failed, saved to memory fallback:", err.message);
  }
}

/**
 * Return a summary of overall completion.
 *
 * @param {ReturnType<typeof buildInitialTaskProgress>} progress
 * @returns {{ total: number, done: number, remaining: number, percentComplete: number }}
 */
export function getProgressSummary(progress) {
  let total = 0;
  let done = 0;
  for (const milestone of progress) {
    for (const subtask of milestone.subtasks) {
      total++;
      if (subtask.done) done++;
    }
  }
  return {
    total,
    done,
    remaining: total - done,
    percentComplete: total === 0 ? 100 : Math.round((done / total) * 100),
  };
}

/**
 * Associate a Telegram chat ID with a project so the bot can push updates.
 *
 * @param {number|string} chatId   - Telegram chat.id
 * @param {string}        projectId - MongoDB project ObjectId string
 * @returns {Promise<void>}
 */
export async function linkTelegramChat(chatId, projectId) {
  inMemoryTelegramChats.set(String(chatId), projectId);
  try {
    const { getDb } = await import("./mongo.js");
    const { ObjectId } = await import("mongodb");
    const db = await getDb();
    await db.collection("projects").updateOne(
      { _id: new ObjectId(projectId) },
      { $set: { telegramChatId: String(chatId) } }
    );
  } catch (err) {
    console.warn("[TaskProgress] Mongo linkTelegramChat failed, saved to memory fallback:", err.message);
  }
}

/**
 * Retrieve the current taskProgress array for a project from MongoDB or in-memory fallback.
 *
 * @param {string} projectId - MongoDB project ObjectId string
 * @returns {Promise<Array>} taskProgress array or []
 */
export async function getTaskProgress(projectId) {
  try {
    const { getDb } = await import("./mongo.js");
    const { ObjectId } = await import("mongodb");
    const db = await getDb();
    const project = await db.collection("projects").findOne({ _id: new ObjectId(projectId) });
    if (project?.taskProgress) return project.taskProgress;
  } catch (err) {
    console.warn("[TaskProgress] Mongo getTaskProgress failed:", err.message);
  }
  return inMemoryTaskProgress.get(projectId) || [];
}

/**
 * Find the linked project ID for a given Telegram chat ID.
 *
 * @param {number|string} chatId - Telegram chat ID
 * @returns {Promise<string|null>} projectId string or null if not linked
 */
export async function getLinkedProjectId(chatId) {
  try {
    const { getDb } = await import("./mongo.js");
    const db = await getDb();
    const project = await db.collection("projects").findOne(
      { telegramChatId: String(chatId) },
      { sort: { createdAt: -1 } }
    );
    if (project) return project._id.toString();
  } catch (err) {
    console.warn("[TaskProgress] Mongo getLinkedProjectId failed:", err.message);
  }
  return inMemoryTelegramChats.get(String(chatId)) || null;
}

/**
 * Mark a specific subtask done (or undone) directly in MongoDB or in-memory fallback by its flatIndex.
 *
 * @param {string}  projectId   - MongoDB project ObjectId string
 * @param {number}  flatIndex   - 0-based flat index (= display number − 1)
 * @param {boolean} [done=true] - value to set
 * @returns {Promise<void>}
 */
export async function setTaskDone(projectId, flatIndex, done = true) {
  const currentProgress = inMemoryTaskProgress.get(projectId);
  if (currentProgress) {
    markTaskDone(currentProgress, flatIndex);
  }

  try {
    const { getDb } = await import("./mongo.js");
    const { ObjectId } = await import("mongodb");
    const db = await getDb();
    const result = await db.collection("projects").updateOne(
      { _id: new ObjectId(projectId), "taskProgress.subtasks.flatIndex": flatIndex },
      { $set: { "taskProgress.$[m].subtasks.$[s].done": done } },
      {
        arrayFilters: [
          { "m.subtasks.flatIndex": flatIndex },
          { "s.flatIndex": flatIndex },
        ],
      }
    );
    if (result.matchedCount === 0 && !currentProgress) {
      throw new Error(`No task with flatIndex ${flatIndex} found in project ${projectId}.`);
    }
  } catch (err) {
    if (!currentProgress) {
      throw err;
    }
    console.warn("[TaskProgress] Mongo setTaskDone failed, updated in-memory fallback:", err.message);
  }
}

