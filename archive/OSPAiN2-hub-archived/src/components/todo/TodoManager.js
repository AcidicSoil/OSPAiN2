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
const TodoTrackingService_1 = __importDefault(require("../../services/TodoTrackingService"));
const LinearProgressWithLabel_1 = __importDefault(require("./LinearProgressWithLabel"));
/**
 * TodoManager Component
 *
 * Comprehensive task management interface that displays ALL tasks from master-todo.mdc
 * Features include:
 * - Complete task listing with virtual scrolling for performance
 * - Filtering by horizon, priority, status, and category
 * - Sorting capabilities
 * - Full CRUD operations
 * - Dashboard view with progress metrics
 */
const TodoManager = ({ className = "" }) => {
    // State
    const [stats, setStats] = (0, react_1.useState)(TodoTrackingService_1.default.getStats());
    const [tasks, setTasks] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [activeTab, setActiveTab] = (0, react_1.useState)(0);
    const [expandedTask, setExpandedTask] = (0, react_1.useState)(null);
    const [page, setPage] = (0, react_1.useState)(0);
    const [rowsPerPage, setRowsPerPage] = (0, react_1.useState)(25);
    const [sortBy, setSortBy] = (0, react_1.useState)("priority");
    const [sortDirection, setSortDirection] = (0, react_1.useState)("asc");
    const [filters, setFilters] = (0, react_1.useState)({
        search: "",
        status: [],
        horizon: [],
        priority: [],
        category: [],
    });
    const [filterDialogOpen, setFilterDialogOpen] = (0, react_1.useState)(false);
    const [taskDialogOpen, setTaskDialogOpen] = (0, react_1.useState)(false);
    const [currentTask, setCurrentTask] = (0, react_1.useState)(null);
    // Load data on mount
    (0, react_1.useEffect)(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await TodoTrackingService_1.default.refreshData();
                setTasks(TodoTrackingService_1.default.getAllTasks());
                setStats(TodoTrackingService_1.default.getStats());
            }
            catch (error) {
                console.error("Failed to load tasks:", error);
            }
            finally {
                setLoading(false);
            }
        };
        loadData();
        // Subscribe to updates
        const unsubscribe = TodoTrackingService_1.default.onTodoUpdated((newStats) => {
            setStats(newStats);
            setTasks(TodoTrackingService_1.default.getAllTasks());
        });
        return () => {
            unsubscribe();
        };
    }, []);
    // Filter and sort tasks
    const filteredTasks = (0, react_1.useMemo)(() => {
        return tasks
            .filter((task) => {
            // Search filter
            if (filters.search &&
                !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
                return false;
            }
            // Status filter
            if (filters.status.length > 0 &&
                !filters.status.includes(task.status)) {
                return false;
            }
            // Horizon filter (if task has horizon property)
            if (filters.horizon.length > 0 && task.tags) {
                const horizonTag = task.tags.find((tag) => tag.startsWith("H"));
                if (!horizonTag || !filters.horizon.includes(horizonTag)) {
                    return false;
                }
            }
            // Priority filter
            if (filters.priority.length > 0 &&
                !filters.priority.includes(task.priority)) {
                return false;
            }
            // Category filter
            if (filters.category.length > 0 &&
                !filters.category.includes(task.category)) {
                return false;
            }
            return true;
        })
            .sort((a, b) => {
            // Sort by selected field
            if (sortBy === "priority") {
                return sortDirection === "asc"
                    ? a.priority - b.priority
                    : b.priority - a.priority;
            }
            else if (sortBy === "status") {
                return sortDirection === "asc"
                    ? a.status.localeCompare(b.status)
                    : b.status.localeCompare(a.status);
            }
            else if (sortBy === "title") {
                return sortDirection === "asc"
                    ? a.title.localeCompare(b.title)
                    : b.title.localeCompare(a.title);
            }
            else if (sortBy === "dateUpdated") {
                const aDate = a.dateUpdated || new Date(0);
                const bDate = b.dateUpdated || new Date(0);
                return sortDirection === "asc"
                    ? aDate.getTime() - bDate.getTime()
                    : bDate.getTime() - aDate.getTime();
            }
            return 0;
        });
    }, [tasks, filters, sortBy, sortDirection]);
    // Pagination handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    // Task expansion handler
    const handleExpandTask = (taskId) => {
        setExpandedTask(expandedTask === taskId ? null : taskId);
    };
    // Filter dialog handlers
    const handleOpenFilterDialog = () => {
        setFilterDialogOpen(true);
    };
    const handleCloseFilterDialog = () => {
        setFilterDialogOpen(false);
    };
    const handleApplyFilters = (newFilters) => {
        setFilters(newFilters);
        setFilterDialogOpen(false);
        setPage(0); // Reset to first page when filters change
    };
    // Sort handler
    const handleSort = (column) => {
        if (sortBy === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        }
        else {
            setSortBy(column);
            setSortDirection("asc");
        }
    };
    // Task dialog handlers
    const handleOpenTaskDialog = (task) => {
        setCurrentTask(task || null);
        setTaskDialogOpen(true);
    };
    const handleCloseTaskDialog = () => {
        setTaskDialogOpen(false);
        setCurrentTask(null);
    };
    const handleSaveTask = async (task) => {
        setLoading(true);
        try {
            if (task.id) {
                await TodoTrackingService_1.default.updateTask(task);
            }
            else {
                await TodoTrackingService_1.default.createTask(task);
            }
            setTaskDialogOpen(false);
            setCurrentTask(null);
        }
        catch (error) {
            console.error("Failed to save task:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleDeleteTask = async (taskId) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            setLoading(true);
            try {
                await TodoTrackingService_1.default.deleteTask(taskId);
            }
            catch (error) {
                console.error("Failed to delete task:", error);
            }
            finally {
                setLoading(false);
            }
        }
    };
    // UI Components
    const renderStatusChip = (status) => {
        let color = "default";
        let icon = null;
        switch (status) {
            case "not-started":
                color = "error";
                break;
            case "in-progress":
                color = "warning";
                break;
            case "blocked":
                color = "info";
                break;
            case "completed":
                color = "success";
                break;
            case "recurring":
                color = "secondary";
                break;
        }
        return (<material_1.Chip color={color} size="small" label={status.replace("-", " ")} icon={icon || undefined}/>);
    };
    const renderPriorityChip = (priority) => {
        let color = "default";
        switch (priority) {
            case 1:
                color = "error";
                break;
            case 2:
                color = "warning";
                break;
            case 3:
                color = "primary";
                break;
            case 4:
                color = "info";
                break;
            case 5:
                color = "default";
                break;
        }
        return <material_1.Chip color={color} size="small" label={`P${priority}`}/>;
    };
    const renderHorizonChip = (tags) => {
        if (!tags)
            return null;
        const horizonTag = tags.find((tag) => tag.startsWith("H"));
        if (!horizonTag)
            return null;
        let color = "default";
        switch (horizonTag) {
            case "H1":
                color = "error";
                break;
            case "H2":
                color = "warning";
                break;
            case "H3":
                color = "info";
                break;
        }
        return <material_1.Chip color={color} size="small" label={horizonTag}/>;
    };
    // Main render
    return (<material_1.Paper className={className} elevation={2} sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
      <material_1.Box sx={{
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        }}>
        <material_1.Typography variant="h5" component="h2">
          Task Manager
        </material_1.Typography>
        <material_1.Box>
          <material_1.Button variant="outlined" startIcon={<icons_material_1.Refresh />} onClick={() => TodoTrackingService_1.default.refreshData()} sx={{ mr: 1 }}>
            Refresh
          </material_1.Button>
          <material_1.Button variant="outlined" color="primary" startIcon={<icons_material_1.FilterList />} onClick={handleOpenFilterDialog} sx={{ mr: 1 }}>
            Filter
          </material_1.Button>
          <material_1.Button variant="contained" color="primary" startIcon={<icons_material_1.Add />} onClick={() => handleOpenTaskDialog()}>
            Add Task
          </material_1.Button>
        </material_1.Box>
      </material_1.Box>

      <material_1.Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
        <material_1.Tab label="All Tasks"/>
        <material_1.Tab label="Horizon 1 (Now)"/>
        <material_1.Tab label="Horizon 2 (Next)"/>
        <material_1.Tab label="Horizon 3 (Future)"/>
        <material_1.Tab label="Dashboard"/>
      </material_1.Tabs>

      {activeTab === 4 ? (
        // Dashboard View
        <material_1.Grid container spacing={2}>
          <material_1.Grid item xs={12} md={6}>
            <material_1.Card>
              <material_1.CardContent>
                <material_1.Typography variant="h6">Overall Progress</material_1.Typography>
                <material_1.Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <material_1.Box sx={{ position: "relative", display: "inline-flex", mr: 2 }}>
                    <material_1.CircularProgress variant="determinate" value={stats.overallProgress} size={80} thickness={5}/>
                    <material_1.Box sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
                      <material_1.Typography variant="caption" component="div" color="text.secondary">
                        {`${Math.round(stats.overallProgress)}%`}
                      </material_1.Typography>
                    </material_1.Box>
                  </material_1.Box>
                  <material_1.Box>
                    <material_1.Typography variant="body2">
                      {stats.completedTasks} of {stats.totalTasks} tasks
                      completed
                    </material_1.Typography>
                    <material_1.Typography variant="body2">
                      {stats.inProgressTasks} in progress
                    </material_1.Typography>
                  </material_1.Box>
                </material_1.Box>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>

          <material_1.Grid item xs={12} md={6}>
            <material_1.Card>
              <material_1.CardContent>
                <material_1.Typography variant="h6">Priority Distribution</material_1.Typography>
                <material_1.Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                  {[1, 2, 3, 4, 5].map((priority) => {
                const count = tasks.filter((t) => t.priority === priority).length;
                return (<material_1.Chip key={priority} label={`P${priority}: ${count}`} color={priority === 1
                        ? "error"
                        : priority === 2
                            ? "warning"
                            : priority === 3
                                ? "primary"
                                : priority === 4
                                    ? "info"
                                    : "default"}/>);
            })}
                </material_1.Box>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>

          <material_1.Grid item xs={12}>
            <material_1.Card>
              <material_1.CardContent>
                <material_1.Typography variant="h6">Categories</material_1.Typography>
                <material_1.TableContainer>
                  <material_1.Table size="small">
                    <material_1.TableHead>
                      <material_1.TableRow>
                        <material_1.TableCell>Category</material_1.TableCell>
                        <material_1.TableCell align="right">Total</material_1.TableCell>
                        <material_1.TableCell align="right">Completed</material_1.TableCell>
                        <material_1.TableCell align="right">Progress</material_1.TableCell>
                      </material_1.TableRow>
                    </material_1.TableHead>
                    <material_1.TableBody>
                      {Object.values(stats.categories || {}).map((category) => (<material_1.TableRow key={category.name}>
                          <material_1.TableCell>{category.name}</material_1.TableCell>
                          <material_1.TableCell align="right">
                            {category.totalTasks}
                          </material_1.TableCell>
                          <material_1.TableCell align="right">
                            {category.completedTasks}
                          </material_1.TableCell>
                          <material_1.TableCell align="right">
                            <material_1.Box sx={{
                    width: 100,
                    mr: 1,
                    display: "inline-block",
                }}>
                              <LinearProgressWithLabel_1.default value={category.progress}/>
                            </material_1.Box>
                          </material_1.TableCell>
                        </material_1.TableRow>))}
                    </material_1.TableBody>
                  </material_1.Table>
                </material_1.TableContainer>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>
        </material_1.Grid>) : (
        // Task List View
        <>
          <material_1.TableContainer component={material_1.Paper} sx={{ flexGrow: 1 }}>
            <material_1.Table stickyHeader aria-label="tasks table" size="small">
              <material_1.TableHead>
                <material_1.TableRow>
                  <material_1.TableCell padding="checkbox"/>
                  <material_1.TableCell sortDirection={sortBy === "title" ? sortDirection : false} onClick={() => handleSort("title")} style={{ cursor: "pointer" }}>
                    Title
                    {sortBy === "title" &&
                (sortDirection === "asc" ? (<icons_material_1.ArrowUpward fontSize="small"/>) : (<icons_material_1.ArrowDownward fontSize="small"/>))}
                  </material_1.TableCell>
                  <material_1.TableCell sortDirection={sortBy === "status" ? sortDirection : false} onClick={() => handleSort("status")} style={{ cursor: "pointer" }} align="center">
                    Status
                    {sortBy === "status" &&
                (sortDirection === "asc" ? (<icons_material_1.ArrowUpward fontSize="small"/>) : (<icons_material_1.ArrowDownward fontSize="small"/>))}
                  </material_1.TableCell>
                  <material_1.TableCell sortDirection={sortBy === "priority" ? sortDirection : false} onClick={() => handleSort("priority")} style={{ cursor: "pointer" }} align="center">
                    Priority
                    {sortBy === "priority" &&
                (sortDirection === "asc" ? (<icons_material_1.ArrowUpward fontSize="small"/>) : (<icons_material_1.ArrowDownward fontSize="small"/>))}
                  </material_1.TableCell>
                  <material_1.TableCell align="center">Horizon</material_1.TableCell>
                  <material_1.TableCell align="center">Category</material_1.TableCell>
                  <material_1.TableCell sortDirection={sortBy === "dateUpdated" ? sortDirection : false} onClick={() => handleSort("dateUpdated")} style={{ cursor: "pointer" }} align="center">
                    Updated
                    {sortBy === "dateUpdated" &&
                (sortDirection === "asc" ? (<icons_material_1.ArrowUpward fontSize="small"/>) : (<icons_material_1.ArrowDownward fontSize="small"/>))}
                  </material_1.TableCell>
                  <material_1.TableCell align="right">Actions</material_1.TableCell>
                </material_1.TableRow>
              </material_1.TableHead>
              <material_1.TableBody>
                {loading ? (<material_1.TableRow>
                    <material_1.TableCell colSpan={8} align="center">
                      <material_1.CircularProgress size={40}/>
                      <material_1.Typography variant="body2" sx={{ mt: 1 }}>
                        Loading tasks...
                      </material_1.Typography>
                    </material_1.TableCell>
                  </material_1.TableRow>) : filteredTasks.length === 0 ? (<material_1.TableRow>
                    <material_1.TableCell colSpan={8} align="center">
                      <material_1.Typography variant="body2">
                        No tasks found matching the current filters.
                      </material_1.Typography>
                    </material_1.TableCell>
                  </material_1.TableRow>) : (filteredTasks
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((task) => (<react_1.default.Fragment key={task.id}>
                        <material_1.TableRow hover>
                          <material_1.TableCell padding="checkbox">
                            <material_1.IconButton aria-label="expand row" size="small" onClick={() => handleExpandTask(task.id)}>
                              {expandedTask === task.id ? (<icons_material_1.KeyboardArrowUp />) : (<icons_material_1.KeyboardArrowDown />)}
                            </material_1.IconButton>
                          </material_1.TableCell>
                          <material_1.TableCell component="th" scope="row">
                            {task.title}
                          </material_1.TableCell>
                          <material_1.TableCell align="center">
                            {renderStatusChip(task.status)}
                          </material_1.TableCell>
                          <material_1.TableCell align="center">
                            {renderPriorityChip(task.priority)}
                          </material_1.TableCell>
                          <material_1.TableCell align="center">
                            {renderHorizonChip(task.tags)}
                          </material_1.TableCell>
                          <material_1.TableCell align="center">
                            <material_1.Chip size="small" label={task.category}/>
                          </material_1.TableCell>
                          <material_1.TableCell align="center">
                            {task.dateUpdated
                    ? new Date(task.dateUpdated).toLocaleDateString()
                    : "-"}
                          </material_1.TableCell>
                          <material_1.TableCell align="right">
                            <material_1.IconButton size="small" onClick={() => handleOpenTaskDialog(task)} aria-label="edit">
                              <icons_material_1.Edit fontSize="small"/>
                            </material_1.IconButton>
                            <material_1.IconButton size="small" onClick={() => handleDeleteTask(task.id)} aria-label="delete" color="error">
                              <icons_material_1.Delete fontSize="small"/>
                            </material_1.IconButton>
                          </material_1.TableCell>
                        </material_1.TableRow>
                        <material_1.TableRow>
                          <material_1.TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                            <material_1.Collapse in={expandedTask === task.id} timeout="auto" unmountOnExit>
                              <material_1.Box sx={{ margin: 1, py: 2 }}>
                                <material_1.Typography variant="h6" gutterBottom component="div">
                                  Task Details
                                </material_1.Typography>
                                <material_1.Grid container spacing={2}>
                                  <material_1.Grid item xs={12}>
                                    <material_1.Typography variant="body2" paragraph>
                                      {task.description ||
                    "No description provided."}
                                    </material_1.Typography>
                                  </material_1.Grid>

                                  {task.subTasks &&
                    task.subTasks.length > 0 && (<material_1.Grid item xs={12}>
                                        <material_1.Typography variant="subtitle1">
                                          Subtasks
                                        </material_1.Typography>
                                        <material_1.Table size="small">
                                          <material_1.TableHead>
                                            <material_1.TableRow>
                                              <material_1.TableCell>Title</material_1.TableCell>
                                              <material_1.TableCell align="center">
                                                Status
                                              </material_1.TableCell>
                                            </material_1.TableRow>
                                          </material_1.TableHead>
                                          <material_1.TableBody>
                                            {task.subTasks.map((subtask, index) => (<material_1.TableRow key={index}>
                                                  <material_1.TableCell>
                                                    {subtask.title}
                                                  </material_1.TableCell>
                                                  <material_1.TableCell align="center">
                                                    {renderStatusChip(subtask.status)}
                                                  </material_1.TableCell>
                                                </material_1.TableRow>))}
                                          </material_1.TableBody>
                                        </material_1.Table>
                                      </material_1.Grid>)}

                                  {task.tags && task.tags.length > 0 && (<material_1.Grid item xs={12}>
                                      <material_1.Typography variant="subtitle1">
                                        Tags
                                      </material_1.Typography>
                                      <material_1.Box sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                    }}>
                                        {task.tags.map((tag, index) => (<material_1.Chip key={index} label={tag} size="small"/>))}
                                      </material_1.Box>
                                    </material_1.Grid>)}
                                </material_1.Grid>
                              </material_1.Box>
                            </material_1.Collapse>
                          </material_1.TableCell>
                        </material_1.TableRow>
                      </react_1.default.Fragment>)))}
              </material_1.TableBody>
            </material_1.Table>
          </material_1.TableContainer>

          <material_1.TablePagination rowsPerPageOptions={[10, 25, 50, 100]} component="div" count={filteredTasks.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}/>
        </>)}

      {/* Filter Dialog */}
      <material_1.Dialog open={filterDialogOpen} onClose={handleCloseFilterDialog} maxWidth="sm" fullWidth>
        <material_1.DialogTitle>Filter Tasks</material_1.DialogTitle>
        <material_1.DialogContent>
          <material_1.Grid container spacing={2} sx={{ mt: 1 }}>
            <material_1.Grid item xs={12}>
              <material_1.TextField fullWidth label="Search" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Search by title" size="small"/>
            </material_1.Grid>

            <material_1.Grid item xs={12} sm={6}>
              <material_1.FormControl fullWidth size="small">
                <material_1.InputLabel>Status</material_1.InputLabel>
                <material_1.Select multiple value={filters.status} onChange={(e) => setFilters({
            ...filters,
            status: e.target.value,
        })} renderValue={(selected) => (<material_1.Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => (<material_1.Chip key={value} label={value.replace("-", " ")} size="small"/>))}
                    </material_1.Box>)}>
                  <material_1.MenuItem value="not-started">Not Started</material_1.MenuItem>
                  <material_1.MenuItem value="in-progress">In Progress</material_1.MenuItem>
                  <material_1.MenuItem value="blocked">Blocked</material_1.MenuItem>
                  <material_1.MenuItem value="completed">Completed</material_1.MenuItem>
                  <material_1.MenuItem value="recurring">Recurring</material_1.MenuItem>
                </material_1.Select>
              </material_1.FormControl>
            </material_1.Grid>

            <material_1.Grid item xs={12} sm={6}>
              <material_1.FormControl fullWidth size="small">
                <material_1.InputLabel>Horizon</material_1.InputLabel>
                <material_1.Select multiple value={filters.horizon} onChange={(e) => setFilters({
            ...filters,
            horizon: e.target.value,
        })} renderValue={(selected) => (<material_1.Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => (<material_1.Chip key={value} label={value} size="small"/>))}
                    </material_1.Box>)}>
                  <material_1.MenuItem value="H1">H1 (Now)</material_1.MenuItem>
                  <material_1.MenuItem value="H2">H2 (Next)</material_1.MenuItem>
                  <material_1.MenuItem value="H3">H3 (Future)</material_1.MenuItem>
                </material_1.Select>
              </material_1.FormControl>
            </material_1.Grid>

            <material_1.Grid item xs={12} sm={6}>
              <material_1.FormControl fullWidth size="small">
                <material_1.InputLabel>Priority</material_1.InputLabel>
                <material_1.Select multiple value={filters.priority} onChange={(e) => setFilters({
            ...filters,
            priority: e.target.value,
        })} renderValue={(selected) => (<material_1.Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => (<material_1.Chip key={value} label={`P${value}`} size="small"/>))}
                    </material_1.Box>)}>
                  <material_1.MenuItem value={1}>P1</material_1.MenuItem>
                  <material_1.MenuItem value={2}>P2</material_1.MenuItem>
                  <material_1.MenuItem value={3}>P3</material_1.MenuItem>
                  <material_1.MenuItem value={4}>P4</material_1.MenuItem>
                  <material_1.MenuItem value={5}>P5</material_1.MenuItem>
                </material_1.Select>
              </material_1.FormControl>
            </material_1.Grid>

            <material_1.Grid item xs={12} sm={6}>
              <material_1.FormControl fullWidth size="small">
                <material_1.InputLabel>Category</material_1.InputLabel>
                <material_1.Select multiple value={filters.category} onChange={(e) => setFilters({
            ...filters,
            category: e.target.value,
        })} renderValue={(selected) => (<material_1.Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => (<material_1.Chip key={value} label={value} size="small"/>))}
                    </material_1.Box>)}>
                  {Object.keys(stats.categories || {}).map((category) => (<material_1.MenuItem key={category} value={category}>
                      {category}
                    </material_1.MenuItem>))}
                </material_1.Select>
              </material_1.FormControl>
            </material_1.Grid>
          </material_1.Grid>
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={handleCloseFilterDialog}>Cancel</material_1.Button>
          <material_1.Button onClick={() => setFilters({
            search: "",
            status: [],
            horizon: [],
            priority: [],
            category: [],
        })}>
            Clear All
          </material_1.Button>
          <material_1.Button onClick={() => handleApplyFilters(filters)} color="primary">
            Apply Filters
          </material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>

      {/* Task Dialog */}
      <material_1.Dialog open={taskDialogOpen} onClose={handleCloseTaskDialog} maxWidth="md" fullWidth>
        <material_1.DialogTitle>{currentTask ? "Edit Task" : "Add New Task"}</material_1.DialogTitle>
        <material_1.DialogContent>
          <TaskForm task={currentTask} onSave={handleSaveTask} onCancel={handleCloseTaskDialog} categories={Object.keys(stats.categories || {})}/>
        </material_1.DialogContent>
      </material_1.Dialog>
    </material_1.Paper>);
};
exports.TodoManager = TodoManager;
const TaskForm = ({ task, onSave, onCancel, categories, }) => {
    const [formData, setFormData] = (0, react_1.useState)({
        id: task?.id || "",
        title: task?.title || "",
        description: task?.description || "",
        status: task?.status || "not-started",
        priority: task?.priority || 3,
        category: task?.category || (categories.length > 0 ? categories[0] : ""),
        tags: task?.tags || [],
        dateCreated: task?.dateCreated || new Date(),
        dateUpdated: new Date(),
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };
    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };
    return (<form onSubmit={handleSubmit}>
      <material_1.Grid container spacing={2} sx={{ mt: 1 }}>
        <material_1.Grid item xs={12}>
          <material_1.TextField required fullWidth label="Title" name="title" value={formData.title} onChange={handleChange}/>
        </material_1.Grid>

        <material_1.Grid item xs={12}>
          <material_1.TextField fullWidth label="Description" name="description" value={formData.description} onChange={handleChange} multiline rows={4}/>
        </material_1.Grid>

        <material_1.Grid item xs={12} sm={6}>
          <material_1.FormControl fullWidth>
            <material_1.InputLabel>Status</material_1.InputLabel>
            <material_1.Select name="status" value={formData.status} onChange={handleSelectChange}>
              <material_1.MenuItem value="not-started">Not Started</material_1.MenuItem>
              <material_1.MenuItem value="in-progress">In Progress</material_1.MenuItem>
              <material_1.MenuItem value="blocked">Blocked</material_1.MenuItem>
              <material_1.MenuItem value="completed">Completed</material_1.MenuItem>
              <material_1.MenuItem value="recurring">Recurring</material_1.MenuItem>
            </material_1.Select>
          </material_1.FormControl>
        </material_1.Grid>

        <material_1.Grid item xs={12} sm={6}>
          <material_1.FormControl fullWidth>
            <material_1.InputLabel>Priority</material_1.InputLabel>
            <material_1.Select name="priority" value={formData.priority} onChange={handleSelectChange}>
              <material_1.MenuItem value={1}>P1 - Critical</material_1.MenuItem>
              <material_1.MenuItem value={2}>P2 - High</material_1.MenuItem>
              <material_1.MenuItem value={3}>P3 - Medium</material_1.MenuItem>
              <material_1.MenuItem value={4}>P4 - Low</material_1.MenuItem>
              <material_1.MenuItem value={5}>P5 - Optional</material_1.MenuItem>
            </material_1.Select>
          </material_1.FormControl>
        </material_1.Grid>

        <material_1.Grid item xs={12} sm={6}>
          <material_1.FormControl fullWidth>
            <material_1.InputLabel>Category</material_1.InputLabel>
            <material_1.Select name="category" value={formData.category} onChange={handleSelectChange}>
              {categories.map((category) => (<material_1.MenuItem key={category} value={category}>
                  {category}
                </material_1.MenuItem>))}
            </material_1.Select>
          </material_1.FormControl>
        </material_1.Grid>

        <material_1.Grid item xs={12} sm={6}>
          <material_1.TextField fullWidth label="Tags (comma separated)" name="tags" value={formData.tags?.join(", ") || ""} onChange={(e) => {
            const tagsArray = e.target.value
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean);
            setFormData({
                ...formData,
                tags: tagsArray,
            });
        }} helperText="Use H1, H2, or H3 to specify horizon"/>
        </material_1.Grid>
      </material_1.Grid>

      <material_1.Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <material_1.Button onClick={onCancel} sx={{ mr: 1 }}>
          Cancel
        </material_1.Button>
        <material_1.Button type="submit" variant="contained" color="primary">
          Save Task
        </material_1.Button>
      </material_1.Box>
    </form>);
};
exports.default = exports.TodoManager;
//# sourceMappingURL=TodoManager.js.map