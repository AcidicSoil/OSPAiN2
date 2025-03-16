import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  LinearProgress, 
  Divider, 
  Chip, 
  Stack, 
  IconButton,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress
} from '@mui/material';
import { 
  PlayArrow, 
  Pause as PauseIcon, 
  CheckCircle, 
  Error as ErrorIcon, 
  AccessTime, 
  ExpandMore, 
  ExpandLess
} from '@mui/icons-material';
import knowledgeGraphService, { ProcessingStatus } from '../../services/KnowledgeGraphService';

export const BatchProcessingProgress: React.FC = () => {
  const [items, setItems] = useState<ProcessingStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [processingActive, setProcessingActive] = useState(true);
  const [overallProgress, setOverallProgress] = useState(0);
  
  useEffect(() => {
    loadProcessingStatus();
    
    // Set up polling if processing is active
    let interval: NodeJS.Timeout | null = null;
    if (processingActive) {
      interval = setInterval(() => {
        loadProcessingStatus();
      }, 5000); // Poll every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [processingActive]);
  
  const loadProcessingStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await knowledgeGraphService.getProcessingStatus();
      setItems(data);
      
      // Calculate overall progress
      if (data.length > 0) {
        const totalProgress = data.reduce((sum, item) => sum + item.progress, 0);
        setOverallProgress(Math.round(totalProgress / data.length));
      }
      
      // Check if any items are still processing
      const hasActiveJobs = data.some(item => 
        item.status === 'processing' || item.status === 'waiting'
      );
      setProcessingActive(hasActiveJobs);
    } catch (error) {
      console.error('Error loading processing status:', error);
      setError('Failed to load processing status. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };
  
  const toggleProcessing = () => {
    setProcessingActive(!processingActive);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'info';
      case 'waiting': return 'default';
      case 'error': return 'error';
      case 'paused': return 'warning';
      default: return 'default';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle fontSize="small" />;
      case 'processing': return <CircularProgress size={16} />;
      case 'waiting': return <AccessTime fontSize="small" />;
      case 'error': return <ErrorIcon fontSize="small" />;
      case 'paused': return <PauseIcon fontSize="small" />;
      default: return null;
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };
  
  const formatDuration = (startTime?: string, endTime?: string) => {
    if (!startTime) return 'N/A';
    
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const durationMs = end.getTime() - start.getTime();
    
    const seconds = Math.floor(durationMs / 1000);
    if (seconds < 60) return `${seconds} sec`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ${seconds % 60} sec`;
    
    const hours = Math.floor(minutes / 60);
    return `${hours} hr ${minutes % 60} min`;
  };
  
  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Processing Queue</Typography>
        <Button 
          variant="outlined" 
          startIcon={processingActive ? <PauseIcon /> : <PlayArrow />}
          onClick={toggleProcessing}
        >
          {processingActive ? 'Pause Updates' : 'Resume Updates'}
        </Button>
      </Box>
      
      {loading && items.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ my: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : items.length === 0 ? (
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No items in processing queue
          </Typography>
        </Box>
      ) : (
        <Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              Overall Progress
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={overallProgress} 
              sx={{ height: 10, borderRadius: 5 }}
            />
            <Typography variant="body2" align="right" sx={{ mt: 0.5 }}>
              {overallProgress}%
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          {items.map((item) => (
            <Card key={item.id} sx={{ mb: 2, border: '1px solid #eee' }}>
              <CardContent sx={{ pb: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        {item.filename}
                      </Typography>
                      <Chip 
                        size="small"
                        label={item.status.toUpperCase()}
                        color={getStatusColor(item.status) as any}
                        icon={getStatusIcon(item.status)}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <LinearProgress 
                      variant="determinate" 
                      value={item.progress} 
                      color={
                        item.status === 'error' ? 'error' : 
                        item.status === 'completed' ? 'success' : 'primary'
                      }
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="body2">{item.progress}%</Typography>
                      <Typography variant="body2">
                        {formatDuration(item.startTime, item.endTime)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">
                        {item.fileType.toUpperCase()} • {formatFileSize(item.fileSize)}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => toggleExpand(item.id)}
                        sx={{ ml: 1 }}
                      >
                        {expandedItems.has(item.id) ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>
                  </Grid>
                  
                  {expandedItems.has(item.id) && (
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      {item.error && (
                        <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                          Error: {item.error}
                        </Typography>
                      )}
                      {item.details && item.details.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                            Details:
                          </Typography>
                          <ul style={{ margin: 0, paddingLeft: 16 }}>
                            {item.details.map((detail, index) => (
                              <li key={index}>
                                <Typography variant="body2">{detail}</Typography>
                              </li>
                            ))}
                          </ul>
                        </Box>
                      )}
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Paper>
  );
};

// Add default export
export default BatchProcessingProgress; 