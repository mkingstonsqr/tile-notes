import { useState, useEffect } from 'react'
import { Tag, Hash, X, Plus, Search, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Note } from '../../lib/supabase'
import MiniCalendar from './MiniCalendar'

interface TagSidebarProps {
  tags: string[]
  selectedTags: string[]
  onTagSelect: (tags: string[]) => void
  notes: Note[]
  onDateSelect?: (date: Date | null) => void
}

export default function TagSidebar({ 
  tags,
  notes, 
  selectedTags, 
  onTagSelect,
  onDateSelect
}: TagSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddTag, setShowAddTag] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null)

  // Extract and count all tags from notes
  const tagCounts = notes.reduce((acc, note) => {
    if (note.ai_tags) {
      note.ai_tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1
      })
    }
    return acc
  }, {} as Record<string, number>)

  // Sort tags by usage count
  const sortedTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .filter(([tag]) => 
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const recentTags = sortedTags.slice(0, 10)
  const popularTags = sortedTags.slice(0, 5)

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagSelect(selectedTags.filter(t => t !== tag))
    } else {
      onTagSelect([...selectedTags, tag])
    }
  }

  const addCustomTag = () => {
    if (newTag.trim()) {
      onTagSelect([...selectedTags, newTag.trim()])
      setNewTag('')
      setShowAddTag(false)
    }
  }

  const handleClearTags = () => {
    onTagSelect([])
  }

  return (
    <div className="w-80 h-full glass-card flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white border-opacity-20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Tag size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Tags</h2>
          </div>
          {selectedTags.length > 0 && (
            <button
              onClick={handleClearTags}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tags..."
            className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-50 border border-white border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-opacity-70 transition-all"
          />
        </div>
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="p-4 border-b border-white border-opacity-20">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Active Filters</h3>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {selectedTags.map(tag => (
                <motion.div
                  key={tag}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="tag tag-selected flex items-center space-x-1"
                >
                  <Hash size={12} />
                  <span>{tag}</span>
                  <button
                    onClick={() => handleTagClick(tag)}
                    className="ml-1 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
                  >
                    <X size={10} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Popular Tags */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp size={16} className="text-gray-500" />
            <h3 className="text-sm font-medium text-gray-600">Popular</h3>
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {popularTags.map(([tag, count], index) => (
                <motion.button
                  key={tag}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleTagClick(tag)}
                  className={`sidebar-item w-full ${
                    selectedTags.includes(tag) ? 'sidebar-item-active' : ''
                  }`}
                >
                  <Hash size={14} />
                  <span className="flex-1 text-left">{tag}</span>
                  <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                    {count}
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* All Tags */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">All Tags</h3>
            <button
              onClick={() => setShowAddTag(!showAddTag)}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
            >
              <Plus size={12} />
              <span>Add</span>
            </button>
          </div>

          {/* Add Custom Tag */}
          <AnimatePresence>
            {showAddTag && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-3 overflow-hidden"
              >
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Custom tag..."
                    className="flex-1 px-3 py-2 text-sm bg-white bg-opacity-50 border border-white border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => e.key === 'Enter' && addCustomTag()}
                    autoFocus
                  />
                  <button
                    onClick={addCustomTag}
                    className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1">
            <AnimatePresence>
              {recentTags.map(([tag, count], index) => (
                <motion.button
                  key={tag}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleTagClick(tag)}
                  className={`sidebar-item w-full ${
                    selectedTags.includes(tag) ? 'sidebar-item-active' : ''
                  }`}
                >
                  <Hash size={14} />
                  <span className="flex-1 text-left">{tag}</span>
                  <span className="text-xs text-gray-400">{count}</span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {sortedTags.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Tag size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tags found</p>
              <p className="text-xs">Create some notes to see tags here</p>
            </div>
          )}
        </div>

        {/* Mini Calendar */}
        <div className="mt-6">
          <MiniCalendar
            notes={notes}
            selectedDate={selectedCalendarDate}
            onDateSelect={(date) => {
              setSelectedCalendarDate(date);
              onDateSelect?.(date);
            }}
          />
        </div>
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-white border-opacity-20">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{Object.keys(tagCounts).length} total tags</span>
          <span>{notes.length} notes</span>
        </div>
      </div>
    </div>
  )
}
