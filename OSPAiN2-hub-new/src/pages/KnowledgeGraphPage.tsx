import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Paper, 
  Button,
  Grid,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import { KnowledgeGraphExplorer, BatchDocumentImport } from '../components/knowledgeGraph';
import { KnowledgeGraphService } from '../services/knowledgeGraph/KnowledgeGraphService';
import { BatchProcessor, BatchProcessingOptions, BatchProcessingProgress } from '../services/knowledgeGraph/BatchProcessor';
import { Document, Entity, Relationship } from '../services/knowledgeGraph/types';
import { LLMService } from '../services/knowledgeGraph/LLMService';
import { EmbeddingsService } from '../services/knowledgeGraph/EmbeddingsService';
import { CacheService } from '../services/knowledgeGraph/CacheService';

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`kg-tabpanel-${index}`}
      aria-labelledby={`kg-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Main page component
export const KnowledgeGraphPage: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [kgService, setKgService] = useState<KnowledgeGraphService | null>(null);
  const [batchProcessor, setBatchProcessor] = useState<BatchProcessor | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState<BatchProcessingProgress | undefined>(undefined);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, severity: 'success' | 'error' | 'info' | 'warning'} | null>(null);
  
  // Initialize services
  useEffect(() => {
    const initServices = async () => {
      try {
        // Initialize cache service
        const cacheService = new CacheService({
          persistPath: './.cache',
          maxMemoryItems: 1000,
          ttl: 24 * 60 * 60 * 1000 // 24 hours
        });
        
        // Initialize LLM service
        const llmService = new LLMService({
          provider: 'openai',
          apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
          model: 'gpt-4o',
          maxTokens: 1000,
          temperature: 0.2
        });
        
        // Initialize embeddings service
        const embeddingsService = new EmbeddingsService({
          provider: 'openai',
          apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
          model: 'text-embedding-3-small',
          dimensions: 1536,
          cacheService
        });
        
        // Initialize knowledge graph service
        const service = new KnowledgeGraphService({
          dbUrl: process.env.REACT_APP_FALKORDB_URL || 'bolt://localhost:7687',
          username: process.env.REACT_APP_FALKORDB_USERNAME || 'neo4j',
          password: process.env.REACT_APP_FALKORDB_PASSWORD || 'password',
          database: process.env.REACT_APP_FALKORDB_DATABASE || 'neo4j',
          llmService,
          embeddingsService
        });
        
        // Initialize batch processor
        const processor = new BatchProcessor(service);
        
        // Set up event listeners for batch processor
        processor.on('progress', (progressData: BatchProcessingProgress) => {
          setProgress(progressData);
        });
        
        processor.on('complete', (result) => {
          setIsProcessing(false);
          setIsPaused(false);
          setNotification({
            message: `Processing complete: ${result.stats.succeeded} succeeded, ${result.stats.failed} failed`,
            severity: result.stats.failed > 0 ? 'warning' : 'success'
          });
        });
        
        processor.on('error', (error) => {
          console.error('Batch processing error:', error);
        });
        
        setKgService(service);
        setBatchProcessor(processor);
      } catch (error) {
        console.error('Error initializing services:', error);
        setError(`Failed to initialize services: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    
    initServices();
    
    // Cleanup
    return () => {
      // Close connections if needed
    };
  }, []);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Batch processing handlers
  const handleImport = async (docs: Document[], options: BatchProcessingOptions) => {
    if (!batchProcessor) {
      throw new Error('Batch processor not initialized');
    }
    
    setDocuments(docs);
    setNotification({
      message: `Prepared ${docs.length} documents for import`,
      severity: 'info'
    });
  };
  
  const handleStartProcessing = async () => {
    if (!batchProcessor || !documents.length) {
      return;
    }
    
    try {
      setIsProcessing(true);
      setIsPaused(false);
      setError(null);
      
      // Start processing in background
      batchProcessor.processBatch(documents).catch(error => {
        console.error('Error in batch processing:', error);
        setError(`Batch processing error: ${error instanceof Error ? error.message : String(error)}`);
        setIsProcessing(false);
      });
    } catch (error) {
      setError(`Failed to start processing: ${error instanceof Error ? error.message : String(error)}`);
      setIsProcessing(false);
    }
  };
  
  const handleStopProcessing = async () => {
    if (!batchProcessor) {
      return;
    }
    
    try {
      batchProcessor.stop();
      setNotification({
        message: 'Processing stopped',
        severity: 'info'
      });
    } catch (error) {
      setError(`Failed to stop processing: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  const handlePauseProcessing = async () => {
    // Pause functionality would need to be implemented in the batch processor
    setIsPaused(true);
    setNotification({
      message: 'Processing paused',
      severity: 'info'
    });
  };
  
  const handleResumeProcessing = async () => {
    // Resume functionality would need to be implemented in the batch processor
    setIsPaused(false);
    setNotification({
      message: 'Processing resumed',
      severity: 'info'
    });
  };
  
  // Close notification
  const handleCloseNotification = () => {
    setNotification(null);
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Knowledge Graph
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Explorer" />
            <Tab label="Import" />
            <Tab label="Settings" />
          </Tabs>
          
          <TabPanel value={activeTab} index={0}>
            <KnowledgeGraphExplorer />
          </TabPanel>
          
          <TabPanel value={activeTab} index={1}>
            <BatchDocumentImport 
              onImport={handleImport}
              onStart={handleStartProcessing}
              onStop={handleStopProcessing}
              onPause={handlePauseProcessing}
              onResume={handleResumeProcessing}
              isProcessing={isProcessing}
              isPaused={isPaused}
              progress={progress}
            />
          </TabPanel>
          
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Knowledge Graph Settings
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Database Connection
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Status: {kgService ? 'Connected' : 'Disconnected'}
                      </Typography>
                      
                      <Button 
                        variant="contained" 
                        color="primary" 
                        sx={{ mt: 2 }}
                        disabled={!kgService}
                      >
                        Test Connection
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      LLM Configuration
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Provider: {process.env.REACT_APP_LLM_PROVIDER || 'openai'}
                      </Typography>
                      <Typography variant="body2">
                        Model: {process.env.REACT_APP_LLM_MODEL || 'gpt-4o'}
                      </Typography>
                      
                      <Button 
                        variant="contained" 
                        color="primary" 
                        sx={{ mt: 2 }}
                        disabled={!kgService}
                      >
                        Test LLM
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Cache Statistics
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        sx={{ mr: 2 }}
                      >
                        Clear Cache
                      </Button>
                      
                      <Button 
                        variant="outlined" 
                        color="primary"
                      >
                        Refresh Stats
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
        </Paper>
      </Box>
      
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {notification && (
          <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </Container>
  );
}; 