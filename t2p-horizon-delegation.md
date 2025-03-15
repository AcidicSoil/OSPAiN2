# Horizon Delegation Protocol for t2p

## Overview

This document outlines the implementation plan for enhancing the t2p todo system with proper horizon delegation protocols. This ensures that tasks in different horizons are managed by the appropriate authority levels, preventing inappropriate sign-off on future tasks without proper strategic oversight.

## Implementation Requirements

1. **Authority Level System**
   - Add authority levels (implementation, project-lead, strategic) to user configuration
   - Implement authority verification for horizon-related operations
   - Create delegation tracking for task ownership

2. **Command Enhancements**
   - Add `--delegate <team>` option to todo add/update commands
   - Implement `--accept-delegation` flag for taking ownership
   - Add `--authority <level>` parameter for authorization
   - Create `--promote-horizon` and `--demote-horizon` operations

3. **Storage Enhancements**
   - Add delegation metadata to todo items
   - Store delegation history for audit purposes
   - Track horizon transitions with timestamps

4. **Validation Rules**
   - H3 tasks require strategic team delegation
   - H2 tasks require project lead approval
   - Horizon promotions must follow proper authority chain
   - Prevent unauthorized horizon transitions

## API Changes

```typescript
// Add to TodoItem interface
interface TodoItem {
  // Existing fields...
  delegatedBy?: string;
  delegatedTo?: string;
  delegationStatus: 'pending' | 'accepted' | 'rejected';
  authorityLevel: 'implementation' | 'project-lead' | 'strategic';
  horizonHistory: Array<{
    from: 'H1' | 'H2' | 'H3';
    to: 'H1' | 'H2' | 'H3';
    timestamp: Date;
    approvedBy: string;
  }>;
}

// New methods for TodoService
class TodoService {
  // Existing methods...
  
  async delegateTask(id: string, team: string): Promise<TodoItem>;
  async acceptDelegation(id: string, authority: string): Promise<TodoItem>;
  async promoteHorizon(id: string, authority: string): Promise<TodoItem>;
  async demoteHorizon(id: string, authority: string): Promise<TodoItem>;
  async verifyAuthority(authority: string, requiredLevel: string): Promise<boolean>;
}
```

## CLI Command Updates

```typescript
todo
  .command('add')
  .description('Add a new todo item')
  // Existing options...
  .option('-d, --delegate <team>', 'Delegate to team (implementation, project-lead, strategic)')
  .option('-a, --authority <level>', 'Authority level for operation');

todo
  .command('update')
  .description('Update a todo item')
  // Existing options...
  .option('--accept-delegation', 'Accept delegation of this task')
  .option('--reject-delegation', 'Reject delegation of this task')
  .option('--promote-horizon', 'Promote to next horizon level')
  .option('--demote-horizon', 'Demote to previous horizon level')
  .option('-a, --authority <level>', 'Authority level for operation');
```

## User Experience Workflows

### Delegating H3 Tasks

```bash
# Strategic team creates a future task and delegates it
t2p todo add --title "Future ML Integration" --description "..." --horizon H3 --authority strategic

# Project lead proposes a future task for strategic approval
t2p todo add --title "Cloud Migration" --description "..." --horizon H3 --delegate strategic
```

### Promotion Workflow

```bash
# Strategic team promotes task from H3 to H2
t2p todo update 123 --promote-horizon --authority strategic

# Project lead promotes H2 task to H1 for implementation
t2p todo update 123 --promote-horizon --authority project-lead
```

## Integration with Master Player

The master-player.mdc file now includes templates and protocols for horizon delegation, which should be synchronized with this implementation.

## Security Considerations

1. Authority levels should be verified with a secure mechanism
2. Audit logs must be maintained for all horizon transitions
3. Email or notification system for delegation activities
4. Prevention of privilege escalation through command options

## Implementation Timeline

1. Add metadata fields to TodoItem interface
2. Implement authority verification system
3. Update CLI commands with new options
4. Add delegation workflow logic
5. Create tests for new functionality
6. Update documentation with examples

## Conclusion

This implementation will ensure proper governance of the horizon framework, preventing inappropriate sign-off on future (H3) tasks without strategic oversight, while maintaining clear delegation chains and responsibility assignment. 