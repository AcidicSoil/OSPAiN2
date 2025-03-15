/**
 * Tests for the KnowledgeGraphIntegration component
 */

import { KnowledgeGraphIntegration, SemanticAnalysisResult } from '../visualization/KnowledgeGraphIntegration';
import { VisualizationNode, VisualizationLink } from '../visualization/RuleMatrixVisualizer';
import { RuleType, RuleFileInfo, RuleRelationship } from '../types';
import { KnowledgeGraph } from '../../knowledge/KnowledgeGraph';
import * as fs from 'fs';
import * as path from 'path';

// Mock KnowledgeGraph, fs and path
jest.mock('../../knowledge/KnowledgeGraph');
jest.mock('fs');
jest.mock('path');

describe('KnowledgeGraphIntegration', () => {
  let integration: KnowledgeGraphIntegration;
  let mockKnowledgeGraph: jest.Mocked<KnowledgeGraph>;
  let mockRules: RuleFileInfo[];
  let mockRelationships: RuleRelationship[];
  let mockNodes: VisualizationNode[];
  let mockLinks: VisualizationLink[];
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock KnowledgeGraph
    mockKnowledgeGraph = new KnowledgeGraph() as jest.Mocked<KnowledgeGraph>;
    
    // Create integration instance
    integration = new KnowledgeGraphIntegration(mockKnowledgeGraph);
    
    // Mock file system methods
    (fs.readFileSync as jest.Mock).mockImplementation((filePath) => {
      if (filePath === 'rules/rule1.md') {
        return '# Rule 1\n\nThis is a test rule with some content about system architecture.';
      } else if (filePath === 'rules/rule2.md') {
        return '# Rule 2\n\nThis rule is about code quality standards and testing practices.';
      } else if (filePath === 'rules/rule3.md') {
        return '# Rule 3\n\nThis rule also discusses architecture patterns similar to rule 1.';
      }
      return '';
    });
    
    (path.extname as jest.Mock).mockImplementation((filePath) => {
      return '.md';
    });
    
    (path.basename as jest.Mock).mockImplementation((filePath) => {
      return filePath.split('/').pop() || '';
    });
    
    // Setup test data
    mockRules = [
      {
        path: 'rules/rule1.md',
        currentType: RuleType.MANUAL,
        suggestedType: RuleType.MANUAL,
        purpose: 'Test rule 1',
        dependencies: [],
        usagePatterns: []
      },
      {
        path: 'rules/rule2.md',
        currentType: RuleType.AUTO_APPLIED,
        suggestedType: RuleType.AUTO_APPLIED,
        purpose: 'Test rule 2',
        dependencies: [],
        usagePatterns: []
      },
      {
        path: 'rules/rule3.md',
        currentType: RuleType.CONDITIONAL,
        suggestedType: RuleType.CONDITIONAL,
        purpose: 'Test rule 3',
        dependencies: [],
        usagePatterns: []
      }
    ];
    
    mockRelationships = [
      {
        sourceRule: 'rules/rule1.md',
        targetRule: 'rules/rule2.md',
        relationshipType: 'depends-on',
        strength: 0.8,
        description: 'Rule 2 depends on Rule 1'
      }
    ];
    
    mockNodes = [
      {
        id: 'rules/rule1.md',
        label: 'rule1.md',
        type: RuleType.MANUAL,
        group: 'manual',
        metrics: {
          dependencies: 1,
          dependents: 0,
          strength: 0.8
        }
      },
      {
        id: 'rules/rule2.md',
        label: 'rule2.md',
        type: RuleType.AUTO_APPLIED,
        group: 'auto_applied',
        metrics: {
          dependencies: 0,
          dependents: 1,
          strength: 0.8
        }
      },
      {
        id: 'rules/rule3.md',
        label: 'rule3.md',
        type: RuleType.CONDITIONAL,
        group: 'conditional',
        metrics: {
          dependencies: 0,
          dependents: 0,
          strength: 0
        }
      }
    ];
    
    mockLinks = [
      {
        source: 'rules/rule1.md',
        target: 'rules/rule2.md',
        type: 'depends-on',
        strength: 0.8
      }
    ];
  });

  describe('enhanceVisualization', () => {
    test('should add semantic information to nodes', async () => {
      await integration.enhanceVisualization(mockNodes, mockLinks, mockRules, mockRelationships);
      
      // Check that concepts were added to nodes
      expect(mockNodes[0].concepts).toBeDefined();
      expect(mockNodes[0].contentType).toBeDefined();
      expect(mockNodes[0].thematicGroups).toBeDefined();
      
      // Check that the content type is set correctly
      expect(mockNodes[0].contentType).toBe('markdown');
    });
    
    test('should add semantic connections between similar rules', async () => {
      const initialLinkCount = mockLinks.length;
      
      await integration.enhanceVisualization(mockNodes, mockLinks, mockRules, mockRelationships);
      
      // Check if new semantic links were added
      expect(mockLinks.length).toBeGreaterThan(initialLinkCount);
      
      // Check if at least one semantic link was added
      expect(mockLinks.some(link => link.semantic)).toBe(true);
    });
  });

  describe('semantic analysis', () => {
    test('should extract keywords from content', async () => {
      // We can't directly test private methods, so we'll test indirectly through the enhanceVisualization method
      await integration.enhanceVisualization(mockNodes, mockLinks, mockRules, mockRelationships);
      
      // Rules 1 and 3 both mention architecture, so they should have semantic similarity
      const semanticLinks = mockLinks.filter(link => link.semantic);
      const hasArchitectureLink = semanticLinks.some(link => 
        (link.source === 'rules/rule1.md' && link.target === 'rules/rule3.md') ||
        (link.source === 'rules/rule3.md' && link.target === 'rules/rule1.md')
      );
      
      expect(hasArchitectureLink).toBe(true);
    });
    
    test('should calculate relevance scores for rules', async () => {
      await integration.enhanceVisualization(mockNodes, mockLinks, mockRules, mockRelationships);
      
      // Check that all nodes have reasonable strength values
      mockNodes.forEach(node => {
        expect(node.metrics.strength).toBeGreaterThanOrEqual(0);
        expect(node.metrics.strength).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('content analysis', () => {
    test('should classify content types correctly', async () => {
      await integration.enhanceVisualization(mockNodes, mockLinks, mockRules, mockRelationships);
      
      // All test files are markdown
      mockNodes.forEach(node => {
        expect(node.contentType).toBe('markdown');
      });
    });
    
    test('should extract themes from headings', async () => {
      await integration.enhanceVisualization(mockNodes, mockLinks, mockRules, mockRelationships);
      
      // Check that themes were extracted from headings
      mockNodes.forEach(node => {
        expect(node.thematicGroups).toBeDefined();
        expect(node.thematicGroups!.length).toBeGreaterThan(0);
      });
      
      // Check that the first node's first theme is "Rule 1" (from the h1)
      expect(mockNodes[0].thematicGroups![0]).toBe('Rule 1');
    });
  });

  describe('createKnowledgeGraphNodes', () => {
    test('should analyze all rules and create knowledge graph nodes', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await integration.createKnowledgeGraphNodes(mockRules);
      
      // Should log success message
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(`Created nodes for ${mockRules.length} rules`));
      
      consoleSpy.mockRestore();
    });
  });
}); 