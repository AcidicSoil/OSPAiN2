# Ollama Tag CLI Project Notes

## Project Setup

- Created on: 2025-03-10
- Initial setup includes:
  - TypeScript configuration
  - Basic project structure
  - Git repository initialization

## Environment

- Node.js version: 18+ LTS required
- TypeScript version: 5.0+
- Package manager: Yarn

## Dependencies

### Production

- chalk: Terminal styling
- commander: CLI framework
- inquirer: Interactive prompts

### Development

- @types/inquirer: TypeScript definitions
- @types/node: Node.js type definitions
- typescript: TypeScript compiler

## Known Issues

1. TypeScript module resolution needs configuration
   - Status: 🟡 In Progress
   - Priority: 1
   - Notes: Updating tsconfig.json for proper module resolution

## Testing Environment

- Directory: ./test
- Framework: Jest (to be implemented)

## Security Considerations

- No sensitive data in repository
- Using environment variables for configuration
- Input validation required for all user inputs

## Performance Notes

- Monitor memory usage with large tag sets
- Implement proper error boundaries
- Consider caching for frequently accessed tags

## TODO Priorities

1. Fix TypeScript configuration
2. Implement basic CLI structure
3. Add tag management features
4. Implement testing framework
5. Add documentation

## Changelog

### 2025-03-10

- Initial project setup
- Created basic directory structure
- Added TypeScript configuration
- Moved master-todo.md to .cursor/ directory for improved model context awareness
- Created ecosystem-context.mdc master rule for project conventions and context awareness
- Added P1 task for implementing laser-focus and dont-reply-back rules in ecosystem
- Started Quick-Prompt Extension implementation with basic structure and command palette
- Implemented intelligent rule sorting based on context and fuzzy search in Quick-Prompt Extension
