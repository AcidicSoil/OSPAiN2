/**
 * OllamaOS Tool Call Monitor
 * Extends OllamaOS with tool call tracking and monitoring capabilities
 */

const fs = require('fs');
const path = require('path');
const OllamaOS = require('./ollama-os');
const { v4: uuidv4 } = require('uuid');

// Tool Call Status
const ToolCallStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

/**
 * ToolCallMonitor class - extends OllamaOS with tool call tracking
 */
class ToolCallMonitor {
  constructor(ollamaOS) {
    this.ollamaOS = ollamaOS;
    this.maxCalls = 25;
    this.logsDir = path.join(process.cwd(), '.ollama-os', 'logs');
    this.sessionId = uuidv4();
    this.callCount = 0;
    this.completedCount = 0;
    this.failedCount = 0;
    this.currentSession = {
      id: this.sessionId,
      startTime: Date.now(),
      toolCalls: [],
      active: true
    };

    // Ensure logs directory exists
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  /**
   * Track a new tool call
   * @param {string} name - Tool call name
   * @param {object} parameters - Tool call parameters
   * @returns {string} - Call ID
   */
  trackCall(name, parameters = {}) {
    const id = uuidv4();
    const toolCall = {
      id,
      name,
      timestamp: Date.now(),
      status: ToolCallStatus.PENDING,
      parameters
    };

    this.currentSession.toolCalls.push(toolCall);
    this.callCount++;
    
    // Log the call
    console.log(`[OllamaOS] Tool call tracked: ${name} (${this.callCount}/${this.maxCalls})`);
    
    // Check if approaching limit
    if (this.callCount >= this.maxCalls * 0.8) {
      console.warn(`⚠️ [OllamaOS] WARNING: Approaching tool call limit (${this.callCount}/${this.maxCalls})`);
    }

    // Save session to file
    this.saveSession();
    
    return id;
  }

  /**
   * Update the status of a tool call
   * @param {string} id - Call ID
   * @param {string} status - New status
   * @param {any} result - Call result
   * @param {string} error - Error if any
   */
  updateCallStatus(id, status, result, error) {
    const call = this.currentSession.toolCalls.find(call => call.id === id);
    
    if (!call) {
      console.error(`[OllamaOS] Tool call with ID ${id} not found`);
      return;
    }

    // Calculate duration
    if (status === ToolCallStatus.COMPLETED || status === ToolCallStatus.FAILED) {
      call.duration = Date.now() - call.timestamp;
    }

    // Update call
    call.status = status;
    if (result !== undefined) call.result = result;
    if (error !== undefined) call.error = error;

    // Update counts
    if (status === ToolCallStatus.COMPLETED) {
      this.completedCount++;
    } else if (status === ToolCallStatus.FAILED) {
      this.failedCount++;
    }

    // Save session
    this.saveSession();
  }

  /**
   * Get status summary of tool calls
   * @returns {object} Status summary
   */
  getStatus() {
    return {
      callCount: this.callCount,
      completedCount: this.completedCount,
      failedCount: this.failedCount,
      maxCalls: this.maxCalls,
      remainingCalls: this.maxCalls - this.callCount,
      isNearLimit: this.callCount >= this.maxCalls * 0.8,
      isAtLimit: this.callCount >= this.maxCalls,
      successRate: this.callCount > 0 ? (this.completedCount / this.callCount) : 0,
      recentCalls: this.currentSession.toolCalls.slice(-5).reverse()
    };
  }

  /**
   * Clear the current session
   */
  clearSession() {
    // Archive current session if active
    if (this.currentSession.active) {
      this.currentSession.active = false;
      this.currentSession.endTime = Date.now();
      this.archiveSession();
    }

    // Create new session
    this.sessionId = uuidv4();
    this.callCount = 0;
    this.completedCount = 0;
    this.failedCount = 0;
    this.currentSession = {
      id: this.sessionId,
      startTime: Date.now(),
      toolCalls: [],
      active: true
    };

    // Save new session
    this.saveSession();
  }

  /**
   * Save the current session to file
   */
  saveSession() {
    try {
      const sessionFile = path.join(this.logsDir, `tool-call-session-${this.sessionId}.json`);
      fs.writeFileSync(sessionFile, JSON.stringify(this.currentSession, null, 2));
    } catch (error) {
      console.error('[OllamaOS] Error saving tool call session:', error.message);
    }
  }

  /**
   * Archive the current session
   */
  archiveSession() {
    try {
      const archiveDir = path.join(this.logsDir, 'archived-sessions');
      if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true });
      }
      
