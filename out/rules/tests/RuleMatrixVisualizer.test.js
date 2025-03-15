"use strict";
/**
 * Tests for the RuleMatrixVisualizer
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
const RuleMatrixVisualizer_1 = require("../visualization/RuleMatrixVisualizer");
const types_1 = require("../types");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Mock fs and path modules
jest.mock('fs');
jest.mock('path');
describe('RuleMatrixVisualizer', () => {
    let visualizer;
    let mockRules;
    let mockRelationships;
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        // Create visualizer instance
        visualizer = new RuleMatrixVisualizer_1.RuleMatrixVisualizer();
        // Set up mock data
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
                dependencies: ['rules/rule1.md'],
                usagePatterns: []
            },
            {
                path: 'rules/rule3.md',
                currentType: types_1.RuleType.CONDITIONAL,
                suggestedType: types_1.RuleType.CONDITIONAL,
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
        fs.existsSync.mockReturnValue(true);
        fs.mkdirSync.mockImplementation(() => { });
        fs.writeFileSync.mockImplementation(() => { });
        path.dirname.mockImplementation(p => p.split('/').slice(0, -1).join('/'));
        path.basename.mockImplementation(p => p.split('/').pop());
    });
    describe('generateVisualizationData', () => {
        test('should generate correct data structure', async () => {
            const result = await visualizer.generateVisualizationData(mockRules, mockRelationships);
            // Verify nodes
            expect(result.nodes).toHaveLength(3);
            expect(result.nodes[0].id).toBe('rules/rule1.md');
            expect(result.nodes[0].type).toBe(types_1.RuleType.MANUAL);
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
                includeTypes: [types_1.RuleType.MANUAL, types_1.RuleType.AUTO_APPLIED]
            };
            const result = await visualizer.generateVisualizationData(mockRules, mockRelationships, options);
            expect(result.nodes).toHaveLength(2);
            expect(result.nodes.some(n => n.type === types_1.RuleType.CONDITIONAL)).toBe(false);
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
            expect(fs.writeFileSync).toHaveBeenCalledWith(outputPath, expect.stringContaining('<!DOCTYPE html>'));
        });
        test('should include data in HTML template', async () => {
            const outputPath = 'test/visualization.html';
            await visualizer.generateHtmlVisualization(mockRules, mockRelationships, outputPath);
            const writeCall = fs.writeFileSync.mock.calls[0];
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
            expect(fs.writeFileSync).toHaveBeenCalledWith(outputPath, expect.any(String));
            // Verify JSON content
            const writeCall = fs.writeFileSync.mock.calls[0];
            const jsonContent = writeCall[1];
            const data = JSON.parse(jsonContent);
            expect(data).toHaveProperty('nodes');
            expect(data).toHaveProperty('links');
            expect(data.nodes).toHaveLength(3);
            expect(data.links).toHaveLength(2);
        });
    });
});
//# sourceMappingURL=RuleMatrixVisualizer.test.js.map