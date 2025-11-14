import { useState, useEffect, useRef } from 'react'
import { Search, Filter, X, Calendar, Tag, FileText, Mic, Image, Link } from 'lucide-react'
import type { Note } from '../lib/supabase'

interface SearchBarProps {
  notes: Note[]
  onFilteredNotes: (filteredNotes: Note[]) => void
  onSearchChange?: (query: string) => void
}

export default function SearchBar({ notes, onFilteredNotes, onSearchChange }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const searchRef = useRef<HTMLInputElement>(null)

  const noteTypes = [
    { type: 'text', icon: FileText, label: 'Text', color: '#FFFACD' },
    { type: 'voice', icon: Mic, label: 'Voice', color: '#E6F3FF' },
    { type: 'image', icon: Image, label: 'Image', color: '#F0FFF0' },
    { type: 'link', icon: Link, label: 'Link', color: '#FFE4E1' },
  ]

  const colorOptions = [
    '#FFFACD', // Lemon Chiffon
    '#E6F3FF', // Light Blue
    '#F0FFF0', // Honeydew
    '#FFE4E1', // Misty Rose
    '#F0F8FF', // Alice Blue
    '#FFF8DC', // Cornsilk
    '#E0E6FF', // Lavender
    '#FFE4B5', // Moccasin
  ]

  useEffect(() => {
    const filtered = notes.filter(note => {
      // Text search
      const matchesQuery = query === '' || 
        note.title?.toLowerCase().includes(query.toLowerCase()) ||
        note.content.toLowerCase().includes(query.toLowerCase()) ||
        note.ai_tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))

      // Type filter
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(note.note_type)

      // Color filter
      const matchesColor = selectedColors.length === 0 || selectedColors.includes(note.color)

      // Date filter
      const matchesDate = (() => {
        if (dateRange === 'all') return true
        
        const noteDate = new Date(note.created_at)
        const now = new Date()
        
        switch (dateRange) {
          case 'today':
            return noteDate.toDateString() === now.toDateString()
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            return noteDate >= weekAgo
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            return noteDate >= monthAgo
          default:
            return true
        }
      })()

      return matchesQuery && matchesType && matchesColor && matchesDate
    })

    onFilteredNotes(filtered)
    onSearchChange?.(query)
  }, [query, selectedTypes, selectedColors, dateRange, notes, onFilteredNotes, onSearchChange])

  const clearFilters = () => {
    setQuery('')
    setSelectedTypes([])
    setSelectedColors([])
    setDateRange('all')
  }

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    )
  }

  const hasActiveFilters = selectedTypes.length > 0 || selectedColors.length > 0 || dateRange !== 'all'

  return (
    <div className="relative">
      {/* Main Search Bar */}
      <div className="flex items-center space-x-2 bg-white border-2 border-gray-200 rounded-lg px-4 py-3 focus-within:border-black transition-colors">
        <Search size={20} className="text-gray-400" />
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes, tags, or content..."
          className="flex-1 outline-none text-gray-800 placeholder-gray-400"
        />
        
        {query && (
          <button
            onClick={() => setQuery('')}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={16} className="text-gray-400" />
          </button>
        )}
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-black text-white' 
              : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <Filter size={16} />
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-10 p-4">
          <div className="space-y-4">
            {/* Note Types */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Note Types</h3>
              <div className="flex flex-wrap gap-2">
                {noteTypes.map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-colors ${
                      selectedTypes.includes(type)
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Colors</h3>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => toggleColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColors.includes(color)
                        ? 'border-black scale-110'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Date Range</h3>
              <div className="flex space-x-2">
                {[
                  { value: 'all', label: 'All Time' },
                  { value: 'today', label: 'Today' },
                  { value: 'week', label: 'This Week' },
                  { value: 'month', label: 'This Month' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setDateRange(value as any)}
                    className={`px-3 py-2 text-sm rounded-lg border-2 transition-colors ${
                      dateRange === value
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-500">
                {notes.length} total notes
              </span>
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                Clear all filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedTypes.map(type => (
            <span
              key={type}
              className="inline-flex items-center space-x-1 bg-black text-white px-2 py-1 rounded text-xs"
            >
              <span>{noteTypes.find(nt => nt.type === type)?.label}</span>
              <button onClick={() => toggleType(type)}>
                <X size={12} />
              </button>
            </span>
          ))}
          {selectedColors.map(color => (
            <span
              key={color}
              className="inline-flex items-center space-x-1 bg-gray-800 text-white px-2 py-1 rounded text-xs"
            >
              <div 
                className="w-3 h-3 rounded-full border border-white" 
                style={{ backgroundColor: color }}
              />
              <button onClick={() => toggleColor(color)}>
                <X size={12} />
              </button>
            </span>
          ))}
          {dateRange !== 'all' && (
            <span className="inline-flex items-center space-x-1 bg-gray-800 text-white px-2 py-1 rounded text-xs">
              <Calendar size={12} />
              <span>{dateRange}</span>
              <button onClick={() => setDateRange('all')}>
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
