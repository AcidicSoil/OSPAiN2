import { EventEmitter } from 'events';

// Base types for workflow nodes
export type NodeId = string;
export type PortId = string;
export type ConnectionId = string;

// Data types that can flow between nodes
export type DataType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'image'
  | 'audio'
  | 'video'
  | 'model'
  | 'embedding'
  | 'tensor'
  | 'prompt'
  | 'completion'
  | 'file'
  | 'directory'
  | 'custom';

// Port definition for inputs/outputs
export interface Port {
  id: PortId;
  name: string;
  dataType: DataType;
  description?: string;
  required?: boolean;
  defaultValue?: any;
  validation?: (value: any) => boolean;
}

// Node definition
export interface WorkflowNode {
  id: NodeId;
  type: string;
  name: string;
  description?: string;
  category?: string;
  inputs: Port[];
  outputs: Port[];
  position?: { x: number; y: number };
  data?: Record<string, any>;
  metadata?: Record<string, any>;
  isProcessing?: boolean;
  error?: string;
}

// Connection between nodes
export interface Connection {
  id: ConnectionId;
  sourceNodeId: NodeId;
  sourcePortId: PortId;
  targetNodeId: NodeId;
  targetPortId: PortId;
  dataType: DataType;
}

// Node execution result
export interface ExecutionResult {
  nodeId: NodeId;
  outputs: Record<PortId, any>;
  error?: string;
}

// Node processor function type
export type NodeProcessor = (
  inputs: Record<PortId, any>,
  node: WorkflowNode
) => Promise<Record<PortId, any>>;

// Workflow graph class
export class WorkflowGraph extends EventEmitter {
  private nodes: Map<NodeId, WorkflowNode> = new Map();
  private connections: Map<ConnectionId, Connection> = new Map();
  private processors: Map<string, NodeProcessor> = new Map();
  private executionOrder: NodeId[] = [];

  // Add a node to the graph
  public addNode(node: WorkflowNode): void {
    this.nodes.set(node.id, node);
    this.updateExecutionOrder();
    this.emit('nodeAdded', node);
  }

