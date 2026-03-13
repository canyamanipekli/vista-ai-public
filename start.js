#!/usr/bin/env node
const { spawn } = require("child_process");
const path = require("path");

const cwd = __dirname;

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, {
      cwd,
      stdio: "inherit",
      shell: true,
      ...opts,
    });
    p.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`Exit ${code}`))));
    p.on("error", reject);
  });
}

(async () => {
  console.log("\n>>> Vista AI - Build & Start\n");
  try {
    console.log(">>> Build calistiriliyor...\n");
    await run("npm", ["run", "build"]);
    console.log("\n>>> Sunucu baslatiliyor: http://localhost:3000\n");
    await run("next", ["start", "-p", "3000"]);
  } catch (e) {
    console.error("\nHata:", e.message);
    process.exit(1);
  }
})();
