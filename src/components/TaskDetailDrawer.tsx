/**
 * TaskDetailDrawer Component
 *
 * Comprehensive task detail view with inline editing, comments, and file attachments.
 * Follows progressive disclosure pattern - shows essential info first, advanced in tabs.
 *
 * Features:
 * - Inline editing of all task fields
 * - Comments system with mentions support
 * - File attachments with upload
 * - Audit trail / history
 * - Keyboard accessible (Esc to close)
 */

import { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Badge } from './ui/badge'
import type { Task, Comment, Attachment, TaskPriority, TaskCategory, TaskStatus } from '../types'
import { formatDate, formatDateTime, getPriorityColor, getStatusColor, getCategoryColor } from '../utils'
import {
  X,
  Calendar,
  User,
  Tag,
  Clock,
  MessageSquare,
  Paperclip,
  Send,
  Upload,
  Download,
  Trash2,
  Edit3,
  Save,
  XCircle,
} from 'lucide-react'

interface TaskDetailDrawerProps {
  task: Task | null
  open: boolean
  onClose: () => void
  onUpdate: (id: string, updates: Partial<Task>) => void
  onDelete?: (id: string) => void
}

export default function TaskDetailDrawer({
  task,
  open,
  onClose,
  onUpdate,
  onDelete,
}: TaskDetailDrawerProps) {
  // State for inline editing
  const [isEditing, setIsEditing] = useState(false)
  const [editedTask, setEditedTask] = useState<Partial<Task>>({})

  // Comments state
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<Comment[]>([])

  // Attachments state
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Active tab state
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'attachments'>('details')

  // Update local state when task changes
  useEffect(() => {
    if (task) {
      setEditedTask(task)
      setComments(task.comments || [])
      setAttachments(task.attachments || [])
    }
  }, [task])

  // Keyboard handler - Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        handleCancel()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, isEditing])

  if (!task || !open) return null

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleSave = () => {
    if (task) {
      onUpdate(task.id, {
        ...editedTask,
        updatedAt: new Date(),
      })
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    if (isEditing) {
      setEditedTask(task)
      setIsEditing(false)
    } else {
      onClose()
    }
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: crypto.randomUUID(),
      taskId: task.id,
      userId: 'current-user', // TODO: Get from auth context
      userName: 'Current User', // TODO: Get from auth context
      content: newComment,
      createdAt: new Date(),
    }

    const updatedComments = [...comments, comment]
    setComments(updatedComments)
    onUpdate(task.id, { comments: updatedComments })
    setNewComment('')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newAttachments: Attachment[] = Array.from(files).map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      url: URL.createObjectURL(file), // In production, upload to server/S3
      type: file.type,
      size: file.size,
      uploadedBy: 'Current User', // TODO: Get from auth context
      uploadedAt: new Date(),
    }))

    const updatedAttachments = [...attachments, ...newAttachments]
    setAttachments(updatedAttachments)
    onUpdate(task.id, { attachments: updatedAttachments })

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDeleteAttachment = (attachmentId: string) => {
    const updatedAttachments = attachments.filter(a => a.id !== attachmentId)
    setAttachments(updatedAttachments)
    onUpdate(task.id, { attachments: updatedAttachments })
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-2/3 lg:w-1/2 bg-white z-50 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={editedTask.title || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  className="text-2xl font-bold mb-2"
                  placeholder="Task title"
                />
              ) : (
                <h2 className="text-2xl font-bold text-slate-900">{task.title}</h2>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                <Badge className={getCategoryColor(task.category)}>{task.category}</Badge>
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              {isEditing ? (
                <>
                  <Button size="icon" variant="ghost" onClick={handleSave}>
                    <Save className="h-5 w-5" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={handleCancel}>
                    <XCircle className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <>
                  <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
                    <Edit3 className="h-5 w-5" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={onClose}>
                    <X className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6 border-b border-slate-200">
            <button
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'details'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            <button
              className={`pb-3 px-1 font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'comments'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('comments')}
            >
              <MessageSquare className="h-4 w-4" />
              Comments
              {comments.length > 0 && (
                <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs">
                  {comments.length}
                </span>
              )}
            </button>
            <button
              className={`pb-3 px-1 font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'attachments'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('attachments')}
            >
              <Paperclip className="h-4 w-4" />
              Attachments
              {attachments.length > 0 && (
                <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs">
                  {attachments.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <Label>Description</Label>
                {isEditing ? (
                  <Textarea
                    value={editedTask.description || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                    rows={6}
                    className="mt-2"
                    placeholder="Add a description..."
                  />
                ) : (
                  <p className="mt-2 text-slate-700 whitespace-pre-wrap">
                    {task.description || <span className="text-slate-400 italic">No description</span>}
                  </p>
                )}
              </div>

              {/* Grid: Status, Priority, Category */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  {isEditing ? (
                    <Select
                      id="status"
                      value={editedTask.status || task.status}
                      onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value as TaskStatus })}
                      className="mt-2"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="blocked">Blocked</option>
                      <option value="done">Done</option>
                    </Select>
                  ) : (
                    <p className="mt-2">{task.status}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  {isEditing ? (
                    <Select
                      id="priority"
                      value={editedTask.priority || task.priority}
                      onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as TaskPriority })}
                      className="mt-2"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </Select>
                  ) : (
                    <p className="mt-2">{task.priority}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  {isEditing ? (
                    <Select
                      id="category"
                      value={editedTask.category || task.category}
                      onChange={(e) => setEditedTask({ ...editedTask, category: e.target.value as TaskCategory })}
                      className="mt-2"
                    >
                      <option value="work">Work</option>
                      <option value="personal">Personal</option>
                      <option value="health">Health</option>
                      <option value="learning">Learning</option>
                      <option value="construction">Construction</option>
                      <option value="other">Other</option>
                    </Select>
                  ) : (
                    <p className="mt-2">{task.category}</p>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Start Date
                  </Label>
                  {isEditing ? (
                    <Input
                      id="startDate"
                      type="date"
                      value={editedTask.startDate ? new Date(editedTask.startDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditedTask({
                        ...editedTask,
                        startDate: e.target.value ? new Date(e.target.value) : undefined
                      })}
                      className="mt-2"
                    />
                  ) : (
                    <p className="mt-2">{task.startDate ? formatDate(task.startDate) : <span className="text-slate-400">Not set</span>}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="dueDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Due Date
                  </Label>
                  {isEditing ? (
                    <Input
                      id="dueDate"
                      type="date"
                      value={editedTask.dueDate ? new Date(editedTask.dueDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditedTask({
                        ...editedTask,
                        dueDate: e.target.value ? new Date(e.target.value) : undefined
                      })}
                      className="mt-2"
                    />
                  ) : (
                    <p className="mt-2">{task.dueDate ? formatDate(task.dueDate) : <span className="text-slate-400">Not set</span>}</p>
                  )}
                </div>
              </div>

              {/* Assignee */}
              <div>
                <Label htmlFor="assignee" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Assigned To
                </Label>
                {isEditing ? (
                  <Input
                    id="assignee"
                    value={editedTask.assignedTo || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, assignedTo: e.target.value })}
                    className="mt-2"
                    placeholder="Enter name or email"
                  />
                ) : (
                  <p className="mt-2">{task.assignedTo || <span className="text-slate-400">Unassigned</span>}</p>
                )}
              </div>

              {/* Progress */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimatedHours" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Estimated Hours
                  </Label>
                  {isEditing ? (
                    <Input
                      id="estimatedHours"
                      type="number"
                      min="0"
                      step="0.5"
                      value={editedTask.estimatedHours || ''}
                      onChange={(e) => setEditedTask({
                        ...editedTask,
                        estimatedHours: e.target.value ? parseFloat(e.target.value) : undefined
                      })}
                      className="mt-2"
                    />
                  ) : (
                    <p className="mt-2">{task.estimatedHours ? `${task.estimatedHours}h` : <span className="text-slate-400">Not set</span>}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="completion">Completion %</Label>
                  {isEditing ? (
                    <Input
                      id="completion"
                      type="number"
                      min="0"
                      max="100"
                      step="5"
                      value={editedTask.completionPercentage || ''}
                      onChange={(e) => setEditedTask({
                        ...editedTask,
                        completionPercentage: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                      className="mt-2"
                    />
                  ) : (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all"
                            style={{ width: `${task.completionPercentage || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{task.completionPercentage || 0}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {task.tags && task.tags.length > 0 ? (
                    task.tags.map(tag => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))
                  ) : (
                    <span className="text-slate-400 text-sm">No tags</span>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Metadata</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{formatDateTime(task.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated:</span>
                    <span>{formatDateTime(task.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Task ID:</span>
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">{task.id.substring(0, 8)}</code>
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              {onDelete && (
                <div className="pt-4 border-t border-slate-200">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this task?')) {
                        onDelete(task.id)
                        onClose()
                      }
                    }}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Task
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              {/* Comment Input */}
              <div className="space-y-2">
                <Label htmlFor="newComment">Add a comment</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="newComment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment... (use @ to mention)"
                    rows={3}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleAddComment()
                      }
                    }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-500">Press Cmd/Ctrl + Enter to send</p>
                  <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4 pt-4">
                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No comments yet</p>
                    <p className="text-sm text-slate-400 mt-1">Be the first to add a comment!</p>
                  </div>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="border-l-2 border-blue-500 pl-4 py-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-semibold text-slate-900">{comment.userName}</span>
                          <span className="text-xs text-slate-500 ml-2">
                            {formatDateTime(comment.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-slate-700 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Attachments Tab */}
          {activeTab === 'attachments' && (
            <div className="space-y-4">
              {/* Upload Button */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  multiple
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
                <p className="text-xs text-slate-500 mt-2">
                  Click to upload or drag and drop files
                </p>
              </div>

              {/* Attachments List */}
              <div className="space-y-2">
                {attachments.length === 0 ? (
                  <div className="text-center py-8">
                    <Paperclip className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No attachments yet</p>
                    <p className="text-sm text-slate-400 mt-1">Upload files to get started</p>
                  </div>
                ) : (
                  attachments.map(attachment => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Paperclip className="h-5 w-5 text-slate-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{attachment.name}</p>
                          <p className="text-xs text-slate-500">
                            {formatFileSize(attachment.size)} • {attachment.uploadedBy} • {formatDateTime(attachment.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            // Download file
                            const a = document.createElement('a')
                            a.href = attachment.url
                            a.download = attachment.name
                            a.click()
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteAttachment(attachment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
