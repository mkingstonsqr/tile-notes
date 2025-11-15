import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import { Note, Task } from '../../lib/supabase';

interface SearchAndFilterProps {
  notes: Note[];
  tasks: Task[];
  onNotesFiltered: (notes: Note[]) => void;
  onTasksFiltered: (tasks: Task[]) => void;
  availableTags: string[];
}

interface FilterState {
  searchQuery: string;
  selectedTags: string[];
  dateRange: {
    start: string;
    end: string;
  };
  sortBy: 'date' | 'title' | 'updated';
  sortOrder: 'asc' | 'desc';
  showPinnedOnly: boolean;
  showCompletedTasks: boolean;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  notes,
  tasks,
  onNotesFiltered,
  onTasksFiltered,
  availableTags,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedTags: [],
    dateRange: { start: '', end: '' },
    sortBy: 'date',
    sortOrder: 'desc',
    showPinnedOnly: false,
    showCompletedTasks: true,
  });

  useEffect(() => {
    applyFilters();
  }, [filters, notes, tasks]);

  const applyFilters = () => {
    // Filter notes
    let filteredNotes = [...notes];

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredNotes = filteredNotes.filter(note =>
        note.title?.toLowerCase().includes(query) ||
        note.content?.toLowerCase().includes(query) ||
        note.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Tags
    if (filters.selectedTags.length > 0) {
      filteredNotes = filteredNotes.filter(note =>
        filters.selectedTags.some(tag => note.tags?.includes(tag))
      );
    }

    // Date range
    if (filters.dateRange.start) {
      const startDate = new Date(filters.dateRange.start);
      filteredNotes = filteredNotes.filter(note =>
        new Date(note.created_at) >= startDate
      );
    }
    if (filters.dateRange.end) {
      const endDate = new Date(filters.dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      filteredNotes = filteredNotes.filter(note =>
        new Date(note.created_at) <= endDate
      );
    }

    // Pinned only
    if (filters.showPinnedOnly) {
      filteredNotes = filteredNotes.filter(note => note.pinned);
    }

    // Sort notes
    filteredNotes.sort((a, b) => {
      let aValue, bValue;
      switch (filters.sortBy) {
        case 'title':
          aValue = a.title || '';
          bValue = b.title || '';
          break;
        case 'updated':
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        default: // date
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Filter tasks
    let filteredTasks = [...tasks];

    // Search query for tasks
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      );
    }

    // Completed tasks
    if (!filters.showCompletedTasks) {
      filteredTasks = filteredTasks.filter(task => !task.is_completed);
    }

    onNotesFiltered(filteredNotes);
    onTasksFiltered(filteredTasks);
  };

  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      selectedTags: [],
      dateRange: { start: '', end: '' },
      sortBy: 'date',
      sortOrder: 'desc',
      showPinnedOnly: false,
      showCompletedTasks: true,
    });
  };

  const hasActiveFilters = 
    filters.searchQuery ||
    filters.selectedTags.length > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end ||
    filters.showPinnedOnly ||
    !filters.showCompletedTasks ||
    filters.sortBy !== 'date' ||
    filters.sortOrder !== 'desc';

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-10 pr-12 py-3 bg-white bg-opacity-50 border border-white border-opacity-30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            placeholder="Search notes and tasks..."
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {hasActiveFilters && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={clearFilters}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-1 rounded-lg transition-colors ${
                isExpanded ? 'text-blue-600 bg-blue-100' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Filter className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white border-opacity-20"
          >
            <div className="p-4 space-y-4">
              {/* Tags Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <motion.button
                      key={tag}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                        filters.selectedTags.includes(tag)
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters({
                      ...filters,
                      dateRange: { ...filters.dateRange, start: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters({
                      ...filters,
                      dateRange: { ...filters.dateRange, end: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="date">Created Date</option>
                    <option value="updated">Last Updated</option>
                    <option value="title">Title</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>

              {/* Toggle Options */}
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showPinnedOnly}
                    onChange={(e) => setFilters({ ...filters, showPinnedOnly: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Pinned notes only</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showCompletedTasks}
                    onChange={(e) => setFilters({ ...filters, showCompletedTasks: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Show completed tasks</span>
                </label>
              </div>

              {/* Active Filters Summary */}
              {hasActiveFilters && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Active filters: {
                        [
                          filters.searchQuery && 'Search',
                          filters.selectedTags.length > 0 && `${filters.selectedTags.length} tags`,
                          filters.dateRange.start && 'Date range',
                          filters.showPinnedOnly && 'Pinned only',
                          !filters.showCompletedTasks && 'Hide completed',
                        ].filter(Boolean).join(', ')
                      }
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear all
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchAndFilter;
