import { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import type { CostItem, UserProfile } from '../types'
import { DollarSign, Plus, Trash2, Receipt, TrendingUp, TrendingDown } from 'lucide-react'
import { formatDate } from '../utils'

interface CostTrackingProps {
  estimatedCost?: number
  costBreakdown: CostItem[]
  billable?: boolean
  onUpdateEstimatedCost: (cost: number) => void
  onUpdateBillable: (billable: boolean) => void
  onAddCostItem: (item: Omit<CostItem, 'id'>) => void
  onDeleteCostItem: (id: string) => void
}

export default function CostTracking({
  estimatedCost = 0,
  costBreakdown,
  billable = false,
  onUpdateEstimatedCost,
  onUpdateBillable,
  onAddCostItem,
  onDeleteCostItem,
}: CostTrackingProps) {
  const [isAddingCost, setIsAddingCost] = useState(false)
  const [newCost, setNewCost] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [currency, setCurrency] = useState<string>('USD')

  useEffect(() => {
    // Load currency from user profile settings
    const savedProfile = localStorage.getItem('taskflow-user-profile')
    if (savedProfile) {
      try {
        const profile: UserProfile = JSON.parse(savedProfile)
        setCurrency(profile.currency || 'USD')
      } catch (error) {
        console.error('Error loading currency from profile:', error)
      }
    }
  }, [])

  const totalActual = costBreakdown.reduce((sum, item) => sum + item.amount, 0)
  const variance = estimatedCost - totalActual
  const variancePercentage = estimatedCost > 0 ? (variance / estimatedCost) * 100 : 0

  const handleAddCost = () => {
    if (!newCost.description || !newCost.amount || !newCost.category) return

    onAddCostItem({
      description: newCost.description,
      amount: parseFloat(newCost.amount),
      date: new Date(newCost.date),
      category: newCost.category,
    })

    setNewCost({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
    })
    setIsAddingCost(false)
  }

  const getCategoryBreakdown = () => {
    const breakdown: Record<string, number> = {}
    costBreakdown.forEach((item) => {
      breakdown[item.category] = (breakdown[item.category] || 0) + item.amount
    })
    return Object.entries(breakdown).map(([category, amount]) => ({ category, amount }))
  }

  const formatCurrency = (amount: number) => {
    // Get locale based on currency
    const localeMap: Record<string, string> = {
      USD: 'en-US',
      EUR: 'de-DE',
      GBP: 'en-GB',
      JPY: 'ja-JP',
      CAD: 'en-CA',
      AUD: 'en-AU',
      CHF: 'de-CH',
      CNY: 'zh-CN',
      INR: 'en-IN',
    }

    return new Intl.NumberFormat(localeMap[currency] || 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold dark:text-slate-100">Estimated Cost</h3>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="decimal"
              value={estimatedCost || ''}
              onChange={(e) => onUpdateEstimatedCost(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="text-2xl font-bold h-auto py-1"
              min="0"
              step="0.01"
            />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold dark:text-slate-100">Actual Cost</h3>
          </div>
          <p className="text-2xl font-bold dark:text-slate-100">{formatCurrency(totalActual)}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {costBreakdown.length} item{costBreakdown.length !== 1 ? 's' : ''}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            {variance >= 0 ? (
              <TrendingDown className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingUp className="h-5 w-5 text-red-500" />
            )}
            <h3 className="font-semibold dark:text-slate-100">Variance</h3>
          </div>
          <p
            className={`text-2xl font-bold ${
              variance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatCurrency(Math.abs(variance))}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {variance >= 0 ? 'Under' : 'Over'} budget by {Math.abs(variancePercentage).toFixed(1)}%
          </p>
        </Card>
      </div>

      {/* Billable Toggle */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold dark:text-slate-100">Billable</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Mark this task as billable to client
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={billable}
              onChange={(e) => onUpdateBillable(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </Card>

      {/* Category Breakdown */}
      {getCategoryBreakdown().length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3 dark:text-slate-100">Cost by Category</h3>
          <div className="space-y-2">
            {getCategoryBreakdown().map(({ category, amount }) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm dark:text-slate-300">{category}</span>
                <Badge variant="secondary">{formatCurrency(amount)}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add Cost Item */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold dark:text-slate-100">Cost Items</h3>
          <Button
            size="sm"
            onClick={() => setIsAddingCost(!isAddingCost)}
            variant={isAddingCost ? 'outline' : 'default'}
          >
            {isAddingCost ? 'Cancel' : <><Plus className="h-4 w-4 mr-1" /> Add Item</>}
          </Button>
        </div>

        {isAddingCost && (
          <div className="mb-4 p-3 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Description</Label>
                <Input
                  value={newCost.description}
                  onChange={(e) => setNewCost({ ...newCost, description: e.target.value })}
                  placeholder="e.g., Materials, Labor"
                />
              </div>
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={newCost.amount}
                  onChange={(e) => setNewCost({ ...newCost, amount: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Input
                  value={newCost.category}
                  onChange={(e) => setNewCost({ ...newCost, category: e.target.value })}
                  placeholder="e.g., Materials, Labor, Equipment"
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newCost.date}
                  onChange={(e) => setNewCost({ ...newCost, date: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleAddCost} className="w-full">
              Add Cost Item
            </Button>
          </div>
        )}

        {/* Cost Items List */}
        <div className="space-y-2">
          {costBreakdown.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No cost items yet</p>
            </div>
          ) : (
            costBreakdown.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium dark:text-slate-100">{item.description}</h4>
                    <Badge variant="outline">{item.category}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(item.date)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-lg dark:text-slate-100">
                    {formatCurrency(item.amount)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteCostItem(item.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
