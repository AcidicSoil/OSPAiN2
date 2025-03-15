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
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
/**
 * Rule Matrix Dashboard Component
 *
 * Provides a web interface for configuring and displaying the rule matrix visualization
 * with advanced NLP and semantic analysis capabilities.
 */
const RuleMatrixDashboard = ({ rules, relationships, onVisualize, onExport }) => {
    // State for visualization options
    const [options, setOptions] = (0, react_1.useState)({
        groupBy: 'type',
        minRelationshipStrength: 0.2,
        showOrphanedNodes: true,
        showSemanticConnections: true,
        minSemanticSimilarity: 0.3,
        includeSentimentAnalysis: true,
        includeKeyPhrases: true,
        includeEntities: true
    });
    // State for rule type filters
    const [includedTypes, setIncludedTypes] = (0, react_1.useState)([]);
    const [excludedTypes, setExcludedTypes] = (0, react_1.useState)([]);
    // State for thematic and content type filters
    const [themeFilters, setThemeFilters] = (0, react_1.useState)([]);
    const [contentTypeFilters, setContentTypeFilters] = (0, react_1.useState)([]);
    // Available rule types, themes, and content types
    const [availableTypes, setAvailableTypes] = (0, react_1.useState)([]);
    const [availableThemes, setAvailableThemes] = (0, react_1.useState)([]);
    const [availableContentTypes, setAvailableContentTypes] = (0, react_1.useState)([]);
    // Extract available options from rules
    (0, react_1.useEffect)(() => {
        // Extract unique rule types
        const types = Array.from(new Set(rules.map(rule => rule.currentType)));
        setAvailableTypes(types);
        // Set default included types (all available types)
        setIncludedTypes(types);
        // Extract themes and content types (in a real implementation, these would come from the backend)
        setAvailableThemes(['development', 'design', 'documentation', 'architecture', 'security', 'performance']);
        setAvailableContentTypes(['code', 'documentation', 'configuration', 'instruction']);
    }, [rules]);
    // Handle group by change
    const handleGroupByChange = (event) => {
        const value = event.target.value;
        setOptions(prev => ({ ...prev, groupBy: value }));
    };
    // Handle slider changes
    const handleSliderChange = (event) => {
        const { name, value } = event.target;
        setOptions(prev => ({ ...prev, [name]: parseFloat(value) }));
    };
    // Handle checkbox changes
    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setOptions(prev => ({ ...prev, [name]: checked }));
    };
    // Handle rule type inclusion/exclusion
    const handleTypeSelect = (event) => {
        const selectedOptions = Array.from(event.target.selectedOptions).map(option => option.value);
        setIncludedTypes(selectedOptions);
        setOptions(prev => ({ ...prev, includeTypes: selectedOptions }));
    };
    // Handle theme filters
    const handleThemeSelect = (event) => {
        const selectedThemes = Array.from(event.target.selectedOptions).map(option => option.value);
        setThemeFilters(selectedThemes);
        setOptions(prev => ({ ...prev, filterByTheme: selectedThemes }));
    };
    // Handle content type filters
    const handleContentTypeSelect = (event) => {
        const selectedContentTypes = Array.from(event.target.selectedOptions).map(option => option.value);
        setContentTypeFilters(selectedContentTypes);
        setOptions(prev => ({ ...prev, filterByContentType: selectedContentTypes }));
    };
    // Handle visualization button click
    const handleVisualize = () => {
        onVisualize(rules, relationships, options);
    };
    // Handle export button click
    const handleExport = (format) => {
        onExport(format);
    };
    return (<div className="rule-matrix-dashboard">
      <div className="dashboard-header">
        <h1>Rule Matrix Visualization</h1>
        <p>Configure visualization options with advanced semantic analysis</p>
      </div>
      
      <div className="control-panel">
        <div className="control-section">
          <h2>Basic Options</h2>
          
          <div className="control-group">
            <label htmlFor="groupBy">Group By:</label>
            <select id="groupBy" value={options.groupBy} onChange={handleGroupByChange}>
              <option value="type">Rule Type</option>
              <option value="directory">Directory</option>
              <option value="contentType">Content Type</option>
              <option value="thematic">Thematic Group</option>
              <option value="sentiment">Sentiment</option>
            </select>
          </div>
          
          <div className="control-group">
            <label htmlFor="minRelationshipStrength">
              Minimum Relationship Strength: {options.minRelationshipStrength}
            </label>
            <input type="range" id="minRelationshipStrength" name="minRelationshipStrength" min="0" max="1" step="0.1" value={options.minRelationshipStrength} onChange={handleSliderChange}/>
          </div>
          
          <div className="control-group">
            <label>
              <input type="checkbox" name="showOrphanedNodes" checked={options.showOrphanedNodes} onChange={handleCheckboxChange}/>
              Show Orphaned Nodes
            </label>
          </div>
        </div>
        
        <div className="control-section">
          <h2>Semantic Analysis Options</h2>
          
          <div className="control-group">
            <label>
              <input type="checkbox" name="showSemanticConnections" checked={options.showSemanticConnections} onChange={handleCheckboxChange}/>
              Show Semantic Connections
            </label>
          </div>
          
          <div className="control-group">
            <label htmlFor="minSemanticSimilarity">
              Minimum Semantic Similarity: {options.minSemanticSimilarity}
            </label>
            <input type="range" id="minSemanticSimilarity" name="minSemanticSimilarity" min="0" max="1" step="0.1" value={options.minSemanticSimilarity} onChange={handleSliderChange} disabled={!options.showSemanticConnections}/>
          </div>
          
          <div className="control-group">
            <label>
              <input type="checkbox" name="includeSentimentAnalysis" checked={options.includeSentimentAnalysis} onChange={handleCheckboxChange}/>
              Include Sentiment Analysis
            </label>
          </div>
          
          <div className="control-group">
            <label>
              <input type="checkbox" name="includeKeyPhrases" checked={options.includeKeyPhrases} onChange={handleCheckboxChange}/>
              Include Key Phrases
            </label>
          </div>
          
          <div className="control-group">
            <label>
              <input type="checkbox" name="includeEntities" checked={options.includeEntities} onChange={handleCheckboxChange}/>
              Include Named Entities
            </label>
          </div>
        </div>
        
        <div className="control-section">
          <h2>Filters</h2>
          
          <div className="control-group">
            <label htmlFor="includeTypes">Include Rule Types:</label>
            <select id="includeTypes" multiple value={includedTypes} onChange={handleTypeSelect} className="multi-select">
              {availableTypes.map(type => (<option key={type} value={type}>{type}</option>))}
            </select>
          </div>
          
          <div className="control-group">
            <label htmlFor="filterByTheme">Filter by Theme:</label>
            <select id="filterByTheme" multiple value={themeFilters} onChange={handleThemeSelect} className="multi-select">
              {availableThemes.map(theme => (<option key={theme} value={theme}>{theme}</option>))}
            </select>
          </div>
          
          <div className="control-group">
            <label htmlFor="filterByContentType">Filter by Content Type:</label>
            <select id="filterByContentType" multiple value={contentTypeFilters} onChange={handleContentTypeSelect} className="multi-select">
              {availableContentTypes.map(contentType => (<option key={contentType} value={contentType}>{contentType}</option>))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="action-buttons">
        <button className="btn btn-primary" onClick={handleVisualize}>
          Generate Visualization
        </button>
        <div className="export-buttons">
          <button className="btn btn-secondary" onClick={() => handleExport('html')}>
            Export as HTML
          </button>
          <button className="btn btn-secondary" onClick={() => handleExport('json')}>
            Export as JSON
          </button>
          <button className="btn btn-secondary" onClick={() => handleExport('svg')}>
            Export as SVG
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .rule-matrix-dashboard {
          font-family: Arial, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .dashboard-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .dashboard-header h1 {
          font-size: 24px;
          margin-bottom: 10px;
        }
        
        .control-panel {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .control-section {
          background: #f5f5f5;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .control-section h2 {
          font-size: 18px;
          margin-top: 0;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #ddd;
        }
        
        .control-group {
          margin-bottom: 15px;
        }
        
        .control-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        
        select, input[type="range"] {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: white;
        }
        
        .multi-select {
          height: 120px;
        }
        
        .action-buttons {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
        }
        
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: background-color 0.3s;
        }
        
        .btn-primary {
          background-color: #4caf50;
          color: white;
          font-size: 16px;
        }
        
        .btn-primary:hover {
          background-color: #3e8e41;
        }
        
        .btn-secondary {
          background-color: #f1f1f1;
          color: #333;
          margin-left: 10px;
        }
        
        .btn-secondary:hover {
          background-color: #ddd;
        }
        
        .export-buttons {
          display: flex;
        }
      `}</style>
    </div>);
};
exports.default = RuleMatrixDashboard;
//# sourceMappingURL=RuleMatrixDashboard.js.map