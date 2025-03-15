#!/bin/bash
#
# Development Mode Switcher
# A utility script to switch between different development modes and record transitions
#

MODES_DIR="$(dirname "$0")"
CURRENT_MODE_FILE="$MODES_DIR/.current_mode"
HISTORY_FILE="$MODES_DIR/.mode_history"
AVAILABLE_MODES=("design" "engineering" "testing" "deployment" "maintenance")
MODE_EMOJIS=("🎨" "🔧" "🧪" "📦" "🔍")

# Function to resolve shortened mode names to full names
resolve_mode_name() {
    local INPUT_MODE="$1"
    local RESOLVED_MODE=""
    
    case "$INPUT_MODE" in
        "des"*) RESOLVED_MODE="design" ;;
        "eng"*) RESOLVED_MODE="engineering" ;;
        "test"*) RESOLVED_MODE="testing" ;;
        "dep"*) RESOLVED_MODE="deployment" ;;
        "main"*) RESOLVED_MODE="maintenance" ;;
        *) RESOLVED_MODE="$INPUT_MODE" ;;
    esac
    
    echo "$RESOLVED_MODE"
}

# Initialize files if they don't exist
if [[ ! -f "$HISTORY_FILE" ]]; then
    echo "# Mode Transition History" > "$HISTORY_FILE"
    echo "| Date | Previous Mode | New Mode | Reason |" >> "$HISTORY_FILE"
    echo "|------|--------------|----------|--------|" >> "$HISTORY_FILE"
fi

if [[ ! -f "$CURRENT_MODE_FILE" ]]; then
    echo "No active mode" > "$CURRENT_MODE_FILE"
fi

# Function to sync mode across components
sync_mode() {
    # Check if we have the TypeScript sync service
    if [ -f "$MODES_DIR/mode-sync-service.ts" ]; then
        echo "Syncing mode across components..."
        # Try to run with ts-node if available
        if command -v npx &> /dev/null; then
            npx ts-node "$MODES_DIR/mode-sync-service.ts" sync
        else
            echo "Warning: npx not available, mode synchronization might not be complete"
            # Try with node directly if compiled .js exists
            if [ -f "$MODES_DIR/mode-sync-service.js" ]; then
                node "$MODES_DIR/mode-sync-service.js" sync
            else
                echo "Warning: Could not find mode-sync-service.js, please compile the TypeScript file"
            fi
        fi
    else
        echo "Warning: Mode sync service not found, components might display different modes"
    fi
}

# Function to show the current mode
show_current_mode() {
    if [[ -f "$CURRENT_MODE_FILE" ]]; then
        CURRENT=$(cat "$CURRENT_MODE_FILE")
        if [[ "$CURRENT" == "No active mode" ]]; then
            echo "No active development mode set"
        else
            MODE_INDEX=0
            for i in "${!AVAILABLE_MODES[@]}"; do
                if [[ "${AVAILABLE_MODES[$i]}" = "$CURRENT" ]]; then
                    MODE_INDEX=$i
                    break
                fi
            done
            echo "Current mode: ${MODE_EMOJIS[$MODE_INDEX]} ${CURRENT^}"
            echo ""
            echo "Mode details:"
            cat "$MODES_DIR/$CURRENT" | head -2
            echo "..."
        fi
    else
        echo "No active mode"
    fi
}

# Function to list all available modes
list_modes() {
    echo "Available development modes:"
    echo ""
    for i in "${!AVAILABLE_MODES[@]}"; do
        echo "${MODE_EMOJIS[$i]} ${AVAILABLE_MODES[$i]^}"
        if [[ -f "$MODES_DIR/${AVAILABLE_MODES[$i]}" ]]; then
            sed -n '2p' "$MODES_DIR/${AVAILABLE_MODES[$i]}"
            echo ""
        fi
    done
}

