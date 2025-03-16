import React, { useState, useEffect, useRef } from "react";
import { useRateLimit } from "../context/RateLimitContext";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Switch,
  TextField,
  Typography,
  Chip,
  LinearProgress,
  Tooltip,
  IconButton,
  Divider,
} from "@mui/material";
import { toast } from "react-toastify";
import {
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Layers as LayersIcon,
  Speed as SpeedIcon,
  SettingsBackupRestore as ResetIcon,
  Code as CodeIcon,
  Autorenew as AutorenewIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { RateLimitSettings } from "../services/RateLimitService";

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
const RateLimitManager: React.FC = () => {
  const {
    status,
    history,
    settings,
    updateSettings,
    executeBypass,
    resetSettings,
    simulateToolCalls,
    forceReset,
    isInterceptorActive,
    activateToolCallInterceptor,
    deactivateToolCallInterceptor,
    latestToolCall,
  } = useRateLimit();

  // Local state for settings
  const [localSettings, setLocalSettings] = useState<RateLimitSettings>({
    ...settings,
  });
  const [codeExample, setCodeExample] = useState<string>(
    API_EXAMPLES.recordToolCall
  );
  const [isAutoActivated, setIsAutoActivated] = useState(false);
  const [thresholdValue, setThresholdValue] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Sync local settings when the settings change
  useEffect(() => {
    setLocalSettings({ ...settings });
  }, [settings]);

  // Check for auto-activation parameter in URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const autoActivate = queryParams.get("autoActivate");
    const threshold = queryParams.get("threshold");

    if (autoActivate === "true") {
      setIsAutoActivated(true);
      console.info(
        "🔄 Rate Limit Manager auto-activated for external monitoring"
      );

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

        toast.success(
          "🔄 Automatic reset triggered - critical threshold reached"
        );
      } else if (status.percentage >= 85) {
        // Warning level - execute bypass
        executeBypass();

        // Notify parent window
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: "EXECUTE_BYPASS" }, "*");
        }

        toast.warning(
          "⚠️ Automatic bypass executed - warning threshold reached"
        );
      }
    }, 5000); // Check every 5 seconds
  };

  /**
   * Handle simulating a batch of tool calls for testing
   */
  const handleSimulateToolCalls = () => {
    simulateToolCalls(5); // Simulate 5 tool calls
    toast.info("🧪 Simulated 5 tool calls");
  };

  // Handle changes to settings
  const handleSettingChange = (field: keyof RateLimitSettings, value: any) => {
    setLocalSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save settings
  const handleSaveSettings = () => {
    updateSettings(localSettings);
    toast.success("Settings saved successfully");
  };

  // Handle manual bypass
  const handleBypass = () => {
    executeBypass();
    toast.info(`Executing bypass using ${settings.bypassMethod} method`);
  };

  // Handle activating the tool call interceptor
  const handleActivateInterceptor = () => {
    if (activateToolCallInterceptor) {
      activateToolCallInterceptor();
      toast.info("Tool call interceptor activated");
    } else {
      toast.error("Tool call interceptor activation not available");
    }
  };

  // Handle deactivating the tool call interceptor
  const handleDeactivateInterceptor = () => {
    if (deactivateToolCallInterceptor) {
      deactivateToolCallInterceptor();
      toast.info("Tool call interceptor deactivated");
    } else {
      toast.error("Tool call interceptor deactivation not available");
    }
  };

  // Handle adding excluded tool
  const [newExcludedTool, setNewExcludedTool] = useState("");
  const handleAddExcludedTool = () => {
    if (
      newExcludedTool &&
      !localSettings.excludedTools.includes(newExcludedTool)
    ) {
      handleSettingChange("excludedTools", [
        ...localSettings.excludedTools,
        newExcludedTool,
      ]);
      setNewExcludedTool("");
    }
  };

  // Handle removing excluded tool
  const handleRemoveExcludedTool = (tool: string) => {
    handleSettingChange(
      "excludedTools",
      localSettings.excludedTools.filter((t) => t !== tool)
    );
  };

  // Get status color based on percentage
  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return "error";
    if (percentage >= 75) return "warning";
    return "success";
  };

  // Get bypass status label
  const getBypassStatusLabel = () => {
    switch (status.bypassStatus) {
      case "active":
        return (
          <Chip color="success" label={`Active (${status.currentMethod})`} />
        );
      case "pending":
        return <Chip color="warning" label="Pending" />;
      case "inactive":
        return <Chip color="default" label="Inactive" />;
      default:
        return <Chip color="default" label="Unknown" />;
    }
  };

  // Real-time monitoring toggle
  const handleToggleRealTimeMonitoring = () => {
    const newValue = !localSettings.realTimeMonitoring;
    handleSettingChange("realTimeMonitoring", newValue);
    toast.info(`Real-time monitoring ${newValue ? "enabled" : "disabled"}`);
  };

  return (
    <Container maxWidth="lg" className="py-8">
      <Typography variant="h4" component="h1" gutterBottom>
        Tool Call Rate Limit Manager
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Configure rate limit bypass settings and monitor tool call usage
      </Typography>

      {latestToolCall && (
        <Paper sx={{ mb: 3, p: 2, bgcolor: "info.light" }}>
          <Typography variant="h6" color="text.secondary">
            <SpeedIcon /> Latest Tool Call:{" "}
            <strong>{latestToolCall.tool}</strong>
          </Typography>
          <Typography variant="body2">
            Status:{" "}
            <Chip
              size="small"
              label={latestToolCall.status}
              color={
                latestToolCall.status === "success"
                  ? "success"
                  : latestToolCall.status === "warning"
                  ? "warning"
                  : "error"
              }
            />
          </Typography>
          <Typography variant="body2">
            Time: {new Date(latestToolCall.timestamp).toLocaleTimeString()}
          </Typography>
          {latestToolCall.parameters && (
            <Tooltip title={JSON.stringify(latestToolCall.parameters, null, 2)}>
              <Button size="small" variant="text" sx={{ mt: 1 }}>
                View Parameters
              </Button>
            </Tooltip>
          )}
        </Paper>
      )}

      {isAutoActivated && (
        <Paper sx={{ mb: 3, p: 2, bgcolor: "warning.light" }}>
          <Typography variant="h6" color="text.secondary">
            <WarningIcon /> External Monitoring Mode Active
          </Typography>
          <Typography variant="body2">
            This instance is monitoring tool calls and will automatically take
            action when thresholds are reached.
          </Typography>
          <Typography variant="body2">
            Current threshold:{" "}
            {thresholdValue !== null ? thresholdValue : "Not specified"}
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={() => navigate("/rate-limit-manager")}
            sx={{ mt: 1 }}
          >
            Exit Monitoring Mode
          </Button>
        </Paper>
      )}

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PlayIcon />}
          onClick={handleBypass}
        >
          Manual Bypass
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<LayersIcon />}
          onClick={handleSimulateToolCalls}
        >
          Simulate 5 Tool Calls
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={forceReset}
        >
          Force Reset
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={<AutorenewIcon />}
          onClick={handleActivateInterceptor}
          disabled={isInterceptorActive}
        >
          Activate Interceptor
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<WarningIcon />}
          onClick={handleDeactivateInterceptor}
          disabled={!isInterceptorActive}
        >
          Deactivate Interceptor
        </Button>
        <Button
          variant={localSettings.realTimeMonitoring ? "contained" : "outlined"}
          color="info"
          startIcon={<SpeedIcon />}
          onClick={handleToggleRealTimeMonitoring}
        >
          {localSettings.realTimeMonitoring ? "Real-Time On" : "Real-Time Off"}
        </Button>
      </Stack>

      <Grid container spacing={4}>
        {/* Current Status */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Current Status
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography>Tool Calls</Typography>
                <Typography>
                  <strong>{status.current}</strong> / {status.limit}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={status.percentage}
                color={getStatusColor(status.percentage)}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>

            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Usage Percentage
                </Typography>
                <Typography variant="h5">{status.percentage}%</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Next Reset
                </Typography>
                <Typography variant="h5">{status.nextReset}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Approaching Limit
                </Typography>
                <Typography>
                  {status.isApproachingLimit ? (
                    <Chip color="warning" label="Yes" />
                  ) : (
                    <Chip color="default" label="No" />
                  )}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Bypass Status
                </Typography>
                <Typography>{getBypassStatusLabel()}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Interceptor Active
                </Typography>
                <Typography>
                  {isInterceptorActive ? (
                    <Chip color="success" label="Active" />
                  ) : (
                    <Chip color="default" label="Inactive" />
                  )}
                </Typography>
              </Box>

              {status.predictedTimeToLimit && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Estimated Time to Limit
                  </Typography>
                  <Typography variant="h5">
                    {status.predictedTimeToLimit}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Settings */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6">Rate Limit Settings</Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<ResetIcon />}
                  onClick={() => {
                    resetSettings();
                    toast.info("Settings reset to defaults");
                  }}
                  size="small"
                >
                  Reset to Defaults
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSettings}
                  size="small"
                >
                  Save Changes
                </Button>
              </Stack>
            </Box>

            <Grid container spacing={3}>
              {/* Tool Call Limit */}
              <Grid item xs={12} sm={6}>
                <Typography gutterBottom>Tool Call Limit</Typography>
                <Slider
                  value={localSettings.toolCallLimit}
                  onChange={(_, value) =>
                    handleSettingChange("toolCallLimit", value)
                  }
                  min={5}
                  max={100}
                  step={1}
                  marks={[
                    { value: 5, label: "5" },
                    { value: 25, label: "25" },
                    { value: 50, label: "50" },
                    { value: 100, label: "100" },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Grid>

              {/* Reset Interval */}
              <Grid item xs={12} sm={6}>
                <Typography gutterBottom>Reset Interval (minutes)</Typography>
                <Slider
                  value={localSettings.resetIntervalMinutes}
                  onChange={(_, value) =>
                    handleSettingChange("resetIntervalMinutes", value)
                  }
                  min={30}
                  max={360}
                  step={30}
                  marks={[
                    { value: 60, label: "1h" },
                    { value: 180, label: "3h" },
                    { value: 360, label: "6h" },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Grid>

              {/* Notification Threshold */}
              <Grid item xs={12} sm={6}>
                <Typography gutterBottom>Notification Threshold (%)</Typography>
                <Slider
                  value={localSettings.notificationThreshold}
                  onChange={(_, value) =>
                    handleSettingChange("notificationThreshold", value)
                  }
                  min={50}
                  max={95}
                  step={5}
                  marks={[
                    { value: 50, label: "50%" },
                    { value: 75, label: "75%" },
                    { value: 95, label: "95%" },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Grid>

              {/* Monitor Interval */}
              <Grid item xs={12} sm={6}>
                <Typography gutterBottom>Monitor Interval (seconds)</Typography>
                <Slider
                  value={localSettings.monitorInterval}
                  onChange={(_, value) =>
                    handleSettingChange("monitorInterval", value)
                  }
                  min={5}
                  max={60}
                  step={5}
                  marks={[
                    { value: 5, label: "5s" },
                    { value: 30, label: "30s" },
                    { value: 60, label: "60s" },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Grid>

              {/* Bypass Method */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Bypass Method</InputLabel>
                  <Select
                    value={localSettings.bypassMethod}
                    label="Bypass Method"
                    onChange={(e) =>
                      handleSettingChange("bypassMethod", e.target.value)
                    }
                  >
                    <MenuItem value="session-rotation">
                      Session Rotation
                    </MenuItem>
                    <MenuItem value="token-management">
                      Token Management
                    </MenuItem>
                    <MenuItem value="cache-optimization">
                      Cache Optimization
                    </MenuItem>
                    <MenuItem value="request-batching">
                      Request Batching
                    </MenuItem>
                    <MenuItem value="custom-rules">Custom Rules</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Toggle Switches */}
              <Grid item xs={12} sm={6}>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={localSettings.autoBypass}
                        onChange={(e) =>
                          handleSettingChange("autoBypass", e.target.checked)
                        }
                      />
                    }
                    label="Auto Bypass"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={localSettings.enableNotifications}
                        onChange={(e) =>
                          handleSettingChange(
                            "enableNotifications",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Enable Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={localSettings.realTimeMonitoring}
                        onChange={(e) =>
                          handleSettingChange(
                            "realTimeMonitoring",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Real-Time Monitoring"
                  />
                </Stack>
              </Grid>

              {/* Excluded Tools */}
              <Grid item xs={12}>
                <Typography gutterBottom>Excluded Tools</Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  {localSettings.excludedTools.map((tool) => (
                    <Chip
                      key={tool}
                      label={tool}
                      onDelete={() => handleRemoveExcludedTool(tool)}
                    />
                  ))}
                </Box>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    placeholder="Tool name"
                    value={newExcludedTool}
                    onChange={(e) => setNewExcludedTool(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddExcludedTool();
                      }
                    }}
                  />
                  <Button variant="outlined" onClick={handleAddExcludedTool}>
                    Add
                  </Button>
                </Stack>
              </Grid>

              {/* Custom Bypass Rules */}
              {localSettings.bypassMethod === "custom-rules" && (
                <Grid item xs={12}>
                  <Typography gutterBottom>Custom Bypass Rules</Typography>
                  <TextField
                    multiline
                    rows={4}
                    fullWidth
                    placeholder="Enter custom bypass rules (JavaScript)"
                    value={localSettings.customBypassRules || ""}
                    onChange={(e) =>
                      handleSettingChange("customBypassRules", e.target.value)
                    }
                  />
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Tool Call History */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Tool Calls
              {localSettings.realTimeMonitoring && (
                <Chip
                  size="small"
                  color="success"
                  label="Real-Time"
                  sx={{ ml: 2 }}
                />
              )}
            </Typography>

            <Box sx={{ overflowX: "auto" }}>
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
                  {history.slice(0, 10).map((call) => (
                    <tr key={call.id}>
                      <td style={{ padding: "8px" }}>{call.tool}</td>
                      <td style={{ padding: "8px" }}>
                        <Chip
                          size="small"
                          label={call.status}
                          color={
                            call.status === "success"
                              ? "success"
                              : call.status === "warning"
                              ? "warning"
                              : "error"
                          }
                        />
                      </td>
                      <td style={{ padding: "8px" }}>
                        {call.parameters ? (
                          <Tooltip
                            title={JSON.stringify(call.parameters, null, 2)}
                          >
                            <Button size="small" variant="text">
                              View
                            </Button>
                          </Tooltip>
                        ) : (
                          <span>—</span>
                        )}
                      </td>
                      <td style={{ padding: "8px" }}>
                        {new Date(call.timestamp).toLocaleTimeString()}
                      </td>
                      <td style={{ padding: "8px" }}>
                        {call.bypassApplied ? (
                          <Chip
                            size="small"
                            label={call.bypassMethod || "Yes"}
                            color="primary"
                          />
                        ) : (
                          <span>No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        No tool calls recorded yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Box>
          </Paper>
        </Grid>

        {/* API Usage Examples */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              API Usage Examples
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant={
                    codeExample === API_EXAMPLES.recordToolCall
                      ? "contained"
                      : "outlined"
                  }
                  onClick={() => setCodeExample(API_EXAMPLES.recordToolCall)}
                >
                  Record Tool Call
                </Button>
                <Button
                  size="small"
                  variant={
                    codeExample === API_EXAMPLES.simulateToolCalls
                      ? "contained"
                      : "outlined"
                  }
                  onClick={() => setCodeExample(API_EXAMPLES.simulateToolCalls)}
                >
                  Simulate Tool Calls
                </Button>
                <Button
                  size="small"
                  variant={
                    codeExample === API_EXAMPLES.executeBypass
                      ? "contained"
                      : "outlined"
                  }
                  onClick={() => setCodeExample(API_EXAMPLES.executeBypass)}
                >
                  Execute Bypass
                </Button>
                <Button
                  size="small"
                  variant={
                    codeExample === API_EXAMPLES.statusListener
                      ? "contained"
                      : "outlined"
                  }
                  onClick={() => setCodeExample(API_EXAMPLES.statusListener)}
                >
                  Status Listener
                </Button>
              </Stack>
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: "grey.100",
                fontSize: "0.875rem",
                fontFamily: "monospace",
                overflow: "auto",
                whiteSpace: "pre",
              }}
            >
              {codeExample}
            </Paper>
          </Paper>
        </Grid>

        {/* Real-Time Monitoring Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Real-Time Monitoring
            </Typography>

            <Typography variant="body1" paragraph>
              Real-time monitoring allows you to track tool calls as they
              happen, providing immediate feedback and enabling proactive rate
              limit management.
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Features:
              </Typography>
              <ul style={{ paddingLeft: "20px" }}>
                <li>Instant tool call detection and logging</li>
                <li>Immediate status updates</li>
                <li>Proactive interceptor activation</li>
                <li>Reduced monitoring interval (1 second when enabled)</li>
                <li>Automatic tool call tracking without manual recording</li>
              </ul>
            </Box>

            <Box
              sx={{
                mt: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography>
                Status:{" "}
                <strong>
                  {localSettings.realTimeMonitoring ? "Enabled" : "Disabled"}
                </strong>
              </Typography>
              <Button
                variant={
                  localSettings.realTimeMonitoring ? "contained" : "outlined"
                }
                color="primary"
                onClick={handleToggleRealTimeMonitoring}
              >
                {localSettings.realTimeMonitoring ? "Disable" : "Enable"}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RateLimitManager;
