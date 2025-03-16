"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const RateLimitContext_1 = require("../context/RateLimitContext");
const ToolCallMonitor_1 = __importDefault(require("../components/rate-limit/ToolCallMonitor"));
const TodoProgress_1 = __importDefault(require("../components/todo/TodoProgress"));
const Speed_1 = __importDefault(require("@mui/icons-material/Speed"));
const Build_1 = __importDefault(require("@mui/icons-material/Build"));
const SmartToy_1 = __importDefault(require("@mui/icons-material/SmartToy"));
const Storage_1 = __importDefault(require("@mui/icons-material/Storage"));
const Settings_1 = __importDefault(require("@mui/icons-material/Settings"));
const History_1 = __importDefault(require("@mui/icons-material/History"));
const Code_1 = __importDefault(require("@mui/icons-material/Code"));
const Insights_1 = __importDefault(require("@mui/icons-material/Insights"));
const Extension_1 = __importDefault(require("@mui/icons-material/Extension"));
/**
 * Dashboard Component
 *
 * The main landing page of the application that provides an overview of all main features
 * and quick access to key functionality.
 */
const Dashboard = () => {
    const { status, history } = (0, RateLimitContext_1.useRateLimit)();
    const [systemStatus, setSystemStatus] = (0, react_1.useState)("Operational");
    // Simulating system status check
    (0, react_1.useEffect)(() => {
        const checkSystemStatus = () => {
            // In a real app, this would check various services
            const services = [
                { name: "API Service", status: "operational" },
                { name: "Database", status: "operational" },
                { name: "Model Server", status: "operational" },
                { name: "Authentication", status: "operational" },
            ];
            const hasIssues = services.some((service) => service.status !== "operational");
            setSystemStatus(hasIssues ? "Issues Detected" : "Operational");
        };
        checkSystemStatus();
        const interval = setInterval(checkSystemStatus, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);
    // Get recent tool usage stats
    const recentToolUsage = history.slice(0, 5).reduce((acc, item) => {
        acc[item.tool] = (acc[item.tool] || 0) + 1;
        return acc;
    }, {});
    const sortedTools = Object.entries(recentToolUsage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    return (<div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome to OSPAiN₂ - Ollama Sovereign Personalized AI Network
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">System Status</h2>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${systemStatus === "Operational"
            ? "bg-green-500"
            : "bg-yellow-500"}`}></div>
            <span>{systemStatus}</span>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Last Connection</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date().toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Tool Call Status</h2>
          <ToolCallMonitor_1.default showBypassButton={true} showResetTime={true}/>
          <div className="mt-4">
            <react_router_dom_1.Link to="/rate-limit-manager" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
              <Speed_1.default fontSize="small" className="mr-1"/>
              Manage Rate Limits
            </react_router_dom_1.Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Active Bypass Method</h2>
          <div className="flex items-center mb-3">
            <div className={`w-3 h-3 rounded-full mr-2 ${status.bypassStatus === "active" ? "bg-blue-500" : "bg-gray-300"}`}></div>
            <span className="font-medium">
              {status.bypassStatus === "active"
            ? `${status.currentMethod} (Active)`
            : "None Active"}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {status.bypassStatus === "active"
            ? "Bypass is currently active and handling rate limits"
            : "No bypass is currently active"}
          </p>
          <div className="mt-4">
            <react_router_dom_1.Link to="/settings" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
              <Settings_1.default fontSize="small" className="mr-1"/>
              Configure Bypass Settings
            </react_router_dom_1.Link>
          </div>
        </div>
      </div>

      {/* Project Progress */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Insights_1.default className="mr-2"/> Project Progress
        </h2>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <TodoProgress_1.default showCategories={true}/>
        </div>
        <div className="mt-4 flex justify-end">
          <react_router_dom_1.Link to="/progress-dashboard" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
            <Insights_1.default fontSize="small" className="mr-1"/>
            View Full Progress Dashboard
          </react_router_dom_1.Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <react_router_dom_1.Link to="/tool-manager" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-center text-center">
            <Build_1.default className="text-blue-600 dark:text-blue-400 text-3xl mb-3"/>
            <h3 className="font-medium mb-1">Tool Manager</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage and configure tools
            </p>
          </react_router_dom_1.Link>

          <react_router_dom_1.Link to="/agent-demo" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-center text-center">
            <SmartToy_1.default className="text-purple-600 dark:text-purple-400 text-3xl mb-3"/>
            <h3 className="font-medium mb-1">Agent Demo</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Try out AI agents
            </p>
          </react_router_dom_1.Link>

          <react_router_dom_1.Link to="/knowledge-graph" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-center text-center">
            <Storage_1.default className="text-green-600 dark:text-green-400 text-3xl mb-3"/>
            <h3 className="font-medium mb-1">Knowledge Graph</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Browse connected knowledge
            </p>
          </react_router_dom_1.Link>

          <react_router_dom_1.Link to="/component-manager" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-center text-center">
            <Extension_1.default className="text-amber-600 dark:text-amber-400 text-3xl mb-3"/>
            <h3 className="font-medium mb-1">Component Manager</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Evaluate and absorb components
            </p>
          </react_router_dom_1.Link>

          <react_router_dom_1.Link to="/rate-limit-manager" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-center text-center">
            <Speed_1.default className="text-red-600 dark:text-red-400 text-3xl mb-3"/>
            <h3 className="font-medium mb-1">Rate Limits</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monitor and manage API usage
            </p>
          </react_router_dom_1.Link>
        </div>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3 flex items-center">
            <History_1.default className="mr-2"/> Recent Tool Usage
          </h2>
          {sortedTools.length > 0 ? (<div className="space-y-3">
              {sortedTools.map(([tool, count]) => (<div key={tool} className="flex items-center">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{
                    width: `${(count / Math.max(...sortedTools.map((t) => t[1]))) *
                        100}%`,
                }}></div>
                  </div>
                  <div className="flex justify-between items-center w-32">
                    <span className="text-sm truncate mr-2">{tool}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {count}
                    </span>
                  </div>
                </div>))}
            </div>) : (<p className="text-gray-500 dark:text-gray-400 text-sm">
              No tool usage data available yet
            </p>)}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3 flex items-center">
            <Code_1.default className="mr-2"/> Development Resources
          </h2>
          <div className="space-y-3">
            <a href="https://github.com/yourusername/OSPAiN2-hub" target="_blank" rel="noopener noreferrer" className="block p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <h3 className="font-medium mb-1">GitHub Repository</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Access source code and contribute
              </p>
            </a>

            <a href="https://ollama.ai/docs" target="_blank" rel="noopener noreferrer" className="block p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <h3 className="font-medium mb-1">Ollama Documentation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Learn about Ollama ecosystem
              </p>
            </a>

            <div className="block p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <h3 className="font-medium mb-1">Current Version</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                OSPAiN₂ v0.1.0-alpha
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>);
};
exports.default = Dashboard;
//# sourceMappingURL=Dashboard.js.map