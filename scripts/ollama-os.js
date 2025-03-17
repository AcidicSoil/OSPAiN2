#!/usr/bin/env node

/**
 * OllamaOS - A simplified implementation of the agent operating system 
 * This script provides core functionality for managing agents, contexts, and modes
 * within the Ollama ecosystem.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const DEFAULT_CONFIG = {
  name: "OllamaOS",
  version: "0.1.0",
  horizons: {
    current: "H1",
    paths: {
      "H1": "./H1",
      "H2": "./H2", 
      "H3": "./H3"
    }
  },
  modes: ["design", "engineering", "testing", "deployment", "maintenance"],
  modeIcons: {
    "design": "🎨",
    "engineering": "🔧",
    "testing": "🧪",
    "deployment": "📦",
    "maintenance": "🔍"
  },
  directories: {
    "*": {
      tools: ["codebase_search", "read_file", "edit_file"],
      contextDepth: "medium"
    }
  }
};

// State Management
class OllamaOSState {
  constructor() {
    this.configPath = path.join(process.cwd(), '.ollama-os.json');
    this.config = this.loadConfig();
    this.currentMode = this.loadCurrentMode();
    this.interactionCount = 0;
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading config:', error.message);
    }
    return DEFAULT_CONFIG;
  }

  saveConfig() {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Error saving config:', error.message);
    }
  }

  loadCurrentMode() {
    try {
      const modePath = path.join(process.cwd(), '.ollama-os-mode');
      if (fs.existsSync(modePath)) {
        return fs.readFileSync(modePath, 'utf8').trim();
      }
    } catch (error) {
      console.error('Error loading current mode:', error.message);
    }
    return this.config.modes[0];
  }

  saveCurrentMode(mode) {
    try {
      fs.writeFileSync(path.join(process.cwd(), '.ollama-os-mode'), mode);
      this.currentMode = mode;
    } catch (error) {
      console.error('Error saving current mode:', error.message);
    }
  }

  incrementInteractionCount() {
    this.interactionCount++;
    return this.interactionCount;
  }
}

// Agent System
class AgentSystem {
  constructor(state) {
    this.state = state;
    this.agentsDir = path.join(process.cwd(), '.ollama-os', 'agents');
    
    // Ensure agents directory exists
    if (!fs.existsSync(this.agentsDir)) {
      fs.mkdirSync(this.agentsDir, { recursive: true });
    }
  }

  getAvailableAgents() {
    try {
      return fs.readdirSync(this.agentsDir)
        .filter(file => file.endsWith('.json'))
        .map(file => path.basename(file, '.json'));
    } catch (error) {
      console.error('Error getting available agents:', error.message);
      return [];
    }
  }

  getAgentConfig(agentName) {
    try {
      const agentPath = path.join(this.agentsDir, `${agentName}.json`);
      if (fs.existsSync(agentPath)) {
        return JSON.parse(fs.readFileSync(agentPath, 'utf8'));
      }
    } catch (error) {
      console.error(`Error loading agent ${agentName}:`, error.message);
    }
    return null;
  }

  getAgentForMode(mode) {
    const agents = this.getAvailableAgents();
    const modeSpecificAgent = agents.find(a => a.toLowerCase().includes(mode.toLowerCase()));
    return modeSpecificAgent || 'default-agent';
  }

  runAgent(agentName, task, directory) {
    console.log(`🤖 Running agent: ${agentName}`);
    console.log(`📁 Working directory: ${directory || 'current'}`);
    console.log(`📋 Task: ${task}`);
    
    // This would integrate with actual agent execution
    // For now we'll just simulate agent behavior
    console.log('\n⚙️ Agent processing task...\n');
    
    // Simulate processing time
    const startTime = Date.now();
    const processingTime = Math.floor(Math.random() * 2000) + 1000;
    
    // Track interaction
    this.state.incrementInteractionCount();
    
    setTimeout(() => {
      console.log(`✅ Task completed in ${(processingTime/1000).toFixed(1)}s`);
      console.log(`💡 Agent insight: Consider using the ${this.state.config.modeIcons[this.state.currentMode]} ${this.state.currentMode.toUpperCase()} mode pattern here`);
    }, processingTime);
  }
}

// Mode Manager
class ModeManager {
  constructor(state) {
    this.state = state;
  }

  getCurrentMode() {
    return {
      name: this.state.currentMode,
      icon: this.state.config.modeIcons[this.state.currentMode] || '❓'
    };
  }

  listModes() {
    return this.state.config.modes.map(mode => ({
      name: mode,
      icon: this.state.config.modeIcons[mode] || '❓',
      isCurrent: mode === this.state.currentMode
    }));
  }

  switchMode(mode, reason) {
    if (!this.state.config.modes.includes(mode)) {
      console.error(`Error: Invalid mode "${mode}"`);
      console.log(`Available modes: ${this.state.config.modes.join(', ')}`);
      return false;
    }

    // Capture pre-transition context
    const previousMode = this.state.currentMode;
    
    // Perform mode transition
    this.state.saveCurrentMode(mode);
    
    console.log(`\n${this.state.config.modeIcons[previousMode]} ${previousMode.toUpperCase()} → ${this.state.config.modeIcons[mode]} ${mode.toUpperCase()}`);
    console.log(`Reason: ${reason || 'No reason provided'}`);
    
    // Log the transition
    this.logModeTransition(previousMode, mode, reason);
    
    return true;
  }

  logModeTransition(fromMode, toMode, reason) {
    try {
      const logDir = path.join(process.cwd(), '.ollama-os', 'logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString();
      const logEntry = `${timestamp} | ${fromMode} → ${toMode} | ${reason || 'No reason provided'}\n`;
      
      fs.appendFileSync(path.join(logDir, 'mode-transitions.log'), logEntry);
    } catch (error) {
      console.error('Error logging mode transition:', error.message);
    }
  }
}

// Horizon Manager
class HorizonManager {
  constructor(state) {
    this.state = state;
  }

  getCurrentHorizon() {
    return this.state.config.horizons.current;
  }

  getHorizonPath(horizon) {
    return this.state.config.horizons.paths[horizon] || null;
  }

  listHorizons() {
    return Object.keys(this.state.config.horizons.paths).map(h => ({
      name: h,
      path: this.state.config.horizons.paths[h],
      isCurrent: h === this.state.config.horizons.current
    }));
  }

  switchHorizon(horizon) {
    if (!this.state.config.horizons.paths[horizon]) {
      console.error(`Error: Invalid horizon "${horizon}"`);
      return false;
    }

    this.state.config.horizons.current = horizon;
    this.state.saveConfig();
    
    console.log(`\nSwitched to horizon: ${horizon}`);
    console.log(`Path: ${this.state.config.horizons.paths[horizon]}`);
    
    return true;
  }

  createHorizonIfNotExists(horizon) {
    try {
      if (!this.state.config.horizons.paths[horizon]) {
        const horizonPath = path.join(process.cwd(), horizon);
        this.state.config.horizons.paths[horizon] = `./${horizon}`;
        this.state.saveConfig();
      }
      
      const horizonPath = path.resolve(process.cwd(), this.state.config.horizons.paths[horizon]);
      if (!fs.existsSync(horizonPath)) {
        fs.mkdirSync(horizonPath, { recursive: true });
        console.log(`Created horizon directory: ${horizonPath}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Error creating horizon ${horizon}:`, error.message);
      return false;
    }
  }
}

// Knowledge Manager
class KnowledgeManager {
  constructor(state) {
    this.state = state;
    this.knowledgeDir = path.join(process.cwd(), '.ollama-os', 'knowledge');
    
    // Ensure knowledge directory exists
    if (!fs.existsSync(this.knowledgeDir)) {
      fs.mkdirSync(this.knowledgeDir, { recursive: true });
    }
  }

  addKnowledge(topic, content) {
    try {
      const sanitizedTopic = topic.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const knowledgePath = path.join(this.knowledgeDir, `${sanitizedTopic}.md`);
      
      const timestamp = new Date().toISOString();
      const entry = `\n## Entry: ${timestamp}\n${content}\n`;
      
      // Append or create
      if (fs.existsSync(knowledgePath)) {
        fs.appendFileSync(knowledgePath, entry);
      } else {
        fs.writeFileSync(knowledgePath, `# Knowledge: ${topic}\n${entry}`);
      }
      
      console.log(`✅ Knowledge added to topic: ${topic}`);
      return true;
    } catch (error) {
      console.error('Error adding knowledge:', error.message);
      return false;
    }
  }

  getKnowledge(topic) {
    try {
      const sanitizedTopic = topic.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const knowledgePath = path.join(this.knowledgeDir, `${sanitizedTopic}.md`);
      
      if (fs.existsSync(knowledgePath)) {
        return fs.readFileSync(knowledgePath, 'utf8');
      }
    } catch (error) {
      console.error('Error retrieving knowledge:', error.message);
    }
    return null;
  }

  listKnowledgeTopics() {
    try {
      return fs.readdirSync(this.knowledgeDir)
        .filter(file => file.endsWith('.md'))
        .map(file => path.basename(file, '.md'));
    } catch (error) {
      console.error('Error listing knowledge topics:', error.message);
      return [];
    }
  }
}

// OllamaOS Main Class
class OllamaOS {
  constructor() {
    this.state = new OllamaOSState();
    this.agentSystem = new AgentSystem(this.state);
    this.modeManager = new ModeManager(this.state);
    this.horizonManager = new HorizonManager(this.state);
    this.knowledgeManager = new KnowledgeManager(this.state);
  }

  async initialize() {
    console.log(`\n${this.state.config.name} v${this.state.config.version}`);
    
    // Ensure horizons exist
    Object.keys(this.state.config.horizons.paths).forEach(horizon => {
      this.horizonManager.createHorizonIfNotExists(horizon);
    });
    
    const currentMode = this.modeManager.getCurrentMode();
    console.log(`Current mode: ${currentMode.icon} ${currentMode.name.toUpperCase()}`);
    
    const currentHorizon = this.horizonManager.getCurrentHorizon();
    console.log(`Current horizon: ${currentHorizon}`);
    
    return true;
  }

  processCommand(args) {
    if (args.length === 0) {
      return this.showHelp();
    }

    const command = args[0].toLowerCase();

    switch (command) {
      case 'init':
        console.log('Initializing OllamaOS...');
        this.state.saveConfig();
        console.log('✅ Configuration saved');
        break;
        
      case 'mode':
        if (args[1] === 'switch' && args[2]) {
          const reason = args.slice(3).join(' ');
          this.modeManager.switchMode(args[2], reason);
        } else if (args[1] === 'list') {
          console.log('\nAvailable modes:');
          this.modeManager.listModes().forEach(mode => {
            const current = mode.isCurrent ? '(active)' : '';
            console.log(`${mode.icon} ${mode.name.toUpperCase()} ${current}`);
          });
        } else {
          const currentMode = this.modeManager.getCurrentMode();
          console.log(`\nCurrent mode: ${currentMode.icon} ${currentMode.name.toUpperCase()}`);
        }
        break;
        
      case 'horizon':
        if (args[1] === 'switch' && args[2]) {
          this.horizonManager.switchHorizon(args[2]);
        } else if (args[1] === 'list') {
          console.log('\nAvailable horizons:');
          this.horizonManager.listHorizons().forEach(horizon => {
            const current = horizon.isCurrent ? '(active)' : '';
            console.log(`${horizon.name} [${horizon.path}] ${current}`);
          });
        } else if (args[1] === 'create' && args[2]) {
          const horizon = args[2];
          this.horizonManager.createHorizonIfNotExists(horizon);
          console.log(`✅ Horizon ${horizon} is ready`);
        } else {
          const currentHorizon = this.horizonManager.getCurrentHorizon();
          console.log(`\nCurrent horizon: ${currentHorizon}`);
          console.log(`Path: ${this.horizonManager.getHorizonPath(currentHorizon)}`);
        }
        break;
        
      case 'agent':
        if (args[1] === 'list') {
          console.log('\nAvailable agents:');
          this.agentSystem.getAvailableAgents().forEach(agent => {
            console.log(`- ${agent}`);
          });
        } else {
          console.log('Agent command requires a subcommand. Try "agent list".');
        }
        break;
        
      case 'run':
        if (args.length < 2) {
          console.log('Run command requires a task. Example: run "Create a component"');
        } else {
          const task = args.slice(1).join(' ');
          const mode = this.modeManager.getCurrentMode().name;
          const agent = this.agentSystem.getAgentForMode(mode);
          this.agentSystem.runAgent(agent, task);
        }
        break;
        
      case 'knowledge':
        if (args[1] === 'add' && args.length > 3) {
          const topic = args[2];
          const content = args.slice(3).join(' ');
          this.knowledgeManager.addKnowledge(topic, content);
        } else if (args[1] === 'get' && args[2]) {
          const topic = args[2];
          const knowledge = this.knowledgeManager.getKnowledge(topic);
          if (knowledge) {
            console.log(`\n=== Knowledge: ${topic} ===\n`);
            console.log(knowledge);
          } else {
            console.log(`No knowledge found for topic: ${topic}`);
          }
        } else if (args[1] === 'list') {
          const topics = this.knowledgeManager.listKnowledgeTopics();
          console.log('\nKnowledge topics:');
          topics.forEach(topic => console.log(`- ${topic}`));
        } else {
          console.log('Knowledge command requires a subcommand: add, get, or list');
        }
        break;
        
      case 'status':
        this.showStatus();
        break;
        
      case 'help':
        this.showHelp();
        break;
        
      default:
        console.log(`Unknown command: ${command}`);
        this.showHelp();
    }
  }

  showStatus() {
    console.log('\n=== OllamaOS Status ===');
    
    const currentMode = this.modeManager.getCurrentMode();
    console.log(`\nMode: ${currentMode.icon} ${currentMode.name.toUpperCase()}`);
    
    const currentHorizon = this.horizonManager.getCurrentHorizon();
    console.log(`Horizon: ${currentHorizon} [${this.horizonManager.getHorizonPath(currentHorizon)}]`);
    
    console.log(`Interactions: ${this.state.interactionCount}`);
    
    console.log('\nAvailable agents:');
    this.agentSystem.getAvailableAgents().forEach(agent => {
      console.log(`- ${agent}`);
    });
    
    const knowledgeTopics = this.knowledgeManager.listKnowledgeTopics();
    console.log(`\nKnowledge topics: ${knowledgeTopics.length}`);
    
    console.log('\nSystem directory:');
    console.log(path.join(process.cwd(), '.ollama-os'));
  }

  showHelp() {
    console.log(`
OllamaOS - Agent Operating System for the Ollama ecosystem

Usage:
  ollama-os [command] [subcommand] [options]

Commands:
  init                 Initialize OllamaOS in the current directory
  
  mode                 Show current mode
  mode list            List available modes
  mode switch <mode>   Switch to a different mode
  
  horizon              Show current horizon
  horizon list         List available horizons
  horizon switch <h>   Switch to a different horizon
  horizon create <h>   Create a new horizon
  
  agent list           List available agents
  
  run "<task>"         Execute a task with the appropriate agent
  
  knowledge list                  List knowledge topics
  knowledge get <topic>           Retrieve knowledge on a topic
  knowledge add <topic> <content> Add knowledge on a topic
  
  status               Show system status
  help                 Show this help message
`);
  }
}

// Command-line execution
async function main() {
  try {
    const os = new OllamaOS();
    
    // Initialize tool call monitor
    try {
      const { initializeToolCallMonitor } = require('./ollama-os-tool-call-monitor');
      initializeToolCallMonitor(os);
      console.log('[OllamaOS] Tool call monitoring initialized');
    } catch (err) {
      console.warn('[OllamaOS] Tool call monitoring could not be initialized:', err.message);
    }
    
    await os.initialize();
    
    // Process command line arguments
    const args = process.argv.slice(2);
    os.processCommand(args);
  } catch (err) {
    console.error('Error executing OllamaOS:', err);
  }
}

// Run the main function if this script is executed directly
if (require.main === module) {
  main().catch(err => {
    console.error('Error executing OllamaOS:', err);
    process.exit(1);
  });
}

module.exports = OllamaOS; 