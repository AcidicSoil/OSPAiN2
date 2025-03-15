"use strict";
/**
 * Natural Language Processing for Rule Content
 *
 * Provides advanced NLP capabilities for analyzing rule content,
 * extracting keywords, identifying themes, and classifying content.
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
exports.NLPProcessor = void 0;
const path = __importStar(require("path"));
/**
 * Provides natural language processing capabilities for rule content
 */
class NLPProcessor {
    /**
     * Creates a new NLP processor
     */
    constructor() {
        this.stopwords = new Set([
            'a', 'an', 'the', 'and', 'or', 'but', 'if', 'because', 'as', 'what',
            'which', 'this', 'that', 'these', 'those', 'then', 'just', 'so', 'than',
            'such', 'both', 'through', 'about', 'for', 'is', 'of', 'while', 'during',
            'to', 'from', 'in', 'on', 'by', 'with', 'without', 'at', 'be', 'been', 'being',
            'can', 'could', 'will', 'would', 'should', 'shall', 'may', 'might',
            'must', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing'
        ]);
        // Domain-specific terms for rule contexts
        this.domainSpecificTerms = new Set([
            'rule', 'matrix', 'visualization', 'knowledge', 'graph', 'semantic',
            'analysis', 'relationship', 'connection', 'integration', 'node', 'link',
            'enhancement', 'type', 'content', 'theme', 'concept', 'relevance'
        ]);
        // Theme keywords mapping
        this.themeKeywords = new Map([
            ['development', ['code', 'development', 'programming', 'software', 'engineering', 'implementation']],
            ['design', ['design', 'ui', 'ux', 'interface', 'layout', 'visual', 'style', 'aesthetic']],
            ['testing', ['test', 'testing', 'validation', 'verification', 'quality', 'assurance', 'qa']],
            ['documentation', ['document', 'documentation', 'comment', 'explanation', 'description', 'guide']],
            ['architecture', ['architecture', 'structure', 'system', 'component', 'module', 'pattern']],
            ['data', ['data', 'database', 'storage', 'model', 'schema', 'entity', 'attribute']],
            ['security', ['security', 'authentication', 'authorization', 'permission', 'access', 'protection']],
            ['performance', ['performance', 'optimization', 'efficiency', 'speed', 'latency', 'throughput']],
        ]);
        // Content type classifiers using regex patterns
        this.contentClassifiers = new Map([
            ['code', [
                    /function\s+\w+\s*\(/i,
                    /class\s+\w+/i,
                    /const\s+\w+\s*=/i,
                    /import\s+.*from/i,
                    /export\s+(default\s+)?(class|function|const)/i,
                    /interface\s+\w+/i
                ]],
            ['documentation', [
                    /\*\*[\s\S]*?\*\//,
                    /#{1,6}\s+.+/,
                    />\s+.+/,
                    /\[.+\]\(.+\)/,
                    /```[\s\S]*?```/
                ]],
            ['configuration', [
                    /"[\w]+":\s*["{[]/,
                    /\w+:\s*["{[]/,
                    /^\s*[\w\-\.]+\s*=\s*.+/m
                ]],
            ['instructions', [
                    /\b(steps?|instructions?|guide|how\s+to)\b/i,
                    /\d+\.\s+.+/,
                    /\*\s+.+/,
                    /\[ \]\s+.+/
                ]]
        ]);
    }
    /**
     * Analyzes rule content using NLP techniques
     * @param content The rule content to analyze
     * @param rule The rule file information
     * @param options NLP processing options
     * @returns The NLP analysis result
     */
    analyze(content, rule, options = {}) {
        const { extractKeywords = true, extractKeyPhrases = true, detectThemes = true, classifyContent = true, analyzeSentiment = true, extractEntities = true, generateEmbedding = true, customStopwords = [], minWordLength = 3, maxKeywords = 20 } = options;
        // Add custom stopwords if provided
        if (customStopwords.length > 0) {
            customStopwords.forEach(word => this.stopwords.add(word.toLowerCase()));
        }
        // Initialize result object
        const result = {
            keywords: [],
            keyPhrases: [],
            themes: [],
            classification: '',
            sentiment: {
                score: 0,
                label: 'neutral'
            },
            entities: [],
            relevanceScore: 0,
            embedding: []
        };
        // Extract keywords if enabled
        if (extractKeywords) {
            result.keywords = this.extractKeywords(content, minWordLength, maxKeywords);
        }
        // Extract key phrases if enabled
        if (extractKeyPhrases) {
            result.keyPhrases = this.extractKeyPhrases(content);
        }
        // Detect themes if enabled
        if (detectThemes) {
            result.themes = this.detectThemes(content, result.keywords);
        }
        // Classify content if enabled
        if (classifyContent) {
            result.classification = this.classifyContent(content, rule);
        }
        // Analyze sentiment if enabled
        if (analyzeSentiment) {
            result.sentiment = this.analyzeSentiment(content);
        }
        // Extract entities if enabled
        if (extractEntities) {
            result.entities = this.extractEntities(content);
        }
        // Calculate relevance score
        result.relevanceScore = this.calculateRelevance(content, rule, result);
        // Generate embedding if enabled
        if (generateEmbedding) {
            result.embedding = this.generateEmbedding(content);
        }
        return result;
    }
    /**
     * Extracts keywords from content
     * @param content The content to extract keywords from
     * @param minWordLength Minimum word length to consider
     * @param maxKeywords Maximum number of keywords to extract
     * @returns Array of extracted keywords
     */
    extractKeywords(content, minWordLength, maxKeywords) {
        // Normalize text: convert to lowercase and remove punctuation
        const normalizedText = content.toLowerCase().replace(/[^\w\s]/g, ' ');
        // Tokenize words
        const words = normalizedText.split(/\s+/).filter(word => word.length >= minWordLength);
        // Count word frequencies
        const wordFrequencies = new Map();
        for (const word of words) {
            if (!this.stopwords.has(word)) {
                const count = wordFrequencies.get(word) || 0;
                wordFrequencies.set(word, count + 1);
            }
        }
        // Sort words by frequency (descending)
        const sortedWords = Array.from(wordFrequencies.entries())
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);
        // Prioritize domain-specific terms
        const domainTerms = sortedWords.filter(word => this.domainSpecificTerms.has(word));
        const otherTerms = sortedWords.filter(word => !this.domainSpecificTerms.has(word));
        // Combine and limit to max keywords
        return [...domainTerms, ...otherTerms].slice(0, maxKeywords);
    }
    /**
     * Extracts key phrases from content
     * @param content The content to extract key phrases from
     * @returns Array of extracted key phrases
     */
    extractKeyPhrases(content) {
        const phrases = [];
        // Simple approach: extract noun phrases using regex patterns
        // In a real implementation, this would use POS tagging and chunking
        const patterns = [
            /(?:\w+\s){1,3}(visualization|analysis|integration|processor|component)/gi,
            /(?:\w+\s){1,3}(system|framework|architecture)/gi,
            /(semantic|knowledge|rules?)\s(?:\w+\s){1,3}/gi,
            /(enhanced|advanced|improved)\s(?:\w+\s){1,3}/gi
        ];
        // Apply each pattern
        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const phrase = match[0].trim().toLowerCase();
                if (phrase.split(/\s+/).length >= 2) {
                    phrases.push(phrase);
                }
            }
        });
        // Remove duplicates
        return Array.from(new Set(phrases));
    }
    /**
     * Detects themes in content
     * @param content The content to detect themes in
     * @param keywords Extracted keywords to help with theme detection
     * @returns Array of detected themes
     */
    detectThemes(content, keywords) {
        const themes = new Map();
        // Check each theme's keywords against content and extracted keywords
        this.themeKeywords.forEach((themeWords, theme) => {
            let score = 0;
            // Score based on direct keyword matches
            themeWords.forEach(word => {
                // Count occurrences in content
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                const contentMatches = (content.match(regex) || []).length;
                score += contentMatches;
                // Bonus points for matches in extracted keywords
                if (keywords.includes(word)) {
                    score += 2;
                }
            });
            // Store theme score if above threshold
            if (score > 0) {
                themes.set(theme, score);
            }
        });
        // Sort themes by score (descending)
        return Array.from(themes.entries())
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);
    }
    /**
     * Classifies content type
     * @param content The content to classify
     * @param rule The rule file information
     * @returns Classification label
     */
    classifyContent(content, rule) {
        const classifications = new Map();
        // Check each classifier's patterns against content
        this.contentClassifiers.forEach((patterns, type) => {
            let score = 0;
            // Score based on pattern matches
            patterns.forEach(pattern => {
                const matches = (content.match(pattern) || []).length;
                score += matches;
            });
            // Consider file extension for additional clues
            const ext = path.extname(rule.filePath).toLowerCase();
            if ((type === 'code' && ['.ts', '.js', '.tsx', '.jsx'].includes(ext)) ||
                (type === 'documentation' && ['.md', '.mdx', '.txt'].includes(ext)) ||
                (type === 'configuration' && ['.json', '.yaml', '.yml', '.config'].includes(ext))) {
                score += 3;
            }
            // Store classification score if above threshold
            if (score > 0) {
                classifications.set(type, score);
            }
        });
        // Return highest scoring classification or 'unknown'
        const sortedClassifications = Array.from(classifications.entries())
            .sort((a, b) => b[1] - a[1]);
        return sortedClassifications.length > 0 ? sortedClassifications[0][0] : 'unknown';
    }
    /**
     * Analyzes sentiment in content
     * @param content The content to analyze
     * @returns Sentiment analysis result
     */
    analyzeSentiment(content) {
        // Simple lexicon-based sentiment analysis
        const positiveWords = [
            'good', 'great', 'excellent', 'amazing', 'awesome', 'fantastic',
            'wonderful', 'beneficial', 'better', 'best', 'enhance', 'improve',
            'optimized', 'effective', 'efficient', 'robust', 'seamless', 'reliable'
        ];
        const negativeWords = [
            'bad', 'poor', 'terrible', 'awful', 'horrible', 'disappointing',
            'fails', 'error', 'issue', 'problem', 'bug', 'difficult', 'broken',
            'complex', 'confusing', 'inefficient', 'unstable', 'unreliable'
        ];
        let positiveCount = 0;
        let negativeCount = 0;
        // Count positive and negative words
        const words = content.toLowerCase().split(/\s+/);
        words.forEach(word => {
            if (positiveWords.includes(word))
                positiveCount++;
            if (negativeWords.includes(word))
                negativeCount++;
        });
        // Calculate sentiment score (-1 to 1)
        const totalWords = words.length || 1; // Avoid division by zero
        const score = (positiveCount - negativeCount) / (positiveCount + negativeCount || 1);
        // Determine sentiment label
        let label;
        if (score > 0.1) {
            label = 'positive';
        }
        else if (score < -0.1) {
            label = 'negative';
        }
        else {
            label = 'neutral';
        }
        return { score, label };
    }
    /**
     * Extracts named entities from content
     * @param content The content to extract entities from
     * @returns Array of extracted entities
     */
    extractEntities(content) {
        const entities = [];
        // Simple rule-based entity extraction
        // In a real implementation, this would use a dedicated NER library
        // Extract URLs
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        let match;
        while ((match = urlRegex.exec(content)) !== null) {
            entities.push({
                text: match[0],
                type: 'URL',
                startIndex: match.index,
                length: match[0].length
            });
        }
        // Extract file paths
        const filePathRegex = /(\/?[\w-]+\/)+[\w-]+(\.[\w-]+)?/g;
        while ((match = filePathRegex.exec(content)) !== null) {
            entities.push({
                text: match[0],
                type: 'FILE_PATH',
                startIndex: match.index,
                length: match[0].length
            });
        }
        // Extract version numbers
        const versionRegex = /\b\d+\.\d+(\.\d+)?(-(alpha|beta|rc)(\.\d+)?)?\b/g;
        while ((match = versionRegex.exec(content)) !== null) {
            entities.push({
                text: match[0],
                type: 'VERSION',
                startIndex: match.index,
                length: match[0].length
            });
        }
        // Extract function names
        const functionRegex = /function\s+(\w+)/g;
        while ((match = functionRegex.exec(content)) !== null) {
            entities.push({
                text: match[1],
                type: 'FUNCTION',
                startIndex: match.index + 9, // 'function '.length
                length: match[1].length
            });
        }
        // Extract class names
        const classRegex = /class\s+(\w+)/g;
        while ((match = classRegex.exec(content)) !== null) {
            entities.push({
                text: match[1],
                type: 'CLASS',
                startIndex: match.index + 6, // 'class '.length
                length: match[1].length
            });
        }
        return entities;
    }
    /**
     * Calculates relevance score for content
     * @param content The content to calculate relevance for
     * @param rule The rule file information
     * @param nlpResult The NLP analysis result
     * @returns Relevance score (0-1)
     */
    calculateRelevance(content, rule, nlpResult) {
        let score = 0;
        // Factor 1: Length of content (longer content might be more comprehensive)
        const contentLength = content.length;
        if (contentLength > 1000) {
            score += 0.2;
        }
        else if (contentLength > 500) {
            score += 0.1;
        }
        else if (contentLength < 100) {
            score -= 0.1;
        }
        // Factor 2: Number of keywords found
        const keywordCount = nlpResult.keywords?.length || 0;
        score += Math.min(0.3, keywordCount * 0.03);
        // Factor 3: Theme coherence
        const themeCount = nlpResult.themes?.length || 0;
        if (themeCount > 0 && themeCount <= 3) {
            score += 0.15; // Focused content
        }
        else if (themeCount > 3) {
            score += 0.05; // Broader content
        }
        // Factor 4: Content structure
        if (content.includes('/**') && content.includes('*/')) {
            score += 0.1; // Has JSDoc
        }
        if (content.includes('interface') || content.includes('type ')) {
            score += 0.1; // Has type definitions
        }
        if (content.includes('class ') || content.includes('function ')) {
            score += 0.1; // Has classes/functions
        }
        // Factor 5: File type relevance (based on extension)
        const ext = path.extname(rule.filePath).toLowerCase();
        if (['.ts', '.js', '.tsx', '.jsx'].includes(ext)) {
            score += 0.1; // Source code
        }
        else if (['.md', '.mdx'].includes(ext)) {
            score += 0.1; // Documentation
        }
        // Normalize score to 0-1 range
        const normalizedScore = Math.max(0, Math.min(1, score));
        return normalizedScore;
    }
    /**
     * Generates a vector embedding for content
     * @param content The content to generate an embedding for
     * @returns Vector embedding
     */
    generateEmbedding(content) {
        // Simple embedding generation approach
        // In a real implementation, this would use a pre-trained embedding model
        // For simplicity, we'll create a basic bag-of-words representation
        // Normalize text
        const normalizedText = content.toLowerCase().replace(/[^\w\s]/g, ' ');
        // Tokenize into words
        const words = normalizedText.split(/\s+/).filter(word => word.length >= 3 && !this.stopwords.has(word));
        // Count word frequencies
        const wordFrequencies = new Map();
        for (const word of words) {
            const count = wordFrequencies.get(word) || 0;
            wordFrequencies.set(word, count + 1);
        }
        // Create a simple 64-dimensional vector using hashing
        const embedding = new Array(64).fill(0);
        for (const [word, count] of wordFrequencies.entries()) {
            // Simple hash function to get an index
            const hash = this.simpleHash(word) % embedding.length;
            // Weighted by frequency
            embedding[hash] += count / words.length;
        }
        // Normalize the embedding vector
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        return embedding.map(val => magnitude === 0 ? 0 : val / magnitude);
    }
    /**
     * Simple string hashing function
     * @param str The string to hash
     * @returns Hash value
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }
    /**
     * Compares two rule contents to determine their similarity
     * @param contentA First content
     * @param contentB Second content
     * @returns Similarity score (0-1)
     */
    calculateSimilarity(contentA, contentB) {
        const embeddingA = this.generateEmbedding(contentA);
        const embeddingB = this.generateEmbedding(contentB);
        return this.cosineSimilarity(embeddingA, embeddingB);
    }
    /**
     * Calculates cosine similarity between two vectors
     * @param a First vector
     * @param b Second vector
     * @returns Cosine similarity (0-1)
     */
    cosineSimilarity(a, b) {
        if (a.length !== b.length) {
            throw new Error('Vectors must have the same length');
        }
        let dotProduct = 0;
        let magnitudeA = 0;
        let magnitudeB = 0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            magnitudeA += a[i] * a[i];
            magnitudeB += b[i] * b[i];
        }
        magnitudeA = Math.sqrt(magnitudeA);
        magnitudeB = Math.sqrt(magnitudeB);
        if (magnitudeA === 0 || magnitudeB === 0) {
            return 0;
        }
        return dotProduct / (magnitudeA * magnitudeB);
    }
}
exports.NLPProcessor = NLPProcessor;
//# sourceMappingURL=NLPProcessor.js.map