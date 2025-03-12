# Migration Plan: ollama-schematics-ui to OSPAiN2-hub

## Overview

This document outlines a plan to migrate valuable components from the ollama-schematics-ui project to the OSPAiN2-hub project, with the goal of consolidating functionality and reducing storage requirements.

## Components to Migrate

Based on a comprehensive analysis of both codebases, the following components should be migrated:

### High Priority Components

1. **TodoManager Component**

   - Source: `ollama-schematics-ui/src/components/todo/TodoManager.tsx`
   - Target: `OSPAiN2-hub/src/components/todo/TodoManager.tsx`
   - Description: Comprehensive todo management system with priority tracking, filtering, and status management
   - Migration complexity: Medium (has Material UI dependencies)

2. **EcosystemGraph Component**

   - Source: `ollama-schematics-ui/src/components/visualization/EcosystemGraph.tsx`
   - Target: `OSPAiN2-hub/src/components/visualization/EcosystemGraph.tsx`
   - Description: Force-directed graph visualization of the Ollama ecosystem
   - Migration complexity: Medium (requires react-force-graph dependency)

3. **KnowledgeExplorer Component**
   - Source: `ollama-schematics-ui/src/components/KnowledgeGraph/KnowledgeExplorer.tsx`
   - Target: `OSPAiN2-hub/src/components/knowledge/KnowledgeExplorer.tsx`
   - Description: Interface for exploring the knowledge graph with search capabilities
   - Migration complexity: Low (has simple MCP service integration)

### Medium Priority Components

4. **MermaidDiagram Component**

   - Source: `ollama-schematics-ui/src/components/MermaidDiagram.tsx`
   - Target: `OSPAiN2-hub/src/components/visualization/MermaidDiagram.tsx`
   - Description: Mermaid.js diagram renderer
   - Migration complexity: Low

5. **JsonViewer Component**

   - Source: `ollama-schematics-ui/src/components/JsonViewer.tsx`
   - Target: `OSPAiN2-hub/src/components/utils/JsonViewer.tsx`
   - Description: Formatted JSON viewer component
   - Migration complexity: Low

6. **ToastNotification Component**
   - Source: `ollama-schematics-ui/src/components/ToastNotification.tsx`
   - Target: `OSPAiN2-hub/src/components/ui/ToastNotification.tsx`
   - Description: Notification system for displaying alerts and messages
   - Migration complexity: Low

### Low Priority Components (Optional)

7. **OpenManusAgent Component**

   - Source: `ollama-schematics-ui/src/components/OpenManusAgent.tsx`
   - Target: `OSPAiN2-hub/src/components/agents/OpenManusAgent.tsx`
   - Description: Interface for interacting with OpenManus agent
   - Migration complexity: Low (placeholder UI currently)

8. **SchematicViewer & EcosystemViewer3D Components**
   - Source: `ollama-schematics-ui/src/components/SchematicViewer.tsx` and `EcosystemViewer3D.tsx`
   - Target: `OSPAiN2-hub/src/components/visualization/`
   - Description: Alternative visualization components
   - Migration complexity: Medium (3D component has Three.js dependencies)

## Migration Steps

For each component:

1. **Setup Dependencies**

   - Check package.json from ollama-schematics-ui and add any required dependencies to OSPAiN2-hub

2. **Create Directory Structure**

   - Create necessary directories in OSPAiN2-hub to match the component organization

3. **Copy and Adapt Component Code**

   - Copy the component code
   - Update imports to match the OSPAiN2-hub project structure
   - Adapt styling to match OSPAiN2-hub's styling approach (Tailwind CSS)
   - Fix any TypeScript type issues

4. **Update Page Integration**

   - Modify or create pages in OSPAiN2-hub to use the newly migrated components
   - Update navigation links in the sidebar

5. **Test Functionality**
   - Test each component individually to ensure it works correctly
   - Test integration with the rest of the OSPAiN2-hub application

## Implementation Order

1. Begin with TodoManager and KnowledgeExplorer components (highest value)
2. Proceed with EcosystemGraph visualization
3. Add supporting components (MermaidDiagram, JsonViewer, ToastNotification)
4. Finally, consider the optional components if they provide clear value

## Dependency Requirements

Add the following dependencies to OSPAiN2-hub's package.json (if not already present):

```json
{
  "dependencies": {
    "react-force-graph": "^1.43.0",
    "mermaid": "^10.6.1",
    "react-syntax-highlighter": "^15.5.0"
  }
}
```

## Post-Migration Cleanup

After successful migration and testing:

1. Document the migrated components in OSPAiN2-hub's README.md
2. Update any references in the master-todo.md to point to the new component locations
3. Consider whether to retain the ollama-schematics-ui project:
   - Option A: Keep as reference but mark as deprecated
   - Option B: Delete after confirming all valuable components have been migrated

## Storage Analysis

- Current ollama-schematics-ui size: ~350MB (including node_modules)
- Expected space savings: ~300MB after deletion
- Migration should be complete before deletion to ensure no loss of functionality

## Recommendations

Based on our analysis, we recommend:

1. Proceeding with the migration of high and medium priority components
2. Adding the TodoManager as a dedicated page in OSPAiN2-hub
3. Integrating the EcosystemGraph into the Dashboard or as a dedicated visualization page
4. Enhancing the existing KnowledgeGraph page with the KnowledgeExplorer functionality
5. Deleting the ollama-schematics-ui project after successful migration to save storage space
