import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
import ForceGraph2D from 'react-force-graph-2d';
import knowledgeGraphService, { GraphData } from '../../services/KnowledgeGraphService';

interface GraphNode {
  id: string;
  name: string;
  color?: string;
  val?: number;
}

interface GraphLink {
  source: string;
  target: string;
  value?: number;
}

export const GraphVisualization: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const graphRef = useRef<any>(null);

  useEffect(() => {
    loadGraphData();
  }, []);

  const loadGraphData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await knowledgeGraphService.getGraphData();
      setGraphData(data);
    } catch (error) {
      console.error('Error loading graph data:', error);
      setError('Failed to load graph data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshGraph = () => {
    loadGraphData();
  };

  return (
    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Knowledge Graph</Typography>
        <Button onClick={handleRefreshGraph} disabled={loading}>
          Refresh Graph
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1, position: 'relative', minHeight: '400px' }}>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : graphData && graphData.nodes.length > 0 ? (
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeLabel="name"
            nodeColor={(node: any) => node.color || '#1976d2'}
            nodeVal={(node: any) => node.val || 1}
            linkWidth={(link: any) => link.value || 1}
            linkColor={() => '#999'}
            width={800}
            height={600}
          />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography>No graph data available</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

// Add default export
export default GraphVisualization; 