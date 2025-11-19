import { useState, useEffect } from 'react'
import { Button } from './components/ui/button'
import NewTaskModal from './components/NewTaskModal'
import DashboardView from './components/DashboardView'
import ListView from './components/ListView'
import KanbanView from './components/KanbanView'
import CalendarView from './components/CalendarView'
import TimelineView from './components/TimelineView'
import type { Task, ViewMode, NewTaskFormData } from './types'
import { saveToLocalStorage, loadFromLocalStorage } from './utils'
import {
  LayoutDashboard,
  List,
  LayoutGrid,
  Calendar,
  Clock,
  Plus,
  Menu,
  X,
  Download,
} from 'lucide-react'
import { exportTasksToCSV } from './utils'

function App() {
  // State
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = loadFromLocalStorage()
    if (savedData && savedData.tasks) {
      setTasks(savedData.tasks)
    }
  }, [])

  // Save to localStorage whenever tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      saveToLocalStorage({ tasks })
    }
  }, [tasks])

  // Task Operations
  const createTask = (formData: NewTaskFormData) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: formData.title,
      description: formData.description,
      status: 'todo',
      priority: formData.priority,
      category: formData.category,
      tags: formData.tags,
      dueDate: formData.dueDate,
      startDate: formData.startDate,
      assignedTo: formData.assignedTo,
      estimatedHours: formData.estimatedHours,
      completionPercentage: formData.completionPercentage || 0,
      blockedBy: formData.blockedBy || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      comments: [],
      attachments: [],
      checklist: [],
      customFields: {},
    }

    setTasks([...tasks, newTask])
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      )
    )
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const handleExport = () => {
    const csv = exportTasksToCSV(tasks)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `taskflow-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView tasks={tasks} />
      case 'list':
        return (
          <ListView
            tasks={tasks}
            onTaskUpdate={updateTask}
            onTaskDelete={deleteTask}
          />
        )
      case 'kanban':
        return <KanbanView tasks={tasks} onTaskUpdate={updateTask} />
      case 'calendar':
        return <CalendarView tasks={tasks} onTaskUpdate={updateTask} />
      case 'timeline':
        return <TimelineView tasks={tasks} onTaskUpdate={updateTask} />
      default:
        return <DashboardView tasks={tasks} />
    }
  }

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside
        className={`
          ${sidebarOpen ? 'w-64' : 'w-0'}
          transition-all duration-300 bg-white border-r border-slate-200
          flex flex-col overflow-hidden
        `}
      >
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-blue-600">TaskFlow Pro</h1>
          <p className="text-sm text-slate-600 mt-1">Project Management</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Button
            variant={currentView === 'dashboard' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentView('dashboard')}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>

          <Button
            variant={currentView === 'list' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentView('list')}
          >
            <List className="mr-2 h-4 w-4" />
            List View
          </Button>

          <Button
            variant={currentView === 'kanban' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentView('kanban')}
          >
            <LayoutGrid className="mr-2 h-4 w-4" />
            Kanban Board
          </Button>

          <Button
            variant={currentView === 'calendar' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentView('calendar')}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Calendar
          </Button>

          <Button
            variant={currentView === 'timeline' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentView('timeline')}
          >
            <Clock className="mr-2 h-4 w-4" />
            Timeline
          </Button>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Total Tasks:</span>
              <span className="font-semibold">{tasks.length}</span>
            </div>
            <div className="flex justify-between">
              <span>In Progress:</span>
              <span className="font-semibold">
                {tasks.filter((t) => t.status === 'in-progress').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Completed:</span>
              <span className="font-semibold">
                {tasks.filter((t) => t.status === 'done').length}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>

              <h2 className="text-xl font-semibold capitalize">
                {currentView === 'kanban' ? 'Kanban Board' : currentView}
              </h2>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>

              <Button onClick={() => setNewTaskModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </div>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 overflow-auto p-6">{renderView()}</main>
      </div>

      {/* New Task Modal */}
      <NewTaskModal
        open={newTaskModalOpen}
        onOpenChange={setNewTaskModalOpen}
        onCreateTask={createTask}
      />
    </div>
  )
}

export default App
