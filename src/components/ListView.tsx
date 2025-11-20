import { useState } from 'react'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { Select } from './ui/select'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import ConfirmDialog from './ConfirmDialog'
import type { Task, TaskStatus } from '../types'
import { formatDate, getStatusColor, getPriorityColor, getCategoryColor } from '../utils'
import { Search, Trash2 } from 'lucide-react'

interface ListViewProps {
  tasks: Task[]
  onTaskUpdate: (id: string, updates: Partial<Task>) => void
  onTaskDelete: (id: string) => void
  onTaskSelect?: (task: Task) => void
}

export default function ListView({ tasks, onTaskUpdate, onTaskDelete, onTaskSelect }: ListViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
            className="w-48"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="blocked">Blocked</option>
            <option value="done">Done</option>
          </Select>
        </div>
      </Card>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 dark:text-slate-400">
            No tasks found
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} className="p-4">
              <div className="flex items-start justify-between">
                <div
                  className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onTaskSelect?.(task)}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg dark:text-slate-100">{task.title}</h3>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge className={getCategoryColor(task.category)}>
                      {task.category}
                    </Badge>
                  </div>

                  {task.description && (
                    <p className="text-slate-600 dark:text-slate-400 mt-2">{task.description}</p>
                  )}

                  <div className="flex items-center gap-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
                    {task.dueDate && (
                      <span>Due: {formatDate(task.dueDate)}</span>
                    )}
                    {task.assignedTo && (
                      <span>Assigned to: {task.assignedTo}</span>
                    )}
                    {task.tags.length > 0 && (
                      <div className="flex gap-1">
                        {task.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Select
                    value={task.status}
                    onChange={(e) =>
                      onTaskUpdate(task.id, { status: e.target.value as TaskStatus })
                    }
                    className="w-36"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="blocked">Blocked</option>
                    <option value="done">Done</option>
                  </Select>

                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      setTaskToDelete(task.id)
                      setDeleteConfirmOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={() => {
          if (taskToDelete) {
            onTaskDelete(taskToDelete)
          }
          setDeleteConfirmOpen(false)
          setTaskToDelete(null)
        }}
        onCancel={() => {
          setDeleteConfirmOpen(false)
          setTaskToDelete(null)
        }}
      />
    </div>
  )
}
