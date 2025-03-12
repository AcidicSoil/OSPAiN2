/**
 * mcp-servers/shared/mcp-types.ts
 * 
 * Type definitions for the Model Context Protocol (MCP).
 * These types define the structure of requests and responses for MCP servers.
 */

// MCP Tool Parameter Definition
export interface MCPToolParameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    description: string;
    default?: any;
    required?: boolean;
}

// MCP Tool Output Definition
export interface MCPToolOutput {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    description: string;
}

// MCP Tool Definition
export interface MCPTool {
    name: string;
    description: string;
    parameters: MCPToolParameter[];
    output: MCPToolOutput;
}

// MCP Resource Definition
export interface MCPResource {
    name: string;
    description: string;
    contentType: string;
    data?: any;
}

// MCP Prompt Definition
export interface MCPPrompt {
    name: string;
    description: string;
    template: string;
    parameters: MCPToolParameter[];
}

// MCP Server Information
export interface MCPServerInfo {
    name: string;
    version: string;
    description: string;
    tools: MCPTool[];
    resources?: MCPResource[];
    prompts?: MCPPrompt[];
}

// MCP Tool Request
export interface MCPToolRequest {
    id: string;
    tool: string;
    parameters: Record<string, any>;
}

// MCP Tool Response
export interface MCPToolResponse {
    id: string;
    tool: string;
    success: boolean;
    result?: any;
    error?: string;
    metadata?: Record<string, any>;
}

// MCP Resource Request
export interface MCPResourceRequest {
    id: string;
    resource: string;
    parameters?: Record<string, any>;
}

// MCP Resource Response
export interface MCPResourceResponse {
    id: string;
    resource: string;
    success: boolean;
    data?: any;
    error?: string;
    contentType?: string;
    metadata?: Record<string, any>;
}

// MCP Prompt Request
export interface MCPPromptRequest {
    id: string;
    prompt: string;
    parameters: Record<string, any>;
}

// MCP Prompt Response
export interface MCPPromptResponse {
    id: string;
    prompt: string;
    success: boolean;
    result?: string;
    error?: string;
    metadata?: Record<string, any>;
}

// SSE Event Types
export enum MCPEventType {
    CONNECTED = 'connected',
    INFO = 'info',
    TOOL_REQUEST = 'tool_request',
    TOOL_RESPONSE = 'tool_response',
    RESOURCE_REQUEST = 'resource_request',
    RESOURCE_RESPONSE = 'resource_response',
    PROMPT_REQUEST = 'prompt_request',
    PROMPT_RESPONSE = 'prompt_response',
    ERROR = 'error',
    PING = 'ping'
} 