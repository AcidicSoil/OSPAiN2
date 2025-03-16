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
const RateLimitContext_1 = require("../context/RateLimitContext");
const react_router_dom_1 = require("react-router-dom");
const material_1 = require("@mui/material");
const react_toastify_1 = require("react-toastify");
const icons_material_1 = require("@mui/icons-material");
// Demo code samples for copy-paste
const API_EXAMPLES = {
    recordToolCall: `
// Record a tool call manually
import { useRateLimit } from '../context/RateLimitContext';

const { recordToolCall } = useRateLimit();

// Example usage
recordToolCall('custom_tool', 'success', { param1: 'value1' });
  `,
    simulateToolCalls: `
// Simulate multiple tool calls (for testing)
import { useRateLimit } from '../context/RateLimitContext';

const { simulateToolCalls } = useRateLimit();

// Simulate 5 random tool calls
simulateToolCalls(5);
  `,
    executeBypass: `
// Manually trigger a bypass
import { useRateLimit } from '../context/RateLimitContext';

const { executeBypass } = useRateLimit();

// Execute bypass with current method
executeBypass();
  `,
    statusListener: `
// Listen for rate limit status changes
import { useRateLimit } from '../context/RateLimitContext';

const { status } = useRateLimit();

// Use in component
React.useEffect(() => {
  if (status.isApproachingLimit) {
    console.log('Approaching tool call limit!');
  }
}, [status]);
  `,
};
/**
 * RateLimitManager Component
 *
 * Provides an interface for managing and monitoring tool call rate limits.
 * Also serves as an external rate limit handler for tool call interception.
 */
