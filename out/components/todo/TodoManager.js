"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoManager = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const todo_1 = require("../../services/todo");
const LinearProgressWithLabel_1 = __importDefault(require("./LinearProgressWithLabel"));
const NotionContext_1 = require("../../context/NotionContext");
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (<div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <material_1.Box sx={{ pt: 2 }}>{children}</material_1.Box>}
    </div>);
}
function priorityToColor(priority) {
    switch (priority) {
        case 1: return 'info';
        case 2: return 'success';
        case 3: return 'warning';
        case 4: return 'error';
        case 5: return 'secondary';
        default: return 'default';
    }
}
const TodoManager = () => {
    const { tasks, stats, isLoading, fetchTasks, addTask, updateTask, deleteTask, refreshData } = (0, todo_1.useTodoStore)();
    // Notion integration
    const { isConnected: isNotionConnected, isLoading: isNotionLoading, tasks: notionTasks, syncTasks, checkConnection, refreshTasks } = (0, NotionContext_1.useNotion)();
    const [open, setOpen] = (0, react_1.useState)(false);
    const [editMode, setEditMode] = (0, react_1.useState)(false);
    const [currentTodo, setCurrentTodo] = (0, react_1.useState)({
        title: '',
        description: '',
        priority: 3,
        category: 'General',
        status: 'not-started',
        tags: []
    });
    const [tabValue, setTabValue] = (0, react_1.useState)(0);
    const [tagInput, setTagInput] = (0, react_1.useState)('');
    const [filterCategory, setFilterCategory] = (0, react_1.useState)('All');
    const [categories, setCategories] = (0, react_1.useState)(['General']);
    // Notion state
    const [notionConfigOpen, setNotionConfigOpen] = (0, react_1.useState)(false);
    const [notionSyncInProgress, setNotionSyncInProgress] = (0, react_1.useState)(false);
    const [notionAlert, setNotionAlert] = (0, react_1.useState)({
        open: false,
        message: '',
        severity: 'info'
    });
    const completionPercentage = stats.overallProgress;
    (0, react_1.useEffect)(() => {
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
    (0, react_1.useEffect)(() => {
        checkConnection();
    }, [checkConnection]);
    const handleTabChange = (_event, newValue) => {
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
    const handleEdit = (todo) => {
        setCurrentTodo({ ...todo });
        setEditMode(true);
        setOpen(true);
    };
    const handleSave = () => {
        if (!currentTodo.title)
            return;
        if (editMode && currentTodo.id) {
            updateTask(currentTodo);
        }
        else {
            addTask(currentTodo);
        }
        setOpen(false);
    };
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setCurrentTodo({ ...currentTodo, [name]: value });
    };
    const handleSelectChange = (event) => {
        const { name, value } = event.target;
        setCurrentTodo({ ...currentTodo, [name]: value });
    };
    const handleFilterChange = (event) => {
        setFilterCategory(event.target.value);
    };
    const handleTagAdd = () => {
        if (!tagInput.trim())
            return;
        const newTags = [...(currentTodo.tags || []), tagInput.trim()];
        setCurrentTodo({ ...currentTodo, tags: newTags });
        setTagInput('');
    };
    const handleTagDelete = (tagToDelete) => {
        const newTags = (currentTodo.tags || []).filter(tag => tag !== tagToDelete);
        setCurrentTodo({ ...currentTodo, tags: newTags });
    };
    const handleToggleStatus = (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task)
            return;
        const newStatus = task.status === 'completed' ? 'not-started' : 'completed';
        updateTask({ ...task, status: newStatus });
    };
    const filteredTasks = tasks.filter(todo => {
        if (filterCategory === 'All')
            return true;
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
            const tasksToSync = tasks.map(task => ({
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
                        }
                        else {
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
            }
            else {
                setNotionAlert({
                    open: true,
                    message: result.error || 'Failed to sync with Notion',
                    severity: 'error'
                });
            }
        }
        catch (error) {
            console.error('Error syncing with Notion:', error);
            setNotionAlert({
                open: true,
                message: 'Error syncing with Notion',
                severity: 'error'
            });
        }
        finally {
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
        return (<material_1.Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <material_1.Typography>Loading tasks...</material_1.Typography>
      </material_1.Box>);
    }
    return (<material_1.Box sx={{ width: '100%', height: '100%' }}>
      <material_1.Paper sx={{ p: 2, mb: 2 }}>
        <material_1.Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <material_1.Typography variant="h6" component="div">
            Task Management
          </material_1.Typography>
          
          <material_1.Box>
            <material_1.Button variant="contained" color="primary" startIcon={<icons_material_1.Add />} onClick={handleClickOpen} sx={{ mr: 1 }}>
              Add Task
            </material_1.Button>
            
            <material_1.Button variant={isNotionConnected ? "contained" : "outlined"} color={isNotionConnected ? "success" : "primary"} startIcon={notionSyncInProgress ? <material_1.CircularProgress size={20}/> : <icons_material_1.Sync />} onClick={isNotionConnected ? handleSyncWithNotion : handleOpenNotionConfig} disabled={notionSyncInProgress}>
              {isNotionConnected ? "Sync with Notion" : "Setup Notion"}
            </material_1.Button>
          </material_1.Box>
        </material_1.Stack>
        
        <LinearProgressWithLabel_1.default value={completionPercentage}/>
      </material_1.Paper>

      <material_1.Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <material_1.Tabs value={tabValue} onChange={handleTabChange} aria-label="todo tabs">
          <material_1.Tab label={`Active (${activeTasks.length})`}/>
          <material_1.Tab label={`Completed (${completedTasks.length})`}/>
        </material_1.Tabs>
      </material_1.Box>

      <TabPanel value={tabValue} index={0}>
        <material_1.List>
          {activeTasks.length === 0 ? (<material_1.Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
              No active tasks. Add a new task to get started!
            </material_1.Typography>) : (activeTasks
            .sort((a, b) => b.priority - a.priority)
            .map((todo) => (<material_1.Card key={todo.id} sx={{ mb: 1 }}>
                  <material_1.CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <material_1.ListItem secondaryAction={<material_1.Box>
                          <material_1.IconButton edge="end" aria-label="edit" onClick={() => handleEdit(todo)}>
                            <icons_material_1.Edit />
                          </material_1.IconButton>
                          <material_1.IconButton edge="end" aria-label="delete" onClick={() => deleteTask(todo.id)}>
                            <icons_material_1.Delete />
                          </material_1.IconButton>
                        </material_1.Box>}>
                      <material_1.ListItemIcon>
                        <material_1.Checkbox edge="start" checked={todo.status === 'completed'} onChange={() => handleToggleStatus(todo.id)}/>
                      </material_1.ListItemIcon>
                      <material_1.ListItemText primary={<material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <material_1.Typography variant="subtitle1">{todo.title}</material_1.Typography>
                            <material_1.Chip size="small" icon={<icons_material_1.Flag />} label={`P${todo.priority}`} color={priorityToColor(todo.priority)}/>
                            {todo.category && (<material_1.Chip size="small" label={todo.category}/>)}
                            {todo.status !== 'not-started' && todo.status !== 'completed' && (<material_1.Chip size="small" label={todo.status.replace('-', ' ')} color={todo.status === 'in-progress' ? 'warning' : 'info'}/>)}
                          </material_1.Box>} secondary={<react_1.default.Fragment>
                            <material_1.Typography component="span" variant="body2" color="text.primary">
                              {todo.description}
                            </material_1.Typography>
                            <material_1.Box sx={{ mt: 1 }}>
                              {todo.tags?.map((tag) => (<material_1.Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }}/>))}
                            </material_1.Box>
                          </react_1.default.Fragment>}/>
                    </material_1.ListItem>
                  </material_1.CardContent>
                </material_1.Card>)))}
        </material_1.List>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <material_1.List>
          {completedTasks.length === 0 ? (<material_1.Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
              No completed tasks yet.
            </material_1.Typography>) : (completedTasks.map((todo) => (<material_1.Card key={todo.id} sx={{ mb: 1, opacity: 0.7 }}>
                <material_1.CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <material_1.ListItem secondaryAction={<material_1.Box>
                        <material_1.IconButton edge="end" aria-label="delete" onClick={() => deleteTask(todo.id)}>
                          <icons_material_1.Delete />
                        </material_1.IconButton>
                      </material_1.Box>}>
                    <material_1.ListItemIcon>
                      <material_1.Checkbox edge="start" checked={todo.status === 'completed'} onChange={() => handleToggleStatus(todo.id)}/>
                    </material_1.ListItemIcon>
                    <material_1.ListItemText primary={<material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <material_1.Typography variant="subtitle1" sx={{ textDecoration: 'line-through' }}>
                            {todo.title}
                          </material_1.Typography>
                          <material_1.Chip size="small" icon={<icons_material_1.Flag />} label={`P${todo.priority}`} color={priorityToColor(todo.priority)}/>
                        </material_1.Box>} secondary={todo.description && (<material_1.Typography component="span" variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                            {todo.description}
                          </material_1.Typography>)}/>
                  </material_1.ListItem>
                </material_1.CardContent>
              </material_1.Card>)))}
        </material_1.List>
      </TabPanel>

      <material_1.Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <material_1.DialogTitle>{editMode ? 'Edit Task' : 'Create New Task'}</material_1.DialogTitle>
        <material_1.DialogContent>
          <material_1.Grid container spacing={2} sx={{ mt: 0.5 }}>
            <material_1.Grid item xs={12}>
              <material_1.TextField required fullWidth id="title" name="title" label="Title" value={currentTodo.title} onChange={handleInputChange} variant="outlined"/>
            </material_1.Grid>
            <material_1.Grid item xs={12}>
              <material_1.TextField fullWidth id="description" name="description" label="Description" value={currentTodo.description} onChange={handleInputChange} variant="outlined" multiline rows={3}/>
            </material_1.Grid>
            <material_1.Grid item xs={6}>
              <material_1.FormControl fullWidth>
                <material_1.InputLabel id="priority-label">Priority</material_1.InputLabel>
                <material_1.Select labelId="priority-label" id="priority" name="priority" value={currentTodo.priority} label="Priority" onChange={handleSelectChange}>
                  <material_1.MenuItem value={1}>Low (P1)</material_1.MenuItem>
                  <material_1.MenuItem value={2}>Medium-Low (P2)</material_1.MenuItem>
                  <material_1.MenuItem value={3}>Medium (P3)</material_1.MenuItem>
                  <material_1.MenuItem value={4}>High (P4)</material_1.MenuItem>
                  <material_1.MenuItem value={5}>Critical (P5)</material_1.MenuItem>
                </material_1.Select>
              </material_1.FormControl>
            </material_1.Grid>
            <material_1.Grid item xs={6}>
              <material_1.FormControl fullWidth>
                <material_1.InputLabel id="status-label">Status</material_1.InputLabel>
                <material_1.Select labelId="status-label" id="status" name="status" value={currentTodo.status} label="Status" onChange={handleSelectChange}>
                  <material_1.MenuItem value="not-started">Not Started</material_1.MenuItem>
                  <material_1.MenuItem value="in-progress">In Progress</material_1.MenuItem>
                  <material_1.MenuItem value="blocked">Blocked</material_1.MenuItem>
                  <material_1.MenuItem value="completed">Completed</material_1.MenuItem>
                  <material_1.MenuItem value="recurring">Recurring</material_1.MenuItem>
                </material_1.Select>
              </material_1.FormControl>
            </material_1.Grid>
            <material_1.Grid item xs={12}>
              <material_1.FormControl fullWidth>
                <material_1.InputLabel id="category-label">Category</material_1.InputLabel>
                <material_1.Select labelId="category-label" id="category" name="category" value={currentTodo.category} label="Category" onChange={handleSelectChange}>
                  {categories.filter(c => c !== 'All').map((category) => (<material_1.MenuItem key={category} value={category}>
                      {category}
                    </material_1.MenuItem>))}
                  <material_1.MenuItem value="New">
                    <em>+ Add New Category</em>
                  </material_1.MenuItem>
                </material_1.Select>
              </material_1.FormControl>
            </material_1.Grid>
            <material_1.Grid item xs={12}>
              <material_1.Box sx={{ mb: 1 }}>
                <material_1.Typography variant="body2" color="text.secondary">
                  Tags
                </material_1.Typography>
              </material_1.Box>
              <material_1.Stack direction="row" spacing={1}>
                <material_1.TextField size="small" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={(e) => {
            if (e.key === 'Enter') {
                handleTagAdd();
                e.preventDefault();
            }
        }} placeholder="Add tag" sx={{ flexGrow: 1 }}/>
                <material_1.Button variant="outlined" onClick={handleTagAdd}>
                  Add
                </material_1.Button>
              </material_1.Stack>
              <material_1.Box sx={{ mt: 1 }}>
                {currentTodo.tags?.map((tag) => (<material_1.Chip key={tag} label={tag} onDelete={() => handleTagDelete(tag)} sx={{ mr: 0.5, mb: 0.5 }}/>))}
              </material_1.Box>
            </material_1.Grid>
          </material_1.Grid>
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={handleClose}>Cancel</material_1.Button>
          <material_1.Button onClick={handleSave} variant="contained" disabled={!currentTodo.title}>
            Save
          </material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>

      <material_1.Dialog open={notionConfigOpen} onClose={handleCloseNotionConfig}>
        <material_1.DialogTitle>Notion Integration</material_1.DialogTitle>
        <material_1.DialogContent>
          <material_1.Box sx={{ mt: 2 }}>
            <material_1.Typography variant="subtitle1" gutterBottom>
              Connection Status: {isNotionConnected ? 'Connected' : 'Not Connected'}
            </material_1.Typography>
            
            <material_1.Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
              To configure Notion integration:
            </material_1.Typography>
            
            <ol>
              <li>Create a Notion integration at <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer">https://www.notion.so/my-integrations</a></li>
              <li>Get your API key and add it to the .env file in the Notion MCP server</li>
              <li>Share your Notion database with the integration</li>
              <li>Add your database ID to the .env file</li>
              <li>Restart the Notion MCP server</li>
            </ol>
            
            <material_1.Alert severity="info" sx={{ mt: 2 }}>
              Tasks synced with Notion will be tagged with the "notion" tag for easy identification.
            </material_1.Alert>
          </material_1.Box>
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={handleCloseNotionConfig}>Close</material_1.Button>
          <material_1.Button onClick={async () => {
            await checkConnection();
            if (isNotionConnected) {
                handleSyncWithNotion();
            }
        }} color="primary" disabled={isNotionLoading || !isNotionConnected}>
            Test Connection
          </material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>
      
      <material_1.Snackbar open={notionAlert.open} autoHideDuration={6000} onClose={handleCloseAlert} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <material_1.Alert onClose={handleCloseAlert} severity={notionAlert.severity}>
          {notionAlert.message}
        </material_1.Alert>
      </material_1.Snackbar>
    </material_1.Box>);
};
exports.TodoManager = TodoManager;
exports.default = exports.TodoManager;
//# sourceMappingURL=TodoManager.js.map