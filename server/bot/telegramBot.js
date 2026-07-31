import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
dotenv.config();
import { parseCommand } from "./commandParser.js";
import { getProjectById } from "../db/projectStore.js";
import { linkTelegramChat, getTaskProgress, findNextIncompleteTask, getLinkedProjectId, markTaskDone, saveTaskProgress, setTaskDone } from "../db/taskProgress.js";
import { generateText } from "../lib/geminiClient.js";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("Missing TELEGRAM_BOT_TOKEN in .env");

export function startBot() {
  const bot = new TelegramBot(token, { polling: true });

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const parsed = parseCommand(msg.text);

    if (parsed.type === "error") {
      return bot.sendMessage(chatId, parsed.message);
    }

    if (parsed.type === "command" && parsed.command === "start") {
      return bot.sendMessage(chatId, "Welcome to ResearchOS. Link your project with /link <projectId> — you'll find your project ID on the Results page after generating a plan.");
    }

    if (parsed.type === "command" && parsed.command === "link") {
      try {
        const project = await getProjectById(parsed.projectId);
        if (!project) return bot.sendMessage(chatId, `No project found with ID ${parsed.projectId} — double-check it from the app.`);
        await linkTelegramChat(chatId, parsed.projectId);
        return bot.sendMessage(chatId, `Linked to: "${project.projectData.title}". Try /status or /tasks.`);
      } catch (err) {
        return bot.sendMessage(chatId, `Couldn't link that project ID — ${err.message}`);
      }
    }

    if (parsed.type === "command" && (parsed.command === "status" || parsed.command === "tasks")) {
      const projectId = await getLinkedProjectId(chatId);
      if (!projectId) return bot.sendMessage(chatId, "Not linked to a project yet — use /link <projectId> first.");

      const progress = await getTaskProgress(projectId);
      const totalTasks = progress.reduce((sum, m) => sum + m.subtasks.length, 0);
      const doneTasks = progress.reduce((sum, m) => sum + m.subtasks.filter(s => s.done).length, 0);

      if (parsed.command === "status") {
        return bot.sendMessage(chatId, `Progress: ${doneTasks}/${totalTasks} tasks complete.`);
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
      return bot.sendMessage(chatId, output, { parse_mode: "Markdown" });
    }

    if (parsed.type === "command" && parsed.command === "done") {
      const projectId = await getLinkedProjectId(chatId);
      if (!projectId) return bot.sendMessage(chatId, "Not linked yet — use /link <projectId> first.");
      try {
        await setTaskDone(projectId, parsed.taskNumber - 1, true); // /done is 1-indexed for humans, storage is 0-indexed
        return bot.sendMessage(chatId, `✅ Marked task ${parsed.taskNumber} done.`);
      } catch (err) {
        return bot.sendMessage(chatId, `Couldn't mark that task: ${err.message}`);
      }
    }

    if (parsed.type === "command" && parsed.command === "next") {
      const projectId = await getLinkedProjectId(chatId);
      if (!projectId) return bot.sendMessage(chatId, "Not linked yet.");
      const progress = await getTaskProgress(projectId);
      const next = findNextIncompleteTask(progress);
      return bot.sendMessage(chatId, next ? `Next up: ${next.text} (${next.milestone})` : "🎉 Everything's done!");
    }

    if (parsed.type === "command" && parsed.command === "remind") {
      return bot.sendMessage(chatId, "Reminders aren't wired up yet — coming soon.");
    }

    if (parsed.type === "text") {
      const projectId = await getLinkedProjectId(chatId);
      if (!projectId) {
        return bot.sendMessage(chatId, "Please /link a project first so I know what we are discussing.");
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
        return bot.sendMessage(chatId, reply);
      } catch (err) {
        console.error("Text parsing error:", err);
        return bot.sendMessage(chatId, "Sorry, I had trouble answering that.");
      }
    }
  });

  console.log("Telegram bot started (polling mode)");
  return bot;
}
