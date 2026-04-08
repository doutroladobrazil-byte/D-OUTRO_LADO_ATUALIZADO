import { createServer } from "http";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

// Use INTERNAL_API_PORT so the backend never conflicts with the public PORT
// that Render assigns to the Next.js frontend.
const port = Number(process.env.INTERNAL_API_PORT || process.env.PORT || 4000);

const server = createServer(app);

// ── Graceful shutdown ─────────────────────────────────────────────────────────
// Render (and other PaaS hosts) send SIGTERM before killing the process.
// server.close() stops accepting new connections while allowing in-flight
// requests to drain. The 10-second safety timeout force-exits if draining stalls.

function shutdown(signal: string): void {
  logger.info(`Received ${signal} — shutting down gracefully.`);

  server.close(() => {
    logger.info("HTTP server closed. Exiting.");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Graceful shutdown timeout exceeded — forcing exit.");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// ── Unhandled rejection / exception guards ────────────────────────────────────
// Log and crash on unhandled async or sync failures. A silent crash with no
// output is the worst possible observability outcome in production.

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", { reason: String(reason) });
  // Do not exit — Express 5 propagates async rejections to the error handler.
  // Only log so the operator has context if the process later becomes unhealthy.
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception — process will exit", {
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// ── Start ─────────────────────────────────────────────────────────────────────
server.listen(port, "0.0.0.0", () => {
  logger.info("D'OUTRO LADO API running", {
    port,
    env: env.NODE_ENV,
    payments: env.PAYMENTS_MODE,
    dataSource: env.DATA_SOURCE,
    auth: env.SUPABASE_JWT_SECRET ? "jwt" : env.NODE_ENV !== "production" ? "dev-tokens" : "UNCONFIGURED",
  });
});
