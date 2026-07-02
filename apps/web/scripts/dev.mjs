import { createServer } from "node:net";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "..");

const DEFAULT_PORT = Number(process.env.PORT) || 3000;
const MAX_ATTEMPTS = 50;

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = createServer();

    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port);
  });
}

async function findAvailablePort(startPort) {
  for (let port = startPort; port < startPort + MAX_ATTEMPTS; port++) {
    if (await isPortAvailable(port)) {
      if (port !== startPort) {
        console.log(`Port ${startPort} is in use. Using port ${port} instead.`);
      }
      return port;
    }
  }

  throw new Error(
    `No available port found between ${startPort} and ${startPort + MAX_ATTEMPTS - 1}`
  );
}

const port = await findAvailablePort(DEFAULT_PORT);
console.log(`Starting Next.js at http://localhost:${port}`);

const child = spawn(
  "pnpm",
  ["exec", "next", "dev", "--turbopack", "--port", String(port)],
  {
    cwd: webRoot,
    stdio: "inherit",
    env: { ...process.env, PORT: String(port) },
    shell: process.platform === "win32",
  }
);

const shutdown = (signal) => {
  if (!child.killed) {
    child.kill(signal);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
