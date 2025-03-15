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
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const TaskMaster_1 = __importDefault(require("../services/TaskMaster"));
const styles_1 = require("@mui/material/styles");
const TaskContainer = (0, styles_1.styled)(material_1.Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    margin: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
}));
const TaskList = (0, styles_1.styled)(material_1.List)(({ theme }) => ({
    width: "100%",
    backgroundColor: theme.palette.background.paper,
}));
const TaskItem = (0, styles_1.styled)(material_1.ListItem)(({ theme }) => ({
    marginBottom: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
}));
const TaskMasterUI = () => {
    const [tasks, setTasks] = (0, react_1.useState)([]);
    const [serverStatus, setServerStatus] = (0, react_1.useState)("checking");
    (0, react_1.useEffect)(() => {
        // Start task monitoring
        TaskMaster_1.default.startTaskMonitoring();
        TaskMaster_1.default.monitorConsoleErrors();
        // Update tasks periodically
        const updateInterval = setInterval(() => {
            setTasks(TaskMaster_1.default.getCurrentTasks());
        }, 1000);
        // Check server status periodically
        const checkServer = async () => {
            try {
                await TaskMaster_1.default.checkLocalServer();
                setServerStatus("running");
            }
            catch {
                setServerStatus("stopped");
            }
        };
        checkServer();
        const serverInterval = setInterval(checkServer, 5000);
        return () => {
            clearInterval(updateInterval);
            clearInterval(serverInterval);
        };
    }, []);
    const getStatusColor = (status) => {
        const colors = {
            pending: "default",
            "in-progress": "primary",
            completed: "success",
            failed: "error",
        };
        return colors[status] || "default";
    };
    const getPriorityColor = (priority) => {
        const colors = {
            high: "error",
            medium: "warning",
            low: "info",
        };
        return colors[priority] || "default";
    };
    return (<material_1.Box>
      <TaskContainer>
        <material_1.Grid container spacing={2}>
          <material_1.Grid item xs={12}>
            <material_1.Typography variant="h5" gutterBottom>
              Task Master Control Panel
            </material_1.Typography>
          </material_1.Grid>
          <material_1.Grid item xs={12}>
            <material_1.Chip label={`Server: ${serverStatus}`} color={serverStatus === "running" ? "success" : "error"} sx={{ marginRight: 1 }}/>
            <material_1.Chip label={`Active Tasks: ${tasks.length}`} color="primary"/>
          </material_1.Grid>
          <material_1.Grid item xs={12}>
            <TaskList>
              {tasks.map((task) => (<TaskItem key={task.id}>
                  <material_1.ListItemText primary={task.description} secondary={<react_1.default.Fragment>
                        <material_1.Chip size="small" label={`Status: ${task.status}`} color={getStatusColor(task.status)} sx={{ marginRight: 1 }}/>
                        <material_1.Chip size="small" label={`Priority: ${task.priority}`} color={getPriorityColor(task.priority)}/>
                      </react_1.default.Fragment>}/>
                  {task.status === "pending" && (<material_1.IconButton onClick={() => TaskMaster_1.default.startTask(task.id)} color="primary">
                      <icons_material_1.PlayArrow />
                    </material_1.IconButton>)}
                  {task.status === "in-progress" && (<material_1.IconButton onClick={() => TaskMaster_1.default.completeTask(task.id)} color="success">
                      <icons_material_1.Check />
                    </material_1.IconButton>)}
                  {task.status === "in-progress" && (<material_1.IconButton onClick={() => TaskMaster_1.default.failTask(task.id)} color="error">
                      <icons_material_1.Error />
                    </material_1.IconButton>)}
                </TaskItem>))}
            </TaskList>
          </material_1.Grid>
          <material_1.Grid item xs={12}>
            <material_1.Button variant="contained" onClick={() => TaskMaster_1.default.checkLocalServer()} color="primary">
              Check Server Status
            </material_1.Button>
          </material_1.Grid>
        </material_1.Grid>
      </TaskContainer>
    </material_1.Box>);
};
exports.default = TaskMasterUI;
//# sourceMappingURL=TaskMasterUI.js.map