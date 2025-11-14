import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, CalendarIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Task } from '../../lib/supabase';

interface TaskManagerProps {
  tasks: Task[];
  onTaskCreate: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
}

interface NewTaskForm {
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  reminder_time: string;
}

const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
}) => {
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTask, setNewTask] = useState<NewTaskForm>({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    reminder_time: '',
  });
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.completed) return false;
    return new Date(task.due_date) < new Date();
  };

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'pending':
        return !task.completed;
      case 'completed':
        return task.completed;
      case 'overdue':
        return isOverdue(task);
      default:
        return true;
    }
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Overdue tasks first
    const aOverdue = isOverdue(a);
    const bOverdue = isOverdue(b);
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    // Then by due date
    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
    if (a.due_date && !b.due_date) return -1;
    if (!a.due_date && b.due_date) return 1;

    // Finally by creation date
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;

    onTaskCreate({
      title: newTask.title,
      description: newTask.description,
      due_date: newTask.due_date || null,
      priority: newTask.priority,
      reminder_time: newTask.reminder_time || null,
      completed: false,
      user_id: '', // Will be set by the parent component
    });

    setNewTask({
      title: '',
      description: '',
      due_date: '',
      priority: 'medium',
      reminder_time: '',
    });
    setShowNewTaskModal(false);
  };

  const handleTaskToggle = (taskId: string, completed: boolean) => {
    onTaskUpdate(taskId, { completed });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const overdue = tasks.filter(t => isOverdue(t)).length;
    const pending = total - completed;

    return { total, completed, overdue, pending };
  };

  const stats = getTaskStats();

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Tasks & Reminders</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNewTaskModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>New Task</span>
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-800">Total Tasks</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-green-800">Completed</div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-yellow-800">Pending</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-sm text-red-800">Overdue</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mt-6 bg-white bg-opacity-50 rounded-xl p-1">
          {[
            { key: 'all', label: 'All', count: stats.total },
            { key: 'pending', label: 'Pending', count: stats.pending },
            { key: 'completed', label: 'Completed', count: stats.completed },
            { key: 'overdue', label: 'Overdue', count: stats.overdue },
          ].map(({ key, label, count }) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilter(key as any)}
              className={`
                flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200
                ${filter === key
                  ? 'bg-white text-gray-800 shadow-lg'
                  : 'text-gray-600 hover:text-gray-800'
                }
              `}
            >
              {label} ({count})
            </motion.button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        <AnimatePresence>
          {sortedTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.01 }}
              className={`
                glass-card p-4 rounded-xl transition-all duration-300
                ${task.completed ? 'opacity-60' : ''}
                ${isOverdue(task) ? 'bg-red-50 border-red-200' : ''}
              `}
            >
              <div className="flex items-start space-x-3">
                {/* Checkbox */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleTaskToggle(task.id, !task.completed)}
                  className={`
                    mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200
                    ${task.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-400'
                    }
                  `}
                >
                  {task.completed && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </motion.button>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {task.title}
                    </h3>
                    {isOverdue(task) && (
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>

                  {task.description && (
                    <p className={`text-sm mb-2 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {task.due_date && (
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span className={isOverdue(task) ? 'text-red-600 font-medium' : ''}>
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {task.reminder_time && (
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>{new Date(task.reminder_time).toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delete Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onTaskDelete(task.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {sortedTasks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-lg">No tasks found</p>
            <p className="text-sm opacity-75">Create your first task to get started</p>
          </div>
        )}
      </div>

      {/* New Task Modal */}
      <AnimatePresence>
        {showNewTaskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewTaskModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 rounded-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Create New Task</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter task title..."
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add details..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reminder Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newTask.reminder_time}
                    onChange={(e) => setNewTask({ ...newTask, reminder_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateTask}
                  disabled={!newTask.title.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Task
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowNewTaskModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskManager;
