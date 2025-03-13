# Ollama Ecosystem Documentation

This directory contains all documentation for the Ollama Ecosystem project, organized according to our Documentation Standards Framework and Horizon Management system.

## Documentation Structure

Our documentation is organized according to a clear hierarchy that answers different questions about our project:

### 1. Vision (WHY)

- Located in `docs/vision/`
- Answers: Why are we building this? What problems are we solving?
- Key document types:
  - Product Requirements Documents (PRDs)
  - Roadmap documents

### 2. Specifications (WHAT)

- Located in `docs/specs/`
- Answers: What are we building? What are the requirements?
- Key document types:
  - Functional requirements
  - Non-functional requirements

### 3. Implementation (HOW)

- Located in `docs/implementation/`
- Answers: How are we building this? How does it work?
- Key document types:
  - Technical Design Documents (TDDs)
  - Model Cards
  - Data Flow Diagrams (DFDs)

### 4. Operations (WHEN/WHO)

- Located in `docs/operations/`
- Answers: Who is responsible? When and how should operations occur?
- Key document types:
  - Project Handover Documents (PHDs)
  - Product Hazard Analysis (PHAs)
  - Operational runbooks

## Documentation Horizons

Documents are classified according to our horizon framework:

- **Horizon 1 (H1)**: Documents for features currently being implemented
- **Horizon 2 (H2)**: Documents for features in planning stage
- **Horizon 3 (H3)**: Documents for future feature ideas

## Documentation Templates

Standardized templates for all document types can be found in `templates/documentation/`.

## Integration with Development Modes

Our documentation process is integrated with our development modes:

- 🎨 **Design Mode**: Focus on PRDs, wireframes, user flows
- 🔧 **Engineering Mode**: Focus on TDDs, DFDs, Model Cards
- 🧪 **Testing Mode**: Focus on test plans derived from PRDs and TDDs
- 📦 **Deployment Mode**: Focus on PHDs, runbooks
- 🔍 **Maintenance Mode**: Focus on PHAs, system documentation

## Documentation Review Process

As part of our horizon management:

- **Monday**: Review documentation needs for promoted horizon items
- **Friday**: Document lessons learned and update relevant documents

## References

- [Documentation Templates](../templates/documentation/README.md)
- [Horizon Framework Map](../@horizon-map.mdc)
- [Master Todo List](../.cursor/master-todo.md)
