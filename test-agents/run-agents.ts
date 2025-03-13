import { TestAgent } from "./TestAgent";
import { promises as fs } from "fs";
import path from "path";

interface TestReport {
  timestamp: string;
  results: {
    documentation: {
      docChecks: any[];
      testResults: any[];
    };
    implementation: {
      docChecks: any[];
      testResults: any[];
    };
    integration: {
      docChecks: any[];
      testResults: any[];
    };
  };
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    totalDocs: number;
    verifiedDocs: number;
    docsNeedingUpdate: number;
  };
}

async function generateReport(results: any): Promise<TestReport> {
  const timestamp = new Date().toISOString();

  // Calculate summary statistics
  const totalTests = Object.values(results).reduce(
    (acc, agent) => acc + agent.testResults.length,
    0
  );

  const passedTests = Object.values(results).reduce(
    (acc, agent) => acc + agent.testResults.filter((t: any) => t.passed).length,
    0
  );

  const totalDocs = Object.values(results).reduce(
    (acc, agent) => acc + agent.docChecks.length,
    0
  );

  const verifiedDocs = Object.values(results).reduce(
    (acc, agent) =>
      acc + agent.docChecks.filter((d: any) => d.status === "verified").length,
    0
  );

  return {
    timestamp,
    results,
    summary: {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      totalDocs,
      verifiedDocs,
      docsNeedingUpdate: totalDocs - verifiedDocs,
    },
  };
}

async function saveReport(report: TestReport): Promise<void> {
  const reportsDir = path.join(process.cwd(), "test-reports");
  await fs.mkdir(reportsDir, { recursive: true });

  const filename = `test-report-${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")}.json`;
  await fs.writeFile(
    path.join(reportsDir, filename),
    JSON.stringify(report, null, 2)
  );
}

async function main() {
  console.log("Starting test agents...");

  // Create test agents
  const agents = {
    documentation: new TestAgent("documentation"),
    implementation: new TestAgent("implementation"),
    integration: new TestAgent("integration"),
  };

  // Set up event listeners for each agent
  Object.entries(agents).forEach(([type, agent]) => {
    agent.on("start", (data) => {
      console.log(`${type} agent started:`, data);
    });

    agent.on("complete", (data) => {
      console.log(`${type} agent completed:`, data);
    });
  });

  // Run all agents
  const results = await Promise.all(
    Object.entries(agents).map(async ([type, agent]) => {
      await agent.startTesting();
      return [type, agent.getResults()];
    })
  );

  // Generate and save report
  const report = await generateReport(Object.fromEntries(results));
  await saveReport(report);

  // Print summary
  console.log("\nTest Report Summary:");
  console.log("-------------------");
  console.log(`Total Tests: ${report.summary.totalTests}`);
  console.log(`Passed Tests: ${report.summary.passedTests}`);
  console.log(`Failed Tests: ${report.summary.failedTests}`);
  console.log(`Total Docs: ${report.summary.totalDocs}`);
  console.log(`Verified Docs: ${report.summary.verifiedDocs}`);
  console.log(`Docs Needing Update: ${report.summary.docsNeedingUpdate}`);
}

if (require.main === module) {
  main().catch(console.error);
}
