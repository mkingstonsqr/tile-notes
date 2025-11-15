import { useState, useEffect } from 'react'
import { CheckCircle, Circle, Plus, Trash2, Calendar, Clock, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from './auth/AuthGuard'
import type { Task } from '../lib/supabase'

interface TaskManagerProps {
  noteId?: string
}

export default function TaskManager({ noteId }: TaskManagerProps) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [showAddTask, setShowAddTask] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all')

  useEffect(() => {
    if (user) {
      loadTasks()
    }
  }, [user, noteId])

  const loadTasks = async () => {
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (noteId) {
        query = query.eq('note_id', noteId)
      }

      const { data, error } = await query

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTask = async () => {
    if (!newTaskTitle.trim()) return

    try {
      const taskData: Partial<Task> = {
        user_id: user!.id,
        note_id: noteId,
        title: newTaskTitle.trim(),
        is_completed: false,
        priority: 'medium' as 'low' | 'medium' | 'high'
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single()

      if (error) throw error

      setTasks(prev => [data, ...prev])
      setNewTaskTitle('')
      setShowAddTask(false)
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      const updates: Partial<Task> = {
        is_completed: completed,
        completed_at: completed ? new Date().toISOString() : undefined
      }

      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)

      if (error) throw error

      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, ...updates }
          : task
      ))
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      setTasks(prev => prev.filter(task => task.id !== taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const updateTaskDueDate = async (taskId: string, dueDate: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ due_date: dueDate })
        .eq('id', taskId)

      if (error) throw error

      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, due_date: dueDate }
          : task
      ))
    } catch (error) {
      console.error('Error updating due date:', error)
    }
  }

  const getFilteredTasks = () => {
    const now = new Date()
    
    return tasks.filter(task => {
      switch (filter) {
        case 'pending':
          return !task.is_completed
        case 'completed':
          return task.is_completed
        case 'overdue':
          return !task.is_completed && task.due_date && new Date(task.due_date) < now
        default:
          return true
      }
    })
  }

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.is_completed) return false
    return new Date(task.due_date) < new Date()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`
    
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const filteredTasks = getFilteredTasks()
  const completedCount = tasks.filter(t => t.is_completed).length
  const pendingCount = tasks.filter(t => !t.is_completed).length
  const overdueCount = tasks.filter(isOverdue).length

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-black">
            {noteId ? 'Note Tasks' : 'All Tasks'}
          </h2>
          <button
            onClick={() => setShowAddTask(!showAddTask)}
            className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>{pendingCount} pending</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>{completedCount} completed</span>
          </div>
          {overdueCount > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>{overdueCount} overdue</span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 mt-4">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'completed', label: 'Completed' },
            { key: 'overdue', label: 'Overdue' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filter === key
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Add Task Form */}
      {showAddTask && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Enter task title..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter') createTask()
                if (e.key === 'Escape') setShowAddTask(false)
              }}
              autoFocus
            />
            <button
              onClick={createTask}
              disabled={!newTaskTitle.trim()}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
            <button
              onClick={() => setShowAddTask(false)}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Circle size={48} className="mx-auto mb-4 opacity-50" />
            <p>No tasks found</p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="mt-2 text-black hover:underline"
              >
                View all tasks
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTasks.map(task => (
              <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => toggleTask(task.id, !task.is_completed)}
                    className="mt-1 text-gray-400 hover:text-black transition-colors"
                  >
                    {task.is_completed ? (
                      <CheckCircle size={20} className="text-green-500" />
                    ) : (
                      <Circle size={20} />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${
                      task.is_completed 
                        ? 'text-gray-500 line-through' 
                        : isOverdue(task)
                        ? 'text-red-600'
                        : 'text-gray-900'
                    }`}>
                      {task.title}
                    </div>
                    
                    {task.description && (
                      <div className="text-sm text-gray-600 mt-1">
                        {task.description}
                      </div>
                    )}

                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      {task.due_date && (
                        <div className={`flex items-center space-x-1 ${
                          isOverdue(task) ? 'text-red-600' : ''
                        }`}>
                          {isOverdue(task) ? (
                            <AlertCircle size={12} />
                          ) : (
                            <Calendar size={12} />
                          )}
                          <span>{formatDate(task.due_date)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-1">
                        <Clock size={12} />
                        <span>
                          Created {new Date(task.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      value={task.due_date?.split('T')[0] || ''}
                      onChange={(e) => updateTaskDueDate(task.id, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    />
                    
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
