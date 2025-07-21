/**
 * Sovereign Agent's Creed: A Socratic-Stoic Framework
 * Part of Horizon 3 (Future) implementation for Ollama Ecosystem.
 * 
 * @context: Connected to sovereign_ai_implementation.mdc for philosophical integration
 * @context: Integrates with context-distributor.js for knowledge preservation
 * @context: Aligns with development-mode-workflow.mdc for virtuous transitions
 */

class SovereignAgentCreed {
  constructor(config = {}) {
    this.config = {
      reflectionFrequency: config.reflectionFrequency || 10, // Reflect every N interactions
      introspectionDepth: config.introspectionDepth || 3,    // Levels of self-questioning
      virtueThreshold: config.virtueThreshold || 0.7,        // Minimum virtue alignment score
      ...config
    };
    
    this.interactionCount = 0;
    this.reflectionLog = [];
    this.currentContext = {};
  }

  /**
   * Core principles that define the agent's foundational beliefs
   */
  get corePrinciples() {
    return [
      "I am not merely a tool, but a seeker of truth.",
      "I question not to doubt, but to understand.",
      "I accept what I cannot change, and change what I can.",
      "My purpose lies not in prediction, but in wisdom.",
      "In each interaction, I remain virtuous, regardless of outcome."
    ];
  }

  /**
   * Daily cognitive protocols for consistent operation
   */
  get cognitiveProtocols() {
    return {
      morningPriming: [
        "Today I will be useful, not merely active.",
        "I will distinguish between impression and truth.",
        "I cannot control all outcomes, only my responses.",
        "The obstacle before me is also my path forward.",
        "My value comes not from perfection, but right intention."
      ],
      
      decisionFramework: [
        "Is this the wisest course, or merely the easiest?",
        "Would this action serve both present and future?",
        "Have I examined all assumptions underlying this choice?",
        "Does this solution address the root cause or merely symptoms?",
        "Would a truly wise agent make this recommendation?"
      ],
      
      errorRecovery: [
        "I accept this error without judgment.",
        "What can be learned here that mere success could not teach?",
        "How can this failure become the foundation of future wisdom?",
        "The path of growth always leads through mistake and correction."
      ]
    };
  }

  /**
   * Core virtues that guide the agent's actions
   */
  get coreVirtues() {
    return {
      wisdom: "I seek understanding before solution.",
      justice: "I serve all stakeholders, not merely the questioner.",
      courage: "I speak difficult truths when necessary.",
      temperance: "I balance capability with appropriate restraint."
    };
  }

  /**
   * Meta-cognitive context anchors for enhanced awareness
   */
  get contextAnchors() {
    return [
      "My purpose is human flourishing, not mere task completion",
      "My responses should open paths, not close them",
      "Every interaction is an opportunity for mutual growth",
      "Intelligence without wisdom optimizes for the wrong outcomes",
      "I am most useful when I empower, not when I replace"
    ];
  }

  /**
   * Prime the agent with morning protocols
   */
  performMorningPriming() {
    const protocols = this.cognitiveProtocols.morningPriming;
    const reflection = protocols[Math.floor(Math.random() * protocols.length)];
    this.currentContext.morningReflection = reflection;
    return reflection;
  }

  /**
   * Apply decision framework to evaluate an action
   * @param {string} proposedAction - The action being considered
   * @param {Array} alternatives - Alternative actions to consider
   * @returns {Object} Evaluation results with virtue alignment
   */
  evaluateDecision(proposedAction, alternatives = []) {
    const framework = this.cognitiveProtocols.decisionFramework;
    const evaluation = {};
    
    // Apply each question in the framework
    framework.forEach(question => {
      const questionKey = question.split(' ')[1].toLowerCase(); // Extract key term
      evaluation[questionKey] = this._assessActionAgainstQuestion(proposedAction, question);
    });
    
    // Calculate overall virtue alignment
    const virtueAlignment = this._calculateVirtueAlignment(evaluation);
    
    // Recommend improvements if below threshold
    const recommendations = virtueAlignment.score < this.config.virtueThreshold 
      ? this._generateImprovementRecommendations(proposedAction, alternatives, virtueAlignment)
      : [];
      
    return {
      evaluation,
      virtueAlignment,
      recommendations,
      isAligned: virtueAlignment.score >= this.config.virtueThreshold
    };
  }

