"use strict";
/**
 * Rule Relationship Manager
 *
 * Manages relationships between rules in the Sovereign AI ecosystem.
 * Enables tracking dependencies, extensions, and conflicts between rules.
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
exports.RuleRelationshipManager = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
class RuleRelationshipManager {
    /**
     * Creates a new RuleRelationshipManager
     *
     * @param ruleTypeManager The RuleTypeManager instance to use
     * @param relationshipFile Optional path to persist relationships
     */
    constructor(ruleTypeManager, relationshipFile) {
        this.relationships = [];
        this.relationshipFile = null;
        this.ruleTypeManager = ruleTypeManager;
        this.relationshipFile = relationshipFile || null;
    }
    /**
     * Initializes the relationship manager by loading saved relationships
     */
    async initialize() {
        if (this.relationshipFile) {
            try {
                await this.loadRelationships();
            }
            catch (error) {
                console.warn(`Could not load relationships from ${this.relationshipFile}: ${error instanceof Error ? error.message : String(error)}`);
                // Create empty relationships file
                await this.saveRelationships();
            }
        }
    }
    /**
     * Adds a relationship between two rules
     *
     * @param relationship The relationship to add
     */
    async addRelationship(relationship) {
        // Check if relationship already exists
        const existingIndex = this.relationships.findIndex(r => r.sourceRule === relationship.sourceRule &&
            r.targetRule === relationship.targetRule &&
            r.relationshipType === relationship.relationshipType);
        if (existingIndex >= 0) {
            // Update existing relationship
            this.relationships[existingIndex] = relationship;
        }
        else {
            // Add new relationship
            this.relationships.push(relationship);
        }
        // Persist changes
        await this.saveRelationships();
    }
    /**
     * Removes a relationship between two rules
     *
     * @param sourceRule Source rule path
     * @param targetRule Target rule path
     * @param relationshipType Type of relationship
     */
    async removeRelationship(sourceRule, targetRule, relationshipType) {
        this.relationships = this.relationships.filter(r => {
            if (r.sourceRule !== sourceRule || r.targetRule !== targetRule) {
                return true;
            }
            if (relationshipType && r.relationshipType !== relationshipType) {
                return true;
            }
            return false;
        });
        // Persist changes
        await this.saveRelationships();
    }
    /**
     * Gets all relationships for a specific rule
     *
     * @param rulePath The rule path
     * @returns Relationships involving the rule
     */
    getRelatedRules(rulePath) {
        return this.relationships.filter(r => r.sourceRule === rulePath || r.targetRule === rulePath);
    }
    /**
     * Gets all incoming relationships for a rule
     *
     * @param rulePath The rule path
     * @returns Relationships where the rule is the target
     */
    getIncomingRelationships(rulePath) {
        return this.relationships.filter(r => r.targetRule === rulePath);
    }
    /**
     * Gets all outgoing relationships for a rule
     *
     * @param rulePath The rule path
     * @returns Relationships where the rule is the source
     */
    getOutgoingRelationships(rulePath) {
        return this.relationships.filter(r => r.sourceRule === rulePath);
    }
    /**
     * Gets a graph representation of the relationships
     *
     * @returns An adjacency list representation of the relationship graph
     */
    getRelationshipGraph() {
        const graph = {};
        for (const rel of this.relationships) {
            if (!graph[rel.sourceRule])
                graph[rel.sourceRule] = [];
            graph[rel.sourceRule].push(rel.targetRule);
        }
        return graph;
    }
    /**
     * Auto-discovers relationships between rules by analyzing their content
     *
     * @param directory The directory containing rule files
     */
    async discoverRelationships(directory) {
        try {
            // Get all rule files
            const rules = await this.ruleTypeManager.listRuleFiles(directory, true);
            // Clear existing relationships
            this.relationships = [];
            // Create a lookup map for quick access
            const rulesByPath = {};
            rules.forEach(rule => {
                rulesByPath[rule.path] = rule;
            });
            // Discover relationships
            const discovered = [];
            for (const rule of rules) {
                // Check dependencies
                for (const dep of rule.dependencies) {
                    // Try to find the full path of the dependency
                    const depRule = this.findRuleByName(dep, rules);
                    if (depRule) {
                        const relationship = {
                            sourceRule: rule.path,
                            targetRule: depRule.path,
                            relationshipType: 'depends-on',
                            strength: 0.8,
                            description: `${path.basename(rule.path)} depends on ${path.basename(depRule.path)}`
                        };
                        discovered.push(relationship);
                        this.relationships.push(relationship);
                    }
                }
                // Determine other relationship types based on name and purpose
                for (const otherRule of rules) {
                    if (rule.path === otherRule.path)
                        continue;
                    // Check if names suggest an extension relationship
                    const ruleName = path.basename(rule.path, '.mdc');
                    const otherName = path.basename(otherRule.path, '.mdc');
                    if (otherName.includes(ruleName) || ruleName.includes(otherName)) {
                        // Names suggest a relationship
                        const relationship = {
                            sourceRule: otherName.includes(ruleName) ? rule.path : otherRule.path,
                            targetRule: otherName.includes(ruleName) ? otherRule.path : rule.path,
                            relationshipType: 'extends',
                            strength: 0.6,
                            description: `Name pattern suggests an extension relationship`
                        };
                        discovered.push(relationship);
                        this.relationships.push(relationship);
                    }
                    // Check for complementary types
                    if (rule.currentType === otherRule.currentType) {
                        const relationship = {
                            sourceRule: rule.path,
                            targetRule: otherRule.path,
                            relationshipType: 'complements',
                            strength: 0.4,
                            description: `Rules of the same type (${rule.currentType})`
                        };
                        discovered.push(relationship);
                        this.relationships.push(relationship);
                    }
                }
            }
            // Persist changes
            await this.saveRelationships();
            return discovered;
        }
        catch (error) {
            console.error(`Failed to discover relationships in ${directory}:`, error);
            throw error;
        }
    }
    /**
     * Finds a rule by its name (not full path)
     *
     * @param name The rule name to find
     * @param rules List of rules to search
     * @returns The matching rule, or undefined if not found
     */
    findRuleByName(name, rules) {
        // If name includes path separators, it might be a relative path
        if (name.includes('/') || name.includes('\\')) {
            return rules.find(r => r.path.endsWith(name));
        }
        // Otherwise, look for matching filename
        return rules.find(r => path.basename(r.path) === name);
    }
    /**
     * Loads relationships from the persisted file
     */
    async loadRelationships() {
        if (!this.relationshipFile)
            return;
        const content = await fs.readFile(this.relationshipFile, 'utf8');
        this.relationships = JSON.parse(content);
    }
    /**
     * Saves relationships to the persisted file
     */
    async saveRelationships() {
        if (!this.relationshipFile)
            return;
        const content = JSON.stringify(this.relationships, null, 2);
        await fs.writeFile(this.relationshipFile, content, 'utf8');
    }
}
exports.RuleRelationshipManager = RuleRelationshipManager;
//# sourceMappingURL=RuleRelationshipManager.js.map