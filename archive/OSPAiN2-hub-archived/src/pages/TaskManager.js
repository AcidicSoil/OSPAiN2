"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const TodoManager_1 = __importDefault(require("../components/todo/TodoManager"));
/**
 * TaskManager Page
 *
 * Displays a comprehensive task management interface for the master-todo.mdc file
 * This page serves as a complete implementation of the TodoManager component,
 * allowing users to view, filter, sort, and manage all tasks in the system.
 */
const TaskManager = () => {
    return (<material_1.Box sx={{
            height: "calc(100vh - 100px)",
            display: "flex",
            flexDirection: "column",
        }}>
      <material_1.Paper elevation={0} sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            background: "linear-gradient(90deg, rgba(43,83,129,1) 0%, rgba(38,109,150,1) 100%)",
            color: "white",
        }}>
        <material_1.Typography variant="h4" component="h1" gutterBottom>
          Task Manager
        </material_1.Typography>
        <material_1.Typography variant="body1">
          Comprehensive task management for all items in the master-todo.mdc
          file
        </material_1.Typography>
      </material_1.Paper>

      <material_1.Box sx={{ flexGrow: 1, overflow: "hidden" }}>
        <TodoManager_1.default className="task-manager-component"/>
      </material_1.Box>
    </material_1.Box>);
};
exports.default = TaskManager;
//# sourceMappingURL=TaskManager.js.map