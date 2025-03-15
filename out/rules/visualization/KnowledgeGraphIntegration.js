"use strict";
/**
 * Knowledge Graph Integration for Rule Matrix
 *
 * Provides integration between the Rule Matrix Visualization and
 * the Knowledge Graph system with advanced semantic analysis.
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
exports.KnowledgeGraphIntegration = void 0;
const NLPProcessor_1 = require("./NLPProcessor");
const fs = __importStar(require("fs"));
class KnowledgeGraphIntegration {
    constructor(knowledgeGraph) {
        this.contentCache = new Map();
        this.analysisCache = new Map();
        this.similarityCache = new Map();
        this.knowledgeGraph = knowledgeGraph;
        this.nlpProcessor = new NLPProcessor_1.NLPProcessor();
    }
    /**
     * Enhance visualization data with knowledge graph information
     */
    async enhanceVisualization(nodes, links, rules, relationships) {
        // First, analyze rule content and update the knowledge graph
        await this.analyzeRuleContent(rules);
        // Generate enhancement data based on knowledge graph analysis
        const enhancement = await this.generateEnhancement(rules, relationships);
        // Add semantic connections as additional links
        enhancement.semanticConnections.forEach(connection => {
            // Check if this connection already exists
            const existingLink = links.find(link => (typeof link.source === 'string' ? link.source : link.source.id) === connection.source &&
                (typeof link.target === 'string' ? link.target : link.target.id) === connection.target);
            if (existingLink) {
                // Enhance existing link with semantic strength
                existingLink.strength = Math.max(existingLink.strength, connection.strength);
            }
            else {
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
                node.concepts = concepts;
            }
            // Add content type classification
            const contentType = enhancement.contentTypes.get(node.id);
            if (contentType) {
                node.contentType = contentType;
            }
            // Add thematic group information
            const thematicGroups = enhancement.thematicGroups.get(node.id);
            if (thematicGroups && thematicGroups.length > 0) {
                node.thematicGroups = thematicGroups;
            }
        });
    }
    /**
     * Analyze rule content and update the knowledge graph
     */
    async analyzeRuleContent(rules) {
        for (const rule of rules) {
            // Skip if already analyzed and cached
            if (this.analysisCache.has(rule.path)) {
                continue;
            }
            // Get rule content
            const content = await this.getRuleContent(rule);
            if (!content)
                continue;
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
    async getRuleContent(rule) {
        // Check cache first
        if (this.contentCache.has(rule.path)) {
            return this.contentCache.get(rule.path) || null;
        }
        try {
            // Read file content
            const content = fs.readFileSync(rule.path, 'utf-8');
            this.contentCache.set(rule.path, content);
            return content;
        }
        catch (error) {
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
    async performSemanticAnalysis(content, rule) {
        // Use NLP processor for advanced text analysis
        const nlpOptions = {
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
    async updateKnowledgeGraphNode(rule, analysis) {
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
    async generateEnhancement(rules, relationships) {
        const semanticConnections = [];
        const nodeConcepts = new Map();
        const relevanceScores = new Map();
        const contentTypes = new Map();
        const thematicGroups = new Map();
        // Process each rule to extract semantic relationships
        for (const rule of rules) {
            const analysis = this.analysisCache.get(rule.path);
            if (!analysis)
                continue;
            // Add concepts and scores from analysis
            nodeConcepts.set(rule.path, analysis.concepts);
            relevanceScores.set(rule.path, analysis.relevance);
            contentTypes.set(rule.path, analysis.contentType);
            thematicGroups.set(rule.path, analysis.themes);
            // Calculate semantic similarity with other rules
            for (const otherRule of rules) {
                if (rule.path === otherRule.path)
                    continue;
                // Check if there's already an explicit relationship
                const hasExplicitRelation = relationships.some(rel => (rel.sourceRule === rule.path && rel.targetRule === otherRule.path) ||
                    (rel.sourceRule === otherRule.path && rel.targetRule === rule.path));
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
    calculateSemanticSimilarity(sourceRule, targetRule) {
        // Check cache first
        if (this.similarityCache.has(sourceRule) &&
            this.similarityCache.get(sourceRule).has(targetRule)) {
            return this.similarityCache.get(sourceRule).get(targetRule);
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
        this.similarityCache.get(sourceRule).set(targetRule, similarity);
        // For symmetry, also cache the reverse direction
        if (!this.similarityCache.has(targetRule)) {
            this.similarityCache.set(targetRule, new Map());
        }
        this.similarityCache.get(targetRule).set(sourceRule, similarity);
        return similarity;
    }
    /**
     * Create knowledge graph nodes from rules
     */
    async createKnowledgeGraphNodes(rules) {
        // Analyze rule content
        await this.analyzeRuleContent(rules);
        console.log(`[KnowledgeGraph] Created nodes for ${rules.length} rules`);
    }
}
exports.KnowledgeGraphIntegration = KnowledgeGraphIntegration;
//# sourceMappingURL=KnowledgeGraphIntegration.js.map