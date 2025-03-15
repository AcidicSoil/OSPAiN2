"use strict";
/**
 * mcp-servers/shared/integrations/ollama-service.ts
 *
 * Ollama integration service for MCP servers.
 * Provides an interface to interact with the Ollama API.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaService = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Ollama service for interacting with Ollama API
 */
class OllamaService {
    /**
     * Create a new Ollama service
     * @param options Service configuration options
     */
    constructor(options) {
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
    getModelName() {
        return this.model;
    }
    /**
     * Generate text using Ollama
     * @param prompt The prompt to send to Ollama
     * @param options Optional generation parameters
     * @returns The generated text
     */
    async generateText(prompt, options) {
        let requestOptions;
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
        }
        else {
            requestOptions = {
                ...prompt,
                model: prompt.model || this.model,
                stream: false,
            };
        }
        // Clean up undefined values
        Object.keys(requestOptions).forEach((key) => {
            if (requestOptions[key] === undefined) {
                delete requestOptions[key];
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
            const response = await axios_1.default.post(`${this.endpoint}/api/generate`, requestBody, {
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: this.timeout,
            });
            return response.data.response;
        }
        catch (error) {
            console.error(`[OllamaService] Error generating text:`, error);
            if (axios_1.default.isAxiosError(error)) {
                throw new Error(`Ollama API error: ${error.message} (${error.response?.status || "unknown status"})`);
            }
            throw new Error(`Ollama API error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Generate embeddings for text using Ollama
     * @param text The text to generate embeddings for
     * @param model Optional model to use (defaults to the service's model)
     * @returns The embeddings array
     */
    async generateEmbeddings(text, model) {
        try {
            const response = await axios_1.default.post(`${this.endpoint}/api/embeddings`, {
                model: model || this.model,
                prompt: text,
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: this.timeout,
            });
            return response.data.embedding;
        }
        catch (error) {
            console.error(`[OllamaService] Error generating embeddings:`, error);
            if (axios_1.default.isAxiosError(error)) {
                throw new Error(`Ollama API error: ${error.message} (${error.response?.status || "unknown status"})`);
            }
            throw new Error(`Ollama API error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * List available models from Ollama
     * @returns Array of model information
     */
    async listModels() {
        try {
            const response = await axios_1.default.get(`${this.endpoint}/api/tags`, {
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: this.timeout,
            });
            return response.data.models;
        }
        catch (error) {
            console.error(`[OllamaService] Error listing models:`, error);
            if (axios_1.default.isAxiosError(error)) {
                throw new Error(`Ollama API error: ${error.message} (${error.response?.status || "unknown status"})`);
            }
            throw new Error(`Ollama API error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Check if Ollama is available
     * @returns True if Ollama is available
     */
    async isAvailable() {
        try {
            await axios_1.default.get(`${this.endpoint}/api/version`, {
                timeout: 5000, // Short timeout for check
            });
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.OllamaService = OllamaService;
//# sourceMappingURL=ollama-service.js.map