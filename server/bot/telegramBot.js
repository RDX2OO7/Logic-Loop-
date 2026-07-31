import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
dotenv.config();
import { parseCommand } from "./commandParser.js";
import { getProjectById } from "../db/projectStore.js";
import { linkTelegramChat, getTaskProgress, findNextIncompleteTask, getLinkedProjectId, markTaskDone, saveTaskProgress, setTaskDone, getTaskByNumber } from "../db/taskProgress.js";
import { generateText } from "../lib/geminiClient.js";
import { runExplainerAgent } from "../agents/explainerAgent.js";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("Missing TELEGRAM_BOT_TOKEN in .env");

async function safeSendMessage(bot, chatId, text, options = {}) {
  try {
    return await bot.sendMessage(chatId, text, options);
  } catch (err) {
    if (options.parse_mode && (err.message?.includes("can't parse entities") || err.code === "ETELEGRAM")) {
      console.warn("[bot] Markdown parsing failed, falling back to plain text:", err.message);
      const plainOptions = { ...options };
      delete plainOptions.parse_mode;
      try {
        return await bot.sendMessage(chatId, text, plainOptions);
      } catch (fallbackErr) {
        console.error("[bot] Fallback sendMessage failed:", fallbackErr.message);
      }
    } else {
      console.error("[bot] sendMessage failed:", err.message);
    }
  }
}

