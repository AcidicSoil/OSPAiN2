/**
 * Tests for the RuleMatrixVisualizer
 */

import { RuleMatrixVisualizer } from '../visualization/RuleMatrixVisualizer';
import { RuleType, RuleFileInfo, RuleRelationship } from '../types';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs and path modules
jest.mock('fs');
jest.mock('path');

describe('RuleMatrixVisualizer', () => {
  let visualizer: RuleMatrixVisualizer;
  let mockRules: RuleFileInfo[];
  let mockRelationships: RuleRelationship[];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create visualizer instance
    visualizer = new RuleMatrixVisualizer();
    
    // Set up mock data
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
        dependencies: ['rules/rule1.md'],
        usagePatterns: []
      },
      {
        path: 'rules/rule3.md',
        currentType: RuleType.CONDITIONAL,
        suggestedType: RuleType.CONDITIONAL,
        purpose: 'Test rule 3',
        dependencies: ['rules/rule2.md'],
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
      },
      {
        sourceRule: 'rules/rule2.md',
        targetRule: 'rules/rule3.md',
        relationshipType: 'extends',
        strength: 0.6,
        description: 'Rule 3 extends Rule 2'
      }
    ];
    
    // Mock fs and path functions
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.mkdirSync as jest.Mock).mockImplementation(() => {});
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
    (path.dirname as jest.Mock).mockImplementation(p => p.split('/').slice(0, -1).join('/'));
    (path.basename as jest.Mock).mockImplementation(p => p.split('/').pop());
  });

  describe('generateVisualizationData', () => {
    test('should generate correct data structure', async () => {
      const result = await visualizer.generateVisualizationData(mockRules, mockRelationships);
      
      // Verify nodes
      expect(result.nodes).toHaveLength(3);
      expect(result.nodes[0].id).toBe('rules/rule1.md');
      expect(result.nodes[0].type).toBe(RuleType.MANUAL);
      expect(result.nodes[0].metrics.dependencies).toBe(1);
      expect(result.nodes[0].metrics.dependents).toBe(0);
      
      // Verify links
      expect(result.links).toHaveLength(2);
      expect(result.links[0].source).toBe('rules/rule1.md');
      expect(result.links[0].target).toBe('rules/rule2.md');
      expect(result.links[0].strength).toBe(0.8);
    });
    
    test('should filter rules by type', async () => {
      const options = {
        includeTypes: [RuleType.MANUAL, RuleType.AUTO_APPLIED]
      };
      
      const result = await visualizer.generateVisualizationData(mockRules, mockRelationships, options);
      
      expect(result.nodes).toHaveLength(2);
      expect(result.nodes.some(n => n.type === RuleType.CONDITIONAL)).toBe(false);
      expect(result.links).toHaveLength(1);
    });
    
    test('should filter relationships by strength', async () => {
      const options = {
        minRelationshipStrength: 0.7
      };
      
      const result = await visualizer.generateVisualizationData(mockRules, mockRelationships, options);
      
      expect(result.links).toHaveLength(1);
      expect(result.links[0].strength).toBe(0.8);
    });
  });

  describe('generateHtmlVisualization', () => {
    test('should generate HTML file', async () => {
      const outputPath = 'test/visualization.html';
      
      await visualizer.generateHtmlVisualization(mockRules, mockRelationships, outputPath);
      
      expect(fs.existsSync).toHaveBeenCalledWith('test');
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        outputPath,
        expect.stringContaining('<!DOCTYPE html>')
      );
    });
    
    test('should include data in HTML template', async () => {
      const outputPath = 'test/visualization.html';
      
      await visualizer.generateHtmlVisualization(mockRules, mockRelationships, outputPath);
      
      const writeCall = (fs.writeFileSync as jest.Mock).mock.calls[0];
      const htmlContent = writeCall[1];
      
      expect(htmlContent).toContain('Rule Matrix Visualization');
      expect(htmlContent).toContain('const data =');
      expect(htmlContent).toContain('nodes');
      expect(htmlContent).toContain('links');
    });
  });

  describe('generateJsonData', () => {
    test('should generate JSON file', async () => {
      const outputPath = 'test/visualization.json';
      
      await visualizer.generateJsonData(mockRules, mockRelationships, outputPath);
      
      expect(fs.existsSync).toHaveBeenCalledWith('test');
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        outputPath,
        expect.any(String)
      );
      
      // Verify JSON content
      const writeCall = (fs.writeFileSync as jest.Mock).mock.calls[0];
      const jsonContent = writeCall[1];
      const data = JSON.parse(jsonContent);
      
      expect(data).toHaveProperty('nodes');
      expect(data).toHaveProperty('links');
      expect(data.nodes).toHaveLength(3);
      expect(data.links).toHaveLength(2);
    });
  });
}); 