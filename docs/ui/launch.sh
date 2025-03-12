#!/bin/bash
echo "Launching Ollama Ecosystem Design UI..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "$(dirname "$0")/index.html"
else
    # Linux
    xdg-open "$(dirname "$0")/index.html"
fi
echo "UI launched in your default browser." 