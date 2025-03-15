import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  Container,
  Stack,
  Alert,
  Snackbar
} from '@mui/material';
import {
  KnowledgeGraphExplorer,
  BatchDocumentImport,
  BatchProcessingProgress,
  GraphVisualization
} from "../components/knowledgeGraph";

const KnowledgeGraphPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="pt-16 pl-20 md:pl-64">
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Knowledge Graph
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <KnowledgeGraphExplorer />
            <BatchDocumentImport />
            <BatchProcessingProgress />
          </Grid>
          <Grid item xs={12} md={6}>
            <GraphVisualization />
          </Grid>
        </Grid>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </div>
  );
};

export default KnowledgeGraphPage; 