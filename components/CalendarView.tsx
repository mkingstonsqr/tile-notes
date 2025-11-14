import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Grid, List } from 'lucide-react'
import type { Note } from '../lib/supabase'

interface CalendarViewProps {
  notes: Note[]
  onNoteClick: (note: Note) => void
}

export default function CalendarView({ notes, onNoteClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')

  const today = new Date()
  
  // Group notes by date
  const notesByDate = useMemo(() => {
    const grouped: { [key: string]: Note[] } = {}
    
    notes.forEach(note => {
      const date = new Date(note.created_at).toDateString()
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(note)
    })
    
    return grouped
  }, [notes])

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
      
      if (days.length > 42) break // Max 6 weeks
    }
    
    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const getNotesForDate = (date: Date) => {
    return notesByDate[date.toDateString()] || []
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (viewMode === 'month') {
    const calendarDays = getCalendarDays()

    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-black">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('month')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'month' ? 'bg-black text-white' : 'hover:bg-gray-100'
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'week' ? 'bg-black text-white' : 'hover:bg-gray-100'
              }`}
            >
              <Calendar size={16} />
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'day' ? 'bg-black text-white' : 'hover:bg-gray-100'
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              const dayNotes = getNotesForDate(date)
              const isCurrentMonthDay = isCurrentMonth(date)
              const isTodayDate = isToday(date)

              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border border-gray-100 rounded-lg transition-colors ${
                    isCurrentMonthDay 
                      ? 'bg-white hover:bg-gray-50' 
                      : 'bg-gray-50 text-gray-400'
                  } ${isTodayDate ? 'ring-2 ring-black' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isTodayDate ? 'text-black' : isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {date.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {dayNotes.slice(0, 3).map(note => (
                      <button
                        key={note.id}
                        onClick={() => onNoteClick(note)}
                        className="w-full text-left p-1 rounded text-xs hover:bg-white hover:shadow-sm transition-all"
                        style={{ backgroundColor: `${note.color}80` }}
                      >
                        <div className="truncate font-medium">
                          {note.title || 'Untitled'}
                        </div>
                        <div className="truncate text-gray-600">
                          {note.content.substring(0, 30)}...
                        </div>
                      </button>
                    ))}
                    
                    {dayNotes.length > 3 && (
                      <div className="text-xs text-gray-500 text-center py-1">
                        +{dayNotes.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-200 rounded"></div>
                <span>Text Notes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-200 rounded"></div>
                <span>Voice Notes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-200 rounded"></div>
                <span>Image Notes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-pink-200 rounded"></div>
                <span>Link Notes</span>
              </div>
            </div>
            <div>
              {notes.length} total notes
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Week and Day views would be implemented similarly
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
      <h3 className="text-lg font-medium text-gray-600 mb-2">
        {viewMode === 'week' ? 'Week View' : 'Day View'}
      </h3>
      <p className="text-gray-500">
        Coming soon! Switch back to month view for now.
      </p>
      <button
        onClick={() => setViewMode('month')}
        className="mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
      >
        Back to Month View
      </button>
    </div>
  )
}
