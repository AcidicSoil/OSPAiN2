import React, { useState, useEffect } from 'react';
import MisconceptionPatternGraphDemo from '../components/visualization/MisconceptionPatternGraphDemo';
import MisconceptionPatternVisualizer from '../components/visualization/MisconceptionPatternVisualizer';
import { Container, Typography, Paper, Box, Grid, CircularProgress, Alert } from '@mui/material';

// Define interface for the pattern data
interface MisconceptionPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  connections: string[];
}

/**
 * Knowledge Visualization Page
 *
 * This page showcases simplified visualization capabilities for knowledge
 * representation without 3D graphics.
 */
const KnowledgeVisualizationPage: React.FC = () => {
  const [patterns, setPatterns] = useState<MisconceptionPattern[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch pattern data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/visualization/patterns');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPatterns(data.patterns);
        setLoading(false);
      } catch (e) {
        console.error('Error fetching visualization data:', e);
        setError('Failed to load visualization data. Using demo data instead.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Container maxWidth="xl">
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mt: 3,
          mb: 4,
          backgroundColor: 'transparent',
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Knowledge Visualization
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Explore data patterns and relationships using interactive visualizations
          </Typography>
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="400px">
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper
                elevation={2}
                sx={{
                  p: 0,
                  overflow: 'hidden',
                  borderRadius: 2,
                }}
              >
                {patterns.length > 0 ? (
                  <MisconceptionPatternVisualizer
                    patterns={patterns}
                    title="Knowledge Pattern Analysis"
                    description="Interactive visualization of knowledge pattern relationships"
                  />
                ) : (
                  <MisconceptionPatternGraphDemo />
                )}
              </Paper>
            </Grid>
          </Grid>
        )}

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            About This Visualization
          </Typography>
          <Typography variant="body1" paragraph>
            This visualization provides an intuitive way to understand the relationships between
            different knowledge concepts or patterns within a domain. The interactive graph
            representation allows for exploration of interconnections that might be difficult to
            visualize in traditional layouts.
          </Typography>
          <Typography variant="body1">Future enhancements will include:</Typography>
          <ul>
            <li>Live data integration with the Knowledge Graph MCP Server</li>
            <li>Custom visualization layouts based on semantic relationships</li>
            <li>Advanced filtering and searching capabilities</li>
            <li>Node clustering for handling larger datasets</li>
            <li>Dynamic node generation based on user queries</li>
          </ul>
        </Box>
      </Paper>
    </Container>
  );
};

export default KnowledgeVisualizationPage;
