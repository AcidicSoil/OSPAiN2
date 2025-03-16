#!/usr/bin/env ts-node
/**
 * Nightly Question Collection Script
 *
 * This script runs the nightly question collection process, which:
 * 1. Scans the codebase for questions marked with // QUESTION:
 * 2. Collects and organizes these questions
 * 3. Prepares them for expert research
 *
 * Usage:
 *   npx ts-node src/scripts/run-nightly-collection.ts [--source=./src] [--output=./data/questions.json]
 */

import {
  runNightlyCollection,
  NightlyQuestionCollection,
} from "../utils/NightlyQuestionCollection";
import * as path from "path";

// Parse command line arguments
const args = process.argv.slice(2);
const sourcePath =
  args.find((arg) => arg.startsWith("--source="))?.split("=")[1] || "./src";
const outputPath =
  args.find((arg) => arg.startsWith("--output="))?.split("=")[1] ||
  "./data/questions.json";

async function main() {
  console.log("=== OSPAiN2 Nightly Question Collection ===");
  console.log(`Source path: ${sourcePath}`);
  console.log(`Output path: ${outputPath}`);
  console.log("-------------------------------------------");

  try {
    // Run the collection process
    const collector = new NightlyQuestionCollection(path.resolve(outputPath));
    await collector.collectQuestions(path.resolve(sourcePath));

    // Report results
    const questions = collector.getQuestions();
    const pendingQuestions = collector.getPendingQuestions();

    console.log("\n=== Collection Results ===");
    console.log(`Total questions: ${questions.length}`);
    console.log(`Pending questions: ${pendingQuestions.length}`);

    // Summary by priority
    const prioritySummary = {
      critical: questions.filter((q) => q.priority === "critical").length,
      high: questions.filter((q) => q.priority === "high").length,
      medium: questions.filter((q) => q.priority === "medium").length,
      low: questions.filter((q) => q.priority === "low").length,
    };

    console.log("\n=== Priority Summary ===");
    console.log(`Critical: ${prioritySummary.critical}`);
    console.log(`High: ${prioritySummary.high}`);
    console.log(`Medium: ${prioritySummary.medium}`);
    console.log(`Low: ${prioritySummary.low}`);

    // Tag summary
    const tags = new Map<string, number>();
    questions.forEach((q) => {
      q.tags.forEach((tag) => {
        tags.set(tag, (tags.get(tag) || 0) + 1);
      });
    });

    console.log("\n=== Tag Summary ===");
    Array.from(tags.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([tag, count]) => {
        console.log(`${tag}: ${count}`);
      });

    console.log("\n=== Process Complete ===");
    console.log(`Questions saved to: ${outputPath}`);
    console.log("Now ready for expert research and integration.");
  } catch (error) {
    console.error("Error running nightly collection:", error);
    process.exit(1);
  }
}

// Run the main function
main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
