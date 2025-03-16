import React, { useEffect, useState } from "react";
import { Task, TaskStatus, TaskType, TaskPriority } from "../../types/Task";
import taskQueue from "../../services/TaskQueue";
import styled from "@emotion/styled";
import {
  Typography,
  Paper,
  Grid,
  Box,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import TaskStatusDistribution from "./charts/TaskStatusDistribution";
import TaskTypeDistribution from "./charts/TaskTypeDistribution";
import TaskPriorityDistribution from "./charts/TaskPriorityDistribution";
import TaskCompletionTimeTrend from "./charts/TaskCompletionTimeTrend";
import TaskProcessingTimeByType from "./charts/TaskProcessingTimeByType";
import WorkerPerformance from "./charts/WorkerPerformance";
import TaskTags from "./charts/TaskTags";
import TaskTimeline from "./charts/TaskTimeline";

// Styled components
const AnalyticsContainer = styled(Paper)`
  padding: 24px;
  margin: 16px 0;
  background-color: rgba(15, 23, 42, 0.7);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const ChartContainer = styled(Paper)`
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: rgba(30, 41, 59, 0.7);
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
`;

const ChartTitle = styled(Typography)`
  margin-bottom: 16px;
  font-weight: 600;
  color: #e2e8f0;
`;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

/**
 * Task Analytics Component
 *
 * A comprehensive analytics dashboard for visualizing task data
 * including status distribution, completion trends, worker performance,
 * and other key metrics for the Ollama ecosystem.
 */
const TaskAnalytics: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState<
    "today" | "week" | "month" | "all"
  >("week");

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        // Check if taskQueue exists before calling it
        if (!taskQueue || typeof taskQueue.getAllTasks !== "function") {
          console.warn("TaskQueue not available or missing getAllTasks method");
          setTasks([]);
          return;
        }

        const allTasks = await taskQueue.getAllTasks();

        // Validate that tasks array is returned
        if (!Array.isArray(allTasks)) {
          console.warn(
            "getAllTasks did not return an array, using empty array instead"
          );
          setTasks([]);
          return;
        }

        // Filter by time range if needed
        let filteredTasks = allTasks;
        if (timeRange !== "all") {
          const now = new Date();
          let cutoffDate = new Date();

          if (timeRange === "today") {
            cutoffDate.setHours(0, 0, 0, 0);
          } else if (timeRange === "week") {
            cutoffDate.setDate(now.getDate() - 7);
          } else if (timeRange === "month") {
            cutoffDate.setMonth(now.getMonth() - 1);
          }

          filteredTasks = allTasks.filter(
            (task) => new Date(task.createdAt) >= cutoffDate
          );
        }

        setTasks(filteredTasks);
      } catch (error) {
        console.error("Failed to fetch tasks for analytics:", error);
        // Set empty array instead of leaving previous data that could be invalid
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();

    // Set up interval to refresh data
    const intervalId = setInterval(fetchTasks, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, [timeRange]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTimeRangeChange = (range: "today" | "week" | "month" | "all") => {
    setTimeRange(range);
  };

  // Calculate metrics
  const completedTasks = tasks.filter(
    (task) => task.status === TaskStatus.COMPLETED
  );
  const failedTasks = tasks.filter((task) => task.status === TaskStatus.FAILED);
  const averageCompletionTime = calculateAverageCompletionTime(completedTasks);
  const successRate =
    completedTasks.length > 0
      ? Math.round(
          (completedTasks.length /
            (completedTasks.length + failedTasks.length)) *
            100
        )
      : 0;

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AnalyticsContainer>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: "#f8fafc", marginBottom: "24px" }}
      >
        Task Analytics Dashboard
      </Typography>

      {/* Key Metrics Summary */}
      <Grid container spacing={3} sx={{ marginBottom: "24px" }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Tasks"
            value={tasks.length.toString()}
            icon="📊"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Completed Tasks"
            value={completedTasks.length.toString()}
            icon="✅"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Success Rate"
            value={`${successRate}%`}
            icon="🎯"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Avg. Completion Time"
            value={`${averageCompletionTime}ms`}
            icon="⏱️"
          />
        </Grid>
      </Grid>

      {/* Time Range Selector */}
      <Box sx={{ marginBottom: "24px" }}>
        <Typography
          variant="subtitle1"
          sx={{ color: "#cbd5e1", marginBottom: "8px" }}
        >
          Time Range:
        </Typography>
        <Box display="flex" gap={2}>
          <TimeRangeButton
            active={timeRange === "today"}
            onClick={() => handleTimeRangeChange("today")}
          >
            Today
          </TimeRangeButton>
          <TimeRangeButton
            active={timeRange === "week"}
            onClick={() => handleTimeRangeChange("week")}
          >
            Last Week
          </TimeRangeButton>
          <TimeRangeButton
            active={timeRange === "month"}
            onClick={() => handleTimeRangeChange("month")}
          >
            Last Month
          </TimeRangeButton>
          <TimeRangeButton
            active={timeRange === "all"}
            onClick={() => handleTimeRangeChange("all")}
          >
            All Time
          </TimeRangeButton>
        </Box>
      </Box>

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="analytics tabs"
          textColor="inherit"
          sx={{
            "& .MuiTabs-indicator": { backgroundColor: "#3b82f6" },
            "& .MuiTab-root": { color: "#cbd5e1" },
            "& .Mui-selected": { color: "#3b82f6" },
          }}
        >
          <Tab label="Overview" id="analytics-tab-0" />
          <Tab label="Performance" id="analytics-tab-1" />
          <Tab label="Timeline" id="analytics-tab-2" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ChartContainer>
              <ChartTitle variant="h6">Task Status Distribution</ChartTitle>
              <TaskStatusDistribution tasks={tasks} />
            </ChartContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartContainer>
              <ChartTitle variant="h6">Task Type Distribution</ChartTitle>
              <TaskTypeDistribution tasks={tasks} />
            </ChartContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartContainer>
              <ChartTitle variant="h6">Priority Distribution</ChartTitle>
              <TaskPriorityDistribution tasks={tasks} />
            </ChartContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartContainer>
              <ChartTitle variant="h6">Task Tags</ChartTitle>
              <TaskTags tasks={tasks} />
            </ChartContainer>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ChartContainer>
              <ChartTitle variant="h6">Completion Time Trend</ChartTitle>
              <TaskCompletionTimeTrend tasks={completedTasks} />
            </ChartContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartContainer>
              <ChartTitle variant="h6">Processing Time by Type</ChartTitle>
              <TaskProcessingTimeByType tasks={completedTasks} />
            </ChartContainer>
          </Grid>
          <Grid item xs={12}>
            <ChartContainer>
              <ChartTitle variant="h6">Worker Performance</ChartTitle>
              <WorkerPerformance tasks={tasks} />
            </ChartContainer>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <ChartContainer>
          <ChartTitle variant="h6">Task Timeline</ChartTitle>
          <TaskTimeline tasks={tasks} />
        </ChartContainer>
      </TabPanel>
    </AnalyticsContainer>
  );
};

// Helper component for metric cards
interface MetricCardProps {
  title: string;
  value: string;
  icon: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon }) => {
  return (
    <Paper
      sx={{
        padding: "16px",
        borderRadius: "8px",
        backgroundColor: "rgba(30, 41, 59, 0.7)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        minHeight: "120px",
      }}
    >
      <Typography variant="h2" sx={{ fontSize: "36px", marginBottom: "8px" }}>
        {icon}
      </Typography>
      <Typography variant="h5" sx={{ color: "#f8fafc", fontWeight: "bold" }}>
        {value}
      </Typography>
      <Typography variant="subtitle1" sx={{ color: "#94a3b8" }}>
        {title}
      </Typography>
    </Paper>
  );
};

// Helper component for time range buttons
interface TimeRangeButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const TimeRangeButton: React.FC<TimeRangeButtonProps> = ({
  active,
  onClick,
  children,
}) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        padding: "8px 16px",
        borderRadius: "4px",
        backgroundColor: active
          ? "rgba(59, 130, 246, 0.8)"
          : "rgba(30, 41, 59, 0.7)",
        color: active ? "#fff" : "#cbd5e1",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: active
            ? "rgba(59, 130, 246, 0.9)"
            : "rgba(51, 65, 85, 0.7)",
        },
      }}
    >
      {children}
    </Box>
  );
};

// Helper function to calculate average completion time
const calculateAverageCompletionTime = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;

  const tasksWithCompletionTime = tasks.filter(
    (task) => task.startedAt && task.completedAt
  );

  if (tasksWithCompletionTime.length === 0) return 0;

  const totalTime = tasksWithCompletionTime.reduce((sum, task) => {
    const startTime = new Date(task.startedAt!).getTime();
    const endTime = new Date(task.completedAt!).getTime();
    return sum + (endTime - startTime);
  }, 0);

  return Math.round(totalTime / tasksWithCompletionTime.length);
};

export default TaskAnalytics;
