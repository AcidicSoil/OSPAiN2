import { Octokit } from "@octokit/rest";
import { promises as fs } from "fs";
import path from "path";

interface RepositoryData {
  name: string;
  full_name: string;
  description: string;
  stars: number;
  forks: number;
  contributors: number;
  last_updated: string;
  language: string;
  topics: string[];
  test_coverage?: number;
  documentation_score?: number;
  security_score?: number;
  performance_score?: number;
}

interface ResearchThresholds {
  minStars: number;
  minContributors: number;
  minLastUpdate: Date;
  minTestCoverage: number;
  maxDependencies: number;
  minDocumentationScore: number;
}

export class RepositoryScanner {
  private octokit: Octokit;
  private thresholds: ResearchThresholds;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
    this.thresholds = {
      minStars: 100,
      minContributors: 5,
      minLastUpdate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      minTestCoverage: 70,
      maxDependencies: 50,
      minDocumentationScore: 0.7,
    };
  }

  async scanRepositories(query: string): Promise<RepositoryData[]> {
    console.log(`Scanning repositories for: ${query}`);

    try {
      const searchResponse = await this.octokit.search.repos({
        q: query,
        sort: "stars",
        order: "desc",
        per_page: 100,
      });

      const repositories = await Promise.all(
        searchResponse.data.items.map(async (repo) => {
          const contributors = await this.getContributorCount(repo.full_name);
          const topics = await this.getRepositoryTopics(repo.full_name);

          return {
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description || "",
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            contributors,
            last_updated: repo.updated_at,
            language: repo.language || "",
            topics,
            test_coverage: await this.estimateTestCoverage(repo.full_name),
            documentation_score: await this.calculateDocumentationScore(
              repo.full_name
            ),
            security_score: await this.calculateSecurityScore(repo.full_name),
            performance_score: await this.calculatePerformanceScore(
              repo.full_name
            ),
          };
        })
      );

      return this.filterRepositories(repositories);
    } catch (error) {
      console.error("Error scanning repositories:", error);
      throw error;
    }
  }

  private async getContributorCount(repoFullName: string): Promise<number> {
    try {
      const response = await this.octokit.repos.listContributors({
        owner: repoFullName.split("/")[0],
        repo: repoFullName.split("/")[1],
      });
      return response.data.length;
    } catch (error) {
      console.error(`Error getting contributors for ${repoFullName}:`, error);
      return 0;
    }
  }

  private async getRepositoryTopics(repoFullName: string): Promise<string[]> {
    try {
      const response = await this.octokit.repos.getAllTopics({
        owner: repoFullName.split("/")[0],
        repo: repoFullName.split("/")[1],
      });
      return response.data.names;
    } catch (error) {
      console.error(`Error getting topics for ${repoFullName}:`, error);
      return [];
    }
  }

  private async estimateTestCoverage(repoFullName: string): Promise<number> {
    // TODO: Implement test coverage estimation
    // This could involve:
    // 1. Checking for test files
    // 2. Analyzing test configuration
    // 3. Looking for coverage reports
    return 0;
  }

  private async calculateDocumentationScore(
    repoFullName: string
  ): Promise<number> {
    // TODO: Implement documentation score calculation
    // This could involve:
    // 1. Checking README completeness
    // 2. Analyzing API documentation
    // 3. Looking for examples and tutorials
    return 0;
  }

  private async calculateSecurityScore(repoFullName: string): Promise<number> {
    // TODO: Implement security score calculation
    // This could involve:
    // 1. Checking for security policies
    // 2. Analyzing dependency security
    // 3. Looking for security badges
    return 0;
  }

  private async calculatePerformanceScore(
    repoFullName: string
  ): Promise<number> {
    // TODO: Implement performance score calculation
    // This could involve:
    // 1. Analyzing build times
    // 2. Checking for performance benchmarks
    // 3. Looking for optimization efforts
    return 0;
  }

  private filterRepositories(repos: RepositoryData[]): RepositoryData[] {
    return repos.filter((repo) => {
      const lastUpdate = new Date(repo.last_updated);
      return (
        repo.stars >= this.thresholds.minStars &&
        repo.contributors >= this.thresholds.minContributors &&
        lastUpdate >= this.thresholds.minLastUpdate &&
        (repo.test_coverage || 0) >= this.thresholds.minTestCoverage &&
        (repo.documentation_score || 0) >= this.thresholds.minDocumentationScore
      );
    });
  }

  async saveResults(
    repos: RepositoryData[],
    outputPath: string
  ): Promise<void> {
    try {
      await fs.writeFile(outputPath, JSON.stringify(repos, null, 2), "utf-8");
      console.log(`Results saved to ${outputPath}`);
    } catch (error) {
      console.error("Error saving results:", error);
      throw error;
    }
  }
}
