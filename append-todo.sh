#!/bin/bash

# Script to append the Documentation Standards Enforcer Agent task to @master-todo.mdc

# Ensure we're in the right directory
cd "$(dirname "$0")" || exit 1

# Create the temporary content
cat > temp-content.md << 'EOL'

- 🔴 [H1] **P1**: Develop Documentation Standards Enforcer Agent
  - Purpose: Automatically scan codebase and correct documentation not aligned with standards
  - See detailed documentation in [documentation-enforcer-agent.md](documentation-enforcer-agent.md)
  - PRIORITY: Critical - Essential for maintaining documentation standards at scale

EOL

# Find the Documentation and Compatibility section and append the task
sed -i '/### Documentation and Compatibility/r temp-content.md' @master-todo.mdc

# Clean up the temporary file
rm temp-content.md

echo "Documentation Standards Enforcer Agent task added to @master-todo.mdc"
