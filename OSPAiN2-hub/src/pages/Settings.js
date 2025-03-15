"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const react_toastify_1 = require("react-toastify");
const RateLimitContext_1 = require("../context/RateLimitContext");
const Settings_1 = __importDefault(require("@mui/icons-material/Settings"));
const Security_1 = __importDefault(require("@mui/icons-material/Security"));
const Speed_1 = __importDefault(require("@mui/icons-material/Speed"));
const Build_1 = __importDefault(require("@mui/icons-material/Build"));
const Code_1 = __importDefault(require("@mui/icons-material/Code"));
/**
 * Settings Page Component
 *
 * Provides configuration options for the application, with a focus on rate limit bypass settings.
 * Users can configure auto-bypass, bypass methods, thresholds, notifications, and real-time monitoring.
 */
const Settings = () => {
    const { settings, updateSettings } = (0, RateLimitContext_1.useRateLimit)();
    const [formState, setFormState] = (0, react_1.useState)(settings);
    const [activeTab, setActiveTab] = (0, react_1.useState)("rate-limits");
    (0, react_1.useEffect)(() => {
        setFormState(settings);
    }, [settings]);
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormState((prev) => ({
            ...prev,
            [name]: type === "checkbox"
                ? e.target.checked
                : type === "number"
                    ? parseInt(value)
                    : value,
        }));
    };
    const handleArrayChange = (event, index) => {
        const newExcludedTools = [...formState.excludedTools];
        newExcludedTools[index] = event.target.value;
        setFormState((prev) => ({
            ...prev,
            excludedTools: newExcludedTools,
        }));
    };
    const addExcludedTool = () => {
        setFormState((prev) => ({
            ...prev,
            excludedTools: [...prev.excludedTools, ""],
        }));
    };
    const removeExcludedTool = (index) => {
        const newExcludedTools = [...formState.excludedTools];
        newExcludedTools.splice(index, 1);
        setFormState((prev) => ({
            ...prev,
            excludedTools: newExcludedTools,
        }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        updateSettings(formState);
        react_toastify_1.toast.success("Settings saved successfully!");
    };
    const handleRealTimeMonitoringChange = (e) => {
        const isEnabled = e.target.checked;
        setFormState((prev) => ({
            ...prev,
            realTimeMonitoring: isEnabled,
        }));
    };
    const resetToDefaults = () => {
        if (window.confirm("Are you sure you want to reset all settings to defaults?")) {
            const defaultSettings = {
                toolCallLimit: 25,
                resetIntervalMinutes: 180,
                notificationThreshold: 80,
                enableNotifications: true,
                autoBypass: true,
                bypassMethod: "session-rotation",
                monitorInterval: 30,
                excludedTools: ["codebase_search", "read_file"],
                customBypassRules: "",
                realTimeMonitoring: true,
            };
            setFormState(defaultSettings);
            updateSettings(defaultSettings);
            react_toastify_1.toast.info("Settings have been reset to defaults");
        }
    };
    return (<div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center">
          <Settings_1.default className="mr-2"/> Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure application settings and preferences
        </p>
      </div>

      <div className="flex mb-6">
        <div className="flex space-x-2">
          <button className={`px-4 py-2 rounded-lg flex items-center ${activeTab === "rate-limits"
            ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-white"
            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}`} onClick={() => setActiveTab("rate-limits")}>
            <Speed_1.default className="mr-2" fontSize="small"/>
            Rate Limits
          </button>

          <button className={`px-4 py-2 rounded-lg flex items-center ${activeTab === "tools"
            ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-white"
            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}`} onClick={() => setActiveTab("tools")}>
            <Build_1.default className="mr-2" fontSize="small"/>
            Tools
          </button>

          <button className={`px-4 py-2 rounded-lg flex items-center ${activeTab === "security"
            ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-white"
            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}`} onClick={() => setActiveTab("security")}>
            <Security_1.default className="mr-2" fontSize="small"/>
            Security
          </button>

          <button className={`px-4 py-2 rounded-lg flex items-center ${activeTab === "advanced"
            ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-white"
            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}`} onClick={() => setActiveTab("advanced")}>
            <Code_1.default className="mr-2" fontSize="small"/>
            Advanced
          </button>
        </div>
      </div>

      {activeTab === "rate-limits" && (<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Speed_1.default className="mr-2"/> Rate Limit Settings
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">
                  Bypass Configuration
                </h3>

                <div className="mb-4">
                  <div className="flex items-center mb-1">
                    <input type="checkbox" id="autoBypass" name="autoBypass" checked={formState.autoBypass} onChange={handleChange} className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                    <label htmlFor="autoBypass" className="text-sm font-medium">
                      Enable automatic bypass
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Automatically applies bypass methods when approaching the
                    rate limit
                  </p>
                </div>

                <div className="mb-4">
                  <label htmlFor="bypassMethod" className="block text-sm font-medium mb-1">
                    Bypass Method
                  </label>
                  <select id="bypassMethod" name="bypassMethod" value={formState.bypassMethod} onChange={handleChange} className="w-full rounded-md border border-gray-300 shadow-sm p-2 text-sm
                               dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="session-rotation">Session Rotation</option>
                    <option value="token-management">Token Management</option>
                    <option value="model-fallback">Model Fallback</option>
                    <option value="cache-optimization">
                      Cache Optimization
                    </option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Method used to bypass rate limits when triggered
                  </p>
                </div>

                <div className="mb-4">
                  <label htmlFor="notificationThreshold" className="block text-sm font-medium mb-1">
                    Threshold Percentage
                  </label>
                  <div className="flex items-center">
                    <input type="range" id="notificationThreshold" name="notificationThreshold" min="50" max="95" step="5" value={formState.notificationThreshold} onChange={handleChange} className="w-full"/>
                    <span className="ml-2 text-sm font-medium">
                      {formState.notificationThreshold}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Percentage of rate limit at which bypass is triggered
                  </p>
                </div>

                <h3 className="text-lg font-medium mb-4 mt-6">
                  Real-Time Monitoring
                </h3>
                <div className="mb-4">
                  <div className="flex items-center mb-1">
                    <input type="checkbox" id="realTimeMonitoring" name="realTimeMonitoring" checked={formState.realTimeMonitoring} onChange={handleRealTimeMonitoringChange} className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                    <label htmlFor="realTimeMonitoring" className="text-sm font-medium">
                      Enable real-time monitoring
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Monitor tool calls in real-time for immediate feedback and
                    action
                  </p>
                </div>

                <div className="mb-4">
                  <label htmlFor="monitorInterval" className="block text-sm font-medium mb-1">
                    Monitor Interval (seconds)
                  </label>
                  <div className="flex items-center">
                    <input type="range" id="monitorInterval" name="monitorInterval" min="1" max="60" step="1" value={formState.monitorInterval} onChange={handleChange} className="w-full"/>
                    <span className="ml-2 text-sm font-medium">
                      {formState.monitorInterval}s
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formState.realTimeMonitoring
                ? "With real-time monitoring enabled, the actual check interval will be at most 1 second"
                : "Frequency of status checks when real-time monitoring is disabled"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">
                  Notification Settings
                </h3>

                <div className="mb-4">
                  <div className="flex items-center mb-1">
                    <input type="checkbox" id="enableNotifications" name="enableNotifications" checked={formState.enableNotifications} onChange={handleChange} className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                    <label htmlFor="enableNotifications" className="text-sm font-medium">
                      Enable notifications
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Show notifications for rate limit events and bypass actions
                  </p>
                </div>

                <h3 className="text-lg font-medium mb-4 mt-6">
                  Excluded Tools
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Tools that will not trigger the rate limit counter
                </p>

                {formState.excludedTools.map((tool, index) => (<div key={index} className="flex items-center mb-2">
                    <input type="text" value={tool} onChange={(e) => handleArrayChange(e, index)} className="flex-1 rounded-md border border-gray-300 shadow-sm p-2 text-sm
                                dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Enter tool name"/>
                    <button type="button" onClick={() => removeExcludedTool(index)} className="ml-2 p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                      Remove
                    </button>
                  </div>))}

                <button type="button" onClick={addExcludedTool} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-md dark:bg-gray-700 dark:text-gray-300">
                  + Add Tool
                </button>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <button type="button" onClick={resetToDefaults} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md 
                          hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                Reset to Defaults
              </button>

              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md 
                          hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
                Save Settings
              </button>
            </div>
          </form>
        </div>)}

      {activeTab === "tools" && (<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Tool Settings</h2>
          <p className="text-gray-600 dark:text-gray-400">
            This section will contain tool-specific configuration options.
          </p>
        </div>)}

      {activeTab === "security" && (<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
          <p className="text-gray-600 dark:text-gray-400">
            This section will contain security and privacy configuration
            options.
          </p>
        </div>)}

      {activeTab === "advanced" && (<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Advanced Settings</h2>
          <p className="text-gray-600 dark:text-gray-400">
            This section will contain advanced configuration options.
          </p>
        </div>)}
    </div>);
};
exports.default = Settings;
//# sourceMappingURL=Settings.js.map