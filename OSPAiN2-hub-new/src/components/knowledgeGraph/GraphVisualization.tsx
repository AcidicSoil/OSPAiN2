import React, { useCallback, useRef, useState, useEffect } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { Entity, Relationship, Concept, Document } from '../../services/knowledgeGraph';

// Graph data structure
interface GraphData {
  nodes: NodeObject[];
  links: LinkObject[];
}

// Node object with position
interface NodeObject {
  id: string;
  label: string;
  type: string;
  color: string;
  entity: Entity;
  x?: number;
  y?: number;
}

// Link object
interface LinkObject {
  id: string;
  source: string;
  target: string;
  type: string;
  relationship: Relationship;
}

// Props for the graph component
interface GraphVisualizationProps {
  entities: Entity[];
  relationships: Relationship[];
  width?: number;
  height?: number;
  onNodeClick?: (entity: Entity) => void;
  highlightedNodeIds?: string[];
}

/**
 * GraphVisualization component for knowledge graph visualization
 */
const GraphVisualization: React.FC<GraphVisualizationProps> = ({ 
  entities, 
  relationships,
  width = 800,
  height = 600,
  onNodeClick,
  highlightedNodeIds = []
}) => {
  // Refs
  const graphRef = useRef<ForceGraphMethods>();
  
  // State
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  
  // Colors for different node types
  const nodeColors = {
    document: '#4285F4', // Google Blue
    concept: '#34A853', // Google Green
    person: '#EA4335', // Google Red
    organization: '#FBBC05', // Google Yellow
    location: '#8334A2', // Purple
    default: '#999999'  // Grey
  };
  
  // Generate graph data from entities and relationships
  useEffect(() => {
    if (!entities || !relationships) return;
    
    const nodes: NodeObject[] = entities.map(entity => {
      // Get the appropriate color based on entity type
      const entityType = entity.type.toLowerCase();
      const color = entityType in nodeColors 
        ? nodeColors[entityType as keyof typeof nodeColors] 
        : nodeColors.default;
      
      // Create readable label
      let label = '';
      if (entity.type === 'concept' && (entity as Concept).name) {
        label = (entity as Concept).name;
      } else if (entity.type === 'document' && (entity as Document).source) {
        const doc = entity as Document;
        label = doc.source ? 
          `${doc.source.substring(0, 15)}${doc.source.length > 15 ? '...' : ''}` : 
          'Document';
      } else {
        label = entity.id.substring(0, 15);
      }
      
      return {
        id: entity.id,
        label,
        type: entity.type,
        color,
        entity
      };
    });
    
    const links: LinkObject[] = relationships.map(rel => ({
      id: rel.id,
      source: rel.source,
      target: rel.target,
      type: rel.type,
      relationship: rel
    }));
    
    setGraphData({ nodes, links });
  }, [entities, relationships]);
  
  // Handle node click
  const handleNodeClick = useCallback((node: NodeObject) => {
    if (onNodeClick) {
      onNodeClick(node.entity);
    }
  }, [onNodeClick]);
  
  // Customize node appearance
  const paintNode = useCallback((
    node: NodeObject, 
    ctx: CanvasRenderingContext2D, 
    globalScale: number
  ) => {
    const { id, x = 0, y = 0, color, label } = node;
    
    // Node size based on type (documents larger than concepts)
    const size = node.type === 'document' ? 6 : 4;
    
    // Determine if node is highlighted
    const isHighlighted = highlightedNodeIds.includes(id);
    const isHovered = hoveredNode === id;
    
    // Draw node circle
    ctx.beginPath();
    ctx.arc(x, y, size * (isHighlighted ? 1.5 : 1), 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Draw border for highlighted or hovered nodes
    if (isHighlighted || isHovered) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    
    // Draw label if zoomed in enough or node is highlighted/hovered
    if (globalScale > 0.8 || isHighlighted || isHovered) {
      ctx.font = `${isHighlighted ? 'bold ' : ''}${Math.max(8, 10 / globalScale)}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      
      // Draw text background for better readability
      const textWidth = ctx.measureText(label).width;
      ctx.fillRect(
        x - textWidth / 2 - 2,
        y + size + 2,
        textWidth + 4,
        Math.max(12, 14 / globalScale)
      );
      
      // Draw text
      ctx.fillStyle = '#000000';
      ctx.fillText(label, x, y + size + 2 + Math.max(6, 7 / globalScale));
    }
  }, [highlightedNodeIds, hoveredNode]);
  
  // Customize link appearance
  const paintLink = useCallback((
    link: LinkObject,
    ctx: CanvasRenderingContext2D,
    globalScale: number
  ) => {
    const source = typeof link.source === 'object' ? link.source : { x: 0, y: 0 };
    const target = typeof link.target === 'object' ? link.target : { x: 0, y: 0 };
    
    // Get positions (with type assertions)
    const sourceX = (source as { x?: number }).x || 0;
    const sourceY = (source as { y?: number }).y || 0;
    const targetX = (target as { x?: number }).x || 0;
    const targetY = (target as { y?: number }).y || 0;
    
    // Draw link
    ctx.beginPath();
    ctx.moveTo(sourceX, sourceY);
    ctx.lineTo(targetX, targetY);
    ctx.strokeStyle = link.type === 'MENTIONS' ? 'rgba(100, 100, 100, 0.5)' : 'rgba(150, 150, 150, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw link label if zoomed in enough
    if (globalScale > 1.2) {
      const midX = (sourceX + targetX) / 2;
      const midY = (sourceY + targetY) / 2;
      
      ctx.font = `${Math.max(6, 8 / globalScale)}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(240, 240, 240, 0.8)';
      
      // Draw background for the text
      const textWidth = ctx.measureText(link.type).width;
      ctx.fillRect(
        midX - textWidth / 2 - 2,
        midY - Math.max(6, 7 / globalScale),
        textWidth + 4,
        Math.max(12, 14 / globalScale)
      );
      
      // Draw text
      ctx.fillStyle = '#000000';
      ctx.fillText(link.type, midX, midY);
    }
  }, []);
  
  return (
    <div 
      style={{ 
        width: width, 
        height: height, 
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeId="id"
        linkSource="source"
        linkTarget="target"
        nodeLabel="label"
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={0.9}
        nodeCanvasObject={paintNode}
        linkCanvasObject={paintLink}
        onNodeClick={handleNodeClick}
        onNodeHover={(node) => setHoveredNode(node ? node.id : null)}
        cooldownTicks={100}
        linkWidth={1}
        nodeRelSize={6}
        width={width}
        height={height}
      />
    </div>
  );
};

export default GraphVisualization; 