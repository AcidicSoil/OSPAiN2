#!/bin/bash

viewplan() {
    if [ -f "./docs/planning/implementation-plan.md" ]; then
        cat "./docs/planning/implementation-plan.md" | less
    else
        echo "Implementation plan not found. Run save-implementation-plan script first."
    fi
}

# Add to your shell profile for permanent access:
# echo 'viewplan() { ... }' >> ~/.bashrc