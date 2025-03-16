#!/usr/bin/env ts-node
"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const NightlyQuestionCollection_1 = require("../utils/NightlyQuestionCollection");
const path = __importStar(require("path"));
// Parse command line arguments
const args = process.argv.slice(2);
const sourcePath = args.find((arg) => arg.startsWith("--source="))?.split("=")[1] || "./src";
const outputPath = args.find((arg) => arg.startsWith("--output="))?.split("=")[1] ||
    "./data/questions.json";
async function main() {
    console.log("=== OSPAiN2 Nightly Question Collection ===");
    console.log(`Source path: ${sourcePath}`);
    console.log(`Output path: ${outputPath}`);
    console.log("-------------------------------------------");
    try {
        // Run the collection process
        const collector = new NightlyQuestionCollection_1.NightlyQuestionCollection(path.resolve(outputPath));
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
        const tags = new Map();
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
    }
    catch (error) {
        console.error("Error running nightly collection:", error);
        process.exit(1);
    }
}
// Run the main function
main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
});
//# sourceMappingURL=run-nightly-collection.js.map