export function startBot() {
  const bot = new TelegramBot(token, { polling: true });

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    try {
      const parsed = parseCommand(msg.text);

      if (parsed.type === "error") {
        return await safeSendMessage(bot, chatId, parsed.message);
      }

      if (parsed.type === "command" && parsed.command === "start") {
        return await safeSendMessage(bot, chatId, "Welcome to ResearchOS. Link your project with /link <projectId> — you'll find your project ID on the Results page after generating a plan.");
      }

      if (parsed.type === "command" && parsed.command === "link") {
        try {
          const project = await getProjectById(parsed.projectId);
          if (!project) return await safeSendMessage(bot, chatId, `No project found with ID ${parsed.projectId} — double-check it from the app.`);
          await linkTelegramChat(chatId, parsed.projectId);
          return await safeSendMessage(bot, chatId, `Linked to: "${project.projectData.title}". Try /status or /tasks.`);
        } catch (err) {
          return await safeSendMessage(bot, chatId, `Couldn't link that project ID — ${err.message}`);
        }
      }

      if (parsed.type === "command" && (parsed.command === "status" || parsed.command === "tasks")) {
        const projectId = await getLinkedProjectId(chatId);
        if (!projectId) return await safeSendMessage(bot, chatId, "Not linked to a project yet — use /link <projectId> first.");

        const progress = await getTaskProgress(projectId);
        const totalTasks = progress.reduce((sum, m) => sum + m.subtasks.length, 0);
        const doneTasks = progress.reduce((sum, m) => sum + m.subtasks.filter(s => s.done).length, 0);

        if (parsed.command === "status") {
          return await safeSendMessage(bot, chatId, `Progress: ${doneTasks}/${totalTasks} tasks complete.`);
        }

        // /tasks — full numbered list, flat-indexed to match /done <n>
        let output = "";
        let counter = 1;
        progress.forEach((m) => {
          output += `\n*${m.name}*\n`;
          m.subtasks.forEach((s) => {
            output += `${s.done ? "✅" : "⬜"} ${counter}. ${s.text}\n`;
            counter++;
          });
        });
        return await safeSendMessage(bot, chatId, output, { parse_mode: "Markdown" });
      }

      if (parsed.type === "command" && parsed.command === "done") {
        const projectId = await getLinkedProjectId(chatId);
        if (!projectId) return await safeSendMessage(bot, chatId, "Not linked yet — use /link <projectId> first.");
        try {
          await setTaskDone(projectId, parsed.taskNumber - 1, true); // /done is 1-indexed for humans, storage is 0-indexed
          return await safeSendMessage(bot, chatId, `✅ Marked task ${parsed.taskNumber} done.`);
        } catch (err) {
          return await safeSendMessage(bot, chatId, `Couldn't mark that task: ${err.message}`);
        }
      }

      if (parsed.type === "command" && parsed.command === "next") {
        const projectId = await getLinkedProjectId(chatId);
        if (!projectId) return await safeSendMessage(bot, chatId, "Not linked yet.");
        const progress = await getTaskProgress(projectId);
        const next = findNextIncompleteTask(progress);
        return await safeSendMessage(bot, chatId, next ? `Next up: ${next.text} (${next.milestone})` : "🎉 Everything's done!");
      }

      if (parsed.type === "command" && parsed.command === "task") {
        const projectId = await getLinkedProjectId(chatId);
        if (!projectId) return await safeSendMessage(bot, chatId, "Not linked yet — use /link <projectId> first.");
        const progress = await getTaskProgress(projectId);
        const next = findNextIncompleteTask(progress);
        if (!next) return await safeSendMessage(bot, chatId, "🎉 All tasks are done — nothing left!");
        // Compute 1-based task number
        let taskNumber = 1;
        outer: for (const m of progress) {
          for (const s of m.subtasks) {
            if (s.flatIndex === next.flatIndex) break outer;
            taskNumber++;
          }
        }
        const totalTasks = progress.reduce((sum, m) => sum + m.subtasks.length, 0);
        const doneTasks = progress.reduce((sum, m) => sum + m.subtasks.filter(s => s.done).length, 0);
        return await safeSendMessage(
          bot,
          chatId,
          `📋 *Current Task* (#${taskNumber} of ${totalTasks})\n\n*${next.text}*\n_Milestone: ${next.milestone}_\n\nProgress: ${doneTasks}/${totalTasks} done`,
          { parse_mode: "Markdown" }
        );
      }

      if (parsed.type === "command" && parsed.command === "remind") {
        return await safeSendMessage(bot, chatId, "Reminders aren't wired up yet — coming soon.");
      }

      if (parsed.type === "command" && parsed.command === "explain") {
        const projectId = await getLinkedProjectId(chatId);
        if (!projectId) return await safeSendMessage(bot, chatId, "Not linked yet — use /link <projectId> first.");

        try {
          const progress = await getTaskProgress(projectId);
          const task = parsed.taskNumber
            ? getTaskByNumber(progress, parsed.taskNumber)
            : findNextIncompleteTask(progress);

          if (!task) {
            return await safeSendMessage(
              bot,
              chatId,
              parsed.taskNumber
                ? `No task numbered ${parsed.taskNumber}.`
                : "Everything's already done — nothing to explain!"
            );
          }

          await bot.sendChatAction(chatId, "typing");

          const project = await getProjectById(projectId);
          const explanation = await runExplainerAgent(task, {
            architecture: project.projectData.plan.architecture,
            tech_stack: project.projectData.plan.tech_stack,
            angle: project.projectData.chosen_angle?.angle,
          });

          return await safeSendMessage(
            bot,
            chatId,
            `*${task.milestone} — Task: ${task.text}*\n\n${explanation}`,
            { parse_mode: "Markdown" }
          );
        } catch (err) {
          console.error("[/explain] error:", err.message);
          return await safeSendMessage(bot, chatId, `Couldn't generate an explanation right now: ${err.message}`);
        }
      }

      if (parsed.type === "text") {
        const projectId = await getLinkedProjectId(chatId);
        if (!projectId) {
          return await safeSendMessage(bot, chatId, "Please /link a project first so I know what we are discussing.");
        }

        try {
          const project = await getProjectById(projectId);
          const progress = await getTaskProgress(projectId);
          const next = findNextIncompleteTask(progress);

          const totalTasks = progress.reduce((sum, m) => sum + m.subtasks.length, 0);
          const doneTasks = progress.reduce((sum, m) => sum + m.subtasks.filter(s => s.done).length, 0);

          const context = `Project Title: ${project.projectData?.title || 'Unknown'}
Overall Progress: ${doneTasks}/${totalTasks} tasks complete.
Next Task: ${next ? next.text : 'None, project complete.'}`;

          const systemInstruction = "Answer questions about this specific project plan using only the provided context, don't invent details. Keep it conversational and brief.";
          const userPrompt = `Context:\n${context}\n\nUser Question:\n${parsed.raw}`;

          bot.sendChatAction(chatId, "typing");
          const reply = await generateText(systemInstruction, userPrompt);
          return await safeSendMessage(bot, chatId, reply);
        } catch (err) {
          console.error("Text parsing error:", err);
          return await safeSendMessage(bot, chatId, "Sorry, I had trouble answering that.");
        }
      }
    } catch (outerErr) {
      // Safety net: log but never crash the process
      console.error("[bot] unhandled error in message handler:", outerErr.message);
    }
  });

  bot.on("polling_error", (err) => console.error("[bot] polling error:", err.message));

  console.log("Telegram bot started (polling mode)");
  return bot;
}
