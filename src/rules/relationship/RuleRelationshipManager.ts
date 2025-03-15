/**
 * Rule Relationship Manager
 * 
 * Manages relationships between rules in the Sovereign AI ecosystem.
 * Enables tracking dependencies, extensions, and conflicts between rules.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { RuleRelationship, RuleFileInfo } from '../types';
import { RuleTypeManager } from '../manager/RuleTypeManager';

export class RuleRelationshipManager {
  private relationships: RuleRelationship[] = [];
  private ruleTypeManager: RuleTypeManager;
  private relationshipFile: string | null = null;

  /**
   * Creates a new RuleRelationshipManager
   * 
   * @param ruleTypeManager The RuleTypeManager instance to use
   * @param relationshipFile Optional path to persist relationships
   */
  constructor(ruleTypeManager: RuleTypeManager, relationshipFile?: string) {
    this.ruleTypeManager = ruleTypeManager;
    this.relationshipFile = relationshipFile || null;
  }

  /**
   * Initializes the relationship manager by loading saved relationships
   */
  async initialize(): Promise<void> {
    if (this.relationshipFile) {
      try {
        await this.loadRelationships();
      } catch (error) {
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
  async addRelationship(relationship: RuleRelationship): Promise<void> {
    // Check if relationship already exists
    const existingIndex = this.relationships.findIndex(r => 
      r.sourceRule === relationship.sourceRule && 
      r.targetRule === relationship.targetRule && 
      r.relationshipType === relationship.relationshipType
    );

    if (existingIndex >= 0) {
      // Update existing relationship
      this.relationships[existingIndex] = relationship;
    } else {
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
  async removeRelationship(sourceRule: string, targetRule: string, relationshipType?: string): Promise<void> {
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
  getRelatedRules(rulePath: string): RuleRelationship[] {
    return this.relationships.filter(r => 
      r.sourceRule === rulePath || r.targetRule === rulePath
    );
  }

  /**
   * Gets all incoming relationships for a rule
   * 
   * @param rulePath The rule path
   * @returns Relationships where the rule is the target
   */
  getIncomingRelationships(rulePath: string): RuleRelationship[] {
    return this.relationships.filter(r => r.targetRule === rulePath);
  }

  /**
   * Gets all outgoing relationships for a rule
   * 
   * @param rulePath The rule path
   * @returns Relationships where the rule is the source
   */
  getOutgoingRelationships(rulePath: string): RuleRelationship[] {
    return this.relationships.filter(r => r.sourceRule === rulePath);
  }

  /**
   * Gets a graph representation of the relationships
   * 
   * @returns An adjacency list representation of the relationship graph
   */
  getRelationshipGraph(): Record<string, string[]> {
    const graph: Record<string, string[]> = {};
    
    for (const rel of this.relationships) {
      if (!graph[rel.sourceRule]) graph[rel.sourceRule] = [];
      graph[rel.sourceRule].push(rel.targetRule);
    }
    
    return graph;
  }

  /**
   * Auto-discovers relationships between rules by analyzing their content
   * 
   * @param directory The directory containing rule files
   */
  async discoverRelationships(directory: string): Promise<RuleRelationship[]> {
    try {
      // Get all rule files
      const rules = await this.ruleTypeManager.listRuleFiles(directory, true);
      
      // Clear existing relationships
      this.relationships = [];
      
      // Create a lookup map for quick access
      const rulesByPath: Record<string, RuleFileInfo> = {};
      rules.forEach(rule => {
        rulesByPath[rule.path] = rule;
      });
      
      // Discover relationships
      const discovered: RuleRelationship[] = [];
      
      for (const rule of rules) {
        // Check dependencies
        for (const dep of rule.dependencies) {
          // Try to find the full path of the dependency
          const depRule = this.findRuleByName(dep, rules);
          
          if (depRule) {
            const relationship: RuleRelationship = {
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
          if (rule.path === otherRule.path) continue;
          
          // Check if names suggest an extension relationship
          const ruleName = path.basename(rule.path, '.mdc');
          const otherName = path.basename(otherRule.path, '.mdc');
          
          if (otherName.includes(ruleName) || ruleName.includes(otherName)) {
            // Names suggest a relationship
            const relationship: RuleRelationship = {
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
            const relationship: RuleRelationship = {
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
    } catch (error) {
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
  private findRuleByName(name: string, rules: RuleFileInfo[]): RuleFileInfo | undefined {
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
  private async loadRelationships(): Promise<void> {
    if (!this.relationshipFile) return;
    
    const content = await fs.readFile(this.relationshipFile, 'utf8');
    this.relationships = JSON.parse(content);
  }

  /**
   * Saves relationships to the persisted file
   */
  private async saveRelationships(): Promise<void> {
    if (!this.relationshipFile) return;
    
    const content = JSON.stringify(this.relationships, null, 2);
    await fs.writeFile(this.relationshipFile, content, 'utf8');
  }
} 