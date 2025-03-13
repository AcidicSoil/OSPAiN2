import * as fs from "fs";
import * as path from "path";
import { watch } from "chokidar";
import { EventEmitter } from "events";

export class ContextWatcher extends EventEmitter {
  private planWatcher: any;
  private codeWatcher: any;
  private currentMode: string = "unknown";
  private activeContexts: Map<string, any> = new Map();

  constructor(
    private projectRoot: string,
    private plansDir: string = path.join(projectRoot, "docs", "planning"),
    private srcDir: string = path.join(projectRoot, "src")
  ) {
    super();
    this.initialize();
  }

  private initialize(): void {
    // Watch plan files
    this.planWatcher = watch(this.plansDir, {
      persistent: true,
      ignoreInitial: true,
    });

    this.planWatcher
      .on("add", (path) => this.handlePlanChange("add", path))
      .on("change", (path) => this.handlePlanChange("change", path));

    // Watch for mode changes
    fs.watchFile(path.join(this.projectRoot, ".mode"), () => {
      this.updateCurrentMode();
    });

    // Initial mode detection
    this.updateCurrentMode();

    // Load initial plans
    this.loadPlans();
  }

  private loadPlans(): void {
    if (!fs.existsSync(this.plansDir)) return;

    fs.readdirSync(this.plansDir)
      .filter((file) => file.endsWith(".md"))
      .forEach((file) => {
        const planId = file.replace(".md", "");
        const content = fs.readFileSync(path.join(this.plansDir, file), "utf8");
        this.updatePlanContext(planId, content);
      });
  }

  private updateCurrentMode(): void {
    try {
      if (fs.existsSync(path.join(this.projectRoot, ".mode"))) {
        const modeContent = fs.readFileSync(
          path.join(this.projectRoot, ".mode"),
          "utf8"
        );
        const newMode = modeContent.trim();

        if (this.currentMode !== newMode) {
          const oldMode = this.currentMode;
          this.currentMode = newMode;
          this.emit("modeChange", { oldMode, newMode });
        }
      }
    } catch (error) {
      console.error("Error updating mode:", error);
    }
  }

  private handlePlanChange(event: string, filePath: string): void {
    const planId = path.basename(filePath).replace(".md", "");

    if (event === "add" || event === "change") {
      const content = fs.readFileSync(filePath, "utf8");
      this.updatePlanContext(planId, content);
    }
  }

  private updatePlanContext(planId: string, content: string): void {
    // Extract context information from plan
    const context = this.parsePlanContent(content);
    this.activeContexts.set(planId, context);

    this.emit("contextUpdate", {
      type: "plan",
      id: planId,
      context,
    });
  }

  private parsePlanContent(content: string): any {
    // Parse markdown content to extract:
    // - Current priorities
    // - In-progress tasks
    // - Completion status
    // ...implementation details...

    // This is a simplified example
    const priorities = [];
    const inProgress = [];

    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Extract priorities
      if (line.match(/^##\s+🔧|🧠|🏗️|🔌|📝/)) {
        priorities.push(line.substring(line.indexOf(" ")).trim());
      }

      // Extract in-progress items
      if (line.includes("🟡 In Progress")) {
        inProgress.push(line.substring(line.indexOf("]") + 1).trim());
      }
    }

    return {
      priorities,
      inProgress,
    };
  }

  // Public API
  public getCurrentMode(): string {
    return this.currentMode;
  }

  public getActiveContexts(): Map<string, any> {
    return new Map(this.activeContexts);
  }

  public getActivePriorities(): string[] {
    const allPriorities = [];

    this.activeContexts.forEach((context) => {
      if (context.priorities && context.priorities.length > 0) {
        allPriorities.push(...context.priorities);
      }
    });

    return allPriorities;
  }

  public getInProgressTasks(): string[] {
    const allTasks = [];

    this.activeContexts.forEach((context) => {
      if (context.inProgress && context.inProgress.length > 0) {
        allTasks.push(...context.inProgress);
      }
    });

    return allTasks;
  }
}

// Singleton instance
export const contextWatcher = new ContextWatcher(process.cwd());
