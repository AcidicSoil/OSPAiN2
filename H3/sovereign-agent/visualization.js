/**
 * Sovereign Agent Framework - Visualization Utilities
 * Part of Horizon 3 (Future) implementation for Ollama Ecosystem.
 * 
 * @context: Connected to agent-creed.js for data visualization
 * @context: Integrates with demo.js for interactive displays
 */

/**
 * Generate ASCII/text-based visualizations for the Sovereign Agent framework
 */
class SovereignAgentViz {
  constructor(config = {}) {
    this.config = {
      width: config.width || 50,
      charFull: config.charFull || '█',
      charEmpty: config.charEmpty || '░',
      showLabels: config.showLabels !== undefined ? config.showLabels : true,
      colorize: config.colorize !== undefined ? config.colorize : true,
      ...config
    };
    
    // ANSI color codes
    this.colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      gray: '\x1b[90m'
    };
  }
  
  /**
   * Create a bar chart visualization
   * @param {Object} data - Data points with labels and values (0-1)
   * @param {string} title - Chart title
   * @returns {string} ASCII bar chart
   */
  createBarChart(data, title = '') {
    const width = this.config.width;
    let output = [];
    
    // Add title if provided
    if (title) {
      output.push(this._colorize(title, this.colors.bright + this.colors.cyan));
      output.push(this._colorize('─'.repeat(width), this.colors.gray));
    }
    
    // Calculate the maximum label length for alignment
    const maxLabelLength = Math.max(...Object.keys(data).map(label => label.length));
    
    // Create bars for each data point
    Object.entries(data).forEach(([label, value]) => {
      // Normalize value between 0 and 1
      const normalizedValue = Math.max(0, Math.min(1, value));
      
      // Calculate bar length
      const barLength = Math.round(normalizedValue * (width - maxLabelLength - 10));
      const emptyLength = width - maxLabelLength - barLength - 10;
      
      // Color based on value
      let color;
      if (normalizedValue >= 0.7) {
        color = this.colors.green;
      } else if (normalizedValue >= 0.5) {
        color = this.colors.blue;
      } else {
        color = this.colors.yellow;
      }
      
      // Format the label with padding
      const paddedLabel = label.padEnd(maxLabelLength, ' ');
      
      // Create the bar
      const bar = this.config.charFull.repeat(barLength) + this.config.charEmpty.repeat(emptyLength);
      
      // Format the percentage
      const percent = `${(normalizedValue * 100).toFixed(1)}%`;
      
      // Combine the elements
      let line = `${paddedLabel} |${bar}| ${percent}`;
      
      // Add color if enabled
      if (this.config.colorize) {
        line = `${paddedLabel} |${this._colorize(bar, color)}| ${this._colorize(percent, color)}`;
      }
      
      output.push(line);
    });
    
    return output.join('\n');
  }
  
  /**
   * Create a radar chart visualization for virtue alignment
   * @param {Object} virtueAlignment - Virtue alignment data
   * @param {string} title - Chart title
   * @returns {string} ASCII radar chart
   */
  createRadarChart(virtueAlignment, title = 'Virtue Alignment') {
    const width = Math.min(this.config.width, 40); // Limit width for radar chart
    const height = width / 2;
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const radius = Math.min(centerX, centerY) - 2;
    
    // Initialize the grid
    let grid = Array(height).fill().map(() => Array(width).fill(' '));
    
    // Draw the axes
    this._drawLine(grid, centerX, centerY, centerX, 0, '|');
    this._drawLine(grid, centerX, centerY, centerX, height - 1, '|');
    this._drawLine(grid, centerX, centerY, 0, centerY, '-');
    this._drawLine(grid, centerX, centerY, width - 1, centerY, '-');
    
    // Place the center point
    grid[centerY][centerX] = '+';
    
    // Values to plot (must be exactly 4 for our simple radar chart)
    const virtues = ['wisdom', 'justice', 'courage', 'temperance'];
    const values = virtues.map(v => virtueAlignment.byVirtue[v] || 0.5);
    
    // Plot the values
    const angles = [270, 0, 90, 180]; // angles for top, right, bottom, left
    const points = [];
    
    for (let i = 0; i < virtues.length; i++) {
      const angle = angles[i] * Math.PI / 180;
      const value = values[i];
      const distance = radius * value;
      
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      const gridX = Math.round(x);
      const gridY = Math.round(y);
      
      points.push({ x: gridX, y: gridY });
      
      // Mark the point
      if (gridY >= 0 && gridY < height && gridX >= 0 && gridX < width) {
        grid[gridY][gridX] = '*';
      }
      
      // Label the axes
      const labelDistance = radius + 1;
      const labelX = centerX + Math.cos(angle) * labelDistance;
      const labelY = centerY + Math.sin(angle) * labelDistance;
      
      const gridLabelX = Math.round(labelX);
      const gridLabelY = Math.round(labelY);
      
      if (gridLabelY >= 0 && gridLabelY < height && gridLabelX >= 0 && gridLabelX < width) {
        const label = virtues[i].charAt(0).toUpperCase();
        grid[gridLabelY][gridLabelX] = label;
      }
    }
    
    // Connect the points
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];
      this._drawLine(grid, p1.x, p1.y, p2.x, p2.y, '*');
    }
    
    // Convert the grid to a string
    let output = [title];
    for (let y = 0; y < height; y++) {
      output.push(grid[y].join(''));
    }
    
    // Add a legend
    output.push('\nW: Wisdom   J: Justice');
    output.push('C: Courage  T: Temperance');
    output.push(`Overall: ${(virtueAlignment.score * 100).toFixed(1)}%`);
    
    return output.join('\n');
  }
  
  /**
   * Create a reflection timeline visualization
   * @param {Array} reflectionLog - Array of reflection entries
   * @param {number} limit - Maximum number of entries to display
   * @returns {string} ASCII timeline visualization
   */
  createReflectionTimeline(reflectionLog, limit = 5) {
    const width = this.config.width;
    let output = [];
    
    // Add title
    output.push(this._colorize('Reflection Timeline', this.colors.bright + this.colors.cyan));
    output.push(this._colorize('─'.repeat(width), this.colors.gray));
    
    // Get the most recent entries up to the limit
    const recentEntries = reflectionLog.slice(-limit);
    
    // Display each entry
    recentEntries.forEach((entry, index) => {
      // Extract date from timestamp
      const date = new Date(entry.timestamp);
      const formattedDate = `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`;
      
      // Format header based on entry type
      const typeColor = entry.type === 'error' ? this.colors.yellow : this.colors.blue;
      const typeText = entry.type === 'error' ? 'ERROR' : 
                      (entry.type === 'reflection' ? 'REFLECTION' : entry.type.toUpperCase());
      
      output.push(this._colorize(`[${formattedDate}] ${typeText}`, typeColor));
      
      // Format details based on entry type
      if (entry.type === 'error') {
        output.push(`  Error: ${entry.error}`);
        output.push(`  Learning: ${entry.recovery.learning}`);
      } else if (entry.type === 'reflection') {
        output.push(`  Patterns: ${entry.reflection.patterns}`);
        output.push(`  Insight: "${entry.reflection.philosophicalInsight}"`);
      } else {
        output.push(`  ${entry.summary || 'Interaction recorded'}`);
      }
      
      // Add divider between entries
      if (index < recentEntries.length - 1) {
        output.push(this._colorize('· · · · · · · · · ·', this.colors.gray));
      }
    });
    
    // If no entries, show a message
    if (recentEntries.length === 0) {
      output.push('No reflection entries recorded yet.');
    }
    
    return output.join('\n');
  }
  
  /**
   * Visualize virtue alignment in a compact format
   * @param {Object} virtueAlignment - Virtue alignment data
   * @returns {string} Compact visualization of virtue alignment
   */
  createCompactVirtueVisualization(virtueAlignment) {
    const width = 20; // Fixed width for compact visualization
    let output = [];
    
    output.push('Virtue Alignment:');
    
    // Create bars for each virtue
    Object.entries(virtueAlignment.byVirtue).forEach(([virtue, value]) => {
      // Calculate bar length
      const barLength = Math.round(value * width);
      
      // Color based on value
      let color;
      if (value >= 0.7) {
        color = this.colors.green;
      } else if (value >= 0.5) {
        color = this.colors.blue;
      } else {
        color = this.colors.yellow;
      }
      
      // First letter capitalized, padded to 10 chars
      const label = virtue.charAt(0).toUpperCase() + virtue.slice(1);
      const paddedLabel = label.padEnd(10, ' ');
      
      // Create the bar
      const bar = this.config.charFull.repeat(barLength);
      
      // Combine the elements
      let line = `${paddedLabel}: ${this._colorize(bar, color)} ${(value * 100).toFixed(0)}%`;
      
      output.push(line);
    });
    
    // Add overall score
    const overallColor = virtueAlignment.score >= 0.7 ? this.colors.green :
                        (virtueAlignment.score >= 0.5 ? this.colors.blue : this.colors.yellow);
    
    output.push('');
    output.push(`Overall: ${this._colorize((virtueAlignment.score * 100).toFixed(1) + '%', overallColor)}`);
    output.push(`Strongest: ${virtueAlignment.primaryVirtue}`);
    output.push(`Weakest: ${virtueAlignment.weakestVirtue}`);
    
    return output.join('\n');
  }
  
  /**
   * Create a textual representation of a concept map
   * @param {Object} concepts - Map of concepts and their relationships
   * @returns {string} ASCII concept map
   */
  createConceptMap(concepts) {
    let output = [];
    
    // Add title
    output.push(this._colorize('Concept Map', this.colors.bright + this.colors.cyan));
    output.push(this._colorize('─'.repeat(this.config.width), this.colors.gray));
    
    // Process each concept
    Object.entries(concepts).forEach(([concept, relations]) => {
      output.push(this._colorize(concept, this.colors.bright));
      
      // Format relationships
      if (Array.isArray(relations)) {
        relations.forEach(rel => {
          output.push(`  ├─ ${rel}`);
        });
      } else if (typeof relations === 'object') {
        Object.entries(relations).forEach(([relType, relTarget], index, array) => {
          const isLast = index === array.length - 1;
          const prefix = isLast ? '  └─ ' : '  ├─ ';
          output.push(`${prefix}${relType}: ${relTarget}`);
        });
      }
      
      output.push('');
    });
    
    return output.join('\n');
  }
  
  // ===== Private Helper Methods =====
  
  /**
   * Add color to text if colorize is enabled
   * @private
   */
  _colorize(text, color) {
    if (!this.config.colorize) return text;
    return `${color}${text}${this.colors.reset}`;
  }
  
  /**
   * Draw a line on the grid
   * @private
   */
  _drawLine(grid, x1, y1, x2, y2, char) {
    // Bresenham's line algorithm
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;
    
    while (true) {
      if (y1 >= 0 && y1 < grid.length && x1 >= 0 && x1 < grid[0].length) {
        grid[y1][x1] = char;
      }
      
      if (x1 === x2 && y1 === y2) break;
      
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x1 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y1 += sy;
      }
    }
  }
}

