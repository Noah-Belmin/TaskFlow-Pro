import { useState, useEffect } from 'react'
import { Button } from './components/ui/button'
import NewTaskModal from './components/NewTaskModal'
import TaskDetailDrawer from './components/TaskDetailDrawer'
import GlobalSearch from './components/GlobalSearch'
import CategoryManager from './components/CategoryManager'
import DashboardView from './components/DashboardView'
import ListView from './components/ListView'
import KanbanView from './components/KanbanView'
import CalendarView from './components/CalendarView'
import TimelineView from './components/TimelineView'
import SettingsView from './components/SettingsView'
import InfoView from './components/InfoView'
import RuleBuilder from './components/RuleBuilder'
import type { Task, ViewMode, NewTaskFormData, AutomationRule } from './types'
import { DEFAULT_CATEGORIES } from './types'
import { saveToLocalStorage, loadFromLocalStorage } from './utils'
import { executeAutomationRules, updateRuleTriggerCount } from './utils/automationEngine'
import { getCurrentUserId } from './utils/userProfile'
import { useTheme } from './context/ThemeContext'
import { getSeedData, shouldLoadSeedData } from './seedData'
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
  Tag,
  Moon,
  Sun,
  Settings,
  Zap,
} from 'lucide-react'
import { exportTasksToCSV } from './utils'

