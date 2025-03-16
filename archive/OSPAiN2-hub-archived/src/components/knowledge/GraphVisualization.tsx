import React, { useRef, useEffect } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import { Entity, Relationship } from '../../services/KnowledgeGraphService';

interface GraphData {
  nodes: {
    id: string;
    name: string;
    val: number;
    color?: string;
    type?: string;
    entity: Entity;
  }[];
  links: {
    id: string;
    source: string;
    target: string;
    type: string;
    color?: string;
  }[];
}

interface GraphVisualizationProps {
  entities: Entity[];
  relationships: Relationship[];
  width?: number;
  height?: number;
  selectedNodeId?: string;
  highlightedNodeIds?: string[];
  onNodeClick?: (entity: Entity) => void;
  onNodeHover?: (entity: Entity | null) => void;
}

/**
 * Graph visualization component using react-force-graph
 */
const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  entities,
  relationships,
  width = 800,
  height = 600,
  selectedNodeId,
  highlightedNodeIds = [],
  onNodeClick,
  onNodeHover
}) => {
  const graphRef = useRef<any>(null);
  
  // Convert entities and relationships to graph data
  const graphData: GraphData = {
    nodes: entities.map(entity => ({
      id: entity.id,
      name: entity.name,
      val: getNodeSize(entity),
      color: getNodeColor(entity.type, entity.id === selectedNodeId, highlightedNodeIds.includes(entity.id)),
      type: entity.type,
      entity
    })),
    links: relationships.map(rel => ({
      id: rel.id,
      source: rel.source,
      target: rel.target,
      type: rel.type,
      color: getLinkColor(rel.type)
    }))
  };
  
  // Zoom to selected node if any
  useEffect(() => {
    if (selectedNodeId && graphRef.current) {
      const node = graphData.nodes.find(n => n.id === selectedNodeId);
      if (node) {
        graphRef.current.centerAt(node.x, node.y, 1000);
        graphRef.current.zoom(2.5, 1000);
      }
    }
  }, [selectedNodeId, graphData.nodes]);
  
  return (
    <ForceGraph2D
      ref={graphRef}
      graphData={graphData}
      width={width}
      height={height}
      nodeLabel={node => `${node.name} (${node.type})`}
      linkLabel={link => link.type}
      nodeRelSize={6}
      nodeVal={node => node.val}
      nodeColor={node => node.color}
      linkColor={link => link.color}
      onNodeClick={node => onNodeClick && onNodeClick(node.entity)}
      onNodeHover={node => onNodeHover && onNodeHover(node ? node.entity : null)}
      linkDirectionalParticles={2}
      linkDirectionalParticleWidth={2}
      nodeCanvasObjectMode={() => 'after'}
      nodeCanvasObject={(node, ctx, globalScale) => {
        const label = node.name;
        const fontSize = 12/globalScale;
        ctx.font = `${fontSize}px Sans-Serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // Background for text
        const textWidth = ctx.measureText(label).width;
        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.5);
        ctx.fillRect(
          node.x - bckgDimensions[0] / 2,
          node.y - bckgDimensions[1] / 2,
          bckgDimensions[0],
          bckgDimensions[1]
        );
        
        // Text
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillText(label, node.x, node.y);
      }}
    />
  );
};

// Helper function to determine node size based on entity type or properties
function getNodeSize(entity: Entity): number {
  switch (entity.type) {
    case 'document':
      return 2;
    case 'concept':
      return 3;
    default:
      return 1;
  }
}

// Helper function to determine node color based on type and selection state
function getNodeColor(type: string, isSelected: boolean, isHighlighted: boolean): string {
  if (isSelected) {
    return '#ff5500';
  }
  
  if (isHighlighted) {
    return '#ff9900';
  }
  
  switch (type) {
    case 'document':
      return '#3366cc';
    case 'concept':
      return '#33cc33';
    case 'user':
      return '#cc3366';
    case 'tool':
      return '#cc9933';
    default:
      return '#999999';
  }
}

// Helper function to determine link color based on type
function getLinkColor(type: string): string {
  switch (type) {
    case 'REFERENCES':
      return '#6699cc';
    case 'RELATED_TO':
      return '#99cc66';
    case 'CREATED_BY':
      return '#cc6699';
    case 'USES':
      return '#cc9966';
    default:
      return '#cccccc';
  }
}

export default GraphVisualization; 