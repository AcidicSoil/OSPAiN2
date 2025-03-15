/**
 * Knowledge Graph Integration for Rule Matrix
 * 
 * Provides integration between the Rule Matrix Visualization and
 * the Knowledge Graph system with advanced semantic analysis.
 */

import { KnowledgeGraph } from '../../knowledge/KnowledgeGraph';
import { RuleFileInfo, RuleRelationship } from '../types';
import { VisualizationNode, VisualizationLink } from './RuleMatrixVisualizer';
import { NLPProcessor, NLPResult, NLPOptions } from './NLPProcessor';
import * as fs from 'fs';
import * as path from 'path';

// Semantic Analysis Interface
export interface SemanticAnalysisResult {
  /** Extracted concepts from text */
  concepts: string[];
  /** Relevance score (0-1) */
  relevance: number;
  /** Key themes identified in the content */
  themes: string[];
  /** Detected content type classification */
  contentType: string;
  /** Semantic vector representation */
  embedding?: number[];
  /** Key phrases extracted from the content */
  keyPhrases?: string[];
  /** Named entities found in the content */
  entities?: Array<{
    text: string;
    type: string;
    startIndex: number;
    length: number;
  }>;
  /** Sentiment analysis */
  sentiment?: {
    score: number;
    label: 'positive' | 'neutral' | 'negative';
  };
}

export interface KnowledgeGraphEnhancement {
  /** Semantic connections between rules */
  semanticConnections: Array<{
    source: string;
    target: string;
    strength: number;
    relationship: string;
  }>;
  /** Concepts associated with each node */
  nodeConcepts: Map<string, string[]>;
  /** Relevance scores for nodes */
  relevanceScores: Map<string, number>;
  /** Content type classification for each rule */
  contentTypes: Map<string, string>;
  /** Thematic groups for rules */
  thematicGroups: Map<string, string[]>;
}

export class KnowledgeGraphIntegration {
  private knowledgeGraph: KnowledgeGraph;
  private contentCache: Map<string, string> = new Map();
  private analysisCache: Map<string, SemanticAnalysisResult> = new Map();
  private similarityCache: Map<string, Map<string, number>> = new Map();
  private nlpProcessor: NLPProcessor;
  
  constructor(knowledgeGraph: KnowledgeGraph) {
    this.knowledgeGraph = knowledgeGraph;
    this.nlpProcessor = new NLPProcessor();
  }
  
  /**
   * Enhance visualization data with knowledge graph information
   */
  public async enhanceVisualization(
    nodes: VisualizationNode[],
    links: VisualizationLink[],
    rules: RuleFileInfo[],
    relationships: RuleRelationship[]
  ): Promise<void> {
    // First, analyze rule content and update the knowledge graph
    await this.analyzeRuleContent(rules);
    
    // Generate enhancement data based on knowledge graph analysis
    const enhancement = await this.generateEnhancement(rules, relationships);
    
    // Add semantic connections as additional links
    enhancement.semanticConnections.forEach(connection => {
      // Check if this connection already exists
      const existingLink = links.find(link => 
        (typeof link.source === 'string' ? link.source : link.source.id) === connection.source && 
        (typeof link.target === 'string' ? link.target : link.target.id) === connection.target
      );
      
      if (existingLink) {
        // Enhance existing link with semantic strength
        existingLink.strength = Math.max(existingLink.strength, connection.strength);
      } else {
        // Add new semantic link
        links.push({
          source: connection.source,
          target: connection.target,
          type: connection.relationship,
          strength: connection.strength
        });
      }
    });
    
    // Enhance nodes with relevance scores and concept information
    nodes.forEach(node => {
      const relevance = enhancement.relevanceScores.get(node.id);
      if (relevance !== undefined) {
        // Add relevance to node metrics
        node.metrics.strength = Math.max(node.metrics.strength, relevance);
      }
      
      // Add concept tags
      const concepts = enhancement.nodeConcepts.get(node.id);
      if (concepts && concepts.length > 0) {
        (node as any).concepts = concepts;
      }
      
      // Add content type classification
      const contentType = enhancement.contentTypes.get(node.id);
      if (contentType) {
        (node as any).contentType = contentType;
      }
      
      // Add thematic group information
      const thematicGroups = enhancement.thematicGroups.get(node.id);
      if (thematicGroups && thematicGroups.length > 0) {
        (node as any).thematicGroups = thematicGroups;
      }
    });
  }
  
  /**
   * Analyze rule content and update the knowledge graph
   */
  private async analyzeRuleContent(rules: RuleFileInfo[]): Promise<void> {
    for (const rule of rules) {
      // Skip if already analyzed and cached
      if (this.analysisCache.has(rule.path)) {
        continue;
      }
      
      // Get rule content
      const content = await this.getRuleContent(rule);
      if (!content) continue;
      
      // Perform semantic analysis
      const analysis = await this.performSemanticAnalysis(content, rule);
      
      // Cache the analysis result
      this.analysisCache.set(rule.path, analysis);
      
      // Create or update knowledge graph node for this rule
      await this.updateKnowledgeGraphNode(rule, analysis);
    }
  }
  
  /**
   * Get the content of a rule file
   */
  private async getRuleContent(rule: RuleFileInfo): Promise<string | null> {
    // Check cache first
    if (this.contentCache.has(rule.path)) {
      return this.contentCache.get(rule.path) || null;
    }
    
    try {
      // Read file content
      const content = fs.readFileSync(rule.path, 'utf-8');
      this.contentCache.set(rule.path, content);
      return content;
    } catch (error) {
      console.error(`Error reading rule content for ${rule.path}:`, error);
      return null;
    }
  }
  
