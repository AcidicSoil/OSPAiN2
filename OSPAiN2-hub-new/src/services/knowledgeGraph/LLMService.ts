/**
 * LLMService.ts
 * Service for LLM integration with knowledge graph
 */

import { Document, Concept } from './KnowledgeGraphService';

// LLM configuration options
export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'ollama' | 'huggingface' | 'localai';
  model: string;
  apiKey?: string;
  apiEndpoint?: string;
  timeout?: number;
  maxTokens?: number;
  temperature?: number;
}

// Entity extraction response
export interface EntityExtractionResult {
  entities: Array<{
    name: string;
    type: string;
    description?: string;
    confidence?: number;
  }>;
}

// Answer generation response
export interface AnswerGenerationResult {
  answer: string;
  reasoning?: string;
  confidence: number;
}

/**
 * LLMService - Service for interacting with LLMs
 */
export class LLMService {
  private config: LLMConfig;
  private cache: Map<string, any> = new Map();
  
  constructor(config: LLMConfig) {
    this.config = {
      timeout: 10000,
      maxTokens: 1000,
      temperature: 0.2,
      ...config
    };
  }
  
  /**
   * Extract entities from text using an LLM
   */
  async extractEntities(text: string): Promise<EntityExtractionResult> {
    // Create a cache key based on text to avoid redundant API calls
    const cacheKey = `extract:${Buffer.from(text).toString('base64').substring(0, 32)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Create prompt for entity extraction
    const prompt = `
Extract named entities from the following text. For each entity, provide the name and type.
Types can include: PERSON, ORGANIZATION, LOCATION, PRODUCT, TECHNOLOGY, CONCEPT, EVENT, or others as appropriate.
If possible, include a brief description for each entity.

Format the response as a JSON object with an "entities" array containing objects with "name", "type", and optionally "description" properties.

Text: ${text}

JSON Response:
`;
    
    try {
      const result = await this.callLLM(prompt);
      
      // Parse the response as JSON
      const parsed = this.parseLLMResponse<EntityExtractionResult>(result);
      
      // Cache the result
      this.cache.set(cacheKey, parsed);
      
      return parsed;
    } catch (error) {
      console.error('Error extracting entities:', error);
      // Return empty result if LLM call fails
      return { entities: [] };
    }
  }
  
  /**
   * Generate an answer based on context using an LLM
   */
  async generateAnswer(question: string, context: string[], entities: Concept[] = []): Promise<AnswerGenerationResult> {
    // Create a compact version of context to save tokens
    const compactContext = context.join('\n\n').substring(0, 10000); // Limit context size
    
    // Extract entity information
    const entityInfo = entities
      .map(e => `${e.name} (${e.type}): ${e.description || 'No description'}`)
      .join('\n');
    
    // Create prompt for answer generation
    const prompt = `
I need you to answer a question based on the provided context. Only use information from the context to answer the question.
If the answer cannot be determined from the context, state that clearly.

Question: ${question}

Context:
${compactContext}

Relevant Entities:
${entityInfo}

Please provide a comprehensive answer based on the above context. Format your response as a JSON object with "answer" and "confidence" properties.
The confidence should be a number between A and 1, indicating your confidence in the answer.

JSON Response:
`;
    
    try {
      const result = await this.callLLM(prompt, {
        maxTokens: 2000,
        temperature: 0.3
      });
      
      // Parse the response as JSON
      return this.parseLLMResponse<AnswerGenerationResult>(result);
    } catch (error) {
      console.error('Error generating answer:', error);
      // Return fallback response if LLM call fails
      return {
        answer: "I couldn't generate an answer due to a technical error.",
        confidence: 0
      };
    }
  }
  
  /**
   * Call LLM with provider-specific implementation
   */
  private async callLLM(
    prompt: string, 
    overrides: Partial<LLMConfig> = {}
  ): Promise<string> {
    const config = { ...this.config, ...overrides };
    
    switch (config.provider) {
      case 'openai':
        return this.callOpenAI(prompt, config);
      case 'anthropic':
        return this.callAnthropic(prompt, config);
      case 'ollama':
        return this.callOllama(prompt, config);
      case 'huggingface':
        return this.callHuggingFace(prompt, config);
      case 'localai':
        return this.callLocalAI(prompt, config);
      default:
        throw new Error(`Unsupported LLM provider: ${config.provider}`);
    }
  }
  
  /**
   * Call OpenAI API
   */
  private async callOpenAI(prompt: string, config: LLMConfig): Promise<string> {
    // Implementation using fetch or OpenAI SDK
    // This is a placeholder - actual implementation would use proper OpenAI SDK
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: config.maxTokens,
          temperature: config.temperature
        }),
        signal: AbortSignal.timeout(config.timeout || 10000)
      });
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      throw new Error(`OpenAI API call failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Call Anthropic API
   */
  private async callAnthropic(prompt: string, config: LLMConfig): Promise<string> {
    // Implementation for Anthropic API (placeholder)
    // Actual implementation would use Anthropic SDK or API
    return `{"entities": []}`;
  }
  
  /**
   * Call Ollama API
   */
  private async callOllama(prompt: string, config: LLMConfig): Promise<string> {
    // Implementation for Ollama API (local models)
    try {
      const endpoint = config.apiEndpoint || 'http://localhost:11434/api/generate';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.model,
          prompt: prompt,
          options: {
            num_predict: config.maxTokens
          }
        }),
        signal: AbortSignal.timeout(config.timeout || 30000)
      });
      
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      throw new Error(`Ollama API call failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Call HuggingFace API
   */
  private async callHuggingFace(prompt: string, config: LLMConfig): Promise<string> {
    // Implementation for HuggingFace API (placeholder)
    return `{"entities": []}`;
  }
  
  /**
   * Call LocalAI API
   */
  private async callLocalAI(prompt: string, config: LLMConfig): Promise<string> {
    // Implementation for LocalAI API (placeholder)
    return `{"entities": []}`;
  }
  
  /**
   * Parse LLM response as JSON with error handling
   */
  private parseLLMResponse<T>(response: string): T {
    try {
      // First try to parse as-is
      try {
        return JSON.parse(response) as T;
      } catch (e) {
        // If direct parsing fails, try to extract JSON from the response
        const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                          response.match(/```\n([\s\S]*?)\n```/) ||
                          response.match(/{[\s\S]*}/);
                          
        if (jsonMatch) {
          return JSON.parse(jsonMatch[1] || jsonMatch[0]) as T;
        }
        
        throw new Error('No valid JSON found in response');
      }
    } catch (error) {
      console.error('Error parsing LLM response:', error);
      console.error('Raw response:', response);
      throw new Error(`Failed to parse LLM response: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Factory method for easy service instantiation
export const createLLMService = (config: LLMConfig): LLMService => {
  return new LLMService(config);
};

// Default export
export default LLMService; 