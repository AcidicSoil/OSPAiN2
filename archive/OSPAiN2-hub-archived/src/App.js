"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const Layout_1 = __importDefault(require("./components/layout/Layout"));
const Dashboard_1 = __importDefault(require("./pages/Dashboard"));
const RateLimitManager_1 = __importDefault(require("./pages/RateLimitManager"));
const RateLimitDemo_1 = __importDefault(require("./pages/RateLimitDemo"));
const ToolManager_1 = __importDefault(require("./pages/ToolManager"));
const AgentDemo_1 = __importDefault(require("./pages/AgentDemo"));
const KnowledgeGraph_1 = __importDefault(require("./pages/KnowledgeGraph"));
const Settings_1 = __importDefault(require("./pages/Settings"));
const ProgressDashboard_1 = __importDefault(require("./pages/ProgressDashboard"));
const RateLimitContext_1 = require("./context/RateLimitContext");
const WorkerDemo_1 = require("./pages/WorkerDemo");
const DebugDashboard_1 = __importDefault(require("./pages/DebugDashboard"));
const ComponentManagerPage_1 = __importDefault(require("./pages/ComponentManagerPage"));
const TaskManager_1 = __importDefault(require("./pages/TaskManager"));
const ErrorBoundary_1 = __importDefault(require("./components/ErrorBoundary"));
/**
 * Main App Component
 *
 * Sets up the routing structure and wraps the application with
 * the necessary providers for state management.
 */
const App = () => {
    return (<ErrorBoundary_1.default>
      <RateLimitContext_1.RateLimitProvider>
        <react_router_dom_1.Routes>
          <react_router_dom_1.Route path="/" element={<Layout_1.default />}>
            <react_router_dom_1.Route index element={<ErrorBoundary_1.default>
                  <Dashboard_1.default />
                </ErrorBoundary_1.default>}/>
            <react_router_dom_1.Route path="rate-limit-manager" element={<ErrorBoundary_1.default>
                  <RateLimitManager_1.default />
                </ErrorBoundary_1.default>}/>
            <react_router_dom_1.Route path="rate-limit-demo" element={<ErrorBoundary_1.default>
                  <RateLimitDemo_1.default />
                </ErrorBoundary_1.default>}/>
            <react_router_dom_1.Route path="tool-manager" element={<ErrorBoundary_1.default>
                  <ToolManager_1.default />
                </ErrorBoundary_1.default>}/>
            <react_router_dom_1.Route path="agent-demo" element={<ErrorBoundary_1.default>
                  <AgentDemo_1.default />
                </ErrorBoundary_1.default>}/>
            <react_router_dom_1.Route path="knowledge-graph" element={<ErrorBoundary_1.default>
                  <KnowledgeGraph_1.default />
                </ErrorBoundary_1.default>}/>
            <react_router_dom_1.Route path="progress-dashboard" element={<ErrorBoundary_1.default>
                  <ProgressDashboard_1.default />
                </ErrorBoundary_1.default>}/>
            <react_router_dom_1.Route path="task-manager" element={<ErrorBoundary_1.default>
                  <TaskManager_1.default />
                </ErrorBoundary_1.default>}/>
            <react_router_dom_1.Route path="worker-demo" element={<ErrorBoundary_1.default>
                  <WorkerDemo_1.WorkerDemo />
                </ErrorBoundary_1.default>}/>
            <react_router_dom_1.Route path="settings" element={<ErrorBoundary_1.default>
                  <Settings_1.default />
                </ErrorBoundary_1.default>}/>
            <react_router_dom_1.Route path="debug" element={<ErrorBoundary_1.default>
                  <DebugDashboard_1.default />
                </ErrorBoundary_1.default>}/>
            <react_router_dom_1.Route path="component-manager" element={<ErrorBoundary_1.default>
                  <ComponentManagerPage_1.default />
                </ErrorBoundary_1.default>}/>
          </react_router_dom_1.Route>
        </react_router_dom_1.Routes>
      </RateLimitContext_1.RateLimitProvider>
    </ErrorBoundary_1.default>);
};
exports.default = App;
//# sourceMappingURL=App.js.map