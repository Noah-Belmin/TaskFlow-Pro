import { useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import type { Task } from '../types'
import { getPriorityColor, isOverdue } from '../utils'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'

interface CalendarViewProps {
  tasks: Task[]
  onTaskUpdate?: (id: string, updates: Partial<Task>) => void
  onTaskSelect?: (task: Task) => void
}

export default function CalendarView({ tasks, onTaskSelect }: CalendarViewProps) {
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

    const days: (Date | null)[] = []
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

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() - 1)
    setCurrentDate(newDate)
  }

  const goToNextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + 1)
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="space-y-4">
      {/* Header with month navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold dark:text-slate-100">{monthName}</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={goToToday}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-sm text-slate-700 dark:text-slate-300 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2 auto-rows-fr">
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="h-32 bg-slate-50 dark:bg-slate-900 rounded-lg" />
            }

            const tasksForDay = getTasksForDate(date)
            const isToday = date.toDateString() === new Date().toDateString()
            const hasOverdueTasks = tasksForDay.some(task => isOverdue(task.dueDate) && task.status !== 'done')

            return (
              <div
                key={date.toISOString()}
                className={`
                  h-32 p-2 border-2 rounded-lg transition-all hover:shadow-md dark:hover:shadow-slate-700 overflow-y-auto
                  ${isToday
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50'}
                  ${hasOverdueTasks ? 'border-red-300 dark:border-red-700' : ''}
                `}
              >
                <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {tasksForDay.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      className={`
                        text-xs p-1.5 rounded cursor-pointer
                        ${getPriorityColor(task.priority)}
                        hover:opacity-80 transition-opacity
                      `}
                      title={`${task.title}\n${task.description || 'No description'}\nStatus: ${task.status}`}
                      onClick={() => onTaskSelect?.(task)}
                    >
                      <div className="font-medium truncate">{task.title}</div>
                      {task.assignedTo && (
                        <div className="text-xs opacity-75 truncate">
                          {task.assignedTo}
                        </div>
                      )}
                    </div>
                  ))}
                  {tasksForDay.length > 3 && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium pl-1">
                      +{tasksForDay.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Legend */}
      <Card className="p-4">
        <div className="flex items-center gap-6 text-sm dark:text-slate-300 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30 rounded"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-red-300 dark:border-red-700 rounded"></div>
            <span>Has Overdue Tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">Urgent</Badge>
            <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">High</Badge>
            <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">Medium</Badge>
            <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">Low</Badge>
          </div>
        </div>
      </Card>
    </div>
  )
}
