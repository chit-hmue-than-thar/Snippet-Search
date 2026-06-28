const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const backendDir = path.join(__dirname, "..", "backend");
const venvPython =
  process.platform === "win32"
    ? path.join(backendDir, ".venv", "Scripts", "python.exe")
    : path.join(backendDir, ".venv", "bin", "python");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set.");
  console.error("");
  console.error("Set your Neon connection string, then run seed again.");
  console.error("");
  console.error("  cmd:");
  console.error('    set "DATABASE_URL=postgresql://user:pass@host/neondb?sslmode=require"');
  console.error("    npm run seed:neon");
  console.error("");
  console.error("  PowerShell:");
  console.error('    $env:DATABASE_URL="postgresql://user:pass@host/neondb?sslmode=require"');
  console.error("    npm run seed:neon");
  process.exit(1);
}

if (!fs.existsSync(venvPython)) {
  console.error("Backend venv not found. Run: npm run backend:venv");
  process.exit(1);
}

console.log("Seeding Neon database...");
const result = spawnSync(venvPython, ["seed.py"], {
  cwd: backendDir,
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
