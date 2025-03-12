/**
 * mcp-servers/shared/integrations/ollama-service.ts
 *
 * Ollama integration service for MCP servers.
 * Provides an interface to interact with the Ollama API.
 */

import axios from "axios";

interface OllamaServiceOptions {
  endpoint: string; // Ollama API endpoint
  model: string; // Default model to use
  timeout?: number; // Request timeout in milliseconds
}

interface OllamaGenerateOptions {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stream?: boolean;
}

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_duration?: number;
  eval_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

/**
 * Ollama service for interacting with Ollama API
 */
export class OllamaService {
  private endpoint: string;
  private model: string;
  private timeout: number;

  /**
   * Create a new Ollama service
   * @param options Service configuration options
   */
  constructor(options: OllamaServiceOptions) {
    this.endpoint = options.endpoint.endsWith("/")
      ? options.endpoint.slice(0, -1)
      : options.endpoint;
    this.model = options.model;
    this.timeout = options.timeout || 30000; // Default: 30 seconds
  }

  /**
   * Get the name of the current model
   * @returns The model name
   */
  public getModelName(): string {
    return this.model;
  }

  /**
   * Generate text using Ollama
   * @param prompt The prompt to send to Ollama
   * @param options Optional generation parameters
   * @returns The generated text
   */
  public async generateText(
    prompt: string | OllamaGenerateOptions,
    options?: Partial<OllamaGenerateOptions>
  ): Promise<string> {
    let requestOptions: OllamaGenerateOptions;

    if (typeof prompt === "string") {
      requestOptions = {
        prompt,
        model: options?.model || this.model,
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
        topP: options?.topP,
        topK: options?.topK,
        frequencyPenalty: options?.frequencyPenalty,
        presencePenalty: options?.presencePenalty,
        stream: false,
      };
    } else {
      requestOptions = {
        ...prompt,
        model: prompt.model || this.model,
        stream: false,
      };
    }

    // Clean up undefined values
    Object.keys(requestOptions).forEach((key) => {
      if (requestOptions[key as keyof OllamaGenerateOptions] === undefined) {
        delete requestOptions[key as keyof OllamaGenerateOptions];
      }
    });

    // Convert to Ollama API format
    const requestBody = {
      model: requestOptions.model,
      prompt: requestOptions.prompt,
      stream: false,
      options: {
        temperature: requestOptions.temperature,
        num_predict: requestOptions.maxTokens,
        top_p: requestOptions.topP,
        top_k: requestOptions.topK,
        frequency_penalty: requestOptions.frequencyPenalty,
        presence_penalty: requestOptions.presencePenalty,
      },
    };

    // Clean up undefined values in options
    if (requestBody.options) {
      Object.keys(requestBody.options).forEach((key) => {
        if (requestBody.options[key] === undefined) {
          delete requestBody.options[key];
        }
      });

      // Remove options if empty
      if (Object.keys(requestBody.options).length === 0) {
        delete requestBody.options;
      }
    }

    try {
      const response = await axios.post<OllamaResponse>(
        `${this.endpoint}/api/generate`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: this.timeout,
        }
      );

      return response.data.response;
    } catch (error) {
      console.error(`[OllamaService] Error generating text:`, error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Ollama API error: ${error.message} (${
            error.response?.status || "unknown status"
          })`
        );
      }
      throw new Error(
        `Ollama API error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Generate embeddings for text using Ollama
   * @param text The text to generate embeddings for
   * @param model Optional model to use (defaults to the service's model)
   * @returns The embeddings array
   */
  public async generateEmbeddings(
    text: string,
    model?: string
  ): Promise<number[]> {
    try {
      const response = await axios.post(
        `${this.endpoint}/api/embeddings`,
        {
          model: model || this.model,
          prompt: text,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: this.timeout,
        }
      );

      return response.data.embedding;
    } catch (error) {
      console.error(`[OllamaService] Error generating embeddings:`, error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Ollama API error: ${error.message} (${
            error.response?.status || "unknown status"
          })`
        );
      }
      throw new Error(
        `Ollama API error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * List available models from Ollama
   * @returns Array of model information
   */
  public async listModels(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.endpoint}/api/tags`, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: this.timeout,
      });

      return response.data.models;
    } catch (error) {
      console.error(`[OllamaService] Error listing models:`, error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Ollama API error: ${error.message} (${
            error.response?.status || "unknown status"
          })`
        );
      }
      throw new Error(
        `Ollama API error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Check if Ollama is available
   * @returns True if Ollama is available
   */
  public async isAvailable(): Promise<boolean> {
    try {
      await axios.get(`${this.endpoint}/api/version`, {
        timeout: 5000, // Short timeout for check
      });
      return true;
    } catch {
      return false;
    }
  }
}
