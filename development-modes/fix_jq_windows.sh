#!/bin/bash
#
# fix_jq_windows.sh
#
# This script provides a solution for jq syntax errors in Windows Git Bash
# by creating wrapper functions that handle Windows-specific quoting issues.
#

# Detect if we're running on Windows
is_windows() {
  [[ "$(uname -s)" == *"MINGW"* ]] || [[ "$(uname -s)" == *"MSYS"* ]]
}

# Improved jq_windows wrapper function
jq_windows() {
  if is_windows; then
    # For Windows Git Bash, handle quoting differently
    # Store the first argument (the filter)
    local filter="$1"
    shift

    # Special handling for complex filters on Windows
    # Replace single quotes with escaped single quotes for Windows
    filter=$(echo "$filter" | sed 's/'"'"'/\\'"'"'/g')
    
    # Create a temporary file for the JSON input to avoid pipe issues
    if [ -n "$1" ]; then
      local tmpfile=$(mktemp -t jq_windows_XXXXXX)
      cat "$1" > "$tmpfile"
      jq "$filter" "$tmpfile"
      local result=$?
      rm -f "$tmpfile"
      return $result
    else
      # If no file is provided, assume JSON is coming from stdin
      local tmpfile=$(mktemp -t jq_windows_XXXXXX)
      cat > "$tmpfile"
      jq "$filter" "$tmpfile"
      local result=$?
      rm -f "$tmpfile"
      return $result
    fi
  else
    # On non-Windows systems, just pass through to regular jq
    jq "$@"
  fi
}

# Install the function into the user's .bashrc if not already there
install_jq_windows_function() {
  if ! grep -q "jq_windows()" ~/.bashrc; then
    # Add is_windows function first
    echo "# is_windows function for detecting Windows environment" >> ~/.bashrc
    echo "is_windows() {" >> ~/.bashrc
    echo "  [[ \"\$(uname -s)\" == *\"MINGW\"* ]] || [[ \"\$(uname -s)\" == *\"MSYS\"* ]]" >> ~/.bashrc
    echo "}" >> ~/.bashrc
    echo "" >> ~/.bashrc
    
    # Then add jq_windows function
    echo "# jq_windows wrapper function to handle Windows quoting issues" >> ~/.bashrc
    declare -f jq_windows >> ~/.bashrc
    echo "alias jq=jq_windows" >> ~/.bashrc
    echo "Installed is_windows and jq_windows functions in ~/.bashrc"
    echo "Please restart your shell or run 'source ~/.bashrc' to apply changes"
  else
    echo "jq_windows function already installed in ~/.bashrc"
    
    # Check if is_windows function exists, add if not
    if ! grep -q "is_windows()" ~/.bashrc; then
      # Insert is_windows function before jq_windows
      sed -i '/# jq_windows wrapper function/i # is_windows function for detecting Windows environment\nis_windows() {\n  [[ "$(uname -s)" == *"MINGW"* ]] || [[ "$(uname -s)" == *"MSYS"* ]]\n}\n' ~/.bashrc
      echo "Added missing is_windows function to ~/.bashrc"
    fi
  fi
}

