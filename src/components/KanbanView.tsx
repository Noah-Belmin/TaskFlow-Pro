import { useState } from 'react'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Select } from './ui/select'
import type { Task, TaskStatus } from '../types'
import { formatDate, getPriorityColor, getCategoryColor } from '../utils'
import { GripVertical } from 'lucide-react'

interface KanbanViewProps {
  tasks: Task[]
  onTaskUpdate: (id: string, updates: Partial<Task>) => void
  onTaskSelect?: (task: Task) => void
}

const COLUMNS: { status: TaskStatus; title: string; color: string }[] = [
  { status: 'todo', title: 'To Do', color: 'bg-slate-100' },
  { status: 'in-progress', title: 'In Progress', color: 'bg-blue-100' },
  { status: 'review', title: 'Review', color: 'bg-purple-100' },
  { status: 'done', title: 'Done', color: 'bg-green-100' },
]

export default function KanbanView({ tasks, onTaskUpdate, onTaskSelect }: KanbanViewProps) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null)

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', taskId)
    // Add a slight opacity to the dragged element
    const target = e.currentTarget as HTMLElement
    target.style.opacity = '0.5'
  }

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement
    target.style.opacity = '1'
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(status)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault()
    if (draggedTask) {
      onTaskUpdate(draggedTask, { status: newStatus })
    }
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-12rem)] overflow-x-auto">
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.status)
        const isDropTarget = dragOverColumn === column.status

        return (
          <div key={column.status} className="flex flex-col min-w-[280px]">
            {/* Column Header */}
            <div className={`${column.color} p-4 rounded-t-lg border-b-2 border-slate-300`}>
              <h3 className="font-semibold text-sm uppercase tracking-wide">
                {column.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                {columnTasks.length} {columnTasks.length === 1 ? 'task' : 'tasks'}
              </p>
            </div>

            {/* Column Content - Drop Zone */}
            <div
              className={`
                flex-1 bg-slate-50 dark:bg-slate-900 p-2 space-y-2 overflow-y-auto rounded-b-lg
                transition-all duration-200
                ${isDropTarget ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-400' : ''}
              `}
              onDragOver={(e) => handleDragOver(e, column.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              {columnTasks.length === 0 ? (
                <div className="text-sm text-slate-400 text-center mt-8">
                  {isDropTarget ? (
                    <p className="text-blue-600 font-medium">Drop here</p>
                  ) : (
                    <p>No tasks</p>
                  )}
                </div>
              ) : (
                columnTasks.map((task) => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className={`
                      p-3 transition-all cursor-move bg-white border-2
                      ${draggedTask === task.id ? 'opacity-50' : 'hover:shadow-lg hover:border-blue-300'}
                    `}
                  >
                    <div className="space-y-2">
                      {/* Drag Handle & Title */}
                      <div
                        className="flex items-start gap-2 cursor-pointer"
                        onClick={() => onTaskSelect?.(task)}
                      >
                        <GripVertical className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        <h4 className="font-medium text-sm flex-1">{task.title}</h4>
                      </div>

                      {/* Description */}
                      {task.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 pl-6">
                          {task.description}
                        </p>
                      )}

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1 pl-6">
                        <Badge
                          className={`${getPriorityColor(task.priority)} text-xs`}
                        >
                          {task.priority}
                        </Badge>
                        <Badge
                          className={`${getCategoryColor(task.category)} text-xs`}
                        >
                          {task.category}
                        </Badge>
                      </div>

                      {/* Due Date & Completion */}
                      <div className="pl-6 space-y-1">
                        {task.dueDate && (
                          <p className="text-xs text-slate-500">
                            Due: {formatDate(task.dueDate)}
                          </p>
                        )}
                        {task.completionPercentage !== undefined && task.completionPercentage > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 transition-all"
                                style={{ width: `${task.completionPercentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              {task.completionPercentage}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      {task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pl-6">
                          {task.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 dark:text-slate-100 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Quick Status Change */}
                      <div className="pl-6">
                        <Select
                          value={task.status}
                          onChange={(e) =>
                            onTaskUpdate(task.id, {
                              status: e.target.value as TaskStatus,
                            })
                          }
                          className="text-xs h-8"
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="blocked">Blocked</option>
                          <option value="done">Done</option>
                        </Select>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
