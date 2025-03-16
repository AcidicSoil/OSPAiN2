import { useEffect, useState } from "react";
import rateLimitBypassService, {
  ToolCallStatus,
} from "../../services/RateLimitBypassService";

interface ToolCallMonitorProps {
  compact?: boolean;
  showBypassButton?: boolean;
  showResetTime?: boolean;
  className?: string;
}

/**
 * ToolCallMonitor Component
 *
 * Displays the current status of tool call rate limits, including:
 * - Current usage vs. limit
 * - Percentage usage as a progress bar
 * - Bypass status indicator
 * - Reset time countdown
 *
 * Two display modes:
 * - Standard: Full information with all details
 * - Compact: Minimal display for embedding in other UI elements
 */
const ToolCallMonitor = ({
  compact = false,
  showBypassButton = false,
  showResetTime = true,
  className = "",
}: ToolCallMonitorProps) => {
  const [status, setStatus] = useState<ToolCallStatus>(
    rateLimitBypassService.getStatus()
  );

  useEffect(() => {
    // Subscribe to status updates
    const unsubscribe = rateLimitBypassService.registerListener((newStatus) => {
      setStatus(newStatus);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Helper function to get color based on percentage
  const getColorClass = (percentage: number): string => {
    if (percentage < 50) return "bg-green-500";
    if (percentage < 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Helper function to get status text
  const getStatusText = (status: ToolCallStatus): string => {
    if (status.bypassStatus === "active") return "Bypass Active";
    if (status.bypassStatus === "pending") return "Bypass Pending";
    if (status.percentage >= 90) return "Critical";
    if (status.percentage >= 75) return "Warning";
    return "Normal";
  };

  // Helper function to handle manual bypass
  const handleManualBypass = () => {
    rateLimitBypassService.executeBypass();
  };

  // Compact display version
  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-24 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
          <div
            className={`h-2.5 rounded-full ${getColorClass(status.percentage)}`}
            style={{ width: `${status.percentage}%` }}
          ></div>
        </div>
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
          {status.current}/{status.limit}
        </span>
      </div>
    );
  }

  // Full display version
  return (
    <div
      className={`p-4 bg-white rounded-lg shadow dark:bg-gray-800 ${className}`}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Tool Call Monitor
        </h3>
        {showResetTime && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Reset: {status.nextReset}
          </span>
        )}
      </div>

      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Usage: {status.current}/{status.limit}
        </span>
        <span
          className={`text-sm font-medium px-2.5 py-0.5 rounded-full 
          ${
            status.bypassStatus === "active"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
              : status.percentage >= 75
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          }`}
        >
          {getStatusText(status)}
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-3">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${getColorClass(
            status.percentage
          )}`}
          style={{ width: `${status.percentage}%` }}
        ></div>
      </div>

      <div className="flex flex-col md:flex-row justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          {status.currentMethod
            ? `Method: ${status.currentMethod}`
            : "No bypass active"}
        </span>

        {showBypassButton &&
          status.bypassStatus !== "active" &&
          status.bypassStatus !== "pending" && (
            <button
              onClick={handleManualBypass}
              className="mt-2 md:mt-0 px-3 py-1 text-xs font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
            >
              Manual Bypass
            </button>
          )}
      </div>
    </div>
  );
};

export default ToolCallMonitor;
