// Core Task Types
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'blocked' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskCategory = string // Support custom categories

// Default categories
export const DEFAULT_CATEGORIES = ['work', 'personal', 'health', 'learning', 'construction', 'other'] as const

export interface Task {
  // Core Identifiers
  id: string
  key?: string

  // Basic Info
  title: string
  description: string

  // Status & Priority
  status: TaskStatus
  priority: TaskPriority

  // Categorization
  category: TaskCategory
  tags: string[]

  // Relationships
  epicId?: string
  sprintId?: string
  jobSiteId?: string
  parentTaskId?: string
  relatedTaskIds?: string[]

  // Assignment
  assignedTo?: string
  createdBy?: string
  reviewers?: string[]

  // Dates
  createdAt: Date
  updatedAt: Date
  dueDate?: Date
  startDate?: Date
  completedAt?: Date

  // Collaboration
  comments: Comment[]
  attachments: Attachment[]
  checklist: ChecklistItem[]
  subtasks: Subtask[]

  // Custom
  customFields: Record<string, any>

  // Metadata
  estimatedHours?: number
  completionPercentage?: number
  blockedBy?: string[]
  isLocked?: boolean
  isFavorite?: boolean

  // Cost Tracking
  estimatedCost?: number
  actualCost?: number
  costBreakdown?: CostItem[]
  billable?: boolean
}

// Collaboration Types
export interface Comment {
  id: string
  taskId: string
  userId: string
  userName: string
  content: string
  createdAt: Date
  updatedAt?: Date
  parentCommentId?: string
}

export interface Attachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedBy: string
  uploadedAt: Date
  description?: string
  category?: 'document' | 'image' | 'video' | 'other'
}

export interface CostItem {
  id: string
  description: string
  amount: number
  date: Date
  category: string
  receipt?: string
}

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
  assignedTo?: string
  dueDate?: Date
}

export interface Subtask {
  id: string
  title: string
  description?: string
  status: TaskStatus
  assignedTo?: string
  dueDate?: Date
  completedAt?: Date
  createdAt: Date
  estimatedHours?: number
}

// Agile Planning Types
export interface Epic {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  startDate?: Date
  endDate?: Date
  owner?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Sprint {
  id: string
  name: string
  goal: string
  startDate: Date
  endDate: Date
  status: 'planning' | 'active' | 'completed'
  capacity: number
  taskIds: string[]
  createdAt: Date
  updatedAt: Date
}

// Construction Types
export interface JobSite {
  id: string
  name: string
  address: string
  client: string
  projectManager: string
  startDate: Date
  expectedCompletionDate: Date
  status: 'planning' | 'in-progress' | 'on-hold' | 'completed'
  budget: number
  spent: number
  createdAt: Date
  updatedAt: Date
}

// View Types
export type ViewMode = 'dashboard' | 'list' | 'kanban' | 'calendar' | 'timeline' | 'automation' | 'settings' | 'info'

// User Profile
export interface UserProfile {
  name: string
  email: string
  role?: string
  avatar?: string
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  timeFormat: '12h' | '24h'
  timezone?: string
  currency?: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | 'INR'
}

// Settings Types
export interface AppSettings {
  general: GeneralSettings
  display: DisplaySettings
  notifications: NotificationSettings
  integrations: IntegrationSettings
  dataManagement: DataManagementSettings
}

export interface GeneralSettings {
  dateFormat: string
  timeZone: string
  startDayOfWeek: number
  enableConstructionFeatures: boolean
  enableAgileFeatures: boolean
}

export interface DisplaySettings {
  compactMode: boolean
  showCompletedTasks: boolean
  groupBy: 'none' | 'priority' | 'category' | 'assignee'
  sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title'
  sortOrder: 'asc' | 'desc'
}

export interface NotificationSettings {
  enableNotifications: boolean
  emailNotifications: boolean
  dueDateReminders: boolean
  reminderDaysBefore: number
}

export interface IntegrationSettings {
  googleCalendar: boolean
  slack: boolean
  github: boolean
}

export interface DataManagementSettings {
  autoBackup: boolean
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  exportFormat: 'csv' | 'json' | 'excel'
}

// CSV Import Types
export interface CSVImportMapping {
  csvColumn: string
  fieldName: keyof Task
  fieldType: 'text' | 'date' | 'dropdown' | 'number' | 'boolean'
  required: boolean
}

export interface ImportResult {
  success: boolean
  importedCount: number
  errors: ImportError[]
  tasks?: Task[]
}

export interface ImportError {
  row: number
  field: string
  message: string
}

// Automation Rule Types
export type RuleTrigger = 'status_changed' | 'priority_changed' | 'due_date_approaching' | 'assigned' | 'created'
export type RuleCondition = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains'
export type RuleAction = 'set_status' | 'set_priority' | 'assign_to' | 'add_tag' | 'send_notification'

export interface AutomationRule {
  id: string
  name: string
  description?: string
  enabled: boolean
  trigger: RuleTrigger
  conditions: RuleConditionItem[]
  actions: RuleActionItem[]
  createdAt: Date
  updatedAt: Date
  lastTriggered?: Date
  triggerCount: number
}

export interface RuleConditionItem {
  id: string
  field: string
  operator: RuleCondition
  value: any
}

export interface RuleActionItem {
  id: string
  action: RuleAction
  parameters: Record<string, any>
}

// New Task Form Data
export interface NewTaskFormData {
  title: string
  description: string
  priority: TaskPriority
  category: TaskCategory
  dueDate?: Date
  startDate?: Date
  tags: string[]
  assignedTo?: string
  estimatedHours?: number
  completionPercentage?: number
  blockedBy?: string[]
}
