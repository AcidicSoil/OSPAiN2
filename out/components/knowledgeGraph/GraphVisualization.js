"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphVisualization = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const react_force_graph_2d_1 = __importDefault(require("react-force-graph-2d"));
const KnowledgeGraphService_1 = __importDefault(require("../../services/KnowledgeGraphService"));
const GraphVisualization = () => {
    const [graphData, setGraphData] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const graphRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        loadGraphData();
    }, []);
    const loadGraphData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await KnowledgeGraphService_1.default.getGraphData();
            setGraphData(data);
        }
        catch (error) {
            console.error('Error loading graph data:', error);
            setError('Failed to load graph data. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    const handleRefreshGraph = () => {
        loadGraphData();
    };
    return (<material_1.Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <material_1.Typography variant="h5">Knowledge Graph</material_1.Typography>
        <material_1.Button onClick={handleRefreshGraph} disabled={loading}>
          Refresh Graph
        </material_1.Button>
      </material_1.Box>

      <material_1.Box sx={{ flexGrow: 1, position: 'relative', minHeight: '400px' }}>
        {loading ? (<material_1.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <material_1.CircularProgress />
          </material_1.Box>) : error ? (<material_1.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <material_1.Typography color="error">{error}</material_1.Typography>
          </material_1.Box>) : graphData && graphData.nodes.length > 0 ? (<react_force_graph_2d_1.default ref={graphRef} graphData={graphData} nodeLabel="name" nodeColor={(node) => node.color || '#1976d2'} nodeVal={(node) => node.val || 1} linkWidth={(link) => link.value || 1} linkColor={() => '#999'} width={800} height={600}/>) : (<material_1.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <material_1.Typography>No graph data available</material_1.Typography>
          </material_1.Box>)}
      </material_1.Box>
    </material_1.Paper>);
};
exports.GraphVisualization = GraphVisualization;
// Add default export
exports.default = exports.GraphVisualization;
//# sourceMappingURL=GraphVisualization.js.map