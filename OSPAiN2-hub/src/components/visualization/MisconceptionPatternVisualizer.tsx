import React, { useState } from 'react';
import MisconceptionPatternGraph3D from './MisconceptionPatternGraph3D';
import { Box, Paper, Typography, Divider } from '@mui/material';

// Keep the interface structure intact
export interface MisconceptionPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  connections: string[];
}

interface MisconceptionPatternVisualizerProps {
  patterns: MisconceptionPattern[];
  title?: string;
  description?: string;
  height?: string;
  width?: string;
}

/**
 * Visualizer component for misconception patterns
 * Uses simplified non-3D visualization
 */
const MisconceptionPatternVisualizer: React.FC<MisconceptionPatternVisualizerProps> = ({
  patterns,
  title = 'Pattern Visualization',
  description = 'Explore common patterns and their relationships',
  height = '450px',
  width = '100%',
}) => {
  const [selectedPattern, setSelectedPattern] = useState<MisconceptionPattern | null>(null);

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 2, mb: 2, backgroundColor: 'transparent' }}>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Paper>

      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
        <Box flex={1}>
          <MisconceptionPatternGraph3D
            patterns={patterns}
            onPatternSelect={setSelectedPattern}
            height={height}
            width={width}
          />
        </Box>

        <Box width={{ xs: '100%', md: '300px' }} p={2} bgcolor="background.paper" borderRadius={1}>
          <Typography variant="h6" gutterBottom>
            Pattern Details
          </Typography>

          {selectedPattern ? (
            <>
              <Typography variant="subtitle1">{selectedPattern.name}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" paragraph>
                {selectedPattern.description}
              </Typography>
              <Typography variant="body2">
                <strong>Frequency:</strong> {selectedPattern.frequency}
              </Typography>
              <Typography variant="body2">
                <strong>Connected to:</strong>{' '}
                {selectedPattern.connections
                  .map((id) => patterns.find((p) => p.id === id)?.name || id)
                  .join(', ')}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Select a pattern to view details
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MisconceptionPatternVisualizer;
