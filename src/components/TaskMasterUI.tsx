import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Button,
  Grid,
} from "@mui/material";
import {
  PlayArrow as PlayIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import TaskMaster from "../services/TaskMaster";
import { styled } from "@mui/material/styles";

const TaskContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const TaskList = styled(List)(({ theme }) => ({
  width: "100%",
  backgroundColor: theme.palette.background.paper,
}));

const TaskItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
}));

const TaskMasterUI: React.FC = () => {
  const [tasks, setTasks] = useState<
    ReturnType<typeof TaskMaster.getCurrentTasks>
  >([]);
  const [serverStatus, setServerStatus] = useState<
    "checking" | "running" | "stopped"
  >("checking");

  useEffect(() => {
    // Start task monitoring
    TaskMaster.startTaskMonitoring();
    TaskMaster.monitorConsoleErrors();

    // Update tasks periodically
    const updateInterval = setInterval(() => {
      setTasks(TaskMaster.getCurrentTasks());
    }, 1000);

    // Check server status periodically
    const checkServer = async () => {
      try {
        await TaskMaster.checkLocalServer();
        setServerStatus("running");
      } catch {
        setServerStatus("stopped");
      }
    };
    checkServer();
    const serverInterval = setInterval(checkServer, 5000);

    return () => {
      clearInterval(updateInterval);
      clearInterval(serverInterval);
    };
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "default",
      "in-progress": "primary",
      completed: "success",
      failed: "error",
    };
    return colors[status] || "default";
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: "error",
      medium: "warning",
      low: "info",
    };
    return colors[priority] || "default";
  };

  return (
    <Box>
      <TaskContainer>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Task Master Control Panel
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Chip
              label={`Server: ${serverStatus}`}
              color={serverStatus === "running" ? "success" : "error"}
              sx={{ marginRight: 1 }}
            />
            <Chip label={`Active Tasks: ${tasks.length}`} color="primary" />
          </Grid>
          <Grid item xs={12}>
            <TaskList>
              {tasks.map((task) => (
                <TaskItem key={task.id}>
                  <ListItemText
                    primary={task.description}
                    secondary={
                      <React.Fragment>
                        <Chip
                          size="small"
                          label={`Status: ${task.status}`}
                          color={getStatusColor(task.status) as any}
                          sx={{ marginRight: 1 }}
                        />
                        <Chip
                          size="small"
                          label={`Priority: ${task.priority}`}
                          color={getPriorityColor(task.priority) as any}
                        />
                      </React.Fragment>
                    }
                  />
                  {task.status === "pending" && (
                    <IconButton
                      onClick={() => TaskMaster.startTask(task.id)}
                      color="primary"
                    >
                      <PlayIcon />
                    </IconButton>
                  )}
                  {task.status === "in-progress" && (
                    <IconButton
                      onClick={() => TaskMaster.completeTask(task.id)}
                      color="success"
                    >
                      <CheckIcon />
                    </IconButton>
                  )}
                  {task.status === "in-progress" && (
                    <IconButton
                      onClick={() => TaskMaster.failTask(task.id)}
                      color="error"
                    >
                      <ErrorIcon />
                    </IconButton>
                  )}
                </TaskItem>
              ))}
            </TaskList>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={() => TaskMaster.checkLocalServer()}
              color="primary"
            >
              Check Server Status
            </Button>
          </Grid>
        </Grid>
      </TaskContainer>
    </Box>
  );
};

export default TaskMasterUI;
