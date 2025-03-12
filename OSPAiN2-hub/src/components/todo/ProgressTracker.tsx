import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Button,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  CheckCircleOutline as CompletedIcon,
  RadioButtonUnchecked as NotStartedIcon,
  DonutLarge as InProgressIcon,
  Block as BlockedIcon,
  Loop as RecurringIcon,
} from "@mui/icons-material";

// Define types for our tasks
export interface TodoTask {
  id: string;
  title: string;
  description?: string;
  priority: 1 | 2 | 3 | 4 | 5;
  status: "not-started" | "in-progress" | "blocked" | "completed" | "recurring";
  category: string;
  subTasks?: TodoTask[];
  addedDate: string;
  completedDate?: string;
  percentComplete?: number; // Optional field for tasks with partial completion
}

export interface CategoryProgress {
  category: string;
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  blocked: number;
  recurring: number;
  percentComplete: number;
}

export interface PriorityBreakdown {
  priority: 1 | 2 | 3 | 4 | 5;
  count: number;
  completed: number;
  percentComplete: number;
}

export interface ProgressStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
  blockedTasks: number;
  recurringTasks: number;
  overallPercentComplete: number;
  categoryProgress: CategoryProgress[];
  priorityBreakdown: PriorityBreakdown[];
  recentlyCompletedTasks: TodoTask[];
  upcomingDeadlines: TodoTask[];
}

interface ProgressTrackerProps {
  refreshInterval?: number; // In milliseconds, default to 30 seconds
  showDetailedStats?: boolean;
  maxCategories?: number;
  className?: string;
}

/**
 * ProgressTracker Component
 *
 * A real-time progress tracker for todo tasks in the master-todo.md file.
 * Provides various visualizations of task progress including:
 * - Overall completion percentage
 * - Breakdown by category
 * - Breakdown by priority
 * - Status distribution
 * - Recently completed tasks
 * - Upcoming deadlines
 */
