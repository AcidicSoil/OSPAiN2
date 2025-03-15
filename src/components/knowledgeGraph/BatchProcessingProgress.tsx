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
  Info as InfoIcon, 
  Warning as WarningIcon,
  MoreVert,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';

interface ProcessingItem {
  id: string;
  filename: string;
  progress: number;
  status: 'waiting' | 'processing' | 'completed' | 'error' | 'paused';
  startTime?: Date;
  endTime?: Date;
  fileType: string;
  fileSize: number;
  error?: string;
  details?: string[];
}

export const BatchProcessingProgress: React.FC = () => {
  const [items, setItems] = useState<ProcessingItem[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  
  // Mock data generator
  useEffect(() => {
    const mockItems: ProcessingItem[] = [
      {
        id: '1',
        filename: 'research-paper.pdf',
        progress: 100,
        status: 'completed',
        startTime: new Date(Date.now() - 15000),
        endTime: new Date(),
        fileType: 'pdf',
        fileSize: 2.4 * 1024 * 1024,
        details: [
          'Extracted 32 pages of content',
          'Identified 15 key concepts',
          'Created 48 knowledge nodes',
          'Established 67 relationships'
        ]
      },
      {
        id: '2',
        filename: 'quarterly-report.docx',
        progress: 65,
        status: 'processing',
        startTime: new Date(Date.now() - 5000),
        fileType: 'docx',
        fileSize: 1.7 * 1024 * 1024,
        details: [
          'Processing page 14 of 22',
          'Extracting financial data',
          'Analyzing trends'
        ]
      },
      {
        id: '3',
        filename: 'api-documentation.md',
        progress: 0,
        status: 'waiting',
        fileType: 'markdown',
        fileSize: 0.3 * 1024 * 1024
      },
      {
        id: '4',
        filename: 'error-log.txt',
        progress: 30,
        status: 'error',
        startTime: new Date(Date.now() - 8000),
        endTime: new Date(Date.now() - 6000),
        fileType: 'text',
        fileSize: 0.5 * 1024 * 1024,
        error: 'Failed to parse content: Invalid format in line 245',
        details: [
          'Successfully processed 30% of content',
          'Error encountered at line 245',
          'Invalid syntax detected'
        ]
      },
      {
        id: '5',
        filename: 'dataset.csv',
        progress: 80,
        status: 'paused',
        startTime: new Date(Date.now() - 12000),
        fileType: 'csv',
        fileSize: 5.1 * 1024 * 1024,
        details: [
          'Processed 800 of 1000 rows',
          'Extracted 15 column mappings',
          'Paused by user at 80%'
        ]
      }
    ];
    
    setItems(mockItems);
    
    // Calculate overall progress
    const totalProgress = mockItems.reduce((sum, item) => sum + item.progress, 0);
    setOverallProgress(Math.floor(totalProgress / mockItems.length));
  }, []);
  
  // Simulate processing
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (processing) {
      timer = setInterval(() => {
        setItems(prevItems => {
          const newItems = [...prevItems];
          let totalProgress = 0;
          let changed = false;
          
          newItems.forEach(item => {
            if (item.status === 'processing' && item.progress < 100) {
              item.progress += Math.floor(Math.random() * 5) + 1;
              changed = true;
              
              if (item.progress >= 100) {
                item.progress = 100;
                item.status = 'completed';
                item.endTime = new Date();
              }
            } else if (item.status === 'waiting' && !newItems.some(i => i.status === 'processing')) {
              item.status = 'processing';
              item.startTime = new Date();
              changed = true;
            }
            
            totalProgress += item.progress;
          });
          
          if (changed) {
            setOverallProgress(Math.floor(totalProgress / newItems.length));
          }
          
          // Check if all items are processed
          if (!newItems.some(item => item.status === 'processing' || item.status === 'waiting')) {
            setProcessing(false);
          }
          
          return changed ? newItems : prevItems;
        });
      }, 500);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [processing]);
  
  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };
  
  const toggleProcessing = () => {
    setProcessing(!processing);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'primary';
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
      case 'waiting': return <InfoIcon fontSize="small" />;
      case 'error': return <ErrorIcon fontSize="small" />;
      case 'paused': return <PauseIcon fontSize="small" />;
      default: return <InfoIcon fontSize="small" />;
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  const formatDuration = (startTime?: Date, endTime?: Date) => {
    if (!startTime) return '-';
    const end = endTime || new Date();
    const seconds = Math.floor((end.getTime() - startTime.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} sec`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };
  
  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Batch Processing Progress</Typography>
        <Button 
          variant="contained" 
          color={processing ? "warning" : "primary"}
          startIcon={processing ? <PauseIcon /> : <PlayArrow />}
          onClick={toggleProcessing}
        >
          {processing ? "Pause Processing" : "Start Processing"}
        </Button>
      </Box>
      
      <Box sx={{ mt: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="textSecondary">
            Overall Progress ({overallProgress}%)
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {items.filter(i => i.status === 'completed').length} of {items.length} files completed
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={overallProgress} 
          sx={{ height: 10, borderRadius: 5 }} 
        />
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mt: 2 }}>
        {items.map((item) => (
          <Card key={item.id} sx={{ mb: 2, borderLeft: `4px solid ${item.status === 'completed' ? '#4caf50' : item.status === 'error' ? '#f44336' : item.status === 'paused' ? '#ff9800' : item.status === 'processing' ? '#2196f3' : '#9e9e9e'}` }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {item.filename}
                    </Typography>
                    <Chip 
                      size="small" 
                      label={item.status.toUpperCase()}
                      color={getStatusColor(item.status) as any}
                      icon={getStatusIcon(item.status)}
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {item.fileType.toUpperCase()} • {formatFileSize(item.fileSize)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ flexGrow: 1, mr: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={item.progress} 
                        color={
                          item.status === 'completed' ? 'success' : 
                          item.status === 'error' ? 'error' : 
                          item.status === 'paused' ? 'warning' : 'primary'
                        }
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                        <Typography variant="caption">
                          {item.startTime && `Started: ${item.startTime.toLocaleTimeString()}`}
                        </Typography>
                        <Typography variant="caption">
                          {item.startTime && `Duration: ${formatDuration(item.startTime, item.endTime)}`}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton size="small" onClick={() => toggleExpand(item.id)}>
                      {expanded === item.id ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Box>
                </Grid>
                
                {expanded === item.id && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Processing Details:</Typography>
                      {item.error && (
                        <Box sx={{ mb: 1, p: 1, bgcolor: '#ffebee', borderRadius: 1, border: '1px solid #ffcdd2' }}>
                          <Typography variant="body2" color="error">
                            <ErrorIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                            {item.error}
                          </Typography>
                        </Box>
                      )}
                      {item.details ? (
                        <ul style={{ margin: '0', paddingLeft: '20px' }}>
                          {item.details.map((detail, index) => (
                            <li key={index}>
                              <Typography variant="body2">{detail}</Typography>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No processing details available
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Paper>
  );
}; 