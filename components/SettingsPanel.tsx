import { useState, useEffect } from 'react'
import { X, User, Bell, Palette, Brain, Download, Upload, Trash2, Save } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from './auth/AuthGuard'
import type { UserSettings } from '../lib/supabase'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen && user) {
      loadSettings()
    }
  }, [isOpen, user])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user!.id)
        .single()

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error
      }

      if (data) {
        setSettings(data)
      } else {
        // Create default settings
        const defaultSettings: Partial<UserSettings> = {
          user_id: user!.id,
          daily_task_summary: true,
          email_time: '09:00',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          default_note_color: '#FFFACD',
          auto_ai_processing: true
        }

        const { data: newSettings, error: createError } = await supabase
          .from('user_settings')
          .insert([defaultSettings])
          .select()
          .single()

        if (createError) throw createError
        setSettings(newSettings)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    if (!settings) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('user_settings')
        .update(settings)
        .eq('user_id', user!.id)

      if (error) throw error
      
      // Show success message
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const exportData = async () => {
    try {
      // Export notes
      const { data: notes, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user!.id)

      if (notesError) throw notesError

      // Export tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user!.id)

      if (tasksError) throw tasksError

      const exportData = {
        notes,
        tasks,
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0'
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tilenotes-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export data. Please try again.')
    }
  }

  const deleteAllData = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete ALL your data? This action cannot be undone.\n\nThis will delete:\n- All notes\n- All tasks\n- All settings\n\nType "DELETE" to confirm.'
    )

    if (!confirmed) return

    const confirmation = prompt('Type "DELETE" to confirm:')
    if (confirmation !== 'DELETE') return

    try {
      // Delete in order due to foreign key constraints
      await supabase.from('tasks').delete().eq('user_id', user!.id)
      await supabase.from('notes').delete().eq('user_id', user!.id)
      await supabase.from('user_settings').delete().eq('user_id', user!.id)
      
      alert('All data has been deleted.')
      window.location.reload()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete data. Please try again.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-black">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Profile Section */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <User size={20} />
                  <h3 className="text-lg font-semibold">Profile</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">User ID:</span>
                      <p className="font-mono text-xs">{user?.id}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Bell size={20} />
                  <h3 className="text-lg font-semibold">Notifications</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Daily Task Summary</p>
                      <p className="text-sm text-gray-600">Receive daily email with your tasks</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings?.daily_task_summary || false}
                        onChange={(e) => setSettings(prev => prev ? { ...prev, daily_task_summary: e.target.checked } : null)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>

                  {settings?.daily_task_summary && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Time
                      </label>
                      <input
                        type="time"
                        value={settings.email_time}
                        onChange={(e) => setSettings(prev => prev ? { ...prev, email_time: e.target.value } : null)}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Appearance */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Palette size={20} />
                  <h3 className="text-lg font-semibold">Appearance</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Note Color
                  </label>
                  <div className="flex space-x-2">
                    {[
                      '#FFFACD', '#E6F3FF', '#F0FFF0', '#FFE4E1',
                      '#F0F8FF', '#FFF8DC', '#E0E6FF', '#FFE4B5'
                    ].map(color => (
                      <button
                        key={color}
                        onClick={() => setSettings(prev => prev ? { ...prev, default_note_color: color } : null)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          settings?.default_note_color === color 
                            ? 'border-black scale-110' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Settings */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Brain size={20} />
                  <h3 className="text-lg font-semibold">AI Features</h3>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto AI Processing</p>
                    <p className="text-sm text-gray-600">Automatically process new notes with AI</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings?.auto_ai_processing || false}
                      onChange={(e) => setSettings(prev => prev ? { ...prev, auto_ai_processing: e.target.checked } : null)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
              </div>

              {/* Data Management */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Download size={20} />
                  <h3 className="text-lg font-semibold">Data Management</h3>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={exportData}
                    className="flex items-center space-x-2 w-full bg-blue-50 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Download size={16} />
                    <span>Export All Data</span>
                  </button>
                  
                  <button
                    onClick={deleteAllData}
                    className="flex items-center space-x-2 w-full bg-red-50 text-red-700 px-4 py-3 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>Delete All Data</span>
                  </button>
                </div>
              </div>

              {/* App Info */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold mb-4">About TileNotes</h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>Version: 1.0.0</p>
                  <p>Built with Next.js, Supabase, and Tailwind CSS</p>
                  <p>© 2024 TileNotes - The future of note-taking</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={saveSettings}
            disabled={saving || !settings}
            className="flex items-center space-x-2 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
