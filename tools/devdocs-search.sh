#!/bin/bash

# DevDocs Search Utility
# 
# A simple bash script to search DevDocs.io for documentation.
# 
# Usage:
#   ./devdocs-search.sh <technology> <search_term>
# 
# Example:
#   ./devdocs-search.sh javascript Array.prototype.map
#   ./devdocs-search.sh react hooks
#   ./devdocs-search.sh typescript interfaces

# Check if arguments are provided
if [ $# -lt 2 ]; then
  echo "Usage: ./devdocs-search.sh <technology> <search_term>"
  echo "Example: ./devdocs-search.sh javascript Array.prototype.map"
  exit 1
fi

# Get technology and search term from command line arguments
technology="$1"
shift
search_term="$*"

# URL encode function
urlencode() {
  local string="$1"
  local strlen=${#string}
  local encoded=""
  local pos c o

  for (( pos=0 ; pos<strlen ; pos++ )); do
    c=${string:$pos:1}
    case "$c" in
      [-_.~a-zA-Z0-9] ) o="${c}" ;;
      * )               printf -v o '%%%02x' "'$c"
    esac
    encoded+="${o}"
  done
  echo "${encoded}"
}

# Construct the DevDocs.io URL
encoded_tech=$(urlencode "$technology")
encoded_search=$(urlencode "$search_term")
url="https://devdocs.io/${encoded_tech}/${encoded_search}"

# Function to check if the URL exists
check_url_exists() {
  local url="$1"
  local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  
  if [ "$status_code" -eq 200 ]; then
    return 0  # URL exists
  else
    return 1  # URL doesn't exist
  fi
}

# Main function
echo "Searching DevDocs.io for \"$search_term\" in $technology documentation..."

# Check if the direct URL exists
if check_url_exists "$url"; then
  echo "Opening: $url"
  
  # Open URL based on OS
  case "$(uname -s)" in
    Linux*)     xdg-open "$url" ;;
    Darwin*)    open "$url" ;;
    CYGWIN*|MINGW*|MSYS*)  start "$url" ;;
    *)          echo "Unsupported OS. Please open the URL manually: $url" ;;
  esac
else
  # If direct URL doesn't exist, open the search page
  search_url="https://devdocs.io/#q=$(urlencode "${technology} ${search_term}")"
  echo "Direct documentation not found. Opening search page: $search_url"
  
  # Open URL based on OS
  case "$(uname -s)" in
    Linux*)     xdg-open "$search_url" ;;
    Darwin*)    open "$search_url" ;;
    CYGWIN*|MINGW*|MSYS*)  start "$search_url" ;;
    *)          echo "Unsupported OS. Please open the URL manually: $search_url" ;;
  esac
fi 