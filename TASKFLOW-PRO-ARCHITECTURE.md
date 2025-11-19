# TaskFlow Pro - Technical Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      TASKFLOW PRO                           │
│                   (Single Page Application)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     App.tsx (Root Component)                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ State Management                                      │  │
│  │ - tasks[]                                             │  │
│  │ - epics[]                                             │  │
│  │ - sprints[]                                           │  │
│  │ - jobSites[]                                          │  │
│  │ - settings{}                                          │  │
│  └───────────────────────────────────────────────────────┘  │
│                              │                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Navigation & UI State                                 │  │
│  │ - currentView                                         │  │
│  │ - sidebarOpen                                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                              │                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Operations                                            │  │
│  │ - createTask()                                        │  │
│  │ - updateTask()                                        │  │
│  │ - deleteTask()                                        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ DashboardView   │  │    ListView     │  │  KanbanView     │
│                 │  │                 │  │                 │
│ • Stats cards   │  │ • Search        │  │ • Status columns│
│ • Progress bars │  │ • Filtering     │  │ • Task cards    │
│ • Priority list │  │ • Task table    │  │ • Quick actions │
│ • Recent tasks  │  │ • Bulk actions  │  │ • Drag & drop*  │
└─────────────────┘  └─────────────────┘  └─────────────────┘

         * Framework ready, not yet implemented
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERACTION                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       React Component                        │
│                  (Button click, input change)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Event Handler                           │
│              (createTask, updateTask, deleteTask)            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      State Update                            │
│                    setTasks([...])                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    useEffect Hook                            │
│              Triggers on state change                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Local Storage Save                          │
│              saveToLocalStorage(data)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Re-render UI                            │
│            All views reflect new state                       │
└─────────────────────────────────────────────────────────────┘
```

## Type System Structure

```
types.ts
├── Core Task Types
│   ├── Task (main entity)
│   ├── TaskStatus (enum)
│   ├── TaskPriority (enum)
│   └── TaskCategory (enum)
│
├── Agile Planning Types
│   ├── Sprint
│   ├── Epic
│   └── RoadmapItem
│
├── Construction Types
│   ├── JobSite
│   ├── Document
│   ├── CostTracking
│   ├── PurchaseOrder
│   ├── Variation
│   ├── PunchListItem
│   └── Approval
│
├── Collaboration Types
│   ├── Comment
│   ├── ChecklistItem
│   └── Attachment
│
├── View Types
│   ├── ViewMode (enum)
│   ├── KanbanColumn
│   └── TimelineEvent
│
├── Custom Fields Types
│   ├── CustomFieldType (enum)
│   └── CustomFieldDefinition
│
├── Automation Types
│   ├── AutomationRule
│   ├── AutomationTrigger
│   ├── AutomationCondition
│   └── AutomationAction
│
├── User Types
│   ├── User
│   └── Team
│
└── Settings Types
    ├── AppSettings
    ├── GeneralSettings
    ├── NotificationSettings
    ├── IntegrationSettings
    ├── DataManagementSettings
    └── DisplaySettings
```

## Component Hierarchy

```
App
├── Sidebar
│   ├── Logo/Title
│   ├── Navigation
│   │   ├── Dashboard Button
│   │   ├── List View Button
│   │   ├── Kanban Button
│   │   ├── Calendar Button*
│   │   ├── Timeline Button*
│   │   └── Roadmap Button*
│   └── Quick Stats
│       ├── Total Tasks
│       ├── In Progress
│       └── Completed
│
└── Main Content
    ├── Header
    │   ├── Menu Toggle
    │   ├── View Title
    │   └── Actions
    │       ├── Export Button
    │       ├── Import Button
    │       └── New Task Button
    │
    └── View Container
        ├── DashboardView
        │   ├── Stats Cards (4)
        │   ├── Progress Card
        │   ├── High Priority Card
        │   ├── Due Dates Card
        │   └── Recent Activity Card
        │
        ├── ListView
        │   ├── Search Bar
        │   ├── Status Filter
        │   └── Task List
        │       └── Task Row (repeating)
        │           ├── Checkbox
        │           ├── Task Details
        │           ├── Badges
        │           └── Delete Button
        │
        └── KanbanView
            └── Columns (4)
                ├── To Do Column
                ├── In Progress Column
                ├── Review Column
                └── Done Column
                    └── Task Cards (repeating)
                        ├── Title
                        ├── Description
                        ├── Priority Badge
                        ├── Category Badge
                        ├── Due Date
                        ├── Tags
                        └── Quick Actions

    * Framework ready, not yet implemented