# Function to generate automatic reason based on mode
generate_reason() {
    local MODE="$1"
    case "$MODE" in
        "design")
            echo "Transitioning to UI/UX design and component architecture phase"
            ;;
        "engineering")
            echo "Moving to core development and implementation phase"
            ;;
        "testing")
            echo "Beginning quality assurance and testing procedures"
            ;;
        "deployment")
            echo "Preparing for deployment and release activities"
            ;;
        "maintenance")
            echo "Switching to system maintenance and support operations"
            ;;
        *)
            echo "Switching development modes"
            ;;
    esac
}

# Function to switch to a new mode
switch_mode() {
    # Resolve the mode name first
    NEW_MODE="$(resolve_mode_name "$1")"
    if [[ -z "$2" ]]; then
        REASON="$(generate_reason "$NEW_MODE")"
    else
        REASON="$2"
    fi
    
    # Validate mode
    VALID_MODE=false
    for mode in "${AVAILABLE_MODES[@]}"; do
        if [[ "$mode" = "$NEW_MODE" ]]; then
            VALID_MODE=true
            break
        fi
    done
    
    if [[ "$VALID_MODE" = false ]]; then
        echo "Error: '$1' is not a valid mode."
        echo "Available modes (with shortcuts):"
        echo "  des[ign]"
        echo "  eng[ineering]"
        echo "  test[ing]"
        echo "  dep[loyment]"
        echo "  main[tenance]"
        exit 1
    fi
    
    # Get current mode
    CURRENT="$(cat "$CURRENT_MODE_FILE")"
    if [[ "$CURRENT" = "$NEW_MODE" ]]; then
        echo "Already in $NEW_MODE mode."
        # Even if already in this mode, sync to ensure all components display it correctly
        sync_mode
        exit 0
    fi
    
    # Update current mode
    echo "$NEW_MODE" > "$CURRENT_MODE_FILE"
    
    # Record transition in history
    DATE=$(date "+%Y-%m-%d %H:%M:%S")
    echo "| $DATE | $CURRENT | $NEW_MODE | $REASON |" >> "$HISTORY_FILE"
    
    # Get emoji for new mode
    MODE_INDEX=0
    for i in "${!AVAILABLE_MODES[@]}"; do
        if [[ "${AVAILABLE_MODES[$i]}" = "$NEW_MODE" ]]; then
            MODE_INDEX=$i
            break
        fi
    done
    
    echo "Switched to ${MODE_EMOJIS[$MODE_INDEX]} ${NEW_MODE^} mode"
    echo "Reason: $REASON"
    
    # Sync mode across components
    sync_mode
    
    # Show transition criteria from previous mode if applicable
    if [[ "$CURRENT" != "No active mode" ]]; then
        for mode in "${AVAILABLE_MODES[@]}"; do
            if [[ "$mode" = "$CURRENT" ]]; then
                echo ""
                echo "Transition criteria from previous mode (${CURRENT^}):"
                sed -n '/^## Transition Criteria/,/^## /p' "$MODES_DIR/$CURRENT" | grep -v "^## " | grep -v "^$"
                break
            fi
        done
    fi
    
    # Show objectives for new mode
    echo ""
    echo "Objectives for ${NEW_MODE^} mode:"
    sed -n '/^## Objectives/,/^## /p' "$MODES_DIR/$NEW_MODE" | grep -v "^## " | grep -v "^$"
}

# Function to show mode history
show_history() {
    if [[ -f "$HISTORY_FILE" ]]; then
        cat "$HISTORY_FILE"
    else
        echo "No mode transition history available."
    fi
}