      const archiveFile = path.join(
        archiveDir, 
        `tool-call-session-${this.sessionId}-${Date.now()}.json`
      );
      
      fs.writeFileSync(archiveFile, JSON.stringify(this.currentSession, null, 2));
    } catch (error) {
      console.error('[OllamaOS] Error archiving tool call session:', error.message);
    }
  }

  /**
   * Show tool call status in the console
   */
  showStatus() {
    const status = this.getStatus();
    
    console.log('\n=== Tool Call Status ===');
    console.log(`Call count: ${status.callCount}/${status.maxCalls}`);
    console.log(`Success rate: ${(status.successRate * 100).toFixed(1)}%`);
    
    if (status.isNearLimit) {
      console.warn('\n⚠️  WARNING: Approaching tool call limit!');
    }
    
    if (status.isAtLimit) {
      console.error('\n🚫 ERROR: Tool call limit reached!');
    }
    
    if (status.recentCalls.length > 0) {
      console.log('\nRecent tool calls:');
      status.recentCalls.forEach((call, index) => {
        const statusSymbol = 
          call.status === ToolCallStatus.COMPLETED ? '✓' :
          call.status === ToolCallStatus.FAILED ? '✗' :
          call.status === ToolCallStatus.IN_PROGRESS ? '⟳' : '⏱';
          
        console.log(`${index + 1}. ${statusSymbol} ${call.name}`);
      });
    }
  }
}

/**
 * Initialize the tool call monitor with OllamaOS
 * @param {OllamaOS} ollamaOS - OllamaOS instance
 * @returns {ToolCallMonitor} - Tool call monitor instance
 */
function initializeToolCallMonitor(ollamaOS) {
  const monitor = new ToolCallMonitor(ollamaOS);
  
  // Add status method to OllamaOS
  const originalShowStatus = ollamaOS.showStatus.bind(ollamaOS);
  ollamaOS.showStatus = function() {
    originalShowStatus();
    monitor.showStatus();
  };
  
  // Add tool call command to OllamaOS
  const originalProcessCommand = ollamaOS.processCommand.bind(ollamaOS);
  ollamaOS.processCommand = function(args) {
    if (args[0] === 'toolcall' || args[0] === 'tool-call') {
      if (args[1] === 'status') {
        monitor.showStatus();
      } else if (args[1] === 'clear') {
        monitor.clearSession();
        console.log('✅ Tool call session cleared');
      } else {
        console.log(`
Tool call management commands:
  toolcall status   - Show current tool call status
  toolcall clear    - Clear current tool call session
        `);
      }
      return;
    }
    
    return originalProcessCommand(args);
  };
  
  // Extend ollamaOS help
  const originalShowHelp = ollamaOS.showHelp.bind(ollamaOS);
  ollamaOS.showHelp = function() {
    originalShowHelp();
    console.log(`
Tool Call Commands:
  toolcall              - Show tool call help
  toolcall status       - Show current tool call status
  toolcall clear        - Clear current tool call session
    `);
  };
  
  // Add the monitor to the ollamaOS instance
  ollamaOS.toolCallMonitor = monitor;
  
  return monitor;
}

module.exports = {
  initializeToolCallMonitor,
  ToolCallMonitor,
  ToolCallStatus
}; 