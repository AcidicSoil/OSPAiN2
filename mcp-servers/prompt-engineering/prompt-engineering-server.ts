/**
 * mcp-servers/prompt-engineering/prompt-engineering-server.ts
 *
 * Prompt Engineering Assistant MCP Server implementation.
 * Provides text summarization capabilities through the summarize_text tool.
 */

import axios from "axios";
import { MCPServer, MCPServerConfig } from "../shared/mcp-server";
import {
  MCPTool,
  MCPToolRequest,
  MCPToolResponse,
  MCPResourceRequest,
  MCPResourceResponse,
  MCPPromptRequest,
  MCPPromptResponse,
  MCPToolParameter,
} from "../shared/mcp-types";
import {
  ModeAwareService,
  DevelopmentMode,
  AVAILABLE_MODES,
  ModeChangeEvent,
  ModeInfo,
  Optimizations,
} from "../utils/mode-aware";

// Default templates
const DEFAULT_TEMPLATES = {
  default: "Summarize the following text concisely:\n\n{{text}}",
  technical:
    "Provide a technical summary of the following content, focusing on key components, technologies, and processes:\n\n{{text}}",
  executive:
    "Create an executive summary highlighting key business points, decisions, and outcomes from the following:\n\n{{text}}",
  bullet:
    "Extract the key points from the following text as a bullet-point list:\n\n{{text}}",
  tldr: "Provide a TL;DR (Too Long; Didn't Read) summary of the following text in 1-2 sentences:\n\n{{text}}",
};

// Mode-specific template sets
const MODE_TEMPLATES: Record<DevelopmentMode, Record<string, string>> = {
  design: {
    ui: "Summarize the UI-related aspects of the following, focusing on layout, components, and user interactions:\n\n{{text}}",
    ux: "Extract the user experience considerations from the following text:\n\n{{text}}",
    accessibility:
      "Summarize accessibility considerations in the following text:\n\n{{text}}",
    component:
      "Identify key components and their relationships in the following design text:\n\n{{text}}",
    visual:
      "Summarize visual design elements mentioned in the following text:\n\n{{text}}",
  },
  engineering: {
    architecture:
      "Extract the architectural patterns and decisions from the following text:\n\n{{text}}",
    implementation:
      "Summarize the implementation details and code patterns from the following:\n\n{{text}}",
    api: "Extract API details, endpoints, and functionalities from the following text:\n\n{{text}}",
    performance:
      "Identify performance considerations and optimizations in the following text:\n\n{{text}}",
    security:
      "Summarize security aspects and considerations from the following text:\n\n{{text}}",
  },
  testing: {
    testcase:
      "Transform the following text into potential test cases:\n\n{{text}}",
    coverage:
      "Identify what needs to be tested based on the following text:\n\n{{text}}",
    scenario:
      "Extract testing scenarios and edge cases from the following text:\n\n{{text}}",
    validation:
      "Summarize validation requirements from the following text:\n\n{{text}}",
    regression:
      "Identify potential regression issues from the following text:\n\n{{text}}",
  },
  deployment: {
    release:
      "Create a release note summary from the following text:\n\n{{text}}",
    configuration:
      "Extract configuration requirements from the following text:\n\n{{text}}",
    migration:
      "Identify migration steps or considerations from the following text:\n\n{{text}}",
    infrastructure:
      "Summarize infrastructure requirements from the following text:\n\n{{text}}",
    monitoring:
      "Extract monitoring and alerting considerations from the following text:\n\n{{text}}",
  },
  maintenance: {
    issue:
      "Summarize the issue description and potential causes from the following text:\n\n{{text}}",
    debug:
      "Extract debugging steps and information from the following text:\n\n{{text}}",
    improvement:
      "Identify potential improvements or optimizations from the following text:\n\n{{text}}",
    support:
      "Create a customer support response based on the following text:\n\n{{text}}",
    documentation:
      "Summarize documentation needs or changes from the following text:\n\n{{text}}",
  },
};

/**
 * Prompt Engineering Assistant Server
 */
export class PromptEngineeringServer extends MCPServer {
  private ollamaEndpoint: string;
  private ollamaModel: string;
  private modeService: ModeAwareService;
  private cachingStrategy: string = "default";
  private templates: Record<string, string> = {};

  constructor(
    config: MCPServerConfig & { ollamaEndpoint?: string; ollamaModel?: string }
  ) {
    super(config);

    this.ollamaEndpoint =
      config.ollamaEndpoint ||
      process.env.OLLAMA_ENDPOINT ||
      "http://localhost:11434";
    this.ollamaModel =
      config.ollamaModel || process.env.OLLAMA_MODEL || "llama3";

    // Initialize mode awareness
    this.modeService = new ModeAwareService("prompt_engineering");
    this.modeService.on("modeChanged", this.handleModeChange.bind(this));

    // Apply initial mode-specific settings
    this.applyModeSpecificSettings();

    // Register the summarize_text tool
    this.registerSummarizeTextTool();

    // Log initialization
    console.log(`[${this.name}] Prompt Engineering Server initialized`);
    console.log(`[${this.name}] Using Ollama endpoint: ${this.ollamaEndpoint}`);
    console.log(`[${this.name}] Using model: ${this.ollamaModel}`);
    console.log(
      `[${this.name}] Current mode: ${this.modeService.getCurrentMode().name}`
    );
  }

  /**
   * Handle mode changes
   */
  private handleModeChange(modeInfo: ModeChangeEvent): void {
    console.log(
      `[${this.name}] Mode changed from ${modeInfo.oldMode || "none"} to ${
        modeInfo.newMode
      }`
    );
    this.applyModeSpecificSettings();
  }

  /**
   * Apply mode-specific settings
   */
  private applyModeSpecificSettings(): void {
    const currentMode = this.modeService.getCurrentMode();
    const optimizations =
      this.modeService.getOptimizationsForService("prompt_engineering");

    // Update server settings based on mode
    this.cachingStrategy = optimizations.cachingStrategy;
    this.verbose = optimizations.verboseLogging;

    // Set up templates based on mode
    this.templates = { ...DEFAULT_TEMPLATES };

    // Add mode-specific templates if available
    if (currentMode.mode && MODE_TEMPLATES[currentMode.mode]) {
      Object.assign(this.templates, MODE_TEMPLATES[currentMode.mode]);
      console.log(
        `[${this.name}] Loaded ${
          Object.keys(MODE_TEMPLATES[currentMode.mode]).length
        } templates for ${currentMode.name}`
      );
    }

    console.log(
      `[${this.name}] Applied mode-specific settings for ${currentMode.name}`
    );
    console.log(`[${this.name}] Caching strategy: ${this.cachingStrategy}`);
    console.log(`[${this.name}] Verbose logging: ${this.verbose}`);
  }

  /**
   * Register the summarize_text tool
   */
  private registerSummarizeTextTool(): void {
    const parameters: MCPToolParameter[] = [
      {
        name: "text",
        type: "string",
        description: "The text to summarize",
        required: true,
      },
      {
        name: "template",
        type: "string",
        description: "Template name to use for summarization",
        default: "default",
      },
      {
        name: "max_length",
        type: "number",
        description: "Maximum length of the summary",
        default: 200,
      },
    ];

    const tool: MCPTool = {
      name: "summarize_text",
      description: "Summarizes text using configured templates",
      parameters,
      output: {
        type: "string",
        description: "Summarized text",
      },
    };

    this.registerTool(tool);

    // Register get_available_templates tool
    this.registerTool({
      name: "get_available_templates",
      description: "Returns a list of available templates for the current mode",
      parameters: [],
      output: {
        type: "object",
        description: "Object containing available templates",
      },
    });

    // Register get_current_mode tool
    this.registerTool({
      name: "get_current_mode",
      description: "Returns information about the current development mode",
      parameters: [],
      output: {
        type: "object",
        description: "Object containing mode information",
      },
    });
  }

  /**
   * Execute a tool
   */
  protected async executeTool(
    request: MCPToolRequest
  ): Promise<MCPToolResponse> {
    const { id, tool, parameters } = request;

    switch (tool) {
      case "summarize_text":
        return this.executeSummarizeText(id, parameters);

      case "get_available_templates":
        return {
          id,
          tool,
          success: true,
          result: this.templates,
          metadata: {
            mode: this.modeService.getCurrentMode(),
          },
        };

      case "get_current_mode":
        return {
          id,
          tool,
          success: true,
          result: this.modeService.getCurrentMode(),
          metadata: {
            optimizations:
              this.modeService.getOptimizationsForService("prompt_engineering"),
          },
        };

      default:
        return {
          id,
          tool,
          success: false,
          error: `Tool '${tool}' not supported by Prompt Engineering Server`,
        };
    }
  }

  /**
   * Execute the summarize_text tool
   */
  private async executeSummarizeText(
    id: string,
    parameters: any
  ): Promise<MCPToolResponse> {
    try {
      const { text, template = "default", max_length = 200 } = parameters;

      if (!text) {
        return {
          id,
          tool: "summarize_text",
          success: false,
          error: "Missing required parameter: text",
        };
      }

      // Get template with mode-awareness
      const templateText =
        this.templates[template] ||
        this.templates.default ||
        DEFAULT_TEMPLATES.default;
      const prompt = templateText.replace("{{text}}", text);

      // Check cache based on cachingStrategy if not in testing mode
      if (
        this.cachingStrategy !== "minimal" &&
        this.modeService.getCurrentMode().mode !== "testing"
      ) {
        // Cache implementation would go here
        this.verbose &&
          console.log(
            `[${this.name}] Using caching strategy: ${this.cachingStrategy}`
          );
      }

      const summary = await this.getSummary(prompt, max_length);

      return {
        id,
        tool: "summarize_text",
        success: true,
        result: summary,
        metadata: {
          template,
          mode: this.modeService.getCurrentMode().mode,
          caching_strategy: this.cachingStrategy,
          original_length: text.length,
          summary_length: summary.length,
        },
      };
    } catch (error: any) {
      console.error(`[${this.name}] Summarization error:`, error);
      return {
        id,
        tool: "summarize_text",
        success: false,
        error: error.message || "Failed to summarize text",
      };
    }
  }

  /**
   * Get a summary from the Ollama API
   */
  private async getSummary(prompt: string, maxLength: number): Promise<string> {
    try {
      const response = await axios.post(`${this.ollamaEndpoint}/api/generate`, {
        model: this.ollamaModel,
        prompt,
        options: {
          temperature: 0.3,
          top_p: 0.9,
          max_length: maxLength,
        },
      });

      return response.data.response || "No summary generated";
    } catch (error: any) {
      console.error(`[${this.name}] Ollama API error:`, error);
      throw new Error(`Failed to get summary: ${error.message}`);
    }
  }

  /**
   * Get a resource
   */
  protected async getResource(
    request: MCPResourceRequest
  ): Promise<MCPResourceResponse> {
    // This server doesn't provide resources
    return {
      id: request.id,
      resource: request.resource,
      success: false,
      error: "Resources not implemented in Prompt Engineering Server",
    };
  }

  /**
   * Execute a prompt
   */
  protected async executePrompt(
    request: MCPPromptRequest
  ): Promise<MCPPromptResponse> {
    // This server doesn't provide prompts
    return {
      id: request.id,
      prompt: request.prompt,
      success: false,
      error: "Prompts not implemented in Prompt Engineering Server",
    };
  }

  /**
   * Override the stop method to clean up mode service
   */
  public stop(): void {
    // Clean up mode service
    this.modeService.cleanup();

    // Call parent implementation
    super.stop();
  }
}

/**
 * Start the server if run directly
 */
if (require.main === module) {
  // Parse command-line arguments
  const args = process.argv.slice(2);
  const portArg = args.indexOf("--port");
  const modeArg = args.indexOf("--mode");
  const optimizeForArg = args.indexOf("--optimize-for");
  const verboseArg = args.indexOf("--verbose");

  const port =
    portArg !== -1 && portArg < args.length - 1
      ? parseInt(args[portArg + 1], 10)
      : parseInt(process.env.PROMPT_ENGINEERING_PORT || "3001", 10);

  const mode =
    modeArg !== -1 && modeArg < args.length - 1
      ? args[modeArg + 1]
      : process.env.DEVELOPMENT_MODE;

  const optimizeFor =
    optimizeForArg !== -1 && optimizeForArg < args.length - 1
      ? args[optimizeForArg + 1]
      : undefined;

  const verbose =
    verboseArg !== -1
      ? verboseArg + 1 < args.length && args[verboseArg + 1] === "true"
      : process.env.VERBOSE === "true";

  // If a specific mode was provided, set it in the environment
  if (mode) {
    process.env.DEVELOPMENT_MODE = mode;
  }

  const server = new PromptEngineeringServer({
    name: "Prompt Engineering Assistant",
    port,
    version: "1.0.0",
    description: "MCP server for prompt engineering and text summarization",
    verbose,
  });

  server.start();
}
