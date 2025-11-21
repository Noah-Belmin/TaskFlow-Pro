import type { Task, AutomationRule, RuleConditionItem, RuleActionItem } from '../types'

/**
 * Automation Engine - Evaluates and executes automation rules when tasks change
 */

interface TaskChange {
  oldTask?: Task
  newTask: Task
  changedFields: Set<string>
}

/**
 * Evaluate a single condition against a task
 */
function evaluateCondition(task: Task, condition: RuleConditionItem): boolean {
  const { field, operator, value } = condition

  // Get the field value from the task
  let taskValue: any
  switch (field) {
    case 'status':
      taskValue = task.status
      break
    case 'priority':
      taskValue = task.priority
      break
    case 'category':
      taskValue = task.category
      break
    case 'assignedTo':
      taskValue = task.assignedTo
      break
    case 'tags':
      taskValue = task.tags
      break
    case 'completionPercentage':
      taskValue = task.completionPercentage
      break
    case 'estimatedHours':
      taskValue = task.estimatedHours
      break
    default:
      taskValue = (task as any)[field]
  }

  // Evaluate based on operator
  switch (operator) {
    case 'equals':
      return taskValue === value

    case 'not_equals':
      return taskValue !== value

    case 'greater_than':
      return Number(taskValue) > Number(value)

    case 'less_than':
      return Number(taskValue) < Number(value)

    case 'contains':
      if (Array.isArray(taskValue)) {
        return taskValue.includes(value)
      }
      return String(taskValue).toLowerCase().includes(String(value).toLowerCase())

    default:
      return false
  }
}

/**
 * Check if all conditions of a rule are met
 */
function evaluateConditions(task: Task, conditions: RuleConditionItem[]): boolean {
  if (conditions.length === 0) return true
  return conditions.every(condition => evaluateCondition(task, condition))
}

/**
 * Apply a single action to a task
 */
function applyAction(task: Task, action: RuleActionItem): Partial<Task> {
  const { action: actionType, parameters } = action
  const updates: Partial<Task> = {}

  switch (actionType) {
    case 'set_status':
      if (parameters.status) {
        updates.status = parameters.status
      }
      break

    case 'set_priority':
      if (parameters.priority) {
        updates.priority = parameters.priority
      }
      break

    case 'assign_to':
      if (parameters.assignedTo !== undefined) {
        updates.assignedTo = parameters.assignedTo
      }
      break

    case 'add_tag':
      if (parameters.tag) {
        const currentTags = task.tags || []
        if (!currentTags.includes(parameters.tag)) {
          updates.tags = [...currentTags, parameters.tag]
        }
      }
      break

    case 'send_notification':
      // For now, just log to console. In a real app, this would trigger a notification
      console.log(`[Automation] Notification: ${parameters.message || 'Task automation triggered'}`)
      break
  }

  return updates
}

/**
 * Check if a rule's trigger matches the task change
 */
function shouldTriggerRule(rule: AutomationRule, change: TaskChange): boolean {
  const { trigger } = rule
  const { oldTask, newTask, changedFields } = change

  if (!rule.enabled) return false

  switch (trigger) {
    case 'status_changed':
      return changedFields.has('status') && oldTask?.status !== newTask.status

    case 'priority_changed':
      return changedFields.has('priority') && oldTask?.priority !== newTask.priority

    case 'assigned':
      return changedFields.has('assignedTo') && oldTask?.assignedTo !== newTask.assignedTo && !!newTask.assignedTo

    case 'created':
      return !oldTask // New task created

    case 'due_date_approaching':
      // Check if due date is within the next 24 hours
      if (newTask.dueDate) {
        const now = new Date()
        const dueDate = new Date(newTask.dueDate)
        const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)
        return hoursUntilDue > 0 && hoursUntilDue <= 24
      }
      return false

    default:
      return false
  }
}

/**
 * Get changed fields between old and new task
 */
function getChangedFields(oldTask: Task | undefined, newTask: Task): Set<string> {
  const changed = new Set<string>()

  if (!oldTask) {
    return new Set(['created'])
  }

  const fieldsToCheck = [
    'status', 'priority', 'category', 'assignedTo', 'dueDate', 'startDate',
    'completionPercentage', 'estimatedHours', 'title', 'description'
  ]

  fieldsToCheck.forEach(field => {
    if ((oldTask as any)[field] !== (newTask as any)[field]) {
      changed.add(field)
    }
  })

  return changed
}

/**
 * Execute automation rules for a task change
 * Returns the updated task with any automation-applied changes
 */
export function executeAutomationRules(
  oldTask: Task | undefined,
  newTask: Task,
  rules: AutomationRule[]
): { task: Task; triggeredRules: string[] } {
  const changedFields = getChangedFields(oldTask, newTask)
  const change: TaskChange = { oldTask, newTask, changedFields }

  let updatedTask = { ...newTask }
  const triggeredRules: string[] = []

  // Sort rules by priority/creation date
  const sortedRules = [...rules].sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  for (const rule of sortedRules) {
    // Check if rule should trigger
    if (!shouldTriggerRule(rule, change)) continue

    // Check if conditions are met
    if (!evaluateConditions(updatedTask, rule.conditions)) continue

    // Apply all actions
    let ruleUpdates: Partial<Task> = {}
    for (const action of rule.actions) {
      const actionUpdates = applyAction(updatedTask, action)
      ruleUpdates = { ...ruleUpdates, ...actionUpdates }
    }

    // Apply the updates
    if (Object.keys(ruleUpdates).length > 0) {
      updatedTask = { ...updatedTask, ...ruleUpdates }
      triggeredRules.push(rule.id)
      console.log(`[Automation] Rule "${rule.name}" triggered and applied:`, ruleUpdates)
    }
  }

  return { task: updatedTask, triggeredRules }
}

/**
 * Update rule trigger count
 */
export function updateRuleTriggerCount(
  rules: AutomationRule[],
  triggeredRuleIds: string[]
): AutomationRule[] {
  if (triggeredRuleIds.length === 0) return rules

  return rules.map(rule => {
    if (triggeredRuleIds.includes(rule.id)) {
      return {
        ...rule,
        triggerCount: rule.triggerCount + 1,
        lastTriggered: new Date(),
        updatedAt: new Date()
      }
    }
    return rule
  })
}
