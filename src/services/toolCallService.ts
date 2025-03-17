/**
 * Tool Call Service
 * Provides functionality to track and analyze tool calls
 */

import { v4 as uuidv4 } from 'uuid';
import {
    ToolCall,
    ToolCallAnalytics,
    ToolCallFilterOptions,
    ToolCallSession,
    ToolCallStatus
} from '../types/toolcalls';

export class ToolCallService {
  private currentSession: ToolCallSession;
  private maxCalls: number;
  private listeners: ((session: ToolCallSession) => void)[] = [];

  constructor(maxCalls: number = 25) {
    this.maxCalls = maxCalls;
    this.currentSession = this.createNewSession();
  }

  /**
   * Creates a new tool call session
   */
  private createNewSession(): ToolCallSession {
    return {
      id: uuidv4(),
      startTime: Date.now(),
      toolCalls: [],
      totalCalls: 0,
      completedCalls: 0,
      failedCalls: 0,
      active: true
    };
  }

  /**
   * Adds a listener for session changes
   */
  public addListener(listener: (session: ToolCallSession) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notifies all listeners of session changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentSession));
  }

  /**
   * Tracks a new tool call
   */
  public trackCall(name: string, parameters?: Record<string, any>): string {
    const id = uuidv4();
    const newCall: ToolCall = {
      id,
      name,
      timestamp: Date.now(),
      status: ToolCallStatus.PENDING,
      parameters
    };

    this.currentSession.toolCalls.push(newCall);
    this.currentSession.totalCalls++;
    
    // Log the tool call
    console.log(`Tool call tracked: ${name} (Count: ${this.currentSession.totalCalls}/${this.maxCalls})`);

    // Check if approaching limit
    if (this.currentSession.totalCalls >= this.maxCalls * 0.8) {
      console.warn(`⚠️ WARNING: Approaching tool call limit (${this.currentSession.totalCalls}/${this.maxCalls})`);
    }

    this.notifyListeners();
    return id;
  }

  /**
   * Updates the status of a tool call
   */
  public updateCallStatus(id: string, status: ToolCallStatus, result?: any, error?: string): void {
    const callIndex = this.currentSession.toolCalls.findIndex(call => call.id === id);
    
    if (callIndex === -1) {
      console.error(`Tool call with ID ${id} not found`);
      return;
    }

    const call = this.currentSession.toolCalls[callIndex];
    
    // Calculate duration
    if (status === ToolCallStatus.COMPLETED || status === ToolCallStatus.FAILED) {
      call.duration = Date.now() - call.timestamp;
    }

    // Update call information
    call.status = status;
    if (result !== undefined) call.result = result;
    if (error !== undefined) call.error = error;

    // Update session statistics
    if (status === ToolCallStatus.COMPLETED) {
      this.currentSession.completedCalls++;
    } else if (status === ToolCallStatus.FAILED) {
      this.currentSession.failedCalls++;
    }

    this.notifyListeners();
  }

  /**
   * Gets the current session
   */
  public getSession(): ToolCallSession {
    return { ...this.currentSession };
  }

  /**
   * Clears the current session and starts a new one
   */
  public clearSession(): void {
    if (this.currentSession.active) {
      this.currentSession.active = false;
      this.currentSession.endTime = Date.now();
    }

    this.currentSession = this.createNewSession();
    this.notifyListeners();
  }

  /**
   * Filters tool calls based on provided options
   */
  public filterCalls(options: ToolCallFilterOptions): ToolCall[] {
    return this.currentSession.toolCalls.filter(call => {
      // Filter by status
      if (options.status && options.status.length > 0 && !options.status.includes(call.status)) {
        return false;
      }

      // Filter by tool name
      if (options.toolNames && options.toolNames.length > 0 && !options.toolNames.includes(call.name)) {
        return false;
      }

      // Filter by time range
      if (options.timeRange) {
        if (call.timestamp < options.timeRange.start || call.timestamp > options.timeRange.end) {
          return false;
        }
      }

      // Filter by search term
      if (options.search) {
        const searchLower = options.search.toLowerCase();
        const nameLower = call.name.toLowerCase();
        const paramsString = call.parameters ? JSON.stringify(call.parameters).toLowerCase() : '';
        const resultString = call.result ? JSON.stringify(call.result).toLowerCase() : '';
        
        if (!nameLower.includes(searchLower) && 
            !paramsString.includes(searchLower) && 
            !resultString.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Gets analytics for the current session
   */
  public getAnalytics(): ToolCallAnalytics {
    const { toolCalls, totalCalls, completedCalls, failedCalls } = this.currentSession;
    
    // Calculate average duration for completed calls
    const completedCallsWithDuration = toolCalls.filter(
      call => call.status === ToolCallStatus.COMPLETED && call.duration !== undefined
    ) as (ToolCall & { duration: number })[];
    
    const totalDuration = completedCallsWithDuration.reduce((sum, call) => sum + call.duration, 0);
    const averageDuration = completedCallsWithDuration.length > 0 
      ? totalDuration / completedCallsWithDuration.length 
      : 0;

    // Count tool usage
    const toolUsage: Record<string, number> = {};
    toolCalls.forEach(call => {
      toolUsage[call.name] = (toolUsage[call.name] || 0) + 1;
    });

    // Sort by most used
    const mostUsedTools = Object.entries(toolUsage)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalCalls,
      averageDuration,
      successRate: totalCalls > 0 ? completedCalls / totalCalls : 0,
      failureRate: totalCalls > 0 ? failedCalls / totalCalls : 0,
      mostUsedTools
    };
  }
}

// Create singleton instance
export const toolCallService = new ToolCallService();
export default toolCallService; 