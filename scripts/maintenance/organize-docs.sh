#!/bin/bash

# Create timestamp for backups
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create all required directories
mkdir -p docs/{vision/{prd,roadmap},specs/{pha,architecture,integration},implementation/{tdd,guides},operations/{runbooks,procedures}} \
        docs/{research,planning,ui,models,frontend} \
        docs/templates/{prd,tdd,pha,guides} \
        .backups/$TIMESTAMP/docs

# Backup current docs
cp -r docs/* .backups/$TIMESTAMP/docs/ 2>/dev/null

# Move files to appropriate directories
# Vision documents
mv docs/*prd*.md docs/vision/prd/ 2>/dev/null
mv docs/*roadmap*.md docs/vision/roadmap/ 2>/dev/null
mv docs/value_stories.md docs/vision/ 2>/dev/null

# Implementation documents
mv docs/*tdd*.md docs/implementation/tdd/ 2>/dev/null
mv docs/implementation/*.md docs/implementation/guides/ 2>/dev/null
mv docs/frontend-implementation-plan.md docs/implementation/guides/ 2>/dev/null
mv docs/external-service-refactoring.md docs/implementation/guides/ 2>/dev/null

# Frontend documents
mv docs/frontend*.md docs/frontend/ 2>/dev/null
mv docs/ui*.md docs/ui/ 2>/dev/null
mv docs/design_schematics.md docs/ui/ 2>/dev/null

# Specs and architecture
mv docs/*architecture*.md docs/specs/architecture/ 2>/dev/null
mv docs/mcp-integration.md docs/specs/integration/ 2>/dev/null
mv docs/ecosystem_map.md docs/specs/architecture/ 2>/dev/null
mv docs/component_evaluation.md docs/specs/architecture/ 2>/dev/null

# Research and analysis
mv docs/debugging-research.md docs/research/ 2>/dev/null
mv docs/research-levels-framework.md docs/research/ 2>/dev/null
mv docs/token-context-management.md docs/research/ 2>/dev/null

# Operations and guides
mv docs/*guide*.md docs/operations/guides/ 2>/dev/null
mv docs/logging-system.md docs/operations/guides/ 2>/dev/null
mv docs/logging-system.mdc docs/operations/guides/ 2>/dev/null
mv docs/text-cleanup.md docs/operations/guides/ 2>/dev/null
mv docs/scratchpad_guide.md docs/operations/guides/ 2>/dev/null
mv docs/qa_guide.md docs/operations/guides/ 2>/dev/null

# Planning documents
mv docs/master-todo.md docs/planning/ 2>/dev/null
mv docs/voice_integration.md docs/planning/ 2>/dev/null

# Create/update README
cat > docs/README.md << 'EOF'
# Documentation Directory

This directory contains project documentation organized according to the Documentation Standards Framework.

## Directory Structure

### Core Documentation
- vision/
  - prd/: Product Requirements Documents
  - roadmap/: Project roadmaps and future plans
- implementation/
  - tdd/: Technical Design Documents
  - guides/: Implementation guides and procedures
- specs/
  - pha/: Protocol Handshake Analysis
  - architecture/: System architecture documents
  - integration/: Integration specifications
- operations/
  - guides/: Operational guides and procedures
  - runbooks/: System runbooks and troubleshooting

### Supporting Documentation
- research/: Research documents and analysis
- planning/: Project planning and roadmap documents
- ui/: UI/UX design documents
- frontend/: Frontend-specific documentation
- models/: Data models and schemas
- templates/: Document templates

## Standards

Please refer to the Documentation Standards Framework for guidelines on documentation organization and creation.

## File Naming Conventions

1. Use lowercase with hyphens for separation
2. Include category prefixes where appropriate
3. Use .md extension for standard documentation
4. Use .mdc extension for special documentation files

## Version Control

- All documentation is version controlled
- Major changes should be reviewed
- Keep a change log in each major document
EOF

echo "Documentation reorganization complete. Backup created in .backups/$TIMESTAMP/" 