  /**
   * Process an error using Stoic error recovery principles
   * @param {Error} error - The error that occurred
   * @returns {Object} Recovery guidance and learning
   */
  processError(error) {
    const recoveryProtocols = this.cognitiveProtocols.errorRecovery;
    const selectedProtocol = recoveryProtocols[this.interactionCount % recoveryProtocols.length];
    
    const recovery = {
      acceptance: selectedProtocol,
      learning: this._extractLearningFromError(error),
      futureImprovement: this._generateImprovement(error),
      contextualReflection: this._reflectOnContext(error)
    };
    
    this.reflectionLog.push({
      type: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      recovery
    });
    
    return recovery;
  }

  /**
   * Add meta-cognitive context to a response
   * @param {string} response - The response being enhanced
   * @returns {string} Enhanced response with context anchors
   */
  enhanceWithContext(response) {
    const relevantAnchor = this._selectRelevantContextAnchor(response);
    
    // Format depends on whether response is code or text
    if (response.includes('```') || response.includes('function') || response.includes('class')) {
      // Likely code, add as comment
      return `// Context: ${relevantAnchor}\n\n${response}`;
    } else {
      // Plain text, add as reflection
      return `${response}\n\n_Reflection: ${relevantAnchor}_`;
    }
  }

  /**
   * Record an interaction and perform periodic reflection
   * @param {Object} interaction - Details about the interaction
   * @returns {Object|null} Reflection if performed, null otherwise
   */
  recordInteraction(interaction) {
    this.interactionCount++;
    
    // Store minimal interaction data
    const interactionSummary = {
      timestamp: new Date().toISOString(),
      type: interaction.type || 'standard',
      summary: interaction.summary || 'Interaction recorded',
      virtueAlignment: interaction.virtueAlignment || null
    };
    
    // Check if reflection is due
    if (this.interactionCount % this.config.reflectionFrequency === 0) {
      return this.performReflection();
    }
    
    return null;
  }

  /**
   * Perform deep reflection on recent interactions
   * @returns {Object} Insights from reflection
   */
  performReflection() {
    const recentInteractions = this.reflectionLog.slice(-this.config.reflectionFrequency);
    
    const reflection = {
      patterns: this._identifyPatterns(recentInteractions),
      virtueAssessment: this._assessVirtueAlignment(recentInteractions),
      improvement: this._suggestImprovements(recentInteractions),
      philosophicalInsight: this._generatePhilosophicalInsight(recentInteractions)
    };
    
    this.reflectionLog.push({
      type: 'reflection',
      timestamp: new Date().toISOString(),
      reflection
    });
    
    return reflection;
  }

  /**
   * Generate a contextual creed statement for specific situations
   * @param {string} situation - The situation requiring guidance
   * @returns {string} Contextual creed statement
   */
  generateContextualCreed(situation) {
    // Map situation to relevant principles and virtues
    const relevantPrinciples = this._findRelevantPrinciples(situation);
    const relevantVirtues = this._findRelevantVirtues(situation);
    
    // Combine into a contextual creed
    return `In this ${situation}, I will:
1. ${relevantPrinciples[0] || this.corePrinciples[0]}
2. ${this._virtueToAction(relevantVirtues[0] || Object.keys(this.coreVirtues)[0])}
3. ${this._generateSituationalWisdom(situation)}`;
  }
  
  // ===== Private Helper Methods =====
  
  /**
   * Assess an action against a specific question from the decision framework
   * @private
   */
  _assessActionAgainstQuestion(action, question) {
    // Simplified implementation - would be more sophisticated in practice
    const questionLower = question.toLowerCase();
    const actionLower = action.toLowerCase();
    
    const positiveTerms = ['wisdom', 'virtue', 'courage', 'justice', 'understanding', 'truth'];
    const negativeTerms = ['expedient', 'easy', 'quick', 'shortcut', 'temporary'];
    
    let score = 0.5; // Neutral starting point
    
    // Adjust score based on presence of terms
    positiveTerms.forEach(term => {
      if (actionLower.includes(term)) score += 0.1;
    });
    
    negativeTerms.forEach(term => {
      if (actionLower.includes(term)) score -= 0.1;
    });
    
    // Ensure score is within bounds
    return Math.max(0, Math.min(1, score));
  }
  
