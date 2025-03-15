import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Tooltip,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Sync as SyncIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNotion } from '../../context/NotionContext';

interface NotionSyncStatusProps {
  onConfigClick?: () => void;
  onSyncClick?: () => void;
  compact?: boolean;
}

const NotionSyncStatus: React.FC<NotionSyncStatusProps> = ({
  onConfigClick,
  onSyncClick,
  compact = false,
}) => {
  const {
    isConnected,
    isConfigured,
    syncStatus,
    syncError,
    isLoading,
    lastSyncTime,
  } = useNotion();

  // Format the last sync time
  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSyncTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  // Render status chip based on connection and sync status
  const renderStatusChip = () => {
    if (!isConnected) {
      return <Chip 
        label="Not Connected" 
        color="error" 
        size={compact ? "small" : "medium"}
        icon={<ErrorIcon />} 
      />;
    }
    
    if (!isConfigured) {
      return <Chip 
        label="Not Configured" 
        color="warning" 
        size={compact ? "small" : "medium"}
        icon={<InfoIcon />} 
      />;
    }
    
    if (syncStatus === 'syncing' || isLoading) {
      return <Chip 
        label="Syncing" 
        color="info" 
        size={compact ? "small" : "medium"}
        icon={<CircularProgress size={16} />} 
      />;
    }
    
    if (syncStatus === 'error') {
      return <Chip 
        label="Sync Error" 
        color="error" 
        size={compact ? "small" : "medium"}
        icon={<ErrorIcon />} 
      />;
    }
    
    return <Chip 
      label="Connected" 
      color="success" 
      size={compact ? "small" : "medium"}
      icon={<CheckIcon />} 
    />;
  };
  
  // Compact mode just shows status icon with tooltip
  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title={`Notion: ${isConnected ? (isConfigured ? 'Connected' : 'Not Configured') : 'Not Connected'}`}>
          <Badge
            color={isConnected ? (isConfigured ? 'success' : 'warning') : 'error'}
            variant="dot"
            overlap="circular"
          >
            <IconButton 
              size="small"
              onClick={onConfigClick}
              disabled={isLoading}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Badge>
        </Tooltip>
        
        {isConnected && isConfigured && (
          <Tooltip title={`Sync with Notion (Last sync: ${formatLastSync()})`}>
            <IconButton 
              size="small" 
              onClick={onSyncClick}
              disabled={isLoading || syncStatus === 'syncing'}
              sx={{ ml: 1 }}
            >
              {syncStatus === 'syncing' || isLoading ? (
                <CircularProgress size={20} />
              ) : (
                <SyncIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        )}
      </Box>
    );
  }
  
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>Notion Status:</Typography>
          {renderStatusChip()}
        </Box>
        
        <Box>
          {isConnected && isConfigured && (
            <Tooltip title="Sync with Notion">
              <IconButton 
                onClick={onSyncClick}
                disabled={isLoading || syncStatus === 'syncing'}
                size="small"
              >
                {syncStatus === 'syncing' || isLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <SyncIcon />
                )}
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title="Configure Notion Integration">
            <IconButton 
              onClick={onConfigClick}
              disabled={isLoading}
              size="small"
              sx={{ ml: 1 }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {lastSyncTime && (
        <Typography variant="caption" color="textSecondary">
          Last synchronized: {formatLastSync()}
        </Typography>
      )}
      
      {syncError && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
          Error: {syncError}
        </Typography>
      )}
    </Paper>
  );
};

export default NotionSyncStatus; 