import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export interface Rule {
  id: string;
  name: string;
  description: string;
  content: string;
  filePath: string;
  tags: string[];
  usageCount: number;
  lastUsed: Date;
}

export interface RulePreset {
  id: string;
  name: string;
  description: string;
  rules: string[]; // Rule IDs
}

export class QuickPromptManager {
  private context: vscode.ExtensionContext;
  private rules: Map<string, Rule> = new Map();
  private presets: Map<string, RulePreset> = new Map();
  private ruleFileWatcher: vscode.FileSystemWatcher | undefined;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  public async initialize(): Promise<void> {
    // Load rules from configured paths
    await this.loadRules();

    // Set up file system watcher to detect rule file changes
    this.setupFileWatcher();

    // Load presets from workspace storage
    this.loadPresets();

    // Register rule related commands
    this.registerCommands();

    // Set up file type listeners for rule suggestions
    this.setupFileTypeListeners();
  }

  private async loadRules(): Promise<void> {
    try {
      const config = vscode.workspace.getConfiguration('cody');
      const rulePaths = config.get<string[]>('rules.paths', []);

      // Clear existing rules
      this.rules.clear();

      // Process each path
      for (const rulePath of rulePaths) {
        // Resolve path if it contains variables
        const resolvedPath = rulePath.replace(
          /\${workspaceFolder}/g,
          vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '',
        );

        // Check if path is a glob pattern
        if (resolvedPath.includes('*')) {
          const files = await vscode.workspace.findFiles(resolvedPath);
          for (const file of files) {
            await this.processRuleFile(file.fsPath);
          }
        } else {
          // Check if path is a directory or file
          const stat = await fs.promises.stat(resolvedPath);
          if (stat.isDirectory()) {
            const files = await fs.promises.readdir(resolvedPath);
            for (const file of files) {
              if (file.endsWith('.md') || file.endsWith('.mdc')) {
                const filePath = path.join(resolvedPath, file);
                await this.processRuleFile(filePath);
              }
            }
          } else if (
            stat.isFile() &&
            (resolvedPath.endsWith('.md') || resolvedPath.endsWith('.mdc'))
          ) {
            await this.processRuleFile(resolvedPath);
          }
        }
      }

      console.log(`Loaded ${this.rules.size} rules`);
    } catch (err) {
      console.error('Error loading rules:', err);
    }
  }

  private async processRuleFile(filePath: string): Promise<void> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const fileName = path.basename(filePath);
      const fileNameWithoutExt = path.basename(filePath, path.extname(filePath));

      // Extract metadata from content
      const description = this.extractDescription(content) || '';
      const tags = this.extractTags(content, fileName);

      // Create rule object
      const rule: Rule = {
        id: fileNameWithoutExt,
        name: fileNameWithoutExt.replace(/-/g, ' '),
        description,
        content,
        filePath,
        tags,
        usageCount: 0,
        lastUsed: new Date(0), // Default to epoch
      };

      // Get usage data from storage
      const usageData = this.context.globalState.get<
        Record<string, { count: number; lastUsed: string }>
      >('cody.ruleUsage', {});

      if (usageData[rule.id]) {
        rule.usageCount = usageData[rule.id].count;
        rule.lastUsed = new Date(usageData[rule.id].lastUsed);
      }

