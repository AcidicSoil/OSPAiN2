"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NLPProcessor_1 = require("../visualization/NLPProcessor");
describe('NLPProcessor', () => {
    let nlpProcessor;
    beforeEach(() => {
        nlpProcessor = new NLPProcessor_1.NLPProcessor();
    });
    describe('analyze', () => {
        const mockRule = {
            id: 'test-rule',
            name: 'Test Rule',
            path: 'rules/test-rule.ts',
            filePath: 'rules/test-rule.ts',
            description: 'A test rule for NLP analysis',
            currentType: 'conditional',
            tags: ['test', 'nlp'],
            content: null,
        };
        const testContent = `
    /**
     * Rule Matrix Visualization System
     * 
     * Provides visualization capabilities for the rule matrix, showing relationships
     * and connections between different rules in the ecosystem.
     */
    
    import { RuleType, RuleFileInfo, RuleRelationship } from '../types';
    import { KnowledgeGraph } from '../../knowledge/KnowledgeGraph';
    
    export class RuleMatrixVisualizer {
      private knowledgeGraph: KnowledgeGraph;
      
      constructor(knowledgeGraph?: KnowledgeGraph) {
        this.knowledgeGraph = knowledgeGraph || new KnowledgeGraph();
      }
      
      public async generateVisualizationData(rules: RuleFileInfo[]) {
        // Implementation logic here
        return { nodes: [], links: [] };
      }
    }
    `;
        it('should extract keywords from content', () => {
            const result = nlpProcessor.analyze(testContent, mockRule);
            expect(result.keywords).toBeDefined();
            expect(result.keywords.length).toBeGreaterThan(0);
            expect(result.keywords).toContain('visualization');
            expect(result.keywords).toContain('matrix');
            expect(result.keywords).toContain('rule');
        });
        it('should extract key phrases from content', () => {
            const result = nlpProcessor.analyze(testContent, mockRule);
            expect(result.keyPhrases).toBeDefined();
            expect(result.keyPhrases.length).toBeGreaterThan(0);
            expect(result.keyPhrases.some(phrase => phrase.includes('visualization'))).toBeTruthy();
            expect(result.keyPhrases.some(phrase => phrase.includes('matrix'))).toBeTruthy();
        });
        it('should detect themes in content', () => {
            const result = nlpProcessor.analyze(testContent, mockRule);
            expect(result.themes).toBeDefined();
            expect(result.themes.length).toBeGreaterThan(0);
            expect(result.themes).toContain('development');
        });
        it('should classify content correctly', () => {
            const result = nlpProcessor.analyze(testContent, mockRule);
            expect(result.classification).toBeDefined();
            expect(result.classification).toEqual('code');
        });
        it('should generate embeddings of the expected length', () => {
            const result = nlpProcessor.analyze(testContent, mockRule);
            expect(result.embedding).toBeDefined();
            expect(result.embedding.length).toEqual(64);
        });
        it('should detect entities in content', () => {
            const result = nlpProcessor.analyze(testContent, mockRule);
            expect(result.entities).toBeDefined();
            expect(result.entities.length).toBeGreaterThan(0);
            expect(result.entities.some(entity => entity.type === 'CLASS')).toBeTruthy();
        });
        it('should calculate relevance score', () => {
            const result = nlpProcessor.analyze(testContent, mockRule);
            expect(result.relevanceScore).toBeDefined();
            expect(result.relevanceScore).toBeGreaterThanOrEqual(0);
            expect(result.relevanceScore).toBeLessThanOrEqual(1);
        });
    });
    describe('calculateSimilarity', () => {
        it('should calculate similarity between similar content', () => {
            const contentA = `
      /**
       * Rule Matrix Visualization
       * Visualize rule relationships
       */
      `;
            const contentB = `
      /**
       * Rule Matrix Visualization System
       * Visualize relationships between rules
       */
      `;
            const similarity = nlpProcessor.calculateSimilarity(contentA, contentB);
            expect(similarity).toBeGreaterThan(0.5);
        });
        it('should calculate low similarity between different content', () => {
            const contentA = `
      /**
       * Rule Matrix Visualization
       * Visualize rule relationships
       */
      `;
            const contentB = `
      /**
       * HTTP Client for API Requests
       * Make REST API calls with error handling
       */
      `;
            const similarity = nlpProcessor.calculateSimilarity(contentA, contentB);
            expect(similarity).toBeLessThan(0.5);
        });
        it('should handle empty content', () => {
            const contentA = '';
            const contentB = `Some content here`;
            const similarity = nlpProcessor.calculateSimilarity(contentA, contentB);
            expect(similarity).toBeDefined();
            expect(similarity).toBeGreaterThanOrEqual(0);
            expect(similarity).toBeLessThanOrEqual(1);
        });
    });
});
//# sourceMappingURL=NLPProcessor.test.js.map