  /**
   * Performs semantic analysis on rule content
   * @param content The content to analyze
   * @param rule The rule file information
   * @returns Semantic analysis result
   */
  private async performSemanticAnalysis(
    content: string, 
    rule: RuleFileInfo
  ): Promise<SemanticAnalysisResult> {
    // Use NLP processor for advanced text analysis
    const nlpOptions: NLPOptions = {
      extractKeywords: true,
      extractKeyPhrases: true,
      detectThemes: true,
      classifyContent: true,
      analyzeSentiment: true,
      extractEntities: true,
      generateEmbedding: true
    };
    
    const nlpResult = this.nlpProcessor.analyze(content, rule, nlpOptions);
    
    // Map NLP result to SemanticAnalysisResult
    return {
      concepts: nlpResult.keywords,
      relevance: nlpResult.relevanceScore,
      themes: nlpResult.themes,
      contentType: nlpResult.classification,
      embedding: nlpResult.embedding,
      keyPhrases: nlpResult.keyPhrases,
      entities: nlpResult.entities,
      sentiment: nlpResult.sentiment
    };
  }
  
  /**
   * Update the knowledge graph with rule analysis
   */
  private async updateKnowledgeGraphNode(
    rule: RuleFileInfo,
    analysis: SemanticAnalysisResult
  ): Promise<void> {
    // In a real implementation, this would create or update
    // nodes in the knowledge graph system
    
    // For now, we'll log the operation
    console.log(`[KnowledgeGraph] Updating node for ${rule.path}`);
    console.log(`  - Type: ${rule.currentType}`);
    console.log(`  - Concepts: ${analysis.concepts.join(', ')}`);
    console.log(`  - Themes: ${analysis.themes.join(', ')}`);
    console.log(`  - Content Type: ${analysis.contentType}`);
    console.log(`  - Relevance: ${analysis.relevance.toFixed(2)}`);
  }
  
  /**
   * Generate enhancement data from knowledge graph
   */
  private async generateEnhancement(
    rules: RuleFileInfo[],
    relationships: RuleRelationship[]
  ): Promise<KnowledgeGraphEnhancement> {
    const semanticConnections: Array<{
      source: string;
      target: string;
      strength: number;
      relationship: string;
    }> = [];
    
    const nodeConcepts = new Map<string, string[]>();
    const relevanceScores = new Map<string, number>();
    const contentTypes = new Map<string, string>();
    const thematicGroups = new Map<string, string[]>();
    
    // Process each rule to extract semantic relationships
    for (const rule of rules) {
      const analysis = this.analysisCache.get(rule.path);
      if (!analysis) continue;
      
      // Add concepts and scores from analysis
      nodeConcepts.set(rule.path, analysis.concepts);
      relevanceScores.set(rule.path, analysis.relevance);
      contentTypes.set(rule.path, analysis.contentType);
      thematicGroups.set(rule.path, analysis.themes);
      
      // Calculate semantic similarity with other rules
      for (const otherRule of rules) {
        if (rule.path === otherRule.path) continue;
        
        // Check if there's already an explicit relationship
        const hasExplicitRelation = relationships.some(
          rel => (rel.sourceRule === rule.path && rel.targetRule === otherRule.path) ||
                 (rel.sourceRule === otherRule.path && rel.targetRule === rule.path)
        );
        
        if (!hasExplicitRelation) {
          // Calculate semantic similarity
          const similarity = this.calculateSemanticSimilarity(rule.path, otherRule.path);
          
          // Add connection if similarity is above threshold
          if (similarity > 0.5) {
            semanticConnections.push({
              source: rule.path,
              target: otherRule.path,
              strength: similarity,
              relationship: 'semantic-similarity'
            });
          }
        }
      }
    }
    
    return {
      semanticConnections,
      nodeConcepts,
      relevanceScores,
      contentTypes,
      thematicGroups
    };
  }
  
  /**
   * Calculate semantic similarity between two rules
   * @param sourceRule Source rule path
   * @param targetRule Target rule path
   * @returns Similarity score (0-1)
   */
  private calculateSemanticSimilarity(
    sourceRule: string,
    targetRule: string
  ): number {
    // Check cache first
    if (
      this.similarityCache.has(sourceRule) &&
      this.similarityCache.get(sourceRule)!.has(targetRule)
    ) {
      return this.similarityCache.get(sourceRule)!.get(targetRule)!;
    }
    
    // Get rule content
    const sourceContent = this.contentCache.get(sourceRule);
    const targetContent = this.contentCache.get(targetRule);
    
    if (!sourceContent || !targetContent) {
      return 0;
    }
    
    // Use NLP processor to calculate similarity
    const similarity = this.nlpProcessor.calculateSimilarity(sourceContent, targetContent);
    
    // Cache the result
    if (!this.similarityCache.has(sourceRule)) {
      this.similarityCache.set(sourceRule, new Map());
    }
    this.similarityCache.get(sourceRule)!.set(targetRule, similarity);
    
    // For symmetry, also cache the reverse direction
    if (!this.similarityCache.has(targetRule)) {
      this.similarityCache.set(targetRule, new Map());
    }
    this.similarityCache.get(targetRule)!.set(sourceRule, similarity);
    
    return similarity;
  }
  
  /**
   * Create knowledge graph nodes from rules
   */
  public async createKnowledgeGraphNodes(rules: RuleFileInfo[]): Promise<void> {
    // Analyze rule content
    await this.analyzeRuleContent(rules);
    
    console.log(`[KnowledgeGraph] Created nodes for ${rules.length} rules`);
  }
} 