# Agentic Workflow Documentation

This document outlines the agentic workflow approach implemented in the Ollama Ecosystem project, explaining how the system automates operations while maintaining awareness of project horizons and knowledge frameworks.

## Core Components

The agentic workflow consists of several integrated components:

1. **Horizon Framework** - Classifies tasks and resources into implementation horizons
2. **OACL (Optimized AI Command Language)** - Provides structured communication patterns
3. **Research Levels Framework** - Organizes knowledge acquisition and research maturity
4. **CleanupAgent** - Recursively analyzes and identifies cleanup candidates

## Workflow Integration

The workflow integrates these components to create an intelligent system for codebase management:

```
┌─────────────────┐       ┌───────────────────┐       ┌───────────────────┐
│ Horizon         │──────▶│ Agentic Workflow  │◀─────▶│ OACL Command      │
│ Framework       │       │ Orchestration     │       │ System            │
└─────────────────┘       └───────────┬───────┘       └───────────────────┘
                                     │
                                     ▼
┌─────────────────┐       ┌───────────────────┐       ┌───────────────────┐
│ Research Levels │◀─────▶│ Task Execution    │◀─────▶│ Cleanup Agent     │
│ Framework       │       │ Engine            │       │                   │
└─────────────────┘       └───────────────────┘       └───────────────────┘
```

## Horizon-Aware Processing

The workflow enforces horizon discipline by:

1. Prioritizing Horizon 1 (H1) tasks and resources
2. Preserving H1 resources during cleanup operations
3. Tracking progression of items through horizons
4. Documenting horizon transitions in knowledge artifacts

## Cleanup Agent Integration

The Cleanup Agent implements the agentic workflow by:

1. Loading contextual data from framework documents
2. Analyzing the codebase recursively
3. Applying horizon classifications to decision-making
4. Generating actionable reports with confidence levels
5. Providing a safe (dry-run) operation mode

## Task Processing Model

The agentic workflow processes tasks according to this model:

1. **Classification** - Tasks are classified by horizon and research level
2. **Contextualization** - Framework knowledge is applied to understand requirements
3. **Execution** - Tasks are executed with appropriate tool selections
4. **Verification** - Results are verified against expectations
5. **Documentation** - Outcomes and decisions are documented

## OACL Integration

The OACL framework integrates with the agentic workflow by:

1. Providing standardized command patterns
2. Tracking command success metrics
3. Optimizing communication efficiency
4. Enabling cross-agent coordination

## Research Levels Integration

The Research Levels Framework contributes to the workflow by:

1. Classifying knowledge maturity
2. Identifying research requirements for tasks
3. Tracking knowledge acquisition progress
4. Documenting research dependencies

## Implementation Example: Cleanup Agent

The Cleanup Agent demonstrates this workflow integration by:

1. Loading horizon data from `@horizon-map.mdc`
2. Applying OACL patterns from `.cursor/memory/oacl.mdc`
3. Incorporating research level considerations from `.cursor/memory/research-levels-framework.mdc`
4. Generating a structured report with actionable recommendations

## Future Extensions

The agentic workflow can be extended with:

1. **Automated Task Creation** - Generate tasks based on codebase analysis
2. **Pull Request Management** - Automated PR creation and review
3. **Continuous Integration** - Automated testing and deployment
4. **Knowledge Graph Integration** - Enhanced contextual understanding
5. **Multi-Agent Coordination** - Distributed task execution

## Usage Guidelines

To effectively use the agentic workflow:

1. Maintain accurate horizon classifications
2. Keep knowledge artifacts up-to-date
3. Review agent reports before taking destructive actions
4. Update framework documents as project evolves
5. Combine automated and manual workflows appropriately

## Conclusion

The agentic workflow provides a powerful framework for automating development tasks while maintaining awareness of project priorities, knowledge maturity, and system architecture. By integrating horizon classification, optimized communication patterns, and research level tracking, the system can make intelligent decisions about codebase management and task execution. 