# Fix mode-context.sh to use the jq_windows function
fix_mode_context_sh() {
  local mode_context_sh="$(dirname "$0")/mode-context.sh"
  
  if [ -f "$mode_context_sh" ]; then
    # Backup original file
    cp "$mode_context_sh" "${mode_context_sh}.bak"
    
    # Add jq_windows function to the script if not present
    if ! grep -q "jq_windows()" "$mode_context_sh"; then
      local temp_file=$(mktemp)
      echo '#!/bin/bash' > "$temp_file"
      echo '#' >> "$temp_file"
      echo '# Mode Context Script' >> "$temp_file"
      echo '# Outputs the current development mode context' >> "$temp_file"
      echo '#' >> "$temp_file"
      echo '' >> "$temp_file"
      echo '# Function to handle jq syntax issues in Windows' >> "$temp_file"
      echo 'jq_windows() {' >> "$temp_file"
      echo '  if [[ "$(uname -s)" == *"MINGW"* ]] || [[ "$(uname -s)" == *"MSYS"* ]]; then' >> "$temp_file"
      echo '    # Special handling for Windows Git Bash' >> "$temp_file"
      echo '    local filter="$1"' >> "$temp_file"
      echo '    shift' >> "$temp_file"
      echo '    filter=$(echo "$filter" | sed '"'"'s/'"'"''"'"''"'"'/\\'"'"''"'"''"'"'/g'"'"')' >> "$temp_file"
      echo '    if [ -n "$1" ]; then' >> "$temp_file"
      echo '      local tmpfile=$(mktemp -t jq_windows_XXXXXX)' >> "$temp_file"
      echo '      cat "$1" > "$tmpfile"' >> "$temp_file"
      echo '      jq "$filter" "$tmpfile"' >> "$temp_file"
      echo '      local result=$?' >> "$temp_file"
      echo '      rm -f "$tmpfile"' >> "$temp_file"
      echo '      return $result' >> "$temp_file"
      echo '    else' >> "$temp_file"
      echo '      local tmpfile=$(mktemp -t jq_windows_XXXXXX)' >> "$temp_file"
      echo '      cat > "$tmpfile"' >> "$temp_file"
      echo '      jq "$filter" "$tmpfile"' >> "$temp_file"
      echo '      local result=$?' >> "$temp_file"
      echo '      rm -f "$tmpfile"' >> "$temp_file"
      echo '      return $result' >> "$temp_file"
      echo '    fi' >> "$temp_file"
      echo '  else' >> "$temp_file"
      echo '    # Just use regular jq on non-Windows systems' >> "$temp_file"
      echo '    jq "$@"' >> "$temp_file"
      echo '  fi' >> "$temp_file"
      echo '}' >> "$temp_file"
      echo '' >> "$temp_file"
      
      # Append the rest of the original script
      tail -n +6 "$mode_context_sh" >> "$temp_file"
      
      # Replace original with fixed version
      mv "$temp_file" "$mode_context_sh"
      chmod +x "$mode_context_sh"
      
      echo "Added jq_windows function to $mode_context_sh"
    else
      echo "jq_windows function already exists in $mode_context_sh"
    fi
  else
    echo "Error: Could not find mode-context.sh at $mode_context_sh"
  fi
}

# Fix any scripts that use jq to read JSON configuration files
fix_jq_usage_in_scripts() {
  echo "Scanning for scripts that use jq..."
  
  # Find scripts that use jq
  local scripts=$(grep -l "jq " --include="*.sh" -r "$(dirname "$0")/..")
  
  for script in $scripts; do
    if [ "$script" != "$(readlink -f "$0")" ] && [ "$script" != "$(dirname "$0")/mode-context.sh" ]; then
      echo "Fixing jq usage in $script"
      
      # Backup original script
      cp "$script" "${script}.bak"
      
      # Check if script already sources this fix script
      if ! grep -q "source.*fix_jq_windows.sh" "$script"; then
        # Add source line to the script, just after the shebang
        local temp_file=$(mktemp)
        head -n 1 "$script" > "$temp_file"
        echo '' >> "$temp_file"
        echo '# Source the jq_windows fix script' >> "$temp_file"
        echo "source \"$(readlink -f "$0")\"" >> "$temp_file"
        echo '' >> "$temp_file"
        tail -n +2 "$script" >> "$temp_file"
        mv "$temp_file" "$script"
        chmod +x "$script"
        
        echo "Added fix_jq_windows.sh source line to $script"
      else
        echo "Script already sources fix_jq_windows.sh"
      fi
    fi
  done
}

# Main function
main() {
  echo "==== jq Windows Fix Tool ===="
  
  # Check if jq is installed
  if ! command -v jq &> /dev/null; then
    echo "Error: jq is not installed. Please install jq first."
    exit 1
  fi
  
  # Fix mode-context.sh
  fix_mode_context_sh
  
  # Fix jq usage in other scripts
  fix_jq_usage_in_scripts
  
  # Install the function globally if running on Windows
  if is_windows; then
    install_jq_windows_function
  fi
  
  echo "==== Fix completed ===="
  echo "Please restart your shell or run the following command to apply changes immediately:"
  echo "source ~/.bashrc"
}

# Run the main function
main 