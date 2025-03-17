/**
 * Context Transition Manager
 * 
 * Handles intelligent transitions between related contexts,
 * creating smooth handoffs between files with related information.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONTEXT_GRAPH_FILE = '.cursor/context-graph.json';
const TRANSITION_MAPS_DIR = '.cursor/transition-maps';
const PATHS_FILE = path.join(TRANSITION_MAPS_DIR, 'context-paths.json');
const MAX_PATH_LENGTH = 5;
const MIN_SIMILARITY_THRESHOLD = 0.1;

// Main function
async function main() {
  console.log('Context Transition Manager');
  console.log('-------------------------');

  // Create transition maps directory if it doesn't exist
  if (!fs.existsSync(TRANSITION_MAPS_DIR)) {
    fs.mkdirSync(TRANSITION_MAPS_DIR, { recursive: true });
  }

  // Check if context graph file exists
  if (!fs.existsSync(CONTEXT_GRAPH_FILE)) {
    console.error(`Error: Context graph file not found at ${CONTEXT_GRAPH_FILE}`);
    console.log('Please run context-distributor.js first to generate the context graph.');
    process.exit(1);
  }

  // Load context graph
  console.log(`Loading context graph from ${CONTEXT_GRAPH_FILE}...`);
  const contextGraph = JSON.parse(fs.readFileSync(CONTEXT_GRAPH_FILE, 'utf8'));

  // Generate transition maps
  console.log('Generating transition maps...');
  const transitionMaps = generateTransitionMaps(contextGraph);

  // Generate transition paths
  console.log('Finding optimal context transition paths...');
  const transitionPaths = findOptimalTransitionPaths(contextGraph, transitionMaps);

  // Save transition paths
  fs.writeFileSync(PATHS_FILE, JSON.stringify(transitionPaths, null, 2));

  // Create individual transition maps
  createTransitionMapFiles(transitionMaps);

  console.log('\nProcess completed successfully!');
  console.log(`Transition maps saved to ${TRANSITION_MAPS_DIR}`);
  console.log(`Transition paths saved to ${PATHS_FILE}`);
}

// Generate transition maps between contexts
function generateTransitionMaps(contextGraph) {
  const transitionMaps = {};
  
  // Create a map of node IDs to node objects
  const nodesMap = {};
  contextGraph.nodes.forEach(node => {
    nodesMap[node.id] = node;
  });
  
  // Process each node to create a transition map
  contextGraph.nodes.forEach(sourceNode => {
    const sourceId = sourceNode.id;
    const transitions = [];
    
    // Find direct connections (one hop)
    const directConnections = contextGraph.edges
      .filter(edge => edge.source === sourceId || edge.target === sourceId)
      .map(edge => {
        const targetId = edge.source === sourceId ? edge.target : edge.source;
        const targetNode = nodesMap[targetId];
        
        return {
          id: targetId,
          title: targetNode.title || path.basename(targetId),
          type: targetNode.type,
          similarity: edge.similarity,
          concepts: edge.concepts || [],
          transition_type: 'direct',
          path: [sourceId, targetId]
        };
      })
      .sort((a, b) => b.similarity - a.similarity);
    
    transitions.push(...directConnections);
    
    // Find two-hop connections
    const directTargetIds = new Set(directConnections.map(conn => conn.id));
    const twoHopConnections = [];
    
    directConnections.forEach(directConn => {
      const intermediateId = directConn.id;
      
      // Find connections from the intermediate node
      const secondHops = contextGraph.edges
        .filter(edge => edge.source === intermediateId || edge.target === intermediateId)
        .map(edge => {
          const secondHopId = edge.source === intermediateId ? edge.target : edge.source;
          
          // Skip if it's the original node or already a direct connection
          if (secondHopId === sourceId || directTargetIds.has(secondHopId)) {
            return null;
          }
          
          const secondHopNode = nodesMap[secondHopId];
          const secondHopSimilarity = edge.similarity;
          
          // Calculate combined similarity (weighted)
          const combinedSimilarity = (directConn.similarity * 0.7) + (secondHopSimilarity * 0.3);
          
          return {
            id: secondHopId,
            title: secondHopNode.title || path.basename(secondHopId),
            type: secondHopNode.type,
            similarity: combinedSimilarity,
            via: {
              id: intermediateId,
              title: nodesMap[intermediateId].title || path.basename(intermediateId),
              type: nodesMap[intermediateId].type,
              similarity: directConn.similarity,
              concepts: directConn.concepts || []
            },
            concepts: [...new Set([...(directConn.concepts || []), ...(edge.concepts || [])])],
            transition_type: 'two_hop',
            path: [sourceId, intermediateId, secondHopId]
          };
        })
        .filter(conn => conn !== null);
      
      twoHopConnections.push(...secondHops);
    });
    
    // Sort two-hop connections by similarity and add to transitions
    twoHopConnections.sort((a, b) => b.similarity - a.similarity);
    
    // Filter out duplicate paths to the same target
    const uniqueTwoHopConnections = [];
    const addedTargets = new Set();
    
    twoHopConnections.forEach(conn => {
      if (!addedTargets.has(conn.id)) {
        uniqueTwoHopConnections.push(conn);
        addedTargets.add(conn.id);
      }
    });
    
    transitions.push(...uniqueTwoHopConnections);
    
    // Store transitions for the source
    transitionMaps[sourceId] = {
      source: {
        id: sourceId,
        title: sourceNode.title || path.basename(sourceId),
        type: sourceNode.type
      },
      transitions: transitions
    };
  });
  
  return transitionMaps;
}

// Find optimal transition paths between all nodes
function findOptimalTransitionPaths(contextGraph, transitionMaps) {
  const paths = {};
  
  // Create a map of node IDs to node objects
  const nodesMap = {};
  contextGraph.nodes.forEach(node => {
    nodesMap[node.id] = node;
  });
  
  // Create a graph representation for Dijkstra's algorithm
  const graph = {};
  
  contextGraph.edges.forEach(edge => {
    const sourceId = edge.source;
    const targetId = edge.target;
    const weight = 1 - edge.similarity; // Convert similarity to distance (higher similarity = lower distance)
    
    // Add edge in both directions (undirected graph)
    if (!graph[sourceId]) {
      graph[sourceId] = {};
    }
    if (!graph[targetId]) {
      graph[targetId] = {};
    }
    
    graph[sourceId][targetId] = weight;
    graph[targetId][sourceId] = weight;
  });
  
  // Find most important nodes (high connectivity or specific types)
  const importantNodes = findImportantNodes(contextGraph);
  
  // For each important node, find paths to all other important nodes
  importantNodes.forEach(sourceId => {
    const sourcePaths = {};
    
    importantNodes.forEach(targetId => {
      if (sourceId !== targetId) {
        const path = findShortestPath(graph, sourceId, targetId);
        
        if (path && path.length <= MAX_PATH_LENGTH) {
          // Enhance path with node details
          const enhancedPath = path.map(nodeId => ({
            id: nodeId,
            title: nodesMap[nodeId].title || path.basename(nodeId),
            type: nodesMap[nodeId].type
          }));
          
          // Calculate path concepts (shared across all nodes)
          const pathConcepts = calculatePathConcepts(path, contextGraph);
          
          sourcePaths[targetId] = {
            path: enhancedPath,
            length: path.length - 1, // Number of hops
            concepts: pathConcepts
          };
        }
      }
    });
    
    paths[sourceId] = sourcePaths;
  });
  
  return paths;
}

// Find shortest path using Dijkstra's algorithm
function findShortestPath(graph, startNode, endNode) {
  // Track distances from the start node
  const distances = {};
  // Track paths
  const previous = {};
  // Track nodes that have already been processed
  const visited = new Set();
  
  // Initialize with infinity for all nodes except the start node
  const nodes = Object.keys(graph);
  nodes.forEach(node => {
    if (node === startNode) {
      distances[node] = 0;
    } else {
      distances[node] = Infinity;
    }
    previous[node] = null;
  });
  
  // Process nodes
  while (nodes.length > 0) {
    // Find the node with the smallest distance
    nodes.sort((a, b) => distances[a] - distances[b]);
    const closestNode = nodes.shift();
    
    // If we've reached the end node, we can build and return the path
    if (closestNode === endNode) {
      const path = [endNode];
      let current = endNode;
      
      while (previous[current] !== null) {
        path.unshift(previous[current]);
        current = previous[current];
      }
      
      return path;
    }
    
    // Mark the node as visited
    visited.add(closestNode);
    
    // Check all neighboring nodes
    const neighbors = graph[closestNode] || {};
    
    Object.keys(neighbors).forEach(neighbor => {
      if (visited.has(neighbor)) return;
      
      // Calculate new distance
      const newDistance = distances[closestNode] + neighbors[neighbor];
      
      // Update distance if it's shorter
      if (newDistance < distances[neighbor]) {
        distances[neighbor] = newDistance;
        previous[neighbor] = closestNode;
      }
    });
  }
  
  // If we get here, there's no path
  return null;
}

// Find important nodes in the graph
function findImportantNodes(contextGraph) {
  // Count connections for each node
  const connectionCounts = {};
  
  contextGraph.edges.forEach(edge => {
    connectionCounts[edge.source] = (connectionCounts[edge.source] || 0) + 1;
    connectionCounts[edge.target] = (connectionCounts[edge.target] || 0) + 1;
  });
  
  // Priority for certain node types
  const typePriorities = {
    'rule': 3,
    'documentation': 2,
    'source': 1
  };
  
  // Calculate importance score for each node
  const importanceScores = contextGraph.nodes.map(node => {
    const connectionScore = connectionCounts[node.id] || 0;
    const typeScore = typePriorities[node.type] || 0;
    
    return {
      id: node.id,
      importance: connectionScore * 0.7 + typeScore * 0.3
    };
  });
  
  // Sort by importance and take top 20%
  importanceScores.sort((a, b) => b.importance - a.importance);
  const topCount = Math.max(5, Math.ceil(contextGraph.nodes.length * 0.2));
  
  return importanceScores.slice(0, topCount).map(node => node.id);
}

// Calculate shared concepts along a path
function calculatePathConcepts(path, contextGraph) {
  if (path.length <= 1) {
    return [];
  }
  
  // Collect all concepts along the path
  const conceptCounts = {};
  
  for (let i = 0; i < path.length - 1; i++) {
    const sourceId = path[i];
    const targetId = path[i + 1];
    
    // Find the edge between these nodes
    const edge = contextGraph.edges.find(e => 
      (e.source === sourceId && e.target === targetId) || 
      (e.source === targetId && e.target === sourceId)
    );
    
    if (edge && edge.concepts) {
      edge.concepts.forEach(concept => {
        conceptCounts[concept] = (conceptCounts[concept] || 0) + 1;
      });
    }
  }
  
  // Convert to array and sort by frequency
  const concepts = Object.entries(conceptCounts)
    .map(([concept, count]) => ({ concept, count }))
    .sort((a, b) => b.count - a.count)
    .map(entry => entry.concept);
  
  return concepts;
}

// Create individual transition map files
function createTransitionMapFiles(transitionMaps) {
  Object.entries(transitionMaps).forEach(([sourceId, mapData]) => {
    // Sanitize filename
    const filename = sourceId.replace(/[\/\\:*?"<>|]/g, '_');
    const filePath = path.join(TRANSITION_MAPS_DIR, `${filename}.json`);
    
    fs.writeFileSync(filePath, JSON.stringify(mapData, null, 2));
  });
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
}); 