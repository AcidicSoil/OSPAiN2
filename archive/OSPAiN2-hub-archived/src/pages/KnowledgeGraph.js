"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const Storage_1 = __importDefault(require("@mui/icons-material/Storage"));
const Search_1 = __importDefault(require("@mui/icons-material/Search"));
const Folder_1 = __importDefault(require("@mui/icons-material/Folder"));
const BubbleChart_1 = __importDefault(require("@mui/icons-material/BubbleChart"));
/**
 * Knowledge Graph Page Component
 *
 * Displays and allows interaction with the application's knowledge graph,
 * showing relationships between different entities and concepts.
 */
const KnowledgeGraph = () => {
    return (<div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center">
          <Storage_1.default className="mr-2"/> Knowledge Graph
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore connections between concepts and data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Graph Summary</h3>
            <BubbleChart_1.default className="text-blue-600 dark:text-blue-400"/>
          </div>
          <div className="text-2xl font-bold">248</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Nodes</div>

          <div className="text-2xl font-bold mt-2">612</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Relationships
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Categories</h3>
            <Folder_1.default className="text-green-600 dark:text-green-400"/>
          </div>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li className="flex justify-between">
              <span>Concepts</span>
              <span className="font-medium">86</span>
            </li>
            <li className="flex justify-between">
              <span>Tools</span>
              <span className="font-medium">42</span>
            </li>
            <li className="flex justify-between">
              <span>Files</span>
              <span className="font-medium">57</span>
            </li>
            <li className="flex justify-between">
              <span>Commands</span>
              <span className="font-medium">35</span>
            </li>
            <li className="flex justify-between">
              <span>Agents</span>
              <span className="font-medium">28</span>
            </li>
          </ul>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <Search_1.default className="text-gray-400 mr-2"/>
            <input type="text" placeholder="Search knowledge graph..." className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"/>
          </div>

          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            <BubbleChart_1.default style={{ fontSize: 48 }} className="mb-2 mx-auto text-blue-500 opacity-50"/>
            <p>Knowledge Graph Visualization</p>
            <p className="text-sm mt-2">Coming soon...</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Additions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Node
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Connections
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Added
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {[
            {
                id: "1",
                name: "Rate Limit Bypass",
                type: "Concept",
                connections: 8,
                added: "2 hours ago",
            },
            {
                id: "2",
                name: "Tool Call Monitoring",
                type: "Feature",
                connections: 5,
                added: "3 hours ago",
            },
            {
                id: "3",
                name: "Session Rotation",
                type: "Method",
                connections: 3,
                added: "4 hours ago",
            },
            {
                id: "4",
                name: "Token Management",
                type: "Method",
                connections: 4,
                added: "6 hours ago",
            },
        ].map((item) => (<tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium">{item.name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm">{item.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm">{item.connections}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {item.added}
                  </td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
};
exports.default = KnowledgeGraph;
//# sourceMappingURL=KnowledgeGraph.js.map