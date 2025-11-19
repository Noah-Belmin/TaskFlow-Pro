/**
 * GlobalSearch Component
 *
 * Fast, comprehensive search across all task fields.
 * Searches: title, description, tags, assignee, category, status, priority
 * Features keyboard shortcut (Cmd/Ctrl + K) for quick access.
 */

import { useState, useEffect, useRef } from 'react'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import type { Task } from '../types'
import { formatDate, getPriorityColor, getStatusColor } from '../utils'
import { Search, X } from 'lucide-react'

interface GlobalSearchProps {
  tasks: Task[]
  onTaskSelect: (task: Task) => void
}

export default function GlobalSearch({ tasks, onTaskSelect }: GlobalSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Task[]>([])
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Search algorithm - multi-field fuzzy search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const query = searchQuery.toLowerCase()

    const results = tasks.filter(task => {
      // Search in multiple fields
      const titleMatch = task.title.toLowerCase().includes(query)
      const descriptionMatch = task.description.toLowerCase().includes(query)
      const tagsMatch = task.tags.some(tag => tag.toLowerCase().includes(query))
      const assigneeMatch = task.assignedTo?.toLowerCase().includes(query)
      const categoryMatch = task.category.toLowerCase().includes(query)
      const statusMatch = task.status.toLowerCase().includes(query)
      const priorityMatch = task.priority.toLowerCase().includes(query)

      return (
        titleMatch ||
        descriptionMatch ||
        tagsMatch ||
        assigneeMatch ||
        categoryMatch ||
        statusMatch ||
        priorityMatch
      )
    })

    // Relevance scoring - title matches first
    const sortedResults = results.sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(query)
      const bTitle = b.title.toLowerCase().includes(query)
      if (aTitle && !bTitle) return -1
      if (!aTitle && bTitle) return 1
      return 0
    })

    setSearchResults(sortedResults.slice(0, 10)) // Limit to 10 results
    setShowResults(sortedResults.length > 0)
    setSelectedIndex(0)
  }, [searchQuery, tasks])

  // Keyboard navigation in results
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (searchResults[selectedIndex]) {
        handleSelectTask(searchResults[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      setShowResults(false)
      searchInputRef.current?.blur()
    }
  }

  const handleSelectTask = (task: Task) => {
    onTaskSelect(task)
    setSearchQuery('')
    setShowResults(false)
    searchInputRef.current?.blur()
  }

  const handleClear = () => {
    setSearchQuery('')
    setShowResults(false)
    setSelectedIndex(0)
  }

  return (
    <div className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Search tasks... (⌘K or Ctrl+K)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchQuery && setShowResults(true)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowResults(false)}
          />

          {/* Results */}
          <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-40 max-h-[400px] overflow-y-auto">
            <div className="p-2">
              <p className="text-xs text-slate-500 px-3 py-2">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
              </p>
              <div className="space-y-1">
                {searchResults.map((task, index) => (
                  <button
                    key={task.id}
                    onClick={() => handleSelectTask(task)}
                    className={`
                      w-full text-left p-3 rounded-md transition-colors
                      ${index === selectedIndex ? 'bg-blue-50' : 'hover:bg-slate-50'}
                    `}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <h4 className="font-medium text-sm truncate">{task.title}</h4>

                        {/* Description Preview */}
                        {task.description && (
                          <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                            {task.description}
                          </p>
                        )}

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge className={`${getStatusColor(task.status)} text-xs`}>
                            {task.status}
                          </Badge>
                          <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
                            {task.priority}
                          </Badge>
                          {task.dueDate && (
                            <span className="text-xs text-slate-500">
                              Due: {formatDate(task.dueDate)}
                            </span>
                          )}
                          {task.assignedTo && (
                            <span className="text-xs text-slate-500">
                              @{task.assignedTo}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
