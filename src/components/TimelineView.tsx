import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import type { Task } from '../types'
import { formatDate, getPriorityColor, getStatusColor } from '../utils'
import { Calendar, Clock } from 'lucide-react'

interface TimelineViewProps {
  tasks: Task[]
  onTaskUpdate?: (id: string, updates: Partial<Task>) => void
  onTaskSelect?: (task: Task) => void
}

export default function TimelineView({ tasks, onTaskSelect }: TimelineViewProps) {
  // Get tasks with dates, sorted by start date
  const tasksWithDates = tasks
    .filter(task => task.startDate || task.dueDate)
    .sort((a, b) => {
      const dateA = a.startDate || a.dueDate || new Date()
      const dateB = b.startDate || b.dueDate || new Date()
      return new Date(dateA).getTime() - new Date(dateB).getTime()
    })

  // Calculate timeline scale
  const allDates = tasksWithDates.flatMap(task => [
    task.startDate,
    task.dueDate
  ].filter(Boolean) as Date[])

  const minDate = allDates.length > 0
    ? new Date(Math.min(...allDates.map(d => new Date(d).getTime())))
    : new Date()
  const maxDate = allDates.length > 0
    ? new Date(Math.max(...allDates.map(d => new Date(d).getTime())))
    : new Date()

  // Add padding to timeline
  const paddedMinDate = new Date(minDate)
  paddedMinDate.setDate(paddedMinDate.getDate() - 2)
  const paddedMaxDate = new Date(maxDate)
  paddedMaxDate.setDate(paddedMaxDate.getDate() + 2)

  const calculatePosition = (date: Date): number => {
    const total = paddedMaxDate.getTime() - paddedMinDate.getTime()
    const current = new Date(date).getTime() - paddedMinDate.getTime()
    return (current / total) * 100
  }

  const calculateDuration = (start: Date, end: Date): number => {
    const startPos = calculatePosition(start)
    const endPos = calculatePosition(end)
    return endPos - startPos
  }

  // Generate timeline markers (dates)
  const generateTimelineMarkers = () => {
    const markers: Date[] = []
    const current = new Date(paddedMinDate)
    const diffDays = Math.ceil((paddedMaxDate.getTime() - paddedMinDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays <= 14) {
      // Show every day for short timelines
      while (current <= paddedMaxDate) {
        markers.push(new Date(current))
        current.setDate(current.getDate() + 1)
      }
    } else if (diffDays <= 60) {
      // Show every 3 days for medium timelines
      while (current <= paddedMaxDate) {
        markers.push(new Date(current))
        current.setDate(current.getDate() + 3)
      }
    } else {
      // Show every week for long timelines
      while (current <= paddedMaxDate) {
        markers.push(new Date(current))
        current.setDate(current.getDate() + 7)
      }
    }

    return markers
  }

  const timelineMarkers = generateTimelineMarkers()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <CardTitle>Project Timeline</CardTitle>
            </div>
            <div className="text-sm text-slate-600">
              {formatDate(minDate)} - {formatDate(maxDate)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {tasksWithDates.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No tasks with dates to display</p>
              <p className="text-sm text-slate-500 mt-2">
                Add start or due dates to your tasks to see them in the timeline
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Timeline header with date markers */}
              <div className="relative h-8 border-b border-slate-300">
                {timelineMarkers.map((marker, index) => {
                  const position = calculatePosition(marker)
                  return (
                    <div
                      key={index}
                      className="absolute top-0 h-full flex flex-col items-center"
                      style={{ left: `${position}%` }}
                    >
                      <div className="h-2 w-px bg-slate-300"></div>
                      <span className="text-xs text-slate-500 mt-1 -ml-6 w-12 text-center">
                        {marker.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Tasks */}
              <div className="space-y-4">
                {tasksWithDates.map(task => {
                  const start = task.startDate || task.dueDate!
                  const end = task.dueDate || task.startDate!
                  const startPos = calculatePosition(start)
                  const duration = calculateDuration(start, end)

                  return (
                    <div key={task.id} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span
                          className="text-sm font-medium flex-shrink-0 w-64 truncate cursor-pointer hover:text-blue-600 transition-colors"
                          title={task.title}
                          onClick={() => onTaskSelect?.(task)}
                        >
                          {task.title}
                        </span>
                        <div className="flex gap-2 flex-shrink-0">
                          <Badge className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                      </div>

                      <div className="relative h-10 bg-slate-100 rounded-lg">
                        {/* Timeline bar */}
                        <div
                          className={`
                            absolute h-full rounded-lg flex items-center justify-between px-2
                            ${task.status === 'done' ? 'bg-green-500' :
                              task.status === 'in-progress' ? 'bg-blue-500' :
                              task.status === 'blocked' ? 'bg-red-500' :
                              'bg-slate-400'}
                            transition-all hover:opacity-90 cursor-pointer
                          `}
                          style={{
                            left: `${startPos}%`,
                            width: `${Math.max(duration, 3)}%`
                          }}
                          title={`${formatDate(start)} - ${formatDate(end)}\nProgress: ${task.completionPercentage || 0}%`}
                          onClick={() => onTaskSelect?.(task)}
                        >
                          {/* Completion progress bar */}
                          {task.completionPercentage && task.completionPercentage > 0 && (
                            <div
                              className="absolute inset-0 bg-white bg-opacity-30 rounded-lg"
                              style={{ width: `${task.completionPercentage}%` }}
                            />
                          )}

                          <span className="text-xs font-medium text-white relative z-10 truncate">
                            {duration > 15 && task.assignedTo}
                          </span>

                          {task.completionPercentage !== undefined && (
                            <span className="text-xs font-bold text-white relative z-10">
                              {task.completionPercentage}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Task details */}
                      {task.description && (
                        <p className="text-xs text-slate-600 ml-2 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <span className="font-semibold">Status Colors:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-400 rounded"></div>
            <span>To Do</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Blocked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Done</span>
          </div>
          <div className="flex items-center gap-2 ml-6">
            <div className="w-12 h-4 bg-blue-500 rounded relative overflow-hidden">
              <div className="absolute inset-0 w-1/2 bg-white bg-opacity-30"></div>
            </div>
            <span>= Completion Progress</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
