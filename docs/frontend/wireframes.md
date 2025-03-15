# OSPAiN2-Hub Frontend Wireframes

## Overview

This document contains wireframes for the main screens of the OSPAiN2-Hub frontend. These wireframes serve as a visual guide for the implementation of the UI components and layout.

## Dashboard

```
┌───────────────────────────────────────────────────────────────────┐
│ Header [Logo] [Search]                   [Notifications] [Profile] │
├───────────┬───────────────────────────────────────────────────────┤
│           │                                                       │
│           │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│           │  │ System      │  │ Agent       │  │ Recent      │   │
│           │  │ Status      │  │ Status      │  │ Activities  │   │
│           │  │             │  │             │  │             │   │
│  Sidebar  │  └─────────────┘  └─────────────┘  └─────────────┘   │
│           │                                                       │
│  [Home]   │  ┌───────────────────────┐  ┌───────────────────────┐│
│  [T2P]    │  │                       │  │                       ││
│  [Agents] │  │  Performance Metrics  │  │  Quick Actions        ││
│  [Tasks]  │  │                       │  │                       ││
│  [Settings]│  └───────────────────────┘  └───────────────────────┘│
│           │                                                       │
│           │  ┌─────────────────────────────────────────────────┐ │
│           │  │                                                 │ │
│           │  │  Notification Center                           │ │
│           │  │                                                 │ │
│           │  └─────────────────────────────────────────────────┘ │
│           │                                                       │
└───────────┴───────────────────────────────────────────────────────┘
```

### Dashboard Components

1. **Header**
   - Logo
   - Search bar
   - Notification bell
   - User profile dropdown

2. **Sidebar**
   - Navigation links
   - Current section indicator
   - Collapsible

3. **System Status Card**
   - CPU/Memory usage
   - Active models
   - Service health indicators

4. **Agent Status Card**
   - Active agents
   - Recent competitions
   - Agent health

5. **Recent Activities**
   - Timeline of recent actions
   - Filterable by type
   - Time indicators

6. **Performance Metrics**
   - Charts showing system performance
   - Agent performance comparisons
   - Resource utilization

7. **Quick Actions**
   - Buttons for common tasks
   - Shortcuts to frequently used features
   - Create new agent/task buttons

8. **Notification Center**
   - Recent notifications
   - Categorized by type
   - Read/unread status
   - Action buttons

## T2P Engine Interface

```
┌───────────────────────────────────────────────────────────────────┐
│ Header [Logo] [Search]                   [Notifications] [Profile] │
├───────────┬───────────────────────────────────────────────────────┤
│           │                                                       │
│           │  ┌─────────────────────────────────────────────────┐ │
│           │  │ Command Input                           [Execute]│ │
│           │  └─────────────────────────────────────────────────┘ │
│           │                                                       │
│  Sidebar  │  ┌─────────────────────────────────────────────────┐ │
│           │  │                                                 │ │
│  [Home]   │  │ Suggestion Panel                               │ │
│  [T2P]    │  │ - Suggestion 1                                 │ │
│  [Agents] │  │ - Suggestion 2                                 │ │
│  [Tasks]  │  │ - Suggestion 3                                 │ │
│  [Settings]│  └─────────────────────────────────────────────────┘ │
│           │                                                       │
│           │  ┌───────────────────┐  ┌───────────────────────────┐│
│           │  │                   │  │                           ││
│           │  │  Execution Status │  │  Command History          ││
│           │  │                   │  │                           ││
│           │  └───────────────────┘  └───────────────────────────┘│
│           │                                                       │
│           │  ┌─────────────────────────────────────────────────┐ │
│           │  │                                                 │ │
│           │  │  Output Console                                │ │
│           │  │                                                 │ │
│           │  └─────────────────────────────────────────────────┘ │
│           │                                                       │
└───────────┴───────────────────────────────────────────────────────┘
```

### T2P Engine Components

1. **Command Input**
   - Text input field
   - Autocomplete
   - Execute button
   - Keyboard shortcuts

2. **Suggestion Panel**
   - Context-aware command suggestions
   - Clickable suggestions
   - Explanation tooltips
   - Categories

3. **Execution Status**
   - Current command status
   - Progress indicator
   - Execution time
   - Status icons (success/error)

4. **Command History**
   - List of recent commands
   - Reusable commands (click to use)
   - Success/failure indicators
   - Timestamp

5. **Output Console**
   - Command output
   - Scrollable
   - Copy button
   - Syntax highlighting
   - Collapsible sections

## Agent Competition Interface

