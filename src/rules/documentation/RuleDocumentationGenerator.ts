/**
 * Rule Documentation Generator
 * 
 * Generates documentation for rule files in the system.
 * Creates markdown documentation with rule types, purposes, and relationships.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { RuleFileInfo, RuleRelationship } from '../types';
import { RuleTypeManager } from '../manager/RuleTypeManager';
import { RuleRelationshipManager } from '../relationship/RuleRelationshipManager';

export class RuleDocumentationGenerator {
  private ruleTypeManager: RuleTypeManager;
  private relationshipManager: RuleRelationshipManager | null = null;

  /**
   * Creates a new RuleDocumentationGenerator
   * 
   * @param ruleTypeManager The RuleTypeManager instance to use
   * @param relationshipManager Optional RuleRelationshipManager for relationship documentation
   */
  constructor(ruleTypeManager: RuleTypeManager, relationshipManager?: RuleRelationshipManager) {
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
  async generateDocumentation(
    rulesDir: string, 
    outputFile: string,
    options: {
      includeContent?: boolean;
      includeRelationships?: boolean;
      groupByType?: boolean;
      includeMetadata?: boolean;
    } = {}
  ): Promise<{
    rulesDocumented: number;
    relationshipsDocumented: number;
    byType: Record<string, number>;
  }> {
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
      const byType: Record<string, number> = {};
      rules.forEach(rule => {
        const type = rule.currentType;
        byType[type] = (byType[type] || 0) + 1;
      });
      
      return {
        rulesDocumented: rules.length,
        relationshipsDocumented: this.relationshipManager ? await this.countRelationships(rules) : 0,
        byType
      };
    } catch (error) {
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
  private async countRelationships(rules: RuleFileInfo[]): Promise<number> {
    if (!this.relationshipManager) return 0;
    
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
  private async gatherRules(rulesDir: string): Promise<RuleFileInfo[]> {
    return await this.ruleTypeManager.listRuleFiles(rulesDir, true);
  }

  /**
   * Generates markdown documentation for rules
   * 
   * @param rules Array of rule information
   * @param options Documentation generation options
   * @returns Markdown documentation
   */
  private async generateMarkdown(
    rules: RuleFileInfo[], 
    options: {
      includeContent: boolean;
      includeRelationships: boolean;
      groupByType: boolean;
      includeMetadata: boolean;
    }
  ): Promise<string> {
    let markdown = '# Rule Documentation\n\n';
    
    markdown += `*Generated on ${new Date().toLocaleString()}*\n\n`;
    markdown += `*Total Rules: ${rules.length}*\n\n`;
    
    markdown += '## Table of Contents\n\n';
    
    if (options.groupByType) {
      // Group rules by type
      const rulesByType: Record<string, RuleFileInfo[]> = {};
      for (const rule of rules) {
        const type = rule.currentType;
        if (!rulesByType[type]) rulesByType[type] = [];
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
    } else {
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
  private async generateRuleMarkdown(
    rule: RuleFileInfo,
    options: {
      includeContent: boolean;
      includeRelationships: boolean;
      includeMetadata: boolean;
    }
  ): Promise<string> {
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
        const relationshipsByType: Record<string, RuleRelationship[]> = {};
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
        let excerptLines: string[] = [];
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
      } catch (error) {
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
  private formatRuleType(type: string): string {
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
  private formatRelationshipType(type: string): string {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
} 