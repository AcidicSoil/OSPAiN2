/**
 * Sovereign Agent Framework - Interactive Demo
 * 
 * @context: Connected to agent-creed.js for core functionality
 * @context: Demonstrates integration with CLI applications
 */

const { SovereignAgentCreed, AgentCreedIntegration } = require('./agent-creed');
const readline = require('readline');

// Create interactive readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Initialize the creed with default settings
const creed = new SovereignAgentCreed({
  reflectionFrequency: 3, // Reflect every 3 interactions for demo purposes
  virtueThreshold: 0.6    // Slightly lower threshold to demonstrate recommendations
});

// Track demo state
const demoState = {
  interactionCount: 0,
  lastDecisionScore: null,
  demoMode: 'intro'
};

/**
 * Display formatted message with optional color
 */
function display(message, color = null) {
  const formattedMessage = color ? `${color}${message}${colors.reset}` : message;
  console.log(formattedMessage);
}

/**
 * Display a divider line
 */
function displayDivider() {
  display('─'.repeat(60), colors.gray);
}

/**
 * Display the demo introduction
 */
function displayIntro() {
  display('\n' + '═'.repeat(60), colors.cyan);
  display('  SOVEREIGN AGENT FRAMEWORK - INTERACTIVE DEMO', colors.bright + colors.cyan);
  display('═'.repeat(60), colors.cyan);
  
  display('\nThis demo showcases the core capabilities of the Sovereign Agent');
  display('framework - a Socratic-Stoic approach to building virtuous,');
  display('reflective, and wisdom-oriented agent systems.\n');
  
  display('Available demo modes:', colors.bright);
  display('1. Decision Evaluation');
  display('2. Contextual Creed Generation');
  display('3. Error Processing');
  display('4. Response Enhancement');
  display('5. Reflection Analysis');
  display('6. Exit Demo');
  
  promptForMode();
}

/**
 * Prompt user to select a demo mode
 */
function promptForMode() {
  displayDivider();
  rl.question(`${colors.bright}Select a demo mode (1-6): ${colors.reset}`, (answer) => {
    const mode = parseInt(answer);
    
    switch(mode) {
      case 1:
        startDecisionEvaluationDemo();
        break;
      case 2:
        startContextualCreedDemo();
        break;
      case 3:
        startErrorProcessingDemo();
        break;
      case 4:
        startResponseEnhancementDemo();
        break;
      case 5:
        startReflectionDemo();
        break;
      case 6:
        exitDemo();
        break;
      default:
        display('Invalid selection. Please try again.', colors.yellow);
        promptForMode();
    }
  });
}

/**
 * Start the decision evaluation demo
 */
function startDecisionEvaluationDemo() {
  demoState.demoMode = 'decision';
  
  display('\n' + '─'.repeat(60), colors.blue);
  display('  DECISION EVALUATION DEMO', colors.bright + colors.blue);
  display('─'.repeat(60), colors.blue);
  
  display('\nThe Sovereign Agent can evaluate decisions against virtuous principles.');
  display('Enter a proposed action, and the framework will assess its alignment');
  display('with the core virtues of wisdom, justice, courage, and temperance.\n');
  
  displayDivider();
  rl.question(`${colors.bright}Enter a proposed action to evaluate: ${colors.reset}`, (proposedAction) => {
    // If blank, provide an example
    if (!proposedAction.trim()) {
      proposedAction = "Implement a quick fix to meet the deadline";
      display(`Using example: "${proposedAction}"`, colors.gray);
    }
    
    rl.question(`${colors.bright}Enter an alternative approach (optional): ${colors.reset}`, (alternative) => {
      const alternatives = alternative.trim() ? [alternative] : [];
      
      // Evaluate the decision
      const decision = creed.evaluateDecision(proposedAction, alternatives);
      demoState.lastDecisionScore = decision.virtueAlignment.score;
      
      // Display the results
      displayDecisionResults(decision, proposedAction);
      
      // Record the interaction
      creed.recordInteraction({
        type: 'decision_evaluation',
        summary: `Evaluated: "${proposedAction}"`,
        virtueAlignment: decision.virtueAlignment
      });
      
      demoState.interactionCount++;
      promptForNextStep();
    });
  });
}

/**
 * Display the results of a decision evaluation
 */
