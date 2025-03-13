import { useState } from "react";
import { NavLink } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BuildIcon from "@mui/icons-material/Build";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import StorageIcon from "@mui/icons-material/Storage";
import SpeedIcon from "@mui/icons-material/Speed";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import InsightsIcon from "@mui/icons-material/Insights";
import WorkIcon from "@mui/icons-material/Work";
import HomeIcon from "@mui/icons-material/Home";
import BugReportIcon from "@mui/icons-material/BugReport";
import ExtensionIcon from "@mui/icons-material/Extension";
import TaskIcon from "@mui/icons-material/Task";

import ToolCallMonitor from "../rate-limit/ToolCallMonitor";

interface SidebarProps {
  isOpen: boolean;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

/**
 * Sidebar Component
 *
 * Provides navigation for the application and displays a tool call monitor.
 * Can be toggled open/closed via the isOpen prop.
 */
const Sidebar = ({ isOpen }: SidebarProps) => {
  const navItems: NavItem[] = [
    { path: "/", label: "Dashboard", icon: <HomeIcon /> },
    { path: "/tool-manager", label: "Tool Manager", icon: <BuildIcon /> },
    { path: "/agent-demo", label: "Agent Demo", icon: <SmartToyIcon /> },
    {
      path: "/knowledge-graph",
      label: "Knowledge Graph",
      icon: <StorageIcon />,
    },
    {
      path: "/task-manager",
      label: "Task Manager",
      icon: <TaskIcon />,
    },
    {
      path: "/component-manager",
      label: "Component Manager",
      icon: <ExtensionIcon />,
    },
    {
      path: "/progress-dashboard",
      label: "Progress Tracker",
      icon: <InsightsIcon />,
    },
    {
      path: "/worker-demo",
      label: "Worker System",
      icon: <WorkIcon />,
    },
    {
      path: "/rate-limit-manager",
      label: "Rate Limit Manager",
      icon: <SpeedIcon />,
    },
    { path: "/debug", label: "Debug Console", icon: <BugReportIcon /> },
    { path: "/settings", label: "Settings", icon: <SettingsIcon /> },
  ];

  return (
    <aside
      className={`transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed h-full z-20 top-16 left-0 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="h-full px-3 py-4 overflow-y-auto">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center p-2 rounded-lg 
                ${
                  isActive
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                }
                ${!isOpen ? "justify-center" : ""}
              `}
            >
              <span className="min-w-[24px]">{item.icon}</span>
              {isOpen && <span className="ml-3">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {isOpen && (
          <div className="mt-8 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tool Call Monitor
            </h3>
            <ToolCallMonitor compact={true} />

            <div className="mt-4">
              <NavLink
                to="/rate-limit-manager"
                className="flex items-center justify-center w-full p-2 text-xs font-medium text-gray-800 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <SpeedIcon fontSize="small" className="mr-1" />
                Manage Rate Limits
              </NavLink>
            </div>
          </div>
        )}

        {isOpen && (
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 px-3">
            <a
              href="https://github.com/yourusername/OSPAiN2-hub"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-2 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <MenuBookIcon fontSize="small" className="mr-2" />
              Documentation
            </a>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
