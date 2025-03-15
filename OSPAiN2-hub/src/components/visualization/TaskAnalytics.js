"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const Task_1 = require("../../types/Task");
const TaskQueue_1 = __importDefault(require("../../services/TaskQueue"));
const styled_1 = __importDefault(require("@emotion/styled"));
const material_1 = require("@mui/material");
const TaskStatusDistribution_1 = __importDefault(require("./charts/TaskStatusDistribution"));
const TaskTypeDistribution_1 = __importDefault(require("./charts/TaskTypeDistribution"));
const TaskPriorityDistribution_1 = __importDefault(require("./charts/TaskPriorityDistribution"));
const TaskCompletionTimeTrend_1 = __importDefault(require("./charts/TaskCompletionTimeTrend"));
const TaskProcessingTimeByType_1 = __importDefault(require("./charts/TaskProcessingTimeByType"));
const WorkerPerformance_1 = __importDefault(require("./charts/WorkerPerformance"));
const TaskTags_1 = __importDefault(require("./charts/TaskTags"));
const TaskTimeline_1 = __importDefault(require("./charts/TaskTimeline"));
// Styled components
const AnalyticsContainer = (0, styled_1.default)(material_1.Paper) `
  padding: 24px;
  margin: 16px 0;
  background-color: rgba(15, 23, 42, 0.7);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;
const ChartContainer = (0, styled_1.default)(material_1.Paper) `
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
const ChartTitle = (0, styled_1.default)(material_1.Typography) `
  margin-bottom: 16px;
  font-weight: 600;
  color: #e2e8f0;
`;
const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (<div role="tabpanel" hidden={value !== index} id={`analytics-tabpanel-${index}`} aria-labelledby={`analytics-tab-${index}`} {...other}>
      {value === index && <material_1.Box sx={{ p: 3 }}>{children}</material_1.Box>}
    </div>);
};
/**
 * Task Analytics Component
 *
 * A comprehensive analytics dashboard for visualizing task data
 * including status distribution, completion trends, worker performance,
 * and other key metrics for the Ollama ecosystem.
 */