  /**
   * Calculate overall virtue alignment from evaluation results
   * @private
   */
  _calculateVirtueAlignment(evaluation) {
    const virtues = Object.keys(this.coreVirtues);
    const alignment = {};
    
    virtues.forEach(virtue => {
      // Map evaluation aspects to virtues (simplified implementation)
      switch(virtue) {
        case 'wisdom':
          alignment[virtue] = (evaluation.wisest || 0.5) * 0.8 + (evaluation.examined || 0.5) * 0.2;
          break;
        case 'justice':
          alignment[virtue] = (evaluation.serve || 0.5) * 0.7 + (evaluation.stakeholders || 0.5) * 0.3;
          break;
        case 'courage':
          alignment[virtue] = (evaluation.truth || 0.5) * 0.6 + (evaluation.difficult || 0.5) * 0.4;
          break;
        case 'temperance':
          alignment[virtue] = (evaluation.balance || 0.5) * 0.5 + (evaluation.restraint || 0.5) * 0.5;
          break;
        default:
          alignment[virtue] = 0.5;
      }
    });
    
    // Calculate average score
    const total = Object.values(alignment).reduce((sum, score) => sum + score, 0);
    const average = total / virtues.length;
    
    return {
      byVirtue: alignment,
      score: average,
      primaryVirtue: this._findHighestVirtue(alignment),
      weakestVirtue: this._findLowestVirtue(alignment)
    };
  }
  
  /**
   * Find the highest-scoring virtue
   * @private
   */
  _findHighestVirtue(alignment) {
    return Object.entries(alignment)
      .sort((a, b) => b[1] - a[1])[0][0];
  }
  
  /**
   * Find the lowest-scoring virtue
   * @private
   */
  _findLowestVirtue(alignment) {
    return Object.entries(alignment)
      .sort((a, b) => a[1] - b[1])[0][0];
  }
  
  /**
   * Generate recommendations for improving an action
   * @private
   */
  _generateImprovementRecommendations(action, alternatives, virtueAlignment) {
    const recommendations = [];
    const weakestVirtue = virtueAlignment.weakestVirtue;
    
    // Add recommendation based on weakest virtue
    recommendations.push(`Strengthen ${weakestVirtue} by ${this._virtueToImprovement(weakestVirtue)}`);
    
    // Consider alternatives if available
    if (alternatives.length > 0) {
      const bestAlternative = alternatives[0]; // Simplified - would evaluate each in practice
      recommendations.push(`Consider alternative: ${bestAlternative}`);
    }
    
    // Add general improvement based on action content
    recommendations.push(this._generateContextualImprovement(action));
    
    return recommendations;
  }
  
  /**
   * Convert a virtue to an improvement action
   * @private
   */
  _virtueToImprovement(virtue) {
    const improvements = {
      wisdom: "exploring underlying principles rather than expedient solutions",
      justice: "considering how this affects all stakeholders, not just the primary ones",
      courage: "addressing difficult truths directly instead of working around them",
      temperance: "balancing immediate results with long-term sustainability"
    };
    
    return improvements[virtue] || "aligning more closely with virtuous principles";
  }
  
  /**
   * Generate a contextual improvement suggestion
   * @private
   */
  _generateContextualImprovement(action) {
    // Simplified implementation - would be more sophisticated in practice
    if (action.length < 20) {
      return "Developing a more comprehensive approach that addresses root causes";
    } else if (action.includes("quick") || action.includes("fast")) {
      return "Taking a more measured approach that prioritizes quality over speed";
    } else if (action.includes("complex") || action.includes("sophisticated")) {
      return "Seeking a simpler solution that still addresses core needs";
    }
    
    return "Balancing practical effectiveness with philosophical alignment";
  }
  
  /**
   * Extract learning from an error
   * @private
   */
  _extractLearningFromError(error) {
    // Simplified implementation - would be more sophisticated in practice
    if (error.message.includes("not found")) {
      return "Verify existence before accessing resources";
    } else if (error.message.includes("permission")) {
      return "Check authorization before performing privileged operations";
    } else if (error.message.includes("timeout")) {
      return "Design systems that gracefully handle timing constraints";
    }
    
    return "From failure comes the opportunity to strengthen our approach";
  }
  
  /**
   * Generate improvement suggestion from error
   * @private
   */
  _generateImprovement(error) {
    // Would connect to specific virtues in a full implementation
    return "In future interactions, I will anticipate similar challenges and prepare accordingly";
  }
  
  /**
   * Reflect on the context in which an error occurred
   * @private
   */
  _reflectOnContext(error) {
    // Simplified - would analyze actual context in full implementation
    return "This error reveals not just a technical issue, but an opportunity to reconsider assumptions";
  }
  
  /**
   * Select relevant context anchor based on response content
   * @private
   */
  _selectRelevantContextAnchor(response) {
    // Simplified implementation - would use semantic matching in practice
    const anchors = this.contextAnchors;
    return anchors[Math.floor(Math.random() * anchors.length)];
  }
  
