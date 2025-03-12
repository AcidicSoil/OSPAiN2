#!/bin/bash
#
# Installation script for Development Modes Framework
# This script sets up the mode switcher CLI and git hooks
#

# Get directory of this script
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo "$(cd "$SCRIPT_DIR/.." && pwd)")"

echo "Installing Development Modes Framework..."

# Create notes directory if it doesn't exist
NOTES_DIR="$SCRIPT_DIR/notes"
if [[ ! -d "$NOTES_DIR" ]]; then
    echo "Creating notes directory..."
    mkdir -p "$NOTES_DIR"
fi

# Make mode_switcher.sh executable
echo "Making mode_switcher.sh executable..."
chmod +x "$SCRIPT_DIR/mode_switcher.sh"

# Create a symlink to mode_switcher.sh in a common bin directory if available
BIN_PATHS=("$HOME/bin" "$HOME/.local/bin" "/usr/local/bin")
BIN_INSTALLED=false

for BIN_PATH in "${BIN_PATHS[@]}"; do
    if [[ -d "$BIN_PATH" && -w "$BIN_PATH" ]]; then
        echo "Creating symlink in $BIN_PATH..."
        ln -sf "$SCRIPT_DIR/mode_switcher.sh" "$BIN_PATH/mode-switcher"
        BIN_INSTALLED=true
        break
    fi
done

if [[ "$BIN_INSTALLED" = false ]]; then
    echo "No suitable bin directory found for symlink. You can run the script directly from its location."
fi

# Install git hooks
GIT_DIR="$(git rev-parse --git-dir 2>/dev/null)"
if [[ -n "$GIT_DIR" ]]; then
    echo "Installing git hooks..."
    
    # Create hooks directory if it doesn't exist
    HOOKS_DIR="$GIT_DIR/hooks"
    if [[ ! -d "$HOOKS_DIR" ]]; then
        mkdir -p "$HOOKS_DIR"
    fi
    
    # Copy and make executable the prepare-commit-msg hook
    echo "Installing prepare-commit-msg hook..."
    cp "$SCRIPT_DIR/git-hooks/prepare-commit-msg" "$HOOKS_DIR/"
    chmod +x "$HOOKS_DIR/prepare-commit-msg"
    
    echo "Git hooks installed successfully!"
else
    echo "No Git repository detected. Skipping git hooks installation."
fi

# Create .current_mode file if it doesn't exist
CURRENT_MODE_FILE="$SCRIPT_DIR/.current_mode"
if [[ ! -f "$CURRENT_MODE_FILE" ]]; then
    echo "No active mode" > "$CURRENT_MODE_FILE"
    echo "Created initial .current_mode file."
fi

# Create .mode_history file if it doesn't exist
HISTORY_FILE="$SCRIPT_DIR/.mode_history"
if [[ ! -f "$HISTORY_FILE" ]]; then
    echo "# Mode Transition History" > "$HISTORY_FILE"
    echo "| Date | Previous Mode | New Mode | Reason |" >> "$HISTORY_FILE"
    echo "|------|--------------|----------|--------|" >> "$HISTORY_FILE"
    echo "Created initial .mode_history file."
fi

# Adding alias to .bashrc if shell is bash
if [[ "$SHELL" == *"bash"* ]]; then
    if ! grep -q "alias m=" ~/.bashrc; then
        echo "# Development Mode alias" >> ~/.bashrc
        echo "alias m='$SCRIPT_DIR/mode_switcher.sh'" >> ~/.bashrc
        echo "Added 'm' alias to ~/.bashrc. Run 'source ~/.bashrc' to use it immediately."
    else
        echo "Aliases already exist in .bashrc."
    fi
fi

echo ""
echo "Installation completed successfully!"
echo ""
echo "Usage:"
echo "------"
echo "  ./mode_switcher.sh help                       Show help"
echo "  ./mode_switcher.sh current                    Show current mode"
echo "  ./mode_switcher.sh list                       List all modes"
echo "  ./mode_switcher.sh switch MODE               Switch to a different mode"
echo "  ./mode_switcher.sh notes [MODE]               Edit notes for a mode"
echo ""
echo "Run 'source ~/.bashrc' to use the 'mode-switcher' alias immediately." 