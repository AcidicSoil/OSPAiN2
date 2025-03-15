import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import SecureChat from '../components/SecureChat';

const SecureChatPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Secure Communications
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ mb: 3 }}>
        End-to-end encrypted messaging for sensitive information
      </Typography>
      
      <Box sx={{ height: 'calc(100vh - 200px)' }}>
        <SecureChat />
      </Box>
    </Container>
  );
};

export default SecureChatPage; 