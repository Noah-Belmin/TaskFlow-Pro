import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { getSeedData } from '../seedData'
import { saveToLocalStorage } from '../utils'
import {
  BookOpen,
  Keyboard,
  MousePointer,
  Calendar as CalendarIcon,
  List as ListIcon,
  LayoutGrid,
  Clock,
  Search,
  Plus,
  Info,
  Database
} from 'lucide-react'

export default function InfoView() {
  const handleLoadSampleData = () => {
    const confirmLoad = window.confirm(
      'This will replace all current tasks with sample data. Continue?'
    )
    if (confirmLoad) {
      const seedTasks = getSeedData()
      saveToLocalStorage({ tasks: seedTasks, categories: ['work', 'personal', 'health', 'learning', 'construction', 'other'] })
      window.location.reload()
    }
  }
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">TaskFlow Pro Documentation</h1>
        <p className="text-slate-600 dark:text-slate-400">Everything you need to know to master your productivity</p>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <CardTitle>Getting Started</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Creating Your First Task</h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-700">
              <li>Click the <Badge className="bg-blue-600">+ New Task</Badge> button in the header</li>
              <li>Fill in the task details including title, description, and priority</li>
              <li>Set optional fields like due date, assignee, and tags</li>
              <li>Click <strong>Create Task</strong> to save</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Editing Tasks</h3>
            <p className="text-slate-700">
              Click on any task in any view to open the Task Detail Drawer. From there you can:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-slate-700">
              <li>Edit all task details inline</li>
              <li>Add comments and collaborate with your team</li>
              <li>Upload file attachments</li>
              <li>Add and manage subtasks</li>
              <li>Track completion progress</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Views */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-blue-600" />
            <CardTitle>Views</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-slate-600" />
                <h4 className="font-semibold">Dashboard</h4>
              </div>
              <p className="text-sm text-slate-600">
                Overview of your tasks with stats, high priority items, and progress tracking.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ListIcon className="h-4 w-4 text-slate-600" />
                <h4 className="font-semibold">List View</h4>
              </div>
              <p className="text-sm text-slate-600">
                Detailed list of all tasks with filtering and search capabilities.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-slate-600" />
                <h4 className="font-semibold">Kanban Board</h4>
              </div>
              <p className="text-sm text-slate-600">
                Visual board with drag-and-drop to move tasks between status columns.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-slate-600" />
                <h4 className="font-semibold">Calendar</h4>
              </div>
              <p className="text-sm text-slate-600">
                Monthly calendar view showing tasks by due date, color-coded by priority.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-600" />
                <h4 className="font-semibold">Timeline</h4>
              </div>
              <p className="text-sm text-slate-600">
                Gantt-style timeline showing task duration, dependencies, and progress.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-blue-600" />
            <CardTitle>Keyboard Shortcuts</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
              <span className="text-slate-700">Open Global Search</span>
              <Badge variant="outline" className="font-mono">Cmd/Ctrl + K</Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
              <span className="text-slate-700">Close Modal/Drawer</span>
              <Badge variant="outline" className="font-mono">Esc</Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
              <span className="text-slate-700">Navigate Search Results</span>
              <Badge variant="outline" className="font-mono">↑ ↓</Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
              <span className="text-slate-700">Select Search Result</span>
              <Badge variant="outline" className="font-mono">Enter</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MousePointer className="h-5 w-5 text-blue-600" />
            <CardTitle>Key Features</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-4 w-4 text-blue-600" />
              <h4 className="font-semibold">Global Search</h4>
            </div>
            <p className="text-sm text-slate-600">
              Search across all tasks by title, description, tags, assignee, category, status, and priority.
              Press <strong>Cmd/Ctrl + K</strong> to open.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Plus className="h-4 w-4 text-blue-600" />
              <h4 className="font-semibold">Subtasks</h4>
            </div>
            <p className="text-sm text-slate-600">
              Break down complex tasks into manageable subtasks. Subtask completion automatically
              updates the parent task's progress percentage.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <LayoutGrid className="h-4 w-4 text-blue-600" />
              <h4 className="font-semibold">Drag & Drop</h4>
            </div>
            <p className="text-sm text-slate-600">
              In Kanban view, drag tasks between columns to update their status. Tasks update
              automatically across all views.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-blue-600" />
              <h4 className="font-semibold">Task Details</h4>
            </div>
            <p className="text-sm text-slate-600">
              Click any task to view comprehensive details, add comments, upload attachments,
              and manage subtasks. All changes sync automatically.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tips & Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Tips & Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Use <strong>tags</strong> to group related tasks across categories</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Set <strong>priorities</strong> to focus on what matters most</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Break large tasks into <strong>subtasks</strong> for better progress tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Use the <strong>Calendar view</strong> to plan your week ahead</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Regularly review your <strong>Dashboard</strong> to track overall progress</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Use <strong>comments</strong> to document decisions and collaborate with team members</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Data Storage */}
      <Card>
        <CardHeader>
          <CardTitle>Data Storage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 dark:text-slate-400">
            All your data is stored locally in your browser using localStorage. Your tasks are
            automatically saved as you work and persist across sessions. No data is sent to external servers.
          </p>
        </CardContent>
      </Card>

      {/* Developer Tools */}
      <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <CardTitle>Developer Tools</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2 dark:text-slate-100">Load Sample Data</h3>
            <p className="text-slate-700 dark:text-slate-400 mb-4">
              Load 10 sample tasks to test the application. This will replace your current data.
            </p>
            <Button onClick={handleLoadSampleData} variant="outline" className="gap-2">
              <Database className="h-4 w-4" />
              Load Sample Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
