"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const TodoManager_1 = __importDefault(require("../components/todo/TodoManager"));
const TasksPage = () => {
    return (<div className="pt-16 pl-20 md:pl-64">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Tasks</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <TodoManager_1.default />
        </div>
      </div>
    </div>);
};
exports.default = TasksPage;
//# sourceMappingURL=TasksPage.js.map