import React from "react";
import { Grid, Paper, Typography, Box } from "@mui/material";
import { Task } from "../../types/Task";
import TaskProcessingTimeByType from "./charts/TaskProcessingTimeByType";
import TaskDueDateDistribution from "./charts/TaskDueDateDistribution";
import {
  calculateProcessingTimeByType,
  extractDueDates,
} from "../../utils/chartDataTransformers";

interface TaskStatisticsProps {
  tasks: Task[];
}

const TaskStatistics: React.FC<TaskStatisticsProps> = ({ tasks }) => {
  // Calculate statistics
  const processingTimeData = calculateProcessingTimeByType(tasks);
  const dueDateData = extractDueDates(tasks);

  // Calculate general statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;
  const averageProcessingTime =
    tasks.reduce((sum, task) => {
      return sum + (task.processingTime || 0);
    }, 0) / (completedTasks || 1);

  const overdueTasks = tasks.filter((task) => {
    if (!task.dueDate || task.status === "completed") return false;
    return new Date(task.dueDate) < new Date();
  }).length;

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        {/* Summary Statistics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Task Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Tasks
                </Typography>
                <Typography variant="h4">{totalTasks}</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Completed Tasks
                </Typography>
                <Typography variant="h4">{completedTasks}</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Avg. Processing Time
                </Typography>
                <Typography variant="h4">
                  {Math.round(averageProcessingTime)}ms
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Overdue Tasks
                </Typography>
                <Typography variant="h4" color="error">
                  {overdueTasks}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Processing Time Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Processing Time by Task Type
            </Typography>
            <TaskProcessingTimeByType data={processingTimeData} />
          </Paper>
        </Grid>

        {/* Due Date Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Due Date Distribution
            </Typography>
            <TaskDueDateDistribution data={dueDateData} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskStatistics;
