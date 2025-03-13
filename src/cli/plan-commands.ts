import { Command } from "commander";
import { planManager } from "../planning/PlanManager";
import chalk from "chalk";

export function registerPlanCommands(program: Command): void {
  const planCommand = program
    .command("plan")
    .description("Implementation plan management");

  planCommand
    .command("list")
    .description("List all implementation plans")
    .action(() => {
      const plans = planManager.listPlans();
      console.log(chalk.bold("Available Implementation Plans:"));
      plans.forEach((plan, index) => {
        console.log(`${index + 1}. ${chalk.blue(plan[0].title)}`);
      });
    });

  planCommand
    .command("view <planName>")
    .description("View a specific implementation plan")
    .action((planName) => {
      const plan = planManager.getPlanByName(planName);
      if (!plan) {
        console.log(chalk.red(`Plan "${planName}" not found`));
        return;
      }

      console.log(chalk.bold(`Plan: ${plan[0].title}`));
      plan.forEach((item) => {
        const statusColor =
          item.status === "completed"
            ? chalk.green
            : item.status === "in-progress"
            ? chalk.yellow
            : chalk.red;

        console.log(`- ${statusColor(item.status)} ${item.title}`);
        item.checkpoints.forEach((cp) => console.log(`  * ${cp}`));
      });
    });

  planCommand
    .command("todo")
    .description("Show all active tasks across plans")
    .action(() => {
      const tasks = planManager.getActiveTasks();
      console.log(chalk.bold("Active Tasks:"));
      tasks.forEach((task) => {
        console.log(`- ${chalk.yellow(task.title)}`);
      });
    });
}