const TaskAnalytics = () => {
    const [tasks, setTasks] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [tabValue, setTabValue] = (0, react_1.useState)(0);
    const [timeRange, setTimeRange] = (0, react_1.useState)("week");
    // Fetch tasks
    (0, react_1.useEffect)(() => {
        const fetchTasks = async () => {
            setLoading(true);
            try {
                // Check if taskQueue exists before calling it
                if (!TaskQueue_1.default || typeof TaskQueue_1.default.getAllTasks !== "function") {
                    console.warn("TaskQueue not available or missing getAllTasks method");
                    setTasks([]);
                    return;
                }
                const allTasks = await TaskQueue_1.default.getAllTasks();
                // Validate that tasks array is returned
                if (!Array.isArray(allTasks)) {
                    console.warn("getAllTasks did not return an array, using empty array instead");
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
                    }
                    else if (timeRange === "week") {
                        cutoffDate.setDate(now.getDate() - 7);
                    }
                    else if (timeRange === "month") {
                        cutoffDate.setMonth(now.getMonth() - 1);
                    }
                    filteredTasks = allTasks.filter((task) => new Date(task.createdAt) >= cutoffDate);
                }
                setTasks(filteredTasks);
            }
            catch (error) {
                console.error("Failed to fetch tasks for analytics:", error);
                // Set empty array instead of leaving previous data that could be invalid
                setTasks([]);
            }
            finally {
                setLoading(false);
            }
        };
        fetchTasks();
        // Set up interval to refresh data
        const intervalId = setInterval(fetchTasks, 30000); // Refresh every 30 seconds
        return () => clearInterval(intervalId);
    }, [timeRange]);
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };
    const handleTimeRangeChange = (range) => {
        setTimeRange(range);
    };
    // Calculate metrics
    const completedTasks = tasks.filter((task) => task.status === Task_1.TaskStatus.COMPLETED);
    const failedTasks = tasks.filter((task) => task.status === Task_1.TaskStatus.FAILED);
    const averageCompletionTime = calculateAverageCompletionTime(completedTasks);
    const successRate = completedTasks.length > 0
        ? Math.round((completedTasks.length /
            (completedTasks.length + failedTasks.length)) *
            100)
        : 0;
    if (loading) {
        return (<material_1.Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <material_1.CircularProgress />
      </material_1.Box>);
    }
    return (<AnalyticsContainer>
      <material_1.Typography variant="h4" gutterBottom sx={{ color: "#f8fafc", marginBottom: "24px" }}>
        Task Analytics Dashboard
      </material_1.Typography>

      {/* Key Metrics Summary */}
      <material_1.Grid container spacing={3} sx={{ marginBottom: "24px" }}>
        <material_1.Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Total Tasks" value={tasks.length.toString()} icon="📊"/>
        </material_1.Grid>
        <material_1.Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Completed Tasks" value={completedTasks.length.toString()} icon="✅"/>
        </material_1.Grid>
        <material_1.Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Success Rate" value={`${successRate}%`} icon="🎯"/>
        </material_1.Grid>
        <material_1.Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Avg. Completion Time" value={`${averageCompletionTime}ms`} icon="⏱️"/>
        </material_1.Grid>
      </material_1.Grid>

      {/* Time Range Selector */}
      <material_1.Box sx={{ marginBottom: "24px" }}>
        <material_1.Typography variant="subtitle1" sx={{ color: "#cbd5e1", marginBottom: "8px" }}>
          Time Range:
        </material_1.Typography>
        <material_1.Box display="flex" gap={2}>
          <TimeRangeButton active={timeRange === "today"} onClick={() => handleTimeRangeChange("today")}>
            Today
          </TimeRangeButton>
          <TimeRangeButton active={timeRange === "week"} onClick={() => handleTimeRangeChange("week")}>
            Last Week
          </TimeRangeButton>
          <TimeRangeButton active={timeRange === "month"} onClick={() => handleTimeRangeChange("month")}>
            Last Month
          </TimeRangeButton>
          <TimeRangeButton active={timeRange === "all"} onClick={() => handleTimeRangeChange("all")}>
            All Time
          </TimeRangeButton>
        </material_1.Box>
      </material_1.Box>

      {/* Tab Navigation */}
      <material_1.Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <material_1.Tabs value={tabValue} onChange={handleTabChange} aria-label="analytics tabs" textColor="inherit" sx={{
            "& .MuiTabs-indicator": { backgroundColor: "#3b82f6" },
            "& .MuiTab-root": { color: "#cbd5e1" },
            "& .Mui-selected": { color: "#3b82f6" },
        }}>
          <material_1.Tab label="Overview" id="analytics-tab-0"/>
          <material_1.Tab label="Performance" id="analytics-tab-1"/>
          <material_1.Tab label="Timeline" id="analytics-tab-2"/>
        </material_1.Tabs>
      </material_1.Box>

      {/* Tab Content */}
      <TabPanel value={tabValue} index={0}>
        <material_1.Grid container spacing={3}>
          <material_1.Grid item xs={12} md={6}>
            <ChartContainer>
              <ChartTitle variant="h6">Task Status Distribution</ChartTitle>
              <TaskStatusDistribution_1.default tasks={tasks}/>
            </ChartContainer>
          </material_1.Grid>
          <material_1.Grid item xs={12} md={6}>
            <ChartContainer>
              <ChartTitle variant="h6">Task Type Distribution</ChartTitle>
              <TaskTypeDistribution_1.default tasks={tasks}/>
            </ChartContainer>
          </material_1.Grid>
          <material_1.Grid item xs={12} md={6}>
            <ChartContainer>
              <ChartTitle variant="h6">Priority Distribution</ChartTitle>
              <TaskPriorityDistribution_1.default tasks={tasks}/>
            </ChartContainer>
          </material_1.Grid>
          <material_1.Grid item xs={12} md={6}>
            <ChartContainer>
              <ChartTitle variant="h6">Task Tags</ChartTitle>
              <TaskTags_1.default tasks={tasks}/>
            </ChartContainer>
          </material_1.Grid>
        </material_1.Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <material_1.Grid container spacing={3}>
          <material_1.Grid item xs={12} md={6}>
            <ChartContainer>
              <ChartTitle variant="h6">Completion Time Trend</ChartTitle>
              <TaskCompletionTimeTrend_1.default tasks={completedTasks}/>
            </ChartContainer>
          </material_1.Grid>
          <material_1.Grid item xs={12} md={6}>
            <ChartContainer>
              <ChartTitle variant="h6">Processing Time by Type</ChartTitle>
              <TaskProcessingTimeByType_1.default tasks={completedTasks}/>
            </ChartContainer>
          </material_1.Grid>
          <material_1.Grid item xs={12}>
            <ChartContainer>
              <ChartTitle variant="h6">Worker Performance</ChartTitle>
              <WorkerPerformance_1.default tasks={tasks}/>
            </ChartContainer>
          </material_1.Grid>
        </material_1.Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <ChartContainer>
          <ChartTitle variant="h6">Task Timeline</ChartTitle>
          <TaskTimeline_1.default tasks={tasks}/>
        </ChartContainer>
      </TabPanel>
    </AnalyticsContainer>);
};
const MetricCard = ({ title, value, icon }) => {
    return (<material_1.Paper sx={{
            padding: "16px",
            borderRadius: "8px",
            backgroundColor: "rgba(30, 41, 59, 0.7)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            minHeight: "120px",
        }}>
      <material_1.Typography variant="h2" sx={{ fontSize: "36px", marginBottom: "8px" }}>
        {icon}
      </material_1.Typography>
      <material_1.Typography variant="h5" sx={{ color: "#f8fafc", fontWeight: "bold" }}>
        {value}
      </material_1.Typography>
      <material_1.Typography variant="subtitle1" sx={{ color: "#94a3b8" }}>
        {title}
      </material_1.Typography>
    </material_1.Paper>);
};
const TimeRangeButton = ({ active, onClick, children, }) => {
    return (<material_1.Box onClick={onClick} sx={{
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
        }}>
      {children}
    </material_1.Box>);
};
// Helper function to calculate average completion time
const calculateAverageCompletionTime = (tasks) => {
    if (tasks.length === 0)
        return 0;
    const tasksWithCompletionTime = tasks.filter((task) => task.startedAt && task.completedAt);
    if (tasksWithCompletionTime.length === 0)
        return 0;
    const totalTime = tasksWithCompletionTime.reduce((sum, task) => {
        const startTime = new Date(task.startedAt).getTime();
        const endTime = new Date(task.completedAt).getTime();
        return sum + (endTime - startTime);
    }, 0);
    return Math.round(totalTime / tasksWithCompletionTime.length);
};
exports.default = TaskAnalytics;
//# sourceMappingURL=TaskAnalytics.js.map