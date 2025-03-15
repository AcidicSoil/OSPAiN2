import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Button, 
  Grid, 
  CircularProgress,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import { NotionService, NotionDatabase, getNotionService } from '../services/NotionService';

export const NotionPage: React.FC = () => {
  // State
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [databases, setDatabases] = useState<NotionDatabase[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<NotionDatabase | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  // Get the Notion service instance
  const notionService = getNotionService();

  // Check connection status on component mount
  useEffect(() => {
    const checkConnection = async () => {
      setIsLoading(true);
      try {
        const connected = await notionService.checkConnection();
        setIsConnected(connected);
        
        if (connected) {
          const dbs = await notionService.getDatabases();
          setDatabases(dbs);
        }
      } catch (err) {
        setError('Failed to connect to Notion service');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  // Handle database selection
  const handleSelectDatabase = (database: NotionDatabase) => {
    setSelectedDatabase(database);
    notionService.setDatabaseId(database.id);
    setNotification({
      message: `Connected to database: ${database.title}`,
      type: 'success'
    });
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const results = await notionService.searchNotes(searchQuery);
      setSearchResults(results);
    } catch (err) {
      setError('Failed to search Notion');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle notification close
  const handleCloseNotification = () => {
    setNotification(null);
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Notion Integration
        </Typography>

        {isLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : !isConnected ? (
          <Alert severity="warning">
            Not connected to Notion. Please check your API connection settings.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {/* Databases Section */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Available Databases
                  </Typography>
                  
                  {databases.length === 0 ? (
                    <Alert severity="info">No databases found</Alert>
                  ) : (
                    <List>
                      {databases.map((db) => (
                        <React.Fragment key={db.id}>
                          <ListItem 
                            button
                            selected={selectedDatabase?.id === db.id}
                            onClick={() => handleSelectDatabase(db)}
                          >
                            <ListItemText 
                              primary={db.title} 
                              secondary={`Last modified: ${new Date(db.lastModified).toLocaleString()}`} 
                            />
                            {selectedDatabase?.id === db.id && (
                              <Chip label="Selected" color="primary" size="small" />
                            )}
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Search Section */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Search Notion
                  </Typography>
                  
                  <Box mb={2}>
                    <TextField
                      fullWidth
                      label="Search Query"
                      variant="outlined"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </Box>
                  
                  <Box mb={2}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleSearch}
                      disabled={!searchQuery.trim()}
                    >
                      Search
                    </Button>
                  </Box>
                  
                  {searchResults.length > 0 && (
                    <Paper elevation={0} variant="outlined" style={{ padding: '16px' }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Search Results
                      </Typography>
                      
                      <List dense>
                        {searchResults.map((result) => (
                          <ListItem key={result.id}>
                            <ListItemText 
                              primary={result.title} 
                              secondary={result.description || 'No description available'}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Notification */}
      <Snackbar 
        open={notification !== null} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
      >
        {notification && (
          <Alert onClose={handleCloseNotification} severity={notification.type}>
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </Container>
  );
}; 