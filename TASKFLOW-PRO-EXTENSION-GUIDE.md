# TaskFlow Pro - Extension Guide

This guide shows you how to add the features you requested that are currently framework-ready but not yet implemented.

## Table of Contents
1. [Adding Calendar View](#adding-calendar-view)
2. [Adding Timeline/Gantt View](#adding-timelinegantt-view)
3. [Adding Roadmap View](#adding-roadmap-view)
4. [Adding Settings Panel](#adding-settings-panel)
5. [Implementing CSV Import](#implementing-csv-import)
6. [Adding Custom Fields UI](#adding-custom-fields-ui)
7. [Implementing Automation Rules](#implementing-automation-rules)
8. [Adding Construction Features](#adding-construction-features)
9. [Implementing Drag & Drop](#implementing-drag--drop)
10. [Adding Comments System](#adding-comments-system)

---

## Adding Calendar View

### Step 1: Create the Component

```typescript
// src/components/CalendarView.tsx

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Task } from '../types'
import { formatDate } from '../utils'

interface CalendarViewProps {
  tasks: Task[]
  onTaskUpdate: (id: string, updates: Partial<Task>) => void
  settings: any
}

export default function CalendarView({ tasks, onTaskUpdate, settings }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Get tasks for a specific date
  const getTasksForDate = (date: Date): Task[] => {
    return tasks.filter(task => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      return taskDate.toDateString() === date.toDateString()
    })
  }
  
  // Generate calendar grid
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    // Add all days in month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }
  
  const days = generateCalendarDays()
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  
  return (
    <Card className="p-6">
      {/* Header with month navigation */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{monthName}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const newDate = new Date(currentDate)
              newDate.setMonth(newDate.getMonth() - 1)
              setCurrentDate(newDate)
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const newDate = new Date(currentDate)
              newDate.setMonth(newDate.getMonth() + 1)
              setCurrentDate(newDate)
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-sm text-slate-600">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }
          
          const tasksForDay = getTasksForDate(date)
          const isToday = date.toDateString() === new Date().toDateString()
          
          return (
            <div
              key={date.toISOString()}
              className={`
                aspect-square p-2 border-2 rounded-lg
                ${isToday ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}
                hover:border-blue-300 transition-colors
              `}
            >
              <div className="font-semibold text-sm">{date.getDate()}</div>
              <div className="mt-1 space-y-1">
                {tasksForDay.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    className="text-xs truncate px-1 py-0.5 bg-blue-100 rounded"
                    title={task.title}
                  >
                    {task.title}
                  </div>
                ))}
                {tasksForDay.length > 3 && (
                  <div className="text-xs text-slate-600">
                    +{tasksForDay.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
```

### Step 2: Add to App.tsx

```typescript
// Import the component
import CalendarView from './components/CalendarView'

// Add to renderView() switch statement
case 'calendar':
  return <CalendarView {...viewProps} />

// Add navigation button in sidebar
<Button
  variant={currentView === 'calendar' ? 'secondary' : 'ghost'}
  className="w-full justify-start"
  onClick={() => setCurrentView('calendar')}
>
  <CalendarIcon className="mr-2 h-4 w-4" />
  Calendar
</Button>
```

---

## Adding Timeline/Gantt View

### Step 1: Create Timeline Component

```typescript
// src/components/TimelineView.tsx

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Task } from '../types'
import { formatDate, getPriorityColor } from '../utils'

interface TimelineViewProps {
  tasks: Task[]
  onTaskUpdate: (id: string, updates: Partial<Task>) => void
}

export default function TimelineView({ tasks }: TimelineViewProps) {
  // Get tasks with dates, sorted by start date
  const tasksWithDates = tasks
    .filter(task => task.startDate || task.dueDate)
    .sort((a, b) => {
      const dateA = a.startDate || a.dueDate || new Date()
      const dateB = b.startDate || b.dueDate || new Date()
      return dateA.getTime() - dateB.getTime()
    })
  
  // Calculate timeline scale
  const allDates = tasksWithDates.flatMap(task => [
    task.startDate,
    task.dueDate
  ].filter(Boolean) as Date[])
  
  const minDate = allDates.length > 0
    ? new Date(Math.min(...allDates.map(d => d.getTime())))
    : new Date()
  const maxDate = allDates.length > 0
    ? new Date(Math.max(...allDates.map(d => d.getTime())))
    : new Date()
  
  const calculatePosition = (date: Date): number => {
    const total = maxDate.getTime() - minDate.getTime()
    const current = date.getTime() - minDate.getTime()
    return (current / total) * 100
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {tasksWithDates.length === 0 ? (
          <p className="text-center text-slate-600 py-8">
            No tasks with dates to display
          </p>
        ) : (
          <div className="space-y-4">
            {/* Timeline header */}
            <div className="flex justify-between text-sm text-slate-600 mb-4">
              <span>{formatDate(minDate)}</span>
              <span>{formatDate(maxDate)}</span>
            </div>
            
            {/* Tasks */}
            {tasksWithDates.map(task => {
              const start = task.startDate || task.dueDate!
              const end = task.dueDate || task.startDate!
              const startPos = calculatePosition(start)
              const width = calculatePosition(end) - startPos || 5
              
              return (
                <div key={task.id} className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium flex-1">
                      {task.title}
                    </span>
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="h-8 bg-slate-100 rounded-lg relative">
                    <div
                      className="absolute h-full bg-blue-500 rounded-lg"
                      style={{
                        left: `${startPos}%`,
                        width: `${Math.max(width, 5)}%`
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

---

## Adding Settings Panel

### Create Settings View

```typescript
// src/components/SettingsView.tsx

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

interface SettingsViewProps {
  settings: any
  onSettingsChange: (settings: any) => void
}

export default function SettingsView({ settings, onSettingsChange }: SettingsViewProps) {
  const updateSetting = (section: string, key: string, value: any) => {
    onSettingsChange({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    })
  }
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Date Format</Label>
              <p className="text-sm text-slate-600">How dates are displayed</p>
            </div>
            <Select
              value={settings.general.dateFormat}
              onValueChange={(value) => updateSetting('general', 'dateFormat', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Construction Features</Label>
              <p className="text-sm text-slate-600">
                Job sites, documents, cost tracking
              </p>
            </div>
            <Switch
              checked={settings.general.enableConstructionFeatures}
              onCheckedChange={(checked) => 
                updateSetting('general', 'enableConstructionFeatures', checked)
              }
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Display</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Compact Mode</Label>
              <p className="text-sm text-slate-600">Reduce spacing in lists</p>
            </div>
            <Switch
              checked={settings.display.compactMode}
              onCheckedChange={(checked) => 
                updateSetting('display', 'compactMode', checked)
              }
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Show Completed Tasks</Label>
              <p className="text-sm text-slate-600">Display done tasks in views</p>
            </div>
            <Switch
              checked={settings.display.showCompletedTasks}
              onCheckedChange={(checked) => 
                updateSetting('display', 'showCompletedTasks', checked)
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## Implementing CSV Import

### Add to App.tsx

```typescript
import { importTasksFromCSV, ImportResult } from './utils'

const [importResult, setImportResult] = useState<ImportResult | null>(null)

const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    
    // Define field mapping
    const mapping = [
      { csvColumn: 'Title', fieldName: 'title', fieldType: 'text', required: true },
      { csvColumn: 'Description', fieldName: 'description', fieldType: 'text', required: false },
      { csvColumn: 'Status', fieldName: 'status', fieldType: 'dropdown', required: false },
      { csvColumn: 'Priority', fieldName: 'priority', fieldType: 'dropdown', required: false },
      { csvColumn: 'Category', fieldName: 'category', fieldType: 'dropdown', required: false },
      { csvColumn: 'Due Date', fieldName: 'dueDate', fieldType: 'date', required: false },
      { csvColumn: 'Tags', fieldName: 'tags', fieldType: 'text', required: false },
    ]
    
    const result = importTasksFromCSV(content, mapping)
    setImportResult(result)
    
    if (result.success) {
      // Show success message
      alert(`Successfully imported ${result.importedCount} tasks`)
    } else {
      // Show errors
      alert(`Import failed: ${result.errors.map(e => e.message).join(', ')}`)
    }
  }
  reader.readAsText(file)
}
```

---

## Adding Drag & Drop to Kanban

### Install library (if needed)

```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

### Update KanbanView

```typescript
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

// In KanbanView component:
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event
  
  if (!over) return
  
  const taskId = active.id as string
  const newStatus = over.id as TaskStatus
  
  onTaskUpdate(taskId, { status: newStatus })
}

return (
  <DndContext
    collisionDetection={closestCenter}
    onDragEnd={handleDragEnd}
  >
    {/* Existing kanban columns */}
  </DndContext>
)
```

---

## Quick Reference: What's Already Built

### Fully Implemented
- ✅ Dashboard with statistics
- ✅ List view with search/filter
- ✅ Kanban board
- ✅ Task CRUD operations
- ✅ Local storage persistence
- ✅ CSV export
- ✅ Type system (complete)
- ✅ Utility functions
- ✅ Responsive layout
- ✅ Semantic HTML
- ✅ Accessibility features

### Framework Ready (Types defined, needs UI)
- ⚙️ Calendar view
- ⚙️ Timeline/Gantt view
- ⚙️ Roadmap view
- ⚙️ Settings panel
- ⚙️ CSV import
- ⚙️ Custom fields
- ⚙️ Automation rules
- ⚙️ Construction features
- ⚙️ Comments system
- ⚙️ File attachments
- ⚙️ User management
- ⚙️ Team collaboration
- ⚙️ Notifications

---

## Best Practices for Extensions

1. **Follow the Pattern**
   - Look at existing views (Dashboard, List, Kanban)
   - Use same prop structure
   - Maintain consistent styling

2. **Type Safety**
   - Import types from `types.ts`
   - Use TypeScript interfaces
   - Leverage existing utility functions

3. **State Management**
   - Keep state in App.tsx
   - Pass down as props
   - Use callbacks for updates

4. **Persistence**
   - State automatically saves to localStorage
   - No additional code needed
   - Just update state normally

5. **Styling**
   - Use Tailwind CSS classes
   - Use shadcn/ui components
   - Match existing color scheme

6. **Accessibility**
   - Add ARIA labels
   - Ensure keyboard navigation
   - Maintain semantic HTML

---

## Need Help?

The codebase is extensively commented. Each file has:
- Purpose explanation at the top
- Section headers for organization
- Inline comments for complex logic
- Type definitions for clarity

All the infrastructure is in place—you just need to build the UI!
