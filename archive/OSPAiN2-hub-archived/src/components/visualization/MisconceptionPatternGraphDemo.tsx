import React, { useState } from 'react';
import MisconceptionPatternGraph3D from './MisconceptionPatternGraph3D';
import { Box, Paper, Typography, Divider } from '@mui/material';

// Sample data structure
interface MisconceptionPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  connections: string[];
}

/**
 * Demo component for the MisconceptionPatternGraph
 * Uses simplified non-3D visualization
 */
const MisconceptionPatternGraphDemo: React.FC = () => {
  // Sample data for the visualization
  const samplePatterns: MisconceptionPattern[] = [
    {
      id: '1',
      name: 'Context Confusion',
      description: 'Model fails to maintain context throughout a conversation',
      frequency: 75,
      connections: ['2', '5'],
    },
    {
      id: '2',
      name: 'Hallucination',
      description: 'Generation of content not supported by provided information',
      frequency: 92,
      connections: ['1', '3', '4'],
    },
    {
      id: '3',
      name: 'Over-Confidence',
      description: 'High confidence in incorrect or unverified statements',
      frequency: 67,
      connections: ['2', '5'],
    },
    {
      id: '4',
      name: 'Conflation',
      description: 'Merging distinct concepts inappropriately',
      frequency: 41,
      connections: ['2', '5'],
    },
    {
      id: '5',
      name: 'Knowledge Gap',
      description: 'Missing essential information for task completion',
      frequency: 58,
      connections: ['1', '3', '4'],
    },
  ];

  const [selectedPattern, setSelectedPattern] = useState<MisconceptionPattern | null>(null);

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 2, mb: 2, backgroundColor: 'transparent' }}>
        <Typography variant="h5" gutterBottom>
          Knowledge Pattern Visualization
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Explore relationships between common patterns in knowledge representation
        </Typography>
      </Paper>

      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
        <Box flex={1}>
          <MisconceptionPatternGraph3D
            patterns={samplePatterns}
            onPatternSelect={setSelectedPattern}
            height="450px"
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
                  .map((id) => samplePatterns.find((p) => p.id === id)?.name)
                  .join(', ')}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Select a pattern node to view details
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MisconceptionPatternGraphDemo;
