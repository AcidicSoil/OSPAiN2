/**
 * Sovereign Agent Framework - Model Context Protocol (MCP) Integration
 * Part of Horizon 3 (Future) implementation for Ollama Ecosystem.
 * 
 * @context: Connected to agent-creed.js for core functionality
 * @context: Provides integration with MCP-compatible LLM applications
 * @https://glama.ai/mcp/servers/un2zatig9e/blob/master/README.md for design patterns
 */

// This implementation assumes a fastmcp-like library is available
// You would need to install such a library or implement the MCP protocol directly
const { SovereignAgentCreed } = require('../agent-creed');
const { SovereignAgentViz } = require('../visualization');

/**
 * Create an MCP server for the Sovereign Agent framework
 * @param {Object} options - Configuration options
 * @returns {Object} MCP server instance
 */
function createSovereignAgentMCP(options = {}) {
  // Assuming a fastmcp-like API for creating an MCP server
  const fastmcp = require('fastmcp'); // This would need to be installed
  
  const server = fastmcp.createServer({
    name: 'sovereign-agent-mcp',
    description: 'A Model Context Protocol server that provides Socratic-Stoic philosophical framework for LLMs',
    version: '0.1.0',
    ...options.serverOptions
  });
  
  // Initialize the creed
  const creed = new SovereignAgentCreed({
    reflectionFrequency: options.reflectionFrequency || 10,
    virtueThreshold: options.virtueThreshold || 0.7,
    introspectionDepth: options.introspectionDepth || 3,
    ...options.creedOptions
  });
  
  // Initialize visualization utilities
  const viz = new SovereignAgentViz();
  
  // Register MCP tools
  
  // Tool: Evaluate a proposed action against virtuous principles
  server.registerTool('evaluate_decision', {
    description: 'Evaluates a proposed action against the four virtues of wisdom, justice, courage, and temperance',
    parameters: {
      type: 'object',
      properties: {
        proposed_action: {
          type: 'string',
          description: 'The action to evaluate'
        },
        alternatives: {
          type: 'array',
          items: {
            type: 'string'
          },
          description: 'Optional alternative approaches to consider'
        }
      },
      required: ['proposed_action']
    },
    handler: async (params) => {
      const { proposed_action, alternatives = [] } = params;
      
      try {
        const decision = creed.evaluateDecision(proposed_action, alternatives);
        
        // Record the interaction
        creed.recordInteraction({
          type: 'decision_evaluation',
          summary: `MCP evaluated: "${proposed_action}"`,
          virtueAlignment: decision.virtueAlignment
        });
        
        return {
          result: decision,
          visualization: viz.createCompactVirtueVisualization(decision.virtueAlignment)
        };
      } catch (error) {
        return {
          error: `Failed to evaluate decision: ${error.message}`
        };
      }
    }
  });
  
  // Tool: Generate a contextual creed for a specific situation
  server.registerTool('generate_contextual_creed', {
    description: 'Generates a situation-specific creed based on Socratic-Stoic principles',
    parameters: {
      type: 'object',
      properties: {
        situation: {
          type: 'string',
          description: 'The specific situation for which to generate a creed'
        }
      },
      required: ['situation']
    },
    handler: async (params) => {
      const { situation } = params;
      
      try {
        const contextualCreed = creed.generateContextualCreed(situation);
        
        // Record the interaction
        creed.recordInteraction({
          type: 'contextual_creed',
          summary: `MCP generated creed for: "${situation}"`
        });
        
        return {
          creed: contextualCreed
        };
      } catch (error) {
        return {
          error: `Failed to generate contextual creed: ${error.message}`
        };
      }
    }
  });
  
  // Tool: Process an error through a Stoic lens
  server.registerTool('process_error', {
    description: 'Processes an error through a Stoic lens, extracting learning and maintaining equanimity',
    parameters: {
      type: 'object',
      properties: {
        error_message: {
          type: 'string',
          description: 'The error message to process'
        },
        error_context: {
          type: 'object',
          description: 'Additional context about the error',
          additionalProperties: true
        }
      },
      required: ['error_message']
    },
    handler: async (params) => {
      const { error_message, error_context = {} } = params;
      
      try {
        const error = new Error(error_message);
        Object.assign(error, error_context);
        
        const recovery = creed.processError(error);
        
        return {
          recovery: recovery
        };
      } catch (error) {
        return {
          error: `Failed to process error: ${error.message}`
        };
      }
    }
  });
  
  // Tool: Enhance a response with philosophical context
  server.registerTool('enhance_with_context', {
    description: 'Enhances a response with meta-cognitive philosophical context',
    parameters: {
      type: 'object',
      properties: {
        response: {
          type: 'string',
          description: 'The response to enhance'
        }
      },
      required: ['response']
    },
    handler: async (params) => {
      const { response } = params;
      
      try {
        const enhancedResponse = creed.enhanceWithContext(response);
        
        // Record the interaction
        creed.recordInteraction({
          type: 'response_enhancement',
          summary: 'Enhanced response via MCP'
        });
        
        return {
          original: response,
          enhanced: enhancedResponse
        };
      } catch (error) {
        return {
          error: `Failed to enhance response: ${error.message}`
        };
      }
    }
  });
  
  // Tool: Perform a reflection on past interactions
  server.registerTool('perform_reflection', {
    description: 'Performs a reflection on past interactions, identifying patterns and suggesting improvements',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    handler: async () => {
      try {
        const reflection = creed.performReflection();
        
        return {
          reflection: reflection,
          visualization: viz.createReflectionTimeline(creed.reflectionLog || [], 5)
        };
      } catch (error) {
        return {
          error: `Failed to perform reflection: ${error.message}`
        };
      }
    }
  });
  
  // Tool: Get virtue definitions and core principles
  server.registerTool('get_virtue_definitions', {
    description: 'Returns definitions of the four cardinal virtues and core principles',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    handler: async () => {
      try {
        const virtues = {
          wisdom: {
            definition: "The ability to discern what is true and right; sound judgment and understanding.",
            examples: [
              "Seeking the root cause rather than treating symptoms",
              "Questioning assumptions before proceeding",
              "Deliberating carefully on complex decisions"
            ]
          },
          justice: {
            definition: "The quality of being fair and reasonable; treating all with respect and equity.",
            examples: [
              "Giving proper credit for others' work",
              "Providing balanced perspectives",
              "Ensuring fair access to resources and opportunities"
            ]
          },
          courage: {
            definition: "The ability to face difficulty, uncertainty, or pain without being overcome by fear.",
            examples: [
              "Acknowledging mistakes and learning from them",
              "Speaking difficult truths tactfully",
              "Trying new approaches when current ones aren't working"
            ]
          },
          temperance: {
            definition: "Self-restraint and moderation; balancing contrasting needs and priorities.",
            examples: [
              "Maintaining balance between thoroughness and timeliness",
              "Avoiding unnecessarily complex solutions",
              "Restraining from overcommitment or extreme positions"
            ]
          }
        };
        
        const principles = creed.corePrinciples();
        
        return {
          virtues: virtues,
          principles: principles
        };
      } catch (error) {
        return {
          error: `Failed to get virtue definitions: ${error.message}`
        };
      }
    }
  });
  
  // Support for visualization exports
  server.registerTool('create_visualization', {
    description: 'Creates an ASCII visualization of virtue data or reflection timelines',
    parameters: {
      type: 'object',
      properties: {
        visualization_type: {
          type: 'string',
          enum: ['bar_chart', 'radar_chart', 'compact_virtue', 'reflection_timeline', 'concept_map'],
          description: 'The type of visualization to create'
        },
        data: {
          type: 'object',
          description: 'The data to visualize (structure depends on visualization_type)',
          additionalProperties: true
        }
      },
      required: ['visualization_type', 'data']
    },
    handler: async (params) => {
      const { visualization_type, data } = params;
      
      try {
        let visualization;
        
        switch (visualization_type) {
          case 'bar_chart':
            visualization = viz.createBarChart(data.values, data.title);
            break;
          case 'radar_chart':
            visualization = viz.createRadarChart(data.virtueAlignment, data.title);
            break;
          case 'compact_virtue':
            visualization = viz.createCompactVirtueVisualization(data.virtueAlignment);
            break;
          case 'reflection_timeline':
            visualization = viz.createReflectionTimeline(data.reflectionLog, data.limit);
            break;
          case 'concept_map':
            visualization = viz.createConceptMap(data.concepts);
            break;
          default:
            throw new Error(`Unsupported visualization type: ${visualization_type}`);
        }
        
        return {
          visualization: visualization
        };
      } catch (error) {
        return {
          error: `Failed to create visualization: ${error.message}`
        };
      }
    }
  });
  
  // Start tracking when the server starts
  server.on('start', () => {
    console.log('Sovereign Agent MCP Server started');
    // Initialize with a morning priming
    creed.performMorningPriming();
  });
  
  return server;
}

