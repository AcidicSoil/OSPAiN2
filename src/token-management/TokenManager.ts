import * as vscode from 'vscode';
import { EventEmitter } from 'events';

interface TokenUsage {
  total: number;
  available: number;
  usedToday: number;
  reset: Date;
}

export class TokenManager extends EventEmitter {
  private context: vscode.ExtensionContext;
  private usage: TokenUsage;
  private monitorInterval: NodeJS.Timeout | null = null;
  private lastRequestTime: number = 0;
  private requestCount: number = 0;
  private readonly DEFAULT_RATE_LIMIT = 50; // requests per minute
  private readonly DEFAULT_TOKEN_LIMIT = 5000; // tokens per day

  constructor(context: vscode.ExtensionContext) {
    super();
    this.context = context;
    this.usage = this.loadUsageFromStorage();
  }

  public initialize(): void {
    // Set up monitoring interval
    const config = vscode.workspace.getConfiguration('cody');
    const monitorInterval = config.get<number>('tokenManagement.monitorInterval', 30) * 1000;

    this.monitorInterval = setInterval(() => {
      this.checkUsage();
    }, monitorInterval);

    // Listen for configuration changes
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('cody.tokenManagement')) {
        this.updateConfiguration();
      }
    });

    // Check if we need to reset the daily counter
    this.checkDailyReset();
  }

  private loadUsageFromStorage(): TokenUsage {
    const storedUsage = this.context.globalState.get<TokenUsage>('cody.tokenUsage');

    if (storedUsage) {
      return {
        ...storedUsage,
        reset: new Date(storedUsage.reset),
      };
    }

    // Default initial state
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return {
      total: this.DEFAULT_TOKEN_LIMIT,
      available: this.DEFAULT_TOKEN_LIMIT,
      usedToday: 0,
      reset: tomorrow,
    };
  }

  private saveUsageToStorage(): void {
    this.context.globalState.update('cody.tokenUsage', this.usage);
  }

  private updateConfiguration(): void {
    const config = vscode.workspace.getConfiguration('cody');
    const monitorInterval = config.get<number>('tokenManagement.monitorInterval', 30) * 1000;

    // Update monitor interval
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }

    this.monitorInterval = setInterval(() => {
      this.checkUsage();
    }, monitorInterval);
  }

  private checkDailyReset(): void {
    const now = new Date();

    if (now >= this.usage.reset) {
      // Reset daily counter
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      this.usage.available = this.usage.total;
      this.usage.usedToday = 0;
      this.usage.reset = tomorrow;

      this.saveUsageToStorage();
      this.emit('usage-reset');
    }
  }

  private checkUsage(): void {
    // Check daily reset
    this.checkDailyReset();

    // Check if we're approaching limits
    const config = vscode.workspace.getConfiguration('cody');
    const notificationThreshold = config.get<number>('tokenManagement.notificationThreshold', 80);

    const usagePercentage = (this.usage.usedToday / this.usage.total) * 100;

    if (usagePercentage >= notificationThreshold) {
      vscode.window.showWarningMessage(
        `Token usage alert: You've used ${usagePercentage.toFixed(1)}% of your daily token limit.`,
      );
      this.emit('limit-approaching', { percentage: usagePercentage });
    }
  }

  /**
   * Records token usage for a request
   */
  public recordUsage(tokenCount: number): void {
    this.usage.usedToday += tokenCount;
    this.usage.available = Math.max(0, this.usage.total - this.usage.usedToday);

    this.saveUsageToStorage();
    this.emit('usage-updated', this.getUsage());

    // Track request for rate limiting
    const now = Date.now();
    this.lastRequestTime = now;
    this.requestCount++;

    // Reset request count after 1 minute
    setTimeout(() => {
      this.requestCount--;
    }, 60000);

    this.checkUsage();
  }

  /**
   * Checks if a request can be made within rate limits
   */
  public canMakeRequest(): boolean {
    const config = vscode.workspace.getConfiguration('cody');
    const rateLimit = config.get<number>('tokenManagement.rateLimit', this.DEFAULT_RATE_LIMIT);

    return this.requestCount < rateLimit && this.usage.available > 0;
  }

  /**
   * Gets the current token usage
   */
  public getUsage(): TokenUsage {
    return { ...this.usage };
  }

  /**
   * Gets the time to wait before making another request (in ms)
   */
  public getWaitTime(): number {
    if (this.canMakeRequest()) {
      return 0;
    }

    // If we're rate limited, calculate wait time based on last request
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const waitTime = Math.max(0, 60000 - timeSinceLastRequest);

    return waitTime;
  }

  /**
   * Tries to auto-bypass rate limiting if enabled
   */
  public async tryBypass(): Promise<boolean> {
    const config = vscode.workspace.getConfiguration('cody');
    const autoBypass = config.get<boolean>('tokenManagement.autoBypass', false);

    if (!autoBypass) {
      return false;
    }

    const bypassMethod = config.get<string>('tokenManagement.bypassMethod', 'cache-optimization');

    switch (bypassMethod) {
      case 'cache-optimization':
        // Implement cache optimization logic
        this.emit('bypass-attempt', { method: bypassMethod, success: true });
        return true;

      case 'rate-adjust':
        // Implement rate adjustment logic
        this.emit('bypass-attempt', { method: bypassMethod, success: true });
        return true;

      default:
        this.emit('bypass-attempt', { method: bypassMethod, success: false });
        return false;
    }
  }

  /**
   * Manually resets token usage (for testing or emergency reset)
   */
  public async manualReset(): Promise<void> {
    const confirm = await vscode.window.showWarningMessage(
      'Are you sure you want to reset token usage statistics?',
      { modal: true },
      'Reset',
    );

    if (confirm === 'Reset') {
      // Reset usage
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      this.usage.available = this.usage.total;
      this.usage.usedToday = 0;
      this.usage.reset = tomorrow;

      this.saveUsageToStorage();
      this.emit('manual-reset');

      vscode.window.showInformationMessage('Token usage statistics have been reset.');
    }
  }

  public dispose(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
  }
}
