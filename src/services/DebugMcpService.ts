import { LogEntry, Session } from "../types/debug";

class DebugMcpService {
  private static instance: DebugMcpService;
  private currentSession: Session | null = null;
  private logListeners: ((log: LogEntry) => void)[] = [];
  private isInitialized = false;

  private constructor() {}

  static getInstance(): DebugMcpService {
    if (!DebugMcpService.instance) {
      DebugMcpService.instance = new DebugMcpService();
    }
    return DebugMcpService.instance;
  }

  initialize(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;
    this.startNewSession();
  }

  shutdown(): void {
    this.isInitialized = false;
    this.currentSession = null;
  }

  getCurrentSession(): Session | null {
    return this.currentSession;
  }

  startNewSession(): Session {
    const session: Session = {
      id: Date.now().toString(),
      startTime: new Date(),
      logs: [],
    };
    this.currentSession = session;
    return session;
  }

  endCurrentSession(): void {
    if (this.currentSession) {
      this.currentSession.endTime = new Date();
    }
    this.currentSession = null;
  }

  async getLogs({ sessionId }: { sessionId: string }): Promise<LogEntry[]> {
    const sessions = await this.getSessions();
    const session = sessions.find((s) => s.id === sessionId);
    return session?.logs || [];
  }

  async getSessions(): Promise<Session[]> {
    // In a real implementation, this would fetch from storage
    return this.currentSession ? [this.currentSession] : [];
  }

  onLog(callback: (log: LogEntry) => void): () => void {
    this.logListeners.push(callback);
    return () => {
      this.logListeners = this.logListeners.filter((cb) => cb !== callback);
    };
  }

  async setupTurboPack(): Promise<void> {
    // Implementation for turbopack setup
    console.log("Setting up TurboPack...");
  }
}

export default DebugMcpService.getInstance();
