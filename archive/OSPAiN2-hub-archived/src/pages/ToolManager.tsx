import { useState } from "react";
import BuildIcon from "@mui/icons-material/Build";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CodeIcon from "@mui/icons-material/Code";

/**
 * Tool Manager Page Component
 *
 * Allows users to view, add, edit, and delete tools that can be used
 * by the application. Shows tool usage statistics and configuration options.
 */
const ToolManager = () => {
  // Sample tools data - in a real app, this would come from an API or context
  const [tools, setTools] = useState([
    {
      id: "1",
      name: "codebase_search",
      description: "Search for code in the codebase",
      category: "Code Analysis",
      usageCount: 28,
      enabled: true,
    },
    {
      id: "2",
      name: "read_file",
      description: "Read the contents of a file",
      category: "File Operations",
      usageCount: 42,
      enabled: true,
    },
    {
      id: "3",
      name: "edit_file",
      description: "Edit a file",
      category: "File Operations",
      usageCount: 35,
      enabled: true,
    },
    {
      id: "4",
      name: "run_terminal_cmd",
      description: "Execute terminal commands",
      category: "System",
      usageCount: 15,
      enabled: true,
    },
    {
      id: "5",
      name: "grep_search",
      description: "Search for text patterns",
      category: "Code Analysis",
      usageCount: 20,
      enabled: true,
    },
  ]);

  const [filterCategory, setFilterCategory] = useState("All");
  const categories = ["All", "Code Analysis", "File Operations", "System"];

  // Filter tools based on selected category
  const filteredTools =
    filterCategory === "All"
      ? tools
      : tools.filter((tool) => tool.category === filterCategory);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center">
          <BuildIcon className="mr-2" /> Tool Manager
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure and manage tools available to the AI assistant
        </p>
      </div>

      <div className="flex justify-between mb-6">
        <div className="flex space-x-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              className={`px-4 py-2 rounded-lg ${
                filterCategory === category
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-white"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
          <AddIcon className="mr-1" /> Add Tool
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tool Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Usage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTools.map((tool) => (
              <tr
                key={tool.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <CodeIcon className="text-gray-500 mr-2" />
                    <span className="font-medium">{tool.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900 dark:text-gray-300">
                    {tool.description}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 dark:text-gray-300">
                    {tool.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 dark:text-gray-300">
                    {tool.usageCount} calls
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${
                      tool.enabled
                        ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                        : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                    }`}
                  >
                    {tool.enabled ? "Enabled" : "Disabled"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                    <EditIcon fontSize="small" />
                  </button>
                  <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                    <DeleteIcon fontSize="small" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ToolManager;
