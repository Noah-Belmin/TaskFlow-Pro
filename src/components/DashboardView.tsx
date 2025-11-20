import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import type { Task } from '../types'
import { calculateTaskStats, formatDate, formatDateTime, getPriorityColor, getStatusColor, isOverdue, isDueSoon } from '../utils'
import { CheckCircle2, Clock, AlertCircle, TrendingUp, Calendar as CalendarIcon } from 'lucide-react'

interface DashboardViewProps {
  tasks: Task[]
  onTaskSelect?: (task: Task) => void
}

export default function DashboardView({ tasks, onTaskSelect }: DashboardViewProps) {
  const stats = calculateTaskStats(tasks)
  const highPriorityTasks = tasks
    .filter((t) => ['high', 'urgent'].includes(t.priority) && t.status !== 'done')
    .slice(0, 5)

  const upcomingTasks = tasks
    .filter((t) => t.dueDate && t.status !== 'done')
    .sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
    .slice(0, 5)

  const recentActivity = [...tasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Row 1: Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold dark:text-slate-100">{stats.total}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Across all projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-400 dark:text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold dark:text-slate-100">{stats.inProgress}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-400 dark:text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold dark:text-slate-100">{stats.completed}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {stats.completionRate}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-400 dark:text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold dark:text-slate-100">{stats.blocked}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            You've completed {stats.completionRate}% of all tasks
          </p>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
            <div
              className="bg-slate-900 dark:bg-blue-500 h-3 rounded-full transition-all"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Row 3: High Priority Tasks & Upcoming Due Dates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* High Priority Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>High Priority Tasks</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {highPriorityTasks.length} {highPriorityTasks.length === 1 ? 'task needs' : 'tasks need'} attention
            </p>
          </CardHeader>
          <CardContent>
            {highPriorityTasks.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No high priority tasks</p>
            ) : (
              <div className="space-y-2">
                {highPriorityTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                    onClick={() => onTaskSelect?.(task)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm flex-1 dark:text-slate-200">{task.title}</h4>
                      <div className="flex gap-1">
                        <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
                          {task.priority}
                        </Badge>
                        <Badge className={`${getStatusColor(task.status)} text-xs`}>
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Due Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Due Dates</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {upcomingTasks.length} {upcomingTasks.length === 1 ? 'task with deadline' : 'tasks with deadlines'}
            </p>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No upcoming deadlines</p>
            ) : (
              <div className="space-y-2">
                {upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors ${
                      isOverdue(task.dueDate) ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30' :
                      isDueSoon(task.dueDate) ? 'border-orange-300 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30' : 'border-slate-200 dark:border-slate-700'
                    }`}
                    onClick={() => onTaskSelect?.(task)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm flex-1 dark:text-slate-200">{task.title}</h4>
                      <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                        <CalendarIcon className="h-3 w-3" />
                        {formatDate(task.dueDate)}
                      </div>
                    </div>
                    {isOverdue(task.dueDate) && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">Overdue</p>
                    )}
                    {isDueSoon(task.dueDate) && !isOverdue(task.dueDate) && (
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Due soon</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400">Latest updates to your tasks</p>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                  onClick={() => onTaskSelect?.(task)}
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-sm dark:text-slate-200">{task.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Updated {formatDateTime(task.updatedAt)}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(task.status)} text-xs`}>
                    {task.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
