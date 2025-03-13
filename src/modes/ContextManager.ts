import { EventEmitter } from "events";
import { promises as fs } from "fs";
import path from "path";

export type DevelopmentMode =
  | "design"
  | "engineering"
  | "testing"
  | "deployment"
  | "maintenance";

interface ContextData {
  timestamp: number;
  mode: DevelopmentMode;
  activeFiles: string[];
  workspaceState: {
    openFiles: string[];
    cursorPositions: Record<string, { line: number; character: number }>;
    selections: Record<string, { start: number; end: number }>;
  };
  aiContext: {
    recentPrompts: string[];
    modelConfigurations: Record<string, any>;
    cachedResults: Record<string, any>;
  };
  metadata: {
    lastModified: number;
    contextId: string;
    parentContextId?: string;
  };
}

export class ContextManager extends EventEmitter {
  private contextStore: Map<string, ContextData> = new Map();
  private currentContextId?: string;
  private readonly contextDir: string;

  constructor(
    contextDir: string = path.join(process.cwd(), ".cursor", "contexts")
  ) {
    super();
    this.contextDir = contextDir;
    this.initializeContextDir();
  }

  private async initializeContextDir(): Promise<void> {
    try {
      await fs.mkdir(this.contextDir, { recursive: true });
      await this.loadPersistedContexts();
    } catch (error) {
      console.error("Failed to initialize context directory:", error);
      throw new Error("Context initialization failed");
    }
  }

  private async loadPersistedContexts(): Promise<void> {
    try {
      const files = await fs.readdir(this.contextDir);
      for (const file of files) {
        if (file.endsWith(".json")) {
          const contextId = path.basename(file, ".json");
          const content = await fs.readFile(
            path.join(this.contextDir, file),
            "utf-8"
          );
          const context: ContextData = JSON.parse(content);
          this.contextStore.set(contextId, context);
        }
      }
    } catch (error) {
      console.error("Failed to load persisted contexts:", error);
      throw new Error("Context loading failed");
    }
  }

  private async persistContext(
    contextId: string,
    context: ContextData
  ): Promise<void> {
    try {
      const filePath = path.join(this.contextDir, `${contextId}.json`);
      await fs.writeFile(filePath, JSON.stringify(context, null, 2));
    } catch (error) {
      console.error("Failed to persist context:", error);
      throw new Error("Context persistence failed");
    }
  }

  public async preserveContext(fromMode: DevelopmentMode): Promise<string> {
    try {
      const context: ContextData = {
        timestamp: Date.now(),
        mode: fromMode,
        activeFiles: await this.getActiveFiles(),
        workspaceState: await this.captureWorkspaceState(),
        aiContext: await this.captureAIContext(),
        metadata: {
          lastModified: Date.now(),
          contextId: `${fromMode}-${Date.now()}`,
          parentContextId: this.currentContextId,
        },
      };

      const contextId = context.metadata.contextId;
      this.contextStore.set(contextId, context);
      await this.persistContext(contextId, context);
      this.currentContextId = contextId;

      this.emit("contextPreserved", { contextId, fromMode });
      return contextId;
    } catch (error) {
      console.error("Failed to preserve context:", error);
      throw new Error("Context preservation failed");
    }
  }

  public async restoreContext(
    toMode: DevelopmentMode,
    contextId: string
  ): Promise<boolean> {
    try {
      const context = this.contextStore.get(contextId);
      if (!context) {
        throw new Error(`Context ${contextId} not found`);
      }

      // Apply context to new mode
      await this.applyWorkspaceState(context.workspaceState);
      await this.openRelevantFiles(context.activeFiles);
      await this.restoreAIContext(context.aiContext);

      this.currentContextId = contextId;
      this.emit("contextRestored", { contextId, toMode });
      return true;
    } catch (error) {
      console.error("Failed to restore context:", error);
      throw new Error("Context restoration failed");
    }
  }

  private async getActiveFiles(): Promise<string[]> {
    // Implementation will depend on the IDE integration
    // For now, return empty array as placeholder
    return [];
  }

  private async captureWorkspaceState(): Promise<
    ContextData["workspaceState"]
  > {
    // Implementation will depend on the IDE integration
    // For now, return empty object as placeholder
    return {
      openFiles: [],
      cursorPositions: {},
      selections: {},
    };
  }

  private async captureAIContext(): Promise<ContextData["aiContext"]> {
    // Implementation will depend on the AI system integration
    // For now, return empty object as placeholder
    return {
      recentPrompts: [],
      modelConfigurations: {},
      cachedResults: {},
    };
  }

  private async applyWorkspaceState(
    state: ContextData["workspaceState"]
  ): Promise<void> {
    // Implementation will depend on the IDE integration
    // For now, do nothing as placeholder
  }

  private async openRelevantFiles(files: string[]): Promise<void> {
    // Implementation will depend on the IDE integration
    // For now, do nothing as placeholder
  }

  private async restoreAIContext(
    context: ContextData["aiContext"]
  ): Promise<void> {
    // Implementation will depend on the AI system integration
    // For now, do nothing as placeholder
  }

  public getCurrentContextId(): string | undefined {
    return this.currentContextId;
  }

  public getContext(contextId: string): ContextData | undefined {
    return this.contextStore.get(contextId);
  }

  public async deleteContext(contextId: string): Promise<void> {
    try {
      const filePath = path.join(this.contextDir, `${contextId}.json`);
      await fs.unlink(filePath);
      this.contextStore.delete(contextId);
      if (this.currentContextId === contextId) {
        this.currentContextId = undefined;
      }
      this.emit("contextDeleted", { contextId });
    } catch (error) {
      console.error("Failed to delete context:", error);
      throw new Error("Context deletion failed");
    }
  }
}