```
┌───────────────────────────────────────────────────────────────────┐
│ Header [Logo] [Search]                   [Notifications] [Profile] │
├───────────┬───────────────────────────────────────────────────────┤
│           │                                                       │
│           │  ┌─────────────────────────┐ ┌─────────────────────┐ │
│           │  │ Agent List              │ │ Create Agent      + │ │
│           │  │ - Agent 1               │ └─────────────────────┘ │
│  Sidebar  │  │ - Agent 2               │                         │
│           │  │ - Agent 3               │ ┌─────────────────────┐ │
│  [Home]   │  └─────────────────────────┘ │ Competition Setup   │ │
│  [T2P]    │                              │ [Configure]         │ │
│  [Agents] │  ┌─────────────────────────────────────────────────┐ │
│  [Tasks]  │  │                                                 │ │
│  [Settings]│  │ Competition Visualization                      │ │
│           │  │                                                 │ │
│           │  │                                                 │ │
│           │  └─────────────────────────────────────────────────┘ │
│           │                                                       │
│           │  ┌─────────────────────────┐ ┌─────────────────────┐ │
│           │  │                         │ │                     │ │
│           │  │ Performance Metrics     │ │ Results Analysis    │ │
│           │  │                         │ │                     │ │
│           │  └─────────────────────────┘ └─────────────────────┘ │
│           │                                                       │
└───────────┴───────────────────────────────────────────────────────┘
```

### Agent Competition Components

1. **Agent List**
   - List of available agents
   - Selection checkboxes
   - Agent status indicators
   - Filter/search options

2. **Create Agent Button**
   - Opens agent creation modal
   - Quick template selection
   - Clone existing agent option

3. **Competition Setup**
   - Task selection
   - Parameters configuration
   - Agent selection
   - Start competition button

4. **Competition Visualization**
   - Real-time progress visualization
   - Agent comparison graphs
   - Interactive elements
   - Different visualization modes

5. **Performance Metrics**
   - Detailed performance data
   - Comparative analysis
   - Historical performance
   - Exportable reports

6. **Results Analysis**
   - Detailed results breakdown
   - Success/failure analysis
   - Step-by-step evaluation
   - Actionable insights

## Task Management Interface

```
┌───────────────────────────────────────────────────────────────────┐
│ Header [Logo] [Search]                   [Notifications] [Profile] │
├───────────┬───────────────────────────────────────────────────────┤
│           │  ┌───────────────────────────────────────────────┐   │
│           │  │ Task Filters             │ Create Task      + │   │
│           │  └───────────────────────────────────────────────┘   │
│           │                                                       │
│  Sidebar  │  ┌───────────────────────────────────────────────────┐│
│           │  │ Task List                                        ││
│  [Home]   │  │ ┌───────┐ ┌────────────┐ ┌────────────┐         ││
│  [T2P]    │  │ │ ID    │ │ Name       │ │ Status     │ ...     ││
│  [Agents] │  │ ├───────┼─┼────────────┼─┼────────────┼─────────┤│
│  [Tasks]  │  │ │ Task 1│ │ Task desc  │ │ Complete   │ ...     ││
│  [Settings]│  │ │ Task 2│ │ Task desc  │ │ In Progress│ ...     ││
│           │  │ │ Task 3│ │ Task desc  │ │ Queued     │ ...     ││
│           │  └───────────────────────────────────────────────────┘│
│           │                                                       │
│           │  ┌───────────────────────────────────────────────────┐│
│           │  │                                                   ││
│           │  │ Task Details Panel                               ││
│           │  │                                                   ││
│           │  │ - Description                                     ││
│           │  │ - Parameters                                      ││
│           │  │ - Status                                          ││
│           │  │ - Timeline                                        ││
│           │  │ - Actions                                         ││
│           │  │                                                   ││
│           │  └───────────────────────────────────────────────────┘│
└───────────┴───────────────────────────────────────────────────────┘
```

### Task Management Components

1. **Task Filters**
   - Status filter
   - Type filter
   - Date range picker
   - Search field
   - Advanced filters toggle

2. **Create Task Button**
   - Opens task creation modal
   - Template selection
   - Step-by-step wizard

3. **Task List**
   - Sortable columns
   - Status indicators
   - Quick action buttons
   - Pagination
   - Bulk actions

4. **Task Details Panel**
   - Comprehensive task information
   - Edit capabilities
   - Status updates
   - Related agents/competitions
   - Timeline of changes
   - Comments/notes section

## Settings Interface

