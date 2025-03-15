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
const react_1 = __importStar(require("react"));
const RuleMatrixDashboard_1 = __importDefault(require("./RuleMatrixDashboard"));
const rules_1 = require("../rules");
/**
 * Rule Matrix Container Component
 *
 * Container component that integrates the Rule Matrix Dashboard with backend services.
 * Handles loading rules, relationships, and visualization generation.
 */
const RuleMatrixContainer = () => {
    // State for rules and relationships
    const [rules, setRules] = (0, react_1.useState)([]);
    const [relationships, setRelationships] = (0, react_1.useState)([]);
    // State for loading status and errors
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    // State for visualization result
    const [visualizationUrl, setVisualizationUrl] = (0, react_1.useState)(null);
    // Knowledge Graph instance
    const [knowledgeGraph] = (0, react_1.useState)(() => new rules_1.KnowledgeGraph());
    // Rule Matrix Visualizer instance
    const [visualizer] = (0, react_1.useState)(() => new rules_1.RuleMatrixVisualizer(knowledgeGraph));
    // Load rules and relationships on component mount
    (0, react_1.useEffect)(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // In a real implementation, these would be API calls
                const rulesResponse = await fetch('/api/rules');
                const rules = await rulesResponse.json();
                const relationshipsResponse = await fetch('/api/relationships');
                const relationships = await relationshipsResponse.json();
                setRules(rules);
                setRelationships(relationships);
                setError(null);
            }
            catch (err) {
                console.error('Error loading data:', err);
                setError('Failed to load rule data. Please try again later.');
                // For demo purposes, load mock data if API calls fail
                setRules(mockRules);
                setRelationships(mockRelationships);
            }
            finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);
    // Handle visualization generation
    const handleVisualize = async (rules, relationships, options) => {
        try {
            setLoading(true);
            // Generate HTML visualization
            const outputPath = `visualization-${Date.now()}.html`;
            // In a real implementation, this would be an API call
            // For now, we'll use our local visualizer instance
            await visualizer.generateSemanticHtmlVisualization(rules, relationships, outputPath, options);
            // Set the URL for the visualization
            // In a real implementation, this would be a URL to the generated file
            setVisualizationUrl(`/visualizations/${outputPath}`);
            setError(null);
        }
        catch (err) {
            console.error('Error generating visualization:', err);
            setError('Failed to generate visualization. Please try again later.');
        }
        finally {
            setLoading(false);
        }
    };
    // Handle export
    const handleExport = async (format) => {
        try {
            setLoading(true);
            // In a real implementation, this would be an API call to export the visualization
            const exportUrl = `/api/export?format=${format}&timestamp=${Date.now()}`;
            // Download the exported file
            window.open(exportUrl, '_blank');
            setError(null);
        }
        catch (err) {
            console.error('Error exporting visualization:', err);
            setError('Failed to export visualization. Please try again later.');
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="rule-matrix-container">
      {loading && (<div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>)}
      
      {error && (<div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>)}
      
      <RuleMatrixDashboard_1.default rules={rules} relationships={relationships} onVisualize={handleVisualize} onExport={handleExport}/>
      
      {visualizationUrl && (<div className="visualization-container">
          <h2>Visualization Result</h2>
          <iframe src={visualizationUrl} title="Rule Matrix Visualization" width="100%" height="600px" style={{ border: '1px solid #ddd', borderRadius: '4px' }}/>
        </div>)}
      
      <style jsx>{`
        .rule-matrix-container {
          position: relative;
          padding-bottom: 30px;
        }
        
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.8);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .loading-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 2s linear infinite;
          margin-bottom: 20px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .error-message button {
          background-color: #c62828;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .visualization-container {
          margin-top: 30px;
        }
        
        .visualization-container h2 {
          font-size: 20px;
          margin-bottom: 15px;
        }
      `}</style>
    </div>);
};
// Mock data for demo purposes
const mockRules = [
    {
        id: 'tool-call-optimization.mdc',
        name: 'Tool Call Optimization',
        path: 'rules/tool-call-optimization.mdc',
        filePath: 'rules/tool-call-optimization.mdc',
        description: 'Optimizes tool calls for better performance',
        currentType: 'conditional',
        tags: ['optimization', 'tool-calls', 'performance'],
        content: null,
    },
    {
        id: 'context-aware-prompt-engine.mdc',
        name: 'Context-Aware Prompt Engine',
        path: 'rules/context-aware-prompt-engine.mdc',
        filePath: 'rules/context-aware-prompt-engine.mdc',
        description: 'Enhances prompts with contextual information',
        currentType: 'auto_applied',
        tags: ['prompts', 'context', 'enhancement'],
        content: null,
    },
    {
        id: 'devdocs-source.mdc',
        name: 'DevDocs Source',
        path: 'rules/devdocs-source.mdc',
        filePath: 'rules/devdocs-source.mdc',
        description: 'Documentation source from DevDocs',
        currentType: 'manual',
        tags: ['documentation', 'reference', 'devdocs'],
        content: null,
    },
    {
        id: 'distributed-computation.mdc',
        name: 'Distributed Computation',
        path: 'rules/distributed-computation.mdc',
        filePath: 'rules/distributed-computation.mdc',
        description: 'Manages distributed computational resources',
        currentType: 'agent_requested',
        tags: ['computation', 'distribution', 'resources'],
        content: null,
    },
    {
        id: 'dont-reply-back.mdc',
        name: 'Dont Reply Back',
        path: 'rules/dont-reply-back.mdc',
        filePath: 'rules/dont-reply-back.mdc',
        description: 'Prevents unnecessary responses',
        currentType: 'conditional',
        tags: ['response', 'workflow', 'communication'],
        content: null,
    },
];
const mockRelationships = [
    {
        sourceRule: 'tool-call-optimization.mdc',
        targetRule: 'distributed-computation.mdc',
        relationshipType: 'depends-on',
        strength: 0.8,
        description: 'Tool call optimization depends on distributed computation',
    },
    {
        sourceRule: 'context-aware-prompt-engine.mdc',
        targetRule: 'tool-call-optimization.mdc',
        relationshipType: 'extends',
        strength: 0.7,
        description: 'Context-aware prompt engine extends tool call optimization',
    },
    {
        sourceRule: 'devdocs-source.mdc',
        targetRule: 'dont-reply-back.mdc',
        relationshipType: 'complements',
        strength: 0.5,
        description: 'DevDocs source complements dont reply back',
    },
    {
        sourceRule: 'distributed-computation.mdc',
        targetRule: 'devdocs-source.mdc',
        relationshipType: 'conflicts-with',
        strength: 0.3,
        description: 'Distributed computation conflicts with DevDocs source',
    },
];
exports.default = RuleMatrixContainer;
//# sourceMappingURL=RuleMatrixContainer.js.map