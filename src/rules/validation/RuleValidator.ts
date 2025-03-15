/**
 * Rule Validator
 * 
 * Validates rule configurations and updates to ensure they meet system requirements.
 */

import { 
  RuleFileInfo, 
  ValidationResult, 
  RuleUpdate,
  ValidationIssue
} from '../types';

export class RuleValidator {
  /**
   * Validates a rule update request
   * 
   * @param update The update request to validate
   * @returns Validation result
   */
  async validateUpdate(update: RuleUpdate): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    const suggestions: string[] = [];
    
    // Check for null or undefined path
    if (!update.path) {
      issues.push({
        severity: 'error',
        message: 'Rule path is required',
        location: 'update.path'
      });
      suggestions.push('Provide a valid file path');
    }
    
    // Check for unchanged type
    if (update.currentType === update.newType) {
      issues.push({
        severity: 'warning',
        message: 'Rule type is unchanged',
        location: update.path
      });
      suggestions.push('Only apply updates that change the rule type');
    }
    
    // Check for invalid path format
    if (update.path && !this.isValidPathFormat(update.path)) {
      issues.push({
        severity: 'error',
        message: 'Invalid path format',
        location: update.path
      });
      suggestions.push('Path should be a valid file path');
    }
    
    // Check for file existence (would be implemented in a real system)
    // For now, just demonstrating the pattern
    if (update.path && !await this.fileExists(update.path)) {
      issues.push({
        severity: 'error',
        message: 'File does not exist',
        location: update.path
      });
      suggestions.push('Verify file path is correct');
    }
    
    // Check for rule type compatibility with its path
    if (update.path && update.newType) {
      const pathCompatibilityIssue = this.checkPathTypeCompatibility(update.path, update.newType);
      if (pathCompatibilityIssue) {
        issues.push(pathCompatibilityIssue);
        suggestions.push('Consider using a different rule type that matches the file location');
      }
    }
    
    return {
      valid: issues.filter(i => i.severity === 'error').length === 0,
      issues,
      suggestions
    };
  }
  
  /**
   * Validates rule file information
   * 
   * @param ruleInfo Information about the rule to validate
   * @returns Validation result
   */
  async validateRuleInfo(ruleInfo: RuleFileInfo): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    const suggestions: string[] = [];
    
    // Check for null or undefined path
    if (!ruleInfo.path) {
      issues.push({
        severity: 'error',
        message: 'Rule path is required',
        location: 'ruleInfo.path'
      });
      suggestions.push('Provide a valid file path');
    }
    
    // Check for missing purpose
    if (!ruleInfo.purpose) {
      issues.push({
        severity: 'warning',
        message: 'Rule purpose is not defined',
        location: ruleInfo.path
      });
      suggestions.push('Add a description of the rule\'s purpose');
    }
    
    // Check for rule type compatibility with its path
    const pathCompatibilityIssue = this.checkPathTypeCompatibility(
      ruleInfo.path,
      ruleInfo.currentType
    );
    
    if (pathCompatibilityIssue) {
      issues.push(pathCompatibilityIssue);
      suggestions.push(
        'Consider moving the file to a location that matches its type',
        'Or update the rule type to match its location'
      );
    }
    
    // Check for divergence between current and suggested types
    if (ruleInfo.currentType !== ruleInfo.suggestedType) {
      issues.push({
        severity: 'info',
        message: `Rule type could be changed from ${ruleInfo.currentType} to ${ruleInfo.suggestedType}`,
        location: ruleInfo.path
      });
      suggestions.push(`Consider updating to the suggested type: ${ruleInfo.suggestedType}`);
    }
    
    return {
      valid: issues.filter(i => i.severity === 'error').length === 0,
      issues,
      suggestions
    };
  }
  
  /**
   * Checks if a path has a valid format
   * 
   * @param path The path to check
   * @returns Whether the path format is valid
   */
  private isValidPathFormat(path: string): boolean {
    // Basic path validation - would be more sophisticated in production
    return /^(?:\/[\w-]+)+\.\w+$/.test(path) || /^(?:[A-Za-z]:\\[\w-]+)+\.\w+$/.test(path);
  }
  
  /**
   * Checks if a file exists
   * 
   * @param path The path to check
   * @returns Whether the file exists
   */
  private async fileExists(path: string): Promise<boolean> {
    // This would use fs.promises.access in a real implementation
    // For now, just return true for demo purposes
    return Promise.resolve(true);
  }
  
  /**
   * Checks if a rule type is compatible with its file path
   * 
   * @param path The file path
   * @param type The rule type
   * @returns A validation issue if incompatible, null otherwise
   */
  private checkPathTypeCompatibility(path: string, type: string): ValidationIssue | null {
    // Path-based validation rules
    const pathTypeMap: Record<string, string[]> = {
      '/memory/': ['agent_requested'],
      '/rules/core/': ['auto_applied'],
      '/rules/conditional/': ['conditional'],
      '/user/custom/': ['manual']
    };
    
    for (const [pathPattern, validTypes] of Object.entries(pathTypeMap)) {
      if (path.includes(pathPattern) && !validTypes.includes(type)) {
        return {
          severity: 'warning',
          message: `Rule type '${type}' may not be appropriate for path containing '${pathPattern}'`,
          location: path
        };
      }
    }
    
    return null;
  }
} 