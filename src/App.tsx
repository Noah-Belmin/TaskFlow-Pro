import { useState, useEffect } from 'react'
import { Button } from './components/ui/button'
import NewTaskModal from './components/NewTaskModal'
import TaskDetailDrawer from './components/TaskDetailDrawer'
import GlobalSearch from './components/GlobalSearch'
import DashboardView from './components/DashboardView'
import ListView from './components/ListView'
import KanbanView from './components/KanbanView'
import CalendarView from './components/CalendarView'
import TimelineView from './components/TimelineView'
import InfoView from './components/InfoView'
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
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react'
import { exportTasksToCSV } from './utils'

function App() {
  // State
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [taskDetailOpen, setTaskDetailOpen] = useState(false)

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
      subtasks: [],
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

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task)
    setTaskDetailOpen(true)
  }

  const handleTaskDetailClose = () => {
    setTaskDetailOpen(false)
    // Delay clearing selectedTask to allow drawer close animation
    setTimeout(() => setSelectedTask(null), 300)
  }

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView tasks={tasks} onTaskSelect={handleTaskSelect} />
      case 'list':
        return (
          <ListView
            tasks={tasks}
            onTaskUpdate={updateTask}
            onTaskDelete={deleteTask}
            onTaskSelect={handleTaskSelect}
          />
        )
      case 'kanban':
        return (
          <KanbanView
            tasks={tasks}
            onTaskUpdate={updateTask}
            onTaskSelect={handleTaskSelect}
          />
        )
      case 'calendar':
        return (
          <CalendarView
            tasks={tasks}
            onTaskUpdate={updateTask}
            onTaskSelect={handleTaskSelect}
          />
        )
      case 'timeline':
        return (
          <TimelineView
            tasks={tasks}
            onTaskUpdate={updateTask}
            onTaskSelect={handleTaskSelect}
          />
        )
      case 'info':
        return <InfoView />
      default:
        return <DashboardView tasks={tasks} onTaskSelect={handleTaskSelect} />
    }
  }

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside
        className={`
          ${sidebarOpen ? (sidebarCollapsed ? 'w-16' : 'w-64') : 'w-0'}
          transition-all duration-300 bg-white border-r border-slate-200
          flex flex-col overflow-hidden
        `}
      >
        {!sidebarCollapsed && (
          <div className="p-6 border-b border-slate-200">
            <h1 className="text-2xl font-bold text-blue-600">TaskFlow Pro</h1>
            <p className="text-sm text-slate-600 mt-1">Project Management</p>
          </div>
        )}

        {sidebarCollapsed && (
          <div className="p-4 border-b border-slate-200 flex justify-center">
            <h1 className="text-2xl font-bold text-blue-600">TF</h1>
          </div>
        )}

        <nav className={`flex-1 ${sidebarCollapsed ? 'p-2' : 'p-4'} space-y-1`}>
          <Button
            variant={currentView === 'dashboard' ? 'secondary' : 'ghost'}
            className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start'} gap-3 h-10`}
            onClick={() => setCurrentView('dashboard')}
            title="Dashboard"
          >
            <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Dashboard</span>}
          </Button>

          <Button
            variant={currentView === 'list' ? 'secondary' : 'ghost'}
            className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start'} gap-3 h-10`}
            onClick={() => setCurrentView('list')}
            title="List View"
          >
            <List className="h-4 w-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>List View</span>}
          </Button>

          <Button
            variant={currentView === 'kanban' ? 'secondary' : 'ghost'}
            className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start'} gap-3 h-10`}
            onClick={() => setCurrentView('kanban')}
            title="Kanban Board"
          >
            <LayoutGrid className="h-4 w-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Kanban Board</span>}
          </Button>

          <Button
            variant={currentView === 'calendar' ? 'secondary' : 'ghost'}
            className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start'} gap-3 h-10`}
            onClick={() => setCurrentView('calendar')}
            title="Calendar"
          >
            <Calendar className="h-4 w-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Calendar</span>}
          </Button>

          <Button
            variant={currentView === 'timeline' ? 'secondary' : 'ghost'}
            className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start'} gap-3 h-10`}
            onClick={() => setCurrentView('timeline')}
            title="Timeline"
          >
            <Clock className="h-4 w-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Timeline</span>}
          </Button>

          <div className={`${sidebarCollapsed ? 'my-2' : 'my-4'} border-t border-slate-200`} />

          <Button
            variant={currentView === 'info' ? 'secondary' : 'ghost'}
            className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start'} gap-3 h-10`}
            onClick={() => setCurrentView('info')}
            title="Info & Help"
          >
            <Info className="h-4 w-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Info & Help</span>}
          </Button>
        </nav>

        {!sidebarCollapsed && (
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
        )}

        <div className={`${sidebarCollapsed ? 'p-2' : 'p-4'} border-t border-slate-200`}>
          <Button
            variant="ghost"
            className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-between'} h-10`}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {!sidebarCollapsed && <span className="text-sm text-slate-600">Collapse</span>}
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4 text-slate-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 p-4">
          <div className="flex items-center justify-between gap-4">
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

              <h2 className="text-xl font-semibold capitalize hidden md:block">
                {currentView === 'kanban' ? 'Kanban Board' : currentView}
              </h2>
            </div>

            {/* Global Search */}
            <div className="flex-1 max-w-xl">
              <GlobalSearch tasks={tasks} onTaskSelect={handleTaskSelect} />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport} className="hidden sm:flex">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>

              <Button onClick={() => setNewTaskModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">New Task</span>
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

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        task={selectedTask}
        open={taskDetailOpen}
        onClose={handleTaskDetailClose}
        onUpdate={updateTask}
        onDelete={deleteTask}
      />
    </div>
  )
}

export default App
