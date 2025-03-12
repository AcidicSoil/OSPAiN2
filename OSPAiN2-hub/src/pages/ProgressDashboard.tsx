import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  Divider,
  Button,
  Tab,
  Tabs,
  FormControlLabel,
  Switch,
} from "@mui/material";
import ProgressTracker from "../components/todo/ProgressTracker";
import todoService, { TodoStatistics } from "../services/TodoService";
import { Refresh as RefreshIcon } from "@mui/icons-material";

/**
 * ProgressDashboard component
 *
 * Shows real-time progress tracking for all tasks in the project
 * Provides an overview dashboard with detailed breakdowns by category, priority, etc.
 */
const ProgressDashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<TodoStatistics | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30 seconds
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [tabValue, setTabValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Toggle auto-refresh
  const handleAutoRefreshToggle = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const enabled = event.target.checked;
    setAutoRefresh(enabled);

    if (enabled) {
      todoService.startMonitoring(refreshInterval);
    } else {
      todoService.stopMonitoring();
    }
  };

  // Manual refresh handler
  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      const stats = await todoService.forceRefresh();
      if (stats) {
        setStatistics(stats);
      }
    } catch (error) {
      console.error("Error refreshing statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize todo service monitoring and register listener
  useEffect(() => {
    // Start monitoring
    if (autoRefresh) {
      todoService.startMonitoring(refreshInterval);
    }

    // Register for updates
    const unsubscribe = todoService.registerListener((stats) => {
      setStatistics(stats);
    });

    // Clean up on unmount
    return () => {
      todoService.stopMonitoring();
      unsubscribe();
    };
  }, [refreshInterval, autoRefresh]);

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Progress Dashboard
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={handleAutoRefreshToggle}
                  color="primary"
                />
              }
              label="Auto-refresh"
            />

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleManualRefresh}
              disabled={loading}
              sx={{ ml: 2 }}
            >
              Refresh Now
            </Button>
          </Box>
        </Box>

        <Paper sx={{ p: 0, mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Overview" />
            <Tab label="By Category" />
            <Tab label="By Priority" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (
              <ProgressTracker
                refreshInterval={refreshInterval}
                showDetailedStats={true}
                maxCategories={10}
              />
            )}

            {tabValue === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Category Breakdown
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {statistics?.categoryStatus?.length ? (
                  statistics.categoryStatus
                    .sort((a, b) => b.percentComplete - a.percentComplete)
                    .map((category) => (
                      <Box key={category.category} sx={{ mb: 3 }}>
                        <Typography variant="subtitle1">
                          {category.category}
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <Box sx={{ width: "100%", mr: 1 }}>
                            <Box
                              sx={{
                                height: 12,
                                borderRadius: 6,
                                bgcolor: "grey.300",
                                position: "relative",
                                overflow: "hidden",
                              }}
                            >
                              <Box
                                sx={{
                                  position: "absolute",
                                  left: 0,
                                  top: 0,
                                  height: "100%",
                                  width: `${category.percentComplete}%`,
                                  bgcolor:
                                    category.percentComplete < 30
                                      ? "error.main"
                                      : category.percentComplete < 70
                                      ? "warning.main"
                                      : "success.main",
                                  transition: "width 0.5s ease-in-out",
                                }}
                              />
                            </Box>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{ minWidth: 45, textAlign: "right" }}
                          >
                            {category.percentComplete}%
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Completed: {category.completed}/{category.total}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            In Progress: {category.inProgress}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Not Started: {category.notStarted}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Blocked: {category.blocked}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                ) : (
                  <Typography color="text.secondary">
                    No category data available
                  </Typography>
                )}
              </Box>
            )}

            {tabValue === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Priority Breakdown
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {statistics?.priorityStatus?.length ? (
                  statistics.priorityStatus
                    .sort((a, b) => a.priority - b.priority)
                    .map((priority) => (
                      <Box key={priority.priority} sx={{ mb: 3 }}>
                        <Typography variant="subtitle1">
                          Priority {priority.priority}
                          {priority.priority === 1 && " (Critical)"}
                          {priority.priority === 2 && " (High)"}
                          {priority.priority === 3 && " (Medium)"}
                          {priority.priority === 4 && " (Low)"}
                          {priority.priority === 5 && " (Optional)"}
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <Box sx={{ width: "100%", mr: 1 }}>
                            <Box
                              sx={{
                                height: 12,
                                borderRadius: 6,
                                bgcolor: "grey.300",
                                position: "relative",
                                overflow: "hidden",
                              }}
                            >
                              <Box
                                sx={{
                                  position: "absolute",
                                  left: 0,
                                  top: 0,
                                  height: "100%",
                                  width: `${priority.percentComplete}%`,
                                  bgcolor:
                                    priority.priority <= 2
                                      ? "error.main"
                                      : priority.priority === 3
                                      ? "warning.main"
                                      : "success.main",
                                  transition: "width 0.5s ease-in-out",
                                }}
                              />
                            </Box>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{ minWidth: 45, textAlign: "right" }}
                          >
                            {priority.percentComplete}%
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Total Tasks: {priority.count}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Completed: {priority.completed}/{priority.count}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                ) : (
                  <Typography color="text.secondary">
                    No priority data available
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Paper>

        {statistics && (
          <Box sx={{ textAlign: "right", mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Last updated: {statistics.lastUpdated.toLocaleString()}
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ProgressDashboard;