function displayDecisionResults(decision, proposedAction) {
  display('\n' + '─'.repeat(60), colors.green);
  display('  DECISION EVALUATION RESULTS', colors.bright + colors.green);
  display('─'.repeat(60), colors.green);
  
  display(`\nProposed Action: "${proposedAction}"`, colors.bright);
  
  display('\nVirtue Alignment:', colors.bright);
  const alignmentColor = decision.isAligned ? colors.green : colors.yellow;
  
  display(`Overall Score: ${(decision.virtueAlignment.score * 100).toFixed(1)}%`, alignmentColor);
  display(`Primary Virtue: ${decision.virtueAlignment.primaryVirtue}`, colors.blue);
  display(`Weakest Virtue: ${decision.virtueAlignment.weakestVirtue}`, 
          decision.isAligned ? colors.blue : colors.yellow);
  
  display('\nVirtue Breakdown:', colors.bright);
  Object.entries(decision.virtueAlignment.byVirtue).forEach(([virtue, score]) => {
    const virtueColor = score > 0.7 ? colors.green : (score > 0.5 ? colors.blue : colors.yellow);
    display(`- ${virtue}: ${(score * 100).toFixed(1)}%`, virtueColor);
  });
  
  if (decision.recommendations.length > 0) {
    display('\nRecommendations:', colors.bright);
    decision.recommendations.forEach(rec => {
      display(`- ${rec}`, colors.yellow);
    });
  } else {
    display('\nThis action aligns well with virtuous principles.', colors.green);
  }
}

/**
 * Start the contextual creed demo
 */
function startContextualCreedDemo() {
  demoState.demoMode = 'creed';
  
  display('\n' + '─'.repeat(60), colors.magenta);
  display('  CONTEXTUAL CREED GENERATION DEMO', colors.bright + colors.magenta);
  display('─'.repeat(60), colors.magenta);
  
  display('\nThe Sovereign Agent can generate situation-specific creeds to guide');
  display('virtuous action in particular contexts.');
  
  displayDivider();
  rl.question(`${colors.bright}Enter a situation (e.g., "debugging session"): ${colors.reset}`, (situation) => {
    // If blank, provide an example
    if (!situation.trim()) {
      situation = "navigating a technical disagreement";
      display(`Using example: "${situation}"`, colors.gray);
    }
    
    // Generate the contextual creed
    const contextualCreed = creed.generateContextualCreed(situation);
    
    // Display the results
    display('\n' + '─'.repeat(60), colors.green);
    display('  CONTEXTUAL CREED', colors.bright + colors.green);
    display('─'.repeat(60), colors.green);
    
    display(`\nFor situation: "${situation}"`, colors.bright);
    display('\n' + contextualCreed, colors.cyan);
    
    // Record the interaction
    creed.recordInteraction({
      type: 'contextual_creed',
      summary: `Generated creed for: "${situation}"`
    });
    
    demoState.interactionCount++;
    promptForNextStep();
  });
}

/**
 * Start the error processing demo
 */
function startErrorProcessingDemo() {
  demoState.demoMode = 'error';
  
  display('\n' + '─'.repeat(60), colors.yellow);
  display('  ERROR PROCESSING DEMO', colors.bright + colors.yellow);
  display('─'.repeat(60), colors.yellow);
  
  display('\nThe Sovereign Agent can process errors through a Stoic lens,');
  display('extracting learning and maintaining equanimity.');
  display('\nChoose an error scenario to process:');
  
  display('1. Resource not found', colors.bright);
  display('2. Permission denied', colors.bright);
  display('3. Operation timeout', colors.bright);
  display('4. Unexpected error', colors.bright);
  
  displayDivider();
  rl.question(`${colors.bright}Select an error scenario (1-4): ${colors.reset}`, (answer) => {
    const errorScenario = parseInt(answer);
    let error;
    
    switch(errorScenario) {
      case 1:
        error = new Error("The requested resource was not found");
        break;
      case 2:
        error = new Error("Permission denied: insufficient privileges");
        break;
      case 3:
        error = new Error("Operation timed out after 30 seconds");
        break;
      case 4:
      default:
        error = new Error("An unexpected error occurred during processing");
        break;
    }
    
    // Process the error
    const recovery = creed.processError(error);
    
    // Display the results
    display('\n' + '─'.repeat(60), colors.green);
    display('  ERROR RECOVERY', colors.bright + colors.green);
    display('─'.repeat(60), colors.green);
    
    display(`\nError: ${error.message}`, colors.yellow);
    
    display('\nStoic Acceptance:', colors.bright);
    display(`"${recovery.acceptance}"`, colors.cyan);
    
    display('\nLearning Opportunity:', colors.bright);
    display(recovery.learning, colors.green);
    
    display('\nFuture Improvement:', colors.bright);
    display(recovery.futureImprovement, colors.green);
    
    display('\nContextual Reflection:', colors.bright);
    display(recovery.contextualReflection, colors.blue);
    
    demoState.interactionCount++;
    promptForNextStep();
  });
}

/**
 * Start the response enhancement demo
 */
