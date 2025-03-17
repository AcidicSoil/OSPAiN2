/**
 * Sovereign Agent Framework - Express Middleware Integration
 * Part of Horizon 3 (Future) implementation for Ollama Ecosystem.
 * 
 * @context: Connected to agent-creed.js for core functionality
 * @context: Provides integration with Express web applications
 */

const { SovereignAgentCreed } = require('../agent-creed');
const { SovereignAgentViz } = require('../visualization');

/**
 * Creates Express middleware that integrates the Sovereign Agent framework
 * into request/response processing
 * 
 * @param {Object} options - Configuration options
 * @returns {Function} Express middleware function
 */
function createSovereignAgentMiddleware(options = {}) {
  const config = {
    // Creed configuration
    reflectionFrequency: options.reflectionFrequency || 10,
    virtueThreshold: options.virtueThreshold || 0.7,
    introspectionDepth: options.introspectionDepth || 3,
    
    // Middleware operation options
    enhanceResponses: options.enhanceResponses !== undefined ? options.enhanceResponses : true,
    trackMetrics: options.trackMetrics !== undefined ? options.trackMetrics : true,
    logReflections: options.logReflections !== undefined ? options.logReflections : true,
    evaluateRequests: options.evaluateRequests !== undefined ? options.evaluateRequests : false,
    headerPrefix: options.headerPrefix || 'X-Sovereign-',
    
    // Path configuration
    excludePaths: options.excludePaths || ['/health', '/metrics', '/favicon.ico'],
    reflectionPath: options.reflectionPath || '/admin/reflections',
    metricsPath: options.metricsPath || '/admin/agent-metrics',
    
    // Security and access
    requireAuthForAdmin: options.requireAuthForAdmin !== undefined ? options.requireAuthForAdmin : true,
    authFunction: options.authFunction || defaultAuthFunction,
    
    ...options
  };
  
  // Initialize the creed
  const creed = new SovereignAgentCreed({
    reflectionFrequency: config.reflectionFrequency,
    virtueThreshold: config.virtueThreshold,
    introspectionDepth: config.introspectionDepth,
    ...options.creedOptions
  });
  
  // Initialize visualization utilities
  const viz = new SovereignAgentViz();
  
  // Metrics tracking
  const metrics = {
    requestsProcessed: 0,
    reflectionsPerformed: 0,
    averageVirtueScore: 0,
    errorsProcessed: 0,
    pathMetrics: {},
    virtueAlignmentHistory: []
  };
  
  // Return the Express middleware function
  return function sovereignAgentMiddleware(req, res, next) {
    // Skip excluded paths
    if (config.excludePaths.some(path => req.path.startsWith(path))) {
      return next();
    }
    
    // Special admin endpoints
    if (req.path === config.reflectionPath) {
      return handleReflectionRequest(req, res, creed, viz, config);
    }
    
    if (req.path === config.metricsPath) {
      return handleMetricsRequest(req, res, metrics, viz, config);
    }
    
    // Start timing
    const startTime = process.hrtime();
    
    // Add creed context to request
    req.creedContext = {
      morningReflection: creed.performMorningPriming(),
      startTime: Date.now()
    };
    
    // Evaluate the request if enabled
    if (config.evaluateRequests) {
      const requestDescription = `${req.method} ${req.path}`;
      const decision = creed.evaluateDecision(requestDescription);
      req.creedContext.decision = decision;
      
      // Add virtue alignment headers
      if (decision) {
        res.setHeader(
          `${config.headerPrefix}Virtue-Score`, 
          (decision.virtueAlignment.score * 100).toFixed(1)
        );
      }
    }
    
    // Capture the original res.send
    const originalSend = res.send;
    
    // Override res.send to enhance responses
    res.send = function(body) {
      try {
        if (config.enhanceResponses && body) {
          // Only enhance text responses
          const contentType = res.get('Content-Type') || '';
          
          if (contentType.includes('text/html') || 
              contentType.includes('application/json') || 
              contentType.includes('text/plain')) {
            
            // Convert buffers or objects to strings
            let bodyStr = body;
            if (Buffer.isBuffer(body)) {
              bodyStr = body.toString('utf8');
            } else if (typeof body === 'object') {
              bodyStr = JSON.stringify(body);
            }
            
            // Enhance the response with context
            if (typeof bodyStr === 'string') {
              // For JSON responses, add context as a special field
              if (contentType.includes('application/json')) {
                try {
                  const jsonBody = JSON.parse(bodyStr);
                  const contextAnchor = selectRelevantContextAnchor(creed, req);
                  
                  if (!jsonBody._meta) {
                    jsonBody._meta = {};
                  }
                  
                  jsonBody._meta.creedReflection = contextAnchor;
                  body = JSON.stringify(jsonBody);
                } catch (e) {
                  // Failed to parse JSON, leave body as is
                }
              } 
              // For HTML, add at the end as a comment
              else if (contentType.includes('text/html')) {
                const contextAnchor = selectRelevantContextAnchor(creed, req);
                body = bodyStr + `\n<!-- Reflection: ${contextAnchor} -->`;
              } 
              // For plain text, just use the standard enhancement
              else if (contentType.includes('text/plain')) {
                body = creed.enhanceWithContext(bodyStr);
              }
            }
          }
        }
      } catch (error) {
        // Log but don't fail if enhancement errors
        console.error('Error enhancing response:', error);
      }
      
      // Call the original send
      return originalSend.call(this, body);
    };
    
    // Continue with the request
    res.on('finish', () => {
      // Calculate duration
      const hrDuration = process.hrtime(startTime);
      const durationMs = hrDuration[0] * 1000 + hrDuration[1] / 1000000;
      
      // Record the interaction
      const statusCode = res.statusCode;
      const isError = statusCode >= 400;
      
      if (isError) {
        const error = new Error(`HTTP ${statusCode} on ${req.method} ${req.path}`);
        creed.processError(error);
        
        if (config.trackMetrics) {
          metrics.errorsProcessed++;
        }
      } else {
        const interaction = {
          type: 'http_request',
          summary: `${req.method} ${req.path} (${statusCode})`,
          durationMs: durationMs,
          virtueAlignment: req.creedContext.decision?.virtueAlignment
        };
        
        const reflection = creed.recordInteraction(interaction);
        
        // Update metrics
        if (config.trackMetrics) {
          metrics.requestsProcessed++;
          
          // Update path metrics
          const pathKey = `${req.method}:${req.path}`;
          if (!metrics.pathMetrics[pathKey]) {
            metrics.pathMetrics[pathKey] = {
              count: 0,
              totalDuration: 0,
              averageDuration: 0
            };
          }
          
          metrics.pathMetrics[pathKey].count++;
          metrics.pathMetrics[pathKey].totalDuration += durationMs;
          metrics.pathMetrics[pathKey].averageDuration = 
            metrics.pathMetrics[pathKey].totalDuration / metrics.pathMetrics[pathKey].count;
          
          // Track virtue alignment if available
          if (interaction.virtueAlignment) {
            metrics.virtueAlignmentHistory.push({
              timestamp: new Date().toISOString(),
              score: interaction.virtueAlignment.score,
              path: req.path
            });
            
            // Update average
            const totalScore = metrics.virtueAlignmentHistory.reduce((sum, item) => sum + item.score, 0);
            metrics.averageVirtueScore = totalScore / metrics.virtueAlignmentHistory.length;
          }
          
          // Track reflection metrics
          if (reflection) {
            metrics.reflectionsPerformed++;
            
            // Log reflection if enabled
            if (config.logReflections) {
              console.log('Sovereign Agent Reflection:', 
                          reflection.philosophicalInsight || 'Reflection performed');
            }
          }
        }
      }
    });
    
    next();
  };
}

