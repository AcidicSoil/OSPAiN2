"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const TaskProcessingTimeByType_1 = __importDefault(require("./charts/TaskProcessingTimeByType"));
const TaskDueDateDistribution_1 = __importDefault(require("./charts/TaskDueDateDistribution"));
const chartDataTransformers_1 = require("../../utils/chartDataTransformers");
const TaskStatistics = ({ tasks }) => {
    // Calculate statistics
    const processingTimeData = (0, chartDataTransformers_1.calculateProcessingTimeByType)(tasks);
    const dueDateData = (0, chartDataTransformers_1.extractDueDates)(tasks);
    // Calculate general statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.status === "completed").length;
    const averageProcessingTime = tasks.reduce((sum, task) => {
        return sum + (task.processingTime || 0);
    }, 0) / (completedTasks || 1);
    const overdueTasks = tasks.filter((task) => {
        if (!task.dueDate || task.status === "completed")
            return false;
        return new Date(task.dueDate) < new Date();
    }).length;
    return (<material_1.Box sx={{ p: 2 }}>
      <material_1.Grid container spacing={3}>
        {/* Summary Statistics */}
        <material_1.Grid item xs={12}>
          <material_1.Paper sx={{ p: 2 }}>
            <material_1.Typography variant="h6" gutterBottom>
              Task Overview
            </material_1.Typography>
            <material_1.Grid container spacing={2}>
              <material_1.Grid item xs={3}>
                <material_1.Typography variant="subtitle2" color="textSecondary">
                  Total Tasks
                </material_1.Typography>
                <material_1.Typography variant="h4">{totalTasks}</material_1.Typography>
              </material_1.Grid>
              <material_1.Grid item xs={3}>
                <material_1.Typography variant="subtitle2" color="textSecondary">
                  Completed Tasks
                </material_1.Typography>
                <material_1.Typography variant="h4">{completedTasks}</material_1.Typography>
              </material_1.Grid>
              <material_1.Grid item xs={3}>
                <material_1.Typography variant="subtitle2" color="textSecondary">
                  Avg. Processing Time
                </material_1.Typography>
                <material_1.Typography variant="h4">
                  {Math.round(averageProcessingTime)}ms
                </material_1.Typography>
              </material_1.Grid>
              <material_1.Grid item xs={3}>
                <material_1.Typography variant="subtitle2" color="textSecondary">
                  Overdue Tasks
                </material_1.Typography>
                <material_1.Typography variant="h4" color="error">
                  {overdueTasks}
                </material_1.Typography>
              </material_1.Grid>
            </material_1.Grid>
          </material_1.Paper>
        </material_1.Grid>

        {/* Processing Time Chart */}
        <material_1.Grid item xs={12} md={6}>
          <material_1.Paper sx={{ p: 2 }}>
            <material_1.Typography variant="h6" gutterBottom>
              Processing Time by Task Type
            </material_1.Typography>
            <TaskProcessingTimeByType_1.default data={processingTimeData}/>
          </material_1.Paper>
        </material_1.Grid>

        {/* Due Date Distribution */}
        <material_1.Grid item xs={12} md={6}>
          <material_1.Paper sx={{ p: 2 }}>
            <material_1.Typography variant="h6" gutterBottom>
              Due Date Distribution
            </material_1.Typography>
            <TaskDueDateDistribution_1.default data={dueDateData}/>
          </material_1.Paper>
        </material_1.Grid>
      </material_1.Grid>
    </material_1.Box>);
};
exports.default = TaskStatistics;
//# sourceMappingURL=TaskStatistics.js.map