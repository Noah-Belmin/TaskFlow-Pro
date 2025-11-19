import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Select } from './ui/select'
import type { Task, TaskStatus } from '../types'
import { formatDate, getPriorityColor, getCategoryColor } from '../utils'

interface KanbanViewProps {
  tasks: Task[]
  onTaskUpdate: (id: string, updates: Partial<Task>) => void
}

const COLUMNS: { status: TaskStatus; title: string; color: string }[] = [
  { status: 'todo', title: 'To Do', color: 'bg-slate-100' },
  { status: 'in-progress', title: 'In Progress', color: 'bg-blue-100' },
  { status: 'review', title: 'Review', color: 'bg-purple-100' },
  { status: 'done', title: 'Done', color: 'bg-green-100' },
]

export default function KanbanView({ tasks, onTaskUpdate }: KanbanViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-12rem)] overflow-x-auto">
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.status)

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

            {/* Column Content */}
            <div className="flex-1 bg-slate-50 p-2 space-y-2 overflow-y-auto rounded-b-lg">
              {columnTasks.length === 0 ? (
                <p className="text-sm text-slate-400 text-center mt-4">
                  No tasks
                </p>
              ) : (
                columnTasks.map((task) => (
                  <Card key={task.id} className="p-3 hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                      {/* Title */}
                      <h4 className="font-medium text-sm">{task.title}</h4>

                      {/* Description */}
                      {task.description && (
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1">
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

                      {/* Due Date */}
                      {task.dueDate && (
                        <p className="text-xs text-slate-500">
                          Due: {formatDate(task.dueDate)}
                        </p>
                      )}

                      {/* Tags */}
                      {task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 bg-slate-200 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Quick Status Change */}
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
