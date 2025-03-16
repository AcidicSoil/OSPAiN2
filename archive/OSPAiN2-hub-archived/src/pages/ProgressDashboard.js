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
const material_1 = require("@mui/material");
const ProgressTracker_1 = __importDefault(require("../components/todo/ProgressTracker"));
const TodoService_1 = __importDefault(require("../services/TodoService"));
const icons_material_1 = require("@mui/icons-material");
/**
 * ProgressDashboard component
 *
 * Shows real-time progress tracking for all tasks in the project
 * Provides an overview dashboard with detailed breakdowns by category, priority, etc.
 */
const ProgressDashboard = () => {
    const [statistics, setStatistics] = (0, react_1.useState)(null);
    const [refreshInterval, setRefreshInterval] = (0, react_1.useState)(30000); // 30 seconds
    const [autoRefresh, setAutoRefresh] = (0, react_1.useState)(true);
    const [tabValue, setTabValue] = (0, react_1.useState)(0);
    const [loading, setLoading] = (0, react_1.useState)(false);
    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };
    // Toggle auto-refresh
    const handleAutoRefreshToggle = (event) => {
        const enabled = event.target.checked;
        setAutoRefresh(enabled);
        if (enabled) {
            TodoService_1.default.startMonitoring(refreshInterval);
        }
        else {
            TodoService_1.default.stopMonitoring();
        }
    };
    // Manual refresh handler
    const handleManualRefresh = async () => {
        setLoading(true);
        try {
            const stats = await TodoService_1.default.forceRefresh();
            if (stats) {
                setStatistics(stats);
            }
        }
        catch (error) {
            console.error("Error refreshing statistics:", error);
        }
        finally {
            setLoading(false);
        }
    };
    // Initialize todo service monitoring and register listener
    (0, react_1.useEffect)(() => {
        // Start monitoring
        if (autoRefresh) {
            TodoService_1.default.startMonitoring(refreshInterval);
        }
        // Register for updates
        const unsubscribe = TodoService_1.default.registerListener((stats) => {
            setStatistics(stats);
        });
        // Clean up on unmount
        return () => {
            TodoService_1.default.stopMonitoring();
            unsubscribe();
        };
    }, [refreshInterval, autoRefresh]);
    return (<material_1.Container maxWidth="xl">
      <material_1.Box sx={{ py: 4 }}>
        <material_1.Box sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
        }}>
          <material_1.Typography variant="h4" component="h1" gutterBottom>
            Progress Dashboard
          </material_1.Typography>

          <material_1.Box sx={{ display: "flex", alignItems: "center" }}>
            <material_1.FormControlLabel control={<material_1.Switch checked={autoRefresh} onChange={handleAutoRefreshToggle} color="primary"/>} label="Auto-refresh"/>

            <material_1.Button variant="outlined" startIcon={<icons_material_1.Refresh />} onClick={handleManualRefresh} disabled={loading} sx={{ ml: 2 }}>
              Refresh Now
            </material_1.Button>
          </material_1.Box>
        </material_1.Box>

        <material_1.Paper sx={{ p: 0, mb: 4 }}>
          <material_1.Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary" sx={{ borderBottom: 1, borderColor: "divider" }}>
            <material_1.Tab label="Overview"/>
            <material_1.Tab label="By Category"/>
            <material_1.Tab label="By Priority"/>
          </material_1.Tabs>

          <material_1.Box sx={{ p: 3 }}>
            {tabValue === 0 && (<ProgressTracker_1.default refreshInterval={refreshInterval} showDetailedStats={true} maxCategories={10}/>)}

            {tabValue === 1 && (<material_1.Box>
                <material_1.Typography variant="h6" gutterBottom>
                  Category Breakdown
                </material_1.Typography>
                <material_1.Divider sx={{ mb: 2 }}/>
                {statistics?.categoryStatus?.length ? (statistics.categoryStatus
                .sort((a, b) => b.percentComplete - a.percentComplete)
                .map((category) => (<material_1.Box key={category.category} sx={{ mb: 3 }}>
                        <material_1.Typography variant="subtitle1">
                          {category.category}
                        </material_1.Typography>
                        <material_1.Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                          <material_1.Box sx={{ width: "100%", mr: 1 }}>
                            <material_1.Box sx={{
                    height: 12,
                    borderRadius: 6,
                    bgcolor: "grey.300",
                    position: "relative",
                    overflow: "hidden",
                }}>
                              <material_1.Box sx={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                    width: `${category.percentComplete}%`,
                    bgcolor: category.percentComplete < 30
                        ? "error.main"
                        : category.percentComplete < 70
                            ? "warning.main"
                            : "success.main",
                    transition: "width 0.5s ease-in-out",
                }}/>
                            </material_1.Box>
                          </material_1.Box>
                          <material_1.Typography variant="body2" sx={{ minWidth: 45, textAlign: "right" }}>
                            {category.percentComplete}%
                          </material_1.Typography>
                        </material_1.Box>
                        <material_1.Box sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                }}>
                          <material_1.Typography variant="caption" color="text.secondary">
                            Completed: {category.completed}/{category.total}
                          </material_1.Typography>
                          <material_1.Typography variant="caption" color="text.secondary">
                            In Progress: {category.inProgress}
                          </material_1.Typography>
                          <material_1.Typography variant="caption" color="text.secondary">
                            Not Started: {category.notStarted}
                          </material_1.Typography>
                          <material_1.Typography variant="caption" color="text.secondary">
                            Blocked: {category.blocked}
                          </material_1.Typography>
                        </material_1.Box>
                      </material_1.Box>))) : (<material_1.Typography color="text.secondary">
                    No category data available
                  </material_1.Typography>)}
              </material_1.Box>)}

            {tabValue === 2 && (<material_1.Box>
                <material_1.Typography variant="h6" gutterBottom>
                  Priority Breakdown
                </material_1.Typography>
                <material_1.Divider sx={{ mb: 2 }}/>
                {statistics?.priorityStatus?.length ? (statistics.priorityStatus
                .sort((a, b) => a.priority - b.priority)
                .map((priority) => (<material_1.Box key={priority.priority} sx={{ mb: 3 }}>
                        <material_1.Typography variant="subtitle1">
                          Priority {priority.priority}
                          {priority.priority === 1 && " (Critical)"}
                          {priority.priority === 2 && " (High)"}
                          {priority.priority === 3 && " (Medium)"}
                          {priority.priority === 4 && " (Low)"}
                          {priority.priority === 5 && " (Optional)"}
                        </material_1.Typography>
                        <material_1.Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                          <material_1.Box sx={{ width: "100%", mr: 1 }}>
                            <material_1.Box sx={{
                    height: 12,
                    borderRadius: 6,
                    bgcolor: "grey.300",
                    position: "relative",
                    overflow: "hidden",
                }}>
                              <material_1.Box sx={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                    width: `${priority.percentComplete}%`,
                    bgcolor: priority.priority <= 2
                        ? "error.main"
                        : priority.priority === 3
                            ? "warning.main"
                            : "success.main",
                    transition: "width 0.5s ease-in-out",
                }}/>
                            </material_1.Box>
                          </material_1.Box>
                          <material_1.Typography variant="body2" sx={{ minWidth: 45, textAlign: "right" }}>
                            {priority.percentComplete}%
                          </material_1.Typography>
                        </material_1.Box>
                        <material_1.Box sx={{
                    display: "flex",
                    justifyContent: "space-between",
                }}>
                          <material_1.Typography variant="caption" color="text.secondary">
                            Total Tasks: {priority.count}
                          </material_1.Typography>
                          <material_1.Typography variant="caption" color="text.secondary">
                            Completed: {priority.completed}/{priority.count}
                          </material_1.Typography>
                        </material_1.Box>
                      </material_1.Box>))) : (<material_1.Typography color="text.secondary">
                    No priority data available
                  </material_1.Typography>)}
              </material_1.Box>)}
          </material_1.Box>
        </material_1.Paper>

        {statistics && (<material_1.Box sx={{ textAlign: "right", mt: 2 }}>
            <material_1.Typography variant="caption" color="text.secondary">
              Last updated: {statistics.lastUpdated.toLocaleString()}
            </material_1.Typography>
          </material_1.Box>)}
      </material_1.Box>
    </material_1.Container>);
};
exports.default = ProgressDashboard;
//# sourceMappingURL=ProgressDashboard.js.map