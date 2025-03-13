import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import TodoManager from "../components/todo/TodoManager";

/**
 * TaskManager Page
 *
 * Displays a comprehensive task management interface for the master-todo.mdc file
 * This page serves as a complete implementation of the TodoManager component,
 * allowing users to view, filter, sort, and manage all tasks in the system.
 */
const TaskManager: React.FC = () => {
  return (
    <Box
      sx={{
        height: "calc(100vh - 100px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          background:
            "linear-gradient(90deg, rgba(43,83,129,1) 0%, rgba(38,109,150,1) 100%)",
          color: "white",
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Task Manager
        </Typography>
        <Typography variant="body1">
          Comprehensive task management for all items in the master-todo.mdc
          file
        </Typography>
      </Paper>

      <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
        <TodoManager className="task-manager-component" />
      </Box>
    </Box>
  );
};

export default TaskManager;
