import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Note } from '../../lib/supabase';

interface CalendarViewProps {
  notes: Note[];
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
  onNoteEdit: (note: Note) => void;
}

type ViewMode = 'month' | 'week' | 'day';

const CalendarView: React.FC<CalendarViewProps> = ({
  notes,
  onDateSelect,
  selectedDate,
  onNoteEdit,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDateNotes, setSelectedDateNotes] = useState<Note[]>([]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    if (selectedDate) {
      const dayNotes = notes.filter(note => {
        const noteDate = new Date(note.created_at);
        return (
          noteDate.getDate() === selectedDate.getDate() &&
          noteDate.getMonth() === selectedDate.getMonth() &&
          noteDate.getFullYear() === selectedDate.getFullYear()
        );
      });
      setSelectedDateNotes(dayNotes);
    }
  }, [selectedDate, notes]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getNotesForDate = (date: Date | null) => {
    if (!date) return [];
    return notes.filter(note => {
      const noteDate = new Date(note.created_at);
      return (
        noteDate.getDate() === date.getDate() &&
        noteDate.getMonth() === date.getMonth() &&
        noteDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const handleDateClick = (date: Date | null) => {
    if (date) {
      onDateSelect(date);
    }
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(date.getDate() - day);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      days.push(currentDay);
    }
    return days;
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);

    return (
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(day => (
          <div key={day} className="p-3 text-center font-semibold text-gray-600 text-sm">
            {day}
          </div>
        ))}
        {days.map((date, index) => {
          const dayNotes = getNotesForDate(date);
          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative p-2 h-20 rounded-xl cursor-pointer transition-all duration-200
                ${date ? 'hover:bg-white hover:bg-opacity-20' : ''}
                ${isToday(date) ? 'bg-blue-500 bg-opacity-80 text-white font-bold' : ''}
                ${isSelected(date) ? 'ring-2 ring-blue-400 bg-blue-100 bg-opacity-20' : ''}
                ${!date ? 'pointer-events-none' : ''}
              `}
              onClick={() => handleDateClick(date)}
            >
              {date && (
                <>
                  <div className="text-sm font-medium">
                    {date.getDate()}
                  </div>
                  {dayNotes.length > 0 && (
                    <div className="absolute bottom-1 right-1 flex space-x-1">
                      {dayNotes.slice(0, 3).map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-blue-400 rounded-full opacity-80"
                        />
                      ))}
                      {dayNotes.length > 3 && (
                        <div className="text-xs text-blue-400 font-bold">
                          +{dayNotes.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);

    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date, index) => {
          const dayNotes = getNotesForDate(date);
          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative p-4 h-32 rounded-xl cursor-pointer transition-all duration-200 border
                ${isToday(date) ? 'bg-blue-500 bg-opacity-80 text-white font-bold border-blue-400' : 'hover:bg-white hover:bg-opacity-20 border-gray-300'}
                ${isSelected(date) ? 'ring-2 ring-blue-400 bg-blue-100 bg-opacity-20' : ''}
              `}
              onClick={() => handleDateClick(date)}
            >
              <div className="text-center mb-2">
                <div className="text-xs font-medium opacity-75">
                  {weekDays[index].toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-lg font-bold">
                  {date.getDate()}
                </div>
              </div>
              {dayNotes.length > 0 && (
                <div className="space-y-1">
                  {dayNotes.slice(0, 2).map((note, i) => (
                    <div
                      key={i}
                      className="text-xs p-1 bg-blue-100 bg-opacity-80 rounded truncate"
                    >
                      {note.title || 'Untitled'}
                    </div>
                  ))}
                  {dayNotes.length > 2 && (
                    <div className="text-xs text-blue-400 font-bold text-center">
                      +{dayNotes.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dayNotes = getNotesForDate(currentDate);

    return (
      <div className="space-y-4">
        <div className="text-center p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800">
            {currentDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          <p className="text-gray-600 mt-2">
            {dayNotes.length} {dayNotes.length === 1 ? 'note' : 'notes'} for this day
          </p>
        </div>
        
        {dayNotes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-lg">No notes for this day</p>
            <p className="text-sm opacity-75">Create a note to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dayNotes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="glass-card p-4 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-xl"
                onClick={() => onNoteEdit(note)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-800 truncate flex-1">
                    {note.title || 'Untitled'}
                  </h4>
                  {note.pinned && (
                    <div className="text-yellow-500 ml-2">📌</div>
                  )}
                </div>
                <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                  {note.content}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {new Date(note.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex space-x-1">
                      {note.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="text-gray-400">+{note.tags.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSelectedDateNotes = () => {
    if (!selectedDate || selectedDateNotes.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-lg">No notes for this date</p>
          <p className="text-sm opacity-75">Click on a date with notes to view them</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Notes for {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {selectedDateNotes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="glass-card p-4 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-xl"
                onClick={() => onNoteEdit(note)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-800 truncate flex-1">
                    {note.title || 'Untitled'}
                  </h4>
                  {note.pinned && (
                    <div className="text-yellow-500 ml-2">📌</div>
                  )}
                </div>
                <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                  {note.content}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {new Date(note.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex space-x-1">
                      {note.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="text-gray-400">+{note.tags.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card p-6 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center space-x-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex bg-white bg-opacity-20 rounded-xl p-1">
          {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
            <motion.button
              key={mode}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode(mode)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${viewMode === mode 
                  ? 'bg-white text-gray-800 shadow-lg' 
                  : 'text-gray-600 hover:text-gray-800'
                }
              `}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-8">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>

      {/* Selected Date Notes */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-white border-opacity-20 pt-6"
        >
          {renderSelectedDateNotes()}
        </motion.div>
      )}
    </div>
  );
};

export default CalendarView;
