"use strict";
/**
 * Tests for the KnowledgeGraphIntegration component
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const KnowledgeGraphIntegration_1 = require("../visualization/KnowledgeGraphIntegration");
const types_1 = require("../types");
const KnowledgeGraph_1 = require("../../knowledge/KnowledgeGraph");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Mock KnowledgeGraph, fs and path
jest.mock('../../knowledge/KnowledgeGraph');
jest.mock('fs');
jest.mock('path');
describe('KnowledgeGraphIntegration', () => {
    let integration;
    let mockKnowledgeGraph;
    let mockRules;
    let mockRelationships;
    let mockNodes;
    let mockLinks;
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        // Setup mock KnowledgeGraph
        mockKnowledgeGraph = new KnowledgeGraph_1.KnowledgeGraph();
        // Create integration instance
        integration = new KnowledgeGraphIntegration_1.KnowledgeGraphIntegration(mockKnowledgeGraph);
        // Mock file system methods
        fs.readFileSync.mockImplementation((filePath) => {
            if (filePath === 'rules/rule1.md') {
                return '# Rule 1\n\nThis is a test rule with some content about system architecture.';
            }
            else if (filePath === 'rules/rule2.md') {
                return '# Rule 2\n\nThis rule is about code quality standards and testing practices.';
            }
            else if (filePath === 'rules/rule3.md') {
                return '# Rule 3\n\nThis rule also discusses architecture patterns similar to rule 1.';
            }
            return '';
        });
        path.extname.mockImplementation((filePath) => {
            return '.md';
        });
        path.basename.mockImplementation((filePath) => {
            return filePath.split('/').pop() || '';
        });
        // Setup test data
        mockRules = [
            {
                path: 'rules/rule1.md',
                currentType: types_1.RuleType.MANUAL,
                suggestedType: types_1.RuleType.MANUAL,
                purpose: 'Test rule 1',
                dependencies: [],
                usagePatterns: []
            },
            {
                path: 'rules/rule2.md',
                currentType: types_1.RuleType.AUTO_APPLIED,
                suggestedType: types_1.RuleType.AUTO_APPLIED,
                purpose: 'Test rule 2',
                dependencies: [],
                usagePatterns: []
            },
            {
                path: 'rules/rule3.md',
                currentType: types_1.RuleType.CONDITIONAL,
                suggestedType: types_1.RuleType.CONDITIONAL,
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
                type: types_1.RuleType.MANUAL,
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
                type: types_1.RuleType.AUTO_APPLIED,
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
                type: types_1.RuleType.CONDITIONAL,
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
            const hasArchitectureLink = semanticLinks.some(link => (link.source === 'rules/rule1.md' && link.target === 'rules/rule3.md') ||
                (link.source === 'rules/rule3.md' && link.target === 'rules/rule1.md'));
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
                expect(node.thematicGroups.length).toBeGreaterThan(0);
            });
            // Check that the first node's first theme is "Rule 1" (from the h1)
            expect(mockNodes[0].thematicGroups[0]).toBe('Rule 1');
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
//# sourceMappingURL=KnowledgeGraphIntegration.test.js.map