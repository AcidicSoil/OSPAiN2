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
const MisconceptionPatternGraph3D_1 = __importDefault(require("./MisconceptionPatternGraph3D"));
const material_1 = require("@mui/material");
// Sample data for demonstration
const samplePatterns = [
    {
        id: '1',
        name: 'Type Coercion Confusion',
        description: 'Misconceptions about how JavaScript handles type conversion in operations',
        frequency: 0.8,
        connections: ['2', '4', '5'],
    },
    {
        id: '2',
        name: 'Scope Misunderstanding',
        description: 'Confusion about variable scope and hoisting in JavaScript',
        frequency: 0.7,
        connections: ['1', '3'],
    },
    {
        id: '3',
        name: 'Promise Confusion',
        description: 'Misunderstanding how Promises work and handle asynchronous operations',
        frequency: 0.9,
        connections: ['2', '5'],
    },
    {
        id: '4',
        name: 'This Context Issues',
        description: 'Confusion about how "this" context is determined in different situations',
        frequency: 0.6,
        connections: ['1', '5'],
    },
    {
        id: '5',
        name: 'Event Loop Misunderstanding',
        description: 'Misconceptions about how the JavaScript event loop processes tasks',
        frequency: 0.75,
        connections: ['1', '3', '4'],
    },
];
const MisconceptionPatternGraphDemo = () => {
    const [selectedPattern, setSelectedPattern] = (0, react_1.useState)(samplePatterns[0]);
    const handlePatternSelect = (pattern) => {
        setSelectedPattern(pattern);
    };
    return (<material_1.Box sx={{ p: 3 }}>
      <material_1.Typography variant="h4" component="h1" gutterBottom>
        Knowledge Graph Visualization
      </material_1.Typography>

      <material_1.Typography variant="body1" paragraph>
        This demo visualizes common misconception patterns and their relationships in a 3D
        interactive graph. Each node represents a misconception pattern, with the size and color
        indicating its frequency. Connections between nodes represent related concepts.
      </material_1.Typography>

      <material_1.Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mt: 3 }}>
        {/* 3D Graph */}
        <material_1.Card sx={{ flex: 2 }}>
          <material_1.CardContent>
            <material_1.Typography variant="h6" component="h2" gutterBottom>
              3D Pattern Graph
            </material_1.Typography>
            <material_1.Paper elevation={3} sx={{
            height: 500,
            overflow: 'hidden',
            borderRadius: 2,
        }}>
              <MisconceptionPatternGraph3D_1.default patterns={samplePatterns} onPatternSelect={handlePatternSelect}/>
            </material_1.Paper>
            <material_1.Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
              Interact with the graph: Click nodes to select, drag to rotate, scroll to zoom.
            </material_1.Typography>
          </material_1.CardContent>
        </material_1.Card>

        {/* Selected Pattern Details */}
        <material_1.Card sx={{ flex: 1, minWidth: 300 }}>
          <material_1.CardContent>
            <material_1.Typography variant="h6" component="h2" gutterBottom>
              Selected Pattern Details
            </material_1.Typography>

            {selectedPattern ? (<>
                <material_1.Typography variant="h5" component="div" gutterBottom>
                  {selectedPattern.name}
                </material_1.Typography>

                <material_1.Typography variant="body2" color="text.secondary" paragraph>
                  {selectedPattern.description}
                </material_1.Typography>

                <material_1.Typography variant="subtitle2">
                  Frequency: {(selectedPattern.frequency * 100).toFixed(0)}%
                </material_1.Typography>

                <material_1.Divider sx={{ my: 2 }}/>

                <material_1.Typography variant="subtitle2" gutterBottom>
                  Connected Patterns:
                </material_1.Typography>

                <material_1.List dense>
                  {selectedPattern.connections.map((connId) => {
                const connectedPattern = samplePatterns.find((p) => p.id === connId);
                return connectedPattern ? (<material_1.ListItem key={connId}>
                        <material_1.ListItemText primary={connectedPattern.name} secondary={`Frequency: ${(connectedPattern.frequency * 100).toFixed(0)}%`}/>
                      </material_1.ListItem>) : null;
            })}
                </material_1.List>
              </>) : (<material_1.Typography variant="body1">Select a node from the graph to see details.</material_1.Typography>)}
          </material_1.CardContent>
        </material_1.Card>
      </material_1.Box>

      <material_1.Box sx={{ mt: 4 }}>
        <material_1.Typography variant="subtitle1" gutterBottom>
          How to use this visualization:
        </material_1.Typography>
        <ul>
          <li>Click on a node to view detailed information about that misconception pattern</li>
          <li>Drag the graph to rotate the view</li>
          <li>Use the scroll wheel to zoom in and out</li>
          <li>Observe the connections between patterns to understand relationships</li>
          <li>Node size and color indicate the frequency of the misconception</li>
        </ul>
      </material_1.Box>
    </material_1.Box>);
};
exports.default = MisconceptionPatternGraphDemo;
//# sourceMappingURL=MisconceptionPatternGraphDemo.js.map