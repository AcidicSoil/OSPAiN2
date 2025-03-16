import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Box,
  Collapse,
  Divider,
  Tooltip,
  Link,
  Badge,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  OpenInNew as OpenInNewIcon,
  Sync as SyncIcon,
  Cloud as CloudIcon,
} from '@mui/icons-material';
import { TodoItem as TodoItemType } from '../../services/TodoTrackingService';
import { formatDistanceToNow } from 'date-fns';

interface TodoItemProps {
  item: TodoItemType;
  onEdit: (item: TodoItemType) => void;
  onDelete: (id: string) => void;
  onSync?: (item: TodoItemType) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ item, onEdit, onDelete, onSync }) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  // Render status chip with appropriate color
  const renderStatusChip = () => {
    const statusMap: Record<string, { label: string, color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' }> = {
      'not-started': { label: 'Not Started', color: 'default' },
      'in-progress': { label: 'In Progress', color: 'primary' },
      'completed': { label: 'Completed', color: 'success' },
      'blocked': { label: 'Blocked', color: 'error' },
      'recurring': { label: 'Recurring', color: 'info' },
    };

    const status = statusMap[item.status] || { label: item.status, color: 'default' };
    
    return (
      <Chip 
        label={status.label} 
        color={status.color} 
        size="small" 
        sx={{ mr: 1 }}
      />
    );
  };

  // Render priority chip
  const renderPriorityChip = () => {
    const priorityMap: Record<number, { label: string, color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' }> = {
      1: { label: 'P1', color: 'error' },
      2: { label: 'P2', color: 'warning' },
      3: { label: 'P3', color: 'info' },
      4: { label: 'P4', color: 'primary' },
      5: { label: 'P5', color: 'default' },
    };

    const priority = priorityMap[item.priority] || { label: `P${item.priority}`, color: 'default' };
    
    return (
      <Chip 
        label={priority.label} 
        color={priority.color} 
        size="small" 
        sx={{ mr: 1 }}
      />
    );
  };

  // Render horizon chip if available
  const renderHorizonChip = () => {
    if (!item.horizon) return null;
    
    const horizonMap: Record<string, { color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' }> = {
      'H1': { color: 'error' },
      'H2': { color: 'warning' },
      'H3': { color: 'info' },
    };

    const horizonColor = horizonMap[item.horizon]?.color || 'default';
    
    return (
      <Chip 
        label={item.horizon} 
        color={horizonColor} 
        size="small" 
        sx={{ mr: 1 }}
      />
    );
  };

  return (
    <Card 
      elevation={2} 
      sx={{ 
        mb: 2,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 4,
        },
        borderLeft: item.source === 'notion' ? '4px solid #2563EB' : 'none',
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {item.title}
            {item.source === 'notion' && (
              <Tooltip title="Synced with Notion">
                <CloudIcon fontSize="small" sx={{ ml: 1, verticalAlign: 'middle', color: '#2563EB' }} />
              </Tooltip>
            )}
          </Typography>
          
          <Box>
            {renderStatusChip()}
            {renderPriorityChip()}
            {renderHorizonChip()}
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', mt: 1, flexWrap: 'wrap' }}>
          {item.category && (
            <Chip 
              label={item.category} 
              variant="outlined" 
              size="small" 
              sx={{ mr: 1, mb: 1 }} 
            />
          )}
          
          {Array.isArray(item.tags) && item.tags.map((tag, index) => (
            <Chip 
              key={index} 
              label={tag} 
              variant="outlined" 
              size="small" 
              sx={{ mr: 1, mb: 1 }} 
            />
          ))}
        </Box>
        
        {/* Preview of description */}
        {item.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mt: 1, 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: expanded ? 'unset' : 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {item.description}
          </Typography>
        )}
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
        <Box>
          <IconButton size="small" onClick={() => onEdit(item)}>
            <EditIcon fontSize="small" />
          </IconButton>
          
          <IconButton size="small" onClick={() => onDelete(item.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
          
          {item.sourceUrl && (
            <Tooltip title="Open source">
              <IconButton
                size="small"
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {onSync && item.source === 'notion' && (
            <Tooltip title="Sync this item with Notion">
              <IconButton size="small" onClick={() => onSync(item)}>
                <SyncIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {item.lastUpdated && (
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              Updated {formatDistanceToNow(new Date(item.lastUpdated))} ago
            </Typography>
          )}
          
          <IconButton
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
            size="small"
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </CardActions>
      
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />
        <CardContent>
          {item.description ? (
            <Typography paragraph>{item.description}</Typography>
          ) : (
            <Typography paragraph color="text.secondary">No description available.</Typography>
          )}
          
          {item.dueDate && (
            <Typography variant="body2">
              <strong>Due Date:</strong> {new Date(item.dueDate).toLocaleDateString()}
            </Typography>
          )}
          
          {item.source === 'notion' && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="primary">
                <Link 
                  href={item.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  View in Notion
                  <OpenInNewIcon fontSize="small" sx={{ ml: 0.5 }} />
                </Link>
              </Typography>
            </Box>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default TodoItem; 