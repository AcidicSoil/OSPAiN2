# Frontend Wireframes

This document provides wireframe mockups for key screens in the new OSPAiN2-hub frontend.

## 1. Main Dashboard

The main dashboard provides an overview of the entire system with quick access to all major features.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ OSPAiN2 Hub                                            🔍 Search  👤 User │
├─────────┬───────────────────────────────────────────────────────────────┤
│         │                                                               │
│         │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐│
│         │  │                 │  │                 │  │                 ││
│ SIDEBAR │  │  Task Overview  │  │  Agent Status   │  │ System Health   ││
│         │  │                 │  │                 │  │                 ││
│ Dashboard  │  Tasks: 47      │  │  Active: 5      │  │  CPU: 45%       ││
│ Tasks   │  │  Completed: 23  │  │  Training: 2    │  │  Memory: 62%    ││
│ Agents  │  │  Overdue: 3     │  │  Idle: 3        │  │  Storage: 38%   ││
│ Models  │  │                 │  │                 │  │                 ││
│ Settings│  └─────────────────┘  └─────────────────┘  └─────────────────┘│
│         │                                                               │
│         │  ┌─────────────────────────────────────────────────────────┐  │
│         │  │                                                         │  │
│         │  │  Recent Activity                                        │  │
│         │  │                                                         │  │
│         │  │  • Task "Update API docs" completed by Agent-1 [10m ago]│  │
│         │  │  • Agent-3 completed training on new dataset [25m ago]  │  │
│         │  │  • New competition started: "Code Optimization" [1h ago]│  │
│         │  │  • System update completed successfully [3h ago]        │  │
│         │  │                                                         │  │
│         │  └─────────────────────────────────────────────────────────┘  │
│         │                                                               │
│         │  ┌─────────────────────────┐  ┌─────────────────────────────┐ │
│         │  │                         │  │                             │ │
│         │  │  T2P Command Input      │  │  Knowledge Graph Overview   │ │
│         │  │                         │  │                             │ │
│         │  │  > _                    │  │  [Graph Visualization]      │ │
│         │  │                         │  │                             │ │
│         │  │  Suggestions:           │  │  Nodes: 1,245               │ │
│         │  │  - List overdue tasks   │  │  Connections: 5,673         │ │
│         │  │  - Start new competition│  │  Last updated: 15m ago      │ │
│         │  │                         │  │                             │ │
│         │  └─────────────────────────┘  └─────────────────────────────┘ │
│         │                                                               │
└─────────┴───────────────────────────────────────────────────────────────┘
```

## 2. T2P Command Interface

A dedicated interface for interacting with the T2P Engine with command input, suggestions, and results.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ OSPAiN2 Hub > T2P Interface                            🔍 Search  👤 User │
├─────────┬───────────────────────────────────────────────────────────────┤
│         │                                                               │
│         │  ┌─────────────────────────────────────────────────────────┐  │
│         │  │                                                         │  │
│ SIDEBAR │  │  Command Input                                          │  │
│         │  │                                                         │  │
│ Dashboard  │  > create a task to update documentation for the T2P API │  │
│ Tasks   │  │                                                         │  │
│ Agents  │  │  [Submit]                [Clear]                        │  │
│ Models  │  │                                                         │  │
│ Settings│  └─────────────────────────────────────────────────────────┘  │
│         │                                                               │
│         │  ┌─────────────────────────────────────────────────────────┐  │
│         │  │                                                         │  │
│         │  │  Intent Detection                                       │  │
│         │  │                                                         │  │
│         │  │  Detected Intent: CREATE_TASK (95% confidence)          │  │
│         │  │                                                         │  │
│         │  │  Entities:                                              │  │
│         │  │  - Task: update documentation                           │  │
│         │  │  - Subject: T2P API                                     │  │
│         │  │  - Priority: medium (inferred)                          │  │
│         │  │                                                         │  │
│         │  └─────────────────────────────────────────────────────────┘  │
│         │                                                               │
│         │  ┌─────────────────────────────────────────────────────────┐  │
│         │  │                                                         │  │
│         │  │  Suggested Command                                      │  │
│         │  │                                                         │  │
│         │  │  t2p todo add --title "Update T2P API documentation"    │  │
│         │  │  --description "Create comprehensive documentation      │  │
│         │  │  for the T2P API endpoints and usage" --priority 2      │  │
│         │  │  --category "Documentation" --tags "api,docs,t2p"       │  │
│         │  │                                                         │  │
│         │  │  [Execute Command]   [Modify]   [Reject]                │  │
│         │  │                                                         │  │
│         │  └─────────────────────────────────────────────────────────┘  │
│         │                                                               │
│         │  ┌─────────────────────────────────────────────────────────┐  │
│         │  │                                                         │  │
│         │  │  Command History                                        │  │
│         │  │                                                         │  │
│         │  │  • list all tasks with priority 1 [2m ago]              │  │
│         │  │    ↳ Executed: t2p todo list --priority 1               │  │
│         │  │                                                         │  │
│         │  │  • show agent competition results [15m ago]             │  │
│         │  │    ↳ Executed: t2p agents competitions --last           │  │
│         │  │                                                         │  │
│         │  │  • create note about performance issues [1h ago]        │  │
│         │  │    ↳ Executed: t2p note new --title "Performance..."    │  │
│         │  │                                                         │  │
│         │  └─────────────────────────────────────────────────────────┘  │
│         │                                                               │
└─────────┴───────────────────────────────────────────────────────────────┘
```

