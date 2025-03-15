import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button,
  Tabs,
  Tab,
  Chip,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import GraphVisualization from './GraphVisualization';
import {
  Entity,
  Relationship,
  Document,
  Concept,
  KnowledgeGraphService,
  getKnowledgeGraphService
} from '../../services/knowledgeGraph';

interface KnowledgeGraphExplorerProps {
  initialEntityId?: string;
  width?: number;
  height?: number;
}

/**
 * KnowledgeGraphExplorer component for exploring the knowledge graph
 */
const KnowledgeGraphExplorer: React.FC<KnowledgeGraphExplorerProps> = ({
  initialEntityId,
  width = 1200,
  height = 800
}) => {
  // State
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [relatedEntities, setRelatedEntities] = useState<Entity[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Get knowledge graph service
  const knowledgeGraphService = getKnowledgeGraphService();
  
  // Load initial entity if provided
  useEffect(() => {
    if (initialEntityId) {
      loadEntityWithNeighbors(initialEntityId);
    } else {
      // Load some initial entities
      loadRecentEntities();
    }
  }, [initialEntityId]);
  
  // Load recent entities to display something initially
  const loadRecentEntities = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load recent documents
      const recentDocuments = await knowledgeGraphService.findEntities<Document>(
        'document',
        {},
        10
      );
      
      // Load some concepts
      const concepts = await knowledgeGraphService.findEntities<Concept>(
        'concept',
        {},
        20
      );
      
      // Combine entities
      const allEntities = [...recentDocuments, ...concepts];
      
      // Load relationships between these entities
      const relationships: Relationship[] = [];
      
      for (const entity of allEntities) {
        const { relationships: entityRelationships } = await knowledgeGraphService.getNeighbors(
          entity.id,
          {
            maxDepth: 1,
            limit: 30
          }
        );
        
        relationships.push(...entityRelationships);
      }
      
      // Filter relationships to only include relationships between loaded entities
      const entityIds = new Set(allEntities.map(e => e.id));
      const filteredRelationships = relationships.filter(
        rel => entityIds.has(rel.source) && entityIds.has(rel.target)
      );
      
      setEntities(allEntities);
      setRelationships(filteredRelationships);
    } catch (err) {
      console.error('Error loading recent entities:', err);
      setError('Failed to load recent entities');
    } finally {
      setLoading(false);
    }
  }, [knowledgeGraphService]);
  
  // Load entity with its neighbors
  const loadEntityWithNeighbors = useCallback(async (entityId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Load the entity
      const entity = await knowledgeGraphService.getEntity(entityId);
      
      if (!entity) {
        throw new Error(`Entity with ID ${entityId} not found`);
      }
      
      // Load neighbors
      const { entities: neighborEntities, relationships } = await knowledgeGraphService.getNeighbors(
        entityId,
        {
          maxDepth: 2,
          limit: 50
        }
      );
      
      // Combine entity with neighbors
      const allEntities = [entity, ...neighborEntities];
      
      setEntities(allEntities);
      setRelationships(relationships);
      setSelectedEntity(entity);
      setHighlightedNodeIds([entityId]);
    } catch (err) {
      console.error('Error loading entity with neighbors:', err);
      setError(`Failed to load entity: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }, [knowledgeGraphService]);
  
  // Handle entity selection
  const handleEntitySelect = useCallback(async (entity: Entity) => {
    setSelectedEntity(entity);
    setHighlightedNodeIds([entity.id]);
    
    try {
      // Load related entities
      const { entities } = await knowledgeGraphService.getNeighbors(
        entity.id,
        {
          maxDepth: 1,
          limit: 10
        }
      );
      
      setRelatedEntities(entities);
    } catch (err) {
      console.error('Error loading related entities:', err);
      setRelatedEntities([]);
    }
  }, [knowledgeGraphService]);
  
  // Handle search
  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Search for documents
      const documents = await knowledgeGraphService.searchDocuments(searchTerm, { limit: 5 });
      
      // Search for concepts by name
      const concepts = await knowledgeGraphService.findEntities<Concept>(
        'concept',
        {},
        10
      );
      
      // Filter concepts that match the search term
      const filteredConcepts = concepts.filter(concept => 
        concept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (concept.description && concept.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      // Combine search results
      const searchResults = [...documents, ...filteredConcepts];
      
      if (searchResults.length === 0) {
        setError('No results found for your search');
        return;
      }
      
      // If we found just one result, select it
      if (searchResults.length === 1) {
        loadEntityWithNeighbors(searchResults[0].id);
        return;
      }
      
      // Load relationships between search results
      const relationships: Relationship[] = [];
      
      for (const entity of searchResults) {
        const { relationships: entityRelationships } = await knowledgeGraphService.getNeighbors(
          entity.id,
          {
            maxDepth: 1,
            limit: 20
          }
        );
        
        relationships.push(...entityRelationships);
      }
      
      // Update state
      setEntities(searchResults);
      setRelationships(relationships);
      setSelectedEntity(null);
      setHighlightedNodeIds([]);
    } catch (err) {
      console.error('Error during search:', err);
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, knowledgeGraphService, loadEntityWithNeighbors]);
  
  // Generate entity details display
  const renderEntityDetails = useCallback(() => {
    if (!selectedEntity) {
      return (
        <Box p={2}>
          <Typography variant="body2" color="textSecondary">
            Select an entity from the graph to view details
          </Typography>
        </Box>
      );
    }
    
    if (selectedEntity.type === 'document') {
      const document = selectedEntity as Document;
      return (
        <Box>
          <Typography variant="h6" gutterBottom>Document</Typography>
          <Typography variant="subtitle1" gutterBottom>Source: {document.source}</Typography>
          <Typography variant="subtitle2" gutterBottom>Created: {new Date(document.createdAt).toLocaleString()}</Typography>
          <Typography variant="body1" paragraph>
            {document.content.length > 300
              ? `${document.content.substring(0, 300)}...`
              : document.content}
          </Typography>
          {document.content.length > 300 && (
            <Button variant="text" size="small">Show More</Button>
          )}
          <Box mt={2}>
            <Typography variant="subtitle2">Properties:</Typography>
            {Object.entries(document.properties).map(([key, value]) => (
              <Chip 
                key={key} 
                label={`${key}: ${String(value)}`}
                size="small"
                style={{ margin: '2px' }}
              />
            ))}
          </Box>
        </Box>
      );
    }
    
    if (selectedEntity.type === 'concept') {
      const concept = selectedEntity as Concept;
      return (
        <Box>
          <Typography variant="h6" gutterBottom>Concept</Typography>
          <Typography variant="h5" gutterBottom>{concept.name}</Typography>
          <Typography variant="body1" paragraph>{concept.description}</Typography>
          <Box mt={2}>
            <Typography variant="subtitle2">Properties:</Typography>
            {Object.entries(concept.properties).map(([key, value]) => (
              <Chip 
                key={key} 
                label={`${key}: ${String(value)}`}
                size="small"
                style={{ margin: '2px' }}
              />
            ))}
          </Box>
        </Box>
      );
    }
    
    // Generic entity display
    return (
      <Box>
        <Typography variant="h6" gutterBottom>{selectedEntity.type}</Typography>
        <Typography variant="subtitle2" gutterBottom>ID: {selectedEntity.id}</Typography>
        <Typography variant="subtitle2" gutterBottom>
          Created: {new Date(selectedEntity.createdAt).toLocaleString()}
        </Typography>
        <Box mt={2}>
          <Typography variant="subtitle2">Properties:</Typography>
          {Object.entries(selectedEntity.properties).map(([key, value]) => (
            <Chip 
              key={key} 
              label={`${key}: ${String(value)}`}
              size="small"
              style={{ margin: '2px' }}
            />
          ))}
        </Box>
      </Box>
    );
  }, [selectedEntity]);
  
  // Render related entities
  const renderRelatedEntities = useCallback(() => {
    if (!selectedEntity) {
      return (
        <Box p={2}>
          <Typography variant="body2" color="textSecondary">
            Select an entity to view related items
          </Typography>
        </Box>
      );
    }
    
    if (relatedEntities.length === 0) {
      return (
        <Box p={2}>
          <Typography variant="body2" color="textSecondary">
            No related entities found
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box>
        {relatedEntities.map(entity => (
          <Paper
            key={entity.id}
            elevation={1}
            sx={{ 
              p: 1.5,
              mb: 1, 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
            onClick={() => loadEntityWithNeighbors(entity.id)}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: 
                  entity.type === 'document' ? '#4285F4' : 
                  entity.type === 'concept' ? '#34A853' : '#999999',
                mr: 1.5
              }}
            />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle2">
                {entity.type === 'concept' 
                  ? (entity as Concept).name 
                  : entity.type === 'document' 
                    ? `Document: ${(entity as Document).source || 'Unknown'}`
                    : entity.id.substring(0, 10)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {entity.type}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    );
  }, [selectedEntity, relatedEntities, loadEntityWithNeighbors]);
  
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Left panel: Controls */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Knowledge Graph Explorer</Typography>
              
              {/* Search */}
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search entities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <IconButton onClick={handleSearch}>
                  <SearchIcon />
                </IconButton>
              </Box>
              
              {/* Tabs for entity details */}
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                variant="fullWidth"
                sx={{ mb: 2 }}
              >
                <Tab label="Details" />
                <Tab label="Related" />
              </Tabs>
              
              {/* Tab contents */}
              <Box sx={{ height: 'calc(100% - 160px)', overflow: 'auto' }}>
                {activeTab === 0 && renderEntityDetails()}
                {activeTab === 1 && renderRelatedEntities()}
              </Box>
              
              {/* Loading indication */}
              {loading && (
                <Box display="flex" justifyContent="center" mt={2}>
                  <CircularProgress size={24} />
                </Box>
              )}
              
              {/* Error message */}
              {error && (
                <Box mt={2} p={1} bgcolor="error.light" borderRadius={1}>
                  <Typography variant="body2" color="error">
                    {error}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Right panel: Graph visualization */}
        <Grid item xs={12} md={9}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ height: '100%', p: 1, position: 'relative' }}>
              {/* Graph visualization */}
              <GraphVisualization
                entities={entities}
                relationships={relationships}
                width={width - 400}
                height={height - 40}
                onNodeClick={handleEntitySelect}
                highlightedNodeIds={highlightedNodeIds}
              />
              
              {/* Graph controls */}
              <Paper 
                elevation={2}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  p: 0.5,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Tooltip title="Zoom In">
                  <IconButton size="small">
                    <ZoomInIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Zoom Out">
                  <IconButton size="small">
                    <ZoomOutIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Refresh">
                  <IconButton size="small" onClick={loadRecentEntities}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Info">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Paper>
              
              {/* Stats */}
              <Paper
                elevation={2}
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  p: 1,
                  display: 'flex',
                  gap: 2
                }}
              >
                <Typography variant="caption">
                  Entities: {entities.length}
                </Typography>
                <Typography variant="caption">
                  Relationships: {relationships.length}
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default KnowledgeGraphExplorer; 