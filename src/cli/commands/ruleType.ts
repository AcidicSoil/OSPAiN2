/**
 * Rule Type CLI Command
 * 
 * Provides CLI commands for managing rule types.
 */

import { Command } from 'commander';
import { 
  RuleTypeManager, 
  RuleType,
  RuleRelationshipManager,
  RuleOrganizer,
  RuleDocumentationGenerator,
  RuleMatrixVisualizer,
  KnowledgeGraph
} from '../../rules';
import chalk from 'chalk';
import * as path from 'path';

const manager = new RuleTypeManager();
const relationshipManager = new RuleRelationshipManager(manager, '.rules-relationships.json');
const organizer = new RuleOrganizer(manager);
const documentationGenerator = new RuleDocumentationGenerator(manager, relationshipManager);
const visualizer = new RuleMatrixVisualizer();

/**
 * Configures the rule type commands
 * 
 * @param program The commander program
 */
export function configureRuleTypeCommand(program: Command): void {
  const ruleCommand = program
    .command('rule')
    .description('Manage rule configurations');

  ruleCommand
    .command('list')
    .description('List rule files and their types')
    .option('-p, --path <path>', 'Filter by path pattern')
    .option('-t, --type <type>', 'Filter by rule type')
    .option('-d, --directory <directory>', 'Directory to search for rules', '.cursor')
    .action(async (options) => {
      try {
        console.log(chalk.blue(`Listing rule files in ${options.directory}...`));
        
        const rules = await manager.listRuleFiles(options.directory || '.cursor');
        
        // Apply filters
        let filteredRules = rules;
        if (options.path) {
          filteredRules = filteredRules.filter(r => r.path.includes(options.path));
        }
        if (options.type) {
          filteredRules = filteredRules.filter(r => r.currentType.includes(options.type));
        }
        
        // Display rules
        console.log(`\nFound ${filteredRules.length} rules:`);
        
        // Group by type
        const rulesByType: Record<string, typeof filteredRules> = {};
        filteredRules.forEach(rule => {
          if (!rulesByType[rule.currentType]) {
            rulesByType[rule.currentType] = [];
          }
          rulesByType[rule.currentType].push(rule);
        });
        
        // Display grouped by type
        for (const [type, rules] of Object.entries(rulesByType)) {
          console.log(chalk.yellow(`\n${formatRuleType(type)} Rules (${rules.length}):`));
          
          rules.forEach(rule => {
            const hasWarning = rule.currentType !== rule.suggestedType;
            const icon = hasWarning ? chalk.yellow('!') : chalk.green('✓');
            
            console.log(`${icon} ${chalk.white(rule.path)}`);
            console.log(`   Purpose: ${chalk.cyan(rule.purpose.substring(0, 100) + (rule.purpose.length > 100 ? '...' : ''))}`);
            
            if (hasWarning) {
              console.log(`   ${chalk.yellow(`Suggested Type: ${formatRuleType(rule.suggestedType)}`)}`);
            }
          });
        }
      } catch (error) {
        console.error(chalk.red(`Error listing rules: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });

  ruleCommand
    .command('update')
    .description('Update a rule type')
    .requiredOption('-p, --path <path>', 'Path to the rule file')
    .requiredOption('-t, --type <type>', 'New rule type (manual, agent_requested, auto_applied, conditional)')
    .action(async (options) => {
      try {
        const validTypes = Object.values(RuleType);
        if (!validTypes.includes(options.type as RuleType)) {
          throw new Error(`Invalid rule type. Must be one of: ${validTypes.join(', ')}`);
        }

        console.log(chalk.blue(`Updating rule ${options.path} to type ${options.type}...`));
        await manager.updateRuleType(options.path, options.type as RuleType);
        console.log(chalk.green('Rule updated successfully!'));
      } catch (error) {
        console.error(chalk.red(`Error updating rule: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });

  ruleCommand
    .command('validate')
    .description('Validate a rule configuration')
    .requiredOption('-p, --path <path>', 'Path to the rule file')
    .action(async (options) => {
      try {
        console.log(chalk.blue(`Validating rule ${options.path}...`));
        const result = await manager.validateConfiguration(options.path);
        
        if (result.valid) {
          console.log(chalk.green('✓ Rule configuration is valid'));
        } else {
          console.log(chalk.yellow('⚠ Rule configuration has issues:'));
          result.issues.forEach(issue => {
            const color = issue.severity === 'error' ? chalk.red :
                          issue.severity === 'warning' ? chalk.yellow :
                          chalk.blue;
            console.log(`  ${color(issue.severity.toUpperCase())}: ${issue.message} [${issue.location}]`);
          });
          
          if (result.suggestions.length > 0) {
            console.log(chalk.cyan('\nSuggestions:'));
            result.suggestions.forEach(suggestion => {
              console.log(`  - ${suggestion}`);
            });
          }
        }
      } catch (error) {
        console.error(chalk.red(`Error validating rule: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });

  ruleCommand
    .command('batch-update')
    .description('Update multiple rules at once')
    .requiredOption('-c, --config <path>', 'Path to the configuration file (JSON)')
    .action(async (options) => {
      try {
        console.log(chalk.blue(`Batch updating rules from config ${options.config}...`));
        console.log(chalk.yellow('This is a placeholder. In a real implementation, this would read a config file.'));
        
        // Mock updates for demonstration
        const mockUpdates = [
          {
            path: '/rules/core/example1.mdc',
            currentType: RuleType.MANUAL,
            newType: RuleType.AUTO_APPLIED,
            reason: 'Standardizing core rules'
          },
          {
            path: '/memory/example2.mdc',
            currentType: RuleType.AUTO_APPLIED,
            newType: RuleType.AGENT_REQUESTED,
            reason: 'Moving to appropriate type for memory rules'
          }
        ];
        
        const result = await manager.applyBulkUpdates(mockUpdates);
        
        if (result.success) {
          console.log(chalk.green(`✓ Successfully updated ${result.updatedFiles.length} rules`));
          result.updatedFiles.forEach(file => {
            console.log(`  - ${chalk.white(file)}`);
          });
        } else {
          console.log(chalk.yellow(`⚠ Updated ${result.updatedFiles.length} rules with some failures`));
          console.log(chalk.green('\nSuccessful updates:'));
          result.updatedFiles.forEach(file => {
            console.log(`  - ${chalk.white(file)}`);
          });
          
          console.log(chalk.red('\nFailed updates:'));
          result.failedFiles.forEach(file => {
            console.log(`  - ${chalk.white(file)}`);
          });
          
          if (result.issues.length > 0) {
            console.log(chalk.red('\nIssues:'));
            result.issues.forEach(issue => {
              console.log(`  ${issue.severity.toUpperCase()}: ${issue.message} [${issue.location}]`);
            });
          }
        }
      } catch (error) {
        console.error(chalk.red(`Error in batch update: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });

  ruleCommand
    .command('monitor')
    .description('Monitor rule processing performance')
    .option('-d, --duration <ms>', 'Monitoring duration in milliseconds', '5000')
    .action(async (options) => {
      try {
        const duration = parseInt(options.duration, 10);
        if (isNaN(duration) || duration <= 0) {
          throw new Error('Duration must be a positive number');
        }
        
        console.log(chalk.blue(`Monitoring performance for ${duration}ms...`));
        
        // Process some rules to have something to monitor
        await manager.updateRuleType('/rules/core/example1.mdc', RuleType.AUTO_APPLIED);
        await manager.updateRuleType('/memory/example2.mdc', RuleType.AGENT_REQUESTED);
        
        const metrics = await manager.monitorPerformance(duration);
        
        console.log(chalk.green('\nPerformance Metrics:'));
        console.log(`  Processing Time: ${chalk.cyan(metrics.processingTime)}ms`);
        console.log(`  Rules Processed: ${chalk.cyan(metrics.rulesProcessed)}`);
        console.log(`  Memory Usage: ${chalk.cyan(Math.round(metrics.memoryUsage / 1024 / 1024))}MB`);
        
        if (metrics.bottlenecks.length > 0) {
          console.log(chalk.yellow('\nPotential Bottlenecks:'));
          metrics.bottlenecks.forEach(bottleneck => {
            console.log(`  - ${bottleneck}`);
          });
        }
      } catch (error) {
        console.error(chalk.red(`Error monitoring performance: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });

  // Organization commands
  ruleCommand
    .command('organize')
    .description('Organize rules into directories based on their types')
    .requiredOption('-s, --source <path>', 'Source directory containing rule files')
    .requiredOption('-t, --target <path>', 'Target directory where organized rules will be placed')
    .option('-d, --dry-run', 'Run without making changes', false)
    .option('-c, --content-based', 'Organize based on content analysis rather than current type', false)
    .action(async (options) => {
      try {
        console.log(chalk.blue(`Organizing rules from ${options.source} to ${options.target}...`));
        if (options.dryRun) {
          console.log(chalk.yellow('Dry run mode - no changes will be made'));
        }
        
        const result = options.contentBased 
          ? await organizer.organizeRulesByContent(options.source, options.target, options.dryRun)
          : await organizer.organizeRulesByType(options.source, options.target, options.dryRun);
        
        console.log(chalk.green(`\nOrganization complete:`));
        console.log(`  Organized: ${chalk.cyan(result.organized)}`);
        console.log(`  Skipped: ${chalk.cyan(result.skipped)}`);
        
        if (result.errors.length > 0) {
          console.log(chalk.red('\nErrors:'));
          result.errors.forEach(error => {
            console.log(`  - ${chalk.white(error.path)}: ${error.error}`);
          });
        }
      } catch (error) {
        console.error(chalk.red(`Error organizing rules: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });

  // Relationship commands
  const relationshipCommand = ruleCommand
    .command('relationship')
    .description('Manage relationships between rules');

  relationshipCommand
    .command('discover')
    .description('Auto-discover relationships between rules')
    .requiredOption('-d, --directory <path>', 'Directory containing rule files')
    .action(async (options) => {
      try {
        console.log(chalk.blue(`Discovering relationships between rules in ${options.directory}...`));
        
        // Initialize relationship manager
        await relationshipManager.initialize();
        
        // Discover relationships
        const relationships = await relationshipManager.discoverRelationships(options.directory);
        
        console.log(chalk.green(`\nDiscovered ${relationships.length} relationships:`));
        
        // Group by relationship type
        const relationshipsByType: Record<string, number> = {};
        relationships.forEach(rel => {
          relationshipsByType[rel.relationshipType] = (relationshipsByType[rel.relationshipType] || 0) + 1;
        });
        
        // Display counts by type
        Object.entries(relationshipsByType).forEach(([type, count]) => {
          console.log(`  ${formatRelationshipType(type)}: ${chalk.cyan(count)}`);
        });
        
        // Show a few examples
        if (relationships.length > 0) {
          console.log(chalk.yellow('\nExamples:'));
          relationships.slice(0, 5).forEach(rel => {
            console.log(`  - ${chalk.white(path.basename(rel.sourceRule))} ${formatRelationshipType(rel.relationshipType)} ${chalk.white(path.basename(rel.targetRule))}`);
          });
          
          if (relationships.length > 5) {
            console.log(`  ... and ${relationships.length - 5} more`);
          }
        }
      } catch (error) {
        console.error(chalk.red(`Error discovering relationships: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });

  relationshipCommand
    .command('add')
    .description('Add a relationship between two rules')
    .requiredOption('-s, --source <path>', 'Source rule path')
    .requiredOption('-t, --target <path>', 'Target rule path')
    .requiredOption('-r, --relationship <type>', 'Relationship type (depends-on, extends, complements, conflicts-with)')
    .option('-d, --description <text>', 'Description of the relationship')
    .option('--strength <value>', 'Strength of the relationship (0-1)', '0.8')
    .action(async (options) => {
      try {
        console.log(chalk.blue(`Adding relationship: ${options.source} ${options.relationship} ${options.target}...`));
        
        // Initialize relationship manager
        await relationshipManager.initialize();
        
        // Validate relationship type
        const validTypes = ['depends-on', 'extends', 'complements', 'conflicts-with'];
        if (!validTypes.includes(options.relationship)) {
          throw new Error(`Invalid relationship type. Must be one of: ${validTypes.join(', ')}`);
        }
        
        // Validate strength
        const strength = parseFloat(options.strength);
        if (isNaN(strength) || strength < 0 || strength > 1) {
          throw new Error('Strength must be a number between 0 and 1');
        }
        
        // Add relationship
        await relationshipManager.addRelationship({
          sourceRule: options.source,
          targetRule: options.target,
          relationshipType: options.relationship as any,
          strength,
          description: options.description
        });
        
        console.log(chalk.green('Relationship added successfully!'));
      } catch (error) {
        console.error(chalk.red(`Error adding relationship: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });

  relationshipCommand
    .command('remove')
    .description('Remove a relationship between two rules')
    .requiredOption('-s, --source <path>', 'Source rule path')
    .requiredOption('-t, --target <path>', 'Target rule path')
    .option('-r, --relationship <type>', 'Relationship type (depends-on, extends, complements, conflicts-with)')
    .action(async (options) => {
      try {
        console.log(chalk.blue(`Removing relationship: ${options.source} ${options.relationship || 'any'} ${options.target}...`));
        
        // Initialize relationship manager
        await relationshipManager.initialize();
        
        // Remove relationship
        await relationshipManager.removeRelationship(
          options.source,
          options.target,
          options.relationship
        );
        
        console.log(chalk.green('Relationship removed successfully!'));
      } catch (error) {
        console.error(chalk.red(`Error removing relationship: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });

  relationshipCommand
    .command('list')
    .description('List relationships for a rule')
    .requiredOption('-r, --rule <path>', 'Rule path')
    .action(async (options) => {
      try {
        console.log(chalk.blue(`Listing relationships for ${options.rule}...`));
        
        // Initialize relationship manager
        await relationshipManager.initialize();
        
        // Get relationships
        const relationships = relationshipManager.getRelatedRules(options.rule);
        
        console.log(chalk.green(`\nFound ${relationships.length} relationships:`));
        
        // Group by relationship type
        const incoming = relationshipManager.getIncomingRelationships(options.rule);
        const outgoing = relationshipManager.getOutgoingRelationships(options.rule);
        
        if (outgoing.length > 0) {
          console.log(chalk.yellow('\nOutgoing Relationships:'));
          outgoing.forEach(rel => {
            console.log(`  - ${formatRelationshipType(rel.relationshipType)} ${chalk.white(path.basename(rel.targetRule))}`);
            if (rel.description) {
              console.log(`    ${chalk.gray(rel.description)}`);
            }
          });
        }
        
        if (incoming.length > 0) {
          console.log(chalk.yellow('\nIncoming Relationships:'));
          incoming.forEach(rel => {
            console.log(`  - ${chalk.white(path.basename(rel.sourceRule))} ${formatRelationshipType(rel.relationshipType)}`);
            if (rel.description) {
              console.log(`    ${chalk.gray(rel.description)}`);
            }
          });
        }
      } catch (error) {
        console.error(chalk.red(`Error listing relationships: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });

  // Documentation commands
  ruleCommand
    .command('document')
    .description('Generate documentation for rules')
    .requiredOption('-d, --directory <path>', 'Directory containing rule files')
    .requiredOption('-o, --output <path>', 'Output file path')
    .option('-c, --include-content', 'Include content excerpts', false)
    .option('-r, --include-relationships', 'Include relationships', true)
    .option('-g, --group-by-type', 'Group rules by type', true)
    .option('-m, --include-metadata', 'Include metadata', true)
    .action(async (options) => {
      try {
        console.log(chalk.blue(`Generating documentation for rules in ${options.directory}...`));
        
        // Initialize relationship manager
        await relationshipManager.initialize();
        
        // Generate documentation
        const result = await documentationGenerator.generateDocumentation(
          options.directory,
          options.output,
          {
            includeContent: options.includeContent,
            includeRelationships: options.includeRelationships,
            groupByType: options.groupByType,
            includeMetadata: options.includeMetadata
          }
        );
        
        console.log(chalk.green(`\nDocumentation generated successfully!`));
        console.log(`  Rules documented: ${chalk.cyan(result.rulesDocumented)}`);
        console.log(`  Relationships documented: ${chalk.cyan(result.relationshipsDocumented)}`);
        
        console.log(chalk.yellow('\nRule counts by type:'));
        Object.entries(result.byType).forEach(([type, count]) => {
          console.log(`  ${formatRuleType(type)}: ${chalk.cyan(count)}`);
        });
        
        console.log(chalk.green(`\nDocumentation written to ${options.output}`));
      } catch (error) {
        console.error(chalk.red(`Error generating documentation: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });

  ruleCommand
    .command('visualize')
    .description('Generate a visualization of the rule matrix')
    .option('-d, --directory <directory>', 'Directory to search for rules', '.cursor')
    .option('-o, --output <path>', 'Output path for the visualization', 'rule-matrix.html')
    .option('-f, --format <format>', 'Output format (html or json)', 'html')
    .option('-t, --type <types>', 'Filter by rule types (comma-separated)', '')
    .option('-s, --min-strength <strength>', 'Minimum relationship strength (0-1)', '0.0')
    .option('-g, --group-by <property>', 'Group nodes by property (type, directory, contentType, thematic)', 'type')
    .option('--no-orphans', 'Hide orphaned nodes with no relationships')
    .option('--highlight <rules>', 'Highlight specific rules (comma-separated)', '')
    .option('--semantic-connections', 'Include semantic connections from knowledge graph', true)
    .option('-c, --content-type <types>', 'Filter by content types (comma-separated)', '')
    .action(async (options) => {
      try {
        console.log(chalk.blue(`Generating rule matrix visualization...`));
        
        // Get all rules and relationships
        const rules = await manager.listRuleFiles(options.directory || '.cursor');
        const relationships = await relationshipManager.listAllRelationships();
        
        console.log(chalk.green(`Found ${rules.length} rules and ${relationships.length} relationships.`));
        
        // Parse options
        const visualizationOptions = {
          includeTypes: options.type ? options.type.split(',').map(t => t.trim()) : undefined,
          groupBy: options.groupBy as 'type' | 'directory' | 'contentType' | 'thematic',
          minRelationshipStrength: parseFloat(options.minStrength),
          showOrphanedNodes: options.orphans,
          highlightRules: options.highlight ? options.highlight.split(',').map(r => r.trim()) : undefined,
          showSemanticConnections: options.semanticConnections,
          contentTypes: options.contentType ? options.contentType.split(',').map(t => t.trim()) : undefined
        };
        
        // Initialize KnowledgeGraph for visualization enhancements
        const knowledgeGraph = new KnowledgeGraph();
        const visualizer = new RuleMatrixVisualizer(knowledgeGraph);
        
        const outputPath = options.output || 'rule-matrix.html';
        
        console.log(chalk.blue(`Performing semantic analysis on rules...`));
        
        // Generate visualization
        if (options.format === 'json') {
          const jsonPath = outputPath.endsWith('.json') ? outputPath : `${outputPath}.json`;
          const result = await visualizer.generateJsonData(rules, relationships, jsonPath, visualizationOptions);
          console.log(chalk.green(`JSON data exported to ${result}`));
        } else {
          const htmlPath = outputPath.endsWith('.html') ? outputPath : `${outputPath}.html`;
          const result = await visualizer.generateHtmlVisualization(rules, relationships, htmlPath, visualizationOptions);
          console.log(chalk.green(`Visualization saved to ${result}`));
          console.log(chalk.blue(`Open this file in a browser to view the visualization.`));
        }
        
        console.log(chalk.green(`Visualization complete!`));
        console.log(chalk.blue(`The visualization includes semantic analysis for better understanding of rule relationships.`));
        console.log(chalk.blue(`Click on nodes to see detailed information about each rule.`));
      } catch (error) {
        console.error(chalk.red(`Error generating visualization: ${error.message}`));
      }
    });
}

/**
 * Formats a rule type for display
 * 
 * @param type The rule type
 * @returns Formatted rule type
 */
function formatRuleType(type: string): string {
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
function formatRelationshipType(type: string): string {
  return type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
} 