import { useEffect, useState } from "react";
import rateLimitService, {
  RateLimitStatus,
} from "../../services/RateLimitService";

interface RateLimitMonitorProps {
  compact?: boolean;
  showResetTime?: boolean;
  className?: string;
}

/**
 * RateLimitMonitor Component
 *
 * Displays the current status of tool call rate limits, including:
 * - Current usage vs. limit
 * - Percentage usage as a progress bar
 * - Status indicator
 * - Reset time countdown
 *
 * Two display modes:
 * - Standard: Full information with all details
 * - Compact: Minimal display for embedding in other UI elements
 */
const RateLimitMonitor = ({
  compact = false,
  showResetTime = true,
  className = "",
}: RateLimitMonitorProps) => {
  const [status, setStatus] = useState<RateLimitStatus>(
    rateLimitService.getStatus()
  );

  useEffect(() => {
    // Subscribe to status updates
    const unsubscribe = rateLimitService.registerListener((newStatus) => {
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
  const getStatusText = (status: RateLimitStatus): string => {
    if (status.isApproachingLimit) {
      if (status.percentage >= 90) return "Critical";
      return "Warning";
    }
    return "Normal";
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
          Rate Limit Monitor
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
            status.percentage >= 90
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
              : status.percentage >= 75
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
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

      <div className="text-xs text-gray-500 dark:text-gray-400">
        <span>
          {status.isApproachingLimit
            ? "Approaching rate limit"
            : "Rate limit normal"}
        </span>
      </div>
    </div>
  );
};

export default RateLimitMonitor;
