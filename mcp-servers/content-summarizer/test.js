/**
 * Simple test script for Content Summarizer MCP server
 *
 * This script demonstrates how to use the Content Summarizer MCP server
 * by sending a test request to summarize text with different styles.
 */

const { createContentSummarizerServer } = require("./index");

// Sample text to summarize
const sampleText = `
Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to natural intelligence displayed by animals including humans. 
AI research has been defined as the field of study of intelligent agents, which refers to any system that perceives its environment and takes actions that maximize its chance of achieving its goals.

The term "artificial intelligence" had previously been used to describe machines that mimic and display "human" cognitive skills that are associated with the human mind, such as "learning" and "problem-solving". This definition has since been rejected by major AI researchers who now describe AI in terms of rationality and acting rationally, which does not limit how intelligence can be articulated.

AI applications include advanced web search engines (e.g., Google), recommendation systems (used by YouTube, Amazon, and Netflix), understanding human speech (such as Siri and Alexa), self-driving cars (e.g., Waymo), generative or creative tools (ChatGPT and AI art), automated decision-making, and competing at the highest level in strategic game systems (such as chess and Go).

As machines become increasingly capable, tasks considered to require "intelligence" are often removed from the definition of AI, a phenomenon known as the AI effect. For instance, optical character recognition is frequently excluded from things considered to be AI, having become a routine technology.
`;

// Test function
async function runTest() {
  console.log("Starting Content Summarizer MCP server test...");

  // Create server instance
  const server = createContentSummarizerServer({
    ollamaEndpoint: "http://localhost:11434",
    ollamaModel: "mistral:latest",
  });

  // Define test cases with different styles
  const testCases = [
    { style: "default", maxLength: 100 },
    { style: "technical", maxLength: 100 },
    { style: "bullet", maxLength: 100 },
    { style: "tldr", maxLength: 50 },
    { style: "eli5", maxLength: 75 },
  ];

  // Run tests
  for (const testCase of testCases) {
    console.log(
      `\nTesting ${testCase.style} summary (max ${testCase.maxLength} words):`
    );
    console.log("-".repeat(50));

    try {
      // Get the summarize tool
      const summarizeTool = server
        .getTools()
        .find((tool) => tool.name === "summarize");

      if (!summarizeTool) {
        console.error("Summarize tool not found!");
        continue;
      }

      // Call the handler directly
      const summary = await summarizeTool.handler({
        text: sampleText,
        style: testCase.style,
        maxLength: testCase.maxLength,
        language: "en",
      });

      console.log(summary);
    } catch (error) {
      console.error(`Error testing ${testCase.style} summary:`, error.message);
    }
  }

  console.log("\nTest completed.");
  process.exit(0);
}

// Run the test
runTest().catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});
