import React, { useState } from 'react';
import MisconceptionPatternGraph3D from './MisconceptionPatternGraph3D';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';

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

const MisconceptionPatternGraphDemo: React.FC = () => {
  const [selectedPattern, setSelectedPattern] = useState(samplePatterns[0]);

  const handlePatternSelect = (pattern: (typeof samplePatterns)[0]) => {
    setSelectedPattern(pattern);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Knowledge Graph Visualization
      </Typography>

      <Typography variant="body1" paragraph>
        This demo visualizes common misconception patterns and their relationships in a 3D
        interactive graph. Each node represents a misconception pattern, with the size and color
        indicating its frequency. Connections between nodes represent related concepts.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mt: 3 }}>
        {/* 3D Graph */}
        <Card sx={{ flex: 2 }}>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom>
              3D Pattern Graph
            </Typography>
            <Paper
              elevation={3}
              sx={{
                height: 500,
                overflow: 'hidden',
                borderRadius: 2,
              }}
            >
              <MisconceptionPatternGraph3D
                patterns={samplePatterns}
                onPatternSelect={handlePatternSelect}
              />
            </Paper>
            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
              Interact with the graph: Click nodes to select, drag to rotate, scroll to zoom.
            </Typography>
          </CardContent>
        </Card>

        {/* Selected Pattern Details */}
        <Card sx={{ flex: 1, minWidth: 300 }}>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom>
              Selected Pattern Details
            </Typography>

            {selectedPattern ? (
              <>
                <Typography variant="h5" component="div" gutterBottom>
                  {selectedPattern.name}
                </Typography>

                <Typography variant="body2" color="text.secondary" paragraph>
                  {selectedPattern.description}
                </Typography>

                <Typography variant="subtitle2">
                  Frequency: {(selectedPattern.frequency * 100).toFixed(0)}%
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Connected Patterns:
                </Typography>

                <List dense>
                  {selectedPattern.connections.map((connId) => {
                    const connectedPattern = samplePatterns.find((p) => p.id === connId);
                    return connectedPattern ? (
                      <ListItem key={connId}>
                        <ListItemText
                          primary={connectedPattern.name}
                          secondary={`Frequency: ${(connectedPattern.frequency * 100).toFixed(0)}%`}
                        />
                      </ListItem>
                    ) : null;
                  })}
                </List>
              </>
            ) : (
              <Typography variant="body1">Select a node from the graph to see details.</Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          How to use this visualization:
        </Typography>
        <ul>
          <li>Click on a node to view detailed information about that misconception pattern</li>
          <li>Drag the graph to rotate the view</li>
          <li>Use the scroll wheel to zoom in and out</li>
          <li>Observe the connections between patterns to understand relationships</li>
          <li>Node size and color indicate the frequency of the misconception</li>
        </ul>
      </Box>
    </Box>
  );
};

export default MisconceptionPatternGraphDemo;
