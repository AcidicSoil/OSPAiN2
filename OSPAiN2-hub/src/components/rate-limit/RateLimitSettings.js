"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const RateLimitService_1 = __importDefault(require("../../services/RateLimitService"));
/**
 * RateLimitSettings Component
 *
 * Allows users to configure rate limit settings, including:
 * - Tool call limit
 * - Reset interval
 * - Notification threshold
 * - Enable/disable notifications
 */
const RateLimitSettingsComponent = ({ className = "", }) => {
    const [settings, setSettings] = (0, react_1.useState)(RateLimitService_1.default.getSettings());
    const [isEditing, setIsEditing] = (0, react_1.useState)(false);
    const [formValues, setFormValues] = (0, react_1.useState)(settings);
    // Update local state when service settings change
    (0, react_1.useEffect)(() => {
        setSettings(RateLimitService_1.default.getSettings());
        setFormValues(RateLimitService_1.default.getSettings());
    }, []);
    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormValues({
            ...formValues,
            [name]: type === "checkbox"
                ? e.target.checked
                : type === "number"
                    ? parseInt(value, 10)
                    : value,
        });
    };
    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        RateLimitService_1.default.updateSettings(formValues);
        setSettings(formValues);
        setIsEditing(false);
    };
    // Handle reset to defaults
    const handleReset = () => {
        RateLimitService_1.default.resetSettings();
        const defaultSettings = RateLimitService_1.default.getSettings();
        setSettings(defaultSettings);
        setFormValues(defaultSettings);
        setIsEditing(false);
    };
    // Toggle edit mode
    const toggleEdit = () => {
        if (isEditing) {
            // Cancel editing - reset form values
            setFormValues(settings);
        }
        setIsEditing(!isEditing);
    };
    // View-only mode
    if (!isEditing) {
        return (<div className={`p-4 bg-white rounded-lg shadow dark:bg-gray-800 ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Rate Limit Settings
          </h3>
          <button onClick={toggleEdit} className="px-3 py-1 text-xs font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800">
            Edit
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tool Call Limit:
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {settings.toolCallLimit}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Reset Interval:
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {settings.resetIntervalMinutes} minutes
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Notification Threshold:
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {settings.notificationThreshold}%
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Notifications:
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {settings.enableNotifications ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>
      </div>);
    }
    // Edit mode
    return (<div className={`p-4 bg-white rounded-lg shadow dark:bg-gray-800 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Edit Rate Limit Settings
        </h3>
        <button onClick={toggleEdit} className="px-3 py-1 text-xs font-medium text-center text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-gray-700">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="toolCallLimit" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Tool Call Limit
          </label>
          <input type="number" id="toolCallLimit" name="toolCallLimit" value={formValues.toolCallLimit} onChange={handleInputChange} min="1" max="100" className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
        </div>

        <div>
          <label htmlFor="resetIntervalMinutes" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Reset Interval (minutes)
          </label>
          <input type="number" id="resetIntervalMinutes" name="resetIntervalMinutes" value={formValues.resetIntervalMinutes} onChange={handleInputChange} min="1" className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
        </div>

        <div>
          <label htmlFor="notificationThreshold" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Notification Threshold (%)
          </label>
          <input type="number" id="notificationThreshold" name="notificationThreshold" value={formValues.notificationThreshold} onChange={handleInputChange} min="1" max="100" className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
        </div>

        <div className="flex items-center">
          <input type="checkbox" id="enableNotifications" name="enableNotifications" checked={formValues.enableNotifications} onChange={handleInputChange} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"/>
          <label htmlFor="enableNotifications" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Enable Notifications
          </label>
        </div>

        <div className="flex justify-between pt-4">
          <button type="button" onClick={handleReset} className="px-4 py-2 text-sm font-medium text-center text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-gray-700">
            Reset to Defaults
          </button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800">
            Save Changes
          </button>
        </div>
      </form>
    </div>);
};
exports.default = RateLimitSettingsComponent;
//# sourceMappingURL=RateLimitSettings.js.map