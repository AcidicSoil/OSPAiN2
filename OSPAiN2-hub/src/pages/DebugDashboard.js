"use strict";
/**
 * DebugDashboard
 *
 * A dashboard for monitoring and debugging the application.
 * Includes console log monitoring, Turbo Pack integration, and other debugging tools.
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
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const DebugConsole_1 = __importDefault(require("../components/debug/DebugConsole"));
const DebugMcpService_1 = __importDefault(require("../services/DebugMcpService"));
// Cast window.performance to access the Chrome-specific memory property
const getMemoryUsage = () => {
    // The memory property is a Chrome-specific extension, not standard
    const performanceWithMemory = window.performance;
    if (performanceWithMemory && performanceWithMemory.memory) {
        return Math.round(performanceWithMemory.memory.usedJSHeapSize / 1024 / 1024);
    }
    return 0;
};
const DebugDashboard = () => {
    const [systemInfo, setSystemInfo] = (0, react_1.useState)({
        memoryUsage: 0,
        cpuUsage: 0,
        uptime: 0,
        platform: "",
        browserInfo: "",
        screenResolution: "",
    });
    const [isInitialized, setIsInitialized] = (0, react_1.useState)(false);
    const [showTurkoPack, setShowTurkoPack] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        // Get system information
        const memoryUsage = getMemoryUsage();
        setSystemInfo({
            memoryUsage,
            cpuUsage: 0, // Not directly available in browser
            uptime: Math.floor(performance.now() / 1000),
            platform: navigator.platform,
            browserInfo: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
        });
        // Initialize debug service
        if (!isInitialized) {
            DebugMcpService_1.default.initialize();
            setIsInitialized(true);
        }
        // Update system info periodically
        const interval = setInterval(() => {
            const updatedMemoryUsage = getMemoryUsage();
            setSystemInfo((prev) => ({
                ...prev,
                memoryUsage: updatedMemoryUsage,
                uptime: Math.floor(performance.now() / 1000),
            }));
        }, 2000);
        return () => {
            clearInterval(interval);
        };
    }, [isInitialized]);
    const refreshSystemInfo = () => {
        const memoryUsage = getMemoryUsage();
        setSystemInfo({
            memoryUsage,
            cpuUsage: 0,
            uptime: Math.floor(performance.now() / 1000),
            platform: navigator.platform,
            browserInfo: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
        });
    };
    const setupTurboPack = () => {
        DebugMcpService_1.default.setupTurboPack();
        setShowTurkoPack(true);
    };
    const formatUptime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };
    const handleResetDebugService = () => {
        DebugMcpService_1.default.shutdown();
        DebugMcpService_1.default.initialize();
        DebugMcpService_1.default.addLogEntry("info", "Debug service reset");
        setIsInitialized(true);
    };
    return (<material_1.Container maxWidth="xl">
      <material_1.Box sx={{ p: 3 }}>
        <material_1.Box sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        }}>
          <material_1.Box>
            <material_1.Typography variant="h4" component="h1" gutterBottom>
              <icons_material_1.BugReport sx={{ mr: 1, verticalAlign: "middle" }}/>
              Debug Dashboard
            </material_1.Typography>
            <material_1.Typography variant="body2" color="textSecondary" gutterBottom>
              Monitor system performance, view console logs, and manage
              debugging tools.
            </material_1.Typography>
          </material_1.Box>
          <material_1.Button variant="contained" startIcon={<icons_material_1.Refresh />} onClick={refreshSystemInfo}>
            Refresh Status
          </material_1.Button>
        </material_1.Box>

        {/* System Information */}
        <material_1.Grid container spacing={3} sx={{ mb: 3 }}>
          <material_1.Grid item xs={12} md={6} lg={3}>
            <material_1.Paper sx={{ p: 2, display: "flex", alignItems: "center" }}>
              <icons_material_1.Memory sx={{ fontSize: 40, color: "primary.main", mr: 2 }}/>
              <material_1.Box>
                <material_1.Typography variant="body2" color="textSecondary">
                  Memory Usage
                </material_1.Typography>
                <material_1.Typography variant="h6">
                  {systemInfo.memoryUsage} MB
                </material_1.Typography>
              </material_1.Box>
            </material_1.Paper>
          </material_1.Grid>
          <material_1.Grid item xs={12} md={6} lg={3}>
            <material_1.Paper sx={{ p: 2, display: "flex", alignItems: "center" }}>
              <icons_material_1.Speed sx={{ fontSize: 40, color: "secondary.main", mr: 2 }}/>
              <material_1.Box>
                <material_1.Typography variant="body2" color="textSecondary">
                  Uptime
                </material_1.Typography>
                <material_1.Typography variant="h6">
                  {formatUptime(systemInfo.uptime)}
                </material_1.Typography>
              </material_1.Box>
            </material_1.Paper>
          </material_1.Grid>
          <material_1.Grid item xs={12} md={6} lg={3}>
            <material_1.Paper sx={{ p: 2, display: "flex", alignItems: "center" }}>
              <icons_material_1.Storage sx={{ fontSize: 40, color: "warning.main", mr: 2 }}/>
              <material_1.Box>
                <material_1.Typography variant="body2" color="textSecondary">
                  Platform
                </material_1.Typography>
                <material_1.Typography variant="h6">{systemInfo.platform}</material_1.Typography>
              </material_1.Box>
            </material_1.Paper>
          </material_1.Grid>
          <material_1.Grid item xs={12} md={6} lg={3}>
            <material_1.Paper sx={{ p: 2, display: "flex", alignItems: "center" }}>
              <icons_material_1.Code sx={{ fontSize: 40, color: "error.main", mr: 2 }}/>
              <material_1.Box>
                <material_1.Typography variant="body2" color="textSecondary">
                  Resolution
                </material_1.Typography>
                <material_1.Typography variant="h6">
                  {systemInfo.screenResolution}
                </material_1.Typography>
              </material_1.Box>
            </material_1.Paper>
          </material_1.Grid>
        </material_1.Grid>

        {/* Debug Actions */}
        <material_1.Paper sx={{ p: 2, mb: 3 }}>
          <material_1.Typography variant="h6" gutterBottom>
            Debug Actions
          </material_1.Typography>
          <material_1.Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            <material_1.Button variant="outlined" startIcon={<icons_material_1.PlayArrow />} onClick={setupTurboPack}>
              Setup Turbo Pack
            </material_1.Button>
            <material_1.Button variant="outlined" startIcon={<icons_material_1.Refresh />} onClick={handleResetDebugService}>
              Reset Debug Service
            </material_1.Button>
            <material_1.Button variant="outlined" startIcon={<icons_material_1.Description />} component="a" href="https://turbo.build/pack" target="_blank">
              Turbo Pack Docs
            </material_1.Button>
          </material_1.Box>
        </material_1.Paper>

        {/* Debug Console */}
        <material_1.Box sx={{ mb: 3 }}>
          <material_1.Typography variant="h6" gutterBottom>
            Debug Console
          </material_1.Typography>
          <DebugConsole_1.default height={500}/>
        </material_1.Box>

        {showTurkoPack && (<material_1.Alert severity="info" sx={{ mb: 3 }}>
            <material_1.AlertTitle>Turbo Pack Integration</material_1.AlertTitle>
            <material_1.Typography variant="body2" paragraph>
              Turbo Pack integration has been set up. This integration can help
              with faster development cycles and improved debugging
              capabilities.
            </material_1.Typography>
            <material_1.Box sx={{ display: "flex", gap: 1 }}>
              <material_1.Chip label="Status: Active" color="success" variant="outlined"/>
              <material_1.Chip label="Version: 1.0.0" color="primary" variant="outlined"/>
            </material_1.Box>
          </material_1.Alert>)}

        {/* Browser Information */}
        <material_1.Card sx={{ mb: 3 }}>
          <material_1.CardHeader title="Browser Information" avatar={<icons_material_1.Info />} action={<material_1.Tooltip title="Refresh">
                <material_1.IconButton onClick={refreshSystemInfo}>
                  <icons_material_1.Refresh />
                </material_1.IconButton>
              </material_1.Tooltip>}/>
          <material_1.Divider />
          <material_1.CardContent>
            <material_1.Typography variant="body2" sx={{ wordBreak: "break-all" }}>
              {systemInfo.browserInfo}
            </material_1.Typography>
          </material_1.CardContent>
        </material_1.Card>
      </material_1.Box>
    </material_1.Container>);
};
exports.default = DebugDashboard;
//# sourceMappingURL=DebugDashboard.js.map