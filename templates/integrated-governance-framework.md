# Sovereign AI Ecosystem Governance Framework

Highest priority: Maintain system integrity while accelerating development through structured AI collaboration within defined horizons!

## Horizon Management 🌅
- Organize all project elements into three distinct horizons:
  - **Horizon 1 (Now)** :: Features and concepts actively being implemented
  - **Horizon 2 (Next)** :: Concepts cleared for planning but not implementation
  - **Horizon 3 (Future)** :: Ideas captured but deliberately kept at a distance
- Document current horizons in `@horizon-map.mdc`
- Weekly horizon ceremonies:
  - Monday :: Horizon review and promotion evaluation
  - Friday :: Reflection and parking lot processing

## Development Rhythm ⏱️
- Implement 3-week focused development cycles:
  - Week 1 :: Clarify H1 requirements and architecture
  - Week 2-3 :: Implementation with zero new concept introduction
  - End of cycle :: Horizon review and promotion ceremony
- Mark tasks in @master-todo.mdc with horizon designation [H1], [H2], [H3]
- Only work on [H1] tasks during implementation phases

## Prompting Protocol 💬
- Use structured prompting pattern for all project communications:
  ```
  CONTEXT: [Brief description of current project state and active H1 focus]
  OBJECTIVE: [Specific goal for this conversation]
  CONSTRAINTS:
  - Time box: [Expected development timeframe]
  - Complexity budget: [Low/Medium/High]
  - Priority: [Core functionality/Performance/UX/etc.]
  CURRENT HORIZONS:
  H1: [Current implementation focus]
  H2: [Approved next concepts]
  H3: [Captured future ideas]
  SPECIFIC QUESTIONS:
  1. [Question focused on immediate implementation]
  2. [Question about design decisions]
  3. [Question about integration points]
  DECISION CRITERIA:
  - [Key factors for evaluating responses]
  ```

## Development Mode Indicators
Always display current working mode with appropriate icon:
- 🎨 Design Mode :: UI/UX structuring, component architecture design
- 🔧 Engineering Mode :: Core functionality, business logic, data flow
- 🧪 Testing Mode :: Quality assurance, edge cases, resilience testing
- 📦 Deployment Mode :: Release readiness, CI/CD, documentation
- 🔍 Maintenance Mode :: Ongoing health, improvements, community support

## Task Status Tracking
Use consistent status indicators with horizon context:
- 🔴 [H1] Not Started :: H1 task has not been initiated
- 🟡 [H1] In Progress :: Work has begun but not completed
- 🔵 [H1] Blocked :: Cannot proceed due to dependencies/issues
- 🟢 [H1] Completed :: Task is finished
- 📌 [H1] Recurring :: Task that repeats regularly
- 🔜 [H2] Ready :: H2 task ready for promotion consideration
- 🔮 [H3] Captured :: H3 idea documented for future consideration

## Decision Management
- Use predefined decision trees for common scenarios:
  - error :: follow error-handling tree → @tool-call-error-handler.mdc
  - ambiguity :: evaluate options against H1 priorities only
  - uncertainty :: document impact across all horizons before choosing path
- Document decision criteria in `@decision-logs.mdc` with horizon impact assessment
- Escalation threshold: 3 failed resolution attempts → request human intervention

## Version Control Integration
- Commit message format: `[MODE][H1][TASK-ID] Brief description of changes`
- Branch naming: `[horizon]-[task-id]-[brief-descriptor]`
- Pull request template includes horizon context:
  ```
  Horizon: [H1/H2/H3]
  Changes: [Summary of changes]
  Task Reference: [TASK-ID]
  Testing: [Testing performed]
  Documentation: [Documentation updated Y/N]
  ```
- Maintain changelog entries in @master-todo.mdc with horizon designations

## Knowledge Persistence
- Session insights capture:
  - End each work session with `#LEARNINGS` section in @master-todo.mdc
  - Tag key insights with `#INSIGHT:[H1/H2/H3]` for easy retrieval
- Maintain @knowledge-base.mdc with reusable solutions
- Cross-reference format: `[KB:HORIZON:TOPIC:SUBTOPIC]` in task notes

## Concept Parking Lot
- Maintain `@parking-lot.mdc` to capture future ideas without derailing current work
- Structure each entry:
  ```
  [DATE] [CONCEPT NAME]
  Description: Brief description of the concept
  Value Assessment: Potential impact on project objectives
  Dependencies: Related systems or prerequisites
  Horizon Classification: [H2/H3]
  ```
- Review parking lot during horizon transition ceremonies

## Implementation
Add to @master-todo.mdc:
```
TASK-NEW: Implement Horizon Framework Integration
Status: 🔴 [H1] Not Started
Priority: High
Steps:
1. Create @horizon-map.mdc with current H1/H2/H3 classification
2. Update @master-todo.mdc with horizon designations
3. Establish @parking-lot.mdc for capturing future ideas
4. Schedule first horizon review ceremony
5. Update prompting templates to include horizon context
```
