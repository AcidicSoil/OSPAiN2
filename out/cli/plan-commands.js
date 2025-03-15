"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPlanCommands = registerPlanCommands;
const PlanManager_1 = require("../planning/PlanManager");
const chalk_1 = __importDefault(require("chalk"));
function registerPlanCommands(program) {
    const planCommand = program
        .command("plan")
        .description("Implementation plan management");
    planCommand
        .command("list")
        .description("List all implementation plans")
        .action(() => {
        const plans = PlanManager_1.planManager.listPlans();
        console.log(chalk_1.default.bold("Available Implementation Plans:"));
        plans.forEach((plan, index) => {
            console.log(`${index + 1}. ${chalk_1.default.blue(plan[0].title)}`);
        });
    });
    planCommand
        .command("view <planName>")
        .description("View a specific implementation plan")
        .action((planName) => {
        const plan = PlanManager_1.planManager.getPlanByName(planName);
        if (!plan) {
            console.log(chalk_1.default.red(`Plan "${planName}" not found`));
            return;
        }
        console.log(chalk_1.default.bold(`Plan: ${plan[0].title}`));
        plan.forEach((item) => {
            const statusColor = item.status === "completed"
                ? chalk_1.default.green
                : item.status === "in-progress"
                    ? chalk_1.default.yellow
                    : chalk_1.default.red;
            console.log(`- ${statusColor(item.status)} ${item.title}`);
            item.checkpoints.forEach((cp) => console.log(`  * ${cp}`));
        });
    });
    planCommand
        .command("todo")
        .description("Show all active tasks across plans")
        .action(() => {
        const tasks = PlanManager_1.planManager.getActiveTasks();
        console.log(chalk_1.default.bold("Active Tasks:"));
        tasks.forEach((task) => {
            console.log(`- ${chalk_1.default.yellow(task.title)}`);
        });
    });
}
//# sourceMappingURL=plan-commands.js.map