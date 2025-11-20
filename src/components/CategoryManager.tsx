import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'
import ConfirmDialog from './ConfirmDialog'
import { X, Plus, Edit3, Trash2, Check, XCircle, Tag } from 'lucide-react'

interface CategoryManagerProps {
  open: boolean
  onClose: () => void
  categories: string[]
  onUpdateCategories: (categories: string[]) => void
}

export default function CategoryManager({
  open,
  onClose,
  categories,
  onUpdateCategories,
}: CategoryManagerProps) {
  const [localCategories, setLocalCategories] = useState<string[]>(categories)
  const [newCategory, setNewCategory] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null)

  useEffect(() => {
    setLocalCategories(categories)
  }, [categories])

  const handleAddCategory = () => {
    if (!newCategory.trim()) return

    const trimmedCategory = newCategory.trim().toLowerCase()
    if (localCategories.includes(trimmedCategory)) {
      alert('Category already exists!')
      return
    }

    const updated = [...localCategories, trimmedCategory]
    setLocalCategories(updated)
    setNewCategory('')
  }

  const handleStartEdit = (index: number) => {
    setEditingIndex(index)
    setEditValue(localCategories[index])
  }

  const handleSaveEdit = () => {
    if (editingIndex === null) return
    if (!editValue.trim()) return

    const trimmedValue = editValue.trim().toLowerCase()
    if (localCategories.includes(trimmedValue) && trimmedValue !== localCategories[editingIndex]) {
      alert('Category already exists!')
      return
    }

    const updated = [...localCategories]
    updated[editingIndex] = trimmedValue
    setLocalCategories(updated)
    setEditingIndex(null)
    setEditValue('')
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditValue('')
  }

  const handleDeleteCategory = (index: number) => {
    setCategoryToDelete(index)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (categoryToDelete === null) return

    const updated = localCategories.filter((_, i) => i !== categoryToDelete)
    setLocalCategories(updated)
    setDeleteConfirmOpen(false)
    setCategoryToDelete(null)
  }

  const handleSave = () => {
    onUpdateCategories(localCategories)
    onClose()
  }

  const handleCancel = () => {
    setLocalCategories(categories)
    setEditingIndex(null)
    setNewCategory('')
    onClose()
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        onClick={handleCancel}
      >
        {/* Modal */}
        <div
          className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Manage Categories</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Add, edit, or remove task categories</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Add New Category */}
            <div className="mb-6">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Add New Category
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter category name..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCategory()
                    }
                  }}
                  className="flex-1"
                />
                <Button onClick={handleAddCategory}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            {/* Categories List */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Current Categories ({localCategories.length})
              </label>
              <div className="space-y-2">
                {localCategories.length === 0 ? (
                  <Card className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No categories yet. Add one above to get started.
                  </Card>
                ) : (
                  localCategories.map((category, index) => (
                    <Card key={index} className="p-3">
                      {editingIndex === index ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveEdit()
                              } else if (e.key === 'Escape') {
                                handleCancelEdit()
                              }
                            }}
                            className="flex-1"
                            autoFocus
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleSaveEdit}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleCancelEdit}
                            className="text-slate-600"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                            <span className="font-medium capitalize dark:text-slate-200">{category}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleStartEdit(index)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteCategory(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete !== null ? localCategories[categoryToDelete] : ''}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false)
          setCategoryToDelete(null)
        }}
      />
    </>
  )
}
