import React, { useEffect, useState } from "react";
import {
  RateLimitMonitor,
  RateLimitHistory,
  RateLimitSettingsComponent,
} from "../components/rate-limit";
import rateLimitService from "../services/RateLimitService";
import { useRateLimit } from "../context/RateLimitContext";
import { Chip, Box, Typography, Alert } from "@mui/material";

/**
 * RateLimitDemo Page
 *
 * Demonstrates the rate limit components and functionality.
 * This page allows users to:
 * - View current rate limit status
 * - See tool call history
 * - Configure rate limit settings
 * - Simulate tool calls to test the functionality
 * - Monitor real-time tool calls
 */
const RateLimitDemo = () => {
  // Get rate limit context
  const { latestToolCall, settings } = useRateLimit();

  // State for real-time notifications
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "warning" | "error" | "info";
    timestamp: number;
  } | null>(null);

  // Display notification when a new tool call is detected
  useEffect(() => {
    if (latestToolCall) {
      setNotification({
        message: `Tool call detected: ${latestToolCall.tool}`,
        type: latestToolCall.status as "success" | "warning" | "error",
        timestamp: Date.now(),
      });

      // Auto-clear notification after 3 seconds
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [latestToolCall]);

  // Function to simulate a tool call
  const simulateToolCall = (
    status: "success" | "warning" | "error" = "success"
  ) => {
    const tools = [
      "codebase_search",
      "read_file",
      "run_terminal_cmd",
      "list_dir",
      "grep_search",
      "edit_file",
      "file_search",
      "delete_file",
      "reapply",
      "fetch_rules",
      "web_search",
    ];

    // Select a random tool
    const randomTool = tools[Math.floor(Math.random() * tools.length)];

    // Record the tool call
    rateLimitService.recordToolCall(randomTool, status);
  };

  // Function to force a reset (for demo purposes)
  const forceReset = () => {
    rateLimitService.forceReset();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Rate Limit Management
      </h1>

      {/* Real-time notification */}
      {notification && (
        <div className="mb-4">
          <Alert severity={notification.type} sx={{ mb: 2 }}>
            {notification.message} -{" "}
            {new Date(notification.timestamp).toLocaleTimeString()}
          </Alert>
        </div>
      )}

      {/* Real-time monitoring status indicator */}
      <div className="mb-4">
        <div className="flex items-center">
          <div
            className={`w-3 h-3 rounded-full mr-2 ${
              settings.realTimeMonitoring
                ? "bg-green-500 animate-pulse"
                : "bg-gray-400"
            }`}
          ></div>
          <span className="text-sm font-medium">
            {settings.realTimeMonitoring
              ? "Real-Time Monitoring Active"
              : "Real-Time Monitoring Inactive"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Current Status
          </h2>
          <RateLimitMonitor className="mb-6" />

          {/* Latest Tool Call (if real-time monitoring is enabled) */}
          {settings.realTimeMonitoring && latestToolCall && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <h3 className="text-md font-medium text-gray-800 dark:text-white mb-2">
                Latest Tool Call
              </h3>
              <div className="text-sm">
                <p className="flex justify-between">
                  <span>Tool:</span>
                  <span className="font-mono">{latestToolCall.tool}</span>
                </p>
                <p className="flex justify-between">
                  <span>Status:</span>
                  <span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        latestToolCall.status === "success"
                          ? "bg-green-100 text-green-800"
                          : latestToolCall.status === "warning"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {latestToolCall.status}
                    </span>
                  </span>
                </p>
                <p className="flex justify-between">
                  <span>Time:</span>
                  <span>
                    {new Date(latestToolCall.timestamp).toLocaleTimeString()}
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => simulateToolCall("success")}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300"
            >
              Simulate Success
            </button>
            <button
              onClick={() => simulateToolCall("warning")}
              className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 focus:ring-4 focus:outline-none focus:ring-yellow-300"
            >
              Simulate Warning
            </button>
            <button
              onClick={() => simulateToolCall("error")}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300"
            >
              Simulate Error
            </button>
            <button
              onClick={forceReset}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300"
            >
              Force Reset
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
              Compact View
            </h3>
            <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
              <RateLimitMonitor compact />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Settings
          </h2>
          <RateLimitSettingsComponent className="mb-6" />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          Tool Call History
          {settings.realTimeMonitoring && (
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              Real-Time
            </span>
          )}
        </h2>
        <RateLimitHistory limit={15} />
      </div>
    </div>
  );
};

export default RateLimitDemo;
