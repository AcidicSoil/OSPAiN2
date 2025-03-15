/**
 * Rule Type Manager
 * 
 * Core class responsible for managing rule types in the Sovereign AI ecosystem.
 * Handles updating, validating, and monitoring rule configurations.
 */

import { 
  RuleType, 
  RuleFileInfo, 
  ValidationResult,
  RuleUpdate,
  UpdateResult,
  PerformanceMetrics,
  UsagePattern 
} from '../types';
import { RuleValidator } from '../validation/RuleValidator';
import * as fs from 'fs/promises';
import * as path from 'path';

export class RuleTypeManager {
  private validator: RuleValidator;
  private monitoringStartTime: number | null = null;
  private processedRules: Set<string> = new Set();

  constructor() {
    this.validator = new RuleValidator();
  }

  /**
   * Updates the type of a specific rule file
   * 
   * @param filePath Path to the rule file
   * @param newType New rule type to apply
   * @returns Promise resolving when the update is complete
   */
  async updateRuleType(filePath: string, newType: RuleType): Promise<void> {
    try {
      // Get current rule info
      const ruleInfo = await this.getRuleInfo(filePath);
      
      // Create update request
      const update: RuleUpdate = {
        path: filePath,
        currentType: ruleInfo.currentType,
        newType: newType,
        reason: 'Manual update request'
      };
      
      // Validate update
      const validationResult = await this.validator.validateUpdate(update);
      
      if (!validationResult.valid) {
        throw new Error(`Invalid update: ${validationResult.issues.map(i => i.message).join(', ')}`);
      }
      
      // Apply update
      await this.applyUpdate(update);
      
      // Track for monitoring
      this.processedRules.add(filePath);
    } catch (error) {
      console.error(`Failed to update rule type for ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Validates the configuration of a rule file
   * 
   * @param filePath Path to the rule file
   * @returns Validation result
   */
  async validateConfiguration(filePath: string): Promise<ValidationResult> {
    try {
      const ruleInfo = await this.getRuleInfo(filePath);
      return this.validator.validateRuleInfo(ruleInfo);
    } catch (error) {
      console.error(`Failed to validate configuration for ${filePath}:`, error);
      return {
        valid: false,
        issues: [{
          severity: 'error',
          message: `Validation failed: ${error instanceof Error ? error.message : String(error)}`,
          location: filePath
        }],
        suggestions: ['Check file access permissions', 'Verify file exists']
      };
    }
  }

  /**
   * Applies multiple rule updates in batch
   * 
   * @param updates Array of rule updates to apply
   * @returns Result of the update operation
   */
  async applyBulkUpdates(updates: RuleUpdate[]): Promise<UpdateResult> {
    const result: UpdateResult = {
      success: true,
      updatedFiles: [],
      failedFiles: [],
      issues: []
    };

    // Start monitoring for this operation
    this.startMonitoring();

    try {
      // Process updates in parallel with a concurrency limit
      const concurrencyLimit = 5;
      const chunks = this.chunkArray(updates, concurrencyLimit);

      for (const chunk of chunks) {
        const updatePromises = chunk.map(async (update) => {
          try {
            // Validate first
            const validationResult = await this.validator.validateUpdate(update);
            
            if (!validationResult.valid) {
              result.failedFiles.push(update.path);
              result.issues.push(...validationResult.issues);
              return false;
            }
            
            // Apply update
            await this.applyUpdate(update);
            result.updatedFiles.push(update.path);
            this.processedRules.add(update.path);
            return true;
          } catch (error) {
            console.error(`Failed to apply update for ${update.path}:`, error);
            result.failedFiles.push(update.path);
            result.issues.push({
              severity: 'error',
              message: `Update failed: ${error instanceof Error ? error.message : String(error)}`,
              location: update.path
            });
            return false;
          }
        });

        const results = await Promise.all(updatePromises);
        if (results.some(r => !r)) {
          result.success = false;
        }
      }

      return result;
    } catch (error) {
      console.error('Bulk update failed:', error);
      result.success = false;
      result.issues.push({
        severity: 'error',
        message: `Bulk update failed: ${error instanceof Error ? error.message : String(error)}`,
        location: 'bulk update operation'
      });
      return result;
    }
  }

  /**
   * Monitors rule processing performance
   * 
   * @param duration Duration in milliseconds to monitor
   * @returns Performance metrics
   */
  async monitorPerformance(duration: number): Promise<PerformanceMetrics> {
    this.startMonitoring();
    
    // Wait for the specified duration
    await new Promise(resolve => setTimeout(resolve, duration));
    
    // Calculate metrics
    const endTime = Date.now();
    const memoryUsage = process.memoryUsage();
    
    const metrics: PerformanceMetrics = {
      processingTime: (endTime - (this.monitoringStartTime || endTime)),
      rulesProcessed: this.processedRules.size,
      memoryUsage: memoryUsage.heapUsed,
      bottlenecks: []
    };
    
    // Identify bottlenecks
    if (metrics.processingTime > 5000 && metrics.rulesProcessed < 10) {
      metrics.bottlenecks.push('Slow rule processing detected');
    }
    
    if (memoryUsage.heapUsed > 200 * 1024 * 1024) {
      metrics.bottlenecks.push('High memory usage detected');
    }
    
    return metrics;
  }

  /**
   * Lists all rule files in a directory with their types
   * 
   * @param directory The directory to scan
   * @param recursive Whether to scan recursively
   * @returns A list of rule file information
   */
  async listRuleFiles(directory: string, recursive = true): Promise<RuleFileInfo[]> {
    try {
      const files = await this.findMdcFiles(directory, recursive);
      const ruleInfoPromises = files.map(file => this.getRuleInfo(file));
      return await Promise.all(ruleInfoPromises);
    } catch (error) {
      console.error(`Failed to list rule files in ${directory}:`, error);
      throw error;
    }
  }

  /**
   * Finds all .mdc files in a directory
   * 
   * @param directory The directory to scan
   * @param recursive Whether to scan recursively
   * @returns A list of file paths
   */
  async findMdcFiles(directory: string, recursive = true): Promise<string[]> {
    try {
      const files: string[] = [];
      const entries = await fs.readdir(directory, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        
        if (entry.isDirectory() && recursive) {
          const subDirFiles = await this.findMdcFiles(fullPath, recursive);
          files.push(...subDirFiles);
        } else if (entry.isFile() && entry.name.endsWith('.mdc')) {
          files.push(fullPath);
        }
      }
      
      return files;
    } catch (error) {
      console.error(`Failed to find .mdc files in ${directory}:`, error);
      throw error;
    }
  }

  /**
   * Starts performance monitoring
   */
  private startMonitoring(): void {
    if (!this.monitoringStartTime) {
      this.monitoringStartTime = Date.now();
      this.processedRules.clear();
    }
  }

  /**
   * Gets information about a rule file
   * 
   * @param filePath Path to the rule file
   * @returns Rule file information
   */
  async getRuleInfo(filePath: string): Promise<RuleFileInfo> {
    try {
      // Read file content
      const content = await this.readRuleContent(filePath);
      
      // Parse metadata
      const metadata = await this.parseRuleMetadata(content);
      
      // Extract purpose from content
      const purpose = this.extractPurpose(content);
      
      // Determine current type based on metadata or file path
      const currentType = metadata.type ? 
        this.parseRuleType(metadata.type) : 
        this.determineCurrentType(filePath);
      
      // Determine suggested type based on content analysis
      const suggestedType = this.analyzeSuggestedType(content, filePath);
      
      // Extract dependencies
      const dependencies = this.extractDependencies(content);
      
      // Determine usage patterns
      const usagePatterns = this.analyzeUsagePatterns(content);
      
      return {
        path: filePath,
        currentType,
        suggestedType,
        purpose,
        dependencies,
        usagePatterns
      };
    } catch (error) {
      console.error(`Failed to get rule info for ${filePath}:`, error);
      
      // Return minimal info for non-existent files
      return {
        path: filePath,
        currentType: RuleType.MANUAL,
        suggestedType: RuleType.MANUAL,
        purpose: 'File could not be read',
        dependencies: [],
        usagePatterns: []
      };
    }
  }

  /**
   * Reads the content of a rule file
   * 
   * @param filePath Path to the rule file
   * @returns The file content
   */
  private async readRuleContent(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf8');
    } catch (error) {
      throw new Error(`Failed to read rule file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Parses metadata from rule content
   * 
   * @param content The rule content
   * @returns Parsed metadata
   */
  private async parseRuleMetadata(content: string): Promise<Record<string, any>> {
    // Extract metadata from rule content using regex or parser
    const metadataMatch = content.match(/---\s+([\s\S]*?)\s+---/);
    if (!metadataMatch || !metadataMatch[1]) return {};
    
    // Parse YAML or JSON metadata block
    try {
      // Simple key-value parsing
      const metadata: Record<string, any> = {};
      const lines = metadataMatch[1].split('\n');
      for (const line of lines) {
        const [key, value] = line.split(':').map(s => s.trim());
        if (key && value) metadata[key] = value;
      }
      return metadata;
    } catch (error) {
      console.error('Failed to parse metadata:', error);
      return {};
    }
  }

  /**
   * Extracts the purpose from rule content
   * 
   * @param content The rule content
   * @returns The extracted purpose
   */
  private extractPurpose(content: string): string {
    // Try to find a purpose in the content
    // First try to find a heading
    const headingMatch = content.match(/^#\s+(.*?)$/m);
    if (headingMatch && headingMatch[1]) {
      return headingMatch[1].trim();
    }
    
    // Try to find the first non-metadata paragraph
    const cleanContent = content.replace(/---\s+[\s\S]*?\s+---/g, '').trim();
    const paragraphMatch = cleanContent.match(/^(.+?)(?:\n\n|\n$|$)/);
    if (paragraphMatch && paragraphMatch[1]) {
      return paragraphMatch[1].trim();
    }
    
    return 'No purpose description found';
  }

  /**
   * Extracts dependencies from rule content
   * 
   * @param content The rule content
   * @returns A list of dependencies
   */
  private extractDependencies(content: string): string[] {
    const dependencies: string[] = [];
    
    // Look for explicit dependency declarations
    const dependencyMatches = content.matchAll(/depends(?:\s+on)?:\s+([^\n]+)/gi);
    for (const match of dependencyMatches) {
      if (match[1]) {
        const deps = match[1].split(',').map(d => d.trim());
        dependencies.push(...deps);
      }
    }
    
    // Look for file references in the content
    const fileRefMatches = content.matchAll(/\b([\w-]+\.mdc)\b/g);
    for (const match of fileRefMatches) {
      if (match[1] && !dependencies.includes(match[1])) {
        dependencies.push(match[1]);
      }
    }
    
    return dependencies;
  }

  /**
   * Analyzes usage patterns from rule content
   * 
   * @param content The rule content
   * @returns A list of usage patterns
   */
  private analyzeUsagePatterns(content: string): UsagePattern[] {
    const patterns: UsagePattern[] = [];
    
    // Check for direct usage patterns
    if (content.includes('alwaysApply: true')) {
      patterns.push({
        type: 'direct',
        location: 'global',
        frequency: 1
      });
    }
    
    // Check for referenced usage
    if (content.match(/referenced\s+by|used\s+by/i)) {
      patterns.push({
        type: 'referenced',
        location: 'external',
        frequency: 1
      });
    }
    
    // Check for imported usage
    if (content.match(/import|include/i)) {
      patterns.push({
        type: 'imported',
        location: 'internal',
        frequency: 1
      });
    }
    
    return patterns;
  }

  /**
   * Determines the current type of a rule based on its path or content
   * 
   * @param filePath Path to the rule file
   * @returns The current rule type
   */
  private determineCurrentType(filePath: string): RuleType {
    // Path-based determination
    if (filePath.includes('/memory/')) {
      return RuleType.AGENT_REQUESTED;
    } else if (filePath.includes('/rules/core/')) {
      return RuleType.AUTO_APPLIED;
    } else if (filePath.includes('/rules/conditional/')) {
      return RuleType.CONDITIONAL;
    } else if (filePath.includes('/user/custom/')) {
      return RuleType.MANUAL;
    }
    
    // Default to manual
    return RuleType.MANUAL;
  }

  /**
   * Parses a rule type string into a RuleType enum value
   * 
   * @param typeStr The rule type as a string
   * @returns The corresponding RuleType enum value
   */
  private parseRuleType(typeStr: string): RuleType {
    typeStr = typeStr.toLowerCase();
    
    if (typeStr === 'agent_requested' || typeStr === 'agent-requested') {
      return RuleType.AGENT_REQUESTED;
    } else if (typeStr === 'auto_applied' || typeStr === 'auto-applied') {
      return RuleType.AUTO_APPLIED;
    } else if (typeStr === 'conditional') {
      return RuleType.CONDITIONAL;
    } else {
      return RuleType.MANUAL;
    }
  }

  /**
   * Analyzes content to suggest an optimal rule type
   * 
   * @param content The rule content
   * @param filePath The file path
   * @returns The suggested rule type
   */
  private analyzeSuggestedType(content: string, filePath: string): RuleType {
    // Check for explicit type hints in content
    if (content.match(/type:\s*agent[_-]requested/i)) {
      return RuleType.AGENT_REQUESTED;
    } else if (content.match(/type:\s*auto[_-]applied/i)) {
      return RuleType.AUTO_APPLIED;
    } else if (content.match(/type:\s*conditional/i)) {
      return RuleType.CONDITIONAL;
    } else if (content.match(/type:\s*manual/i)) {
      return RuleType.MANUAL;
    }
    
    // Analysis based on content patterns
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('always apply') || lowerContent.includes('alwaysapply: true')) {
      return RuleType.AUTO_APPLIED;
    }
    
    if (lowerContent.includes('memory') || lowerContent.includes('context')) {
      return RuleType.AGENT_REQUESTED;
    }
    
    if (lowerContent.includes('conditional') || lowerContent.includes('when') || lowerContent.includes('if ')) {
      return RuleType.CONDITIONAL;
    }
    
    // Default to the same as the current type based on path
    return this.determineCurrentType(filePath);
  }

  /**
   * Applies a rule update
   * 
   * @param update The update to apply
   */
  private async applyUpdate(update: RuleUpdate): Promise<void> {
    try {
      // Read the current content
      const content = await this.readRuleContent(update.path);
      
      // Parse metadata
      const metadata = await this.parseRuleMetadata(content);
      
      // Update the type in metadata
      metadata.type = update.newType;
      
      // Serialize the updated metadata
      const metadataStr = Object.entries(metadata)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      
      // Replace metadata in content
      let updatedContent: string;
      const metadataMatch = content.match(/---\s+([\s\S]*?)\s+---/);
      
      if (metadataMatch) {
        // Replace existing metadata
        updatedContent = content.replace(
          /---\s+([\s\S]*?)\s+---/,
          `---\n${metadataStr}\n---`
        );
      } else {
        // Add metadata at the beginning
        updatedContent = `---\ntype: ${update.newType}\n---\n\n${content}`;
      }
      
      // Write the updated content back to the file
      await fs.writeFile(update.path, updatedContent, 'utf8');
      
      console.log(`Updated rule type for ${update.path} to ${update.newType}`);
    } catch (error) {
      throw new Error(`Failed to apply update: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Splits an array into chunks for parallel processing
   * 
   * @param array The array to split
   * @param chunkSize The maximum size of each chunk
   * @returns Array of chunks
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
} 