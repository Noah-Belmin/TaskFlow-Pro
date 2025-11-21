import { useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select } from './ui/select'
import { Badge } from './ui/badge'
import type { Attachment } from '../types'
import { FileText, Image, Video, Download, Trash2, Upload, Search } from 'lucide-react'
import { formatDateTime } from '../utils'

interface DocumentManagementProps {
  attachments: Attachment[]
  onUpload: (file: File, description: string, category: Attachment['category']) => void
  onDelete: (id: string) => void
  onDownload?: (attachment: Attachment) => void
}

export default function DocumentManagement({
  attachments,
  onUpload,
  onDelete,
  onDownload,
}: DocumentManagementProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadDescription, setUploadDescription] = useState('')
  const [uploadCategory, setUploadCategory] = useState<Attachment['category']>('document')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<Attachment['category'] | 'all'>('all')

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      await onUpload(file, uploadDescription, uploadCategory)
      setUploadDescription('')
      e.target.value = '' // Reset file input
    } finally {
      setIsUploading(false)
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-5 w-5 text-blue-500" />
    if (type.startsWith('video/')) return <Video className="h-5 w-5 text-purple-500" />
    return <FileText className="h-5 w-5 text-slate-500" />
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const filteredAttachments = attachments.filter((att) => {
    const matchesSearch = att.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      att.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || att.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryColor = (category?: Attachment['category']): string => {
    switch (category) {
      case 'document':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
      case 'image':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      case 'video':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 dark:text-slate-100">Upload Document</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Description (optional)"
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
            />
            <Select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value as Attachment['category'])}
            >
              <option value="document">Document</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="other">Other</option>
            </Select>
          </div>
          <div className="flex gap-2">
            <label className="flex-1">
              <input
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isUploading}
                onClick={(e) => {
                  e.preventDefault()
                  ;(e.currentTarget.previousElementSibling as HTMLInputElement)?.click()
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Choose File'}
              </Button>
            </label>
          </div>
        </div>
      </Card>

      {/* Filter Section */}
      <Card className="p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as Attachment['category'] | 'all')}
            className="w-40"
          >
            <option value="all">All Types</option>
            <option value="document">Documents</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="other">Other</option>
          </Select>
        </div>
      </Card>

      {/* Document List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold dark:text-slate-100">
            Documents ({filteredAttachments.length})
          </h3>
        </div>

        {filteredAttachments.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 dark:text-slate-400">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No documents found</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredAttachments.map((attachment) => (
              <Card key={attachment.id} className="p-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getFileIcon(attachment.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate dark:text-slate-100">
                        {attachment.name}
                      </h4>
                      {attachment.category && (
                        <Badge className={getCategoryColor(attachment.category)}>
                          {attachment.category}
                        </Badge>
                      )}
                    </div>
                    {attachment.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        {attachment.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>{formatFileSize(attachment.size)}</span>
                      <span>•</span>
                      <span>{formatDateTime(attachment.uploadedAt)}</span>
                      <span>•</span>
                      <span>By {attachment.uploadedBy}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {onDownload && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDownload(attachment)}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(attachment.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
