import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  LinearProgress, 
  Button, 
  Grid, 
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Collapse,
  Tooltip
} from '@mui/material';
import { 
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ErrorOutline as ErrorIcon,
  CheckCircleOutline as SuccessIcon,
  HourglassEmpty as PendingIcon
} from '@mui/icons-material';
import { BatchProcessingProgress, BatchProcessingStats } from '../../services/knowledgeGraph/BatchProcessor';

interface BatchProcessingProgressComponentProps {
  progress?: BatchProcessingProgress;
  onStart?: () => void;
  onStop?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  isProcessing?: boolean;
  isPaused?: boolean;
  errors?: Array<{ documentId: string; error: Error }>;
}

export const BatchProcessingProgressComponent: React.FC<BatchProcessingProgressComponentProps> = ({
  progress,
  onStart,
  onStop,
  onPause,
  onResume,
  isProcessing = false,
  isPaused = false,
  errors = []
}) => {
  const [showErrors, setShowErrors] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  
  // Format estimated time remaining
  useEffect(() => {
    if (!progress?.estimatedTimeRemaining) {
      setTimeRemaining('');
      return;
    }
    
    const seconds = Math.floor(progress.estimatedTimeRemaining / 1000);
    if (seconds < 60) {
      setTimeRemaining(`${seconds}s`);
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      setTimeRemaining(`${minutes}m ${remainingSeconds}s`);
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      setTimeRemaining(`${hours}h ${minutes}m`);
    }
  }, [progress?.estimatedTimeRemaining]);
  
  // Calculate progress percentage
  const calculateProgress = (): number => {
    if (!progress?.stats) return 0;
    const { total, processed } = progress.stats;
    if (total === 0) return 0;
    return (processed / total) * 100;
  };
  
  // Get status text
  const getStatusText = (): string => {
    if (!isProcessing && !isPaused) return 'Ready';
    if (isPaused) return 'Paused';
    return 'Processing';
  };
  
  // Get status color
  const getStatusColor = (): string => {
    if (!isProcessing && !isPaused) return 'default';
    if (isPaused) return 'warning';
    return 'primary';
  };
  
  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Typography variant="h6">Batch Processing</Typography>
          </Grid>
          <Grid item>
            <Chip 
              label={getStatusText()} 
              color={getStatusColor() as any} 
              variant="outlined" 
            />
          </Grid>
          <Grid item xs />
          <Grid item>
            {!isProcessing && !isPaused ? (
              <Button 
                startIcon={<PlayIcon />} 
                variant="contained" 
                color="primary" 
                onClick={onStart}
                disabled={!onStart}
              >
                Start
              </Button>
            ) : isPaused ? (
              <Button 
                startIcon={<PlayIcon />} 
                variant="contained" 
                color="primary" 
                onClick={onResume}
                disabled={!onResume}
              >
                Resume
              </Button>
            ) : (
              <Button 
                startIcon={<PauseIcon />} 
                variant="contained" 
                color="primary" 
                onClick={onPause}
                disabled={!onPause}
              >
                Pause
              </Button>
            )}
          </Grid>
          <Grid item>
            <Button 
              startIcon={<StopIcon />} 
              variant="outlined" 
              color="error" 
              onClick={onStop}
              disabled={!isProcessing || !onStop}
            >
              Stop
            </Button>
          </Grid>
          <Grid item>
            <Tooltip title="Refresh Statistics">
              <IconButton onClick={() => {}}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>
      
      {isProcessing && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              {progress?.stats && `${formatNumber(progress.stats.processed)} / ${formatNumber(progress.stats.total)} documents processed`}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {timeRemaining && `Estimated time remaining: ${timeRemaining}`}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={calculateProgress()} 
            sx={{ height: 10, borderRadius: 5 }} 
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2" color="textSecondary">
              {progress?.currentBatch !== undefined && progress?.totalBatches !== undefined && 
                `Batch ${progress.currentBatch + 1} of ${progress.totalBatches}`}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {`${calculateProgress().toFixed(1)}%`}
            </Typography>
          </Box>
        </Box>
      )}
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <StatsCard stats={progress?.stats} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1">
                Errors {progress?.stats?.errors.length ? `(${progress.stats.errors.length})` : ''}
              </Typography>
              <IconButton size="small" onClick={() => setShowErrors(!showErrors)}>
                {showErrors ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            
            <Collapse in={showErrors}>
              {progress?.stats?.errors.length ? (
                <TableContainer sx={{ maxHeight: 200 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Document ID</TableCell>
                        <TableCell>Error</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {progress.stats.errors.map((error, index) => (
                        <TableRow key={index}>
                          <TableCell>{error.documentId}</TableCell>
                          <TableCell>{error.error.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>
                  No errors reported
                </Typography>
              )}
            </Collapse>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

interface StatsCardProps {
  stats?: BatchProcessingStats;
}

const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  if (!stats) {
    return (
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>Processing Statistics</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>
          No statistics available
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>Processing Statistics</Typography>
      <Grid container spacing={2}>
        <StatItem 
          label="Total" 
          value={stats.total} 
          icon={<PendingIcon color="action" />} 
        />
        <StatItem 
          label="Processed" 
          value={stats.processed} 
          icon={<RefreshIcon color="info" />} 
        />
        <StatItem 
          label="Succeeded" 
          value={stats.succeeded} 
          icon={<SuccessIcon color="success" />} 
        />
        <StatItem 
          label="Failed" 
          value={stats.failed} 
          icon={<ErrorIcon color="error" />} 
        />
        <StatItem 
          label="In Progress" 
          value={stats.inProgress} 
          icon={<HourglassEmpty color="primary" />} 
        />
      </Grid>
    </Paper>
  );
};

interface StatItemProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, icon }) => {
  return (
    <Grid item xs={6} sm={4}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ mr: 1 }}>{icon}</Box>
        <Typography variant="body2" color="textSecondary">{label}</Typography>
      </Box>
      <Typography variant="h6">{value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Typography>
    </Grid>
  );
}; 