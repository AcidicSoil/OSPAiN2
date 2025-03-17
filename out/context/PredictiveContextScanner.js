"use strict";
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
exports.PredictiveContextScanner = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
/**
 * Analyzes conversation context and proactively scans the codebase
 * to predict and collect relevant context files
 */
class PredictiveContextScanner {
    constructor(contextManager, knowledgeGraph, config) {
        this.conversationKeywords = new Set();
        this.contextFiles = new Map();
        this.scanInterval = null;
        this.lastScanTime = 0;
        this.isScanning = false;
        this.pendingScan = false;
        this.contextManager = contextManager;
        this.knowledgeGraph = knowledgeGraph;
        this.config = { ...PredictiveContextScanner.DEFAULT_CONFIG, ...config };
    }
    /**
     * Starts the predictive context scanner
     */
    start() {
        if (this.scanInterval) {
            this.stop();
        }
        // Initial scan
        this.scheduleScan(true);
        // Set up interval for ongoing scans
        this.scanInterval = setInterval(() => {
            this.scheduleScan(false);
        }, this.config.scanIntervalMs);
        console.log('Predictive context scanner started');
    }
    /**
     * Stops the predictive context scanner
     */
    stop() {
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
        console.log('Predictive context scanner stopped');
    }
    /**
     * Schedule a context scan
     */
    scheduleScan(immediate = false) {
        if (this.isScanning) {
            this.pendingScan = true;
            return;
        }
        const now = Date.now();
        const timeSinceLastScan = now - this.lastScanTime;
        if (immediate || timeSinceLastScan >= this.config.scanIntervalMs) {
            this.performScan();
        }
    }
    /**
     * Perform a scan of the conversation and codebase
     */
    async performScan() {
        this.isScanning = true;
        this.lastScanTime = Date.now();
        try {
            // Extract keywords from current conversation
            await this.updateConversationKeywords();
            // Find relevant files based on keywords
            const relevantFiles = await this.findRelevantFiles();
            // Update context files map
            this.updateContextFiles(relevantFiles);
            // Suggest or automatically add context files
            await this.processContextFiles();
        }
        catch (error) {
            console.error('Error during context scan:', error);
        }
        finally {
            this.isScanning = false;
            if (this.pendingScan) {
                this.pendingScan = false;
                setTimeout(() => this.performScan(), 100);
            }
        }
    }
    /**
     * Extracts keywords from the current conversation
     */
    async updateConversationKeywords() {
        // Get current editor content (if it's a chat window)
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const document = editor.document;
        const text = document.getText();
        // Extract important keywords
        const keywords = await this.extractKeywords(text);
        // Update keywords set
        this.conversationKeywords = new Set(keywords);
        console.log(`Extracted ${this.conversationKeywords.size} keywords from conversation`);
    }
    /**
     * Extracts important keywords from text
     */
    async extractKeywords(text) {
        // Remove code blocks and non-essential content
        const cleanedText = text
            .replace(/```[\s\S]*?```/g, '') // Remove code blocks
            .replace(/`[^`]*`/g, '') // Remove inline code
            .replace(/\b\w{1,2}\b/g, '') // Remove 1-2 character words
            .replace(/\b(the|and|for|this|that|with|from|your|have|will|what|about|into|when|it's|you're)\b/gi, ''); // Remove common stop words
        // Split text into lines
        const lines = cleanedText.split('\n');
        // Extract user queries which are more important
        const userQueries = lines
            .filter(line => line.startsWith('User:') || line.startsWith('Human:'))
            .map(line => line.replace(/^(User|Human):/, '').trim());
        // Extract response content
        const aiResponses = lines
            .filter(line => line.startsWith('Assistant:') || line.startsWith('AI:'))
            .map(line => line.replace(/^(Assistant|AI):/, '').trim());
        // Extract technical terms and variables
        const technicalTerms = cleanedText.match(/\b[A-Z][a-z]+[A-Z]\w*\b/g) || []; // CamelCase words
        const variables = cleanedText.match(/\b[a-z][a-zA-Z0-9]*[A-Z]\w*\b/g) || []; // camelCase words
        const constants = cleanedText.match(/\b[A-Z][A-Z0-9_]+\b/g) || []; // CONSTANT_CASE words
        // Extract file names and paths mentioned
        const filePaths = text.match(/\b[\w.-]+\.(ts|js|tsx|jsx|json|md|css|scss)\b/g) || [];
        const directoryPaths = text.match(/\b[\w/-]+\/[\w/-]+\b/g) || [];
        // Extract function or class names
        const functionNames = cleanedText.match(/\b\w+\(\)/g) || [];
        const classNames = cleanedText.match(/\bclass\s+(\w+)/g) || [];
        // Prioritize keywords in user queries
        let allTerms = [
            ...userQueries.flatMap(q => q.split(/\s+/).filter(word => word.length > 2)),
            ...technicalTerms,
            ...variables,
            ...constants,
            ...filePaths,
            ...directoryPaths,
            ...functionNames.map(f => f.replace('()', '')),
            ...classNames.map(c => c.replace('class ', '')),
            ...aiResponses.flatMap(r => r.split(/\s+/).filter(word => word.length > 3)),
        ];
        // Remove duplicates
        allTerms = [...new Set(allTerms)];
        // Filter out common code terms that are too generic
        const genericTerms = ['function', 'class', 'const', 'let', 'var', 'import', 'export', 'default', 'return', 'async', 'await'];
        allTerms = allTerms.filter(term => !genericTerms.includes(term));
        return allTerms;
    }
    /**
     * Finds files in the workspace that are relevant to the current conversation
     */
    async findRelevantFiles() {
        if (this.conversationKeywords.size === 0) {
            return [];
        }
        // Get all files in the workspace
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return [];
        }
        const keywordsArray = Array.from(this.conversationKeywords);
        const relevantFiles = [];
        // Generate pattern for file finding
        const includedExtensions = Object.keys(this.config.fileTypePriorities).join(',');
        // Find files using workspace search
        const fileUris = await this.findFilesInWorkspace(includedExtensions, this.config.maxFilesToScan);
        // Process each file
        for (const fileUri of fileUris) {
            try {
                const filePath = fileUri.fsPath;
                const fileExt = path.extname(filePath);
                const fileTypePriority = this.config.fileTypePriorities[fileExt] || 1.0;
                // Read file content
                const content = await this.readFileContent(filePath);
                // Calculate relevance score
                const { score, matchedTerms, snippets } = this.calculateRelevance(content, keywordsArray, fileTypePriority);
                if (score >= this.config.minRelevanceScore) {
                    const stats = fs.statSync(filePath);
                    relevantFiles.push({
                        filePath,
                        score,
                        snippets,
                        matchedTerms,
                        lastModified: stats.mtime,
                        fileType: fileExt
                    });
                }
            }
            catch (error) {
                console.error(`Error processing file ${fileUri.fsPath}:`, error);
            }
        }
        // Sort by relevance score
        relevantFiles.sort((a, b) => b.score - a.score);
        console.log(`Found ${relevantFiles.length} relevant files`);
        return relevantFiles.slice(0, this.config.maxFilesToSuggest);
    }
    /**
     * Finds files in the workspace matching the given patterns
     */
    async findFilesInWorkspace(includedExtensions, maxFiles) {
        const includePattern = `**/*.{${includedExtensions.replace(/\./g, '')}}`;
        const excludePattern = '**/node_modules/**';
        const files = await vscode.workspace.findFiles(includePattern, excludePattern, maxFiles);
        return files;
    }
    /**
     * Reads the content of a file
     */
    async readFileContent(filePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    /**
     * Calculates the relevance score of a file based on the keywords
     */
    calculateRelevance(content, keywords, fileTypePriority) {
        let totalScore = 0;
        const matchedTerms = [];
        const matchedLines = new Set();
        // Split content into lines
        const lines = content.split('\n');
        // Calculate matches for each keyword
        for (const keyword of keywords) {
            if (keyword.length <= 2)
                continue; // Skip very short keywords
            const regex = new RegExp(`\\b${keyword}\\b`, 'i');
            let found = false;
            // Check for matches in each line
            for (let i = 0; i < lines.length; i++) {
                if (regex.test(lines[i])) {
                    found = true;
                    matchedLines.add(i);
                }
            }
            if (found) {
                totalScore += 1;
                matchedTerms.push(keyword);
            }
        }
        // Apply file type priority
        totalScore *= fileTypePriority;
        // Normalize score based on number of keywords
        const normalizedScore = keywords.length > 0 ? totalScore / keywords.length : 0;
        // Extract snippets around matched lines
        const snippets = this.extractSnippets(lines, matchedLines);
        return {
            score: normalizedScore,
            matchedTerms,
            snippets
        };
    }
    /**
     * Extracts code snippets from matched lines with context
     */
    extractSnippets(lines, matchedLines) {
        const snippets = [];
        const processedRanges = new Set();
        // Sort matched lines
        const sortedLines = Array.from(matchedLines).sort((a, b) => a - b);
        for (const lineNum of sortedLines) {
            // Determine context range (5 lines before and after)
            const startLine = Math.max(0, lineNum - 5);
            const endLine = Math.min(lines.length - 1, lineNum + 5);
            // Check if this range overlaps with an already processed range
            const rangeKey = `${startLine}-${endLine}`;
            if (processedRanges.has(rangeKey)) {
                continue;
            }
            // Extract snippet
            const snippet = lines.slice(startLine, endLine + 1).join('\n');
            snippets.push(snippet);
            // Mark range as processed
            processedRanges.add(rangeKey);
            // Limit number of snippets
            if (snippets.length >= 3) {
                break;
            }
        }
        return snippets;
    }
    /**
     * Updates the context files map with new relevant files
     */
    updateContextFiles(relevantFiles) {
        // Update existing files or add new ones
        for (const file of relevantFiles) {
            this.contextFiles.set(file.filePath, file);
        }
        // Remove files that are no longer relevant
        const relevantPaths = new Set(relevantFiles.map(f => f.filePath));
        for (const [path, _] of this.contextFiles) {
            if (!relevantPaths.has(path)) {
                this.contextFiles.delete(path);
            }
        }
    }
    /**
     * Processes context files - suggests them to the user or adds them automatically
     */
    async processContextFiles() {
        if (this.contextFiles.size === 0) {
            return;
        }
        // Get top files
        const topFiles = Array.from(this.contextFiles.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, this.config.maxFilesToSuggest);
        if (this.config.enableAutomaticAddition) {
            // Automatically add files to the context
            for (const file of topFiles) {
                if (file.score > this.config.minRelevanceScore + 0.2) { // Higher threshold for automatic addition
                    await this.addFileToContext(file);
                }
            }
        }
        else {
            // Suggest files to the user
            await this.suggestContextFiles(topFiles);
        }
    }
    /**
     * Suggests context files to the user
     */
    async suggestContextFiles(files) {
        if (files.length === 0) {
            return;
        }
        const items = files.map(file => {
            const fileName = path.basename(file.filePath);
            const relPath = vscode.workspace.asRelativePath(file.filePath);
            return {
                label: fileName,
                description: `Relevance: ${Math.round(file.score * 100)}%`,
                detail: `${relPath} - Matches: ${file.matchedTerms.join(', ')}`,
                file
            };
        });
        const selection = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select files to add to context',
            canPickMany: true
        });
        if (selection) {
            for (const item of selection) {
                await this.addFileToContext(item.file);
            }
        }
    }
    /**
     * Adds a file to the conversation context
     */
    async addFileToContext(file) {
        try {
            // Read full file content
            const content = await this.readFileContent(file.filePath);
            // Add to knowledge graph with appropriate tags
            await this.knowledgeGraph.addDocument({
                id: file.filePath,
                text: content,
                metadata: {
                    filePath: file.filePath,
                    fileType: file.fileType,
                    matchedTerms: file.matchedTerms,
                    relevanceScore: file.score
                },
                tags: ['auto-context', ...file.matchedTerms]
            });
            // Notify the user
            vscode.window.showInformationMessage(`Added ${path.basename(file.filePath)} to conversation context`);
        }
        catch (error) {
            console.error(`Error adding file to context: ${file.filePath}`, error);
        }
    }
    /**
     * Forces an immediate scan regardless of timing
     */
    forceScan() {
        this.performScan();
    }
    /**
     * Updates scanner configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        // Restart scanner if running
        if (this.scanInterval) {
            this.stop();
            this.start();
        }
    }
    /**
     * Gets current scanner statistics
     */
    getStats() {
        return {
            keywordsCount: this.conversationKeywords.size,
            relevantFilesCount: this.contextFiles.size,
            lastScanTime: new Date(this.lastScanTime),
            isScanning: this.isScanning,
            pendingScan: this.pendingScan,
            config: this.config
        };
    }
    /**
     * Disposes of resources
     */
    dispose() {
        this.stop();
    }
}
exports.PredictiveContextScanner = PredictiveContextScanner;
// Default configuration
PredictiveContextScanner.DEFAULT_CONFIG = {
    maxFilesToScan: 100,
    maxFilesToSuggest: 5,
    minRelevanceScore: 0.6,
    scanIntervalMs: 30000, // 30 seconds
    fileTypePriorities: {
        '.ts': 1.5,
        '.tsx': 1.5,
        '.js': 1.3,
        '.jsx': 1.3,
        '.json': 0.8,
        '.md': 0.7,
        '.css': 0.5,
        '.scss': 0.5,
    },
    scanDepth: 'medium',
    enableAutomaticAddition: false
};
//# sourceMappingURL=PredictiveContextScanner.js.map