  // Remove a node from the graph
  public removeNode(nodeId: NodeId): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      // Remove all connections to/from this node
      this.connections.forEach((conn, id) => {
        if (conn.sourceNodeId === nodeId || conn.targetNodeId === nodeId) {
          this.connections.delete(id);
        }
      });
      this.nodes.delete(nodeId);
      this.updateExecutionOrder();
      this.emit('nodeRemoved', node);
    }
  }

  // Add a connection between nodes
  public addConnection(connection: Connection): void {
    const sourceNode = this.nodes.get(connection.sourceNodeId);
    const targetNode = this.nodes.get(connection.targetNodeId);
    
    if (!sourceNode || !targetNode) {
      throw new Error('Source or target node not found');
    }

    // Validate port compatibility
    const sourcePort = sourceNode.outputs.find(p => p.id === connection.sourcePortId);
    const targetPort = targetNode.inputs.find(p => p.id === connection.targetPortId);

    if (!sourcePort || !targetPort) {
      throw new Error('Source or target port not found');
    }

    if (sourcePort.dataType !== targetPort.dataType) {
      throw new Error(`Data type mismatch: ${sourcePort.dataType} -> ${targetPort.dataType}`);
    }

    this.connections.set(connection.id, connection);
    this.updateExecutionOrder();
    this.emit('connectionAdded', connection);
  }

  // Remove a connection
  public removeConnection(connectionId: ConnectionId): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      this.connections.delete(connectionId);
      this.updateExecutionOrder();
      this.emit('connectionRemoved', connection);
    }
  }

  // Register a processor for a node type
  public registerProcessor(nodeType: string, processor: NodeProcessor): void {
    this.processors.set(nodeType, processor);
  }

  // Update node position
  public updateNodePosition(nodeId: NodeId, position: { x: number; y: number }): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.position = position;
      this.emit('nodeUpdated', node);
    }
  }

  // Get all input connections for a node
  public getInputConnections(nodeId: NodeId): Connection[] {
    return Array.from(this.connections.values())
      .filter(conn => conn.targetNodeId === nodeId);
  }

  // Get all output connections for a node
  public getOutputConnections(nodeId: NodeId): Connection[] {
    return Array.from(this.connections.values())
      .filter(conn => conn.sourceNodeId === nodeId);
  }

  // Update the execution order of nodes
  private updateExecutionOrder(): void {
    const visited = new Set<NodeId>();
    const order: NodeId[] = [];

    const visit = (nodeId: NodeId) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      // Visit all input nodes first
      this.getInputConnections(nodeId)
        .forEach(conn => visit(conn.sourceNodeId));

      order.push(nodeId);
    };

    // Visit all nodes
    this.nodes.forEach(node => visit(node.id));
    this.executionOrder = order;
  }

  private topologicalSort(): NodeId[] {
    const visited = new Set<NodeId>();
    const temp = new Set<NodeId>();
    const order: NodeId[] = [];

    const visit = (nodeId: NodeId) => {
      if (temp.has(nodeId)) {
        throw new Error('Cycle detected in workflow');
      }
      if (visited.has(nodeId)) {
        return;
      }

      temp.add(nodeId);

      // Find all nodes that depend on this node
      const outgoingConnections = Array.from(this.connections.values())
        .filter(conn => conn.sourceNodeId === nodeId);

      for (const conn of outgoingConnections) {
        visit(conn.targetNodeId);
      }

      temp.delete(nodeId);
      visited.add(nodeId);
      order.unshift(nodeId);
    };

    // Start with nodes that have no incoming connections
    const startNodes = Array.from(this.nodes.keys())
      .filter(nodeId => !Array.from(this.connections.values())
        .some(conn => conn.targetNodeId === nodeId));

    for (const nodeId of startNodes) {
      visit(nodeId);
    }

    // Make sure all nodes are visited
    const remainingNodes = Array.from(this.nodes.keys())
      .filter(nodeId => !visited.has(nodeId));

    for (const nodeId of remainingNodes) {
      visit(nodeId);
    }

    return order;
  }

  private async executeNode(nodeId: NodeId, results: Map<string, ExecutionResult>): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    try {
      const processor = this.processors.get(node.type);
      if (!processor) {
        throw new Error(`No processor registered for node type ${node.type}`);
      }

      // Get input values from connected nodes
      const inputs: Record<string, any> = {};
      for (const input of node.inputs) {
        const connection = Array.from(this.connections.values())
          .find(c => c.targetNodeId === nodeId && c.targetPortId === input.id);
        
        if (connection) {
          const sourceResult = results.get(connection.sourceNodeId);
          if (sourceResult && sourceResult.outputs) {
            inputs[input.id] = sourceResult.outputs[connection.sourcePortId];
          }
        }
      }

      // Execute the processor
      const outputs = await processor(inputs, node);
      results.set(nodeId, { nodeId, outputs, error: undefined });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      node.error = errorMessage;
      results.set(nodeId, { nodeId, outputs: {}, error: errorMessage });
    }
  }

  public async execute(): Promise<Map<string, ExecutionResult>> {
    const results = new Map<string, ExecutionResult>();
    const errors: string[] = [];

    try {
      const sortedNodes = this.topologicalSort();
      for (const nodeId of sortedNodes) {
        await this.executeNode(nodeId, results);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`Cycle detected in workflow: ${errorMessage}`);
    }

    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }

    return results;
  }

  // Validate the entire workflow
  public validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for required inputs
    this.nodes.forEach(node => {
      node.inputs
        .filter(input => input.required)
        .forEach(input => {
          const hasConnection = Array.from(this.connections.values())
            .some(conn => conn.targetNodeId === node.id && conn.targetPortId === input.id);
          
          if (!hasConnection && input.defaultValue === undefined) {
            errors.push(`Required input ${input.id} not connected for node ${node.id}`);
          }
        });
    });

    // Check for cycles
    try {
      this.updateExecutionOrder();
    } catch (error) {
      errors.push(`Cycle detected in workflow: ${error.message}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Serialize the workflow to JSON
  public toJSON(): string {
    return JSON.stringify({
      nodes: Array.from(this.nodes.values()),
      connections: Array.from(this.connections.values())
    });
  }

  // Load workflow from JSON
  public fromJSON(json: string): void {
    const data = JSON.parse(json);
    
    // Clear existing workflow
    this.nodes.clear();
    this.connections.clear();

    // Load nodes
    data.nodes.forEach((node: WorkflowNode) => {
      this.addNode(node);
    });

    // Load connections
    data.connections.forEach((connection: Connection) => {
      this.addConnection(connection);
    });
  }
} 