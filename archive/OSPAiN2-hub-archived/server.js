const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const net = require('net');

const app = express();
const BASE_PORT = process.env.PORT || 3002;
let PORT = BASE_PORT;

// Custom logger for server operations
const logger = {
  info: (message) => {
    console.log(`[SERVER INFO] ${new Date().toISOString()} - ${message}`);
  },
  warn: (message) => {
    console.warn(`[SERVER WARNING] ${new Date().toISOString()} - ${message}`);
  },
  error: (message, error) => {
    console.error(
      `[SERVER ERROR] ${new Date().toISOString()} - ${message}`,
      error ? `\n${error.stack || error}` : '',
    );
  },
  debug: (message, data) => {
    if (process.env.DEBUG) {
      console.debug(
        `[SERVER DEBUG] ${new Date().toISOString()} - ${message}`,
        data ? `\n${JSON.stringify(data, null, 2)}` : '',
      );
    }
  },
};

// Server startup timestamp for health checks
const startupTime = new Date();
let requestCount = 0;
let errorCount = 0;

// Function to check if a port is in use
const isPortInUse = (port) => {
  return new Promise((resolve) => {
    const server = net
      .createServer()
      .once('error', () => resolve(true))
      .once('listening', () => {
        server.close();
        resolve(false);
      })
      .listen(port);
  });
};

// Find an available port starting from BASE_PORT
const findAvailablePort = async () => {
  let port = BASE_PORT;
  let attempts = 0;

  while ((await isPortInUse(port)) && attempts < 10) {
    port++;
    attempts++;
  }

  if (attempts >= 10) {
    console.error(
      '[SERVER ERROR]',
      new Date().toISOString(),
      `- Could not find an available port after 10 attempts`,
    );
    process.exit(1);
  }

  return port;
};

// Enable CORS for all routes
app.use(cors());

