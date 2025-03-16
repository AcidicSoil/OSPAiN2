import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Switch, 
  FormControlLabel,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Box,
  Divider,
  InputAdornment,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  InfoOutlined, 
  VisibilityOutlined, 
  VisibilityOffOutlined,
  SettingsOutlined,
  SyncOutlined 
} from '@mui/icons-material';
import { useNotion } from '../../contexts/NotionContext';
import { NotionConfig } from '../../services/NotionService';

interface NotionConfigDialogProps {
  open: boolean;
  onClose: () => void;
}

const NotionConfigDialog: React.FC<NotionConfigDialogProps> = ({ open, onClose }) => {
  const notion = useNotion();
  
  // Form state
  const [apiKey, setApiKey] = useState<string>('');
  const [databaseId, setDatabaseId] = useState<string>('');
  const [autoSync, setAutoSync] = useState<boolean>(false);
  const [syncInterval, setSyncInterval] = useState<number>(15);
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  
  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState<boolean>(false);
  
  // Load current configuration
  useEffect(() => {
    if (open && notion.config) {
      setApiKey(notion.config.apiKey || '');
      setDatabaseId(notion.config.databaseId || '');
      setAutoSync(notion.config.autoSync || false);
      setSyncInterval(notion.config.syncInterval || 15);
    }
  }, [open, notion.config]);
  
  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setTestResult(null);
      setIsLoading(false);
    }
  }, [open]);
  
  // Handle save
  const handleSave = async () => {
    if (!apiKey || !databaseId) {
      setTestResult({
        success: false,
        message: 'API Key and Database ID are required'
      });
      return;
    }
    
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const newConfig: NotionConfig = {
        apiKey,
        databaseId,
        autoSync,
        syncInterval: Math.max(5, syncInterval), // Minimum 5 minutes
        mappings: notion.config?.mappings || {}
      };
      
      const success = await notion.updateConfig(newConfig);
      
      if (success) {
        setTestResult({
          success: true,
          message: 'Configuration saved successfully!'
        });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setTestResult({
          success: false,
          message: 'Failed to save configuration. Please check your settings.'
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'An error occurred while saving configuration'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Test connection
  const handleTestConnection = async () => {
    if (!apiKey || !databaseId) {
      setTestResult({
        success: false,
        message: 'API Key and Database ID are required'
      });
      return;
    }
    
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const testConfig: NotionConfig = {
        apiKey,
        databaseId,
        autoSync,
        syncInterval,
        mappings: notion.config?.mappings || {}
      };
      
      const success = await notion.testConnection(testConfig);
      
      if (success) {
        setTestResult({
          success: true,
          message: 'Connection successful! You can now save your configuration.'
        });
      } else {
        setTestResult({
          success: false,
          message: notion.status.error || 'Connection failed. Please check your settings.'
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'Failed to test connection'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset state when closed
  const handleClose = () => {
    setTestResult(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="notion-config-dialog-title"
    >
      <DialogTitle id="notion-config-dialog-title">
        Notion Integration Settings
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* API Key Field */}
          <TextField
            label="Notion API Key"
            fullWidth
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            type={showApiKey ? 'text' : 'password'}
            variant="outlined"
            required
            disabled={isLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowApiKey(!showApiKey)}
                    edge="end"
                    aria-label="toggle api key visibility"
                  >
                    {showApiKey ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            helperText="Get your API key from notion.so/my-integrations"
          />
          
          {/* Database ID Field */}
          <TextField
            label="Notion Database ID"
            fullWidth
            value={databaseId}
            onChange={(e) => setDatabaseId(e.target.value)}
            variant="outlined"
            required
            disabled={isLoading}
            helperText="The ID from your Notion database URL"
          />
          
          {/* Divider and Advanced Settings */}
          <Box sx={{ mt: 2 }}>
            <Button
              startIcon={<SettingsOutlined />}
              onClick={() => setAdvancedOpen(!advancedOpen)}
              color="primary"
              sx={{ mb: 1 }}
            >
              {advancedOpen ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
            </Button>
            
            {advancedOpen && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Divider />
                
                {/* Auto Sync Setting */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoSync}
                      onChange={(e) => setAutoSync(e.target.checked)}
                      disabled={isLoading}
                    />
                  }
                  label="Auto-Sync with Notion"
                />
                
                {/* Sync Interval */}
                {autoSync && (
                  <TextField
                    label="Sync Interval (minutes)"
                    type="number"
                    value={syncInterval}
                    onChange={(e) => setSyncInterval(parseInt(e.target.value, 10) || 15)}
                    variant="outlined"
                    disabled={isLoading || !autoSync}
                    InputProps={{
                      inputProps: { min: 5, max: 120 }
                    }}
                  />
                )}
              </Stack>
            )}
          </Box>
          
          {/* Connection Test Result */}
          {testResult && (
            <Alert 
              severity={testResult.success ? 'success' : 'error'}
              sx={{ mt: 2 }}
            >
              {testResult.message}
            </Alert>
          )}
          
          {/* Connection Status */}
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Connection Status: {notion.status.isConnected ? 'Connected' : 'Disconnected'}
              {notion.status.lastSynced && (
                <>
                  {' · Last Synced: '}
                  {new Date(notion.status.lastSynced).toLocaleString()}
                </>
              )}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} color="inherit" disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          onClick={handleTestConnection} 
          color="info" 
          startIcon={isLoading ? <CircularProgress size={16} /> : <InfoOutlined />}
          disabled={isLoading || !apiKey || !databaseId}
        >
          Test Connection
        </Button>
        <Button 
          onClick={handleSave} 
          color="primary" 
          startIcon={isLoading ? <CircularProgress size={16} /> : <SyncOutlined />}
          disabled={isLoading || !apiKey || !databaseId}
        >
          Save Configuration
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotionConfigDialog; 