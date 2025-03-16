import React, { useState } from 'react';
import { 
  Box, 
  Chip, 
  Tooltip, 
  IconButton, 
  Menu, 
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Badge,
  CircularProgress
} from '@mui/material';
import { 
  SyncOutlined, 
  SettingsOutlined, 
  CloudOffOutlined, 
  ErrorOutlineOutlined,
  CloudDoneOutlined,
  MoreVertOutlined
} from '@mui/icons-material';
import { useNotion } from '../../contexts/NotionContext';

interface NotionSyncStatusProps {
  showLabel?: boolean;
  variant?: 'default' | 'compact';
  onConfigOpen?: () => void;
  onSyncClick?: () => void;
  disableSync?: boolean;
  disableConfig?: boolean;
  size?: 'small' | 'medium';
}

const NotionSyncStatus: React.FC<NotionSyncStatusProps> = ({
  showLabel = true,
  variant = 'default',
  onConfigOpen,
  onSyncClick,
  disableSync = false,
  disableConfig = false,
  size = 'medium'
}) => {
  const notion = useNotion();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Determine icon and color based on status
  const getStatusInfo = () => {
    if (notion.isSyncing) {
      return {
        icon: <CircularProgress size={16} color="inherit" />,
        color: 'primary',
        label: 'Syncing...',
        tooltip: 'Currently syncing with Notion'
      };
    }
    
    if (!notion.config) {
      return {
        icon: <CloudOffOutlined fontSize="small" />,
        color: 'default',
        label: 'Not Configured',
        tooltip: 'Notion integration is not configured'
      };
    }
    
    if (!notion.status.isConnected) {
      return {
        icon: <ErrorOutlineOutlined fontSize="small" />,
        color: 'error',
        label: 'Disconnected',
        tooltip: notion.status.error || 'Failed to connect to Notion'
      };
    }
    
    if (notion.status.lastSynced) {
      return {
        icon: <CloudDoneOutlined fontSize="small" />,
        color: 'success',
        label: 'Synced',
        tooltip: `Last synced: ${new Date(notion.status.lastSynced).toLocaleString()}`
      };
    }
    
    return {
      icon: <SyncOutlined fontSize="small" />,
      color: 'warning',
      label: 'Not Synced',
      tooltip: 'Connected but not yet synced with Notion'
    };
  };
  
  const statusInfo = getStatusInfo();
  
  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchor(null);
  };
  
  // Handle sync click
  const handleSyncClick = () => {
    if (onSyncClick) {
      onSyncClick();
    }
    handleMenuClose();
  };
  
  // Handle config click
  const handleConfigClick = () => {
    if (onConfigOpen) {
      onConfigOpen();
    }
    handleMenuClose();
  };
  
  // Render compact variant
  if (variant === 'compact') {
    return (
      <Tooltip title={statusInfo.tooltip}>
        <IconButton
          color={statusInfo.color as any}
          size={size}
          onClick={handleMenuOpen}
          disabled={notion.isSyncing}
        >
          {notion.lastSyncResult && !notion.lastSyncResult.success ? (
            <Badge badgeContent="!" color="error">
              {statusInfo.icon}
            </Badge>
          ) : (
            statusInfo.icon
          )}
        </IconButton>
      </Tooltip>
    );
  }
  
  // Render default variant
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title={statusInfo.tooltip}>
        <Chip
          icon={statusInfo.icon}
          label={showLabel ? statusInfo.label : undefined}
          color={statusInfo.color as any}
          size={size}
          onClick={onSyncClick && !disableSync ? onSyncClick : undefined}
          sx={{ 
            minWidth: showLabel ? 'auto' : 32, 
            height: size === 'small' ? 24 : 32,
            cursor: (onSyncClick && !disableSync) ? 'pointer' : 'default'
          }}
        />
      </Tooltip>
      
      <IconButton 
        size={size} 
        onClick={handleMenuOpen} 
        disabled={notion.isSyncing}
      >
        <MoreVertOutlined fontSize={size} />
      </IconButton>
      
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem 
          onClick={handleSyncClick} 
          disabled={disableSync || notion.isSyncing || !notion.status.isConnected}
        >
          <ListItemIcon>
            <SyncOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            Sync with Notion
          </ListItemText>
        </MenuItem>
        
        <MenuItem 
          onClick={handleConfigClick}
          disabled={disableConfig || notion.isSyncing}
        >
          <ListItemIcon>
            <SettingsOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            Configure Notion
          </ListItemText>
        </MenuItem>
        
        {notion.status.lastSynced && (
          <MenuItem disabled>
            <ListItemText>
              <Typography variant="body2" color="text.secondary">
                Last synced: {new Date(notion.status.lastSynced).toLocaleString()}
              </Typography>
            </ListItemText>
          </MenuItem>
        )}
        
        {notion.lastSyncResult && (
          <MenuItem disabled>
            <ListItemText>
              <Typography variant="body2" color="text.secondary">
                {notion.lastSyncResult.success 
                  ? `${notion.lastSyncResult.syncedCount} tasks synced` 
                  : notion.lastSyncResult.error
                }
              </Typography>
            </ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default NotionSyncStatus; 