"use strict";
/**
 * Rule Documentation Generator
 *
 * Generates documentation for rule files in the system.
 * Creates markdown documentation with rule types, purposes, and relationships.
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
exports.RuleDocumentationGenerator = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
class RuleDocumentationGenerator {
    /**
     * Creates a new RuleDocumentationGenerator
     *
     * @param ruleTypeManager The RuleTypeManager instance to use
     * @param relationshipManager Optional RuleRelationshipManager for relationship documentation
     */
    constructor(ruleTypeManager, relationshipManager) {
        this.relationshipManager = null;
        this.ruleTypeManager = ruleTypeManager;
        this.relationshipManager = relationshipManager || null;
    }
    /**
     * Generates documentation for all rules in a directory
     *
     * @param rulesDir Directory containing rule files
     * @param outputFile Path to write the documentation to
     * @param options Documentation generation options
     * @returns Information about the generation process
     */
    async generateDocumentation(rulesDir, outputFile, options = {}) {
        try {
            // Set default options
            const opts = {
                includeContent: options.includeContent ?? false,
                includeRelationships: options.includeRelationships ?? true,
                groupByType: options.groupByType ?? true,
                includeMetadata: options.includeMetadata ?? true
            };
            // Gather all rules
            const rules = await this.gatherRules(rulesDir);
            // Generate markdown documentation
            const markdown = await this.generateMarkdown(rules, opts);
            // Write to output file
            await fs.writeFile(outputFile, markdown, 'utf8');
            // Collect statistics
            const byType = {};
            rules.forEach(rule => {
                const type = rule.currentType;
                byType[type] = (byType[type] || 0) + 1;
            });
            return {
                rulesDocumented: rules.length,
                relationshipsDocumented: this.relationshipManager ? await this.countRelationships(rules) : 0,
                byType
            };
        }
        catch (error) {
            console.error(`Failed to generate documentation:`, error);
            throw error;
        }
    }
    /**
     * Counts relationships for a set of rules
     *
     * @param rules The rules to count relationships for
     * @returns The number of relationships
     */
    async countRelationships(rules) {
        if (!this.relationshipManager)
            return 0;
        let count = 0;
        for (const rule of rules) {
            const relationships = this.relationshipManager.getRelatedRules(rule.path);
            count += relationships.length;
        }
        return count;
    }
    /**
     * Gathers all rules from a directory
     *
     * @param rulesDir Directory containing rule files
     * @returns Array of rule information
     */
    async gatherRules(rulesDir) {
        return await this.ruleTypeManager.listRuleFiles(rulesDir, true);
    }
    /**
     * Generates markdown documentation for rules
     *
     * @param rules Array of rule information
     * @param options Documentation generation options
     * @returns Markdown documentation
     */
    async generateMarkdown(rules, options) {
        let markdown = '# Rule Documentation\n\n';
        markdown += `*Generated on ${new Date().toLocaleString()}*\n\n`;
        markdown += `*Total Rules: ${rules.length}*\n\n`;
        markdown += '## Table of Contents\n\n';
        if (options.groupByType) {
            // Group rules by type
            const rulesByType = {};
            for (const rule of rules) {
                const type = rule.currentType;
                if (!rulesByType[type])
                    rulesByType[type] = [];
                rulesByType[type].push(rule);
            }
            // Generate TOC
            for (const [type, typeRules] of Object.entries(rulesByType)) {
                markdown += `- [${this.formatRuleType(type)} Rules (${typeRules.length})](#${this.formatRuleType(type).toLowerCase()}-rules)\n`;
            }
            markdown += '\n';
            // Generate documentation for each type
            for (const [type, typeRules] of Object.entries(rulesByType)) {
                markdown += `## ${this.formatRuleType(type)} Rules\n\n`;
                // Sort rules by name for consistent output
                typeRules.sort((a, b) => path.basename(a.path).localeCompare(path.basename(b.path)));
                for (const rule of typeRules) {
                    markdown += await this.generateRuleMarkdown(rule, options);
                }
            }
        }
        else {
            // Sort all rules by name
            rules.sort((a, b) => path.basename(a.path).localeCompare(path.basename(b.path)));
            // Generate TOC
            for (const rule of rules) {
                const ruleName = path.basename(rule.path, '.mdc');
                markdown += `- [${ruleName}](#${ruleName.toLowerCase().replace(/\s+/g, '-')})\n`;
            }
            markdown += '\n## Rules\n\n';
            // Generate documentation for each rule
            for (const rule of rules) {
                markdown += await this.generateRuleMarkdown(rule, options);
            }
        }
        return markdown;
    }
    /**
     * Generates markdown documentation for a single rule
     *
     * @param rule The rule information
     * @param options Documentation generation options
     * @returns Markdown documentation for the rule
     */
    async generateRuleMarkdown(rule, options) {
        const ruleName = path.basename(rule.path, '.mdc');
        let markdown = `### ${ruleName}\n\n`;
        // Basic information
        markdown += `- **Path**: \`${rule.path}\`\n`;
        markdown += `- **Type**: ${this.formatRuleType(rule.currentType)}\n`;
        if (rule.currentType !== rule.suggestedType) {
            markdown += `- **Suggested Type**: ${this.formatRuleType(rule.suggestedType)}\n`;
        }
        markdown += `- **Purpose**: ${rule.purpose}\n`;
        // Dependencies
        if (rule.dependencies.length > 0) {
            markdown += `- **Dependencies**: ${rule.dependencies.map(d => `\`${d}\``).join(', ')}\n`;
        }
        // Usage patterns
        if (rule.usagePatterns.length > 0) {
            markdown += `- **Usage Patterns**:\n`;
            for (const pattern of rule.usagePatterns) {
                markdown += `  - ${pattern.type} (${pattern.location})\n`;
            }
        }
        // Relationships
        if (options.includeRelationships && this.relationshipManager) {
            const relationships = this.relationshipManager.getRelatedRules(rule.path);
            if (relationships.length > 0) {
                markdown += `- **Relationships**:\n`;
                // Group by relationship type
                const relationshipsByType = {};
                for (const rel of relationships) {
                    if (!relationshipsByType[rel.relationshipType]) {
                        relationshipsByType[rel.relationshipType] = [];
                    }
                    relationshipsByType[rel.relationshipType].push(rel);
                }
                // List relationships by type
                for (const [type, rels] of Object.entries(relationshipsByType)) {
                    markdown += `  - **${this.formatRelationshipType(type)}**:\n`;
                    for (const rel of rels) {
                        const isSource = rel.sourceRule === rule.path;
                        const otherRule = isSource ? rel.targetRule : rel.sourceRule;
                        const otherRuleName = path.basename(otherRule, '.mdc');
                        markdown += `    - ${isSource ? 'Depends on' : 'Used by'} \`${otherRuleName}\``;
                        if (rel.description) {
                            markdown += ` (${rel.description})`;
                        }
                        markdown += '\n';
                    }
                }
            }
        }
        // Content excerpt
        if (options.includeContent) {
            try {
                const content = await fs.readFile(rule.path, 'utf8');
                const lines = content.split('\n');
                // Skip metadata block
                let startIndex = 0;
                if (lines[0]?.trim() === '---') {
                    for (let i = 1; i < lines.length; i++) {
                        if (lines[i]?.trim() === '---') {
                            startIndex = i + 1;
                            break;
                        }
                    }
                }
                // Get a short excerpt (first paragraph or first 5 lines)
                let excerptLines = [];
                for (let i = startIndex; i < lines.length && excerptLines.length < 5; i++) {
                    if (lines[i]?.trim() === '') {
                        break;
                    }
                    excerptLines.push(lines[i]);
                }
                if (excerptLines.length > 0) {
                    markdown += `- **Excerpt**:\n`;
                    markdown += `\`\`\`\n${excerptLines.join('\n')}\n\`\`\`\n`;
                }
            }
            catch (error) {
                console.error(`Failed to read content for ${rule.path}:`, error);
            }
        }
        markdown += '\n';
        return markdown;
    }
    /**
     * Formats a rule type for display
     *
     * @param type The rule type
     * @returns Formatted rule type
     */
    formatRuleType(type) {
        return type
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    /**
     * Formats a relationship type for display
     *
     * @param type The relationship type
     * @returns Formatted relationship type
     */
    formatRelationshipType(type) {
        return type
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}
exports.RuleDocumentationGenerator = RuleDocumentationGenerator;
//# sourceMappingURL=RuleDocumentationGenerator.js.map