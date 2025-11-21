import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import type { UserProfile } from '../types'
import { User, Upload, Download, Save, Settings as SettingsIcon, Database, Cloud, HardDrive } from 'lucide-react'

const DEFAULT_PROFILE: UserProfile = {
  name: 'Current User',
  email: '',
  role: '',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  currency: 'USD'
}

export default function SettingsView() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load user profile from localStorage
    const savedProfile = localStorage.getItem('taskflow-user-profile')
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile))
      } catch (error) {
        console.error('Error loading profile:', error)
      }
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('taskflow-user-profile', JSON.stringify(profile))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string
        const lines = csv.split('\n')
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase())

        const tasks = lines.slice(1)
          .filter(line => line.trim())
          .map((line, index) => {
            const values = line.split(',').map(v => v.trim())
            const task: any = {
              id: crypto.randomUUID(),
              createdAt: new Date(),
              updatedAt: new Date(),
              comments: [],
              attachments: [],
              checklist: [],
              subtasks: [],
              customFields: {},
              blockedBy: [],
              tags: []
            }

            headers.forEach((header, i) => {
              const value = values[i] || ''

              switch (header) {
                case 'title':
                  task.title = value
                  break
                case 'description':
                  task.description = value
                  break
                case 'status':
                  task.status = value || 'todo'
                  break
                case 'priority':
                  task.priority = value || 'medium'
                  break
                case 'category':
                  task.category = value || 'other'
                  break
                case 'assignedto':
                case 'assigned_to':
                case 'assigned to':
                  task.assignedTo = value
                  break
                case 'duedate':
                case 'due_date':
                case 'due date':
                  if (value) {
                    task.dueDate = new Date(value)
                  }
                  break
                case 'startdate':
                case 'start_date':
                case 'start date':
                  if (value) {
                    task.startDate = new Date(value)
                  }
                  break
                case 'estimatedhours':
                case 'estimated_hours':
                case 'estimated hours':
                  task.estimatedHours = parseFloat(value) || 0
                  break
                case 'tags':
                  task.tags = value.split(';').map((t: string) => t.trim()).filter(Boolean)
                  break
                case 'completionpercentage':
                case 'completion_percentage':
                case 'completion':
                  task.completionPercentage = parseInt(value) || 0
                  break
              }
            })

            // Validate required fields
            if (!task.title) {
              console.warn(`Skipping row ${index + 2}: missing title`)
              return null
            }

            return task
          })
          .filter(Boolean)

        if (tasks.length > 0) {
          const confirmImport = window.confirm(
            `Import ${tasks.length} tasks? This will add to your existing tasks.`
          )

          if (confirmImport) {
            // Load existing data
            const existingDataStr = localStorage.getItem('taskflow-pro-data')
            let existingData: { tasks: any[], categories: string[] } = { tasks: [], categories: ['work', 'personal', 'health', 'learning', 'construction', 'other'] }

            if (existingDataStr) {
              try {
                existingData = JSON.parse(existingDataStr)
              } catch (e) {
                console.error('Error parsing existing data:', e)
              }
            }

            // Merge tasks
            existingData.tasks = [...(existingData.tasks || []), ...(tasks as any[])]

            // Save
            localStorage.setItem('taskflow-pro-data', JSON.stringify(existingData))

            alert(`Successfully imported ${tasks.length} tasks!`)
            window.location.reload()
          }
        } else {
          alert('No valid tasks found in CSV file.')
        }
      } catch (error) {
        console.error('Error importing CSV:', error)
        alert('Error importing CSV. Please check the file format.')
      }
    }

    reader.readAsText(file)
  }

  const downloadCSVTemplate = () => {
    const template = `title,description,status,priority,category,assignedTo,dueDate,startDate,estimatedHours,tags,completionPercentage
Sample Task,Task description,todo,high,work,John Doe,2025-12-31,2025-11-20,8,tag1;tag2,0
Another Task,Another description,in-progress,medium,personal,Jane Smith,2025-12-25,2025-11-18,4,tag3,50`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'taskflow-import-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage your profile and application preferences</p>
      </div>

      {/* User Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle>User Profile</CardTitle>
          </div>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role / Title (Optional)</Label>
            <Input
              id="role"
              placeholder="Project Manager"
              value={profile.role || ''}
              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select
                id="dateFormat"
                value={profile.dateFormat}
                onChange={(e) => setProfile({ ...profile, dateFormat: e.target.value as UserProfile['dateFormat'] })}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeFormat">Time Format</Label>
              <Select
                id="timeFormat"
                value={profile.timeFormat}
                onChange={(e) => setProfile({ ...profile, timeFormat: e.target.value as UserProfile['timeFormat'] })}
              >
                <option value="12h">12 Hour (AM/PM)</option>
                <option value="24h">24 Hour</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                placeholder="UTC"
                value={profile.timezone || ''}
                onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                id="currency"
                value={profile.currency || 'USD'}
                onChange={(e) => setProfile({ ...profile, currency: e.target.value as UserProfile['currency'] })}
              >
                <option value="USD">🇺🇸 USD - US Dollar</option>
                <option value="EUR">🇪🇺 EUR - Euro</option>
                <option value="GBP">🇬🇧 GBP - British Pound</option>
                <option value="JPY">🇯🇵 JPY - Japanese Yen</option>
                <option value="CAD">🇨🇦 CAD - Canadian Dollar</option>
                <option value="AUD">🇦🇺 AUD - Australian Dollar</option>
                <option value="CHF">🇨🇭 CHF - Swiss Franc</option>
                <option value="CNY">🇨🇳 CNY - Chinese Yuan</option>
                <option value="INR">🇮🇳 INR - Indian Rupee</option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              {saved ? 'Saved!' : 'Save Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CSV Import/Export */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <CardTitle>Data Management</CardTitle>
          </div>
          <CardDescription>Import and export your tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* CSV Import */}
          <div>
            <h3 className="font-semibold text-lg mb-2 dark:text-slate-100">Import Tasks from CSV</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Upload a CSV file with your tasks. The file should include columns like title, description, status, priority, category, etc.
            </p>
            <div className="flex gap-2">
              <label className="cursor-pointer">
                <Button variant="outline" className="gap-2" type="button">
                  <Upload className="h-4 w-4" />
                  Choose CSV File
                </Button>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleImportCSV}
                />
              </label>
              <Button variant="outline" onClick={downloadCSVTemplate} className="gap-2">
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h3 className="font-semibold text-lg mb-2 dark:text-slate-100">CSV Format Guide</h3>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 text-sm">
              <p className="font-mono text-slate-700 dark:text-slate-300 mb-2">
                Required: title
              </p>
              <p className="font-mono text-slate-700 dark:text-slate-300 mb-2">
                Optional: description, status, priority, category, assignedTo, dueDate, startDate, estimatedHours, tags, completionPercentage
              </p>
              <p className="text-slate-600 dark:text-slate-400 mt-3">
                <strong>Status values:</strong> todo, in-progress, review, blocked, done<br />
                <strong>Priority values:</strong> low, medium, high, urgent<br />
                <strong>Date format:</strong> YYYY-MM-DD<br />
                <strong>Tags:</strong> Separate multiple tags with semicolons (e.g., "tag1;tag2;tag3")
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
            <CardTitle>Storage & Data</CardTitle>
          </div>
          <CardDescription>Current storage method and future options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Storage */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <h3 className="font-semibold dark:text-slate-100">Current Storage: Browser LocalStorage</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              All your data is currently stored in your browser's local storage. This means:
            </p>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 ml-4">
              <li>✅ Works offline and is fast</li>
              <li>✅ Your data stays on your device</li>
              <li>⚠️ Limited to this browser and device only</li>
              <li>⚠️ Data will be lost if browser data is cleared</li>
              <li>⚠️ No sync across devices or team collaboration</li>
            </ul>
          </div>

          {/* Storage Limit */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <h3 className="font-semibold dark:text-slate-100">Storage Limit</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Browser localStorage typically allows 5-10MB of data. For most users, this is sufficient for thousands of tasks.
              If you need more storage or cross-device sync, see the options below.
            </p>
          </div>

          {/* Future Options */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Cloud className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold dark:text-slate-100">Cloud Storage Options (Coming Soon)</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              We're exploring cloud storage solutions to enable:
            </p>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 ml-4 mb-3">
              <li>☁️ Automatic sync across all your devices</li>
              <li>🤝 Team collaboration features</li>
              <li>💾 Automatic cloud backups</li>
              <li>📱 Mobile app support</li>
              <li>🔄 Real-time updates</li>
            </ul>
            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Options under consideration:</strong> Firebase (real-time sync), Supabase (PostgreSQL),
                Self-hosted solutions, and hybrid approaches. See <code className="text-xs bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">STORAGE_OPTIONS.md</code> for details.
              </p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <h3 className="font-semibold mb-2 dark:text-slate-100">💡 Current Recommendations</h3>
            <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-2 ml-4 list-decimal">
              <li><strong>Backup regularly:</strong> Export your tasks using the CSV export feature above</li>
              <li><strong>Don't clear browser data:</strong> Avoid clearing your browser's cache/cookies</li>
              <li><strong>Use bookmarks:</strong> Bookmark this page to always return to your data</li>
              <li><strong>Single device:</strong> Stick to one browser/device until cloud sync is available</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
