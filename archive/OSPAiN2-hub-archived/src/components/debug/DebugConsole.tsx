/**
 * DebugConsole
 *
 * A component for displaying real-time console logs captured by the DebugMcpService.
 * Provides filtering, searching, and visualization of log data.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Stack,
  Button,
  Menu,
  Tooltip,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Download as DownloadIcon,
  Clear as ClearIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  BugReport as BugReportIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import DebugMcpService from "../../services/DebugMcpService";
import { LogEntry, DebugSessionInfo } from "../../types/debug";

interface DebugConsoleProps {
  height?: string | number;
  width?: string | number;
  showControls?: boolean;
  autoStart?: boolean;
  maxLogs?: number;
  filter?: {
    level?: "debug" | "info" | "warn" | "error";
    source?: string;
    search?: string;
  };
}

export const DebugConsole: React.FC<DebugConsoleProps> = ({
  height = 400,
  width = "100%",
  showControls = true,
  autoStart = true,
  maxLogs = 100,
  filter: initialFilter,
}) => {
  const theme = useTheme();

  // State
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [sessions, setSessions] = useState<DebugSessionInfo[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [filter, setFilter] = useState({
    level: initialFilter?.level || "",
    source: initialFilter?.source || "",
    search: initialFilter?.search || "",
  });
  const [activeTab, setActiveTab] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Function declarations
  const refreshLogs = useCallback(async () => {
    if (activeSessionId) {
      const sessionLogs = await DebugMcpService.getLogs({
        sessionId: activeSessionId,
      });
      setLogs(
        sessionLogs
          .filter(
            (log: LogEntry) =>
              (!filter.level || log.level === filter.level) &&
              (!filter.source || log.source === filter.source) &&
              (!filter.search ||
                log.message.toLowerCase().includes(filter.search.toLowerCase()))
          )
          .slice(0, maxLogs)
      );
    } else {
      setLogs([]);
    }
  }, [activeSessionId, filter, maxLogs]);

  const refreshSessionsAndLogs = useCallback(async () => {
    const sessions = await DebugMcpService.getSessions();
    setSessions(sessions);
    if (sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0].id);
    }
    await refreshLogs();
  }, [activeSessionId, refreshLogs]);

  // Initialize on component mount
  useEffect(() => {
    if (autoStart) {
      DebugMcpService.initialize();
    }

    // Get initial sessions and logs
    refreshSessionsAndLogs();

    // Set up log listener
    const unsubscribe = DebugMcpService.onLog((log: LogEntry) => {
      setLogs((prevLogs) => {
        const newLogs = [log, ...prevLogs];
        return newLogs.slice(0, maxLogs);
      });
    });

    return () => {
      unsubscribe();
      if (isRunning) {
        DebugMcpService.shutdown();
      }
    };
  }, [autoStart, maxLogs, isRunning, refreshSessionsAndLogs]);

  // Apply filter effect
  useEffect(() => {
    refreshLogs();
  }, [filter, activeSessionId, refreshLogs]);

  // When running state changes
  useEffect(() => {
    if (isRunning && !DebugMcpService.getCurrentSession()) {
      DebugMcpService.initialize();
    } else if (!isRunning) {
      refreshSessionsAndLogs();
    }
  }, [isRunning, refreshSessionsAndLogs]);

  // Scroll to bottom on new logs if scrolled to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
      const isScrolledToBottom = scrollTop + clientHeight >= scrollHeight - 50;

      if (isScrolledToBottom) {
        logContainerRef.current.scrollTop = scrollHeight;
      }
    }
  }, [logs]);

  // Start a new debug session
  const startNewSession = () => {
    const newSession = DebugMcpService.startNewSession();
    setActiveSessionId(newSession.id);
    refreshSessionsAndLogs();
  };

  // Toggle running state
  const toggleRunning = () => {
    if (!isRunning) {
      DebugMcpService.initialize();
    } else {
      DebugMcpService.endCurrentSession();
    }
    setIsRunning(!isRunning);
  };

  // Clear logs
  const clearLogs = () => {
    if (
      window.confirm("Are you sure you want to clear all logs in this session?")
    ) {
      // Start a new empty session
      startNewSession();
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    setFilter((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Download logs as JSON
  const downloadLogs = () => {
    const selectedSession = sessions.find((s) => s.id === activeSessionId);
    if (!selectedSession) return;

    const data = JSON.stringify(selectedSession, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `debug-session-${new Date()
      .toISOString()
      .replace(/:/g, "-")}.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  // Get log entry style based on level
  const getLogStyle = (level: string) => {
    switch (level) {
      case "error":
        return { color: "#f44336", fontWeight: "bold" };
      case "warn":
        return { color: "#ff9800" };
      case "info":
        return { color: "#2196f3" };
      case "debug":
        return { color: "#9e9e9e" };
      default:
        return {};
    }
  };

  // Render log timestamp
  const renderTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const renderLogLevel = (level: LogEntry["level"]) => {
    switch (level) {
      case "debug":
        return <BugReportIcon sx={{ color: theme.palette.info.main }} />;
      case "info":
        return <InfoIcon sx={{ color: theme.palette.success.main }} />;
      case "warn":
        return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
      case "error":
        return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
    }
  };

  const renderLogEntry = (l: LogEntry) => (
    <Box
      key={l.id}
      sx={{
        display: "flex",
        alignItems: "center",
        p: 1,
        borderBottom: 1,
        borderColor: "divider",
        "&:hover": {
          bgcolor: "action.hover",
        },
      }}
    >
      {renderLogLevel(l.level)}
      <Box sx={{ ml: 1, flex: 1 }}>
        <Typography variant="caption" color="textSecondary">
          {renderTimestamp(l.timestamp)}
        </Typography>
        <Typography variant="body2">{l.message}</Typography>
      </Box>
    </Box>
  );

  return (
    <Paper
      elevation={3}
      sx={{
        height: isFullscreen ? "100vh" : height,
        width: isFullscreen ? "100vw" : width,
        display: "flex",
        flexDirection: "column",
        position: isFullscreen ? "fixed" : "relative",
        top: isFullscreen ? 0 : "auto",
        left: isFullscreen ? 0 : "auto",
        zIndex: isFullscreen ? 9999 : "auto",
        m: 0,
        p: 0,
        ...(isFullscreen && {
          borderRadius: 0,
        }),
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 1,
          borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          Debug Console
          {isRunning && (
            <Box component="span" sx={{ display: "inline-block", ml: 1 }}>
              <CircularProgress size={16} />
            </Box>
          )}
        </Typography>
        <Box>
          {showControls && (
            <>
              <Tooltip title={isRunning ? "Stop Logging" : "Start Logging"}>
                <IconButton
                  size="small"
                  onClick={toggleRunning}
                  color={isRunning ? "error" : "success"}
                >
                  {isRunning ? <StopIcon /> : <StartIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={refreshSessionsAndLogs}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clear Logs">
                <IconButton size="small" onClick={clearLogs}>
                  <ClearIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download Logs">
                <IconButton size="small" onClick={downloadLogs}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Settings">
                <IconButton size="small" onClick={handleMenuOpen}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                <IconButton size="small" onClick={toggleFullscreen}>
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Tooltip>
              {isFullscreen && (
                <Tooltip title="Close">
                  <IconButton size="small" onClick={toggleFullscreen}>
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Tab Navigation */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ bgcolor: "background.paper" }}
      >
        <Tab label="Console" />
        <Tab label="Sessions" />
        <Tab label="Settings" />
      </Tabs>

      {/* Filter Bar */}
      {activeTab === 0 && (
        <Box
          sx={{ display: "flex", p: 1, gap: 1, bgcolor: "background.paper" }}
        >
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="level-filter-label">Level</InputLabel>
            <Select
              labelId="level-filter-label"
              value={filter.level}
              label="Level"
              onChange={(e) => handleFilterChange("level", e.target.value)}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="debug">Debug</MenuItem>
              <MenuItem value="info">Info</MenuItem>
              <MenuItem value="warn">Warning</MenuItem>
              <MenuItem value="error">Error</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size="small"
            placeholder="Filter by source"
            value={filter.source}
            onChange={(e) => handleFilterChange("source", e.target.value)}
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <FilterIcon fontSize="small" sx={{ mr: 1, opacity: 0.5 }} />
              ),
            }}
          />
          <TextField
            size="small"
            placeholder="Search logs"
            value={filter.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.5 }} />
              ),
            }}
          />
        </Box>
      )}

      {/* Console Content */}
      {activeTab === 0 && (
        <Box
          ref={logContainerRef}
          sx={{
            flex: 1,
            overflow: "auto",
            p: 1,
            bgcolor: "#1e1e1e",
            fontFamily: "monospace",
            fontSize: "0.85rem",
            color: "#ffffff",
          }}
        >
          {logs.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                color: "rgba(255, 255, 255, 0.5)",
                flexDirection: "column",
              }}
            >
              <Typography variant="body2" sx={{ mb: 2 }}>
                No logs to display
              </Typography>
              {!isRunning && (
                <Button
                  variant="outlined"
                  startIcon={<StartIcon />}
                  onClick={toggleRunning}
                  size="small"
                >
                  Start Logging
                </Button>
              )}
            </Box>
          ) : (
            logs.map((log) => (
              <Box
                key={log.id}
                sx={{
                  mb: 0.5,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                <Box component="span" sx={{ color: "#888", mr: 1 }}>
                  {renderTimestamp(log.timestamp)}
                </Box>
                <Box component="span" sx={{ color: "#8ac4d0", mr: 1 }}>
                  [{log.level.toUpperCase()}]
                </Box>
                <Box component="span" sx={getLogStyle(log.level)}>
                  {log.message}
                </Box>
                {log.source !== "unknown" && (
                  <Box
                    component="span"
                    sx={{
                      color: "#888",
                      fontStyle: "italic",
                      fontSize: "0.8em",
                      display: "block",
                    }}
                  >
                    {log.source}
                  </Box>
                )}
              </Box>
            ))
          )}
        </Box>
      )}

      {/* Sessions Tab */}
      {activeTab === 1 && (
        <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Debug Sessions
          </Typography>

          {sessions.length === 0 ? (
            <Typography color="textSecondary">No sessions available</Typography>
          ) : (
            <Stack spacing={2}>
              {sessions.map((session) => (
                <Paper
                  key={session.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    bgcolor:
                      activeSessionId === session.id
                        ? "rgba(33, 150, 243, 0.1)"
                        : "transparent",
                    border:
                      activeSessionId === session.id
                        ? "1px solid #2196f3"
                        : "1px solid rgba(0, 0, 0, 0.12)",
                  }}
                  onClick={() => setActiveSessionId(session.id)}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography fontWeight="bold">
                      Session {sessions.indexOf(session) + 1}
                      {session.id ===
                        DebugMcpService.getCurrentSession()?.id && (
                        <Chip
                          size="small"
                          label="Active"
                          color="success"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(session.startTime).toLocaleString()}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="body2">
                        Logs: {session.logs.length}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.5, mt: 1 }}>
                        {session.logs.some((l) => l.level === "error") && (
                          <Chip
                            size="small"
                            label={`${
                              session.logs.filter((l) => l.level === "error")
                                .length
                            } Errors`}
                            color="error"
                          />
                        )}
                        {session.logs.some((l) => l.level === "warn") && (
                          <Chip
                            size="small"
                            label={`${
                              session.logs.filter((l) => l.level === "warn")
                                .length
                            } Warnings`}
                            color="warning"
                          />
                        )}
                      </Box>
                    </Box>

                    <Button
                      size="small"
                      variant={
                        activeSessionId === session.id
                          ? "contained"
                          : "outlined"
                      }
                      onClick={() => setActiveSessionId(session.id)}
                    >
                      View Logs
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Stack>
          )}

          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              startIcon={<StartIcon />}
              onClick={startNewSession}
            >
              New Session
            </Button>
          </Box>
        </Box>
      )}

      {/* Settings Tab */}
      {activeTab === 2 && (
        <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Settings
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Turbo Pack Integration
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Button
              variant="outlined"
              onClick={() => DebugMcpService.setupTurboPack()}
            >
              Setup Turbo Pack
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1">Display Settings</Typography>
          <Box sx={{ mt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="max-logs-label">Max Logs</InputLabel>
              <Select
                labelId="max-logs-label"
                value={maxLogs.toString()}
                label="Max Logs"
                onChange={(e) => {
                  const newMax = parseInt(e.target.value);
                  if (!isNaN(newMax)) {
                    refreshLogs();
                  }
                }}
              >
                <MenuItem value="50">50 logs</MenuItem>
                <MenuItem value="100">100 logs</MenuItem>
                <MenuItem value="200">200 logs</MenuItem>
                <MenuItem value="500">500 logs</MenuItem>
                <MenuItem value="1000">1000 logs</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      )}

      {/* Settings Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            downloadLogs();
            handleMenuClose();
          }}
        >
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
          Download Logs
        </MenuItem>
        <MenuItem
          onClick={() => {
            clearLogs();
            handleMenuClose();
          }}
        >
          <ClearIcon fontSize="small" sx={{ mr: 1 }} />
          Clear Logs
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            toggleFullscreen();
            handleMenuClose();
          }}
        >
          {isFullscreen ? (
            <FullscreenExitIcon fontSize="small" sx={{ mr: 1 }} />
          ) : (
            <FullscreenIcon fontSize="small" sx={{ mr: 1 }} />
          )}
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default DebugConsole;
