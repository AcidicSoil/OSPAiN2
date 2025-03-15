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
    x?: number;
    y?: number;
  }[];
  links: {
    source: string;
    target: string;
    type: string;
    relationship: Relationship;
  }[];
}

// ... existing code ... 