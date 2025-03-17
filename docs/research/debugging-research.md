# Debugging Research Interface

## Overview

The Debugging Research Interface is a powerful tool integrated into the Ollama Ecosystem that helps developers overcome stuck debugging scenarios. When you're faced with a difficult error or issue, the system will research solutions using the `ollama-deep-researcher-ts` module and provide structured, actionable solutions.

## Key Features

- **Intelligent Research**: Sends your debugging problem to the Deep Researcher, which uses LangGraph to search the web and synthesize solutions
- **Structured Results**: Presents findings in a clear format with possible causes, suggested fixes, and code examples
- **Solution Application**: Apply suggested solutions directly to your code
- **Reference Tracking**: Access original sources for deeper understanding
- **History Tracking**: Review past research sessions for recurring issues

## How It Works

1. **Input your issue**: Provide details about the error you're seeing, relevant code, and context
2. **Research process**: The system formulates search queries, gathers information from multiple sources, and synthesizes a comprehensive solution
3. **Results presentation**: Review structured findings and choose the best solution for your specific issue
4. **Apply and track**: Apply the solution and provide feedback on its effectiveness

## Using the Debug Research Panel

### When to Use

Use the Debug Research Panel when:
- You've been stuck on an issue for more than 15-20 minutes
- You're encountering an error message you don't understand
- You've tried several solutions without success
- You're working with an unfamiliar library or framework
- You need up-to-date solutions from current web sources

### Input Fields

- **Error Message**: Paste the exact error message you're seeing
- **Problematic Code**: Include the code that's causing the issue
- **Framework/Library**: Specify any frameworks or libraries involved
- **Language**: Indicate the programming language
- **Expected Behavior**: Describe what should happen when the code runs correctly
- **Actual Behavior**: Explain what actually happens instead
- **Additional Context**: Provide any other relevant information
- **Attempted Fixes**: List solutions you've already tried to help focus the research

### Reviewing Results

The research results are organized into sections:

- **Research Summary**: A comprehensive overview of the issue and potential solutions
- **Possible Causes**: Factors that may be contributing to the problem
- **Suggested Fixes**: Specific actions you can take to resolve the issue
- **Code Examples**: Ready-to-use code snippets demonstrating how to implement the fixes
- **References**: Original sources for further reading

### Applying Solutions

To apply a solution:
1. Review the suggested fixes and code examples
2. Click the "Apply" button next to the solution you want to try
3. The code will be automatically inserted or the fix will be applied to your project
4. Test to see if the issue is resolved
5. Provide feedback on the effectiveness of the solution

## Integration with Development Workflow

The Debugging Research Interface integrates seamlessly with your development workflow:

1. **During Coding**: When you encounter an error, open the Debug Research Panel
2. **Research Phase**: While the system researches, you can continue exploring other parts of the code
3. **Solution Implementation**: Apply suggested solutions directly to your codebase
4. **Feedback Loop**: Provide feedback on which solutions worked to improve future research

## Backend Architecture

The system consists of several components:

1. **Frontend UI**: React components that provide the user interface
2. **Research Service**: Handles communication between the frontend and backend
3. **Debug Research Bridge**: Connects to the ollama-deep-researcher-ts module
4. **Research Routes**: Express API endpoints for handling research requests
5. **Deep Researcher**: LangGraph-based agent that performs the actual research

## Environment Configuration

The Debug Research feature can be configured using the following environment variables:

- `REACT_APP_API_URL`: URL of the API server (default: http://localhost:3001/api)
- `LLM_BASE_URL`: URL of the Ollama server (default: http://localhost:11434)
- `TAVILY_API_KEY`: API key for Tavily search (required for web research)

## Examples

### Example 1: Resolving a TypeScript Error

1. **Input**: Error message "Type 'Timeout' is not assignable to type 'number'"
2. **Research**: The system identifies this as a Node.js vs. browser typing issue
3. **Solution**: Apply the suggested fix to use window.setTimeout or add a type assertion

### Example 2: Debugging a React Hook Issue

1. **Input**: Error about violating the rules of hooks
2. **Research**: The system determines this is related to conditional hook usage
3. **Solution**: Apply the fix to ensure hooks are called in the same order on every render

## Troubleshooting

If you encounter issues with the Debug Research feature:

- Ensure your Ollama server is running (`http://localhost:11434`)
- Check that you have a valid Tavily API key configured
- Verify that the research API server is running
- Make sure your internet connection is active for web research

## Contributing

To improve the Debug Research feature:

1. Add more extraction patterns in `debug-research-bridge.ts` to better parse research results
2. Enhance the UI components in `DebugResearchPanel.tsx`
3. Expand the research prompts in the Deep Researcher module 