// Parse JSON request body
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  requestCount++;

  // Log request info
  logger.info(`${req.method} ${req.url}`);

  // Log request details in debug mode
  logger.debug('Request details', {
    headers: req.headers,
    query: req.query,
    params: req.params,
    body: req.body,
  });

  // Capture response to log status and duration
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.url} ${res.statusCode} - ${duration}ms`;

    if (res.statusCode >= 500) {
      logger.error(message);
      errorCount++;
    } else if (res.statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.info(message);
    }
  });

  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const uptime = Math.floor((new Date() - startupTime) / 1000);

  const healthData = {
    status: 'ok',
    uptime: uptime,
    timestamp: new Date().toISOString(),
    serverInfo: {
      startedAt: startupTime.toISOString(),
      requestsProcessed: requestCount,
      errorsEncountered: errorCount,
      todoFileExists: fs.existsSync(path.join(__dirname, '..', '@master-todo.mdc')),
    },
  };

  // Log health check in debug mode
  logger.debug('Health check request', healthData);

  res.json(healthData);
});

// Add visualization data API endpoint
app.get('/api/visualization/patterns', (req, res) => {
  logger.info('Serving visualization pattern data');

  // Mock data for patterns
  const patterns = [
    {
      id: '1',
      name: 'Context Confusion',
      description: 'Model fails to maintain context throughout a conversation',
      frequency: 75,
      connections: ['2', '5'],
    },
    {
      id: '2',
      name: 'Hallucination',
      description: 'Generation of content not supported by provided information',
      frequency: 92,
      connections: ['1', '3', '4'],
    },
    {
      id: '3',
      name: 'Over-Confidence',
      description: 'High confidence in incorrect or unverified statements',
      frequency: 67,
      connections: ['2', '5'],
    },
    {
      id: '4',
      name: 'Conflation',
      description: 'Merging distinct concepts inappropriately',
      frequency: 41,
      connections: ['2', '5'],
    },
    {
      id: '5',
      name: 'Knowledge Gap',
      description: 'Missing essential information for task completion',
      frequency: 58,
      connections: ['1', '3', '4'],
    },
  ];

  // Mock analysis data
  const analysis = {
    typeDistribution: {
      'Context Confusion': 35,
      Hallucination: 45,
      'Over-Confidence': 28,
      Conflation: 15,
      'Knowledge Gap': 22,
    },
    frequencyDistribution: {
      high: 38,
      medium: 72,
      low: 35,
    },
    mostCommonPatterns: patterns.slice(0, 3).sort((a, b) => b.frequency - a.frequency),
    recentPatterns: [...patterns].sort(() => Math.random() - 0.5).slice(0, 3),
  };

  // Return complete data package
  res.json({
    patterns,
    analysis,
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'static-data',
      version: '1.0.0',
    },
  });
});

// API endpoint to serve the todo file content
app.get('/api/todo', (req, res) => {
  const todoFilePath = path.join(__dirname, '..', '@master-todo.mdc');

  try {
    // Check for file existence
    if (fs.existsSync(todoFilePath)) {
      logger.info(`Reading todo file from ${todoFilePath}`);
      const fileContent = fs.readFileSync(todoFilePath, 'utf8');

      // Add file metadata
      const stats = fs.statSync(todoFilePath);
      const fileMetadata = {
        size: stats.size,
        lastModified: stats.mtime,
        path: todoFilePath,
      };

      logger.debug('Todo file metadata', fileMetadata);

      // Return the file content as JSON with metadata
      res.json({
        content: fileContent,
        metadata: fileMetadata,
        parsedData: {
          categories: [
            { name: 'AI Infrastructure', priority: 1, progress: 40 },
            { name: 'Agent Framework', priority: 1, progress: 25 },
            { name: 'Development Tools', priority: 1, progress: 35 },
            { name: 'Continuity System', priority: 2, progress: 45 },
            { name: 'Mode Orchestration', priority: 2, progress: 55 },
            { name: 'Frontend Implementation', priority: 3, progress: 45 },
            { name: 'Backend Development', priority: 3, progress: 35 },
            { name: 'Mobile Support', priority: 4, progress: 5 },
            { name: 'Security & Compliance', priority: 4, progress: 40 },
          ],
          overallProgress: 35,
        },
      });
    } else {
      // If file doesn't exist, return mock data with appropriate warning
      logger.warn(`Todo file not found at ${todoFilePath}, returning mock data`);

      res.status(404).json({
        error: 'Todo file not found',
        mockData: true,
        content: '# Mock Todo File - Actual file not found',
        parsedData: {
          categories: [{ name: 'Mock Category', priority: 1, progress: 50 }],
          overallProgress: 20,
        },
      });
    }
  } catch (error) {
    // Enhanced error logging
    errorCount++;
    logger.error(`Error serving todo file from ${todoFilePath}`, error);

    // Determine appropriate error message based on error type
    let errorMessage = 'Failed to fetch todo data';
    let statusCode = 500;

    if (error.code === 'EACCES') {
      errorMessage = 'Permission denied: Cannot access todo file';
    } else if (error.code === 'EISDIR') {
      errorMessage = 'Expected a file but found a directory';
    } else if (error.code === 'EMFILE') {
      errorMessage = 'Too many open files, try again later';
      statusCode = 503; // Service Unavailable
    }

    // Send error response with details for client
    res.status(statusCode).json({
      error: errorMessage,
      code: error.code || 'UNKNOWN',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// For the React app - serve index.html for any route not matching API routes
app.get('*', (req, res) => {
  console.log('[SERVER INFO]', new Date().toISOString(), `- GET ${req.url}`);

  // Check if we should serve the built React app
  const indexPath = path.join(__dirname, 'build', 'index.html');

  // Check if the build directory exists
  if (fs.existsSync(path.join(__dirname, 'build'))) {
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }

  // If we're in development mode, we should redirect to the React dev server
  console.log('[SERVER WARNING]', new Date().toISOString(), `- Not found: GET ${req.url}`);
  console.log(
    '[SERVER WARNING]',
    new Date().toISOString(),
    `- GET ${req.url} 404 - ${Date.now() - req._startTime}ms`,
  );
  console.log(
    '[SERVER INFO]',
    new Date().toISOString(),
    `- In development mode, please run 'npm start' in a separate terminal`,
  );

  res.status(404).send(`
    <html>
      <head>
        <title>OSPAiN² Hub - Development Mode</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .container { background-color: #f5f5f5; padding: 20px; border-radius: 5px; }
          h1 { color: #333; }
          code { background-color: #eee; padding: 2px 5px; border-radius: 3px; }
          .steps { margin-top: 20px; }
          .step { margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>OSPAiN² Hub - Development Mode</h1>
          <p>The server is running, but the frontend application is not being served from this endpoint.</p>
          
          <div class="steps">
            <p>To start the application in development mode:</p>
            <div class="step">1. Keep this server running (API on port ${PORT})</div>
            <div class="step">2. Open a new terminal</div>
            <div class="step">3. Navigate to the project directory</div>
            <div class="step">4. Run <code>npm start</code> to start the React development server on port 3000</div>
            <div class="step">5. Visit <a href="http://localhost:3000">http://localhost:3000</a> in your browser</div>
          </div>
          
          <p>API endpoints are available at:</p>
          <ul>
            <li><a href="/api/health">/api/health</a> (Health Check)</li>
            <li><a href="/api/todo">/api/todo</a> (Todo Data)</li>
            <li><a href="/api/visualization/patterns">/api/visualization/patterns</a> (Visualization Data)</li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

// Global error handler for unexpected errors
app.use((err, req, res, next) => {
  errorCount++;
  logger.error(`Unhandled error for ${req.method} ${req.url}`, err);

  res.status(500).json({
    error: 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start the server
const startServer = async () => {
  PORT = await findAvailablePort();

  app.listen(PORT, () => {
    console.log('[SERVER INFO]', new Date().toISOString(), `- API server running on port ${PORT}`);
    console.log('[SERVER INFO]', new Date().toISOString(), '- API endpoints available at:');
    console.log(
      '[SERVER INFO]',
      new Date().toISOString(),
      `-   - http://localhost:${PORT}/api/health (Health Check)`,
    );
    console.log(
      '[SERVER INFO]',
      new Date().toISOString(),
      `-   - http://localhost:${PORT}/api/todo (Todo Data)`,
    );
    console.log(
      '[SERVER INFO]',
      new Date().toISOString(),
      `-   - http://localhost:${PORT}/api/visualization/patterns (Visualization Data)`,
    );
    console.log(
      '[SERVER INFO]',
      new Date().toISOString(),
      '- Note: 3D visualizations have been temporarily disabled to simplify the application.',
    );
    console.log(
      '[SERVER INFO]',
      new Date().toISOString(),
      '- Data is now served as JSON instead of WebSockets.',
    );
  });
};

startServer();
