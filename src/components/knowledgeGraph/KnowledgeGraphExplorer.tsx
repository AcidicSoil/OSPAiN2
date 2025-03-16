import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export const KnowledgeGraphExplorer: React.FC = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5">Knowledge Graph Explorer</Typography>
      <Box sx={{ mt: 2 }}>
        <Typography>This is a placeholder for the Knowledge Graph Explorer component.</Typography>
      </Box>
    </Paper>
  );
};

// Ensure default export is also available
export default KnowledgeGraphExplorer; 