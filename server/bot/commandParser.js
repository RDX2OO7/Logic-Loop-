/**
 * commandParser.js
 *
 * Pure-logic Telegram command parser. Zero network dependencies — safe offline.
 *
 * Supported commands and their expected arguments:
 *   /start                  — no args
 *   /link <projectId>       — one positional arg (projectId)
 *   /done <taskNumber>      — one positional arg (1-based task number)
 *   /status                 — no args
 *   /tasks                  — no args
 *
 * Return shapes
 * ─────────────
 *   Non-command text:
 *     { type: "text", raw: string }
 *
 *   Recognised command, correct args:
 *     { type: "command", command: string, raw: string, ...extraFields }
 *
 *   Recognised command, wrong/missing args:
 *     { type: "error", command: string, message: string, raw: string }
 *
 *   Unrecognised /command:
 *     { type: "unknown", raw: string }
 */

/** Map of known commands to their arg requirements. */
const COMMAND_SPECS = {
  start:  { args: 0 },
  link:   { args: 1, argName: "projectId" },
  done:   { args: 1, argName: "taskNumber", validate: isPositiveInt },
  status: { args: 0 },
  tasks:  { args: 0 },
  next:   { args: 0 },
  remind: { args: 0 },
};

function isPositiveInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
}

/**
 * Parse a raw Telegram message string into a structured result.
 *
 * @param {string | undefined | null} text
 * @returns {{ type: string, [key: string]: any }}
 */
export function parseCommand(text) {
  const raw = (text ?? "").trim();

  // Not a command at all
  if (!raw.startsWith("/")) {
    return { type: "text", raw };
  }

  // Split on whitespace: ["/commandName", ...args]
  const parts = raw.split(/\s+/);
  // Normalise: strip leading slash, lower-case
  const commandRaw = parts[0].slice(1).toLowerCase();
  const args = parts.slice(1);

  const spec = COMMAND_SPECS[commandRaw];

  // Unknown /command
  if (!spec) {
    return { type: "unknown", raw };
  }

  const command = commandRaw;

  // Wrong number of args
  if (args.length < spec.args) {
    return {
      type: "error",
      command,
      message: `/${command} requires ${spec.args} argument(s). Usage: /${command}${spec.argName ? ` <${spec.argName}>` : ""}`,
      raw,
    };
  }

  // Validate the single arg where a validator is defined
  if (spec.args === 1 && spec.validate && !spec.validate(args[0])) {
    return {
      type: "error",
      command,
      message: `/${command}: "${args[0]}" is not a valid ${spec.argName}.`,
      raw,
    };
  }

  // Build the result object with command-specific extra fields
  const result = { type: "command", command, raw };

  if (command === "link")   result.projectId   = args[0];
  if (command === "done")   result.taskNumber  = parseInt(args[0], 10);

  return result;
}
