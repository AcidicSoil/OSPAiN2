import { RuleType } from '../types';

export interface VisualizationNode {
  id: string;
  label: string;
  type: RuleType;
  group: string;
  metrics: {
    dependencies: number;
    dependents: number;
    strength: number;
  };
  concepts?: string[];
  contentType?: string;
  thematicGroups?: string[];
  keyPhrases?: string[];
  sentimentScore?: number;
  relevanceScore?: number;
  entities?: Array<{
    text: string;
    type: string;
  }>;
}

export interface VisualizationLink {
  source: string;
  target: string;
  type: string;
  strength: number;
  semantic?: boolean;
}

export interface VisualizationData {
  nodes: VisualizationNode[];
  links: VisualizationLink[];
}

export interface VisualizationOptions {
  includeTypes?: RuleType[];
  excludeTypes?: RuleType[];
  groupBy?: 'type' | 'directory' | 'purpose' | 'contentType' | 'thematic' | 'sentiment';
  minRelationshipStrength?: number;
  showOrphanedNodes?: boolean;
  highlightRules?: string[];
  showSemanticConnections?: boolean;
  minSemanticSimilarity?: number;
  includeSentimentAnalysis?: boolean;
  includeKeyPhrases?: boolean;
  includeEntities?: boolean;
  filterByTheme?: string[];
  filterByContentType?: string[];
}
