import { useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Badge } from './ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import type {
  AutomationRule,
  RuleTrigger,
  RuleCondition,
  RuleAction,
  RuleConditionItem,
  RuleActionItem,
} from '../types'
import { Play, Pause, Plus, Trash2, Settings, Zap, Clock } from 'lucide-react'
import { formatDateTime } from '../utils'

interface RuleBuilderProps {
  rules: AutomationRule[]
  onCreateRule: (rule: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt' | 'triggerCount'>) => void
  onUpdateRule: (id: string, updates: Partial<AutomationRule>) => void
  onDeleteRule: (id: string) => void
  onToggleRule: (id: string, enabled: boolean) => void
}

export default function RuleBuilder({
  rules,
  onCreateRule,
  onUpdateRule,
  onDeleteRule,
  onToggleRule,
}: RuleBuilderProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingRule, setEditingRule] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger: 'status_changed' as RuleTrigger,
    conditions: [] as RuleConditionItem[],
    actions: [] as RuleActionItem[],
  })

  const triggerOptions: { value: RuleTrigger; label: string }[] = [
    { value: 'status_changed', label: 'Status Changed' },
    { value: 'priority_changed', label: 'Priority Changed' },
    { value: 'due_date_approaching', label: 'Due Date Approaching' },
    { value: 'assigned', label: 'Task Assigned' },
    { value: 'created', label: 'Task Created' },
  ]

  const conditionOperators: { value: RuleCondition; label: string }[] = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'contains', label: 'Contains' },
  ]

  const actionTypes: { value: RuleAction; label: string }[] = [
    { value: 'set_status', label: 'Set Status' },
    { value: 'set_priority', label: 'Set Priority' },
    { value: 'assign_to', label: 'Assign To' },
    { value: 'add_tag', label: 'Add Tag' },
    { value: 'send_notification', label: 'Send Notification' },
  ]

  const handleAddCondition = () => {
    setFormData({
      ...formData,
      conditions: [
        ...formData.conditions,
        {
          id: `condition-${Date.now()}`,
          field: 'status',
          operator: 'equals',
          value: '',
        },
      ],
    })
  }

  const handleRemoveCondition = (id: string) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.filter((c) => c.id !== id),
    })
  }

  const handleUpdateCondition = (id: string, updates: Partial<RuleConditionItem>) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })
  }

  const handleAddAction = () => {
    setFormData({
      ...formData,
      actions: [
        ...formData.actions,
        {
          id: `action-${Date.now()}`,
          action: 'set_status',
          parameters: {},
        },
      ],
    })
  }

  const handleRemoveAction = (id: string) => {
    setFormData({
      ...formData,
      actions: formData.actions.filter((a) => a.id !== id),
    })
  }

  const handleUpdateAction = (id: string, updates: Partial<RuleActionItem>) => {
    setFormData({
      ...formData,
      actions: formData.actions.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })
  }

  const handleSaveRule = () => {
    if (!formData.name || formData.conditions.length === 0 || formData.actions.length === 0) {
      alert('Please fill in all required fields')
      return
    }

    if (editingRule) {
      onUpdateRule(editingRule, {
        name: formData.name,
        description: formData.description,
        trigger: formData.trigger,
        conditions: formData.conditions,
        actions: formData.actions,
      })
    } else {
      onCreateRule({
        name: formData.name,
        description: formData.description,
        enabled: true,
        trigger: formData.trigger,
        conditions: formData.conditions,
        actions: formData.actions,
        lastTriggered: undefined,
      })
    }

    handleCloseDialog()
  }

  const handleCloseDialog = () => {
    setIsCreating(false)
    setEditingRule(null)
    setFormData({
      name: '',
      description: '',
      trigger: 'status_changed',
      conditions: [],
      actions: [],
    })
  }

  const handleEditRule = (rule: AutomationRule) => {
    setFormData({
      name: rule.name,
      description: rule.description || '',
      trigger: rule.trigger,
      conditions: rule.conditions,
      actions: rule.actions,
    })
    setEditingRule(rule.id)
    setIsCreating(true)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold dark:text-slate-100">Automation Rules</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create rules to automate task workflows
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Rule
        </Button>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {rules.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 dark:text-slate-400">
            <Zap className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No automation rules yet</p>
            <p className="text-sm mt-1">Create your first rule to automate task workflows</p>
          </Card>
        ) : (
          rules.map((rule) => (
            <Card key={rule.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg dark:text-slate-100">{rule.name}</h3>
                    {rule.enabled ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Disabled</Badge>
                    )}
                  </div>
                  {rule.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {rule.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      <span>
                        Trigger: {triggerOptions.find((t) => t.value === rule.trigger)?.label}
                      </span>
                    </div>
                    <span>•</span>
                    <span>{rule.conditions.length} condition(s)</span>
                    <span>•</span>
                    <span>{rule.actions.length} action(s)</span>
                  </div>
                  {rule.lastTriggered && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <Clock className="h-3 w-3" />
                      <span>Last triggered: {formatDateTime(rule.lastTriggered)}</span>
                      <span>({rule.triggerCount} times)</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onToggleRule(rule.id, !rule.enabled)}
                    title={rule.enabled ? 'Disable' : 'Enable'}
                  >
                    {rule.enabled ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditRule(rule)}
                    title="Edit"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteRule(rule.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Rule Dialog */}
      <Dialog open={isCreating} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit Rule' : 'Create New Rule'}</DialogTitle>
            <DialogDescription>
              Define conditions and actions for your automation rule
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Basic Info */}
            <div className="space-y-3">
              <div>
                <Label>Rule Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Auto-escalate urgent tasks"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <div>
                <Label>Trigger *</Label>
                <Select
                  value={formData.trigger}
                  onChange={(e) => setFormData({ ...formData, trigger: e.target.value as RuleTrigger })}
                >
                  {triggerOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Conditions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Conditions *</Label>
                <Button size="sm" variant="outline" onClick={handleAddCondition}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Condition
                </Button>
              </div>
              <div className="space-y-2">
                {formData.conditions.map((condition, index) => (
                  <div
                    key={condition.id}
                    className="flex items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {index > 0 ? 'AND' : 'IF'}
                    </span>
                    <Input
                      placeholder="Field"
                      value={condition.field}
                      onChange={(e) =>
                        handleUpdateCondition(condition.id, { field: e.target.value })
                      }
                      className="flex-1"
                    />
                    <Select
                      value={condition.operator}
                      onChange={(e) =>
                        handleUpdateCondition(condition.id, {
                          operator: e.target.value as RuleCondition,
                        })
                      }
                      className="w-40"
                    >
                      {conditionOperators.map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </Select>
                    <Input
                      placeholder="Value"
                      value={condition.value}
                      onChange={(e) =>
                        handleUpdateCondition(condition.id, { value: e.target.value })
                      }
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveCondition(condition.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                {formData.conditions.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                    Add at least one condition
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Actions *</Label>
                <Button size="sm" variant="outline" onClick={handleAddAction}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Action
                </Button>
              </div>
              <div className="space-y-2">
                {formData.actions.map((action, index) => (
                  <div
                    key={action.id}
                    className="flex items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {index + 1}.
                    </span>
                    <Select
                      value={action.action}
                      onChange={(e) =>
                        handleUpdateAction(action.id, { action: e.target.value as RuleAction })
                      }
                      className="w-48"
                    >
                      {actionTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Select>
                    <Input
                      placeholder="Value"
                      value={action.parameters.value || ''}
                      onChange={(e) =>
                        handleUpdateAction(action.id, {
                          parameters: { ...action.parameters, value: e.target.value },
                        })
                      }
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveAction(action.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                {formData.actions.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                    Add at least one action
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveRule}>
              {editingRule ? 'Update Rule' : 'Create Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
