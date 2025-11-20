import type { Task, TaskPriority, TaskStatus } from './types'

// ============================================================================
// Local Storage Operations
// ============================================================================

export const saveToLocalStorage = (data: any): void => {
  try {
    localStorage.setItem('taskflow-pro-data', JSON.stringify(data))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

export const loadFromLocalStorage = (): any | null => {
  try {
    const data = localStorage.getItem('taskflow-pro-data')
    if (!data) return null

    const parsed = JSON.parse(data)

    // Convert date strings back to Date objects
    if (parsed.tasks) {
      parsed.tasks = parsed.tasks.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        startDate: task.startDate ? new Date(task.startDate) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        // Convert dates in comments
        comments: task.comments?.map((comment: any) => ({
          ...comment,
          createdAt: new Date(comment.createdAt),
          updatedAt: comment.updatedAt ? new Date(comment.updatedAt) : undefined,
        })) || [],
        // Convert dates in attachments
        attachments: task.attachments?.map((attachment: any) => ({
          ...attachment,
          uploadedAt: new Date(attachment.uploadedAt),
        })) || [],
        // Convert dates in subtasks
        subtasks: task.subtasks?.map((subtask: any) => ({
          ...subtask,
          createdAt: new Date(subtask.createdAt),
          completedAt: subtask.completedAt ? new Date(subtask.completedAt) : undefined,
          dueDate: subtask.dueDate ? new Date(subtask.dueDate) : undefined,
        })) || [],
      }))
    }

    return parsed
  } catch (error) {
    console.error('Error loading from localStorage:', error)
    return null
  }
}

export const clearLocalStorage = (): void => {
  localStorage.removeItem('taskflow-pro-data')
}

// ============================================================================
// Date Utilities
// ============================================================================

export const formatDate = (date: Date | undefined): string => {
  if (!date) return 'No date'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const formatDateTime = (date: Date | undefined): string => {
  if (!date) return 'No date'
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const isOverdue = (date: Date | undefined): boolean => {
  if (!date) return false
  return new Date(date) < new Date() && new Date(date).toDateString() !== new Date().toDateString()
}

export const isDueSoon = (date: Date | undefined, days: number = 3): boolean => {
  if (!date) return false
  const dueDate = new Date(date)
  const today = new Date()
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays >= 0 && diffDays <= days
}

// ============================================================================
// Color Utilities
// ============================================================================

export const getStatusColor = (status: TaskStatus): string => {
  const colors = {
    todo: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100',
    'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    review: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    blocked: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    done: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  }
  return colors[status] || colors.todo
}

export const getPriorityColor = (priority: TaskPriority): string => {
  const colors = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  }
  return colors[priority] || colors.medium
}

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    work: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    personal: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    health: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    learning: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100',
    construction: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
  }
  return colors[category] || colors.other
}

// ============================================================================
// Sorting & Filtering
// ============================================================================

export const sortTasks = (
  tasks: Task[],
  sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title' = 'createdAt',
  order: 'asc' | 'desc' = 'desc'
): Task[] => {
  const sorted = [...tasks].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        break
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
        break
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
    }

    return order === 'asc' ? comparison : -comparison
  })

  return sorted
}

export const filterTasks = (
  tasks: Task[],
  filters: {
    status?: TaskStatus
    priority?: TaskPriority
    category?: string
    search?: string
  }
): Task[] => {
  return tasks.filter((task) => {
    if (filters.status && task.status !== filters.status) return false
    if (filters.priority && task.priority !== filters.priority) return false
    if (filters.category && task.category !== filters.category) return false
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      return (
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      )
    }
    return true
  })
}

// ============================================================================
// CSV Operations
// ============================================================================

export const exportTasksToCSV = (tasks: Task[]): string => {
  const headers = [
    'ID',
    'Title',
    'Description',
    'Status',
    'Priority',
    'Category',
    'Tags',
    'Due Date',
    'Created At',
    'Assigned To',
  ]

  const rows = tasks.map((task) => [
    task.id,
    escapeCSV(task.title),
    escapeCSV(task.description),
    task.status,
    task.priority,
    task.category,
    task.tags.join(';'),
    task.dueDate ? formatDate(task.dueDate) : '',
    formatDate(task.createdAt),
    task.assignedTo || '',
  ])

  const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

  return csv
}

const escapeCSV = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

// ============================================================================
// Validation
// ============================================================================

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidURL = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// ============================================================================
// Task Statistics
// ============================================================================

export const calculateTaskStats = (tasks: Task[]) => {
  const total = tasks.length
  const completed = tasks.filter((t) => t.status === 'done').length
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length
  const blocked = tasks.filter((t) => t.status === 'blocked').length
  const overdue = tasks.filter((t) => isOverdue(t.dueDate)).length
  const dueSoon = tasks.filter((t) => isDueSoon(t.dueDate)).length

  const byPriority = {
    urgent: tasks.filter((t) => t.priority === 'urgent').length,
    high: tasks.filter((t) => t.priority === 'high').length,
    medium: tasks.filter((t) => t.priority === 'medium').length,
    low: tasks.filter((t) => t.priority === 'low').length,
  }

  const byStatus = {
    todo: tasks.filter((t) => t.status === 'todo').length,
    'in-progress': inProgress,
    review: tasks.filter((t) => t.status === 'review').length,
    blocked: blocked,
    done: completed,
  }

  // Calculate weighted completion rate including subtasks
  let totalCompletion = 0
  tasks.forEach(task => {
    if (task.status === 'done') {
      totalCompletion += 100
    } else if (task.completionPercentage !== undefined && task.completionPercentage > 0) {
      // Use task's completion percentage which is auto-calculated from subtasks
      totalCompletion += task.completionPercentage
    } else if (task.status === 'in-progress') {
      // Give partial credit for in-progress tasks without subtasks
      totalCompletion += 10
    }
  })

  const completionRate = total > 0 ? Math.round(totalCompletion / total) : 0

  return {
    total,
    completed,
    inProgress,
    blocked,
    overdue,
    dueSoon,
    byPriority,
    byStatus,
    completionRate,
  }
}