const RateLimitManager = () => {
    const { status, history, settings, updateSettings, executeBypass, resetSettings, simulateToolCalls, forceReset, isInterceptorActive, activateToolCallInterceptor, deactivateToolCallInterceptor, latestToolCall, } = (0, RateLimitContext_1.useRateLimit)();
    // Local state for settings
    const [localSettings, setLocalSettings] = (0, react_1.useState)({
        ...settings,
    });
    const [codeExample, setCodeExample] = (0, react_1.useState)(API_EXAMPLES.recordToolCall);
    const [isAutoActivated, setIsAutoActivated] = (0, react_1.useState)(false);
    const [thresholdValue, setThresholdValue] = (0, react_1.useState)(null);
    const intervalRef = (0, react_1.useRef)(null);
    const location = (0, react_router_dom_1.useLocation)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    // Sync local settings when the settings change
    (0, react_1.useEffect)(() => {
        setLocalSettings({ ...settings });
    }, [settings]);
    // Check for auto-activation parameter in URL
    (0, react_1.useEffect)(() => {
        const queryParams = new URLSearchParams(location.search);
        const autoActivate = queryParams.get("autoActivate");
        const threshold = queryParams.get("threshold");
        if (autoActivate === "true") {
            setIsAutoActivated(true);
            console.info("🔄 Rate Limit Manager auto-activated for external monitoring");
            if (threshold) {
                const thresholdNum = parseInt(threshold, 10);
                if (!isNaN(thresholdNum)) {
                    setThresholdValue(thresholdNum);
                    console.info(`Current tool call threshold: ${thresholdNum}`);
                }
            }
            // Start automatic monitoring if auto-activated
            startAutomaticMonitoring();
        }
        return () => {
            // Clean up interval on unmount
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [location.search]);
    /**
     * Start automatic monitoring for the parent window
     */
    const startAutomaticMonitoring = () => {
        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        // Set up automatic monitoring
        intervalRef.current = setInterval(() => {
            // Check if we need to take action based on current status
            if (status.percentage >= 95) {
                // Critical level - force reset
                forceReset();
                // Notify parent window
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({ type: "FORCE_RESET" }, "*");
                }
                react_toastify_1.toast.success("🔄 Automatic reset triggered - critical threshold reached");
            }
            else if (status.percentage >= 85) {
                // Warning level - execute bypass
                executeBypass();
                // Notify parent window
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({ type: "EXECUTE_BYPASS" }, "*");
                }
                react_toastify_1.toast.warning("⚠️ Automatic bypass executed - warning threshold reached");
            }
        }, 5000); // Check every 5 seconds
    };
    /**
     * Handle simulating a batch of tool calls for testing
     */
    const handleSimulateToolCalls = () => {
        simulateToolCalls(5); // Simulate 5 tool calls
        react_toastify_1.toast.info("🧪 Simulated 5 tool calls");
    };
    // Handle changes to settings
    const handleSettingChange = (field, value) => {
        setLocalSettings((prev) => ({
            ...prev,
            [field]: value,
        }));
    };
    // Save settings
    const handleSaveSettings = () => {
        updateSettings(localSettings);
        react_toastify_1.toast.success("Settings saved successfully");
    };
    // Handle manual bypass
    const handleBypass = () => {
        executeBypass();
        react_toastify_1.toast.info(`Executing bypass using ${settings.bypassMethod} method`);
    };
    // Handle activating the tool call interceptor
    const handleActivateInterceptor = () => {
        if (activateToolCallInterceptor) {
            activateToolCallInterceptor();
            react_toastify_1.toast.info("Tool call interceptor activated");
        }
        else {
            react_toastify_1.toast.error("Tool call interceptor activation not available");
        }
    };
    // Handle deactivating the tool call interceptor
    const handleDeactivateInterceptor = () => {
        if (deactivateToolCallInterceptor) {
            deactivateToolCallInterceptor();
            react_toastify_1.toast.info("Tool call interceptor deactivated");
        }
        else {
            react_toastify_1.toast.error("Tool call interceptor deactivation not available");
        }
    };
    // Handle adding excluded tool
    const [newExcludedTool, setNewExcludedTool] = (0, react_1.useState)("");
    const handleAddExcludedTool = () => {
        if (newExcludedTool &&
            !localSettings.excludedTools.includes(newExcludedTool)) {
            handleSettingChange("excludedTools", [
                ...localSettings.excludedTools,
                newExcludedTool,
            ]);
            setNewExcludedTool("");
        }
    };
    // Handle removing excluded tool
    const handleRemoveExcludedTool = (tool) => {
        handleSettingChange("excludedTools", localSettings.excludedTools.filter((t) => t !== tool));
    };
    // Get status color based on percentage
    const getStatusColor = (percentage) => {
        if (percentage >= 90)
            return "error";
        if (percentage >= 75)
            return "warning";
        return "success";
    };
    // Get bypass status label
    const getBypassStatusLabel = () => {
        switch (status.bypassStatus) {
            case "active":
                return (<material_1.Chip color="success" label={`Active (${status.currentMethod})`}/>);
            case "pending":
                return <material_1.Chip color="warning" label="Pending"/>;
            case "inactive":
                return <material_1.Chip color="default" label="Inactive"/>;
            default:
                return <material_1.Chip color="default" label="Unknown"/>;
        }
    };
    // Real-time monitoring toggle
    const handleToggleRealTimeMonitoring = () => {
        const newValue = !localSettings.realTimeMonitoring;
        handleSettingChange("realTimeMonitoring", newValue);
        react_toastify_1.toast.info(`Real-time monitoring ${newValue ? "enabled" : "disabled"}`);
    };
    return (<material_1.Container maxWidth="lg" className="py-8">
      <material_1.Typography variant="h4" component="h1" gutterBottom>
        Tool Call Rate Limit Manager
      </material_1.Typography>
      <material_1.Typography variant="subtitle1" gutterBottom>
        Configure rate limit bypass settings and monitor tool call usage
      </material_1.Typography>

      {latestToolCall && (<material_1.Paper sx={{ mb: 3, p: 2, bgcolor: "info.light" }}>
          <material_1.Typography variant="h6" color="text.secondary">
            <icons_material_1.Speed /> Latest Tool Call:{" "}
            <strong>{latestToolCall.tool}</strong>
          </material_1.Typography>
          <material_1.Typography variant="body2">
            Status:{" "}
            <material_1.Chip size="small" label={latestToolCall.status} color={latestToolCall.status === "success"
                ? "success"
                : latestToolCall.status === "warning"
                    ? "warning"
                    : "error"}/>
          </material_1.Typography>
          <material_1.Typography variant="body2">
            Time: {new Date(latestToolCall.timestamp).toLocaleTimeString()}
          </material_1.Typography>
          {latestToolCall.parameters && (<material_1.Tooltip title={JSON.stringify(latestToolCall.parameters, null, 2)}>
              <material_1.Button size="small" variant="text" sx={{ mt: 1 }}>
                View Parameters
              </material_1.Button>
            </material_1.Tooltip>)}
        </material_1.Paper>)}

      {isAutoActivated && (<material_1.Paper sx={{ mb: 3, p: 2, bgcolor: "warning.light" }}>
          <material_1.Typography variant="h6" color="text.secondary">
            <icons_material_1.Warning /> External Monitoring Mode Active
          </material_1.Typography>
          <material_1.Typography variant="body2">
            This instance is monitoring tool calls and will automatically take
            action when thresholds are reached.
          </material_1.Typography>
          <material_1.Typography variant="body2">
            Current threshold:{" "}
            {thresholdValue !== null ? thresholdValue : "Not specified"}
          </material_1.Typography>
          <material_1.Button variant="outlined" color="primary" startIcon={<icons_material_1.Refresh />} onClick={() => navigate("/rate-limit-manager")} sx={{ mt: 1 }}>
            Exit Monitoring Mode
          </material_1.Button>
        </material_1.Paper>)}

      <material_1.Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <material_1.Button variant="contained" color="primary" startIcon={<icons_material_1.PlayArrow />} onClick={handleBypass}>
          Manual Bypass
        </material_1.Button>
        <material_1.Button variant="contained" color="secondary" startIcon={<icons_material_1.Layers />} onClick={handleSimulateToolCalls}>
          Simulate 5 Tool Calls
        </material_1.Button>
        <material_1.Button variant="outlined" startIcon={<icons_material_1.Refresh />} onClick={forceReset}>
          Force Reset
        </material_1.Button>
        <material_1.Button variant="contained" color="success" startIcon={<icons_material_1.Autorenew />} onClick={handleActivateInterceptor} disabled={isInterceptorActive}>
          Activate Interceptor
        </material_1.Button>
        <material_1.Button variant="outlined" color="error" startIcon={<icons_material_1.Warning />} onClick={handleDeactivateInterceptor} disabled={!isInterceptorActive}>
          Deactivate Interceptor
        </material_1.Button>
        <material_1.Button variant={localSettings.realTimeMonitoring ? "contained" : "outlined"} color="info" startIcon={<icons_material_1.Speed />} onClick={handleToggleRealTimeMonitoring}>
          {localSettings.realTimeMonitoring ? "Real-Time On" : "Real-Time Off"}
        </material_1.Button>
      </material_1.Stack>

      <material_1.Grid container spacing={4}>
        {/* Current Status */}
        <material_1.Grid item xs={12} md={4}>
          <material_1.Paper sx={{ p: 3, height: "100%" }}>
            <material_1.Typography variant="h6" gutterBottom>
              Current Status
            </material_1.Typography>

            <material_1.Box sx={{ mb: 3 }}>
              <material_1.Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <material_1.Typography>Tool Calls</material_1.Typography>
                <material_1.Typography>
                  <strong>{status.current}</strong> / {status.limit}
                </material_1.Typography>
              </material_1.Stack>
              <material_1.LinearProgress variant="determinate" value={status.percentage} color={getStatusColor(status.percentage)} sx={{ height: 10, borderRadius: 5 }}/>
            </material_1.Box>

            <material_1.Stack spacing={2}>
              <material_1.Box>
                <material_1.Typography variant="body2" color="text.secondary">
                  Usage Percentage
                </material_1.Typography>
                <material_1.Typography variant="h5">{status.percentage}%</material_1.Typography>
              </material_1.Box>

              <material_1.Box>
                <material_1.Typography variant="body2" color="text.secondary">
                  Next Reset
                </material_1.Typography>
                <material_1.Typography variant="h5">{status.nextReset}</material_1.Typography>
              </material_1.Box>

              <material_1.Box>
                <material_1.Typography variant="body2" color="text.secondary">
                  Approaching Limit
                </material_1.Typography>
                <material_1.Typography>
                  {status.isApproachingLimit ? (<material_1.Chip color="warning" label="Yes"/>) : (<material_1.Chip color="default" label="No"/>)}
                </material_1.Typography>
              </material_1.Box>

              <material_1.Box>
                <material_1.Typography variant="body2" color="text.secondary">
                  Bypass Status
                </material_1.Typography>
                <material_1.Typography>{getBypassStatusLabel()}</material_1.Typography>
              </material_1.Box>

              <material_1.Box>
                <material_1.Typography variant="body2" color="text.secondary">
                  Interceptor Active
                </material_1.Typography>
                <material_1.Typography>
                  {isInterceptorActive ? (<material_1.Chip color="success" label="Active"/>) : (<material_1.Chip color="default" label="Inactive"/>)}
                </material_1.Typography>
              </material_1.Box>

              {status.predictedTimeToLimit && (<material_1.Box>
                  <material_1.Typography variant="body2" color="text.secondary">
                    Estimated Time to Limit
                  </material_1.Typography>
                  <material_1.Typography variant="h5">
                    {status.predictedTimeToLimit}
                  </material_1.Typography>
                </material_1.Box>)}
            </material_1.Stack>
          </material_1.Paper>
        </material_1.Grid>

        {/* Settings */}
        <material_1.Grid item xs={12} md={8}>
          <material_1.Paper sx={{ p: 3 }}>
            <material_1.Box sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
        }}>
              <material_1.Typography variant="h6">Rate Limit Settings</material_1.Typography>
              <material_1.Stack direction="row" spacing={1}>
                <material_1.Button variant="outlined" startIcon={<icons_material_1.SettingsBackupRestore />} onClick={() => {
            resetSettings();
            react_toastify_1.toast.info("Settings reset to defaults");
        }} size="small">
                  Reset to Defaults
                </material_1.Button>
                <material_1.Button variant="contained" startIcon={<icons_material_1.Save />} onClick={handleSaveSettings} size="small">
                  Save Changes
                </material_1.Button>
              </material_1.Stack>
            </material_1.Box>

            <material_1.Grid container spacing={3}>
              {/* Tool Call Limit */}
              <material_1.Grid item xs={12} sm={6}>
                <material_1.Typography gutterBottom>Tool Call Limit</material_1.Typography>
                <material_1.Slider value={localSettings.toolCallLimit} onChange={(_, value) => handleSettingChange("toolCallLimit", value)} min={5} max={100} step={1} marks={[
            { value: 5, label: "5" },
            { value: 25, label: "25" },
            { value: 50, label: "50" },
            { value: 100, label: "100" },
        ]} valueLabelDisplay="auto"/>
              </material_1.Grid>

              {/* Reset Interval */}
              <material_1.Grid item xs={12} sm={6}>
                <material_1.Typography gutterBottom>Reset Interval (minutes)</material_1.Typography>
                <material_1.Slider value={localSettings.resetIntervalMinutes} onChange={(_, value) => handleSettingChange("resetIntervalMinutes", value)} min={30} max={360} step={30} marks={[
            { value: 60, label: "1h" },
            { value: 180, label: "3h" },
            { value: 360, label: "6h" },
        ]} valueLabelDisplay="auto"/>
              </material_1.Grid>

              {/* Notification Threshold */}
              <material_1.Grid item xs={12} sm={6}>
                <material_1.Typography gutterBottom>Notification Threshold (%)</material_1.Typography>
                <material_1.Slider value={localSettings.notificationThreshold} onChange={(_, value) => handleSettingChange("notificationThreshold", value)} min={50} max={95} step={5} marks={[
            { value: 50, label: "50%" },
            { value: 75, label: "75%" },
            { value: 95, label: "95%" },
        ]} valueLabelDisplay="auto"/>
              </material_1.Grid>

              {/* Monitor Interval */}
              <material_1.Grid item xs={12} sm={6}>
                <material_1.Typography gutterBottom>Monitor Interval (seconds)</material_1.Typography>
                <material_1.Slider value={localSettings.monitorInterval} onChange={(_, value) => handleSettingChange("monitorInterval", value)} min={5} max={60} step={5} marks={[
            { value: 5, label: "5s" },
            { value: 30, label: "30s" },
            { value: 60, label: "60s" },
        ]} valueLabelDisplay="auto"/>
              </material_1.Grid>

              {/* Bypass Method */}
              <material_1.Grid item xs={12} sm={6}>
                <material_1.FormControl fullWidth>
                  <material_1.InputLabel>Bypass Method</material_1.InputLabel>
                  <material_1.Select value={localSettings.bypassMethod} label="Bypass Method" onChange={(e) => handleSettingChange("bypassMethod", e.target.value)}>
                    <material_1.MenuItem value="session-rotation">
                      Session Rotation
                    </material_1.MenuItem>
                    <material_1.MenuItem value="token-management">
                      Token Management
                    </material_1.MenuItem>
                    <material_1.MenuItem value="cache-optimization">
                      Cache Optimization
                    </material_1.MenuItem>
                    <material_1.MenuItem value="request-batching">
                      Request Batching
                    </material_1.MenuItem>
                    <material_1.MenuItem value="custom-rules">Custom Rules</material_1.MenuItem>
                  </material_1.Select>
                </material_1.FormControl>
              </material_1.Grid>

              {/* Toggle Switches */}
              <material_1.Grid item xs={12} sm={6}>
                <material_1.Stack spacing={2}>
                  <material_1.FormControlLabel control={<material_1.Switch checked={localSettings.autoBypass} onChange={(e) => handleSettingChange("autoBypass", e.target.checked)}/>} label="Auto Bypass"/>
                  <material_1.FormControlLabel control={<material_1.Switch checked={localSettings.enableNotifications} onChange={(e) => handleSettingChange("enableNotifications", e.target.checked)}/>} label="Enable Notifications"/>
                  <material_1.FormControlLabel control={<material_1.Switch checked={localSettings.realTimeMonitoring} onChange={(e) => handleSettingChange("realTimeMonitoring", e.target.checked)}/>} label="Real-Time Monitoring"/>
                </material_1.Stack>
              </material_1.Grid>

              {/* Excluded Tools */}
              <material_1.Grid item xs={12}>
                <material_1.Typography gutterBottom>Excluded Tools</material_1.Typography>
                <material_1.Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  {localSettings.excludedTools.map((tool) => (<material_1.Chip key={tool} label={tool} onDelete={() => handleRemoveExcludedTool(tool)}/>))}
                </material_1.Box>
                <material_1.Stack direction="row" spacing={1}>
                  <material_1.TextField size="small" placeholder="Tool name" value={newExcludedTool} onChange={(e) => setNewExcludedTool(e.target.value)} onKeyPress={(e) => {
            if (e.key === "Enter") {
                handleAddExcludedTool();
            }
        }}/>
                  <material_1.Button variant="outlined" onClick={handleAddExcludedTool}>
                    Add
                  </material_1.Button>
                </material_1.Stack>
              </material_1.Grid>

              {/* Custom Bypass Rules */}
              {localSettings.bypassMethod === "custom-rules" && (<material_1.Grid item xs={12}>
                  <material_1.Typography gutterBottom>Custom Bypass Rules</material_1.Typography>
                  <material_1.TextField multiline rows={4} fullWidth placeholder="Enter custom bypass rules (JavaScript)" value={localSettings.customBypassRules || ""} onChange={(e) => handleSettingChange("customBypassRules", e.target.value)}/>
                </material_1.Grid>)}
            </material_1.Grid>
          </material_1.Paper>
        </material_1.Grid>

        {/* Tool Call History */}
        <material_1.Grid item xs={12}>
          <material_1.Paper sx={{ p: 3 }}>
            <material_1.Typography variant="h6" gutterBottom>
              Recent Tool Calls
              {localSettings.realTimeMonitoring && (<material_1.Chip size="small" color="success" label="Real-Time" sx={{ ml: 2 }}/>)}
            </material_1.Typography>

            <material_1.Box sx={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "8px" }}>Tool</th>
                    <th style={{ textAlign: "left", padding: "8px" }}>
                      Status
                    </th>
                    <th style={{ textAlign: "left", padding: "8px" }}>
                      Parameters
                    </th>
                    <th style={{ textAlign: "left", padding: "8px" }}>
                      Timestamp
                    </th>
                    <th style={{ textAlign: "left", padding: "8px" }}>
                      Bypass Applied
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 10).map((call) => (<tr key={call.id}>
                      <td style={{ padding: "8px" }}>{call.tool}</td>
                      <td style={{ padding: "8px" }}>
                        <material_1.Chip size="small" label={call.status} color={call.status === "success"
                ? "success"
                : call.status === "warning"
                    ? "warning"
                    : "error"}/>
                      </td>
                      <td style={{ padding: "8px" }}>
                        {call.parameters ? (<material_1.Tooltip title={JSON.stringify(call.parameters, null, 2)}>
                            <material_1.Button size="small" variant="text">
                              View
                            </material_1.Button>
                          </material_1.Tooltip>) : (<span>—</span>)}
                      </td>
                      <td style={{ padding: "8px" }}>
                        {new Date(call.timestamp).toLocaleTimeString()}
                      </td>
                      <td style={{ padding: "8px" }}>
                        {call.bypassApplied ? (<material_1.Chip size="small" label={call.bypassMethod || "Yes"} color="primary"/>) : (<span>No</span>)}
                      </td>
                    </tr>))}
                  {history.length === 0 && (<tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>
                        No tool calls recorded yet
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </material_1.Box>
          </material_1.Paper>
        </material_1.Grid>

        {/* API Usage Examples */}
        <material_1.Grid item xs={12}>
          <material_1.Paper sx={{ p: 3 }}>
            <material_1.Typography variant="h6" gutterBottom>
              API Usage Examples
            </material_1.Typography>

            <material_1.Box sx={{ mb: 2 }}>
              <material_1.Stack direction="row" spacing={1}>
                <material_1.Button size="small" variant={codeExample === API_EXAMPLES.recordToolCall
            ? "contained"
            : "outlined"} onClick={() => setCodeExample(API_EXAMPLES.recordToolCall)}>
                  Record Tool Call
                </material_1.Button>
                <material_1.Button size="small" variant={codeExample === API_EXAMPLES.simulateToolCalls
            ? "contained"
            : "outlined"} onClick={() => setCodeExample(API_EXAMPLES.simulateToolCalls)}>
                  Simulate Tool Calls
                </material_1.Button>
                <material_1.Button size="small" variant={codeExample === API_EXAMPLES.executeBypass
            ? "contained"
            : "outlined"} onClick={() => setCodeExample(API_EXAMPLES.executeBypass)}>
                  Execute Bypass
                </material_1.Button>
                <material_1.Button size="small" variant={codeExample === API_EXAMPLES.statusListener
            ? "contained"
            : "outlined"} onClick={() => setCodeExample(API_EXAMPLES.statusListener)}>
                  Status Listener
                </material_1.Button>
              </material_1.Stack>
            </material_1.Box>

            <material_1.Paper elevation={0} sx={{
            p: 2,
            bgcolor: "grey.100",
            fontSize: "0.875rem",
            fontFamily: "monospace",
            overflow: "auto",
            whiteSpace: "pre",
        }}>
              {codeExample}
            </material_1.Paper>
          </material_1.Paper>
        </material_1.Grid>

        {/* Real-Time Monitoring Section */}
        <material_1.Grid item xs={12}>
          <material_1.Paper sx={{ p: 3, mt: 4 }}>
            <material_1.Typography variant="h6" gutterBottom>
              Real-Time Monitoring
            </material_1.Typography>

            <material_1.Typography variant="body1" paragraph>
              Real-time monitoring allows you to track tool calls as they
              happen, providing immediate feedback and enabling proactive rate
              limit management.
            </material_1.Typography>

            <material_1.Box sx={{ mt: 2 }}>
              <material_1.Typography variant="subtitle1" gutterBottom>
                Features:
              </material_1.Typography>
              <ul style={{ paddingLeft: "20px" }}>
                <li>Instant tool call detection and logging</li>
                <li>Immediate status updates</li>
                <li>Proactive interceptor activation</li>
                <li>Reduced monitoring interval (1 second when enabled)</li>
                <li>Automatic tool call tracking without manual recording</li>
              </ul>
            </material_1.Box>

            <material_1.Box sx={{
            mt: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        }}>
              <material_1.Typography>
                Status:{" "}
                <strong>
                  {localSettings.realTimeMonitoring ? "Enabled" : "Disabled"}
                </strong>
              </material_1.Typography>
              <material_1.Button variant={localSettings.realTimeMonitoring ? "contained" : "outlined"} color="primary" onClick={handleToggleRealTimeMonitoring}>
                {localSettings.realTimeMonitoring ? "Disable" : "Enable"}
              </material_1.Button>
            </material_1.Box>
          </material_1.Paper>
        </material_1.Grid>
      </material_1.Grid>
    </material_1.Container>);
};
exports.default = RateLimitManager;
//# sourceMappingURL=RateLimitManager.js.map