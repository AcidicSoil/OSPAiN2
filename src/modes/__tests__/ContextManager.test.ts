import { ContextManager, DevelopmentMode } from "../ContextManager";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

describe("ContextManager", () => {
  let contextManager: ContextManager;
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "context-manager-test-"));
    contextManager = new ContextManager(tempDir);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe("initialization", () => {
    it("should create context directory on initialization", async () => {
      const dirExists = await fs
        .access(tempDir)
        .then(() => true)
        .catch(() => false);
      expect(dirExists).toBe(true);
    });
  });

  describe("context preservation", () => {
    it("should preserve context with unique ID", async () => {
      const contextId = await contextManager.preserveContext("design");
      expect(contextId).toBeDefined();
      expect(contextId).toMatch(/^design-\d+$/);
    });

    it("should store context data in memory", async () => {
      const contextId = await contextManager.preserveContext("engineering");
      const context = contextManager.getContext(contextId);
      expect(context).toBeDefined();
      expect(context?.mode).toBe("engineering");
    });

    it("should persist context to disk", async () => {
      const contextId = await contextManager.preserveContext("testing");
      const filePath = path.join(tempDir, `${contextId}.json`);
      const fileExists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);
    });
  });

  describe("context restoration", () => {
    it("should restore context successfully", async () => {
      const contextId = await contextManager.preserveContext("design");
      const success = await contextManager.restoreContext(
        "engineering",
        contextId
      );
      expect(success).toBe(true);
    });

    it("should fail to restore non-existent context", async () => {
      await expect(
        contextManager.restoreContext("design", "non-existent-id")
      ).rejects.toThrow("Context non-existent-id not found");
    });
  });

  describe("context deletion", () => {
    it("should delete context from memory and disk", async () => {
      const contextId = await contextManager.preserveContext("design");
      await contextManager.deleteContext(contextId);

      const context = contextManager.getContext(contextId);
      expect(context).toBeUndefined();

      const filePath = path.join(tempDir, `${contextId}.json`);
      const fileExists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(false);
    });
  });

  describe("event emission", () => {
    it("should emit contextPreserved event", (done) => {
      contextManager.on("contextPreserved", ({ contextId, fromMode }) => {
        expect(contextId).toBeDefined();
        expect(fromMode).toBe("design");
        done();
      });

      contextManager.preserveContext("design");
    });

    it("should emit contextRestored event", (done) => {
      contextManager.on("contextRestored", ({ contextId, toMode }) => {
        expect(contextId).toBeDefined();
        expect(toMode).toBe("engineering");
        done();
      });

      contextManager
        .preserveContext("design")
        .then((id) => contextManager.restoreContext("engineering", id));
    });

    it("should emit contextDeleted event", (done) => {
      contextManager.on("contextDeleted", ({ contextId }) => {
        expect(contextId).toBeDefined();
        done();
      });

      contextManager
        .preserveContext("design")
        .then((id) => contextManager.deleteContext(id));
    });
  });

  describe("context hierarchy", () => {
    it("should maintain parent-child relationship between contexts", async () => {
      const parentId = await contextManager.preserveContext("design");
      const childId = await contextManager.preserveContext("engineering");

      const childContext = contextManager.getContext(childId);
      expect(childContext?.metadata.parentContextId).toBe(parentId);
    });
  });
});
