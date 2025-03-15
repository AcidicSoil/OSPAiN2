import React, { useState, useRef, useCallback } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Grid, 
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  CircularProgress
} from '@mui/material';
import { 
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  PlayArrow as StartIcon,
  Info as InfoIcon,
  FilePresent as FileIcon
} from '@mui/icons-material';
import { BatchProcessingProgressComponent } from './BatchProcessingProgress';
import { BatchProcessingProgress, BatchProcessingOptions } from '../../services/knowledgeGraph/BatchProcessor';
import { Document } from '../../services/knowledgeGraph/types';

interface BatchDocumentImportProps {
  onImport?: (documents: Document[], options: BatchProcessingOptions) => Promise<void>;
  onStart?: () => Promise<void>;
  onStop?: () => Promise<void>;
  onPause?: () => Promise<void>;
  onResume?: () => Promise<void>;
  isProcessing?: boolean;
  isPaused?: boolean;
  progress?: BatchProcessingProgress;
}

export const BatchDocumentImport: React.FC<BatchDocumentImportProps> = ({
  onImport,
  onStart,
  onStop,
  onPause,
  onResume,
  isProcessing = false,
  isPaused = false,
  progress
}) => {
  // File upload state
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Processing options state
  const [showOptions, setShowOptions] = useState(false);
  const [batchSize, setBatchSize] = useState(10);
  const [concurrency, setConcurrency] = useState(2);
  const [retryCount, setRetryCount] = useState(3);
  const [retryDelay, setRetryDelay] = useState(1000);
  const [timeout, setTimeout] = useState(30000);
  const [parseFormat, setParseFormat] = useState('json');
  const [extractEntities, setExtractEntities] = useState(true);
  
  // Document parsing state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [parseProgress, setParseProgress] = useState(0);
  const [isParsing, setIsParsing] = useState(false);
  
  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      
      // Reset the input value so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Remove a file from the list
  const handleRemoveFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  // Clear all files
  const handleClearFiles = () => {
    setFiles([]);
    setDocuments([]);
    setUploadError(null);
  };
  
  // Parse files into documents
  const parseFiles = async () => {
    if (files.length === 0) {
      setUploadError('No files selected');
      return;
    }
    
    setIsParsing(true);
    setParseProgress(0);
    setUploadError(null);
    
    try {
      const parsedDocuments: Document[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        // Create a promise to handle the file reading
        const fileContent = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = (e) => reject(new Error('Error reading file'));
          reader.readAsText(file);
        });
        
        // Parse the file content based on format
        try {
          if (parseFormat === 'json') {
            // Handle JSON format
            const jsonData = JSON.parse(fileContent);
            
            // Handle array of documents or single document
            const docsToAdd = Array.isArray(jsonData) ? jsonData : [jsonData];
            
            // Validate and transform documents
            docsToAdd.forEach(doc => {
              // Ensure each document has required fields
              if (!doc.title && !doc.content) {
                throw new Error(`Document in ${file.name} is missing required fields (title or content)`);
              }
              
              // Add document with file metadata
              parsedDocuments.push({
                ...doc,
                id: doc.id || `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                source: doc.source || file.name,
                timestamp: doc.timestamp || new Date().toISOString()
              });
            });
          } else if (parseFormat === 'csv') {
            // Handle CSV format
            const lines = fileContent.split('\n');
            if (lines.length < 2) {
              throw new Error(`CSV file ${file.name} has insufficient data`);
            }
            
            // Parse header
            const headers = lines[0].split(',').map(h => h.trim());
            
            // Validate required headers
            if (!headers.includes('title') && !headers.includes('content')) {
              throw new Error(`CSV file ${file.name} is missing required headers (title or content)`);
            }
            
            // Parse each line
            for (let j = 1; j < lines.length; j++) {
              if (!lines[j].trim()) continue;
              
              const values = lines[j].split(',').map(v => v.trim());
              if (values.length !== headers.length) {
                continue; // Skip malformed lines
              }
              
              // Create document from CSV line
              const doc: any = {};
              headers.forEach((header, index) => {
                doc[header] = values[index];
              });
              
              // Add document with file metadata
              parsedDocuments.push({
                ...doc,
                id: doc.id || `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                source: doc.source || file.name,
                timestamp: doc.timestamp || new Date().toISOString()
              });
            }
          } else if (parseFormat === 'text') {
            // Handle plain text format (one document per file)
            parsedDocuments.push({
              id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              title: file.name,
              content: fileContent,
              source: file.name,
              timestamp: new Date().toISOString()
            });
          }
        } catch (error) {
          throw new Error(`Error parsing file ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
        
        // Update progress
        setParseProgress(((i + 1) / files.length) * 100);
      }
      
      setDocuments(parsedDocuments);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsParsing(false);
      setParseProgress(100);
    }
  };
  
  // Start import process
  const handleStartImport = async () => {
    if (documents.length === 0) {
      setUploadError('No documents to import');
      return;
    }
    
    setUploading(true);
    setUploadError(null);
    
    try {
      // Collect processing options
      const options: BatchProcessingOptions = {
        batchSize,
        concurrency,
        retryCount,
        retryDelay,
        timeout
      };
      
      // Call the import handler
      if (onImport) {
        await onImport(documents, options);
      }
      
      // Start processing if auto-start is enabled
      if (onStart) {
        await onStart();
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : String(error));
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <Box>
      {/* File Upload Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Batch Document Import
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                border: '2px dashed #ccc', 
                borderRadius: 2, 
                p: 3, 
                textAlign: 'center',
                backgroundColor: '#f9f9f9',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#f0f0f0',
                  borderColor: 'primary.main'
                }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                multiple
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileSelect}
                accept=".json,.csv,.txt"
              />
              <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="body1" gutterBottom>
                Drag and drop files here or click to browse
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Supported formats: JSON, CSV, Text
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">
                  Selected Files ({files.length})
                </Typography>
                <Button 
                  size="small" 
                  startIcon={<DeleteIcon />} 
                  onClick={handleClearFiles}
                  disabled={files.length === 0 || isProcessing}
                >
                  Clear All
                </Button>
              </Box>
              
              {files.length === 0 ? (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                  No files selected
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 150, overflowY: 'auto' }}>
                  <Stack spacing={1}>
                    {files.map((file, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <FileIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {file.name}
                          </Typography>
                        </Box>
                        <IconButton 
                          size="small" 
                          onClick={() => handleRemoveFile(index)}
                          disabled={isProcessing}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
              
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Parse Format</InputLabel>
                  <Select
                    value={parseFormat}
                    label="Parse Format"
                    onChange={(e) => setParseFormat(e.target.value)}
                    disabled={isProcessing}
                  >
                    <MenuItem value="json">JSON</MenuItem>
                    <MenuItem value="csv">CSV</MenuItem>
                    <MenuItem value="text">Plain Text</MenuItem>
                  </Select>
                </FormControl>
                
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={parseFiles}
                  disabled={files.length === 0 || isProcessing || isParsing}
                  startIcon={isParsing ? <CircularProgress size={20} /> : undefined}
                >
                  {isParsing ? `Parsing (${Math.round(parseProgress)}%)` : 'Parse Files'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Processing Options */}
        <Box sx={{ mb: 3 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer',
              py: 1
            }}
            onClick={() => setShowOptions(!showOptions)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SettingsIcon sx={{ mr: 1 }} />
              <Typography variant="subtitle1">Processing Options</Typography>
            </Box>
            <IconButton size="small">
              {showOptions ? <InfoIcon /> : <InfoIcon />}
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          {showOptions && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Batch Size"
                  type="number"
                  fullWidth
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value) || 10)}
                  disabled={isProcessing}
                  helperText="Number of documents per batch"
                  InputProps={{ inputProps: { min: 1, max: 100 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Concurrency"
                  type="number"
                  fullWidth
                  value={concurrency}
                  onChange={(e) => setConcurrency(parseInt(e.target.value) || 2)}
                  disabled={isProcessing}
                  helperText="Number of parallel operations"
                  InputProps={{ inputProps: { min: 1, max: 10 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Retry Count"
                  type="number"
                  fullWidth
                  value={retryCount}
                  onChange={(e) => setRetryCount(parseInt(e.target.value) || 3)}
                  disabled={isProcessing}
                  helperText="Number of retries on failure"
                  InputProps={{ inputProps: { min: 0, max: 10 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Retry Delay (ms)"
                  type="number"
                  fullWidth
                  value={retryDelay}
                  onChange={(e) => setRetryDelay(parseInt(e.target.value) || 1000)}
                  disabled={isProcessing}
                  helperText="Delay between retries in milliseconds"
                  InputProps={{ inputProps: { min: 100, max: 10000, step: 100 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Timeout (ms)"
                  type="number"
                  fullWidth
                  value={timeout}
                  onChange={(e) => setTimeout(parseInt(e.target.value) || 30000)}
                  disabled={isProcessing}
                  helperText="Operation timeout in milliseconds"
                  InputProps={{ inputProps: { min: 1000, max: 120000, step: 1000 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={extractEntities}
                      onChange={(e) => setExtractEntities(e.target.checked)}
                      disabled={isProcessing}
                    />
                  }
                  label="Extract Entities"
                  sx={{ mt: 1 }}
                />
                <Typography variant="caption" color="textSecondary" display="block">
                  Automatically extract entities from documents
                </Typography>
              </Grid>
            </Grid>
          )}
        </Box>
        
        {/* Document Summary */}
        {documents.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Document Summary
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="textSecondary">Total Documents</Typography>
                  <Typography variant="h6">{documents.length}</Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Typography variant="body2" color="textSecondary">Document Types</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {Array.from(new Set(documents.map(doc => doc.type || 'unknown'))).map(type => (
                        <Chip 
                          key={type} 
                          label={type} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      ))}
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}
        
        {/* Error Display */}
        {uploadError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {uploadError}
          </Alert>
        )}
        
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <StartIcon />}
            onClick={handleStartImport}
            disabled={documents.length === 0 || isProcessing || uploading}
            sx={{ minWidth: 150 }}
          >
            {uploading ? 'Importing...' : 'Start Import'}
          </Button>
        </Box>
      </Paper>
      
      {/* Progress Display */}
      {(isProcessing || isPaused) && (
        <BatchProcessingProgressComponent
          progress={progress}
          isProcessing={isProcessing}
          isPaused={isPaused}
          onStart={onStart}
          onStop={onStop}
          onPause={onPause}
          onResume={onResume}
        />
      )}
    </Box>
  );
}; 