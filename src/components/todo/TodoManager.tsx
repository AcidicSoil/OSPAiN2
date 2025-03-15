import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Checkbox, 
  Chip, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  FormControl, 
  Grid, 
  IconButton, 
  InputLabel, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemSecondaryAction, 
  ListItemText, 
  MenuItem, 
  Paper, 
  Select, 
  SelectChangeEvent, 
  Stack, 
  Tab, 
  Tabs, 
  TextField, 
  Typography,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Flag as FlagIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import { useTodoStore, TodoItem } from '../../services/todo';
import LinearProgressWithLabel from './LinearProgressWithLabel';
import { useNotion } from '../../context/NotionContext';
import { NotionTask } from '../../services/NotionService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

function priorityToColor(priority: number): string {
  switch (priority) {
    case 1: return 'info';
    case 2: return 'success';
    case 3: return 'warning';
    case 4: return 'error';
    case 5: return 'secondary';
    default: return 'default';
  }
}

export const TodoManager: React.FC = () => {
  const { 
    tasks, 
    stats, 
    isLoading, 
    fetchTasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    refreshData 
  } = useTodoStore();

  // Notion integration
  const { 
    isConnected: isNotionConnected, 
    isLoading: isNotionLoading, 
    tasks: notionTasks,
    syncTasks,
    checkConnection,
    refreshTasks 
  } = useNotion();

  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTodo, setCurrentTodo] = useState<Partial<TodoItem>>({
    title: '',
    description: '',
    priority: 3,
    category: 'General',
    status: 'not-started',
    tags: []
  });
  const [tabValue, setTabValue] = useState(0);
  const [tagInput, setTagInput] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>(['General']);
  
  // Notion state
  const [notionConfigOpen, setNotionConfigOpen] = useState(false);
  const [notionSyncInProgress, setNotionSyncInProgress] = useState(false);
  const [notionAlert, setNotionAlert] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const completionPercentage = stats.overallProgress;

  useEffect(() => {
    // Fetch tasks on component mount
    fetchTasks();
    
    // Extract unique categories from tasks
    const uniqueCategories = ['All', ...new Set(tasks.map(todo => todo.category || 'General').filter(Boolean))];
    setCategories(uniqueCategories);
    
    // Set up refresh interval
    const intervalId = setInterval(() => {
      refreshData();
    }, 300000); // 5 minute refresh
    
    return () => clearInterval(intervalId);
  }, [fetchTasks, refreshData, tasks]);

  // Check Notion connection on mount
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleClickOpen = () => {
    setOpen(true);
    setEditMode(false);
    setCurrentTodo({
      title: '',
      description: '',
      priority: 3,
      category: 'General',
      status: 'not-started',
      tags: []
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEdit = (todo: TodoItem) => {
    setCurrentTodo({...todo});
    setEditMode(true);
    setOpen(true);
  };

  const handleSave = () => {
    if (!currentTodo.title) return;

    if (editMode && currentTodo.id) {
      updateTask(currentTodo as TodoItem);
    } else {
      addTask(currentTodo as Omit<TodoItem, 'id' | 'dateCreated'>);
    }
    setOpen(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setCurrentTodo({ ...currentTodo, [name]: value });
  };

  const handleSelectChange = (event: SelectChangeEvent<unknown>) => {
    const { name, value } = event.target;
    setCurrentTodo({ ...currentTodo, [name]: value });
  };

  const handleFilterChange = (event: SelectChangeEvent<unknown>) => {
    setFilterCategory(event.target.value as string);
  };

  const handleTagAdd = () => {
    if (!tagInput.trim()) return;
    const newTags = [...(currentTodo.tags || []), tagInput.trim()];
    setCurrentTodo({ ...currentTodo, tags: newTags });
    setTagInput('');
  };

  const handleTagDelete = (tagToDelete: string) => {
    const newTags = (currentTodo.tags || []).filter(tag => tag !== tagToDelete);
    setCurrentTodo({ ...currentTodo, tags: newTags });
  };

  const handleToggleStatus = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'not-started' : 'completed';
    updateTask({...task, status: newStatus});
  };

  const filteredTasks = tasks.filter(todo => {
    if (filterCategory === 'All') return true;
    return todo.category === filterCategory;
  });

  const activeTasks = filteredTasks.filter(todo => todo.status !== 'completed');
  const completedTasks = filteredTasks.filter(todo => todo.status === 'completed');

  // Notion handling functions
  const handleOpenNotionConfig = () => {
    setNotionConfigOpen(true);
  };

  const handleCloseNotionConfig = () => {
    setNotionConfigOpen(false);
  };

  const handleSyncWithNotion = async () => {
    try {
      setNotionSyncInProgress(true);
      
      // Check connection first
      const connected = await checkConnection();
      if (!connected) {
        setNotionAlert({
          open: true,
          message: 'Not connected to Notion. Please configure the Notion integration.',
          severity: 'error'
        });
        return;
      }
      
      // Convert local tasks to Notion format
      const tasksToSync: NotionTask[] = tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        completed: task.status === 'completed',
        dueDate: task.dueDate,
        source: 'notion'
      }));
      
      // Sync tasks with Notion
      const result = await syncTasks(tasksToSync);
      
      if (result.success) {
        // Refresh local tasks with any from Notion
        if (result.tasks && result.tasks.length > 0) {
          // Convert Notion tasks to local format and add/update
          result.tasks.forEach(notionTask => {
            if (!tasks.some(t => t.id === notionTask.id)) {
              // This is a new task from Notion
              addTask({
                id: notionTask.id,
                title: notionTask.title,
                description: notionTask.description || '',
                status: notionTask.completed ? 'completed' : 'in-progress',
                priority: 3, // default priority
                category: 'Notion',
                tags: ['notion'],
                dueDate: notionTask.dueDate,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            } else {
              // Update existing task
              updateTask(notionTask.id, {
                title: notionTask.title,
                description: notionTask.description || '',
                status: notionTask.completed ? 'completed' : 'in-progress',
                updatedAt: new Date().toISOString()
              });
            }
          });
        }
        
        setNotionAlert({
          open: true,
          message: 'Successfully synced tasks with Notion!',
          severity: 'success'
        });
      } else {
        setNotionAlert({
          open: true,
          message: result.error || 'Failed to sync with Notion',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error syncing with Notion:', error);
      setNotionAlert({
        open: true,
        message: 'Error syncing with Notion',
        severity: 'error'
      });
    } finally {
      setNotionSyncInProgress(false);
    }
  };

  const handleCloseAlert = () => {
    setNotionAlert({
      ...notionAlert,
      open: false
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>Loading tasks...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div">
            Task Management
          </Typography>
          
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleClickOpen}
              sx={{ mr: 1 }}
            >
              Add Task
            </Button>
            
            <Button
              variant={isNotionConnected ? "contained" : "outlined"}
              color={isNotionConnected ? "success" : "primary"}
              startIcon={notionSyncInProgress ? <CircularProgress size={20} /> : <SyncIcon />}
              onClick={isNotionConnected ? handleSyncWithNotion : handleOpenNotionConfig}
              disabled={notionSyncInProgress}
            >
              {isNotionConnected ? "Sync with Notion" : "Setup Notion"}
            </Button>
          </Box>
        </Stack>
        
        <LinearProgressWithLabel value={completionPercentage} />
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="todo tabs">
          <Tab label={`Active (${activeTasks.length})`} />
          <Tab label={`Completed (${completedTasks.length})`} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <List>
          {activeTasks.length === 0 ? (
            <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
              No active tasks. Add a new task to get started!
            </Typography>
          ) : (
            activeTasks
              .sort((a, b) => b.priority - a.priority)
              .map((todo) => (
                <Card key={todo.id} sx={{ mb: 1 }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <ListItem
                      secondaryAction={
                        <Box>
                          <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(todo)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton edge="end" aria-label="delete" onClick={() => deleteTask(todo.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={todo.status === 'completed'}
                          onChange={() => handleToggleStatus(todo.id)}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">{todo.title}</Typography>
                            <Chip 
                              size="small" 
                              icon={<FlagIcon />} 
                              label={`P${todo.priority}`} 
                              color={priorityToColor(todo.priority) as any}
                            />
                            {todo.category && (
                              <Chip size="small" label={todo.category} />
                            )}
                            {todo.status !== 'not-started' && todo.status !== 'completed' && (
                              <Chip 
                                size="small" 
                                label={todo.status.replace('-', ' ')} 
                                color={todo.status === 'in-progress' ? 'warning' : 'info'}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {todo.description}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              {todo.tags?.map((tag) => (
                                <Chip
                                  key={tag}
                                  label={tag}
                                  size="small"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              ))}
                            </Box>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  </CardContent>
                </Card>
              ))
          )}
        </List>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <List>
          {completedTasks.length === 0 ? (
            <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
              No completed tasks yet.
            </Typography>
          ) : (
            completedTasks.map((todo) => (
              <Card key={todo.id} sx={{ mb: 1, opacity: 0.7 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <ListItem
                    secondaryAction={
                      <Box>
                        <IconButton edge="end" aria-label="delete" onClick={() => deleteTask(todo.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={todo.status === 'completed'}
                        onChange={() => handleToggleStatus(todo.id)}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ textDecoration: 'line-through' }}
                          >
                            {todo.title}
                          </Typography>
                          <Chip 
                            size="small" 
                            icon={<FlagIcon />} 
                            label={`P${todo.priority}`} 
                            color={priorityToColor(todo.priority) as any}
                          />
                        </Box>
                      }
                      secondary={
                        todo.description && (
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                            sx={{ textDecoration: 'line-through' }}
                          >
                            {todo.description}
                          </Typography>
                        )
                      }
                    />
                  </ListItem>
                </CardContent>
              </Card>
            ))
          )}
        </List>
      </TabPanel>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="title"
                name="title"
                label="Title"
                value={currentTodo.title}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                value={currentTodo.description}
                onChange={handleInputChange}
                variant="outlined"
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  id="priority"
                  name="priority"
                  value={currentTodo.priority}
                  label="Priority"
                  onChange={handleSelectChange}
                >
                  <MenuItem value={1}>Low (P1)</MenuItem>
                  <MenuItem value={2}>Medium-Low (P2)</MenuItem>
                  <MenuItem value={3}>Medium (P3)</MenuItem>
                  <MenuItem value={4}>High (P4)</MenuItem>
                  <MenuItem value={5}>Critical (P5)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={currentTodo.status}
                  label="Status"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="not-started">Not Started</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="blocked">Blocked</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="recurring">Recurring</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  value={currentTodo.category}
                  label="Category"
                  onChange={handleSelectChange}
                >
                  {categories.filter(c => c !== 'All').map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                  <MenuItem value="New">
                    <em>+ Add New Category</em>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Tags
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleTagAdd();
                      e.preventDefault();
                    }
                  }}
                  placeholder="Add tag"
                  sx={{ flexGrow: 1 }}
                />
                <Button variant="outlined" onClick={handleTagAdd}>
                  Add
                </Button>
              </Stack>
              <Box sx={{ mt: 1 }}>
                {currentTodo.tags?.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleTagDelete(tag)}
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!currentTodo.title}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={notionConfigOpen} onClose={handleCloseNotionConfig}>
        <DialogTitle>Notion Integration</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Connection Status: {isNotionConnected ? 'Connected' : 'Not Connected'}
            </Typography>
            
            <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
              To configure Notion integration:
            </Typography>
            
            <ol>
              <li>Create a Notion integration at <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer">https://www.notion.so/my-integrations</a></li>
              <li>Get your API key and add it to the .env file in the Notion MCP server</li>
              <li>Share your Notion database with the integration</li>
              <li>Add your database ID to the .env file</li>
              <li>Restart the Notion MCP server</li>
            </ol>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              Tasks synced with Notion will be tagged with the "notion" tag for easy identification.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNotionConfig}>Close</Button>
          <Button 
            onClick={async () => {
              await checkConnection();
              if (isNotionConnected) {
                handleSyncWithNotion();
              }
            }} 
            color="primary"
            disabled={isNotionLoading || !isNotionConnected}
          >
            Test Connection
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={notionAlert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={notionAlert.severity}>
          {notionAlert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TodoManager; 