## 3. Agent Competition Dashboard

Interface for monitoring and managing agent competitions.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ OSPAiN2 Hub > Agent Competition                       🔍 Search  👤 User │
├─────────┬───────────────────────────────────────────────────────────────┤
│         │                                                               │
│         │  ┌─────────────────────────────────────────────────────────┐  │
│         │  │                                                         │  │
│ SIDEBAR │  │  Active Competitions                   [+ New Competition] │  │
│         │  │                                                         │  │
│ Dashboard  │  • Code Optimization Challenge [Running - 2h remaining]  │  │
│ Tasks   │  │    5 agents competing                                   │  │
│ Agents  │  │                                                         │  │
│ Models  │  │  • Documentation Accuracy [Completed]                   │  │
│ Settings│  │    3 agents competed                                    │  │
│         │  │                                                         │  │
│         │  │  • Bug Detection Battle [Scheduled - starts in 1d 5h]   │  │
│         │  │    7 agents registered                                  │  │
│         │  │                                                         │  │
│         │  └─────────────────────────────────────────────────────────┘  │
│         │                                                               │
│         │  ┌─────────────────────────────────────────────────────────┐  │
│         │  │                                                         │  │
│         │  │  Leaderboard: Code Optimization Challenge               │  │
│         │  │                                                         │  │
│         │  │  1. Agent-5 [Score: 87/100] ███████████████████░░       │  │
│         │  │  2. Agent-2 [Score: 82/100] ████████████████░░░░░       │  │
│         │  │  3. Agent-1 [Score: 74/100] █████████████░░░░░░░░       │  │
│         │  │  4. Agent-3 [Score: 65/100] ████████████░░░░░░░░░       │  │
│         │  │  5. Agent-4 [Score: 58/100] ██████████░░░░░░░░░░░       │  │
│         │  │                                                         │  │
│         │  │  [View Detailed Results]                                │  │
│         │  │                                                         │  │
│         │  └─────────────────────────────────────────────────────────┘  │
│         │                                                               │
│         │  ┌─────────────────────────────┐  ┌─────────────────────────┐ │
│         │  │                             │  │                         │ │
│         │  │  Competition Metrics        │  │  Agent Performance      │ │
│         │  │                             │  │                         │ │
│         │  │  [Chart: Performance        │  │  Agent-5                │ │
│         │  │   metrics over time]        │  │                         │ │
│         │  │                             │  │  - CPU Usage: 72%       │ │
│         │  │  Avg. Completion Time: 45s  │  │  - Memory: 1.2GB        │ │
│         │  │  Avg. Accuracy: 78%         │  │  - Current Task: #127   │ │
│         │  │  Avg. Resource Usage: 68%   │  │  - Completed: 17 tasks  │ │
│         │  │                             │  │                         │ │
│         │  └─────────────────────────────┘  └─────────────────────────┘ │
│         │                                                               │
└─────────┴───────────────────────────────────────────────────────────────┘
```

## 4. Task Management Board

A Kanban-style board for managing tasks with drag-and-drop functionality.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ OSPAiN2 Hub > Task Board                               🔍 Search  👤 User │
├─────────┬───────────────────────────────────────────────────────────────┤
│         │                                                               │
│         │  ┌─────────────────────────────────────────────────────────┐  │
│         │  │                                                         │  │
│ SIDEBAR │  │  Task Board                                [+ New Task] │  │
│         │  │                                                         │  │
│ Dashboard  │  [Filter ▼]  [Sort ▼]  [Group By ▼]  [View Options ▼]   │  │
│ Tasks   │  │                                                         │  │
│ Agents  │  └─────────────────────────────────────────────────────────┘  │
│ Models  │                                                               │
│ Settings│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│         │  │ Not Started (8)│  │ In Progress (5)│  │ Completed (12) │  │
│         │  ├────────────────┤  ├────────────────┤  ├────────────────┤  │
│         │  │ ┌──────────┐   │  │ ┌──────────┐   │  │ ┌──────────┐   │  │
│         │  │ │Update T2P│   │  │ │Implement │   │  │ │Fix login │   │  │
│         │  │ │API docs  │   │  │ │agent comp│   │  │ │bug       │   │  │
│         │  │ │P2 • Docs │   │  │ │P1 • Eng  │   │  │ │P1 • Bug  │   │  │
│         │  │ └──────────┘   │  │ └──────────┘   │  │ └──────────┘   │  │
│         │  │                │  │                │  │                │  │
│         │  │ ┌──────────┐   │  │ ┌──────────┐   │  │ ┌──────────┐   │  │
│         │  │ │Create    │   │  │ │Optimize  │   │  │ │Add unit  │   │  │
│         │  │ │dashboard │   │  │ │knowledge │   │  │ │tests     │   │  │
│         │  │ │P3 • UI   │   │  │ │P2 • Perf │   │  │ │P2 • Test │   │  │
│         │  │ └──────────┘   │  │ └──────────┘   │  │ └──────────┘   │  │
│         │  │                │  │                │  │                │  │
│         │  │ ┌──────────┐   │  │ ┌──────────┐   │  │ ┌──────────┐   │  │
│         │  │ │Design    │   │  │ │Add feed- │   │  │ │Update    │   │  │
│         │  │ │icons     │   │  │ │back coll │   │  │ │agent rank│   │  │
│         │  │ │P4 • Des  │   │  │ │P2 • Eng  │   │  │ │P3 • Feat │   │  │
│         │  │ └──────────┘   │  │ └──────────┘   │  │ └──────────┘   │  │
│         │  │                │  │                │  │                │  │
│         │  │      ...       │  │      ...       │  │      ...       │  │
│         │  │                │  │                │  │                │  │
│         │  └────────────────┘  └────────────────┘  └────────────────┘  │
│         │                                                               │
└─────────┴───────────────────────────────────────────────────────────────┘
```

