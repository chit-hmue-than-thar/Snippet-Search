const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const backendDir = path.join(__dirname, "..", "backend");
const venvDir = path.join(backendDir, ".venv");
const venvPython =
  process.platform === "win32"
    ? path.join(venvDir, "Scripts", "python.exe")
    : path.join(venvDir, "bin", "python");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    ...options,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!fs.existsSync(venvPython)) {
  console.log("Creating backend virtual environment...");
  run("python", ["-m", "venv", ".venv"], { cwd: backendDir });
}

console.log("Installing backend dependencies...");
run(venvPython, ["-m", "pip", "install", "-r", "requirements.txt"], {
  cwd: backendDir,
});

console.log("Backend venv ready.");
