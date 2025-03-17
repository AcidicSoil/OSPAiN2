import { Box, Paper, Typography } from '@mui/material';
import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Edge,
    Connection as FlowConnection,
    Node,
    NodeTypes,
    addEdge,
    useEdgesState,
    useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Connection, Port, WorkflowGraph, WorkflowNode } from './WorkflowGraph';

// Custom node data type
interface NodeData {
  label: string;
  inputs: Port[];
  outputs: Port[];
  data?: Record<string, any>;
  isProcessing?: boolean;
  error?: string;
}

// Props for the WorkflowEditor component
interface WorkflowEditorProps {
  workflow: WorkflowGraph;
  onWorkflowChange?: (workflow: WorkflowGraph) => void;
  readOnly?: boolean;
  width?: number | string;
  height?: number | string;
}

// Convert WorkflowNode to ReactFlow node
const workflowToReactFlowNode = (workflowNode: WorkflowNode): Node<NodeData> => {
  return {
    id: workflowNode.id,
    type: 'customNode',
    position: workflowNode.position || { x: 0, y: 0 },
    data: {
      label: workflowNode.name,
      inputs: workflowNode.inputs,
      outputs: workflowNode.outputs,
      data: workflowNode.data,
      isProcessing: workflowNode.isProcessing,
      error: workflowNode.error,
    },
  };
};

// Convert Connection to ReactFlow edge
const connectionToReactFlowEdge = (connection: Connection): Edge => {
  return {
    id: connection.id,
    source: connection.sourceNodeId,
    sourceHandle: connection.sourcePortId,
    target: connection.targetNodeId,
    targetHandle: connection.targetPortId,
    type: 'smoothstep',
    data: { dataType: connection.dataType },
  };
};

// Custom node component
const CustomNode: React.FC<any> = ({ data }) => {
  const { label, inputs, outputs, isProcessing, error } = data;

  return (
    <Paper
      elevation={3}
      sx={{
        padding: 2,
        minWidth: 200,
        backgroundColor: error ? '#ffebee' : isProcessing ? '#e3f2fd' : '#fff',
        border: '1px solid',
        borderColor: error ? '#f44336' : isProcessing ? '#2196f3' : '#ccc',
      }}
    >
      <Typography variant="subtitle1" gutterBottom align="center">
        {label}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Input ports */}
        <Box>
          {inputs.map((input) => (
            <Box
              key={input.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Box
                className="react-flow__handle react-flow__handle-left"
                data-handleid={input.id}
                data-type="target"
                data-datatype={input.dataType}
                style={{
                  position: 'relative',
                  width: 10,
                  height: 10,
                  marginRight: 8,
                }}
              />
              <Typography variant="caption">{input.name}</Typography>
            </Box>
          ))}
        </Box>

        {/* Output ports */}
        <Box>
          {outputs.map((output) => (
            <Box
              key={output.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography variant="caption">{output.name}</Typography>
              <Box
                className="react-flow__handle react-flow__handle-right"
                data-handleid={output.id}
                data-type="source"
                data-datatype={output.dataType}
                style={{
                  position: 'relative',
                  width: 10,
                  height: 10,
                  marginLeft: 8,
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Paper>
  );
};

// Node types configuration
const nodeTypes: NodeTypes = {
  customNode: CustomNode,
};

// Main WorkflowEditor component
export const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
  workflow,
  onWorkflowChange,
  readOnly = false,
  width = '100%',
  height = '600px',
}) => {
  // ReactFlow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Sync workflow with ReactFlow state
  useEffect(() => {
    const workflowNodes = Array.from(workflow['nodes'].values()).map(workflowToReactFlowNode);
    const workflowEdges = Array.from(workflow['connections'].values()).map(connectionToReactFlowEdge);

    setNodes(workflowNodes);
    setEdges(workflowEdges);
  }, [workflow]);

  // Handle node position changes
  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      workflow.updateNodePosition(node.id, node.position);
      onWorkflowChange?.(workflow);
    },
    [workflow, onWorkflowChange]
  );

  // Handle new connections
  const onConnect = useCallback(
    (connection: FlowConnection) => {
      // Validate connection data types
      const sourceNode = workflow['nodes'].get(connection.source!);
      const targetNode = workflow['nodes'].get(connection.target!);

      if (!sourceNode || !targetNode) return;

      const sourcePort = sourceNode.outputs.find((p) => p.id === connection.sourceHandle);
      const targetPort = targetNode.inputs.find((p) => p.id === connection.targetHandle);

      if (!sourcePort || !targetPort) return;

      if (sourcePort.dataType !== targetPort.dataType) {
        console.error(`Data type mismatch: ${sourcePort.dataType} -> ${targetPort.dataType}`);
        return;
      }

      // Create new connection
      const newConnection: Connection = {
        id: `${connection.source}-${connection.sourceHandle}-${connection.target}-${connection.targetHandle}`,
        sourceNodeId: connection.source!,
        sourcePortId: connection.sourceHandle!,
        targetNodeId: connection.target!,
        targetPortId: connection.targetHandle!,
        dataType: sourcePort.dataType,
      };

      workflow.addConnection(newConnection);
      onWorkflowChange?.(workflow);

      // Update ReactFlow edges
      setEdges((eds) => addEdge(connection, eds));
    },
    [workflow, onWorkflowChange, setEdges]
  );

  return (
    <Box sx={{ width, height }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </Box>
  );
}; 