const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  refreshInterval = 30000,
  showDetailedStats = true,
  maxCategories = 5,
  className,
}) => {
  const theme = useTheme();
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Function to parse the master-todo.md file and calculate progress
  const calculateProgressStats = async (): Promise<ProgressStats> => {
    try {
      // In a real implementation, this would fetch and parse the master-todo.md file
      // For demo purposes, we're using mock data
      const mockStats: ProgressStats = {
        totalTasks: 120,
        completedTasks: 45,
        inProgressTasks: 25,
        notStartedTasks: 40,
        blockedTasks: 5,
        recurringTasks: 5,
        overallPercentComplete: 37.5, // (45/120) * 100
        categoryProgress: [
          {
            category: "Frontend Implementation",
            total: 30,
            completed: 9,
            inProgress: 12,
            notStarted: 6,
            blocked: 2,
            recurring: 1,
            percentComplete: 30,
          },
          {
            category: "Backend Development",
            total: 25,
            completed: 8,
            inProgress: 5,
            notStarted: 10,
            blocked: 1,
            recurring: 1,
            percentComplete: 32,
          },
          {
            category: "AI Infrastructure",
            total: 20,
            completed: 8,
            inProgress: 4,
            notStarted: 7,
            blocked: 0,
            recurring: 1,
            percentComplete: 40,
          },
          {
            category: "Agent Framework",
            total: 15,
            completed: 3,
            inProgress: 2,
            notStarted: 9,
            blocked: 1,
            recurring: 0,
            percentComplete: 20,
          },
          {
            category: "Development Tools",
            total: 18,
            completed: 10,
            inProgress: 2,
            notStarted: 4,
            blocked: 1,
            recurring: 1,
            percentComplete: 55.5,
          },
          {
            category: "Security & Compliance",
            total: 12,
            completed: 7,
            inProgress: 0,
            notStarted: 4,
            blocked: 0,
            recurring: 1,
            percentComplete: 58.3,
          },
        ],
        priorityBreakdown: [
          { priority: 1, count: 25, completed: 10, percentComplete: 40 },
          { priority: 2, count: 35, completed: 15, percentComplete: 42.9 },
          { priority: 3, count: 30, completed: 12, percentComplete: 40 },
          { priority: 4, count: 20, completed: 5, percentComplete: 25 },
          { priority: 5, count: 10, completed: 3, percentComplete: 30 },
        ],
        recentlyCompletedTasks: [
          {
            id: "1",
            title: "Implement TodoManager component",
            priority: 1,
            status: "completed",
            category: "Frontend Implementation",
            addedDate: "2023-11-01",
            completedDate: "2023-11-10",
          },
          {
            id: "2",
            title: "Create master-todo.md parser",
            priority: 2,
            status: "completed",
            category: "Development Tools",
            addedDate: "2023-11-02",
            completedDate: "2023-11-08",
          },
        ],
        upcomingDeadlines: [
          {
            id: "3",
            title: "Implement real-time progress tracking",
            priority: 1,
            status: "in-progress",
            category: "Frontend Implementation",
            addedDate: "2023-11-05",
          },
          {
            id: "4",
            title: "Set up CI/CD pipeline for testing",
            priority: 2,
            status: "not-started",
            category: "Development Tools",
            addedDate: "2023-11-07",
          },
        ],
      };

      return mockStats;
    } catch (err) {
      console.error("Error calculating progress stats:", err);
      throw new Error("Failed to calculate progress statistics");
    }
  };

  // Function to refresh the stats
  const refreshStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const newStats = await calculateProgressStats();
      setStats(newStats);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Failed to update progress statistics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and refresh interval
  useEffect(() => {
    refreshStats();

    // Set up refresh interval
    const intervalId = setInterval(refreshStats, refreshInterval);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  // Get status color
  const getStatusColor = (status: TodoTask["status"]) => {
    switch (status) {
      case "completed":
        return theme.palette.success.main;
      case "in-progress":
        return theme.palette.warning.main;
      case "not-started":
        return theme.palette.error.main;
      case "blocked":
        return theme.palette.info.main;
      case "recurring":
        return theme.palette.grey[500];
    }
  };

  // Get status icon
  const StatusIcon = ({ status }: { status: TodoTask["status"] }) => {
    switch (status) {
      case "completed":
        return <CompletedIcon sx={{ color: getStatusColor(status) }} />;
      case "in-progress":
        return <InProgressIcon sx={{ color: getStatusColor(status) }} />;
      case "not-started":
        return <NotStartedIcon sx={{ color: getStatusColor(status) }} />;
      case "blocked":
        return <BlockedIcon sx={{ color: getStatusColor(status) }} />;
      case "recurring":
        return <RecurringIcon sx={{ color: getStatusColor(status) }} />;
    }
  };

  // Render the progress bar with label
  const ProgressBar = ({ value, label }: { value: number; label?: string }) => (
    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress
          variant="determinate"
          value={value}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.palette.grey[200],
            "& .MuiLinearProgress-bar": {
              backgroundColor:
                value < 30
                  ? theme.palette.error.main
                  : value < 70
                  ? theme.palette.warning.main
                  : theme.palette.success.main,
            },
          }}
        />
      </Box>
      <Box sx={{ minWidth: 45, textAlign: "right" }}>
        <Typography variant="body2" color="text.secondary">
          {label || `${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  );

  // If still loading the initial data
  if (loading && !stats) {
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", p: 4 }}
        className={className}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If there's an error
  if (error && !stats) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }} className={className}>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={refreshStats}
          sx={{ mt: 1 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  // If no stats available yet
  if (!stats) return null;

  return (
    <Box className={className}>
      {/* Overall Progress Card */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Overall Progress"
          action={
            <Button
              startIcon={
                loading ? <CircularProgress size={20} /> : <RefreshIcon />
              }
              onClick={refreshStats}
              disabled={loading}
              size="small"
            >
              Refresh
            </Button>
          }
          subheader={`Last updated: ${lastUpdated.toLocaleTimeString()}`}
        />
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <ProgressBar value={stats.overallPercentComplete} />
            <Typography variant="h4" align="center" sx={{ mt: 1 }}>
              {Math.round(stats.overallPercentComplete)}% Complete
            </Typography>
          </Box>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={4} sm={2.4}>
              <Box sx={{ textAlign: "center" }}>
                <CompletedIcon color="success" sx={{ fontSize: 24 }} />
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
                <Typography variant="h6">{stats.completedTasks}</Typography>
              </Box>
            </Grid>
            <Grid item xs={4} sm={2.4}>
              <Box sx={{ textAlign: "center" }}>
                <InProgressIcon color="warning" sx={{ fontSize: 24 }} />
                <Typography variant="body2" color="text.secondary">
                  In Progress
                </Typography>
                <Typography variant="h6">{stats.inProgressTasks}</Typography>
              </Box>
            </Grid>
            <Grid item xs={4} sm={2.4}>
              <Box sx={{ textAlign: "center" }}>
                <NotStartedIcon color="error" sx={{ fontSize: 24 }} />
                <Typography variant="body2" color="text.secondary">
                  Not Started
                </Typography>
                <Typography variant="h6">{stats.notStartedTasks}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={2.4}>
              <Box sx={{ textAlign: "center" }}>
                <BlockedIcon color="info" sx={{ fontSize: 24 }} />
                <Typography variant="body2" color="text.secondary">
                  Blocked
                </Typography>
                <Typography variant="h6">{stats.blockedTasks}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={2.4}>
              <Box sx={{ textAlign: "center" }}>
                <RecurringIcon color="action" sx={{ fontSize: 24 }} />
                <Typography variant="body2" color="text.secondary">
                  Recurring
                </Typography>
                <Typography variant="h6">{stats.recurringTasks}</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {showDetailedStats && (
        <Grid container spacing={3}>
          {/* Category Progress */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%" }}>
              <CardHeader title="Progress by Category" />
              <CardContent sx={{ maxHeight: 350, overflow: "auto" }}>
                {stats.categoryProgress
                  .sort((a, b) => b.percentComplete - a.percentComplete)
                  .slice(0, maxCategories)
                  .map((category) => (
                    <Box key={category.category} sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2">
                          {category.category}
                        </Typography>
                        <Typography variant="body2">
                          {category.completed}/{category.total}
                        </Typography>
                      </Box>
                      <ProgressBar value={category.percentComplete} />
                    </Box>
                  ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Priority Breakdown */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%" }}>
              <CardHeader title="Progress by Priority" />
              <CardContent>
                {stats.priorityBreakdown
                  .sort((a, b) => a.priority - b.priority)
                  .map((priority) => (
                    <Box key={priority.priority} sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2">
                          Priority {priority.priority}
                        </Typography>
                        <Typography variant="body2">
                          {priority.completed}/{priority.count}
                        </Typography>
                      </Box>
                      <ProgressBar value={priority.percentComplete} />
                    </Box>
                  ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Recently Completed Tasks */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%" }}>
              <CardHeader title="Recently Completed" />
              <CardContent sx={{ maxHeight: 250, overflow: "auto" }}>
                {stats.recentlyCompletedTasks.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "center", py: 2 }}
                  >
                    No recently completed tasks
                  </Typography>
                ) : (
                  stats.recentlyCompletedTasks.map((task) => (
                    <Box
                      key={task.id}
                      sx={{
                        mb: 2,
                        p: 1,
                        borderRadius: 1,
                        bgcolor: "background.paper",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <StatusIcon status={task.status} />
                        <Typography
                          variant="body2"
                          sx={{ ml: 1, fontWeight: "medium" }}
                        >
                          {task.title}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Chip
                          size="small"
                          label={`P${task.priority}`}
                          sx={{
                            bgcolor:
                              task.priority <= 2
                                ? theme.palette.error.light
                                : task.priority <= 3
                                ? theme.palette.warning.light
                                : theme.palette.success.light,
                            color: "white",
                            fontSize: "0.7rem",
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Completed: {task.completedDate}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Upcoming Deadlines */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%" }}>
              <CardHeader title="Next Tasks" />
              <CardContent sx={{ maxHeight: 250, overflow: "auto" }}>
                {stats.upcomingDeadlines.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "center", py: 2 }}
                  >
                    No upcoming tasks found
                  </Typography>
                ) : (
                  stats.upcomingDeadlines.map((task) => (
                    <Box
                      key={task.id}
                      sx={{
                        mb: 2,
                        p: 1,
                        borderRadius: 1,
                        bgcolor: "background.paper",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <StatusIcon status={task.status} />
                        <Typography
                          variant="body2"
                          sx={{ ml: 1, fontWeight: "medium" }}
                        >
                          {task.title}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Chip
                          size="small"
                          label={`P${task.priority}`}
                          sx={{
                            bgcolor:
                              task.priority <= 2
                                ? theme.palette.error.light
                                : task.priority <= 3
                                ? theme.palette.warning.light
                                : theme.palette.success.light,
                            color: "white",
                            fontSize: "0.7rem",
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Added: {task.addedDate}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ProgressTracker;
