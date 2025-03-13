import { TodoItem } from '../types/todo';
/**
 * Response structure from the LLM processing
 */
export interface LLMResponse {
    title: string;
    description: string;
    tags: string[];
    category: string;
    priority: 1 | 2 | 3 | 4 | 5;
    horizon: 'H1' | 'H2' | 'H3';
    status: TodoItem['status'];
    rationale: string;
}
interface ArchitectureRecommendation {
    title: string;
    description: string;
    implementation?: string;
    benefits?: string[];
}
interface ArchitectureRecommendationsResponse {
    overview: string;
    recommendations: ArchitectureRecommendation[];
}
/**
 * LLM Middleware Service for enhancing todo items
 *
 * This service processes user input for todos through an LLM to suggest
 * refined descriptions, appropriate tags, categories, and priorities
 * based on context from the knowledge graph and development philosophy.
 */
export declare class LLMMiddlewareService {
    private modelName;
    private llmEndpoint;
    private cacheDir;
    /**
     * Create a new LLM middleware service
     *
     * @param modelName The Ollama model to use
     */
    constructor(modelName?: string, _kgEndpoint?: string);
    /**
     * Initialize the LLM middleware service
     */
    init(): Promise<void>;
    /**
     * Process a todo description through the LLM
     *
     * @param userInput User's initial todo description
     * @returns Enhanced todo suggestions
     */
    processTodo(userInput: string): Promise<LLMResponse>;
    /**
     * Call the LLM with a prompt
     *
     * @param prompt The prompt to send to the LLM
     * @returns The LLM response
     */
    callLLM(prompt: string): Promise<string>;
    /**
     * Get architecture recommendations for the project
     *
     * @param projectDescription Description of the project
     * @returns Architecture recommendations
     */
    getArchitectureRecommendations(projectDescription: string): Promise<ArchitectureRecommendationsResponse>;
    /**
     * Get AI recommendations for remixing specific parts of a todo
     *
     * @param todo The original todo item
     * @param partsToRemix Array of parts to be remixed (e.g., ['title', 'description', 'tags'])
     * @returns Suggested improvements for each part
     */
    getRemixSuggestions(todo: Partial<TodoItem>, partsToRemix: string[]): Promise<Record<string, any>>;
}
export {};
