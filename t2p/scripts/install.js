#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("📦 Installing t2p - Tag and Todo Management CLI...");

// Create necessary directories
try {
  // Install dependencies
  console.log("📥 Installing dependencies...");
  execSync("npm install", { stdio: "inherit" });

  // Build the project
  console.log("🔨 Building project...");
  execSync("npm run build", { stdio: "inherit" });

  // Install globally
  console.log("🌐 Installing globally...");
  execSync("npm install -g .", { stdio: "inherit" });

  console.log("✅ t2p has been successfully installed!");
  console.log("");
  console.log("Try running: t2p --help");
} catch (error) {
  console.error("❌ Installation failed:", error.message);
  process.exit(1);
} 