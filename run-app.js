#!/usr/bin/env node
const { spawn, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const cwd = __dirname;
const nextBin = path.join(cwd, "node_modules", "next", "dist", "bin", "next");
const lockPath = path.join(cwd, ".next", "lock");

if (fs.existsSync(lockPath)) {
  try {
    fs.unlinkSync(lockPath);
    console.log(">>> Eski .next/lock kaldirildi.\n");
  } catch (_) {}
}

const env = {
  ...process.env,
  FORCE_COLOR: "1",
  CI: "1",
  NODE_ENV: "production",
};

console.log(">>> Build basliyor...");
console.log(">>> Ilk build 2-5 dakika surebilir.\n");

const ticker = setInterval(() => {
  console.log(">>> (Bekleyin...)\n");
}, 60000);

const build = spawn("node", [nextBin, "build"], {
  cwd,
  env,
  stdio: ["inherit", "pipe", "pipe"],
  shell: false,
});

build.stdout.on("data", (d) => process.stdout.write(d));
build.stderr.on("data", (d) => process.stderr.write(d));

build.on("exit", (code, signal) => {
  clearInterval(ticker);
  console.log("\n>>> Build process exit code:", code, "signal:", signal);
  if (code !== 0 && code !== null) {
    console.error(">>> Build hata ile bitti. Sunucu baslatilmiyor.");
    process.exit(code || 1);
  }
  try {
    execSync("lsof -ti:3000 | xargs kill -9 2>/dev/null", { stdio: "ignore" });
  } catch (_) {}
  console.log(">>> Sunucu baslatiliyor: http://localhost:3000\n");
  const server = spawn("node", [nextBin, "start", "-p", "3000"], {
    cwd,
    env: { ...process.env, NODE_ENV: "production" },
    stdio: "inherit",
    shell: false,
  });
  server.on("exit", (c) => process.exit(c || 0));
});
