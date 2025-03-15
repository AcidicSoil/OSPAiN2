/**
 * Rule Organizer
 * 
 * Organizes rules into appropriate directories based on their types.
 * Implements the directory-based organization pattern for rule files.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { RuleType } from '../types';
import { RuleTypeManager } from '../manager/RuleTypeManager';

export class RuleOrganizer {
  private ruleTypeManager: RuleTypeManager;

  /**
   * Creates a new RuleOrganizer
   * 
   * @param ruleTypeManager The RuleTypeManager instance to use
   */
  constructor(ruleTypeManager: RuleTypeManager) {
    this.ruleTypeManager = ruleTypeManager;
  }

  /**
   * Organizes rules into appropriate directories based on their types
   * 
   * @param sourceDir Directory containing rule files to organize
   * @param targetDir Root directory where organized rules will be placed
   * @param dryRun If true, only report what would be done without making changes
   * @returns Information about the organization process
   */
  async organizeRulesByType(
    sourceDir: string, 
    targetDir: string, 
    dryRun = false
  ): Promise<{
    organized: number,
    skipped: number,
    errors: Array<{path: string, error: string}>
  }> {
    // Result tracking
    const result = {
      organized: 0,
      skipped: 0,
      errors: [] as Array<{path: string, error: string}>
    };

    try {
      // Create target directories
      if (!dryRun) {
        await this.createDirectories(targetDir);
      }

      // Find all .mdc files in the source directory
      const files = await this.ruleTypeManager.findMdcFiles(sourceDir);

      // Process each file
      for (const file of files) {
        try {
          // Get rule info to determine its type
          const ruleInfo = await this.ruleTypeManager.getRuleInfo(file);
          const ruleType = ruleInfo.currentType;

          // Determine target directory
          const destDir = this.getTargetDirectory(targetDir, ruleType);
          const destPath = path.join(destDir, path.basename(file));

          // Check if file already exists in the correct location
          if (file === destPath) {
            console.log(`Skipping ${file} - already in the correct location`);
            result.skipped++;
            continue;
          }

          // Move the file
          console.log(`Moving ${file} to ${destPath}`);
          if (!dryRun) {
            await this.moveFile(file, destPath);
          }
          result.organized++;
        } catch (error) {
          console.error(`Error processing ${file}:`, error);
          result.errors.push({
            path: file,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      return result;
    } catch (error) {
      console.error(`Failed to organize rules:`, error);
      throw error;
    }
  }

  /**
   * Organizes all rules in the source directory according to their content analysis
   * 
   * @param sourceDir Directory containing rule files to analyze and organize
   * @param targetDir Root directory where organized rules will be placed
   * @param dryRun If true, only report what would be done without making changes
   * @returns Information about the organization process
   */
  async organizeRulesByContent(
    sourceDir: string, 
    targetDir: string, 
    dryRun = false
  ): Promise<{
    organized: number,
    skipped: number,
    errors: Array<{path: string, error: string}>
  }> {
    // Result tracking
    const result = {
      organized: 0,
      skipped: 0,
      errors: [] as Array<{path: string, error: string}>
    };

    try {
      // Create target directories
      if (!dryRun) {
        await this.createDirectories(targetDir);
      }

      // Find all .mdc files in the source directory
      const files = await this.ruleTypeManager.findMdcFiles(sourceDir);

      // Process each file
      for (const file of files) {
        try {
          // Get rule info to analyze suggested type
          const ruleInfo = await this.ruleTypeManager.getRuleInfo(file);
          const ruleType = ruleInfo.suggestedType;

          // Determine target directory
          const destDir = this.getTargetDirectory(targetDir, ruleType);
          const destPath = path.join(destDir, path.basename(file));

          // Check if file already exists in the correct location
          if (file === destPath) {
            console.log(`Skipping ${file} - already in the correct location`);
            result.skipped++;
            continue;
          }

          // Move the file
          console.log(`Moving ${file} to ${destPath} (suggested type: ${ruleType})`);
          if (!dryRun) {
            await this.moveFile(file, destPath);
          }
          result.organized++;
        } catch (error) {
          console.error(`Error processing ${file}:`, error);
          result.errors.push({
            path: file,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      return result;
    } catch (error) {
      console.error(`Failed to organize rules:`, error);
      throw error;
    }
  }

  /**
   * Creates the directory structure for organized rules
   * 
   * @param targetDir Root directory where organized rules will be placed
   */
  private async createDirectories(targetDir: string): Promise<void> {
    const dirs = [
      path.join(targetDir, 'memory'),
      path.join(targetDir, 'rules', 'core'),
      path.join(targetDir, 'rules', 'conditional'),
      path.join(targetDir, 'user', 'custom')
    ];
    
    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /**
   * Gets the target directory for a rule based on its type
   * 
   * @param targetDir Root directory where organized rules will be placed
   * @param ruleType The type of the rule
   * @returns The full path to the target directory
   */
  private getTargetDirectory(targetDir: string, ruleType: RuleType): string {
    switch (ruleType) {
      case RuleType.AGENT_REQUESTED:
        return path.join(targetDir, 'memory');
      case RuleType.AUTO_APPLIED:
        return path.join(targetDir, 'rules', 'core');
      case RuleType.CONDITIONAL:
        return path.join(targetDir, 'rules', 'conditional');
      case RuleType.MANUAL:
      default:
        return path.join(targetDir, 'user', 'custom');
    }
  }

  /**
   * Moves a file to a new location
   * 
   * @param sourcePath Source file path
   * @param destPath Destination file path
   */
  private async moveFile(sourcePath: string, destPath: string): Promise<void> {
    // Ensure destination directory exists
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    
    // Copy the file first
    await fs.copyFile(sourcePath, destPath);
    
    // Verify the copy was successful
    const sourceStats = await fs.stat(sourcePath);
    const destStats = await fs.stat(destPath);
    
    if (sourceStats.size === destStats.size) {
      // Delete the original
      await fs.unlink(sourcePath);
    } else {
      throw new Error(`Copy verification failed for ${sourcePath}`);
    }
  }
} 