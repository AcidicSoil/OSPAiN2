import { TodoItem } from '../types/todo';
import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';

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
export class LLMMiddlewareService {
  private modelName: string;
  private llmEndpoint: string;
  private cacheDir: string;

  /**
   * Create a new LLM middleware service
   *
   * @param modelName The Ollama model to use
   */
  constructor(
    modelName: string = 'qwen:1.5-0.5b-chat-q4_0',
    _kgEndpoint: string = 'http://localhost:3005/api/query'
  ) {
    this.modelName = modelName;
    this.llmEndpoint = process.env.LLM_ENDPOINT || 'http://localhost:11434/api/generate';
    this.cacheDir = path.join(process.cwd(), 'cache', 'llm');
  }

  /**
   * Initialize the LLM middleware service
   */
  async init(): Promise<void> {
    // Ensure cache directory exists
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create LLM cache directory:', error);
    }
  }

  /**
   * Process a todo description through the LLM
   *
   * @param userInput User's initial todo description
   * @returns Enhanced todo suggestions
   */
  async processTodo(userInput: string): Promise<LLMResponse> {
    try {
      // Check if we have a cached response
      const cacheKey = `todo-${userInput.trim().toLowerCase()}`;
      const cachePath = path.join(this.cacheDir, `${cacheKey}.json`);

      // Try to read from cache
      try {
        const cacheData = await fs.readFile(cachePath, 'utf-8');
        return JSON.parse(cacheData) as LLMResponse;
      } catch (error) {
        // Cache miss, continue with LLM processing
      }

      const prompt = `
You are a task management assistant. Help me refine this todo item with appropriate tags, category, priority, and status.
Format your response as JSON with the following fields:
- title: A clear, concise title (max 80 chars)
- description: Detailed description of the task
- tags: Array of relevant tags (3-5 tags)
- category: Single category that best fits the task
- priority: Number from 1-5 (1 = highest, 5 = lowest)
- horizon: One of "H1" (urgent), "H2" (medium-term), or "H3" (long-term)
- status: One of "not-started", "in-progress", "blocked", "completed", or "recurring"
- rationale: Brief explanation of your choices

Todo: ${userInput}
`;

      const response = await this.callLLM(prompt);

      try {
        // Parse the response as JSON
        const jsonMatch =
          response.match(/```json\n([\s\S]*?)\n```/) ||
          response.match(/```\n([\s\S]*?)\n```/) ||
          response.match(/({[\s\S]*})/);

        if (jsonMatch && jsonMatch[1]) {
          const parsedResponse = JSON.parse(jsonMatch[1]) as LLMResponse;

          // Validate the response
          if (!parsedResponse.title || !parsedResponse.tags || !parsedResponse.priority) {
            throw new Error('Invalid response format');
          }

          // Cache the response
          await fs.writeFile(cachePath, JSON.stringify(parsedResponse), 'utf-8');

          return parsedResponse;
        } else {
          throw new Error('Could not extract JSON from response');
        }
      } catch (error) {
        console.error('Failed to parse LLM response:', error);
        // Fallback response
        const fallback: LLMResponse = {
          title: userInput.length > 80 ? userInput.substring(0, 77) + '...' : userInput,
          description: userInput,
          tags: ['general'],
          category: 'general',
          priority: 3,
          horizon: 'H2',
          status: 'not-started',
          rationale: 'Generated as fallback due to processing error',
        };
        return fallback;
      }
    } catch (error) {
      console.error('Error processing todo with LLM:', error);
      // Fallback response
      return {
        title: userInput.length > 80 ? userInput.substring(0, 77) + '...' : userInput,
        description: userInput,
        tags: ['general'],
        category: 'general',
        priority: 3,
        horizon: 'H2',
        status: 'not-started',
        rationale: 'Generated as fallback due to processing error',
      };
    }
  }

  /**
   * Call the LLM with a prompt
   *
   * @param prompt The prompt to send to the LLM
   * @returns The LLM response
   */
  public async callLLM(prompt: string): Promise<string> {
    try {
      console.log('Calling LLM with prompt...');

      const requestData = {
        model: this.modelName,
        prompt: prompt,
        stream: false,
      };

      const response = await axios.post(this.llmEndpoint, requestData);

      if (response.data && response.data.response) {
        return response.data.response;
      } else {
        console.error('Unexpected LLM response format:', response.data);
        return 'Error: Unexpected response format from LLM';
      }
    } catch (error) {
      console.error('Error calling LLM:', error);
      return 'Error calling LLM service';
    }
  }

  /**
   * Get architecture recommendations for the project
   *
   * @param projectDescription Description of the project
   * @returns Architecture recommendations
   */
  async getArchitectureRecommendations(
    projectDescription: string
  ): Promise<ArchitectureRecommendationsResponse> {
    try {
      const prompt = `
You are an expert software architect. Based on the following project description, provide architecture recommendations.
Format your response as JSON with the following structure:
{
  "overview": "Brief overview of the architecture",
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed description",
      "implementation": "Code example or implementation details (optional)",
      "benefits": ["Benefit 1", "Benefit 2", ...]
    },
    ...
  ]
}

Project Description: ${projectDescription}
`;

      const response = await this.callLLM(prompt);

      try {
        // Parse the response as JSON
        const jsonMatch =
          response.match(/```json\n([\s\S]*?)\n```/) ||
          response.match(/```\n([\s\S]*?)\n```/) ||
          response.match(/({[\s\S]*})/);

        if (jsonMatch && jsonMatch[1]) {
          return JSON.parse(jsonMatch[1]) as ArchitectureRecommendationsResponse;
        } else {
          throw new Error('Could not extract JSON from response');
        }
      } catch (error) {
        console.error('Failed to parse architecture recommendations:', error);
        // Fallback response
        return {
          overview: 'Failed to generate architecture recommendations',
          recommendations: [
            {
              title: 'Error Processing Request',
              description:
                'There was an error processing your architecture recommendation request.',
              benefits: ['Please try again with a more detailed project description'],
            },
          ],
        };
      }
    } catch (error) {
      console.error('Error getting architecture recommendations:', error);
      return {
        overview: 'Error occurred while generating recommendations',
        recommendations: [],
      };
    }
  }

  /**
   * Get AI recommendations for remixing specific parts of a todo
   *
   * @param todo The original todo item
   * @param partsToRemix Array of parts to be remixed (e.g., ['title', 'description', 'tags'])
   * @returns Suggested improvements for each part
   */
  async getRemixSuggestions(
    todo: Partial<TodoItem>,
    partsToRemix: string[]
  ): Promise<Record<string, any>> {
    try {
      // Prepare a description of the current todo
      const todoDescription = `
Title: ${todo.title || 'Not specified'}
Description: ${todo.description || 'Not specified'}
Tags: ${todo.tags?.join(', ') || 'None'}
Category: ${todo.category || 'Not specified'}
Priority: ${todo.priority || 'Not specified'}
Horizon: ${todo.horizon || 'Not specified'}
Status: ${todo.status || 'Not specified'}
`;

      // Create a prompt asking for improvements to specific parts
      const prompt = `
You are a productivity expert helping improve a todo item. Focus only on the parts that need remixing.
Current todo details:
${todoDescription}

Please suggest improvements ONLY for these specific parts: ${partsToRemix.join(', ')}

Format your response as JSON with a key for each part to remix. For example:
{
  "title": "Suggested improved title",
  "description": "Suggested improved description",
  "tags": ["tag1", "tag2", "tag3"],
  ...
}

Only include the fields that need remixing in your response.
Include a brief rationale for each suggestion to explain your thinking.
`;

      const response = await this.callLLM(prompt);

      try {
        // Parse the response as JSON
        const jsonMatch =
          response.match(/```json\n([\s\S]*?)\n```/) ||
          response.match(/```\n([\s\S]*?)\n```/) ||
          response.match(/({[\s\S]*})/);

        if (jsonMatch && jsonMatch[1]) {
          const suggestions = JSON.parse(jsonMatch[1]);

          // Validate that we only have suggestions for the requested parts
          const validSuggestions: Record<string, any> = {};

          for (const part of partsToRemix) {
            if (suggestions[part]) {
              validSuggestions[part] = suggestions[part];
            }
          }

          return validSuggestions;
        } else {
          throw new Error('Could not extract JSON from response');
        }
      } catch (error) {
        console.error('Failed to parse remix suggestions:', error);
        // Fallback response
        const fallback: Record<string, any> = {};
        for (const part of partsToRemix) {
          fallback[part] = `Failed to generate suggestion for ${part}`;
        }
        return fallback;
      }
    } catch (error) {
      console.error('Error getting remix suggestions:', error);
      // Fallback response
      const fallback: Record<string, any> = {};
      for (const part of partsToRemix) {
        fallback[part] = `Failed to generate suggestion for ${part}`;
      }
      return fallback;
    }
  }
}