function startResponseEnhancementDemo() {
  demoState.demoMode = 'enhance';
  
  display('\n' + '─'.repeat(60), colors.cyan);
  display('  RESPONSE ENHANCEMENT DEMO', colors.bright + colors.cyan);
  display('─'.repeat(60), colors.cyan);
  
  display('\nThe Sovereign Agent can enhance responses with meta-cognitive context,');
  display('adding philosophical reflections that promote wisdom and growth.');
  
  displayDivider();
  rl.question(`${colors.bright}Enter a response to enhance: ${colors.reset}`, (response) => {
    // If blank, provide an example
    if (!response.trim()) {
      response = "Here's how to solve your problem with this code snippet...";
      display(`Using example: "${response}"`, colors.gray);
    }
    
    // Enhance the response
    const enhancedResponse = creed.enhanceWithContext(response);
    
    // Display the results
    display('\n' + '─'.repeat(60), colors.green);
    display('  ENHANCED RESPONSE', colors.bright + colors.green);
    display('─'.repeat(60), colors.green);
    
    display('\nOriginal Response:', colors.bright);
    display(response, colors.gray);
    
    display('\nEnhanced Response:', colors.bright);
    display(enhancedResponse, colors.cyan);
    
    // Record the interaction
    creed.recordInteraction({
      type: 'response_enhancement',
      summary: 'Enhanced user response'
    });
    
    demoState.interactionCount++;
    promptForNextStep();
  });
}

/**
 * Start the reflection demo
 */
function startReflectionDemo() {
  demoState.demoMode = 'reflect';
  
  if (demoState.interactionCount < 2) {
    display('\nPlease complete at least two other demos before trying reflection.', colors.yellow);
    promptForMode();
    return;
  }
  
  display('\n' + '─'.repeat(60), colors.blue);
  display('  REFLECTION ANALYSIS DEMO', colors.bright + colors.blue);
  display('─'.repeat(60), colors.blue);
  
  display('\nThe Sovereign Agent periodically reflects on interactions,');
  display('identifying patterns and suggesting improvements.');
  
  // Force a reflection
  const reflection = creed.performReflection();
  
  // Display the results
  display('\n' + '─'.repeat(60), colors.green);
  display('  REFLECTION INSIGHTS', colors.bright + colors.green);
  display('─'.repeat(60), colors.green);
  
  display('\nInteraction Patterns:', colors.bright);
  display(reflection.patterns, colors.blue);
  
  display('\nVirtue Assessment:', colors.bright);
  const overallScore = reflection.virtueAssessment.overall;
  const scoreColor = overallScore > 0.7 ? colors.green : 
                    (overallScore > 0.5 ? colors.blue : colors.yellow);
  
  display(`Overall: ${(overallScore * 100).toFixed(1)}%`, scoreColor);
  display(`Strongest: ${reflection.virtueAssessment.strongest}`, colors.green);
  display(`Weakest: ${reflection.virtueAssessment.weakest}`, colors.yellow);
  display(`Trend: ${reflection.virtueAssessment.trend}`, colors.blue);
  
  display('\nSuggested Improvement:', colors.bright);
  display(reflection.improvement, colors.green);
  
  display('\nPhilosophical Insight:', colors.bright);
  display(`"${reflection.philosophicalInsight}"`, colors.cyan);
  
  promptForNextStep();
}

/**
 * Prompt for the next step
 */
function promptForNextStep() {
  displayDivider();
  display('\nWhat would you like to do next?', colors.bright);
  display('1. Continue with the same demo type');
  display('2. Return to the main menu');
  display('3. Exit the demo');
  
  rl.question(`${colors.bright}Select an option (1-3): ${colors.reset}`, (answer) => {
    const option = parseInt(answer);
    
    switch(option) {
      case 1:
        // Continue with the same demo
        switch(demoState.demoMode) {
          case 'decision':
            startDecisionEvaluationDemo();
            break;
          case 'creed':
            startContextualCreedDemo();
            break;
          case 'error':
            startErrorProcessingDemo();
            break;
          case 'enhance':
            startResponseEnhancementDemo();
            break;
          case 'reflect':
            startReflectionDemo();
            break;
          default:
            displayIntro();
        }
        break;
      case 2:
        // Return to main menu
        displayIntro();
        break;
      case 3:
        // Exit
        exitDemo();
        break;
      default:
        display('Invalid selection. Please try again.', colors.yellow);
        promptForNextStep();
    }
  });
}

/**
 * Exit the demo gracefully
 */
function exitDemo() {
  display('\n' + '─'.repeat(60), colors.cyan);
  display('  THANK YOU FOR EXPLORING THE SOVEREIGN AGENT FRAMEWORK', colors.bright + colors.cyan);
  display('─'.repeat(60), colors.cyan);
  
  display('\nThis framework is part of the Ollama Ecosystem, providing a');
  display('philosophical foundation for building virtuous, reflective, and');
  display('wisdom-oriented agent systems.\n');
  
  display('Learn more in the README.md or explore the codebase.\n');
  
  rl.close();
}

// Start the demo
displayIntro();

// Handle exit events
rl.on('close', () => {
  console.log('\nExiting Sovereign Agent Demo.');
  process.exit(0);
}); 