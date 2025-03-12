# Agent Categorization and Continuity Framework

## 1. Knowledge Domain Taxonomy

### Primary Categories
- **Code Generation** - Creating or modifying source code
- **Analysis** - Understanding existing codebases or data
- **Planning** - Project structure, architecture, and roadmaps
- **Testing** - Test creation, validation, and quality assurance
- **Documentation** - Creating docs, comments, and explanations
- **DevOps** - Deployment, CI/CD, and infrastructure
- **UX/UI** - Interface design and user experience
- **Data** - Database operations, data modeling, ETL processes

### Secondary Tags (Cross-cutting concerns)
- **Performance**
- **Security**
- **Accessibility**
- **Internationalization**
- **Compatibility**
- **Maintenance**

## 2. Context Continuity Protocol

### State Encoding Format
```typescript
interface AgentState {
  contextId: string;           // Unique identifier for this context
  parentContextId?: string;    // Optional parent context reference
  timestamp: number;           // When this state was created
  category: PrimaryCategory;   // Primary knowledge domain
  secondaryTags: string[];     // Additional classification tags
  priority: 1 | 2 | 3;         // Priority level (1=highest)
  completionStatus: number;    // 0-100 percent complete
  
  // Context data
  codebaseSnapshot: {          // Lightweight representation of relevant files
    files: Array<{
      path: string;
      checksum: string;        // For detecting changes
      lastModified: number;    // Timestamp
    }>;
  };
  
  conceptualMap: {             // Key concepts and their relationships
    nodes: Array<{
      id: string;
      label: string;
      type: string;
    }>;
    edges: Array<{
      source: string;
      target: string;
      relationship: string;
    }>;
  };
  
  taskBreakdown: {             // Current task decomposition
    completed: string[];
    inProgress: string[];
    pending: string[];
  };
  
  reasoning: {                 // Explicit reasoning trail
    decisions: Array<{
      timestamp: number;
      decision: string;
      rationale: string;
    }>;
    alternatives: Array<{
      option: string;
      pros: string[];
      cons: string[];
    }>;
  };
  
  // Continuation data
  nextSteps: string[];         // Explicit continuation instructions
  blockers: string[];          // Issues preventing progress
  assumptions: string[];       // Explicit assumptions made
}
```

### Handoff Protocol

When transferring context between agents:

1. **Packing Phase**
   - Current agent serializes its state using the AgentState format
   - Compresses knowledge to core insights
   - Marks explicit uncertainty and assumptions

2. **Transfer Phase**
   - State is versioned and stored in a shared repository
   - Receiving agent is notified with contextId
   - Optional synchronous handoff with Q&A

3. **Unpacking Phase**
   - Receiving agent reconstructs mental model from state
   - Validates assumptions against current environment
   - Acknowledges receipt and understanding

## 3. Decision Framework Checklist

For categorizing new topics or tasks, agents should apply this decision tree:

1. **Purpose Identification**
   - What is the primary goal of this task?
   - Who is the end user or beneficiary?
   - What system components will be affected?

2. **Domain Classification**
   - Which primary knowledge domain does this task belong to?
   - What secondary tags apply?
   - Are there cross-cutting concerns to consider?

3. **Dependency Mapping**
   - What existing components does this relate to?
   - What prerequisite tasks must be completed first?
   - What will depend on this task's completion?

4. **Resource Estimation**
   - What computational resources are required?
   - What is the expected completion time?
   - What specialized knowledge is needed?

5. **Continuation Planning**
   - What are the logical next steps after completion?
   - What verification steps are needed?
   - What documentation should be updated?

## 4. Implementation Guidelines

### State Storage Options

1. **File-based Storage**
   ```
   .sovereign/
     └── contexts/
         ├── active/
         │   └── [contextId].json
         └── archive/
             └── [YYYY-MM-DD]/
                 └── [contextId].json
   ```

2. **Database Storage**
   - Use a document database like MongoDB
   - Implement version history with CRDT approach
   - Include full-text search capabilities

### Integration Points

1. **IDE Integration**
   - Context-aware code completion
   - Background reasoning visualization
   - Task continuity indicators in editor UI

2. **CLI Commands**
   ```bash
   sovereign context list
   sovereign context create --category "Code Generation" --tags "Performance,Security"
   sovereign context switch [contextId]
   sovereign context handoff [contextId] --to [agentId]
   ```

3. **Hooks System**
   - Pre-categorization hook for custom rules
   - Post-handoff hook for monitoring continuity
   - Context validation hook for consistency checks

## 5. Evaluation Metrics

Track the effectiveness of the continuity system with these metrics:

1. **Context Retention Rate**
   - Percentage of important details preserved across handoffs
   - Measured via self-assessment and external validation

2. **Task Resumption Efficiency**
   - Time taken to resume a task after interruption
   - Comparison to baseline without context system

3. **Categorization Consistency**
   - Agreement between agents on category assignment
   - Frequency of category reassignment