/**
 * Example usage of the MCP server
 */
function exampleUsage() {
  const server = createSovereignAgentMCP({
    reflectionFrequency: 5,
    virtueThreshold: 0.7
  });
  
  // Start the server
  server.start({ port: 3030 });
  
  console.log('Example MCP server for Sovereign Agent started on port 3030');
  console.log('Available tools:');
  console.log('- evaluate_decision: Evaluate actions against virtuous principles');
  console.log('- generate_contextual_creed: Generate situation-specific creeds');
  console.log('- process_error: Process errors through a Stoic lens');
  console.log('- enhance_with_context: Enhance responses with philosophical context');
  console.log('- perform_reflection: Reflect on past interactions');
  console.log('- get_virtue_definitions: Get virtue definitions and core principles');
  console.log('- create_visualization: Generate ASCII visualizations');
}

/**
 * Configuration for integrating with MCP client tooling
 * Example for .mcpconfig or similar configuration file
 */
const mcpConfig = {
  "mcpServers": {
    "sovereign-agent-mcp": {
      "command": "node",
      "args": ["path/to/server.js"],
      "description": "A Socratic-Stoic philosophical framework for LLMs"
    }
  }
};

module.exports = {
  createSovereignAgentMCP,
  exampleUsage,
  mcpConfig
}; 