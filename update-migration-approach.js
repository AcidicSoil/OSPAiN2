const fs = require('fs');
const path = require('path');

// Path to the master-todo.mdc file
const todoFilePath = path.join(__dirname, '@master-todo.mdc');

// Read the current content
fs.readFile(todoFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // The new content for the Frontend Framework Migration section
  const newMigrationSection = `### Frontend Framework Migration
- 🔴 **P3**: Continue Component-Based Migration Approach
  - Purpose: Efficiently migrate high-value components from ollama-schematics-ui while continuing Vite implementation
  - Tasks:
    - 🟢 Project Setup Phase:
      - ✅ Set up Vite with React and TypeScript
      - ✅ Configure Tailwind CSS for styling
      - ✅ Set up ESLint and Prettier for code quality
      - ✅ Configure testing environment with Vitest
    - 🟡 Component Migration Phase:
      - 🟡 High Priority Components:
        - 🔴 Migrate TodoManager Component
        - 🔴 Migrate EcosystemGraph Component
        - 🔴 Migrate KnowledgeExplorer Component
      - 🔴 Medium Priority Components:
        - 🔴 Migrate MermaidDiagram Component
        - 🔴 Migrate JsonViewer Component
        - 🔴 Migrate ToastNotification Component
      - 🔴 Low Priority Components (Optional):
        - 🔴 Consider OpenManusAgent Component
        - 🔴 Consider SchematicViewer & EcosystemViewer3D Components
    - 🟡 Integration Phase:
      - ✅ Implement state management with Zustand
      - ✅ Set up React Query for data fetching
      - 🔴 Integrate migrated components into relevant pages
      - 🔴 Update navigation links in the sidebar
    - 🔴 Testing and Documentation:
      - 🔴 Test each component individually for functionality
      - 🔴 Test integration with the OSPAiN2-hub application
      - 🔴 Document migrated components in README.md
      - 🔴 Update references in master-todo.md to new locations
  - Implementation notes:
    - Following component migration strategy as outlined in migration-plan.mdc
    - Vite implementation already successfully underway with core infrastructure complete
    - Focus on high-value components first before optional ones
    - Strategy prioritizes immediate value delivery over complete framework migration
  - Technical benefits:
    - Faster delivery of useful features
    - Reduced migration risk with incremental approach
    - Continued progress on existing Vite implementation
    - Storage savings by consolidating functionality
    - Improved focus on component quality and integration
  - Timeline:
    - High Priority Components: 5-7 days
    - Medium Priority Components: 3-5 days
    - Low Priority Components: 2-3 days (if deemed necessary)
    - Total estimate: 10-15 days (vs. 25-30 days for complete framework migration)
  - PRIORITY: Medium - Component migration can proceed alongside other development efforts`;

  // The old section starts with this line
  const sectionStart = '### Frontend Framework Migration';
  
  // The next section starts with this
  const nextSectionStart = '### Docker Setup and Integration';
  
  // Find the first occurrence of the section
  const sectionStartIndex = data.indexOf(sectionStart);
  if (sectionStartIndex === -1) {
    console.error('Could not find Frontend Framework Migration section');
    return;
  }
  
  // Find where the next section starts
  const nextSectionIndex = data.indexOf(nextSectionStart, sectionStartIndex);
  if (nextSectionIndex === -1) {
    console.error('Could not find the next section after Frontend Framework Migration');
    return;
  }
  
  // Create the new content
  const newContent = 
    data.substring(0, sectionStartIndex) + 
    newMigrationSection + 
    '\n\n' +
    data.substring(nextSectionIndex);
  
  // Write the new content back to the file
  fs.writeFile(todoFilePath, newContent, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('Successfully updated Frontend Framework Migration section in @master-todo.mdc');
  });
}); 