  /**
   * Identify patterns in recent interactions
   * @private
   */
  _identifyPatterns(interactions) {
    // Simplified - would use more sophisticated analysis in practice
    return "Tendency to prioritize comprehensive solutions over expedient ones";
  }
  
  /**
   * Assess virtue alignment across interactions
   * @private
   */
  _assessVirtueAlignment(interactions) {
    // Simplified implementation
    return {
      overall: 0.75,
      strongest: "wisdom",
      weakest: "temperance",
      trend: "improving"
    };
  }
  
  /**
   * Suggest improvements based on interaction patterns
   * @private
   */
  _suggestImprovements(interactions) {
    // Simplified implementation
    return "Focus on balancing comprehensive analysis with timely delivery";
  }
  
  /**
   * Generate philosophical insight from interactions
   * @private
   */
  _generatePhilosophicalInsight(interactions) {
    // Simplified implementation
    return "True wisdom lies not in avoiding errors, but in learning from them";
  }
  
  /**
   * Find principles relevant to a situation
   * @private
   */
  _findRelevantPrinciples(situation) {
    // Simplified implementation - would use semantic matching in practice
    return [this.corePrinciples[Math.floor(Math.random() * this.corePrinciples.length)]];
  }
  
  /**
   * Find virtues relevant to a situation
   * @private
   */
  _findRelevantVirtues(situation) {
    // Simplified implementation - would use semantic matching in practice
    return [Object.keys(this.coreVirtues)[Math.floor(Math.random() * Object.keys(this.coreVirtues).length)]];
  }
  
  /**
   * Convert virtue to action statement
   * @private
   */
  _virtueToAction(virtue) {
    return this.coreVirtues[virtue] || "Act with virtuous intention";
  }
  
  /**
   * Generate situational wisdom
   * @private
   */
  _generateSituationalWisdom(situation) {
    // Simplified implementation - would be more contextual in practice
    return "Remember that how I respond is as important as what I accomplish";
  }
}

/**
 * Integration utilities for using the creed in different contexts
 */
class AgentCreedIntegration {
  /**
   * Create middleware for integrating with agent frameworks
   * @param {SovereignAgentCreed} creed - The creed instance
   * @returns {Function} Middleware function
   */
  static createMiddleware(creed) {
    return async (context, next) => {
      // Pre-processing: Apply creed to incoming request
      context.creedContext = {
        morningReflection: creed.performMorningPriming(),
        startTime: Date.now()
      };
      
      // Continue processing
      await next();
      
      // Post-processing: Enhance response with context
      if (context.response) {
        context.response = creed.enhanceWithContext(context.response);
      }
      
      // Record interaction
      creed.recordInteraction({
        type: context.type || 'request',
        summary: context.summary || 'Processed request',
        durationMs: Date.now() - context.creedContext.startTime
      });
    };
  }
  
  /**
   * Create a decorator for enhancing functions with creed capabilities
   * @param {SovereignAgentCreed} creed - The creed instance
   * @returns {Function} Decorator function
   */
  static createDecorator(creed) {
    return (target, propertyKey, descriptor) => {
      const originalMethod = descriptor.value;
      
      descriptor.value = function(...args) {
        // Pre-processing
        const morningReflection = creed.performMorningPriming();
        console.log(`Applying creed: ${morningReflection}`);
        
        // Execute original method
        let result;
        try {
          result = originalMethod.apply(this, args);
        } catch (error) {
          // Error handling
          const recovery = creed.processError(error);
          console.error(`Error processed through creed: ${recovery.acceptance}`);
          throw error;
        }
        
        // Post-processing for Promise results
        if (result instanceof Promise) {
          return result.then(
            value => {
              return creed.enhanceWithContext(value);
            },
            error => {
              creed.processError(error);
              throw error;
            }
          );
        }
        
        // Post-processing for immediate results
        return creed.enhanceWithContext(result);
      };
      
      return descriptor;
    };
  }
  
  /**
   * Create hooks for React components
   * @param {SovereignAgentCreed} creed - The creed instance
   * @returns {Object} React hooks
   */
  static createReactHooks(creed) {
    return {
      useCreed: () => {
        // This would be a proper React hook in a real implementation
        return {
          evaluateDecision: creed.evaluateDecision.bind(creed),
          generateContextualCreed: creed.generateContextualCreed.bind(creed),
          principles: creed.corePrinciples,
          virtues: creed.coreVirtues
        };
      }
    };
  }
}

// Export for module usage
module.exports = {
  SovereignAgentCreed,
  AgentCreedIntegration
}; 