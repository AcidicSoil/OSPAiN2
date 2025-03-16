#!/bin/bash

# Fix Git Bash bracketed paste mode issue causing [200~ prefixes
# This script adds configuration to disable bracketed paste mode in Git Bash

echo "Fixing Git Bash bracketed paste mode issue..."

# Create or update .inputrc in home directory
INPUTRC_FILE="$HOME/.inputrc"

# Check if the file exists and if the setting is already there
if [ -f "$INPUTRC_FILE" ] && grep -q "set enable-bracketed-paste off" "$INPUTRC_FILE"; then
    echo "Bracketed paste mode is already disabled in $INPUTRC_FILE"
else
    # Add the configuration to disable bracketed paste mode
    echo "set enable-bracketed-paste off" >> "$INPUTRC_FILE"
    echo "Added 'set enable-bracketed-paste off' to $INPUTRC_FILE"
fi

# Create a helper function for .bashrc to handle [200~ prefix in commands
BASHRC_FILE="$HOME/.bashrc"
BASHRC_FIX=$(cat << 'EOF'

# Fix for [200~ prefix in Git Bash
function clean_command() {
    local cmd="$1"
    # Remove [200~ prefix and similar terminal escape sequences
    echo "$cmd" | sed 's/\[200~//g' | sed 's/~$//g'
}

# Create a wrapper for common commands that might be affected
function t2p() {
    local cleaned_args=()
    for arg in "$@"; do
        cleaned_args+=("$(clean_command "$arg")")
    done
    command t2p "${cleaned_args[@]}"
}

function m() {
    local cleaned_args=()
    for arg in "$@"; do
        cleaned_args+=("$(clean_command "$arg")")
    done
    command m "${cleaned_args[@]}"
}

# Add more command wrappers as needed
EOF
)

# Check if the fix is already in .bashrc
if [ -f "$BASHRC_FILE" ] && grep -q "Fix for \[200~ prefix in Git Bash" "$BASHRC_FILE"; then
    echo "Command wrapper functions already exist in $BASHRC_FILE"
else
    # Add the fix to .bashrc
    echo "$BASHRC_FIX" >> "$BASHRC_FILE"
    echo "Added command wrapper functions to $BASHRC_FILE"
fi

echo "Fix applied. Please restart your Git Bash terminal or run 'source ~/.bashrc' to apply changes."
echo "This should resolve the [200~ prefix issue with t2p, m, and other commands." 