import * as fs from "fs";
import * as path from "path";
import { watch } from "chokidar";

interface PlanItem {
  id: string;
  title: string;
  priority: number;
  status: "not-started" | "in-progress" | "completed";
  checkpoints: string[];
  dependsOn?: string[];
}

class PlanManager {
  private plans: Map<string, PlanItem[]> = new Map();
  private planWatchers: Map<string, any> = new Map();
  private planPath: string;

  constructor(basePath: string) {
    this.planPath = path.join(basePath, "docs", "planning");

    // Create directory if it doesn't exist
    if (!fs.existsSync(this.planPath)) {
      fs.mkdirSync(this.planPath, { recursive: true });
    }

    // Load existing plans
    this.loadPlans();

    // Watch for changes
    this.initializeWatcher();
  }

  private loadPlans(): void {
    // ... existing code ...

    // Parse markdown files into structured plan data
    fs.readdirSync(this.planPath)
      .filter((file) => file.endsWith(".md"))
      .forEach((file) => {
        const planId = file.replace(".md", "");
        const content = fs.readFileSync(path.join(this.planPath, file), "utf8");
        this.plans.set(planId, this.parsePlanContent(content));
      });
  }

  private initializeWatcher(): void {
    const watcher = watch(this.planPath, {
      persistent: true,
      ignoreInitial: true,
    });

    watcher
      .on("add", (path) => this.handlePlanChange("add", path))
      .on("change", (path) => this.handlePlanChange("change", path))
      .on("unlink", (path) => this.handlePlanChange("remove", path));
  }

  private handlePlanChange(event: string, filePath: string): void {
    const planId = path.basename(filePath).replace(".md", "");

    console.log(`Plan ${event}: ${planId}`);

    if (event === "remove") {
      this.plans.delete(planId);
    } else {
      const content = fs.readFileSync(filePath, "utf8");
      this.plans.set(planId, this.parsePlanContent(content));
    }

    // Emit event or notify subscribers about the change
    this.notifyPlanChange(planId);
  }

  // CLI integration methods
  public listPlans(): PlanItem[][] {
    return Array.from(this.plans.values());
  }

  public getPlanByName(name: string): PlanItem[] | undefined {
    return this.plans.get(name);
  }

  public getActiveTasks(): PlanItem[] {
    const allTasks: PlanItem[] = [];

    this.plans.forEach((planItems) => {
      planItems
        .filter((item) => item.status === "in-progress")
        .forEach((item) => allTasks.push(item));
    });

    return allTasks.sort((a, b) => a.priority - b.priority);
  }

  // Other helper methods...
}

export const planManager = new PlanManager(process.cwd());
