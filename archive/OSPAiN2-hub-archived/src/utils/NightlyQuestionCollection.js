"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NightlyQuestionCollection = void 0;
exports.runNightlyCollection = runNightlyCollection;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class NightlyQuestionCollection {
    constructor(dbPath = path_1.default.join(process.cwd(), "data", "questions.json")) {
        this.questions = [];
        this.dbPath = dbPath;
        this.loadQuestions();
    }
    /**
     * Scans source files for questions and collects them
     */
    async collectQuestions(sourcePath, fileTypes = [".ts", ".tsx", ".js", ".jsx", ".md"]) {
        console.log(`Scanning ${sourcePath} for questions...`);
        try {
            // Ensure data directory exists
            const dataDir = path_1.default.dirname(this.dbPath);
            if (!fs_1.default.existsSync(dataDir)) {
                fs_1.default.mkdirSync(dataDir, { recursive: true });
            }
            // Find files recursively
            const files = this.findFiles(sourcePath, fileTypes);
            console.log(`Found ${files.length} files to scan`);
            // Scan each file for questions
            for (const file of files) {
                await this.scanFile(file);
            }
            // Save questions to database
            this.saveQuestions();
            console.log(`Collection complete. Found ${this.questions.length} questions.`);
        }
        catch (error) {
            console.error("Error collecting questions:", error);
        }
    }
    /**
     * Find all files of specified types in directory and subdirectories
     */
    findFiles(dir, fileTypes) {
        const files = [];
        if (!fs_1.default.existsSync(dir)) {
            return files;
        }
        const entries = fs_1.default.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path_1.default.join(dir, entry.name);
            if (entry.isDirectory()) {
                // Skip node_modules and build directories
                if (entry.name !== "node_modules" &&
                    entry.name !== "build" &&
                    entry.name !== "dist") {
                    files.push(...this.findFiles(fullPath, fileTypes));
                }
            }
            else if (fileTypes.some((ext) => entry.name.endsWith(ext))) {
                files.push(fullPath);
            }
        }
        return files;
    }
    /**
     * Scan a single file for questions
     */
    async scanFile(filePath) {
        try {
            const content = fs_1.default.readFileSync(filePath, "utf-8");
            const lines = content.split("\n");
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const match = line.match(/\/\/\s*QUESTION:\s*(.+)$/);
                if (match) {
                    const questionText = match[1].trim();
                    const context = this.extractContext(lines, i);
                    // Generate a simple ID
                    const id = `q_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
                    // Extract priority from tags
                    const priority = this.extractPriority(questionText);
                    // Extract tags
                    const tags = this.extractTags(questionText);
                    // Create question entry
                    const question = {
                        id,
                        text: questionText,
                        location: `${path_1.default.relative(process.cwd(), filePath)}:${i + 1}`,
                        context,
                        timestamp: new Date(),
                        status: "pending",
                        priority,
                        tags,
                    };
                    // Add to questions collection if not a duplicate
                    if (!this.isDuplicate(question)) {
                        this.questions.push(question);
                        console.log(`Found question: ${questionText.substring(0, 50)}...`);
                    }
                }
            }
        }
        catch (error) {
            console.error(`Error scanning file ${filePath}:`, error);
        }
    }
    /**
     * Extract context around a question (lines before and after)
     */
    extractContext(lines, questionLineIdx, contextLines = 5) {
        const startLine = Math.max(0, questionLineIdx - contextLines);
        const endLine = Math.min(lines.length - 1, questionLineIdx + contextLines);
        return lines.slice(startLine, endLine + 1).join("\n");
    }
    /**
     * Extract priority from question text
     */
    extractPriority(text) {
        if (/#critical\b/i.test(text)) {
            return "critical";
        }
        else if (/#high\b/i.test(text)) {
            return "high";
        }
        else if (/#medium\b/i.test(text)) {
            return "medium";
        }
        else if (/#low\b/i.test(text)) {
            return "low";
        }
        // Default priority based on keywords
        if (/urgent|critical|blocking|broken|crash/i.test(text)) {
            return "high";
        }
        else if (/important|significant|needed|should/i.test(text)) {
            return "medium";
        }
        return "low";
    }
    /**
     * Extract tags from question text
     */
    extractTags(text) {
        const tags = [];
        const hashtagRegex = /#([a-zA-Z0-9]+)/g;
        let match;
        while ((match = hashtagRegex.exec(text)) !== null) {
            // Skip priority tags
            if (!["critical", "high", "medium", "low"].includes(match[1].toLowerCase())) {
                tags.push(match[1].toLowerCase());
            }
        }
        return tags;
    }
    /**
     * Check if a question is a duplicate of an existing one
     */
    isDuplicate(question) {
        return this.questions.some((q) => q.text === question.text ||
            (q.location === question.location &&
                q.text.substring(0, 50) === question.text.substring(0, 50)));
    }
    /**
     * Load questions from database
     */
    loadQuestions() {
        try {
            if (fs_1.default.existsSync(this.dbPath)) {
                const data = fs_1.default.readFileSync(this.dbPath, "utf-8");
                const loadedQuestions = JSON.parse(data);
                // Convert date strings back to Date objects
                this.questions = loadedQuestions.map((q) => ({
                    ...q,
                    timestamp: new Date(q.timestamp),
                }));
                console.log(`Loaded ${this.questions.length} questions from database`);
            }
            else {
                console.log("No existing questions database found. Starting fresh.");
            }
        }
        catch (error) {
            console.error("Error loading questions from database:", error);
            this.questions = [];
        }
    }
    /**
     * Save questions to database
     */
    saveQuestions() {
        try {
            const data = JSON.stringify(this.questions, null, 2);
            fs_1.default.writeFileSync(this.dbPath, data, "utf-8");
            console.log(`Saved ${this.questions.length} questions to database`);
        }
        catch (error) {
            console.error("Error saving questions to database:", error);
        }
    }
    /**
     * Get all collected questions
     */
    getQuestions() {
        return [...this.questions];
    }
    /**
     * Get pending questions
     */
    getPendingQuestions() {
        return this.questions.filter((q) => q.status === "pending");
    }
    /**
     * Update question status
     */
    updateQuestionStatus(id, status) {
        const question = this.questions.find((q) => q.id === id);
        if (question) {
            question.status = status;
            this.saveQuestions();
            return true;
        }
        return false;
    }
    /**
     * Add an answer to a question
     */
    addAnswer(id, answer) {
        const question = this.questions.find((q) => q.id === id);
        if (question) {
            question.answer = answer;
            question.status = "answered";
            this.saveQuestions();
            return true;
        }
        return false;
    }
}
exports.NightlyQuestionCollection = NightlyQuestionCollection;
// Example usage:
// const collector = new NightlyQuestionCollection();
// collector.collectQuestions('./src');
async function runNightlyCollection() {
    console.log("Starting nightly question collection...");
    const collector = new NightlyQuestionCollection();
    await collector.collectQuestions(process.cwd());
    const pendingQuestions = collector.getPendingQuestions();
    console.log(`Found ${pendingQuestions.length} pending questions to research.`);
    // In a real implementation, this would send questions for research
    // and schedule an integration task
    console.log("Nightly collection complete.");
}
//# sourceMappingURL=NightlyQuestionCollection.js.map