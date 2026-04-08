import { env } from "../config/env.js";

type LogLevel = "info" | "warn" | "error";
type Meta = Record<string, unknown>;

/**
 * Minimal structured logger.
 *
 * Production: emits newline-delimited JSON to stdout, compatible with
 * Render log drains and any log aggregator (Datadog, Papertrail, etc.).
 *
 * Development: human-readable prefix format for local readability.
 */
function write(level: LogLevel, message: string, meta?: Meta): void {
  if (env.NODE_ENV === "production") {
    process.stdout.write(
      JSON.stringify({ ts: new Date().toISOString(), level, message, ...meta }) + "\n"
    );
  } else {
    const prefix = level === "error" ? "✗" : level === "warn" ? "⚠" : "→";
    const extras = meta ? " " + JSON.stringify(meta) : "";
    // eslint-disable-next-line no-console
    console.log(`${prefix} [${level.toUpperCase()}] ${message}${extras}`);
  }
}

export const logger = {
  info: (message: string, meta?: Meta) => write("info", message, meta),
  warn: (message: string, meta?: Meta) => write("warn", message, meta),
  error: (message: string, meta?: Meta) => write("error", message, meta),
};
