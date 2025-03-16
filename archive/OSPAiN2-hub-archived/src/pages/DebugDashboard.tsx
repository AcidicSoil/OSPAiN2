/**
 * DebugDashboard
 *
 * A dashboard for monitoring and debugging the application.
 * Includes console log monitoring, Turbo Pack integration, and other debugging tools.
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  Alert,
  AlertTitle,
  Chip,
  Container,
} from "@mui/material";
import {
  BugReport as BugIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Code as CodeIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  PlayArrow as StartIcon,
  Description as DocIcon,
} from "@mui/icons-material";
import DebugConsole from "../components/debug/DebugConsole";
import DebugMcpService from "../services/DebugMcpService";

// Chrome-specific performance extension
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

// Cast window.performance to access the Chrome-specific memory property
const getMemoryUsage = (): number => {
  // The memory property is a Chrome-specific extension, not standard
  const performanceWithMemory = window.performance as any;
  if (performanceWithMemory && performanceWithMemory.memory) {
    return Math.round(
      performanceWithMemory.memory.usedJSHeapSize / 1024 / 1024
    );
  }
  return 0;
};

const DebugDashboard: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState({
    memoryUsage: 0,
    cpuUsage: 0,
    uptime: 0,
    platform: "",
    browserInfo: "",
    screenResolution: "",
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [showTurkoPack, setShowTurkoPack] = useState(false);

  useEffect(() => {
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
      DebugMcpService.initialize();
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
    DebugMcpService.setupTurboPack();
    setShowTurkoPack(true);
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResetDebugService = () => {
    DebugMcpService.shutdown();
    DebugMcpService.initialize();
    DebugMcpService.addLogEntry("info", "Debug service reset");
    setIsInitialized(true);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              <BugIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Debug Dashboard
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Monitor system performance, view console logs, and manage
              debugging tools.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={refreshSystemInfo}
          >
            Refresh Status
          </Button>
        </Box>

        {/* System Information */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6} lg={3}>
            <Paper sx={{ p: 2, display: "flex", alignItems: "center" }}>
              <MemoryIcon sx={{ fontSize: 40, color: "primary.main", mr: 2 }} />
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Memory Usage
                </Typography>
                <Typography variant="h6">
                  {systemInfo.memoryUsage} MB
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Paper sx={{ p: 2, display: "flex", alignItems: "center" }}>
              <SpeedIcon
                sx={{ fontSize: 40, color: "secondary.main", mr: 2 }}
              />
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Uptime
                </Typography>
                <Typography variant="h6">
                  {formatUptime(systemInfo.uptime)}
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Paper sx={{ p: 2, display: "flex", alignItems: "center" }}>
              <StorageIcon
                sx={{ fontSize: 40, color: "warning.main", mr: 2 }}
              />
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Platform
                </Typography>
                <Typography variant="h6">{systemInfo.platform}</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Paper sx={{ p: 2, display: "flex", alignItems: "center" }}>
              <CodeIcon sx={{ fontSize: 40, color: "error.main", mr: 2 }} />
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Resolution
                </Typography>
                <Typography variant="h6">
                  {systemInfo.screenResolution}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Debug Actions */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Debug Actions
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<StartIcon />}
              onClick={setupTurboPack}
            >
              Setup Turbo Pack
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleResetDebugService}
            >
              Reset Debug Service
            </Button>
            <Button
              variant="outlined"
              startIcon={<DocIcon />}
              component="a"
              href="https://turbo.build/pack"
              target="_blank"
            >
              Turbo Pack Docs
            </Button>
          </Box>
        </Paper>

        {/* Debug Console */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Debug Console
          </Typography>
          <DebugConsole height={500} />
        </Box>

        {showTurkoPack && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>Turbo Pack Integration</AlertTitle>
            <Typography variant="body2" paragraph>
              Turbo Pack integration has been set up. This integration can help
              with faster development cycles and improved debugging
              capabilities.
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Chip label="Status: Active" color="success" variant="outlined" />
              <Chip label="Version: 1.0.0" color="primary" variant="outlined" />
            </Box>
          </Alert>
        )}

        {/* Browser Information */}
        <Card sx={{ mb: 3 }}>
          <CardHeader
            title="Browser Information"
            avatar={<InfoIcon />}
            action={
              <Tooltip title="Refresh">
                <IconButton onClick={refreshSystemInfo}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            }
          />
          <Divider />
          <CardContent>
            <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
              {systemInfo.browserInfo}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default DebugDashboard;