```
┌───────────────────────────────────────────────────────────────────┐
│ Header [Logo] [Search]                   [Notifications] [Profile] │
├───────────┬───────────────────────────────────────────────────────┤
│           │                                                       │
│           │  ┌───────────────────┐                               │
│           │  │ Settings Menu     │                               │
│           │  │ - General         │                               │
│  Sidebar  │  │ - Appearance      │                               │
│           │  │ - T2P Engine      │                               │
│  [Home]   │  │ - Agents          │                               │
│  [T2P]    │  │ - Security        │                               │
│  [Agents] │  │ - Advanced        │                               │
│  [Tasks]  │  └───────────────────┘                               │
│  [Settings]│                                                       │
│           │  ┌───────────────────────────────────────────────────┐│
│           │  │                                                   ││
│           │  │ Settings Content                                 ││
│           │  │                                                   ││
│           │  │ [Various settings fields based on selected menu] ││
│           │  │                                                   ││
│           │  │                                                   ││
│           │  │                                                   ││
│           │  │ [Save] [Cancel]                                   ││
│           │  │                                                   ││
│           │  └───────────────────────────────────────────────────┘│
│           │                                                       │
└───────────┴───────────────────────────────────────────────────────┘
```

### Settings Components

1. **Settings Menu**
   - Categorized settings
   - Active item highlight
   - Collapsible sections
   - Search functionality

2. **Settings Content**
   - Form fields relevant to selected setting
   - Validation
   - Help text/tooltips
   - Default/reset buttons
   - Save/cancel actions

## Common Components

### Modal Dialogs

```
┌───────────────────────────────────────────────────────┐
│ Modal Title                                     [X]   │
├───────────────────────────────────────────────────────┤
│                                                       │
│ Modal Content                                         │
│                                                       │
│ [Form Fields / Content]                               │
│                                                       │
│                                                       │
├───────────────────────────────────────────────────────┤
│ [Cancel]                                    [Confirm] │
└───────────────────────────────────────────────────────┘
```

### Toast Notifications

```
┌───────────────────────────────────┐
│ [Icon] Notification Message   [X] │
└───────────────────────────────────┘
```

### Dropdown Menu

```
┌───────────────────┐
│ Selected Option ▼ │
├───────────────────┤
│ Option 1          │
│ Option 2          │
│ Option 3          │
└───────────────────┘
```

### Tabs

```
┌────────┬─────────┬─────────┬─────────┐
│ Tab 1  │  Tab 2  │  Tab 3  │  Tab 4  │
├────────┴─────────┴─────────┴─────────┤
│                                      │
│ Tab Content                          │
│                                      │
└──────────────────────────────────────┘
```

### Cards

```
┌──────────────────────────────────┐
│ Card Title           [Actions ▼] │
├──────────────────────────────────┤
│                                  │
│ Card Content                     │
│                                  │
├──────────────────────────────────┤
│ Card Footer         [Button]     │
└──────────────────────────────────┘
```

## Mobile Responsive Design

For smaller screens, the interface will adapt as follows:

1. Sidebar collapses to a hamburger menu
2. Cards stack vertically
3. Tables become scrollable or transform to list views
4. Modal dialogs take full width
5. Input fields and buttons increase in size for touch targets

```
┌───────────────────────────────────────┐
│ [≡] [Logo]              [🔔] [Profile]│
├───────────────────────────────────────┤
│                                       │
│ ┌───────────────────────────────────┐ │
│ │ Card 1                           │ │
│ └───────────────────────────────────┘ │
│                                       │
│ ┌───────────────────────────────────┐ │
│ │ Card 2                           │ │
│ └───────────────────────────────────┘ │
│                                       │
│ ┌───────────────────────────────────┐ │
│ │ Card 3                           │ │
│ └───────────────────────────────────┘ │
│                                       │
└───────────────────────────────────────┘
```

## Color Scheme and Theming

The interface will support both light and dark themes:

### Light Theme
- Background: #f8f9fa
- Card Background: #ffffff
- Primary: #3498db
- Secondary: #2ecc71
- Accent: #9b59b6
- Text: #333333
- Border: #e0e0e0

### Dark Theme
- Background: #1a1a1a
- Card Background: #2a2a2a
- Primary: #3498db
- Secondary: #2ecc71
- Accent: #9b59b6
- Text: #f0f0f0
- Border: #444444

## Interaction Patterns

1. **Drag and Drop**
   - Task reordering
   - Agent configuration
   - Dashboard widget arrangement

2. **Hover States**
   - Element highlighting
   - Tooltip information
   - Action buttons appear

3. **Click/Tap Actions**
   - Selection
   - Expansion/collapse
   - Navigation

4. **Long Press (Mobile)**
   - Context menus
   - Additional options
   - Selection mode 