/**
 * Example usage of the visualization utilities
 */
function exampleVisualization() {
  const viz = new SovereignAgentViz();
  
  // Example virtue alignment data
  const virtueAlignment = {
    score: 0.75,
    primaryVirtue: 'wisdom',
    weakestVirtue: 'temperance',
    byVirtue: {
      wisdom: 0.85,
      justice: 0.78,
      courage: 0.72,
      temperance: 0.65
    }
  };
  
  // Example reflection log
  const reflectionLog = [
    {
      type: 'error',
      timestamp: '2023-06-15T14:32:10Z',
      error: 'Resource not found',
      recovery: {
        learning: 'Verify existence before accessing resources'
      }
    },
    {
      type: 'standard',
      timestamp: '2023-06-15T14:35:22Z',
      summary: 'Processed user request successfully'
    },
    {
      type: 'reflection',
      timestamp: '2023-06-15T15:00:05Z',
      reflection: {
        patterns: 'Tendency to prioritize comprehensive solutions',
        philosophicalInsight: 'True wisdom lies not in avoiding errors, but in learning from them'
      }
    }
  ];
  
  // Example concept map
  const conceptMap = {
    'Wisdom': [
      'Understanding before solution',
      'Careful deliberation',
      'Root cause analysis'
    ],
    'Virtue Ethics': {
      'Encompasses': 'Wisdom, Justice, Courage, Temperance',
      'Founded by': 'Aristotle',
      'Core idea': 'Excellence of character'
    }
  };
  
  // Generate visualizations
  console.log(viz.createBarChart(virtueAlignment.byVirtue, 'Virtue Alignment'));
  console.log('\n' + viz.createRadarChart(virtueAlignment));
  console.log('\n' + viz.createCompactVirtueVisualization(virtueAlignment));
  console.log('\n' + viz.createReflectionTimeline(reflectionLog));
  console.log('\n' + viz.createConceptMap(conceptMap));
}

// Export the visualization class
module.exports = {
  SovereignAgentViz,
  exampleVisualization
}; 