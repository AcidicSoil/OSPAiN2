import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Divider,
  Switch,
  FormControlLabel,
  Link,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useNotion } from '../../context/NotionContext';

interface NotionConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onConfigured: () => void;
}

const NotionConfigDialog: React.FC<NotionConfigDialogProps> = ({
  open,
  onClose,
  onConfigured,
}) => {
  const {
    isConnected,
    isConfigured,
    connectionError,
    checkConnection,
    configureDatabaseMappings,
    databaseMappings,
    isLoading,
  } = useNotion();

  const [mappings, setMappings] = useState<Record<string, string>>({
    title: 'Name',
    status: 'Status',
    priority: 'Priority',
    tags: 'Tags',
    content: 'Description',
    dueDate: 'Due Date',
    category: 'Category',
  });

  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'check' | 'configure' | 'complete'>('check');

  // Initialize with existing mappings if available
  useEffect(() => {
    if (open && databaseMappings && Object.keys(databaseMappings).length > 0) {
      setMappings({
        ...mappings,
        ...databaseMappings,
      });
    }
  }, [open, databaseMappings]);

  // Check connection when dialog opens
  useEffect(() => {
    if (open) {
      handleCheckConnection();
    }
  }, [open]);

  const handleCheckConnection = async () => {
    setConnectionStatus('checking');
    setError(null);
    
    try {
      const connected = await checkConnection();
      
      if (connected) {
        setConnectionStatus('connected');
        setStep(isConfigured ? 'complete' : 'configure');
      } else {
        setConnectionStatus('error');
        setError(connectionError?.message || 'Failed to connect to Notion. Please check your API key and database ID.');
      }
    } catch (err) {
      setConnectionStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };

  const handleMappingChange = (field: string) => (event: SelectChangeEvent) => {
    setMappings(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleConfigure = async () => {
    setError(null);
    
    try {
      const success = await configureDatabaseMappings(mappings);
      
      if (success) {
        setStep('complete');
        onConfigured();
      } else {
        setError('Failed to configure database mappings. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };

  const renderConnectionStep = () => (
    <>
      <DialogTitle>Connect to Notion</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To connect your TodoManager with Notion, make sure you have:
        </DialogContentText>
        <Box mt={2}>
          <Typography variant="subtitle2">Prerequisites:</Typography>
          <ol>
            <li>Created a Notion integration at <Link href="https://www.notion.so/my-integrations" target="_blank" rel="noopener">notion.so/my-integrations</Link></li>
            <li>Shared your database with the integration</li>
            <li>Configured the MCP server with your API key and database ID</li>
          </ol>
        </Box>
        
        {connectionStatus === 'checking' && (
          <Box display="flex" alignItems="center" justifyContent="center" my={3}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography>Checking connection to Notion...</Typography>
          </Box>
        )}
        
        {connectionStatus === 'error' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error || 'Failed to connect to Notion. Please check your settings.'}
          </Alert>
        )}
        
        {connectionStatus === 'connected' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Successfully connected to Notion!
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleCheckConnection} 
          disabled={connectionStatus === 'checking' || isLoading}
        >
          Retry Connection
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setStep('configure')} 
          disabled={connectionStatus !== 'connected'}
        >
          Next
        </Button>
      </DialogActions>
    </>
  );

  const renderConfigureStep = () => (
    <>
      <DialogTitle>Configure Database Mappings</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Map your Notion database properties to TodoManager fields. Select the Notion property name
          that corresponds to each TodoManager field.
        </DialogContentText>
        
        <Box mt={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Title Field</InputLabel>
                <Select
                  value={mappings.title}
                  label="Title Field"
                  onChange={handleMappingChange('title')}
                >
                  <MenuItem value="Name">Name</MenuItem>
                  <MenuItem value="Title">Title</MenuItem>
                  <MenuItem value="Task">Task</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status Field</InputLabel>
                <Select
                  value={mappings.status}
                  label="Status Field"
                  onChange={handleMappingChange('status')}
                >
                  <MenuItem value="Status">Status</MenuItem>
                  <MenuItem value="State">State</MenuItem>
                  <MenuItem value="Progress">Progress</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority Field</InputLabel>
                <Select
                  value={mappings.priority}
                  label="Priority Field"
                  onChange={handleMappingChange('priority')}
                >
                  <MenuItem value="Priority">Priority</MenuItem>
                  <MenuItem value="Importance">Importance</MenuItem>
                  <MenuItem value="Urgency">Urgency</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tags Field</InputLabel>
                <Select
                  value={mappings.tags}
                  label="Tags Field"
                  onChange={handleMappingChange('tags')}
                >
                  <MenuItem value="Tags">Tags</MenuItem>
                  <MenuItem value="Labels">Labels</MenuItem>
                  <MenuItem value="Categories">Categories</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Content Field</InputLabel>
                <Select
                  value={mappings.content}
                  label="Content Field"
                  onChange={handleMappingChange('content')}
                >
                  <MenuItem value="Description">Description</MenuItem>
                  <MenuItem value="Content">Content</MenuItem>
                  <MenuItem value="Notes">Notes</MenuItem>
                  <MenuItem value="Details">Details</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Due Date Field</InputLabel>
                <Select
                  value={mappings.dueDate}
                  label="Due Date Field"
                  onChange={handleMappingChange('dueDate')}
                >
                  <MenuItem value="Due Date">Due Date</MenuItem>
                  <MenuItem value="Deadline">Deadline</MenuItem>
                  <MenuItem value="Due">Due</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category Field</InputLabel>
                <Select
                  value={mappings.category}
                  label="Category Field"
                  onChange={handleMappingChange('category')}
                >
                  <MenuItem value="Category">Category</MenuItem>
                  <MenuItem value="Section">Section</MenuItem>
                  <MenuItem value="Area">Area</MenuItem>
                  <MenuItem value="Group">Group</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setStep('check')}>Back</Button>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleConfigure}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Save Mappings'}
        </Button>
      </DialogActions>
    </>
  );

  const renderCompleteStep = () => (
    <>
      <DialogTitle>Configuration Complete</DialogTitle>
      <DialogContent>
        <Alert severity="success" sx={{ mb: 2 }}>
          Your Notion database has been successfully configured!
        </Alert>
        <DialogContentText>
          You can now sync tasks between TodoManager and Notion. Tasks will be synced
          according to the field mappings you specified.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="notion-config-dialog-title"
      maxWidth="md"
      fullWidth
    >
      {step === 'check' && renderConnectionStep()}
      {step === 'configure' && renderConfigureStep()}
      {step === 'complete' && renderCompleteStep()}
    </Dialog>
  );
};

export default NotionConfigDialog; 