```

## Utility Functions Organization

```
utils.ts
├── Local Storage
│   ├── saveToLocalStorage()
│   ├── loadFromLocalStorage()
│   └── clearLocalStorage()
│
├── CSV Operations
│   ├── exportTasksToCSV()
│   ├── importTasksFromCSV()
│   ├── escapeCSV()
│   ├── parseCSVLine()
│   └── createTaskFromCSVRow()
│
├── Date Utilities
│   ├── formatDate()
│   ├── isOverdue()
│   └── isDueSoon()
│
├── Sorting & Filtering
│   ├── sortTasks()
│   ├── calculateEpicProgress()
│   └── calculateSprintVelocity()
│
├── Validation
│   ├── isValidEmail()
│   ├── isValidURL()
│   └── isValidPhone()
│
└── Color Utilities
    ├── getStatusColor()
    ├── getPriorityColor()
    └── generateRandomColor()
```

## State Management Pattern

```
Application State (useState)
│
├── tasks: Task[]
│   └── Updated by: createTask(), updateTask(), deleteTask()
│
├── epics: Epic[]
│   └── Framework ready for epic management
│
├── sprints: Sprint[]
│   └── Framework ready for sprint planning
│
├── jobSites: JobSite[]
│   └── Framework ready for construction projects
│
├── currentView: ViewMode
│   └── Controls which view component renders
│
├── sidebarOpen: boolean
│   └── Controls sidebar visibility
│
└── settings: AppSettings
    └── User preferences and configuration

Persistence Layer (useEffect + localStorage)
│
├── Load on mount: loadFromLocalStorage()
├── Save on change: saveToLocalStorage()
└── Storage key: 'taskflow-pro-data'
```

## View Rendering Logic

```
renderView() {
  switch (currentView) {
    case 'dashboard':
      return <DashboardView
        tasks={tasks}
        stats={calculatedStats}
        ...props
      />
      
    case 'list':
      return <ListView
        tasks={tasks}
        onTaskUpdate={updateTask}
        ...props
      />
      
    case 'kanban':
      return <KanbanView
        tasks={tasks}
        onTaskUpdate={updateTask}
        ...props
      />
      
    // Future views ready to implement:
    case 'calendar':
    case 'timeline':
    case 'roadmap':
    case 'settings':
  }
}
```

## Extension Points

### Adding a New View
1. Create component file in `src/components/`
2. Import in `App.tsx`
3. Add navigation button in sidebar
4. Add case to `renderView()` switch
5. Pass necessary props from App state

### Adding a New Feature
1. Define types in `types.ts`
2. Add state in App component
3. Create operation functions
4. Update localStorage logic
5. Build UI components
6. Wire up event handlers

### Adding Custom Fields
1. Types already defined (CustomFieldDefinition)
2. Task.customFields: Record<string, any>
3. Add UI for field management
4. Integrate in task forms
5. Display in views

### Adding Automation
1. Types already defined (AutomationRule)
2. Store rules in App state
3. Create rule evaluation engine
4. Trigger on state changes
5. Execute actions (update fields, notify, etc.)

## Build Process

```
Source Code (src/)
        │
        ▼
    Vite Build
        │
        ▼
  Parcel Bundle
        │
        ▼
  HTML Inline
        │
        ▼
Single HTML File
  (bundle.html)
```

All JavaScript, CSS, and assets are inlined into a single, portable HTML file that works in any modern browser.
