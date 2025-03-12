#!/usr/bin/env node

/**
 * DevDocs Search Utility
 *
 * A simple command-line tool to search DevDocs.io for documentation.
 *
 * Usage:
 *   node devdocs-search.js <technology> <search_term>
 *
 * Example:
 *   node devdocs-search.js javascript Array.prototype.map
 *   node devdocs-search.js react hooks
 *   node devdocs-search.js typescript interfaces
 */

const https = require('https');
const { default: openUrl } = require('open');

// Check if arguments are provided
if (process.argv.length < 4) {
  console.log('Usage: node devdocs-search.js <technology> <search_term>');
  console.log('Example: node devdocs-search.js javascript Array.prototype.map');
  process.exit(1);
}

// Get technology and search term from command line arguments
const technology = process.argv[2].toLowerCase();
const searchTerm = process.argv.slice(3).join(' ');

// Construct the DevDocs.io URL
const url = `https://devdocs.io/${encodeURIComponent(technology)}/${encodeURIComponent(searchTerm)}`;

// Function to check if the URL exists
function checkUrlExists(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        resolve(false);
      }
      res.resume(); // Consume response data to free up memory
    });

    req.on('error', () => {
      resolve(false);
    });

    req.end();
  });
}

// Main function
async function main() {
  console.log(`Searching DevDocs.io for "${searchTerm}" in ${technology} documentation...`);

  // Check if the direct URL exists
  const urlExists = await checkUrlExists(url);

  if (urlExists) {
    console.log(`Opening: ${url}`);
    openUrl(url);
  } else {
    // If direct URL doesn't exist, open the search page
    const searchUrl = `https://devdocs.io/#q=${encodeURIComponent(technology + ' ' + searchTerm)}`;
    console.log(`Direct documentation not found. Opening search page: ${searchUrl}`);
    openUrl(searchUrl);
  }
}

// Run the main function
main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
