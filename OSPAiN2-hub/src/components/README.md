# Component Migration Guide

This directory contains components migrated from ollama-schematics-ui to OSPAiN2-hub as part of our component-based migration strategy.

## Migration Priority

### High Priority
- `todo/TodoManager.tsx` - Todo management system with priority tracking and filtering
- `visualization/EcosystemGraph.tsx` - Force-directed graph visualization
- `knowledge/KnowledgeExplorer.tsx` - Knowledge graph exploration interface

### Medium Priority
- `visualization/MermaidDiagram.tsx` - Mermaid.js diagram renderer
- `utils/JsonViewer.tsx` - Formatted JSON viewer component
- `ui/ToastNotification.tsx` - Notification system

### Low Priority (Optional)
- `agents/OpenManusAgent.tsx` - Interface for OpenManus agent
- `visualization/SchematicViewer.tsx`, `visualization/EcosystemViewer3D.tsx` - Alternative visualizations

## Migration Workflow

1. **Dependency Check**: Add required dependencies to package.json
2. **Component Copy**: Copy component from source to destination
3. **Import Updates**: Update import paths to match OSPAiN2-hub structure
4. **Style Adaptation**: Convert to Tailwind CSS where applicable
5. **Type Fixes**: Resolve any TypeScript issues
6. **Page Integration**: Add component to relevant pages
7. **Testing**: Verify functionality and integration

## Implementation Status

- [ ] TodoManager Component
- [ ] EcosystemGraph Component
- [ ] KnowledgeExplorer Component
- [ ] MermaidDiagram Component
- [ ] JsonViewer Component
- [ ] ToastNotification Component
- [ ] OpenManusAgent Component
- [ ] SchematicViewer Component
- [ ] EcosystemViewer3D Component

## Reference

See `migration-plan.mdc` and `migration-decision.md` in the project root for complete details on the migration strategy and rationale. 