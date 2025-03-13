#!/bin/bash

# Check if command is provided
if [ "$#" -eq 0 ]; then
  echo "Usage: plan [command]"
  echo "Commands:"
  echo "  list     - List available plans"
  echo "  view     - View a specific plan"
  echo "  todo     - Show all active tasks"
  echo "  update   - Update a plan"
  exit 1
fi

# Base directory
BASE_DIR="./docs/planning"
COMMAND=$1

case $COMMAND in
  "list")
    echo "Available Implementation Plans:"
    ls -1 $BASE_DIR | grep ".md" | sed 's/.md$//' | nl
    ;;
    
  "view")
    if [ -z "$2" ]; then
      echo "Please specify a plan to view"
      exit 1
    fi
    
    PLAN_FILE="$BASE_DIR/$2.md"
    if [ -f "$PLAN_FILE" ]; then
      cat "$PLAN_FILE" | less
    else
      echo "Plan '$2' not found"
    fi
    ;;
    
  "todo")
    # Extract tasks marked as in-progress from all plans
    echo "Active Tasks:"
    grep -r "🟡 In Progress" $BASE_DIR --include="*.md" -A 1 | sed 's/.*- /- /'
    ;;
    
  "update")
    if [ -z "$2" ]; then
      echo "Please specify a plan to update"
      exit 1
    fi
    
    PLAN_FILE="$BASE_DIR/$2.md"
    if [ -f "$PLAN_FILE" ]; then
      ${EDITOR:-vi} "$PLAN_FILE"
    else
      echo "Plan '$2' not found"
    fi
    ;;
    
  *)
    echo "Unknown command: $COMMAND"
    exit 1
    ;;
esac 