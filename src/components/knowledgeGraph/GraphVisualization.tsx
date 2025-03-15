import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
import ForceGraph2D from 'react-force-graph-2d';

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

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export const GraphVisualization: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: []
  });
  const [loading, setLoading] = useState(false);
  const graphRef = useRef<any>(null);

  // Sample data generation
  const generateSampleData = () => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const sampleData: GraphData = {
        nodes: [
          { id: 'node1', name: 'Document 1', color: '#4caf50', val: 10 },
          { id: 'node2', name: 'Concept A', color: '#2196f3', val: 8 },
          { id: 'node3', name: 'Concept B', color: '#2196f3', val: 8 },
          { id: 'node4', name: 'Document 2', color: '#4caf50', val: 10 },
          { id: 'node5', name: 'Concept C', color: '#2196f3', val: 8 },
          { id: 'node6', name: 'Fact 1', color: '#ff9800', val: 5 },
          { id: 'node7', name: 'Fact 2', color: '#ff9800', val: 5 },
          { id: 'node8', name: 'Document 3', color: '#4caf50', val: 10 }
        ],
        links: [
          { source: 'node1', target: 'node2' },
          { source: 'node1', target: 'node3' },
          { source: 'node2', target: 'node3' },
          { source: 'node2', target: 'node4' },
          { source: 'node3', target: 'node5' },
          { source: 'node4', target: 'node5' },
          { source: 'node5', target: 'node6' },
          { source: 'node6', target: 'node7' },
          { source: 'node7', target: 'node8' },
          { source: 'node1', target: 'node8' }
        ]
      };
      
      setGraphData(sampleData);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    generateSampleData();
  }, []);

  // Zoom to fit when data changes
  useEffect(() => {
    if (graphRef.current && graphData.nodes.length > 0) {
      // Wait a bit for the graph to initialize properly
      setTimeout(() => {
        graphRef.current.zoomToFit(400);
      }, 500);
    }
  }, [graphData]);

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Knowledge Graph Visualization</Typography>
        <Button 
          variant="outlined" 
          onClick={generateSampleData}
          disabled={loading}
        >
          Refresh Graph
        </Button>
      </Box>
      
      <Box sx={{ mt: 2, height: '500px', border: '1px solid #eee', borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : graphData.nodes.length > 0 ? (
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeLabel="name"
            nodeColor="color"
            nodeVal="val"
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.005}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.2}
            cooldownTime={3000}
            enableZoomInteraction={true}
            enableNodeDrag={true}
            onNodeClick={(node) => {
              console.log('Clicked node:', node);
              // Future implementation: show node details
            }}
            width={800}
            height={500}
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