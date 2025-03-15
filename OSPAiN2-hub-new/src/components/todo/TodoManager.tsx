import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  Card,
  CardContent,
  CardActions,
  Divider,
  Tooltip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Badge,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  ArrowUpward as PriorityUpIcon,
  ArrowDownward as PriorityDownIcon,
  Dashboard as DashboardIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
  Flag as FlagIcon,
} from "@mui/icons-material";
import { SelectChangeEvent } from "@mui/material/Select";
import LinearProgressWithLabel from "./LinearProgressWithLabel";
import { useTodoStore, TodoItem } from "../../services/todo/todoStore";

// Define types for our task filters
interface TaskFilters {
  search: string;
  status: string[];
  horizon: string[];
  priority: number[];
  category: string[];
}

// Component interface
interface TodoManagerProps {
  className?: string;
}

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
export const TodoManager: React.FC<TodoManagerProps> = ({ className = "" }) => {
  // Get state and actions from Zustand store
  const {
    tasks,
    stats,
    isLoading,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    refreshData,
    toggleCompleted,
    getCompletionPercentage,
  } = useTodoStore();
  
  // Local component state
  const [activeTab, setActiveTab] = useState<number>(0);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);
  const [sortBy, setSortBy] = useState<string>("priority");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<TaskFilters>({
    search: "",
    status: [],
    horizon: [],
    priority: [],
    category: [],
  });
  const [filterDialogOpen, setFilterDialogOpen] = useState<boolean>(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState<boolean>(false);
  const [currentTask, setCurrentTask] = useState<TodoItem | null>(null);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>(['General']);

  // Load data on mount
  useEffect(() => {
    fetchTasks();
    
    // Set up refresh interval
    const intervalId = setInterval(() => {
      refreshData();
    }, 60000); // 1 minute refresh
    
    return () => clearInterval(intervalId);
  }, [fetchTasks, refreshData]);

  useEffect(() => {
    // Extract unique categories from tasks
    const uniqueCategories = ['All', ...new Set(tasks.map(task => task.category || 'General').filter(Boolean))];
    setCategories(uniqueCategories);
  }, [tasks]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search filter
        if (
          filters.search &&
          !task.title.toLowerCase().includes(filters.search.toLowerCase())
        ) {
          return false;
        }

        // Status filter
        if (
          filters.status.length > 0 &&
          !filters.status.includes(task.status)
        ) {
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
        if (
          filters.priority.length > 0 &&
          !filters.priority.includes(task.priority)
        ) {
          return false;
        }

        // Category filter
        if (
          filters.category.length > 0 &&
          !filters.category.includes(task.category)
        ) {
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
        } else if (sortBy === "status") {
          return sortDirection === "asc"
            ? a.status.localeCompare(b.status)
            : b.status.localeCompare(a.status);
        } else if (sortBy === "title") {
          return sortDirection === "asc"
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        } else if (sortBy === "dateUpdated") {
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
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Task expansion handler
  const handleExpandTask = (taskId: string) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  // Filter dialog handlers
  const handleOpenFilterDialog = () => {
    setFilterDialogOpen(true);
  };

  const handleCloseFilterDialog = () => {
    setFilterDialogOpen(false);
  };

  const handleApplyFilters = (newFilters: TaskFilters) => {
    setFilters(newFilters);
    setFilterDialogOpen(false);
    setPage(0); // Reset to first page when filters change
  };

  // Sort handler
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  // Task dialog handlers
  const handleOpenTaskDialog = (task?: TodoItem) => {
    setCurrentTask(task || null);
    setTaskDialogOpen(true);
  };

  const handleCloseTaskDialog = () => {
    setTaskDialogOpen(false);
    setCurrentTask(null);
  };

  const handleSaveTask = async (task: TodoItem) => {
    try {
      if (task.id) {
        await updateTask(task);
      } else {
        await addTask(task);
      }
      setTaskDialogOpen(false);
      setCurrentTask(null);
    } catch (error) {
      console.error("Failed to save task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  const completionPercentage = getCompletionPercentage();

  // UI Components
  const renderStatusChip = (status: string) => {
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

    return (
      <Chip
        color={color as any}
        size="small"
        label={status.replace("-", " ")}
        icon={icon || undefined}
      />
    );
  };

  const renderPriorityChip = (priority: number) => {
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

    return <Chip color={color as any} size="small" label={`P${priority}`} />;
  };

  const renderHorizonChip = (tags: string[]) => {
    if (!tags) return null;

    const horizonTag = tags.find((tag) => tag.startsWith("H"));
    if (!horizonTag) return null;

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

    return <Chip color={color as any} size="small" label={horizonTag} />;
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleClickOpen = () => {
    setOpen(true);
    setEditMode(false);
    setCurrentTask({
      title: '',
      description: '',
      priority: 3,
      category: 'General',
      completed: false,
      tags: []
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEdit = (task: TodoItem) => {
    setCurrentTask(task);
    setEditMode(true);
    setOpen(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setCurrentTask({ ...currentTask, [name]: value });
  };

  const handleSelectChange = (event: SelectChangeEvent<unknown>) => {
    const { name, value } = event.target;
    setCurrentTask({ ...currentTask, [name]: value });
  };

  const handleFilterChange = (event: SelectChangeEvent<unknown>) => {
    setFilterCategory(event.target.value as string);
  };

  const handleTagAdd = () => {
    if (!tagInput.trim()) return;
    const newTags = [...(currentTask.tags || []), tagInput.trim()];
    setCurrentTask({ ...currentTask, tags: newTags });
    setTagInput('');
  };

  const handleTagDelete = (tagToDelete: string) => {
    const newTags = (currentTask.tags || []).filter(tag => tag !== tagToDelete);
    setCurrentTask({ ...currentTask, tags: newTags });
  };

  const filteredTodos = tasks.filter(task => {
    if (filterCategory === 'All') return true;
    return task.category === filterCategory;
  });

  const activeTodos = filteredTodos.filter(task => !task.completed);
  const completedTodos = filteredTodos.filter(task => task.completed);

  // Main render
  return (
    <Paper
      className={className}
      elevation={2}
      sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" component="h2">
          Task Manager
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refreshData()}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FilterIcon />}
            onClick={handleOpenFilterDialog}
            sx={{ mr: 1 }}
          >
            Filter
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleClickOpen}
          >
            Add Task
          </Button>
        </Box>
      </Box>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ mb: 2 }}
      >
        <Tab label="All Tasks" />
        <Tab label="Horizon 1 (Now)" />
        <Tab label="Horizon 2 (Next)" />
        <Tab label="Horizon 3 (Future)" />
        <Tab label="Dashboard" />
      </Tabs>

      {activeTab === 4 ? (
        // Dashboard View
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Overall Progress</Typography>
                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <Box
                    sx={{ position: "relative", display: "inline-flex", mr: 2 }}
                  >
                    <CircularProgress
                      variant="determinate"
                      value={completionPercentage}
                      size={80}
                      thickness={5}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: "absolute",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="text.secondary"
                      >
                        {`${Math.round(completionPercentage)}%`}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2">
                      {stats.completedTasks} of {stats.totalTasks} tasks
                      completed
                    </Typography>
                    <Typography variant="body2">
                      {stats.inProgressTasks} in progress
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Priority Distribution</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                  {[1, 2, 3, 4, 5].map((priority) => {
                    const count = tasks.filter(
                      (t) => t.priority === priority
                    ).length;
                    return (
                      <Chip
                        key={priority}
                        label={`P${priority}: ${count}`}
                        color={
                          priority === 1
                            ? "error"
                            : priority === 2
                            ? "warning"
                            : priority === 3
                            ? "primary"
                            : priority === 4
                            ? "info"
                            : "default"
                        }
                      />
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6">Categories</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="right">Completed</TableCell>
                        <TableCell align="right">Progress</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.values(stats.categories || {}).map((category) => (
                        <TableRow key={category.name}>
                          <TableCell>{category.name}</TableCell>
                          <TableCell align="right">
                            {category.totalTasks}
                          </TableCell>
                          <TableCell align="right">
                            {category.completedTasks}
                          </TableCell>
                          <TableCell align="right">
                            <Box
                              sx={{
                                width: 100,
                                mr: 1,
                                display: "inline-block",
                              }}
                            >
                              <LinearProgressWithLabel
                                value={category.progress}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        // Task List View
        <>
          <TableContainer component={Paper} sx={{ flexGrow: 1 }}>
            <Table stickyHeader aria-label="tasks table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" />
                  <TableCell
                    sortDirection={sortBy === "title" ? sortDirection : false}
                    onClick={() => handleSort("title")}
                    style={{ cursor: "pointer" }}
                  >
                    Title
                    {sortBy === "title" &&
                      (sortDirection === "asc" ? (
                        <PriorityUpIcon fontSize="small" />
                      ) : (
                        <PriorityDownIcon fontSize="small" />
                      ))}
                  </TableCell>
                  <TableCell
                    sortDirection={sortBy === "status" ? sortDirection : false}
                    onClick={() => handleSort("status")}
                    style={{ cursor: "pointer" }}
                    align="center"
                  >
                    Status
                    {sortBy === "status" &&
                      (sortDirection === "asc" ? (
                        <PriorityUpIcon fontSize="small" />
                      ) : (
                        <PriorityDownIcon fontSize="small" />
                      ))}
                  </TableCell>
                  <TableCell
                    sortDirection={
                      sortBy === "priority" ? sortDirection : false
                    }
                    onClick={() => handleSort("priority")}
                    style={{ cursor: "pointer" }}
                    align="center"
                  >
                    Priority
                    {sortBy === "priority" &&
                      (sortDirection === "asc" ? (
                        <PriorityUpIcon fontSize="small" />
                      ) : (
                        <PriorityDownIcon fontSize="small" />
                      ))}
                  </TableCell>
                  <TableCell align="center">Horizon</TableCell>
                  <TableCell align="center">Category</TableCell>
                  <TableCell
                    sortDirection={
                      sortBy === "dateUpdated" ? sortDirection : false
                    }
                    onClick={() => handleSort("dateUpdated")}
                    style={{ cursor: "pointer" }}
                    align="center"
                  >
                    Updated
                    {sortBy === "dateUpdated" &&
                      (sortDirection === "asc" ? (
                        <PriorityUpIcon fontSize="small" />
                      ) : (
                        <PriorityDownIcon fontSize="small" />
                      ))}
                  </TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress size={40} />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Loading tasks...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredTodos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2">
                        No tasks found matching the current filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTodos
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((task) => (
                      <React.Fragment key={task.id}>
                        <TableRow hover>
                          <TableCell padding="checkbox">
                            <IconButton
                              aria-label="expand row"
                              size="small"
                              onClick={() => handleExpandTask(task.id)}
                            >
                              {expandedTask === task.id ? (
                                <ExpandLessIcon />
                              ) : (
                                <ExpandMoreIcon />
                              )}
                            </IconButton>
                          </TableCell>
                          <TableCell component="th" scope="row">
                            {task.title}
                          </TableCell>
                          <TableCell align="center">
                            {renderStatusChip(task.status)}
                          </TableCell>
                          <TableCell align="center">
                            {renderPriorityChip(task.priority)}
                          </TableCell>
                          <TableCell align="center">
                            {renderHorizonChip(task.tags)}
                          </TableCell>
                          <TableCell align="center">
                            <Chip size="small" label={task.category} />
                          </TableCell>
                          <TableCell align="center">
                            {task.dateUpdated
                              ? new Date(task.dateUpdated).toLocaleDateString()
                              : "-"}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(task)}
                              aria-label="edit"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteTask(task.id)}
                              aria-label="delete"
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            style={{ paddingBottom: 0, paddingTop: 0 }}
                            colSpan={8}
                          >
                            <Collapse
                              in={expandedTask === task.id}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box sx={{ margin: 1, py: 2 }}>
                                <Typography
                                  variant="h6"
                                  gutterBottom
                                  component="div"
                                >
                                  Task Details
                                </Typography>
                                <Grid container spacing={2}>
                                  <Grid item xs={12}>
                                    <Typography variant="body2" paragraph>
                                      {task.description ||
                                        "No description provided."}
                                    </Typography>
                                  </Grid>

                                  {task.subTasks &&
                                    task.subTasks.length > 0 && (
                                      <Grid item xs={12}>
                                        <Typography variant="subtitle1">
                                          Subtasks
                                        </Typography>
                                        <Table size="small">
                                          <TableHead>
                                            <TableRow>
                                              <TableCell>Title</TableCell>
                                              <TableCell align="center">
                                                Status
                                              </TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            {task.subTasks.map(
                                              (subtask, index) => (
                                                <TableRow key={index}>
                                                  <TableCell>
                                                    {subtask.title}
                                                  </TableCell>
                                                  <TableCell align="center">
                                                    {renderStatusChip(
                                                      subtask.status
                                                    )}
                                                  </TableCell>
                                                </TableRow>
                                              )
                                            )}
                                          </TableBody>
                                        </Table>
                                      </Grid>
                                    )}
                                </Grid>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={filteredTodos.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      {/* Filter Dialog */}
      <FilterDialog
        open={filterDialogOpen}
        filters={filters}
        onClose={handleCloseFilterDialog}
        onApply={handleApplyFilters}
        categories={categories}
      />

      {/* Task Dialog */}
      <TaskForm
        open={open}
        task={currentTask}
        onClose={handleClose}
        onSave={handleSaveTask}
        categories={categories}
      />
    </Paper>
  );
};

// Filter Dialog Component
interface FilterDialogProps {
  open: boolean;
  filters: TaskFilters;
  onClose: () => void;
  onApply: (filters: TaskFilters) => void;
  categories: string[];
}

const FilterDialog: React.FC<FilterDialogProps> = ({
  open,
  filters,
  onClose,
  onApply,
  categories,
}) => {
  const [localFilters, setLocalFilters] = useState<TaskFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setLocalFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (
    e: SelectChangeEvent<string[]>,
    child: React.ReactNode
  ) => {
    const { name, value } = e.target;
    if (name) {
      setLocalFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleClearFilters = () => {
    setLocalFilters({
      search: "",
      status: [],
      horizon: [],
      priority: [],
      category: [],
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Filter Tasks</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              autoFocus
              margin="dense"
              name="search"
              label="Search"
              type="text"
              fullWidth
              variant="outlined"
              value={localFilters.search}
              onChange={handleChange}
              InputProps={{
                endAdornment: <SearchIcon />,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="dense">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                multiple
                name="status"
                value={localFilters.status}
                onChange={handleSelectChange}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip
                        key={value}
                        label={value.replace("-", " ")}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="not-started">Not Started</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="recurring">Recurring</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="dense">
              <InputLabel id="horizon-filter-label">Horizon</InputLabel>
              <Select
                labelId="horizon-filter-label"
                multiple
                name="horizon"
                value={localFilters.horizon}
                onChange={handleSelectChange}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="H1">H1 (Now)</MenuItem>
                <MenuItem value="H2">H2 (Next)</MenuItem>
                <MenuItem value="H3">H3 (Future)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="dense">
              <InputLabel id="priority-filter-label">Priority</InputLabel>
              <Select
                labelId="priority-filter-label"
                multiple
                name="priority"
                value={localFilters.priority.map(String)}
                onChange={(e, child) => {
                  const values = (e.target.value as string[]).map((v) =>
                    parseInt(v)
                  ) as number[];
                  setLocalFilters((prev) => ({ ...prev, priority: values }));
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={`P${value}`} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="1">P1</MenuItem>
                <MenuItem value="2">P2</MenuItem>
                <MenuItem value="3">P3</MenuItem>
                <MenuItem value="4">P4</MenuItem>
                <MenuItem value="5">P5</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="dense">
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                multiple
                name="category"
                value={localFilters.category}
                onChange={handleSelectChange}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClearFilters}>Clear Filters</Button>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={() => onApply(localFilters)}
          color="primary"
          variant="contained"
        >
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Task Form Component
interface TaskFormProps {
  open: boolean;
  task: TodoItem | null;
  onClose: () => void;
  onSave: (task: TodoItem) => void;
  categories: string[];
}

const TaskForm: React.FC<TaskFormProps> = ({
  open,
  task,
  onClose,
  onSave,
  categories,
}) => {
  const [formData, setFormData] = useState<Partial<TodoItem>>(
    task || {
      title: "",
      status: "not-started",
      priority: 3,
      category: "",
      tags: [],
      description: "",
    }
  );

  useEffect(() => {
    setFormData(
      task || {
        title: "",
        status: "not-started",
        priority: 3,
        category: "",
        tags: [],
        description: "",
      }
    );
  }, [task, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<unknown>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    onSave({
      id: task?.id || "",
      title: formData.title || "",
      status: formData.status as TodoItem["status"],
      priority: formData.priority as TodoItem["priority"],
      category: formData.category || "Uncategorized",
      tags: formData.tags || [],
      dateCreated: task?.dateCreated || new Date(),
      dateUpdated: new Date(),
      description: formData.description,
      subTasks: formData.subTasks || [],
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{task ? "Edit Task" : "Add New Task"}</DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                name="title"
                label="Title"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.title || ""}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={formData.status || "not-started"}
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

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  name="priority"
                  value={formData.priority || 3}
                  onChange={handleSelectChange}
                >
                  <MenuItem value={1}>P1</MenuItem>
                  <MenuItem value={2}>P2</MenuItem>
                  <MenuItem value={3}>P3</MenuItem>
                  <MenuItem value={4}>P4</MenuItem>
                  <MenuItem value={5}>P5</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={formData.category || ""}
                  onChange={handleSelectChange}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                  <MenuItem value="Uncategorized">Uncategorized</MenuItem>
                  <MenuItem value="New">
                    <em>+ Add New Category</em>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="horizon-label">Horizon</InputLabel>
                <Select
                  labelId="horizon-label"
                  name="horizon"
                  value={formData.tags?.find((t) => t.startsWith("H")) || ""}
                  onChange={(e) => {
                    const newHorizon = e.target.value as string;
                    const tags = [...(formData.tags || [])];
                    const horizonIndex = tags.findIndex((t) => t.startsWith("H"));
                    
                    if (horizonIndex >= 0) {
                      if (newHorizon) {
                        tags[horizonIndex] = newHorizon;
                      } else {
                        tags.splice(horizonIndex, 1);
                      }
                    } else if (newHorizon) {
                      tags.push(newHorizon);
                    }
                    
                    setFormData((prev) => ({ ...prev, tags }));
                  }}
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="H1">H1 (Now)</MenuItem>
                  <MenuItem value="H2">H2 (Next)</MenuItem>
                  <MenuItem value="H3">H3 (Future)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="description"
                label="Description"
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                value={formData.description || ""}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={!formData.title}
        >
          {task ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TodoManager; 