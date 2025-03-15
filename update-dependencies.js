const fs = require('fs');
const path = require('path');

// Path to the OSPAiN2-hub-new package.json file
const packageJsonPath = path.join(__dirname, 'OSPAiN2-hub-new', 'package.json');

// Dependencies required for component migration
const newDependencies = {
  // For TodoManager
  '@mui/material': '^5.15.10',
  '@mui/icons-material': '^5.15.10',
  '@emotion/react': '^11.11.3',
  '@emotion/styled': '^11.11.0',
  
  // For EcosystemGraph
  'react-force-graph': '^1.44.1',
  'd3': '^7.8.5',
  
  // For visualization components
  'mermaid': '^10.6.1',
  'react-syntax-highlighter': '^15.5.0',
  
  // Core dependencies (if not already present)
  'zustand': '^4.4.7',
  'react-query': '^3.39.3',
  'axios': '^1.6.7'
};

// Read the current package.json
fs.readFile(packageJsonPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading package.json:', err);
    return;
  }

  try {
    const packageJson = JSON.parse(data);
    
    // Merge new dependencies with existing ones
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...newDependencies
    };
    
    // Sort dependencies alphabetically
    const sortedDependencies = {};
    Object.keys(packageJson.dependencies).sort().forEach(key => {
      sortedDependencies[key] = packageJson.dependencies[key];
    });
    packageJson.dependencies = sortedDependencies;
    
    // Write the updated package.json
    fs.writeFile(
      packageJsonPath, 
      JSON.stringify(packageJson, null, 2), 
      'utf8', 
      (err) => {
        if (err) {
          console.error('Error writing package.json:', err);
          return;
        }
        console.log('Successfully updated OSPAiN2-hub-new package.json with component migration dependencies');
      }
    );
  } catch (parseError) {
    console.error('Error parsing package.json:', parseError);
  }
}); 