/**
 * Handle requests to the reflection endpoint
 */
function handleReflectionRequest(req, res, creed, viz, config) {
  // Check authorization if required
  if (config.requireAuthForAdmin && !config.authFunction(req)) {
    res.status(401).send('Unauthorized');
    return;
  }
  
  // Force a reflection
  const reflection = creed.performReflection();
  
  // Determine format based on Accept header
  const acceptHeader = req.get('Accept') || '';
  
  if (acceptHeader.includes('application/json')) {
    // Return as JSON
    res.json({
      reflection: reflection,
      reflectionLog: creed.reflectionLog || []
    });
  } else {
    // Return as HTML
    let output = '<html><head><title>Sovereign Agent - Reflections</title>';
    output += '<style>body{font-family:sans-serif;margin:20px;line-height:1.6}';
    output += '.container{max-width:800px;margin:0 auto}';
    output += 'h1,h2{color:#333}';
    output += '.insight{color:#0066cc;font-style:italic;margin:10px 0}';
    output += '.timeline{margin:20px 0;padding:10px;background:#f5f5f5;border-radius:5px}';
    output += '.entry{margin:10px 0;padding:10px;border-left:4px solid #ddd}';
    output += '.error{border-color:#ff6666}';
    output += '.reflection{border-color:#66aaff}';
    output += '.standard{border-color:#66cc99}';
    output += '</style></head><body><div class="container">';
    
    output += '<h1>Sovereign Agent Reflections</h1>';
    
    // Current reflection
    output += '<h2>Latest Reflection</h2>';
    output += `<p><strong>Patterns:</strong> ${reflection.patterns}</p>`;
    output += `<p><strong>Improvement:</strong> ${reflection.improvement}</p>`;
    output += `<p class="insight">"${reflection.philosophicalInsight}"</p>`;
    
    // Virtue assessment
    output += '<h2>Virtue Assessment</h2>';
    output += `<pre>${viz.createCompactVirtueVisualization({
      score: reflection.virtueAssessment.overall,
      primaryVirtue: reflection.virtueAssessment.strongest,
      weakestVirtue: reflection.virtueAssessment.weakest,
      byVirtue: {
        wisdom: reflection.virtueAssessment.overall * 1.1, // Simplified
        justice: reflection.virtueAssessment.overall * 0.9,
        courage: reflection.virtueAssessment.overall * 1.0,
        temperance: reflection.virtueAssessment.overall * 0.8
      }
    })}</pre>`;
    
    // Reflection log/timeline
    if (creed.reflectionLog && creed.reflectionLog.length > 0) {
      output += '<h2>Reflection Timeline</h2>';
      output += '<div class="timeline">';
      
      // Display recent entries, most recent first
      const recentEntries = [...creed.reflectionLog].reverse().slice(0, 10);
      
      recentEntries.forEach(entry => {
        const date = new Date(entry.timestamp);
        const formattedDate = `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`;
        
        let entryClass = 'standard';
        if (entry.type === 'error') entryClass = 'error';
        if (entry.type === 'reflection') entryClass = 'reflection';
        
        output += `<div class="entry ${entryClass}">`;
        output += `<p><strong>[${formattedDate}] ${entry.type.toUpperCase()}</strong></p>`;
        
        if (entry.type === 'error') {
          output += `<p>Error: ${entry.error}</p>`;
          output += `<p>Learning: ${entry.recovery.learning}</p>`;
        } else if (entry.type === 'reflection') {
          output += `<p>Patterns: ${entry.reflection.patterns}</p>`;
          output += `<p>Insight: "${entry.reflection.philosophicalInsight}"</p>`;
        } else {
          output += `<p>${entry.summary || 'Interaction recorded'}</p>`;
        }
        
        output += '</div>';
      });
      
      output += '</div>';
    } else {
      output += '<p>No reflection entries recorded yet.</p>';
    }
    
    output += '</div></body></html>';
    
    res.send(output);
  }
}

