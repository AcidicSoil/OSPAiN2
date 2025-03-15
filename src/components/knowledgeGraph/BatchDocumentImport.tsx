import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Divider,
  Alert,
  Chip
} from '@mui/material';
import { 
  UploadFile, 
  FileCopy, 
  DeleteOutline, 
  PictureAsPdf, 
  Description, 
  Code,
  Image
} from '@mui/icons-material';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: number;
}

export const BatchDocumentImport: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      processFiles(fileList);
    }
  };

  const processFiles = (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];
    
    Array.from(fileList).forEach(file => {
      // Check file type
      if (!isValidFileType(file.type)) {
        setError(`File type not supported: ${file.name}`);
        return;
      }
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError(`File too large: ${file.name}. Maximum size is 10MB.`);
        return;
      }
      
      newFiles.push({
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      });
    });
    
    setFiles(prev => [...prev, ...newFiles]);
    setError(null);
  };

  const isValidFileType = (type: string) => {
    const validTypes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'text/csv',
      'application/json',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];
    return validTypes.includes(type);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <PictureAsPdf color="error" />;
    if (type.includes('image')) return <Image color="primary" />;
    if (type.includes('text/plain') || type.includes('markdown')) return <Description color="info" />;
    if (type.includes('json') || type.includes('csv')) return <Code color="secondary" />;
    if (type.includes('msword') || type.includes('wordprocessing')) return <FileCopy color="warning" />;
    return <Description />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const clearAllFiles = () => {
    setFiles([]);
  };

  const importFiles = () => {
    // Here we would implement the actual file processing logic
    // For now, we'll just simulate it with a console log
    console.log('Importing files:', files);
    alert(`Processing ${files.length} files. This would trigger the actual import in a real implementation.`);
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5">Batch Document Import</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Box 
        sx={{ 
          mt: 2, 
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'grey.300',
          borderRadius: 1,
          p: 3,
          backgroundColor: dragActive ? 'rgba(3, 169, 244, 0.04)' : 'transparent',
          transition: 'all 0.2s ease',
          textAlign: 'center',
          cursor: 'pointer'
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept=".pdf,.txt,.md,.csv,.json,.doc,.docx,.jpg,.jpeg,.png"
        />
        <UploadFile sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6">
          Drag & Drop Files Here
        </Typography>
        <Typography variant="body2" color="textSecondary">
          or click to browse
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Supports PDF, TXT, MD, CSV, JSON, DOC, DOCX, JPG, PNG (Max 10MB per file)
        </Typography>
      </Box>
      
      {files.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1">
              {files.length} {files.length === 1 ? 'File' : 'Files'} Selected
            </Typography>
            <Button 
              size="small" 
              startIcon={<DeleteOutline />} 
              onClick={clearAllFiles}
              color="error"
              variant="outlined"
            >
              Clear All
            </Button>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <List>
            {files.map((file) => (
              <ListItem 
                key={file.id}
                secondaryAction={
                  <Button 
                    size="small" 
                    color="error" 
                    onClick={() => removeFile(file.id)}
                  >
                    <DeleteOutline />
                  </Button>
                }
              >
                <ListItemIcon>
                  {getFileIcon(file.type)}
                </ListItemIcon>
                <ListItemText 
                  primary={file.name} 
                  secondary={
                    <>
                      {formatFileSize(file.size)} • {new Date(file.lastModified).toLocaleDateString()}
                      <Chip 
                        label={file.type.split('/')[1].toUpperCase()} 
                        size="small" 
                        sx={{ ml: 1 }} 
                        variant="outlined" 
                      />
                    </>
                  } 
                />
              </ListItem>
            ))}
          </List>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={importFiles}
              disabled={files.length === 0}
            >
              Import Files
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
}; 