      // Add to rules map
      this.rules.set(rule.id, rule);
    } catch (err) {
      console.error(`Error processing rule file ${filePath}:`, err);
    }
  }

  private extractDescription(content: string): string | undefined {
    // Try to extract description from frontmatter
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const descriptionMatch = frontmatter.match(/description:\s*(.*)/);
      if (descriptionMatch) {
        return descriptionMatch[1].trim();
      }
    }

    // Otherwise, use the first line that looks like a title or description
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      // Check for markdown heading
      if (trimmedLine.startsWith('# ')) {
        return trimmedLine.substring(2).trim();
      }
    }

    return undefined;
  }

  private extractTags(content: string, fileName: string): string[] {
    const tags: string[] = [];

    // Add filename-based tags
    const fileNameParts = fileName.split(/[-_\.]/);
    tags.push(...fileNameParts.filter((part) => part.length > 2 && !part.match(/md|mdc/)));

    // Extract explicit tags from content
    const tagMatch = content.match(/tags:\s*\[(.*)\]/);
    if (tagMatch) {
      const tagString = tagMatch[1];
      const extractedTags = tagString.split(',').map((tag) => tag.trim().replace(/['"]/g, ''));
      tags.push(...extractedTags);
    }

    // Look for special keywords in content
    const contentLower = content.toLowerCase();
    const keywords = [
      'react',
      'typescript',
      'javascript',
      'css',
      'html',
      'node',
      'test',
      'api',
      'design',
      'engineering',
      'testing',
      'deployment',
      'maintenance',
    ];

    for (const keyword of keywords) {
      if (contentLower.includes(keyword)) {
        tags.push(keyword);
      }
    }

    // Remove duplicates and return
    return [...new Set(tags)];
  }

  private setupFileWatcher(): void {
    const config = vscode.workspace.getConfiguration('cody');
    const rulePaths = config.get<string[]>('rules.paths', []);

    for (const rulePath of rulePaths) {
      const resolvedPath = rulePath.replace(
        /\${workspaceFolder}/g,
        vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '',
      );

      this.ruleFileWatcher = vscode.workspace.createFileSystemWatcher(
        new vscode.RelativePattern(resolvedPath, '**/*.{md,mdc}'),
      );

      this.ruleFileWatcher.onDidCreate((uri) => this.processRuleFile(uri.fsPath));
      this.ruleFileWatcher.onDidChange((uri) => this.processRuleFile(uri.fsPath));
      this.ruleFileWatcher.onDidDelete((uri) => {
        const fileNameWithoutExt = path.basename(uri.fsPath, path.extname(uri.fsPath));
        this.rules.delete(fileNameWithoutExt);
      });
    }
  }

  private loadPresets(): void {
    const presets = this.context.globalState.get<Record<string, RulePreset>>(
      'cody.rulePresets',
      {},
    );
    this.presets.clear();

    for (const [id, preset] of Object.entries(presets)) {
      this.presets.set(id, preset);
    }
  }

  private savePresets(): void {
    const presets: Record<string, RulePreset> = {};
    for (const [id, preset] of this.presets.entries()) {
      presets[id] = preset;
    }

    this.context.globalState.update('cody.rulePresets', presets);
  }

  private registerCommands(): void {
    // Command to show quick pick for rules
    this.context.subscriptions.push(
      vscode.commands.registerCommand('cody.quickPrompt', async () => {
        await this.showRuleQuickPick();
      }),
    );

    // Command to create a new preset
    this.context.subscriptions.push(
      vscode.commands.registerCommand('cody.createRulePreset', async () => {
        await this.createPreset();
      }),
    );

    // Command to manage presets
    this.context.subscriptions.push(
      vscode.commands.registerCommand('cody.manageRulePresets', async () => {
        await this.managePresets();
      }),
    );
  }

  private setupFileTypeListeners(): void {
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        this.suggestRulesForDocument(editor.document);
      }
    });
  }

  private async suggestRulesForDocument(document: vscode.TextDocument): Promise<void> {
    // Check if rule suggestions are enabled
    const config = vscode.workspace.getConfiguration('cody');
    const suggestRules = config.get<boolean>('quickPrompt.suggestRules', true);

    if (!suggestRules) {
      return;
    }

    const fileType = document.languageId;
    const fileName = path.basename(document.fileName);
    const fileContent = document.getText().toLowerCase();

    // Find relevant rules
    const relevantRules = Array.from(this.rules.values()).filter((rule) => {
      // Check if the rule is relevant for this file type
      return (
        rule.tags.includes(fileType) ||
        (fileType === 'typescript' && rule.tags.includes('typescript')) ||
        (fileType === 'javascript' && rule.tags.includes('javascript')) ||
        (fileType === 'typescriptreact' &&
          (rule.tags.includes('react') || rule.tags.includes('typescript'))) ||
        (fileType === 'javascriptreact' &&
          (rule.tags.includes('react') || rule.tags.includes('javascript')))
      );
    });

    // Sort rules by relevance
    relevantRules.sort((a, b) => {
      // Calculate relevance score
      const scoreA = this.calculateRelevanceScore(a, fileType, fileName, fileContent);
      const scoreB = this.calculateRelevanceScore(b, fileType, fileName, fileContent);

      return scoreB - scoreA; // Higher score first
    });

    // Show rule suggestion if we have relevant rules
    if (relevantRules.length > 0) {
      const topRule = relevantRules[0];

      // Avoid showing suggestions too often
      const lastSuggestionTime = this.context.globalState.get<number>(
        'cody.lastRuleSuggestionTime',
        0,
      );
      const now = Date.now();
      const suggestionInterval =
        config.get<number>('quickPrompt.suggestionIntervalMinutes', 30) * 60 * 1000;

      if (now - lastSuggestionTime > suggestionInterval) {
        const message = `Rule suggestion: ${topRule.name}`;
        const showRule = 'Show Rule';
        const applyRule = 'Apply Rule';
        const dontShowAgain = "Don't Show Again";

        const choice = await vscode.window.showInformationMessage(
          message,
          showRule,
          applyRule,
          dontShowAgain,
        );

        if (choice === showRule) {
          await this.showRulePreview(topRule);
        } else if (choice === applyRule) {
          await this.applyRule(topRule);
        } else if (choice === dontShowAgain) {
          await config.update('quickPrompt.suggestRules', false, vscode.ConfigurationTarget.Global);
        }

        this.context.globalState.update('cody.lastRuleSuggestionTime', now);
      }
    }
  }

  private calculateRelevanceScore(
    rule: Rule,
    fileType: string,
    fileName: string,
    fileContent: string,
  ): number {
    let score = 0;

    // Exact file type match
    if (rule.tags.includes(fileType)) {
      score += 10;
    }

    // Framework matches
    if (
      (fileType === 'typescriptreact' || fileType === 'javascriptreact') &&
      rule.tags.includes('react')
    ) {
      score += 8;
    }

    // Language matches
    if (
      (fileType === 'typescript' || fileType === 'typescriptreact') &&
      rule.tags.includes('typescript')
    ) {
      score += 6;
    }

    if (
      (fileType === 'javascript' || fileType === 'javascriptreact') &&
      rule.tags.includes('javascript')
    ) {
      score += 6;
    }

    // Content keyword matches
    for (const tag of rule.tags) {
      if (fileContent.includes(tag.toLowerCase())) {
        score += 3;
      }
    }

    // Usage count bonus
    score += Math.min(rule.usageCount, 5);

    // Recency bonus (max 5 points for rules used within the last week)
    const daysSinceLastUse = Math.max(
      0,
      (Date.now() - rule.lastUsed.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceLastUse < 7) {
      score += 5 - Math.floor(daysSinceLastUse / 1.4);
    }

    return score;
  }

  public async showRuleQuickPick(): Promise<void> {
    const ruleItems = Array.from(this.rules.values()).map((rule) => ({
      label: rule.name,
      description: rule.description,
      detail: `Tags: ${rule.tags.join(', ')}`,
      rule,
    }));

    const presetItems = Array.from(this.presets.values()).map((preset) => ({
      label: `$(bookmark) ${preset.name}`,
      description: preset.description,
      detail: `Preset with ${preset.rules.length} rules`,
      preset,
    }));

    const allItems = [...ruleItems, ...presetItems];

    // Sort items by usage count and recency
    allItems.sort((a, b) => {
      if ('rule' in a && 'rule' in b) {
        // Sort rules by usage count and recency
        if (b.rule.usageCount !== a.rule.usageCount) {
          return b.rule.usageCount - a.rule.usageCount;
        }
        return b.rule.lastUsed.getTime() - a.rule.lastUsed.getTime();
      } else if ('preset' in a && 'preset' in b) {
        // Keep presets in their original order
        return 0;
      } else {
        // Show rules before presets
        return 'rule' in a ? -1 : 1;
      }
    });

    const selectedItem = await vscode.window.showQuickPick(allItems, {
      placeHolder: 'Select a rule or preset',
    });

    if (!selectedItem) {
      return;
    }

    if ('rule' in selectedItem) {
      await this.applyRule(selectedItem.rule);
    } else if ('preset' in selectedItem) {
      await this.applyPreset(selectedItem.preset);
    }
  }

  private async showRulePreview(rule: Rule): Promise<void> {
    // Create and show a new untitled document with the rule content
    const doc = await vscode.workspace.openTextDocument({
      content: rule.content,
      language: 'markdown',
    });

    await vscode.window.showTextDocument(doc);
  }

  private async applyRule(rule: Rule): Promise<void> {
    // TODO: Implement rule application logic
    // This would involve adding the rule to the current chat or prompt

    // For now, just show the rule content
    await this.showRulePreview(rule);

    // Update usage statistics
    rule.usageCount++;
    rule.lastUsed = new Date();

    // Save to persistent storage
    const usageData = this.context.globalState.get<
      Record<string, { count: number; lastUsed: string }>
    >('cody.ruleUsage', {});

    usageData[rule.id] = {
      count: rule.usageCount,
      lastUsed: rule.lastUsed.toISOString(),
    };

    this.context.globalState.update('cody.ruleUsage', usageData);
  }

  private async createPreset(): Promise<void> {
    // Get preset name
    const presetName = await vscode.window.showInputBox({
      placeHolder: 'Enter preset name',
      prompt: 'Name for the new rule preset',
    });

    if (!presetName) {
      return;
    }

    // Get preset description
    const presetDescription = await vscode.window.showInputBox({
      placeHolder: 'Enter preset description (optional)',
      prompt: 'Description for the new rule preset',
    });

    // Show quick pick to select rules
    const ruleItems = Array.from(this.rules.values()).map((rule) => ({
      label: rule.name,
      description: rule.description,
      picked: false,
      rule,
    }));

    const selectedItems = await vscode.window.showQuickPick(ruleItems, {
      placeHolder: 'Select rules for the preset',
      canPickMany: true,
    });

    if (!selectedItems || selectedItems.length === 0) {
      return;
    }

    // Create preset
    const preset: RulePreset = {
      id: presetName.toLowerCase().replace(/\s+/g, '-'),
      name: presetName,
      description: presetDescription || '',
      rules: selectedItems.map((item) => item.rule.id),
    };

    // Add to presets
    this.presets.set(preset.id, preset);

    // Save presets
    this.savePresets();

    vscode.window.showInformationMessage(
      `Created preset "${presetName}" with ${selectedItems.length} rules`,
    );
  }

  private async managePresets(): Promise<void> {
    const presetItems = Array.from(this.presets.values()).map((preset) => ({
      label: preset.name,
      description: `${preset.rules.length} rules`,
      preset,
    }));

    const selectedItem = await vscode.window.showQuickPick(presetItems, {
      placeHolder: 'Select a preset to manage',
    });

    if (!selectedItem) {
      return;
    }

    const preset = selectedItem.preset;

    const action = await vscode.window.showQuickPick(['Apply', 'Edit', 'Delete'], {
      placeHolder: `Action for preset "${preset.name}"`,
    });

    if (!action) {
      return;
    }

    if (action === 'Apply') {
      await this.applyPreset(preset);
    } else if (action === 'Edit') {
      await this.editPreset(preset);
    } else if (action === 'Delete') {
      this.presets.delete(preset.id);
      this.savePresets();
      vscode.window.showInformationMessage(`Deleted preset "${preset.name}"`);
    }
  }

  private async applyPreset(preset: RulePreset): Promise<void> {
    // Get rules from preset
    const rules = preset.rules
      .map((ruleId) => this.rules.get(ruleId))
      .filter((rule): rule is Rule => rule !== undefined);

    // TODO: Implement actual rule application logic

    // For now, just show the rules in separate tabs
    for (const rule of rules) {
      await this.applyRule(rule);
    }
  }

  private async editPreset(preset: RulePreset): Promise<void> {
    // Get new name
    const newName = await vscode.window.showInputBox({
      placeHolder: 'Enter preset name',
      prompt: 'Name for the preset',
      value: preset.name,
    });

    if (!newName) {
      return;
    }

    // Get new description
    const newDescription = await vscode.window.showInputBox({
      placeHolder: 'Enter preset description (optional)',
      prompt: 'Description for the preset',
      value: preset.description,
    });

    // Get current rules
    const currentRuleIds = new Set(preset.rules);

    // Show quick pick to select rules
    const ruleItems = Array.from(this.rules.values()).map((rule) => ({
      label: rule.name,
      description: rule.description,
      picked: currentRuleIds.has(rule.id),
      rule,
    }));

    const selectedItems = await vscode.window.showQuickPick(ruleItems, {
      placeHolder: 'Select rules for the preset',
      canPickMany: true,
    });

    if (!selectedItems) {
      return;
    }

    // Delete old preset if name changed
    if (newName !== preset.name) {
      this.presets.delete(preset.id);
    }

    // Create updated preset
    const updatedPreset: RulePreset = {
      id: newName.toLowerCase().replace(/\s+/g, '-'),
      name: newName,
      description: newDescription || '',
      rules: selectedItems.map((item) => item.rule.id),
    };

    // Add updated preset
    this.presets.set(updatedPreset.id, updatedPreset);

    // Save presets
    this.savePresets();

    vscode.window.showInformationMessage(`Updated preset "${newName}"`);
  }

  public getRules(): Rule[] {
    return Array.from(this.rules.values());
  }

  public getPresets(): RulePreset[] {
    return Array.from(this.presets.values());
  }

  public dispose(): void {
    if (this.ruleFileWatcher) {
      this.ruleFileWatcher.dispose();
    }
  }
}
