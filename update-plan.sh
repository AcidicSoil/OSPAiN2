#!/bin/bash

# Open the implementation plan in your default editor
if [ -f "./docs/planning/implementation-plan.md" ]; then
    ${EDITOR:-vi} "./docs/planning/implementation-plan.md"
else
    echo "Implementation plan not found. Run save-implementation-plan script first."
fi