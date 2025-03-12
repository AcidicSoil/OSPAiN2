/**
 * mcp-servers/shared/sse-server.ts
 * 
 * Base Server-Sent Events (SSE) server implementation for MCP.
 * This provides core functionality that all MCP servers will extend.
 */

import express, { Request, Response, Express, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { EventEmitter } from 'events';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Type definitions
export interface SSEConnection {
    id: string;
    response: Response;
    lastEventId?: string;
}

export interface ServerConfig {
    port: number;
    name: string;
    baseRoute?: string;
    verbose?: boolean;
}

/**
 * Base SSE Server class for MCP implementations
 */
export class SSEServer {
    app: Express;
    name: string;
    port: number;
    baseRoute: string;
    verbose: boolean;
    connections: Map<string, SSEConnection>;
    eventEmitter: EventEmitter;

    constructor(config: ServerConfig) {
        this.app = express();
        this.name = config.name;
        this.port = config.port;
        this.baseRoute = config.baseRoute || '/api';
        this.verbose = config.verbose || false;
        this.connections = new Map();
        this.eventEmitter = new EventEmitter();

        this.initializeMiddleware();
        this.initializeSSEEndpoint();
        this.handleErrors();
    }

    /**
     * Initialize Express middleware
     */
    protected initializeMiddleware(): void {
        // Apply standard middleware
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        // Security and logging middleware
        this.app.use(helmet({
            contentSecurityPolicy: false // Allow SSE connections
        }));

        if (this.verbose) {
            this.app.use(morgan('dev'));
        }
    }

    /**
     * Initialize SSE endpoint for MCP
     */
    protected initializeSSEEndpoint(): void {
        this.app.get('/sse', (req: Request, res: Response) => {
            const clientId = req.query.clientId as string || `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // Set SSE headers
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no' // Disable nginx buffering
            });

            // Send initial connection message
            res.write(`event: connected\n`);
            res.write(`data: {"id":"${clientId}"}\n\n`);

            // Store client connection
            const connection: SSEConnection = { id: clientId, response: res };
            this.connections.set(clientId, connection);

            if (this.verbose) {
                console.log(`[${this.name}] Client connected: ${clientId}`);
            }

            // Handle client disconnect
            req.on('close', () => {
                this.connections.delete(clientId);
                if (this.verbose) {
                    console.log(`[${this.name}] Client disconnected: ${clientId}`);
                }
            });

            // Send keepalive every 30 seconds
            const keepaliveInterval = setInterval(() => {
                if (this.connections.has(clientId)) {
                    res.write(`event: ping\n`);
                    res.write(`data: {}\n\n`);
                } else {
                    clearInterval(keepaliveInterval);
                }
            }, 30000);
        });
    }

    /**
     * Send event to specific client
     */
    protected sendEvent(clientId: string, event: string, data: any): boolean {
        const connection = this.connections.get(clientId);
        if (connection) {
            try {
                connection.response.write(`event: ${event}\n`);
                connection.response.write(`data: ${JSON.stringify(data)}\n\n`);
                return true;
            } catch (error) {
                console.error(`[${this.name}] Error sending event to client ${clientId}:`, error);
                this.connections.delete(clientId);
                return false;
            }
        }
        return false;
    }

    /**
     * Broadcast event to all connected clients
     */
    protected broadcastEvent(event: string, data: any): void {
        this.connections.forEach((connection) => {
            this.sendEvent(connection.id, event, data);
        });
    }

    /**
     * Handle global errors
     */
    protected handleErrors(): void {
        this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            console.error(`[${this.name}] Error:`, err);
            res.status(500).json({
                success: false,
                message: 'Internal Server Error',
                error: this.verbose ? err.message : undefined
            });
        });
    }

    /**
     * Start the server
     */
    public start(): void {
        this.app.listen(this.port, () => {
            console.log(`[${this.name}] MCP Server running on port ${this.port}`);
        });
    }
} 