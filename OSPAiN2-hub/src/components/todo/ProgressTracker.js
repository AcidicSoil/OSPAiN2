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
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
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
const ProgressTracker = ({ refreshInterval = 30000, showDetailedStats = true, maxCategories = 5, className, }) => {
    const theme = (0, material_1.useTheme)();
    const [stats, setStats] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [lastUpdated, setLastUpdated] = (0, react_1.useState)(new Date());
    // Function to parse the master-todo.md file and calculate progress
    const calculateProgressStats = async () => {
        try {
            // In a real implementation, this would fetch and parse the master-todo.md file
            // For demo purposes, we're using mock data
            const mockStats = {
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
        }
        catch (err) {
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
        }
        catch (err) {
            setError("Failed to update progress statistics");
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    // Initial load and refresh interval
    (0, react_1.useEffect)(() => {
        refreshStats();
        // Set up refresh interval
        const intervalId = setInterval(refreshStats, refreshInterval);
        // Clean up interval on unmount
        return () => clearInterval(intervalId);
    }, [refreshInterval]);
    // Get status color
    const getStatusColor = (status) => {
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
    const StatusIcon = ({ status }) => {
        switch (status) {
            case "completed":
                return <icons_material_1.CheckCircleOutline sx={{ color: getStatusColor(status) }}/>;
            case "in-progress":
                return <icons_material_1.DonutLarge sx={{ color: getStatusColor(status) }}/>;
            case "not-started":
                return <icons_material_1.RadioButtonUnchecked sx={{ color: getStatusColor(status) }}/>;
            case "blocked":
                return <icons_material_1.Block sx={{ color: getStatusColor(status) }}/>;
            case "recurring":
                return <icons_material_1.Loop sx={{ color: getStatusColor(status) }}/>;
        }
    };
    // Render the progress bar with label
    const ProgressBar = ({ value, label }) => (<material_1.Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
      <material_1.Box sx={{ width: "100%", mr: 1 }}>
        <material_1.LinearProgress variant="determinate" value={value} sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.palette.grey[200],
            "& .MuiLinearProgress-bar": {
                backgroundColor: value < 30
                    ? theme.palette.error.main
                    : value < 70
                        ? theme.palette.warning.main
                        : theme.palette.success.main,
            },
        }}/>
      </material_1.Box>
      <material_1.Box sx={{ minWidth: 45, textAlign: "right" }}>
        <material_1.Typography variant="body2" color="text.secondary">
          {label || `${Math.round(value)}%`}
        </material_1.Typography>
      </material_1.Box>
    </material_1.Box>);
    // If still loading the initial data
    if (loading && !stats) {
        return (<material_1.Box sx={{ display: "flex", justifyContent: "center", p: 4 }} className={className}>
        <material_1.CircularProgress />
      </material_1.Box>);
    }
    // If there's an error
    if (error && !stats) {
        return (<material_1.Box sx={{ p: 2, textAlign: "center" }} className={className}>
        <material_1.Typography color="error" gutterBottom>
          {error}
        </material_1.Typography>
        <material_1.Button variant="outlined" startIcon={<icons_material_1.Refresh />} onClick={refreshStats} sx={{ mt: 1 }}>
          Retry
        </material_1.Button>
      </material_1.Box>);
    }
    // If no stats available yet
    if (!stats)
        return null;
    return (<material_1.Box className={className}>
      {/* Overall Progress Card */}
      <material_1.Card sx={{ mb: 3 }}>
        <material_1.CardHeader title="Overall Progress" action={<material_1.Button startIcon={loading ? <material_1.CircularProgress size={20}/> : <icons_material_1.Refresh />} onClick={refreshStats} disabled={loading} size="small">
              Refresh
            </material_1.Button>} subheader={`Last updated: ${lastUpdated.toLocaleTimeString()}`}/>
        <material_1.CardContent>
          <material_1.Box sx={{ mb: 3 }}>
            <ProgressBar value={stats.overallPercentComplete}/>
            <material_1.Typography variant="h4" align="center" sx={{ mt: 1 }}>
              {Math.round(stats.overallPercentComplete)}% Complete
            </material_1.Typography>
          </material_1.Box>

          <material_1.Grid container spacing={2} sx={{ mt: 1 }}>
            <material_1.Grid item xs={4} sm={2.4}>
              <material_1.Box sx={{ textAlign: "center" }}>
                <icons_material_1.CheckCircleOutline color="success" sx={{ fontSize: 24 }}/>
                <material_1.Typography variant="body2" color="text.secondary">
                  Completed
                </material_1.Typography>
                <material_1.Typography variant="h6">{stats.completedTasks}</material_1.Typography>
              </material_1.Box>
            </material_1.Grid>
            <material_1.Grid item xs={4} sm={2.4}>
              <material_1.Box sx={{ textAlign: "center" }}>
                <icons_material_1.DonutLarge color="warning" sx={{ fontSize: 24 }}/>
                <material_1.Typography variant="body2" color="text.secondary">
                  In Progress
                </material_1.Typography>
                <material_1.Typography variant="h6">{stats.inProgressTasks}</material_1.Typography>
              </material_1.Box>
            </material_1.Grid>
            <material_1.Grid item xs={4} sm={2.4}>
              <material_1.Box sx={{ textAlign: "center" }}>
                <icons_material_1.RadioButtonUnchecked color="error" sx={{ fontSize: 24 }}/>
                <material_1.Typography variant="body2" color="text.secondary">
                  Not Started
                </material_1.Typography>
                <material_1.Typography variant="h6">{stats.notStartedTasks}</material_1.Typography>
              </material_1.Box>
            </material_1.Grid>
            <material_1.Grid item xs={6} sm={2.4}>
              <material_1.Box sx={{ textAlign: "center" }}>
                <icons_material_1.Block color="info" sx={{ fontSize: 24 }}/>
                <material_1.Typography variant="body2" color="text.secondary">
                  Blocked
                </material_1.Typography>
                <material_1.Typography variant="h6">{stats.blockedTasks}</material_1.Typography>
              </material_1.Box>
            </material_1.Grid>
            <material_1.Grid item xs={6} sm={2.4}>
              <material_1.Box sx={{ textAlign: "center" }}>
                <icons_material_1.Loop color="action" sx={{ fontSize: 24 }}/>
                <material_1.Typography variant="body2" color="text.secondary">
                  Recurring
                </material_1.Typography>
                <material_1.Typography variant="h6">{stats.recurringTasks}</material_1.Typography>
              </material_1.Box>
            </material_1.Grid>
          </material_1.Grid>
        </material_1.CardContent>
      </material_1.Card>

      {showDetailedStats && (<material_1.Grid container spacing={3}>
          {/* Category Progress */}
          <material_1.Grid item xs={12} md={6}>
            <material_1.Card sx={{ height: "100%" }}>
              <material_1.CardHeader title="Progress by Category"/>
              <material_1.CardContent sx={{ maxHeight: 350, overflow: "auto" }}>
                {stats.categoryProgress
                .sort((a, b) => b.percentComplete - a.percentComplete)
                .slice(0, maxCategories)
                .map((category) => (<material_1.Box key={category.category} sx={{ mb: 2 }}>
                      <material_1.Box sx={{
                    display: "flex",
                    justifyContent: "space-between",
                }}>
                        <material_1.Typography variant="body2">
                          {category.category}
                        </material_1.Typography>
                        <material_1.Typography variant="body2">
                          {category.completed}/{category.total}
                        </material_1.Typography>
                      </material_1.Box>
                      <ProgressBar value={category.percentComplete}/>
                    </material_1.Box>))}
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>

          {/* Priority Breakdown */}
          <material_1.Grid item xs={12} md={6}>
            <material_1.Card sx={{ height: "100%" }}>
              <material_1.CardHeader title="Progress by Priority"/>
              <material_1.CardContent>
                {stats.priorityBreakdown
                .sort((a, b) => a.priority - b.priority)
                .map((priority) => (<material_1.Box key={priority.priority} sx={{ mb: 2 }}>
                      <material_1.Box sx={{
                    display: "flex",
                    justifyContent: "space-between",
                }}>
                        <material_1.Typography variant="body2">
                          Priority {priority.priority}
                        </material_1.Typography>
                        <material_1.Typography variant="body2">
                          {priority.completed}/{priority.count}
                        </material_1.Typography>
                      </material_1.Box>
                      <ProgressBar value={priority.percentComplete}/>
                    </material_1.Box>))}
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>

          {/* Recently Completed Tasks */}
          <material_1.Grid item xs={12} md={6}>
            <material_1.Card sx={{ height: "100%" }}>
              <material_1.CardHeader title="Recently Completed"/>
              <material_1.CardContent sx={{ maxHeight: 250, overflow: "auto" }}>
                {stats.recentlyCompletedTasks.length === 0 ? (<material_1.Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                    No recently completed tasks
                  </material_1.Typography>) : (stats.recentlyCompletedTasks.map((task) => (<material_1.Box key={task.id} sx={{
                    mb: 2,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: "background.paper",
                }}>
                      <material_1.Box sx={{ display: "flex", alignItems: "center" }}>
                        <StatusIcon status={task.status}/>
                        <material_1.Typography variant="body2" sx={{ ml: 1, fontWeight: "medium" }}>
                          {task.title}
                        </material_1.Typography>
                      </material_1.Box>
                      <material_1.Box sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1,
                }}>
                        <material_1.Chip size="small" label={`P${task.priority}`} sx={{
                    bgcolor: task.priority <= 2
                        ? theme.palette.error.light
                        : task.priority <= 3
                            ? theme.palette.warning.light
                            : theme.palette.success.light,
                    color: "white",
                    fontSize: "0.7rem",
                }}/>
                        <material_1.Typography variant="caption" color="text.secondary">
                          Completed: {task.completedDate}
                        </material_1.Typography>
                      </material_1.Box>
                    </material_1.Box>)))}
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>

          {/* Upcoming Deadlines */}
          <material_1.Grid item xs={12} md={6}>
            <material_1.Card sx={{ height: "100%" }}>
              <material_1.CardHeader title="Next Tasks"/>
              <material_1.CardContent sx={{ maxHeight: 250, overflow: "auto" }}>
                {stats.upcomingDeadlines.length === 0 ? (<material_1.Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                    No upcoming tasks found
                  </material_1.Typography>) : (stats.upcomingDeadlines.map((task) => (<material_1.Box key={task.id} sx={{
                    mb: 2,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: "background.paper",
                }}>
                      <material_1.Box sx={{ display: "flex", alignItems: "center" }}>
                        <StatusIcon status={task.status}/>
                        <material_1.Typography variant="body2" sx={{ ml: 1, fontWeight: "medium" }}>
                          {task.title}
                        </material_1.Typography>
                      </material_1.Box>
                      <material_1.Box sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1,
                }}>
                        <material_1.Chip size="small" label={`P${task.priority}`} sx={{
                    bgcolor: task.priority <= 2
                        ? theme.palette.error.light
                        : task.priority <= 3
                            ? theme.palette.warning.light
                            : theme.palette.success.light,
                    color: "white",
                    fontSize: "0.7rem",
                }}/>
                        <material_1.Typography variant="caption" color="text.secondary">
                          Added: {task.addedDate}
                        </material_1.Typography>
                      </material_1.Box>
                    </material_1.Box>)))}
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>
        </material_1.Grid>)}
    </material_1.Box>);
};
exports.default = ProgressTracker;
//# sourceMappingURL=ProgressTracker.js.map