"use strict";
/**
 * DebugConsole
 *
 * A component for displaying real-time console logs captured by the DebugMcpService.
 * Provides filtering, searching, and visualization of log data.
 */
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
exports.DebugConsole = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const DebugMcpService_1 = __importDefault(require("../../services/DebugMcpService"));
const DebugConsole = ({ height = 400, width = "100%", showControls = true, autoStart = true, maxLogs = 100, filter: initialFilter, }) => {
    const theme = (0, material_1.useTheme)();
    // State
    const [logs, setLogs] = (0, react_1.useState)([]);
    const [sessions, setSessions] = (0, react_1.useState)([]);
    const [activeSessionId, setActiveSessionId] = (0, react_1.useState)(null);
    const [isRunning, setIsRunning] = (0, react_1.useState)(autoStart);
    const [filter, setFilter] = (0, react_1.useState)({
        level: initialFilter?.level || "",
        source: initialFilter?.source || "",
        search: initialFilter?.search || "",
    });
    const [activeTab, setActiveTab] = (0, react_1.useState)(0);
    const [isFullscreen, setIsFullscreen] = (0, react_1.useState)(false);
    const [anchorEl, setAnchorEl] = (0, react_1.useState)(null);
    const logContainerRef = (0, react_1.useRef)(null);
    // Function declarations
    const refreshLogs = (0, react_1.useCallback)(async () => {
        if (activeSessionId) {
            const sessionLogs = await DebugMcpService_1.default.getLogs({
                sessionId: activeSessionId,
            });
            setLogs(sessionLogs
                .filter((log) => (!filter.level || log.level === filter.level) &&
                (!filter.source || log.source === filter.source) &&
                (!filter.search ||
                    log.message.toLowerCase().includes(filter.search.toLowerCase())))
                .slice(0, maxLogs));
        }
        else {
            setLogs([]);
        }
    }, [activeSessionId, filter, maxLogs]);
    const refreshSessionsAndLogs = (0, react_1.useCallback)(async () => {
        const sessions = await DebugMcpService_1.default.getSessions();
        setSessions(sessions);
        if (sessions.length > 0 && !activeSessionId) {
            setActiveSessionId(sessions[0].id);
        }
        await refreshLogs();
    }, [activeSessionId, refreshLogs]);
    // Initialize on component mount
    (0, react_1.useEffect)(() => {
        if (autoStart) {
            DebugMcpService_1.default.initialize();
        }
        // Get initial sessions and logs
        refreshSessionsAndLogs();
        // Set up log listener
        const unsubscribe = DebugMcpService_1.default.onLog((log) => {
            setLogs((prevLogs) => {
                const newLogs = [log, ...prevLogs];
                return newLogs.slice(0, maxLogs);
            });
        });
        return () => {
            unsubscribe();
            if (isRunning) {
                DebugMcpService_1.default.shutdown();
            }
        };
    }, [autoStart, maxLogs, isRunning, refreshSessionsAndLogs]);
    // Apply filter effect
    (0, react_1.useEffect)(() => {
        refreshLogs();
    }, [filter, activeSessionId, refreshLogs]);
    // When running state changes
    (0, react_1.useEffect)(() => {
        if (isRunning && !DebugMcpService_1.default.getCurrentSession()) {
            DebugMcpService_1.default.initialize();
        }
        else if (!isRunning) {
            refreshSessionsAndLogs();
        }
    }, [isRunning, refreshSessionsAndLogs]);
    // Scroll to bottom on new logs if scrolled to bottom
    (0, react_1.useEffect)(() => {
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
        const newSession = DebugMcpService_1.default.startNewSession();
        setActiveSessionId(newSession.id);
        refreshSessionsAndLogs();
    };
    // Toggle running state
    const toggleRunning = () => {
        if (!isRunning) {
            DebugMcpService_1.default.initialize();
        }
        else {
            DebugMcpService_1.default.endCurrentSession();
        }
        setIsRunning(!isRunning);
    };
    // Clear logs
    const clearLogs = () => {
        if (window.confirm("Are you sure you want to clear all logs in this session?")) {
            // Start a new empty session
            startNewSession();
        }
    };
    // Toggle fullscreen
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };
    // Handle filter change
    const handleFilterChange = (key, value) => {
        setFilter((prev) => ({
            ...prev,
            [key]: value,
        }));
    };
    // Handle menu open
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    // Handle menu close
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    // Download logs as JSON
    const downloadLogs = () => {
        const selectedSession = sessions.find((s) => s.id === activeSessionId);
        if (!selectedSession)
            return;
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
    const getLogStyle = (level) => {
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
    const renderTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString();
    };
    const renderLogLevel = (level) => {
        switch (level) {
            case "debug":
                return <icons_material_1.BugReport sx={{ color: theme.palette.info.main }}/>;
            case "info":
                return <icons_material_1.Info sx={{ color: theme.palette.success.main }}/>;
            case "warn":
                return <icons_material_1.Warning sx={{ color: theme.palette.warning.main }}/>;
            case "error":
                return <icons_material_1.Error sx={{ color: theme.palette.error.main }}/>;
        }
    };
    const renderLogEntry = (l) => (<material_1.Box key={l.id} sx={{
            display: "flex",
            alignItems: "center",
            p: 1,
            borderBottom: 1,
            borderColor: "divider",
            "&:hover": {
                bgcolor: "action.hover",
            },
        }}>
      {renderLogLevel(l.level)}
      <material_1.Box sx={{ ml: 1, flex: 1 }}>
        <material_1.Typography variant="caption" color="textSecondary">
          {renderTimestamp(l.timestamp)}
        </material_1.Typography>
        <material_1.Typography variant="body2">{l.message}</material_1.Typography>
      </material_1.Box>
    </material_1.Box>);
    return (<material_1.Paper elevation={3} sx={{
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
        }}>
      {/* Header */}
      <material_1.Box sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 1,
            borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
            bgcolor: "background.paper",
        }}>
        <material_1.Typography variant="subtitle1" fontWeight="bold">
          Debug Console
          {isRunning && (<material_1.Box component="span" sx={{ display: "inline-block", ml: 1 }}>
              <material_1.CircularProgress size={16}/>
            </material_1.Box>)}
        </material_1.Typography>
        <material_1.Box>
          {showControls && (<>
              <material_1.Tooltip title={isRunning ? "Stop Logging" : "Start Logging"}>
                <material_1.IconButton size="small" onClick={toggleRunning} color={isRunning ? "error" : "success"}>
                  {isRunning ? <icons_material_1.Stop /> : <icons_material_1.PlayArrow />}
                </material_1.IconButton>
              </material_1.Tooltip>
              <material_1.Tooltip title="Refresh">
                <material_1.IconButton size="small" onClick={refreshSessionsAndLogs}>
                  <icons_material_1.Refresh />
                </material_1.IconButton>
              </material_1.Tooltip>
              <material_1.Tooltip title="Clear Logs">
                <material_1.IconButton size="small" onClick={clearLogs}>
                  <icons_material_1.Clear />
                </material_1.IconButton>
              </material_1.Tooltip>
              <material_1.Tooltip title="Download Logs">
                <material_1.IconButton size="small" onClick={downloadLogs}>
                  <icons_material_1.Download />
                </material_1.IconButton>
              </material_1.Tooltip>
              <material_1.Tooltip title="Settings">
                <material_1.IconButton size="small" onClick={handleMenuOpen}>
                  <icons_material_1.Settings />
                </material_1.IconButton>
              </material_1.Tooltip>
              <material_1.Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                <material_1.IconButton size="small" onClick={toggleFullscreen}>
                  {isFullscreen ? <icons_material_1.FullscreenExit /> : <icons_material_1.Fullscreen />}
                </material_1.IconButton>
              </material_1.Tooltip>
              {isFullscreen && (<material_1.Tooltip title="Close">
                  <material_1.IconButton size="small" onClick={toggleFullscreen}>
                    <icons_material_1.Close />
                  </material_1.IconButton>
                </material_1.Tooltip>)}
            </>)}
        </material_1.Box>
      </material_1.Box>

      {/* Tab Navigation */}
      <material_1.Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ bgcolor: "background.paper" }}>
        <material_1.Tab label="Console"/>
        <material_1.Tab label="Sessions"/>
        <material_1.Tab label="Settings"/>
      </material_1.Tabs>

      {/* Filter Bar */}
      {activeTab === 0 && (<material_1.Box sx={{ display: "flex", p: 1, gap: 1, bgcolor: "background.paper" }}>
          <material_1.FormControl size="small" sx={{ minWidth: 120 }}>
            <material_1.InputLabel id="level-filter-label">Level</material_1.InputLabel>
            <material_1.Select labelId="level-filter-label" value={filter.level} label="Level" onChange={(e) => handleFilterChange("level", e.target.value)} size="small">
              <material_1.MenuItem value="">All</material_1.MenuItem>
              <material_1.MenuItem value="debug">Debug</material_1.MenuItem>
              <material_1.MenuItem value="info">Info</material_1.MenuItem>
              <material_1.MenuItem value="warn">Warning</material_1.MenuItem>
              <material_1.MenuItem value="error">Error</material_1.MenuItem>
            </material_1.Select>
          </material_1.FormControl>
          <material_1.TextField size="small" placeholder="Filter by source" value={filter.source} onChange={(e) => handleFilterChange("source", e.target.value)} sx={{ flex: 1 }} InputProps={{
                startAdornment: (<icons_material_1.FilterList fontSize="small" sx={{ mr: 1, opacity: 0.5 }}/>),
            }}/>
          <material_1.TextField size="small" placeholder="Search logs" value={filter.search} onChange={(e) => handleFilterChange("search", e.target.value)} sx={{ flex: 1 }} InputProps={{
                startAdornment: (<icons_material_1.Search fontSize="small" sx={{ mr: 1, opacity: 0.5 }}/>),
            }}/>
        </material_1.Box>)}

      {/* Console Content */}
      {activeTab === 0 && (<material_1.Box ref={logContainerRef} sx={{
                flex: 1,
                overflow: "auto",
                p: 1,
                bgcolor: "#1e1e1e",
                fontFamily: "monospace",
                fontSize: "0.85rem",
                color: "#ffffff",
            }}>
          {logs.length === 0 ? (<material_1.Box sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    color: "rgba(255, 255, 255, 0.5)",
                    flexDirection: "column",
                }}>
              <material_1.Typography variant="body2" sx={{ mb: 2 }}>
                No logs to display
              </material_1.Typography>
              {!isRunning && (<material_1.Button variant="outlined" startIcon={<icons_material_1.PlayArrow />} onClick={toggleRunning} size="small">
                  Start Logging
                </material_1.Button>)}
            </material_1.Box>) : (logs.map((log) => (<material_1.Box key={log.id} sx={{
                    mb: 0.5,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                }}>
                <material_1.Box component="span" sx={{ color: "#888", mr: 1 }}>
                  {renderTimestamp(log.timestamp)}
                </material_1.Box>
                <material_1.Box component="span" sx={{ color: "#8ac4d0", mr: 1 }}>
                  [{log.level.toUpperCase()}]
                </material_1.Box>
                <material_1.Box component="span" sx={getLogStyle(log.level)}>
                  {log.message}
                </material_1.Box>
                {log.source !== "unknown" && (<material_1.Box component="span" sx={{
                        color: "#888",
                        fontStyle: "italic",
                        fontSize: "0.8em",
                        display: "block",
                    }}>
                    {log.source}
                  </material_1.Box>)}
              </material_1.Box>)))}
        </material_1.Box>)}

      {/* Sessions Tab */}
      {activeTab === 1 && (<material_1.Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
          <material_1.Typography variant="h6" gutterBottom>
            Debug Sessions
          </material_1.Typography>

          {sessions.length === 0 ? (<material_1.Typography color="textSecondary">No sessions available</material_1.Typography>) : (<material_1.Stack spacing={2}>
              {sessions.map((session) => (<material_1.Paper key={session.id} variant="outlined" sx={{
                        p: 2,
                        cursor: "pointer",
                        bgcolor: activeSessionId === session.id
                            ? "rgba(33, 150, 243, 0.1)"
                            : "transparent",
                        border: activeSessionId === session.id
                            ? "1px solid #2196f3"
                            : "1px solid rgba(0, 0, 0, 0.12)",
                    }} onClick={() => setActiveSessionId(session.id)}>
                  <material_1.Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                    }}>
                    <material_1.Typography fontWeight="bold">
                      Session {sessions.indexOf(session) + 1}
                      {session.id ===
                        DebugMcpService_1.default.getCurrentSession()?.id && (<material_1.Chip size="small" label="Active" color="success" sx={{ ml: 1 }}/>)}
                    </material_1.Typography>
                    <material_1.Typography variant="body2" color="textSecondary">
                      {new Date(session.startTime).toLocaleString()}
                    </material_1.Typography>
                  </material_1.Box>

                  <material_1.Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}>
                    <material_1.Box>
                      <material_1.Typography variant="body2">
                        Logs: {session.logs.length}
                      </material_1.Typography>
                      <material_1.Box sx={{ display: "flex", gap: 0.5, mt: 1 }}>
                        {session.logs.some((l) => l.level === "error") && (<material_1.Chip size="small" label={`${session.logs.filter((l) => l.level === "error")
                            .length} Errors`} color="error"/>)}
                        {session.logs.some((l) => l.level === "warn") && (<material_1.Chip size="small" label={`${session.logs.filter((l) => l.level === "warn")
                            .length} Warnings`} color="warning"/>)}
                      </material_1.Box>
                    </material_1.Box>

                    <material_1.Button size="small" variant={activeSessionId === session.id
                        ? "contained"
                        : "outlined"} onClick={() => setActiveSessionId(session.id)}>
                      View Logs
                    </material_1.Button>
                  </material_1.Box>
                </material_1.Paper>))}
            </material_1.Stack>)}

          <material_1.Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <material_1.Button variant="contained" startIcon={<icons_material_1.PlayArrow />} onClick={startNewSession}>
              New Session
            </material_1.Button>
          </material_1.Box>
        </material_1.Box>)}

      {/* Settings Tab */}
      {activeTab === 2 && (<material_1.Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
          <material_1.Typography variant="h6" gutterBottom>
            Settings
          </material_1.Typography>

          <material_1.Typography variant="subtitle1" sx={{ mt: 2 }}>
            Turbo Pack Integration
          </material_1.Typography>
          <material_1.Box sx={{ mt: 1 }}>
            <material_1.Button variant="outlined" onClick={() => DebugMcpService_1.default.setupTurboPack()}>
              Setup Turbo Pack
            </material_1.Button>
          </material_1.Box>

          <material_1.Divider sx={{ my: 2 }}/>

          <material_1.Typography variant="subtitle1">Display Settings</material_1.Typography>
          <material_1.Box sx={{ mt: 1 }}>
            <material_1.FormControl fullWidth sx={{ mb: 2 }}>
              <material_1.InputLabel id="max-logs-label">Max Logs</material_1.InputLabel>
              <material_1.Select labelId="max-logs-label" value={maxLogs.toString()} label="Max Logs" onChange={(e) => {
                const newMax = parseInt(e.target.value);
                if (!isNaN(newMax)) {
                    refreshLogs();
                }
            }}>
                <material_1.MenuItem value="50">50 logs</material_1.MenuItem>
                <material_1.MenuItem value="100">100 logs</material_1.MenuItem>
                <material_1.MenuItem value="200">200 logs</material_1.MenuItem>
                <material_1.MenuItem value="500">500 logs</material_1.MenuItem>
                <material_1.MenuItem value="1000">1000 logs</material_1.MenuItem>
              </material_1.Select>
            </material_1.FormControl>
          </material_1.Box>
        </material_1.Box>)}

      {/* Settings Menu */}
      <material_1.Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <material_1.MenuItem onClick={() => {
            downloadLogs();
            handleMenuClose();
        }}>
          <icons_material_1.Download fontSize="small" sx={{ mr: 1 }}/>
          Download Logs
        </material_1.MenuItem>
        <material_1.MenuItem onClick={() => {
            clearLogs();
            handleMenuClose();
        }}>
          <icons_material_1.Clear fontSize="small" sx={{ mr: 1 }}/>
          Clear Logs
        </material_1.MenuItem>
        <material_1.Divider />
        <material_1.MenuItem onClick={() => {
            toggleFullscreen();
            handleMenuClose();
        }}>
          {isFullscreen ? (<icons_material_1.FullscreenExit fontSize="small" sx={{ mr: 1 }}/>) : (<icons_material_1.Fullscreen fontSize="small" sx={{ mr: 1 }}/>)}
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </material_1.MenuItem>
      </material_1.Menu>
    </material_1.Paper>);
};
exports.DebugConsole = DebugConsole;
exports.default = exports.DebugConsole;
//# sourceMappingURL=DebugConsole.js.map