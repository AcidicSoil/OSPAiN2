"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const useMisconceptionPatterns_1 = __importDefault(require("../../hooks/useMisconceptionPatterns"));
const MisconceptionPatternGraph3D_1 = __importDefault(require("./MisconceptionPatternGraph3D"));
const MisconceptionPatternVisualizer = ({ wsEndpoint, height = '600px', width = '100%', }) => {
    const { patterns, analysis, isLoading, error, selectedPattern, setSelectedPattern } = (0, useMisconceptionPatterns_1.default)(wsEndpoint);
    if (error) {
        return (<div className="p-4 bg-red-100 border border-red-400 rounded-lg">
        <h3 className="text-red-700 font-semibold">Error</h3>
        <p className="text-red-600">{error.message}</p>
      </div>);
    }
    return (<div className="grid grid-cols-4 gap-4">
      {/* Main 3D Visualization */}
      <div className="col-span-3">
        <MisconceptionPatternGraph3D_1.default patterns={patterns} onPatternSelect={setSelectedPattern} height={height} width={width}/>
      </div>

      {/* Analysis Panel */}
      <div className="col-span-1 bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Pattern Analysis</h2>
        
        {isLoading ? (<div className="text-blue-300">Loading analysis...</div>) : (<div className="space-y-6">
            {/* Selected Pattern Info */}
            {selectedPattern && (<div className="bg-gray-700 p-3 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-2">Selected Pattern</h3>
                <div className="space-y-2 text-gray-200">
                  <p>Type: {selectedPattern.type}</p>
                  <p>Severity: {selectedPattern.severity}</p>
                  <p>Impact: {selectedPattern.impact}</p>
                  <p>Occurrences: {selectedPattern.occurrences}</p>
                </div>
              </div>)}

            {/* Pattern Statistics */}
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-medium mb-2">Distribution by Type</h3>
                <div className="space-y-1">
                  {Object.entries(analysis.typeDistribution).map(([type, count]) => (<div key={type} className="flex justify-between text-gray-300">
                      <span>{type}</span>
                      <span>{count}</span>
                    </div>))}
                </div>
              </div>

              <div>
                <h3 className="text-white font-medium mb-2">Distribution by Severity</h3>
                <div className="space-y-1">
                  {Object.entries(analysis.severityDistribution).map(([severity, count]) => (<div key={severity} className="flex justify-between text-gray-300">
                      <span>{severity}</span>
                      <span>{count}</span>
                    </div>))}
                </div>
              </div>

              <div>
                <h3 className="text-white font-medium mb-2">Distribution by Impact</h3>
                <div className="space-y-1">
                  {Object.entries(analysis.impactDistribution).map(([impact, count]) => (<div key={impact} className="flex justify-between text-gray-300">
                      <span>{impact}</span>
                      <span>{count}</span>
                    </div>))}
                </div>
              </div>
            </div>

            {/* Most Common Patterns */}
            <div>
              <h3 className="text-white font-medium mb-2">Most Common Patterns</h3>
              <div className="space-y-2">
                {analysis.mostCommonPatterns.map(pattern => (<div key={pattern.id} className="bg-gray-700 p-2 rounded cursor-pointer hover:bg-gray-600" onClick={() => setSelectedPattern(pattern)}>
                    <p className="text-gray-200">{pattern.type}</p>
                    <p className="text-gray-400 text-sm">{pattern.occurrences} occurrences</p>
                  </div>))}
              </div>
            </div>

            {/* Recent Patterns */}
            <div>
              <h3 className="text-white font-medium mb-2">Recent Patterns</h3>
              <div className="space-y-2">
                {analysis.recentPatterns.map(pattern => (<div key={pattern.id} className="bg-gray-700 p-2 rounded cursor-pointer hover:bg-gray-600" onClick={() => setSelectedPattern(pattern)}>
                    <p className="text-gray-200">{pattern.type}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(pattern.timestamp).toLocaleString()}
                    </p>
                  </div>))}
              </div>
            </div>
          </div>)}
      </div>
    </div>);
};
exports.default = MisconceptionPatternVisualizer;
//# sourceMappingURL=MisconceptionPatternVisualizer.js.map