/**
 * Handle requests to the metrics endpoint
 */
function handleMetricsRequest(req, res, metrics, viz, config) {
  // Check authorization if required
  if (config.requireAuthForAdmin && !config.authFunction(req)) {
    res.status(401).send('Unauthorized');
    return;
  }
  
  // Determine format based on Accept header
  const acceptHeader = req.get('Accept') || '';
  
  if (acceptHeader.includes('application/json')) {
    // Return as JSON
    res.json(metrics);
  } else {
    // Return as HTML
    let output = '<html><head><title>Sovereign Agent - Metrics</title>';
    output += '<style>body{font-family:sans-serif;margin:20px;line-height:1.6}';
    output += '.container{max-width:800px;margin:0 auto}';
    output += 'h1,h2{color:#333}';
    output += 'table{width:100%;border-collapse:collapse;margin:20px 0}';
    output += 'th,td{padding:8px;text-align:left;border-bottom:1px solid #ddd}';
    output += 'th{background-color:#f2f2f2}';
    output += '.metric{font-size:24px;font-weight:bold;color:#0066cc}';
    output += '.card{background:#f5f5f5;border-radius:5px;padding:20px;margin:10px 0}';
    output += '</style></head><body><div class="container">';
    
    output += '<h1>Sovereign Agent Metrics</h1>';
    
    // Summary metrics
    output += '<div class="card">';
    output += '<h2>Summary</h2>';
    output += '<table><tr><td>Requests Processed</td><td class="metric">' + 
              metrics.requestsProcessed + '</td></tr>';
    output += '<tr><td>Reflections Performed</td><td class="metric">' + 
              metrics.reflectionsPerformed + '</td></tr>';
    output += '<tr><td>Errors Processed</td><td class="metric">' + 
              metrics.errorsProcessed + '</td></tr>';
    output += '<tr><td>Average Virtue Score</td><td class="metric">' + 
              (metrics.averageVirtueScore * 100).toFixed(1) + '%</td></tr>';
    output += '</table></div>';
    
    // Path metrics
    if (Object.keys(metrics.pathMetrics).length > 0) {
      output += '<div class="card">';
      output += '<h2>Path Metrics</h2>';
      output += '<table><tr><th>Path</th><th>Count</th><th>Avg Duration (ms)</th></tr>';
      
      Object.entries(metrics.pathMetrics)
        .sort((a, b) => b[1].count - a[1].count)  // Sort by count, descending
        .forEach(([path, data]) => {
          output += `<tr><td>${path}</td><td>${data.count}</td>` + 
                    `<td>${data.averageDuration.toFixed(2)}</td></tr>`;
        });
      
      output += '</table></div>';
    }
    
    // Virtue alignment history
    if (metrics.virtueAlignmentHistory.length > 0) {
      output += '<div class="card">';
      output += '<h2>Recent Virtue Alignment</h2>';
      output += '<table><tr><th>Time</th><th>Path</th><th>Score</th></tr>';
      
      // Show most recent 10 entries
      metrics.virtueAlignmentHistory
        .slice(-10)
        .reverse()
        .forEach(entry => {
          const date = new Date(entry.timestamp);
          const formattedTime = date.toLocaleTimeString();
          const scoreValue = (entry.score * 100).toFixed(1) + '%';
          
          output += `<tr><td>${formattedTime}</td><td>${entry.path}</td>` + 
                    `<td>${scoreValue}</td></tr>`;
        });
      
      output += '</table></div>';
    }
    
    output += '</div></body></html>';
    
    res.send(output);
  }
}

