import path from "path";
import { MCPServer, MCPServerConfig } from "../shared/mcp-server";
import {
  MCPToolRequest,
  MCPToolResponse,
  MCPResourceRequest,
  MCPResourceResponse,
  MCPPromptRequest,
  MCPPromptResponse,
} from "../shared/mcp-types";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Template MCP Server implementation
 *
 * This is a template for creating new MCP servers.
 * Use this as a starting point for your own implementations.
 */
class TemplateServer extends MCPServer {
  constructor() {
    // Configure server options
    const config: MCPServerConfig = {
      port: parseInt(process.env.TEMPLATE_SERVER_PORT || "3000", 10),
      name: "template-server",
      baseRoute: "/api/template",
      verbose: process.env.TEMPLATE_SERVER_VERBOSE === "true",
      version: "1.0.0",
      description: "Template MCP Server",
      security: {
        // Configure rate limiting
        rateLimit: {
          windowMs: 60000, // 1 minute
          maxRequests: 100, // 100 requests per minute
          message:
            "Too many requests from this IP, please try again after a minute",
          skipSuccessfulRequests: true, // Don't count successful requests
        },
        // Configure IP restrictions if needed
        // ipRestriction: {
        //     allowedIPs: ['127.0.0.1'], // Only allow localhost
        //     blockedIPs: [], // Block specific IPs
        //     message: 'Access denied'
        // },
        // Configure audit logging
        audit: {
          logDirectory: path.join(__dirname, "../../logs/template-server"),
          logFilename: "audit.log",
          events: ["request", "error"], // Log requests and errors
        },
      },
    };

    super(config);

    // Register tools, resources, and prompts
    this.registerServerCapabilities();
  }

  /**
   * Register server capabilities (tools, resources, prompts)
   */
  private registerServerCapabilities(): void {
    // Register example tool
    this.registerTool({
      name: "example",
      description: "Example tool for template server",
      parameters: {
        type: "object",
        properties: {
          input: {
            type: "string",
            description: "Input parameter for the tool",
          },
        },
        required: ["input"],
      },
    });

    // Register example resource
    this.registerResource({
      name: "example",
      description: "Example resource for template server",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "ID of the resource to retrieve",
          },
        },
        required: ["id"],
      },
    });

    // Register example prompt
    this.registerPrompt({
      name: "example",
      description: "Example prompt for template server",
      parameters: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "Text to process",
          },
        },
        required: ["text"],
      },
    });
  }

  /**
   * Execute tool
   */
  protected async executeTool(
    request: MCPToolRequest
  ): Promise<MCPToolResponse> {
    const { tool, parameters } = request;

    try {
      // Handle different tools
      switch (tool) {
        case "example":
          return {
            success: true,
            result: `Processed: ${parameters.input}`,
          };
        default:
          return {
            success: false,
            error: `Unknown tool: ${tool}`,
          };
      }
    } catch (error) {
      // Handle errors
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get resource
   */
  protected async getResource(
    request: MCPResourceRequest
  ): Promise<MCPResourceResponse> {
    const { resource, parameters } = request;

    try {
      // Handle different resources
      switch (resource) {
        case "example":
          return {
            success: true,
            contentType: "application/json",
            data: JSON.stringify({
              id: parameters.id,
              timestamp: new Date().toISOString(),
            }),
          };
        default:
          return {
            success: false,
            error: `Unknown resource: ${resource}`,
          };
      }
    } catch (error) {
      // Handle errors
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Execute prompt
   */
  protected async executePrompt(
    request: MCPPromptRequest
  ): Promise<MCPPromptResponse> {
    const { prompt, parameters } = request;

    try {
      // Handle different prompts
      switch (prompt) {
        case "example":
          return {
            success: true,
            result: `Processed prompt: ${parameters.text}`,
          };
        default:
          return {
            success: false,
            error: `Unknown prompt: ${prompt}`,
          };
      }
    } catch (error) {
      // Handle errors
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Create and start server
const server = new TemplateServer();
server.start();
