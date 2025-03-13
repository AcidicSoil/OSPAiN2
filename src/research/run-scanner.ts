import { RepositoryScanner } from "./repository-scanner";
import { promises as fs } from "fs";
import path from "path";

async function generateReport(repos: any[], outputDir: string): Promise<void> {
  const report = {
    timestamp: new Date().toISOString(),
    totalRepositories: repos.length,
    summary: {
      averageStars:
        repos.reduce((acc, repo) => acc + repo.stars, 0) / repos.length,
      averageContributors:
        repos.reduce((acc, repo) => acc + repo.contributors, 0) / repos.length,
      languages: [...new Set(repos.map((repo) => repo.language))],
      topics: [...new Set(repos.flatMap((repo) => repo.topics))],
    },
    repositories: repos,
  };

  await fs.writeFile(
    path.join(outputDir, "research-report.json"),
    JSON.stringify(report, null, 2),
    "utf-8"
  );

  // Generate markdown report
  const markdownReport = `# Test Agent Framework Research Report

Generated on: ${report.timestamp}

## Summary

- Total Repositories Analyzed: ${report.totalRepositories}
- Average Stars: ${report.summary.averageStars.toFixed(2)}
- Average Contributors: ${report.summary.averageContributors.toFixed(2)}

## Languages

${report.summary.languages.map((lang) => `- ${lang}`).join("\n")}

## Topics

${report.summary.topics.map((topic) => `- ${topic}`).join("\n")}

## Top Repositories

${repos
  .sort((a, b) => b.stars - a.stars)
  .slice(0, 10)
  .map(
    (repo) => `### ${repo.full_name}

- Stars: ${repo.stars}
- Contributors: ${repo.contributors}
- Last Updated: ${repo.last_updated}
- Description: ${repo.description}
- Topics: ${repo.topics.join(", ")}
`
  )
  .join("\n")}
`;

  await fs.writeFile(
    path.join(outputDir, "research-report.md"),
    markdownReport,
    "utf-8"
  );
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("Please set GITHUB_TOKEN environment variable");
    process.exit(1);
  }

  const scanner = new RepositoryScanner(token);
  const outputDir = path.join(process.cwd(), "research-results");

  try {
    // Create output directory if it doesn't exist
    await fs.mkdir(outputDir, { recursive: true });

    // Search queries for test agent frameworks
    const queries = [
      "test agent framework typescript",
      "automated testing framework",
      "test automation framework",
      "testing framework with agents",
      "ai testing framework",
    ];

    const allRepos = [];
    for (const query of queries) {
      console.log(`Scanning for: ${query}`);
      const repos = await scanner.scanRepositories(query);
      allRepos.push(...repos);
    }

    // Remove duplicates
    const uniqueRepos = Array.from(
      new Map(allRepos.map((repo) => [repo.full_name, repo])).values()
    );

    // Save raw results
    await scanner.saveResults(
      uniqueRepos,
      path.join(outputDir, "raw-results.json")
    );

    // Generate report
    await generateReport(uniqueRepos, outputDir);

    console.log("Research completed successfully!");
    console.log(`Results saved to: ${outputDir}`);
  } catch (error) {
    console.error("Error during research:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