/**
 * Default authentication function that always returns true
 * Should be replaced with proper authentication in production
 */
function defaultAuthFunction(req) {
  return true;
}

/**
 * Select a relevant context anchor based on the request
 */
function selectRelevantContextAnchor(creed, req) {
  // This is a simplified implementation
  // A more sophisticated version would analyze request content and match to anchors
  return creed.contextAnchors[Math.floor(Math.random() * creed.contextAnchors.length)];
}

/**
 * Example Express app using the Sovereign Agent middleware
 */
function exampleUsage() {
  const express = require('express');
  const app = express();
  
  // Create and apply the middleware
  const sovereignAgent = createSovereignAgentMiddleware({
    reflectionFrequency: 5,
    virtueThreshold: 0.6,
    excludePaths: ['/health', '/public'],
    enhanceResponses: true,
    trackMetrics: true,
    logReflections: true,
    evaluateRequests: true,
    requireAuthForAdmin: false // For demo purposes only
  });
  
  app.use(sovereignAgent);
  
  // Routes
  app.get('/', (req, res) => {
    res.send('Welcome to the Sovereign Agent-enhanced application');
  });
  
  app.get('/api/data', (req, res) => {
    res.json({
      message: 'This response will be enhanced with meta-cognitive context',
      data: [1, 2, 3, 4, 5]
    });
  });
  
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy' }); // Not enhanced due to excludePaths
  });
  
  // Start the server
  app.listen(3000, () => {
    console.log('Example app listening on port 3000');
  });
}

module.exports = {
  createSovereignAgentMiddleware,
  exampleUsage
}; 