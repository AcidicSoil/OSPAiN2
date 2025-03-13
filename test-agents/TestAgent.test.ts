import { TestAgent } from "./TestAgent";
import { promises as fs } from "fs";
import path from "path";

jest.mock("fs", () => ({
  promises: {
    readdir: jest.fn(),
    readFile: jest.fn(),
    access: jest.fn(),
  },
}));

describe("TestAgent", () => {
  let agent: TestAgent;
  const mockDocsDir = path.join(process.cwd(), "docs");

  beforeEach(() => {
    agent = new TestAgent("documentation");
    jest.clearAllMocks();
  });

  describe("Documentation Tests", () => {
    it("should verify markdown files in docs directory", async () => {
      // Mock directory contents
      (fs.readdir as jest.Mock).mockResolvedValue(["test.md", "api.md"]);

      // Mock file content
      (fs.readFile as jest.Mock).mockResolvedValue(`
        # Test Documentation
        \`\`\`typescript
        const test = "example";
        \`\`\`
        [Link to API](api.md)
      `);

      // Mock file access check
      (fs.access as jest.Mock).mockResolvedValue(undefined);

      await agent.startTesting();
      const results = agent.getResults();

      expect(results.docChecks).toHaveLength(2);
      expect(results.docChecks[0].status).toBe("verified");
    });

    it("should detect invalid code examples", async () => {
      (fs.readdir as jest.Mock).mockResolvedValue(["test.md"]);
      (fs.readFile as jest.Mock).mockResolvedValue(`
        # Test Documentation
        \`\`\`typescript
        invalid code example
        \`\`\`
      `);

      await agent.startTesting();
      const results = agent.getResults();

      expect(results.docChecks[0].issues).toContain(
        expect.stringContaining("Invalid code example")
      );
    });

    it("should detect broken links", async () => {
      (fs.readdir as jest.Mock).mockResolvedValue(["test.md"]);
      (fs.readFile as jest.Mock).mockResolvedValue(`
        # Test Documentation
        [Broken Link](nonexistent.md)
      `);
      (fs.access as jest.Mock).mockRejectedValue(new Error("File not found"));

      await agent.startTesting();
      const results = agent.getResults();

      expect(results.docChecks[0].issues).toContain(
        expect.stringContaining("Broken link")
      );
    });
  });

  describe("Implementation Tests", () => {
    beforeEach(() => {
      agent = new TestAgent("implementation");
    });

    it("should run unit and integration tests", async () => {
      await agent.startTesting();
      const results = agent.getResults();

      expect(results.testResults).toHaveLength(2);
      expect(results.testResults[0].testName).toBe("Unit Test Suite");
      expect(results.testResults[1].testName).toBe("Integration Test Suite");
    });
  });

  describe("Integration Tests", () => {
    beforeEach(() => {
      agent = new TestAgent("integration");
    });

    it("should run component and API tests", async () => {
      await agent.startTesting();
      const results = agent.getResults();

      expect(results.testResults).toHaveLength(2);
      expect(results.testResults[0].testName).toBe(
        "Component Interaction Tests"
      );
      expect(results.testResults[1].testName).toBe("API Contract Tests");
    });
  });

  describe("Event Emission", () => {
    it("should emit start and complete events", async () => {
      const startSpy = jest.fn();
      const completeSpy = jest.fn();

      agent.on("start", startSpy);
      agent.on("complete", completeSpy);

      await agent.startTesting();

      expect(startSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          agentType: "documentation",
        })
      );
      expect(completeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          agentType: "documentation",
          testResults: expect.any(Array),
          docChecks: expect.any(Array),
        })
      );
    });
  });
});