# Function to edit mode-specific notes
edit_notes() {
    MODE="$1"
    
    # If no mode is specified, use current mode
    if [[ -z "$MODE" ]]; then
        if [[ -f "$CURRENT_MODE_FILE" ]]; then
            MODE=$(cat "$CURRENT_MODE_FILE")
            if [[ "$MODE" == "No active mode" ]]; then
                echo "Error: No active mode. Please specify a mode to edit notes for."
                echo "Usage: $(basename "$0") notes MODE"
                exit 1
            fi
        else
            echo "Error: No active mode. Please specify a mode to edit notes for."
            echo "Usage: $(basename "$0") notes MODE"
            exit 1
        fi
    fi
    
    # Validate mode
    VALID_MODE=false
    for mode in "${AVAILABLE_MODES[@]}"; do
        if [[ "$mode" = "$MODE" ]]; then
            VALID_MODE=true
            break
        fi
    done
    
    if [[ "$VALID_MODE" = false ]]; then
        echo "Error: '$MODE' is not a valid mode."
        echo "Available modes: ${AVAILABLE_MODES[*]}"
        exit 1
    fi
    
    # Determine emoji for the mode
    MODE_INDEX=0
    for i in "${!AVAILABLE_MODES[@]}"; do
        if [[ "${AVAILABLE_MODES[$i]}" = "$MODE" ]]; then
            MODE_INDEX=$i
            break
        fi
    done
    
    # Create mode notes directory if it doesn't exist
    NOTES_DIR="$MODES_DIR/notes"
    if [[ ! -d "$NOTES_DIR" ]]; then
        mkdir -p "$NOTES_DIR"
    fi
    
    # Create notes file if it doesn't exist
    NOTES_FILE="$NOTES_DIR/${MODE}_notes.md"
    if [[ ! -f "$NOTES_FILE" ]]; then
        echo "# ${MODE_EMOJIS[$MODE_INDEX]} ${MODE^} Mode Notes" > "$NOTES_FILE"
        echo "" >> "$NOTES_FILE"
        echo "## Overview" >> "$NOTES_FILE"
        echo "" >> "$NOTES_FILE"
        echo "Add your notes for ${MODE^} mode here." >> "$NOTES_FILE"
        echo "" >> "$NOTES_FILE"
        echo "## Current Tasks" >> "$NOTES_FILE"
        echo "" >> "$NOTES_FILE"
        echo "- [ ] Task 1" >> "$NOTES_FILE"
        echo "- [ ] Task 2" >> "$NOTES_FILE"
        echo "" >> "$NOTES_FILE"
        echo "## Important Decisions" >> "$NOTES_FILE"
        echo "" >> "$NOTES_FILE"
        echo "Document any important decisions made during ${MODE^} mode here." >> "$NOTES_FILE"
        echo "" >> "$NOTES_FILE"
        echo "## Resources" >> "$NOTES_FILE"
        echo "" >> "$NOTES_FILE"
        echo "List any helpful resources for ${MODE^} mode here." >> "$NOTES_FILE"
    fi
    
    # Determine editor to use
    EDITOR=${EDITOR:-vi}
    if command -v nano > /dev/null; then
        EDITOR=nano
    fi
    
    # Edit the notes file
    echo "Editing notes for ${MODE_EMOJIS[$MODE_INDEX]} ${MODE^} mode..."
    $EDITOR "$NOTES_FILE"
    
    echo ""
    echo "Notes saved to: $NOTES_FILE"
}

# Function to show help
show_help() {
    echo "Development Mode Switcher"
    echo "Usage: $(basename "$0") [command] [options]"
    echo "   or: m [command] [options]  (when using the alias)"
    echo ""
    echo "Commands:"
    echo "  current             Show the current development mode"
    echo "  list                List all available development modes"
    echo "  switch MODE [REASON] Switch to a different development mode (reason is optional)"
    echo "  history             Show mode transition history"
    echo "  notes [MODE]        Edit notes for the specified mode or current mode"
    echo "  help                Show this help message"
}

# Main command processing
COMMAND="${1:-help}"

case "$COMMAND" in
    current)
        show_current_mode
        ;;
    list)
        list_modes
        ;;
    switch)
        if [[ -z "$2" ]]; then
            echo "Error: MODE parameter is required."
            echo "Usage: $(basename "$0") switch MODE [REASON]"
            exit 1
        fi
        
        SWITCH_MODE="$2"
        REASON="${*:3}"
        
        switch_mode "$SWITCH_MODE" "$REASON"
        ;;
    history)
        show_history
        ;;
    notes)
        edit_notes "$2"
        ;;
    help|*)
        show_help
        ;;
esac

exit 0 