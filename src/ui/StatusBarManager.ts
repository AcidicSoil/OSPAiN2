import * as vscode from 'vscode';
import { DevelopmentModeManager } from '../modes/DevelopmentModeManager';

export class StatusBarManager {
  private context: vscode.ExtensionContext;
  private modeManager: DevelopmentModeManager;
  private modeStatusBarItem: vscode.StatusBarItem;
  private tokenStatusBarItem: vscode.StatusBarItem;

  constructor(context: vscode.ExtensionContext, modeManager: DevelopmentModeManager) {
    this.context = context;
    this.modeManager = modeManager;

    // Create status bar items
    this.modeStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    this.tokenStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);

    // Add status bar items to subscriptions
    this.context.subscriptions.push(this.modeStatusBarItem);
    this.context.subscriptions.push(this.tokenStatusBarItem);

    // Listen for mode changes
    this.modeManager.on('modeChanged', (event) => {
      this.updateModeStatus(event.current);
    });
  }

  public initialize(): void {
    // Set up initial values
    this.updateModeStatus(this.modeManager.getCurrentMode());
    this.updateTokenStatus();

    // Show status bar items
    this.modeStatusBarItem.show();
    this.tokenStatusBarItem.show();
  }

  private updateModeStatus(mode: string): void {
    const icon = this.modeManager.getCurrentModeIcon();
    this.modeStatusBarItem.text = `${icon} ${mode}`;
    this.modeStatusBarItem.tooltip = `Current development mode: ${mode}`;
    this.modeStatusBarItem.command = 'cody.switchMode';
  }

  public updateTokenStatus(usagePercentage?: number): void {
    if (usagePercentage === undefined) {
      // Don't show until we have data
      this.tokenStatusBarItem.text = `$(sync) API`;
      this.tokenStatusBarItem.tooltip = 'API usage statistics loading...';
      return;
    }

    // Show token usage with icon based on percentage
    let icon = '$(check)';

    if (usagePercentage >= 90) {
      icon = '$(error)';
    } else if (usagePercentage >= 75) {
      icon = '$(warning)';
    } else if (usagePercentage >= 50) {
      icon = '$(info)';
    }

    this.tokenStatusBarItem.text = `${icon} API: ${usagePercentage.toFixed(0)}%`;
    this.tokenStatusBarItem.tooltip = `API usage: ${usagePercentage.toFixed(1)}% of daily limit`;
  }

  /**
   * Shows a progress notification in the status bar
   */
  public async showProgress(title: string, task: () => Promise<any>): Promise<any> {
    return vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Window,
        title,
        cancellable: false,
      },
      task,
    );
  }

  /**
   * Shows a temporary notification in the status bar
   */
  public showTemporaryMessage(message: string, durationMs: number = 3000): void {
    const tempStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
    tempStatusBar.text = message;
    tempStatusBar.show();

    setTimeout(() => {
      tempStatusBar.dispose();
    }, durationMs);
  }

  /**
   * Updates the mode status bar with loading indicator
   */
  public showModeLoading(mode: string): void {
    const icon = this.modeManager.getModeIcon(mode as any);
    this.modeStatusBarItem.text = `$(sync~spin) ${icon} ${mode}`;
    this.modeStatusBarItem.tooltip = `Switching to ${mode} mode...`;
  }

  /**
   * Updates the mode status bar with success indicator and then reverts to normal
   */
  public showModeSuccess(mode: string): void {
    const icon = this.modeManager.getModeIcon(mode as any);
    this.modeStatusBarItem.text = `$(check) ${icon} ${mode}`;
    this.modeStatusBarItem.tooltip = `Successfully switched to ${mode} mode`;

    // Revert to normal after a delay
    setTimeout(() => {
      this.updateModeStatus(mode);
    }, 2000);
  }

  /**
   * Shows error status in the mode status bar and then reverts to normal
   */
  public showModeError(mode: string, error: string): void {
    const icon = this.modeManager.getModeIcon(mode as any);
    this.modeStatusBarItem.text = `$(error) ${icon} ${mode}`;
    this.modeStatusBarItem.tooltip = `Error switching to ${mode} mode: ${error}`;

    // Revert to normal after a delay
    setTimeout(() => {
      this.updateModeStatus(this.modeManager.getCurrentMode());
    }, 3000);
  }
}