function App() {
  // Theme
  const { theme, toggleTheme } = useTheme()

  // State
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<string[]>([...DEFAULT_CATEGORIES])
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([])
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false)
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [taskDetailOpen, setTaskDetailOpen] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = loadFromLocalStorage()
    if (savedData) {
      if (savedData.tasks) {
        setTasks(savedData.tasks)
      }
      if (savedData.categories) {
        setCategories(savedData.categories)
      }
      if (savedData.automationRules) {
        setAutomationRules(savedData.automationRules)
      }
    } else if (shouldLoadSeedData()) {
      // Load seed data for first-time users or testing
      const seedTasks = getSeedData()
      setTasks(seedTasks)
      saveToLocalStorage({ tasks: seedTasks, categories: DEFAULT_CATEGORIES, automationRules: [] })
    }
    setIsInitialLoad(false)
  }, [])

  // Save to localStorage whenever tasks or categories change (skip initial render)
  useEffect(() => {
    if (!isInitialLoad) {
      saveToLocalStorage({ tasks, categories, automationRules })
    }
  }, [tasks, categories, automationRules, isInitialLoad])

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
      createdBy: getCurrentUserId(), // Set creator from user profile
      createdAt: new Date(),
      updatedAt: new Date(),
      comments: [],
      attachments: [],
      checklist: [],
      subtasks: [],
      customFields: {},
    }

    // Execute automation rules for new task (trigger: 'created')
    const { task: taskWithAutomation, triggeredRules } = executeAutomationRules(
      undefined,
      newTask,
      automationRules
    )

    // Update rule trigger counts
    if (triggeredRules.length > 0) {
      setAutomationRules(updateRuleTriggerCount(automationRules, triggeredRules))
    }

    setTasks([...tasks, taskWithAutomation])
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(
      tasks.map((task) => {
        if (task.id !== id) return task

        // Create the updated task with manual updates
        const manuallyUpdatedTask = { ...task, ...updates, updatedAt: new Date() }

        // Execute automation rules on the updated task
        const { task: taskWithAutomation, triggeredRules } = executeAutomationRules(
          task,
          manuallyUpdatedTask,
          automationRules
        )

        // Update rule trigger counts if any rules were triggered
        if (triggeredRules.length > 0) {
          setAutomationRules(updateRuleTriggerCount(automationRules, triggeredRules))
        }

        return taskWithAutomation
      })
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

  // Automation Rule Operations
  const createAutomationRule = (rule: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt' | 'triggerCount'>) => {
    const newRule: AutomationRule = {
      ...rule,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      triggerCount: 0,
    }
    setAutomationRules([...automationRules, newRule])
  }

  const updateAutomationRule = (id: string, updates: Partial<AutomationRule>) => {
    setAutomationRules(
      automationRules.map((rule) =>
        rule.id === id
          ? { ...rule, ...updates, updatedAt: new Date() }
          : rule
      )
    )
  }

  const deleteAutomationRule = (id: string) => {
    setAutomationRules(automationRules.filter((rule) => rule.id !== id))
  }

  const toggleAutomationRule = (id: string, enabled: boolean) => {
    updateAutomationRule(id, { enabled })
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
      case 'automation':
        return (
          <RuleBuilder
            rules={automationRules}
            onCreateRule={createAutomationRule}
            onUpdateRule={updateAutomationRule}
            onDeleteRule={deleteAutomationRule}
            onToggleRule={toggleAutomationRule}
          />
        )
      case 'settings':
        return <SettingsView />
      case 'info':
        return <InfoView />
      default:
        return <DashboardView tasks={tasks} onTaskSelect={handleTaskSelect} />
    }
  }

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
      {/* Sidebar */}
      <aside
        className={`
          ${sidebarOpen ? (sidebarCollapsed ? 'w-16' : 'w-64') : 'w-0'}
          transition-all duration-300 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
          flex flex-col overflow-hidden
        `}
      >
        {!sidebarCollapsed && (
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">TaskFlow Pro</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Project Management</p>
          </div>
        )}

        {sidebarCollapsed && (
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-center">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">TF</h1>
          </div>
        )}

        <nav className={`flex-1 ${sidebarCollapsed ? 'p-2' : 'p-4'} space-y-1`}>
          <Button
            variant={currentView === 'dashboard' ? 'secondary' : 'ghost'}
            className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start px-3'} gap-3 h-10 text-left`}
            onClick={() => setCurrentView('dashboard')}
            title="Dashboard"
          >
            <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
            {!sidebarCollapsed && <span className="flex-1">Dashboard</span>}
          </Button>

          <Button
            variant={currentView === 'list' ? 'secondary' : 'ghost'}
            className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start px-3'} gap-3 h-10 text-left`}
            onClick={() => setCurrentView('list')}
            title="List View"
          >
            <List className="h-4 w-4 flex-shrink-0" />
            {!sidebarCollapsed && <span className="flex-1">List View</span>}
          </Button>

          <Button
            variant={currentView === 'kanban' ? 'secondary' : 'ghost'}
            className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start px-3'} gap-3 h-10 text-left`}
            onClick={() => setCurrentView('kanban')}
            title="Kanban Board"
          >
            <LayoutGrid className="h-4 w-4 flex-shrink-0" />
            {!sidebarCollapsed && <span className="flex-1">Kanban Board</span>}
          </Button>

          <Button
            variant={currentView === 'calendar' ? 'secondary' : 'ghost'}
            className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start px-3'} gap-3 h-10 text-left`}
            onClick={() => setCurrentView('calendar')}
            title="Calendar"
          >
            <Calendar className="h-4 w-4 flex-shrink-0" />
            {!sidebarCollapsed && <span className="flex-1">Calendar</span>}
          </Button>

          <Button
            variant={currentView === 'timeline' ? 'secondary' : 'ghost'}
            className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start px-3'} gap-3 h-10 text-left`}
            onClick={() => setCurrentView('timeline')}
            title="Timeline"
          >
            <Clock className="h-4 w-4 flex-shrink-0" />
            {!sidebarCollapsed && <span className="flex-1">Timeline</span>}
          </Button>

          <div className={`${sidebarCollapsed ? 'my-2' : 'my-4'} border-t border-slate-200 dark:border-slate-700`} />

          <Button
            variant={currentView === 'automation' ? 'secondary' : 'ghost'}
            className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start px-3'} gap-3 h-10 text-left`}
            onClick={() => setCurrentView('automation')}
            title="Automation"
          >
            <Zap className="h-4 w-4 flex-shrink-0" />
            {!sidebarCollapsed && <span className="flex-1">Automation</span>}
          </Button>

          <div className={`${sidebarCollapsed ? 'my-2' : 'my-4'} border-t border-slate-200 dark:border-slate-700`} />

          <Button
            variant={currentView === 'settings' ? 'secondary' : 'ghost'}
            className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start px-3'} gap-3 h-10 text-left`}
            onClick={() => setCurrentView('settings')}
            title="Settings"
          >
            <Settings className="h-4 w-4 flex-shrink-0" />
            {!sidebarCollapsed && <span className="flex-1">Settings</span>}
          </Button>

          <Button
            variant={currentView === 'info' ? 'secondary' : 'ghost'}
            className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start px-3'} gap-3 h-10 text-left`}
            onClick={() => setCurrentView('info')}
            title="Info & Help"
          >
            <Info className="h-4 w-4 flex-shrink-0" />
            {!sidebarCollapsed && <span className="flex-1">Info & Help</span>}
          </Button>
        </nav>

        {!sidebarCollapsed && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
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

        <div className={`${sidebarCollapsed ? 'p-2' : 'p-4'} border-t border-slate-200 dark:border-slate-700`}>
          <Button
            variant="ghost"
            className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-between'} h-10`}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {!sidebarCollapsed && <span className="text-sm text-slate-600 dark:text-slate-400">Collapse</span>}
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
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

              <h2 className="text-xl font-semibold capitalize hidden md:block dark:text-slate-100">
                {currentView === 'kanban' ? 'Kanban Board' : currentView}
              </h2>
            </div>

            {/* Global Search */}
            <div className="flex-1 max-w-xl">
              <GlobalSearch tasks={tasks} onTaskSelect={handleTaskSelect} />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCategoryManagerOpen(true)} className="hidden lg:flex">
                <Tag className="mr-2 h-4 w-4" />
                Categories
              </Button>

              <Button variant="outline" onClick={toggleTheme} className="hidden md:flex">
                {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                {theme === 'dark' ? 'Light' : 'Dark'}
              </Button>

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
        categories={categories}
      />

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        task={selectedTask}
        open={taskDetailOpen}
        onClose={handleTaskDetailClose}
        onUpdate={updateTask}
        onDelete={deleteTask}
      />

      {/* Category Manager */}
      <CategoryManager
        open={categoryManagerOpen}
        onClose={() => setCategoryManagerOpen(false)}
        categories={categories}
        onUpdateCategories={(newCategories) => {
          setCategories(newCategories)
        }}
      />
    </div>
  )
}

export default App
