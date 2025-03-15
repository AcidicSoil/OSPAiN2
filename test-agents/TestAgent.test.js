"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TestAgent_1 = require("./TestAgent");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
jest.mock("fs", () => ({
    promises: {
        readdir: jest.fn(),
        readFile: jest.fn(),
        access: jest.fn(),
    },
}));
describe("TestAgent", () => {
    let agent;
    const mockDocsDir = path_1.default.join(process.cwd(), "docs");
    beforeEach(() => {
        agent = new TestAgent_1.TestAgent("documentation");
        jest.clearAllMocks();
    });
    describe("Documentation Tests", () => {
        it("should verify markdown files in docs directory", async () => {
            // Mock directory contents
            fs_1.promises.readdir.mockResolvedValue(["test.md", "api.md"]);
            // Mock file content
            fs_1.promises.readFile.mockResolvedValue(`
        # Test Documentation
        \`\`\`typescript
        const test = "example";
        \`\`\`
        [Link to API](api.md)
      `);
            // Mock file access check
            fs_1.promises.access.mockResolvedValue(undefined);
            await agent.startTesting();
            const results = agent.getResults();
            expect(results.docChecks).toHaveLength(2);
            expect(results.docChecks[0].status).toBe("verified");
        });
        it("should detect invalid code examples", async () => {
            fs_1.promises.readdir.mockResolvedValue(["test.md"]);
            fs_1.promises.readFile.mockResolvedValue(`
        # Test Documentation
        \`\`\`typescript
        invalid code example
        \`\`\`
      `);
            await agent.startTesting();
            const results = agent.getResults();
            expect(results.docChecks[0].issues).toContain(expect.stringContaining("Invalid code example"));
        });
        it("should detect broken links", async () => {
            fs_1.promises.readdir.mockResolvedValue(["test.md"]);
            fs_1.promises.readFile.mockResolvedValue(`
        # Test Documentation
        [Broken Link](nonexistent.md)
      `);
            fs_1.promises.access.mockRejectedValue(new Error("File not found"));
            await agent.startTesting();
            const results = agent.getResults();
            expect(results.docChecks[0].issues).toContain(expect.stringContaining("Broken link"));
        });
    });
    describe("Implementation Tests", () => {
        beforeEach(() => {
            agent = new TestAgent_1.TestAgent("implementation");
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
            agent = new TestAgent_1.TestAgent("integration");
        });
        it("should run component and API tests", async () => {
            await agent.startTesting();
            const results = agent.getResults();
            expect(results.testResults).toHaveLength(2);
            expect(results.testResults[0].testName).toBe("Component Interaction Tests");
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
            expect(startSpy).toHaveBeenCalledWith(expect.objectContaining({
                agentType: "documentation",
            }));
            expect(completeSpy).toHaveBeenCalledWith(expect.objectContaining({
                agentType: "documentation",
                testResults: expect.any(Array),
                docChecks: expect.any(Array),
            }));
        });
    });
});
//# sourceMappingURL=TestAgent.test.js.map