# Terminal Configuration

## Environment Details
- OS: Windows 10 (win32 10.0.26100)
- Shell: Git Bash (C:\Program Files\Git\bin\bash.exe)
- Workspace: /c%3A/Users/comfy/Projects

## Preferred Terminal
Git Bash will be used as the primary terminal for this project due to:
- Unix-like command syntax
- Better compatibility with shell scripts
- Built-in Git integration

## Command Execution Rules
The following commands are approved for automatic execution:
- python
- jq
- mkdir
- touch
- curl
- ollama
- grep
- find
- htop
- tail
- cp
- copy

## Common Commands
### Project Setup
```bash
# Install dependencies
yarn install

# Build TypeScript
yarn build

# Run tests
yarn test
```

### Development
```bash
# Start development
yarn dev

# Type checking
yarn type-check

# Linting
yarn lint
```

### Git Operations
```bash
# Initialize repository
git init

# Add files
git add .

# Commit changes
git commit -m "message"

# Push changes
git push origin main
```

## Notes
- Always use yarn for package management
- Use Git Bash for consistent behavior across commands
- Ensure proper line endings (LF) in all files
- Run commands from project root unless specified otherwise

## Troubleshooting
1. Line Ending Issues
   - Use `.gitattributes` to enforce LF
   - Check Git config: `git config --global core.autocrlf false`

2. Permission Issues
   - Use `chmod +x` for scripts
   - Run Git Bash as administrator if needed

3. Path Issues
   - Use forward slashes (/) in paths
   - Use relative paths from project root 