## 5. Knowledge Graph Explorer

Interface for exploring and visualizing the knowledge graph.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ OSPAiN2 Hub > Knowledge Explorer                      🔍 Search  👤 User │
├─────────┬───────────────────────────────────────────────────────────────┤
│         │                                                               │
│         │  ┌─────────────────────────────────────────────────────────┐  │
│         │  │                                                         │  │
│ SIDEBAR │  │  Knowledge Graph Visualization                          │  │
│         │  │                                                         │  │
│ Dashboard  │  ┌─────────────┐               ┌──────────────┐         │  │
│ Tasks   │  │  │   T2P API   │───────────────│Documentation │         │  │
│ Agents  │  │  └─────────────┘               └──────────────┘         │  │
│ Models  │  │         │                              │                │  │
│ Settings│  │         │                              │                │  │
│         │  │         ▼                              ▼                │  │
│         │  │  ┌─────────────┐               ┌──────────────┐         │  │
│         │  │  │ REST Routes │───────────────│Style Guide   │         │  │
│         │  │  └─────────────┘               └──────────────┘         │  │
│         │  │         │                              ▲                │  │
│         │  │         │                              │                │  │
│         │  │         ▼                              │                │  │
│         │  │  ┌─────────────┐               ┌──────────────┐         │  │
│         │  │  │Authentication│──────────────│   UI/UX      │         │  │
│         │  │  └─────────────┘               └──────────────┘         │  │
│         │  │                                                         │  │
│         │  │  [+ Zoom]  [- Zoom]  [Filter]  [Export]                │  │
│         │  │                                                         │  │
│         │  └─────────────────────────────────────────────────────────┘  │
│         │                                                               │
│         │  ┌─────────────────────────────┐  ┌─────────────────────────┐ │
│         │  │                             │  │                         │ │
│         │  │  Selected Node: T2P API     │  │  Related Context        │ │
│         │  │                             │  │                         │ │
│         │  │  Type: API                  │  │  • Task: Update T2P API │ │
│         │  │  Created: Mar 10, 2024      │  │    documentation        │ │
│         │  │  Last Modified: Mar 13, 2024│  │                         │ │
│         │  │                             │  │  • Agent-5 is currently │ │
│         │  │  Connections: 5             │  │    working with this API│ │
│         │  │  Tags: api, core, t2p       │  │                         │ │
│         │  │                             │  │  • Related models: 3    │ │
│         │  │  [Edit]  [Delete]  [View]   │  │    [View Details]       │ │
│         │  │                             │  │                         │ │
│         │  └─────────────────────────────┘  └─────────────────────────┘ │
│         │                                                               │
└─────────┴───────────────────────────────────────────────────────────────┘
```

These wireframes represent the initial vision for the new frontend interface. They will be refined and expanded during the design phase of the project. 