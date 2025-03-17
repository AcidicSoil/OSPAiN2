/**
 * Context Visualization
 * 
 * Generates an interactive visualization of the context relationships
 * between files in the codebase, based on the context graph.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONTEXT_GRAPH_FILE = '.cursor/context-graph.json';
const OUTPUT_DIR = '.cursor/visualizations';
const HTML_OUTPUT = path.join(OUTPUT_DIR, 'context-network.html');

// Main function
async function main() {
  console.log('Context Visualization Generator');
  console.log('------------------------------');

  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
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

  // Generate visualization
  console.log('Generating visualization...');
  const html = generateVisualization(contextGraph);

  // Write HTML output
  fs.writeFileSync(HTML_OUTPUT, html);

  console.log('\nVisualization generated successfully!');
  console.log(`Open ${HTML_OUTPUT} in a web browser to view the visualization.`);
}

// Generate HTML visualization using D3.js
function generateVisualization(graph) {
  // Prepare data for visualization
  const nodes = graph.nodes.map(node => ({
    id: node.id,
    label: node.title || path.basename(node.id),
    type: node.type,
    group: getGroupForType(node.type),
    summary: node.summary || ""
  }));

  const links = graph.edges.map(edge => ({
    source: edge.source,
    target: edge.target,
    value: edge.similarity,
    concepts: edge.concepts || []
  }));

  // Generate HTML with embedded D3.js
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Context Network Visualization</title>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
      overflow: hidden;
    }
    
    #container {
      position: relative;
      width: 100vw;
      height: 100vh;
    }
    
    #visualization {
      width: 100%;
      height: 100%;
      background-color: #ffffff;
    }
    
    #controls {
      position: absolute;
      top: 10px;
      left: 10px;
      background-color: rgba(255, 255, 255, 0.8);
      border-radius: 5px;
      padding: 10px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      z-index: 10;
    }
    
    #filter-panel {
      position: absolute;
      top: 10px;
      right: 10px;
      background-color: rgba(255, 255, 255, 0.8);
      border-radius: 5px;
      padding: 10px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      z-index: 10;
      max-width: 250px;
    }
    
    #info-panel {
      position: absolute;
      bottom: 10px;
      left: 10px;
      background-color: rgba(255, 255, 255, 0.9);
      border-radius: 5px;
      padding: 15px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      max-width: 400px;
      max-height: 300px;
      overflow-y: auto;
      display: none;
      z-index: 20;
    }
    
    .link {
      stroke-opacity: 0.6;
      transition: stroke-opacity 0.3s;
    }
    
    .link:hover {
      stroke-opacity: 1;
    }
    
    .node {
      stroke: #fff;
      stroke-width: 1.5px;
      cursor: pointer;
      transition: stroke-width 0.3s;
    }
    
    .node:hover {
      stroke-width: 3px;
    }
    
    .node-label {
      font-size: 10px;
      pointer-events: none;
      text-shadow: 
        -1px -1px 0 #fff,
        1px -1px 0 #fff,
        -1px 1px 0 #fff,
        1px 1px 0 #fff;
    }
    
    button, select {
      margin: 5px;
      padding: 5px 8px;
      border-radius: 3px;
      border: 1px solid #ccc;
      background-color: #f8f8f8;
      cursor: pointer;
    }
    
    button:hover, select:hover {
      background-color: #e8e8e8;
    }
    
    .checkbox-container {
      display: flex;
      flex-direction: column;
      margin-top: 5px;
    }
    
    .checkbox-item {
      margin: 3px 0;
    }
    
    h3 {
      margin-top: 5px;
      margin-bottom: 8px;
    }
    
    h4 {
      margin-top: 12px;
      margin-bottom: 5px;
    }
    
    .concept-tag {
      display: inline-block;
      padding: 2px 6px;
      margin: 3px;
      background-color: #e0e0e0;
      border-radius: 12px;
      font-size: 12px;
    }
    
    .path-highlight {
      stroke-opacity: 1;
      stroke-width: 4px;
    }
    
    .distance-1 {
      opacity: 0.9;
    }
    
    .distance-2 {
      opacity: 0.7;
    }
    
    .distance-3 {
      opacity: 0.5;
    }
    
    .dimmed {
      opacity: 0.2;
    }
  </style>
</head>
<body>
  <div id="container">
    <div id="controls">
      <h3>Context Network</h3>
      <button id="zoom-in">+</button>
      <button id="zoom-out">-</button>
      <button id="zoom-reset">Reset</button>
      <div>
        <label for="link-strength">Link Strength:</label>
        <select id="link-strength">
          <option value="0.05">Low (0.05+)</option>
          <option value="0.10">Medium (0.10+)</option>
          <option value="0.15" selected>High (0.15+)</option>
          <option value="0.25">Very High (0.25+)</option>
        </select>
      </div>
      <div>
        <button id="toggle-labels">Toggle Labels</button>
      </div>
    </div>
    
    <div id="filter-panel">
      <h3>Filters</h3>
      <div>
        <h4>File Types</h4>
        <div id="type-filters" class="checkbox-container">
          <!-- Populated by JavaScript -->
        </div>
      </div>
      <div>
        <h4>Concepts</h4>
        <div id="concept-filters" class="checkbox-container">
          <!-- Populated by JavaScript -->
        </div>
      </div>
      <div style="margin-top: 10px;">
        <button id="filter-apply">Apply Filters</button>
        <button id="filter-reset">Reset</button>
      </div>
    </div>
    
    <div id="info-panel">
      <h3 id="info-title">File Information</h3>
      <div id="info-content"></div>
      <div id="info-related"></div>
    </div>
    
    <div id="visualization"></div>
  </div>

  <script>
    // Graph data
    const graphData = {
      nodes: ${JSON.stringify(nodes)},
      links: ${JSON.stringify(links)}
    };
    
    // Function to initialize the visualization
    function initVisualization() {
      // Get container dimensions
      const container = document.getElementById('container');
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      // Create SVG
      const svg = d3.select('#visualization')
        .append('svg')
        .attr('width', width)
        .attr('height', height);
      
      // Create a group for zooming
      const g = svg.append('g');
      
      // Setup zoom behavior
      const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        });
      
      svg.call(zoom);
      
      // Create force simulation
      const simulation = d3.forceSimulation(graphData.nodes)
        .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-150))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(30));
      
      // Create links
      const link = g.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(graphData.links)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('stroke-width', d => Math.max(1, d.value * 5))
        .attr('stroke', '#999')
        .on('mouseover', function(event, d) {
          // Show link information
          const concepts = d.concepts.join(', ');
          const infoPanel = document.getElementById('info-panel');
          document.getElementById('info-title').textContent = 'Connection';
          document.getElementById('info-content').innerHTML = \`
            <p><strong>From:</strong> \${getNodeLabel(d.source)}</p>
            <p><strong>To:</strong> \${getNodeLabel(d.target)}</p>
            <p><strong>Similarity:</strong> \${(d.value * 100).toFixed(1)}%</p>
            <p><strong>Shared Concepts:</strong> \${concepts || 'None'}</p>
          \`;
          document.getElementById('info-related').innerHTML = '';
          infoPanel.style.display = 'block';
        });
      
      // Create a color scale for node types
      const color = d3.scaleOrdinal()
        .domain(['rule', 'documentation', 'source', 'component', 'configuration', 'other'])
        .range(['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#b07aa1']);
      
      // Create nodes
      const node = g.append('g')
        .attr('class', 'nodes')
        .selectAll('circle')
        .data(graphData.nodes)
        .enter()
        .append('circle')
        .attr('class', 'node')
        .attr('r', d => getNodeRadius(d))
        .attr('fill', d => color(d.group))
        .on('mouseover', function(event, d) {
          // Show node information
          showNodeInfo(d);
          
          // Highlight connections
          highlightConnections(d, this);
        })
        .on('mouseout', function() {
          // Reset highlighting
          d3.selectAll('.node').classed('dimmed', false);
          d3.selectAll('.link').classed('dimmed', false).classed('path-highlight', false);
          d3.selectAll('.node').classed('distance-1', false).classed('distance-2', false).classed('distance-3', false);
        })
        .on('click', function(event, d) {
          // Keep info panel open on click
          event.stopPropagation();
          showNodeInfo(d, true);
        })
        .call(d3.drag()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded));
      
      // Add node labels
      const label = g.append('g')
        .attr('class', 'labels')
        .selectAll('text')
        .data(graphData.nodes)
        .enter()
        .append('text')
        .attr('class', 'node-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .text(d => d.label.length > 20 ? d.label.substring(0, 17) + '...' : d.label)
        .attr('display', 'none'); // Initially hidden
      
      // Update positions on each tick
      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);
        
        node
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);
        
        label
          .attr('x', d => d.x)
          .attr('y', d => d.y + getNodeRadius(d) + 10);
      });
      
      // Drag functions
      function dragStarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      
      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }
      
      function dragEnded(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      
      // Get node radius based on connections
      function getNodeRadius(d) {
        const connections = graphData.links.filter(link => 
          link.source.id === d.id || link.target.id === d.id
        ).length;
        return Math.max(5, Math.min(15, 5 + connections / 2));
      }
      
      // Get node label
      function getNodeLabel(node) {
        if (typeof node === 'object') {
          return node.label || path.basename(node.id);
        }
        const foundNode = graphData.nodes.find(n => n.id === node);
        return foundNode ? foundNode.label : node;
      }
      
      // Show node info
      function showNodeInfo(d, keepOpen = false) {
        const infoPanel = document.getElementById('info-panel');
        document.getElementById('info-title').textContent = d.label;
        
        // Build connections list
        const connections = graphData.links.filter(link => 
          link.source.id === d.id || link.target.id === d.id
        );
        
        const connectedNodes = connections.map(conn => {
          const otherId = conn.source.id === d.id ? conn.target.id : conn.source.id;
          const otherNode = graphData.nodes.find(n => n.id === otherId);
          return {
            node: otherNode,
            similarity: conn.value,
            concepts: conn.concepts
          };
        }).sort((a, b) => b.similarity - a.similarity);
        
        // Build info HTML
        let infoHTML = \`
          <p><strong>Type:</strong> \${d.type}</p>
          <p><strong>Path:</strong> \${d.id}</p>
        \`;
        
        if (d.summary) {
          infoHTML += \`<p><strong>Summary:</strong> \${d.summary}</p>\`;
        }
        
        document.getElementById('info-content').innerHTML = infoHTML;
        
        // Related files section
        let relatedHTML = '<h4>Related Files</h4>';
        
        if (connectedNodes.length > 0) {
          relatedHTML += '<ul style="padding-left: 20px;">';
          connectedNodes.slice(0, 5).forEach(conn => {
            const conceptsList = conn.concepts && conn.concepts.length > 0 
              ? conn.concepts.map(c => \`<span class="concept-tag">\${c}</span>\`).join(' ') 
              : 'No shared concepts';
            
            relatedHTML += \`
              <li>
                <strong>\${conn.node.label}</strong> (\${(conn.similarity * 100).toFixed(1)}%)
                <div>\${conceptsList}</div>
              </li>
            \`;
          });
          relatedHTML += '</ul>';
          
          if (connectedNodes.length > 5) {
            relatedHTML += \`<p>And \${connectedNodes.length - 5} more connections...</p>\`;
          }
        } else {
          relatedHTML += '<p>No connections found.</p>';
        }
        
        document.getElementById('info-related').innerHTML = relatedHTML;
        infoPanel.style.display = 'block';
        
        if (keepOpen) {
          // Add event to close on next click
          const closeHandler = function() {
            infoPanel.style.display = 'none';
            document.removeEventListener('click', closeHandler);
          };
          
          setTimeout(() => {
            document.addEventListener('click', closeHandler);
          }, 100);
        }
      }
      
      // Highlight connected nodes and links
      function highlightConnections(d, nodeElement) {
        // Find all connected links and nodes
        const connectedLinks = graphData.links.filter(link => 
          link.source.id === d.id || link.target.id === d.id
        );
        
        const connectedNodeIds = new Set();
        connectedLinks.forEach(link => {
          connectedNodeIds.add(link.source.id === d.id ? link.target.id : link.source.id);
        });
        
        // Dim all nodes and links
        d3.selectAll('.node').classed('dimmed', true);
        d3.selectAll('.link').classed('dimmed', true);
        
        // Highlight the current node
        d3.select(nodeElement).classed('dimmed', false);
        
        // Highlight direct connections (distance 1)
        connectedLinks.forEach(link => {
          d3.selectAll('.link').filter(l => l === link).classed('dimmed', false).classed('path-highlight', true);
        });
        
        connectedNodeIds.forEach(nodeId => {
          d3.selectAll('.node').filter(n => n.id === nodeId).classed('dimmed', false).classed('distance-1', true);
        });
      }
      
      // Zoom controls
      document.getElementById('zoom-in').addEventListener('click', () => {
        svg.transition().duration(500).call(zoom.scaleBy, 1.5);
      });
      
      document.getElementById('zoom-out').addEventListener('click', () => {
        svg.transition().duration(500).call(zoom.scaleBy, 0.75);
      });
      
      document.getElementById('zoom-reset').addEventListener('click', () => {
        svg.transition().duration(500).call(
          zoom.transform,
          d3.zoomIdentity.translate(width / 2, height / 2).scale(1)
        );
      });
      
      // Toggle labels
      let labelsVisible = false;
      document.getElementById('toggle-labels').addEventListener('click', () => {
        labelsVisible = !labelsVisible;
        label.attr('display', labelsVisible ? 'block' : 'none');
      });
      
      // Link strength filter
      document.getElementById('link-strength').addEventListener('change', function() {
        const threshold = parseFloat(this.value);
        const filteredLinks = graphData.links.filter(link => link.value >= threshold);
        
        // Update links
        d3.selectAll('.link').style('display', d => d.value >= threshold ? 'block' : 'none');
        
        // Update simulation
        simulation.force('link').links(filteredLinks);
        simulation.alpha(0.3).restart();
      });
      
      // Setup filters
      setupFilters();
      
      // Close info panel when clicking elsewhere
      document.addEventListener('click', function(event) {
        if (!document.getElementById('info-panel').contains(event.target) &&
            !d3.select(event.target).classed('node')) {
          document.getElementById('info-panel').style.display = 'none';
        }
      });
      
      // Filter setup
      function setupFilters() {
        // Get unique types and concepts
        const types = [...new Set(graphData.nodes.map(node => node.type))];
        const concepts = [...new Set(graphData.links.flatMap(link => link.concepts || []))];
        
        // Generate type filters
        const typeFiltersContainer = document.getElementById('type-filters');
        types.forEach(type => {
          const checkbox = document.createElement('div');
          checkbox.className = 'checkbox-item';
          checkbox.innerHTML = \`
            <input type="checkbox" id="type-\${type}" value="\${type}" checked>
            <label for="type-\${type}">\${type.charAt(0).toUpperCase() + type.slice(1)}</label>
          \`;
          typeFiltersContainer.appendChild(checkbox);
        });
        
        // Generate concept filters (limit to top 10)
        const conceptFiltersContainer = document.getElementById('concept-filters');
        const topConcepts = concepts.slice(0, 10);
        topConcepts.forEach(concept => {
          const checkbox = document.createElement('div');
          checkbox.className = 'checkbox-item';
          checkbox.innerHTML = \`
            <input type="checkbox" id="concept-\${concept}" value="\${concept}" checked>
            <label for="concept-\${concept}">\${concept}</label>
          \`;
          conceptFiltersContainer.appendChild(checkbox);
        });
        
        // Apply filters button
        document.getElementById('filter-apply').addEventListener('click', applyFilters);
        
        // Reset filters button
        document.getElementById('filter-reset').addEventListener('click', resetFilters);
      }
      
      // Apply filters
      function applyFilters() {
        // Get selected types
        const selectedTypes = Array.from(document.querySelectorAll('#type-filters input:checked'))
          .map(checkbox => checkbox.value);
        
        // Get selected concepts
        const selectedConcepts = Array.from(document.querySelectorAll('#concept-filters input:checked'))
          .map(checkbox => checkbox.value);
        
        // Filter nodes by type
        d3.selectAll('.node').style('display', d => selectedTypes.includes(d.type) ? 'block' : 'none');
        
        // Filter links by concepts and visible nodes
        d3.selectAll('.link').style('display', function(d) {
          // Check if both connected nodes are visible
          const sourceVisible = selectedTypes.includes(d.source.type);
          const targetVisible = selectedTypes.includes(d.target.type);
          
          // Check if link has at least one selected concept
          const hasSelectedConcept = d.concepts && d.concepts.some(concept => selectedConcepts.includes(concept));
          
          // Link is visible if both nodes are visible and either it has a selected concept or no concepts are specified
          return sourceVisible && targetVisible && (hasSelectedConcept || d.concepts.length === 0) ? 'block' : 'none';
        });
        
        // Update link strength filter too
        const threshold = parseFloat(document.getElementById('link-strength').value);
        d3.selectAll('.link').filter(function() {
          return this.style.display !== 'none';
        }).style('display', d => d.value >= threshold ? 'block' : 'none');
        
        // Update simulation
        const visibleLinks = graphData.links.filter(link => {
          const sourceVisible = selectedTypes.includes(link.source.type);
          const targetVisible = selectedTypes.includes(link.target.type);
          const hasSelectedConcept = link.concepts && link.concepts.some(concept => selectedConcepts.includes(concept));
          return sourceVisible && targetVisible && (hasSelectedConcept || link.concepts.length === 0) && link.value >= threshold;
        });
        
        simulation.force('link').links(visibleLinks);
        simulation.alpha(0.3).restart();
      }
      
      // Reset filters
      function resetFilters() {
        // Check all type checkboxes
        document.querySelectorAll('#type-filters input').forEach(checkbox => {
          checkbox.checked = true;
        });
        
        // Check all concept checkboxes
        document.querySelectorAll('#concept-filters input').forEach(checkbox => {
          checkbox.checked = true;
        });
        
        // Reset link strength
        document.getElementById('link-strength').value = '0.15';
        
        // Apply filters to show everything
        applyFilters();
      }
      
      // Initial center
      svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2));
      
      return {
        simulation,
        svg,
        zoom
      };
    }
    
    // Map file type to group
    function getGroupForType(type) {
      const typeGroups = {
        'rule': 'rule',
        'documentation': 'documentation',
        'source': 'source',
        'component': 'component',
        'configuration': 'configuration',
        'markup': 'markup',
        'style': 'style'
      };
      
      return typeGroups[type] || 'other';
    }
    
    // Initialize the visualization when the page loads
    window.addEventListener('load', initVisualization);
  </script>
</body>
</html>`;
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
}); 