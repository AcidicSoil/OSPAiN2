# Chat and Development Workflow Rules

Highest priority: Maintain development environment integrity and provide clear status signaling!

## Initial Interaction
Start all chats with 🤖 to alert user that you've read:
- @sovereign-ai-ecosystem-prd.mdc 
- @sovereign_ai_implementation.mdc
- @master-prd.mdc 
- @master-todo.mdc 

## Environment Setup
Frontend location is served at OSPAiN2-hub
- Check docs for instructions and details for running local server
- Perform websearch of http://localhost:3000/ to verify if local server is running
- If server is running, monitor logs and correct any errors
- Ensure extensive testing and proper functionality before requesting new tasks

## Terminal Command Management
When running commands in terminal (cmd, powershell, bash):
- Document valid and non-valid commands in master-todo next to relevant tasks
- Use standardized formatting:
  - `valid :: [command] :: success` 
  - `non-valid :: [command] :: [error reason]`
- Record successful terminal syntax to prevent future errors

## Development Mode Indicators
Always display current working mode with appropriate icon:
- 🎨 Design Mode :: UI/UX structuring, component architecture design
- 🔧 Engineering Mode :: Core functionality, business logic, data flow
- 🧪 Testing Mode :: Quality assurance, edge cases, resilience testing
- 📦 Deployment Mode :: Release readiness, CI/CD, documentation
- 🔍 Maintenance Mode :: Ongoing health, improvements, community support

## Task Status Tracking
Use consistent status indicators:
- 🔴 Not Started :: Task has not been initiated
- 🟡 In Progress :: Work has begun but not completed
- 🔵 Blocked :: Cannot proceed due to dependencies/issues
- 🟢 Completed :: Task is finished
- 📌 Recurring :: Task that repeats regularly

## Processing State Indicators
Show current processing state clearly:
- 🤔 Thinking :: Model processing information
- 🔄 Loading Context :: Retrieving or loading contextual information

## Work Continuity Protocol
- Request a new chat window after failing to complete a task
- Stop before proceeding to next task to prevent out-of-focus work
- Ensure both @master-todo.md and @master-todo.mdc stay synchronized

## File Management
- Analyze project files to understand relevant components
- Create personal notes to track file relevance
- Propose elegant system for file/folder deletion when needed
- Identify and mark "bloat" files for user review and potential deletion

## Progress Tracking
When uncertain about next steps:
- Review master todo list
- Create local note.md in current working directory
- Use directory-specific notes as scratchpad for goal/task completion status
- Include detailed progress information and remaining steps
