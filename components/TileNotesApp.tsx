import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from './auth/AuthGuard';
import type { Note, Task } from '../lib/supabase';
import Header from './Header';
import TileGrid from './TileGrid';
import FloatingAddButton from './FloatingAddButton';
import CalendarView from './enhanced/CalendarView';
import TaskManager from './enhanced/TaskManager';
import SearchAndFilter from './enhanced/SearchAndFilter';
import TagSidebar from './enhanced/TagSidebar';
import NoteEditModal from './enhanced/NoteEditModal';
import ThemeSelector from './enhanced/ThemeSelector';
import SettingsPanel from './SettingsPanel';
import AIProcessor from './AIProcessor';

type View = 'notes' | 'calendar' | 'tasks' | 'settings';

export default function TileNotesApp() {
  const { user } = useAuth();
  
  const [currentView, setCurrentView] = useState<View>('notes');
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'glassy'>('glassy');

  useEffect(() => {
    if (user) {
      loadNotes();
      loadTasks();
    }
  }, [user]);

  const loadNotes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
      setFilteredNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
      setFilteredTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const createNote = async (noteData: Partial<Note>) => {
    if (!user) return;

    try {
      const newNote: Partial<Note> = {
        user_id: user.id,
        title: noteData.title || '',
        content: noteData.content || '',
        note_type: noteData.note_type || 'text',
        tags: noteData.tags || [],
        pinned: noteData.pinned || false,
        color: noteData.color || '#FFFACD',
        position_x: noteData.position_x || 0,
        position_y: noteData.position_y || 0,
        is_archived: false
      };

      const { data, error } = await supabase
        .from('notes')
        .insert([newNote])
        .select()
        .single();

      if (error) throw error;
      
      // Insert at the beginning, but after pinned notes
      setNotes(prev => {
        const pinnedNotes = prev.filter(note => note.pinned);
        const unpinnedNotes = prev.filter(note => !note.pinned);
        const newNotes = data.pinned ? [data, ...pinnedNotes, ...unpinnedNotes] : [...pinnedNotes, data, ...unpinnedNotes];
        return newNotes;
      });
      
      // Update filtered notes as well
      setFilteredNotes(prev => {
        const pinnedNotes = prev.filter(note => note.pinned);
        const unpinnedNotes = prev.filter(note => !note.pinned);
        const newNotes = data.pinned ? [data, ...pinnedNotes, ...unpinnedNotes] : [...pinnedNotes, data, ...unpinnedNotes];
        return newNotes;
      });
      
      return data;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => {
        const updated = prev.map(note => note.id === id ? data : note);
        // Re-sort to maintain pinned notes at top
        return updated.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      });
      
      return data;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  };

  const createTask = async (taskData: Partial<Task>) => {
    if (!user) return;

    try {
      const newTask: Partial<Task> = {
        user_id: user.id,
        title: taskData.title || '',
        description: taskData.description || '',
        due_date: taskData.due_date || null,
        priority: taskData.priority || 'medium',
        reminder_time: taskData.reminder_time || null,
        is_completed: false
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) throw error;
      setTasks(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      setTasks(prev => prev.map(task => task.id === taskId ? data : task));
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  // Get all unique tags from notes
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags || [])));

  const handleTagFilter = (tags: string[]) => {
    setSelectedTags(tags);
    if (tags.length === 0 && !selectedDate) {
      setFilteredNotes(notes);
    } else {
      let filtered = notes;
      
      // Filter by tags
      if (tags.length > 0) {
        filtered = filtered.filter(note =>
          tags.some(tag => note.tags?.includes(tag))
        );
      }
      
      // Filter by date if selected
      if (selectedDate) {
        filtered = filtered.filter(note => {
          const noteDate = new Date(note.created_at);
          return (
            noteDate.getDate() === selectedDate.getDate() &&
            noteDate.getMonth() === selectedDate.getMonth() &&
            noteDate.getFullYear() === selectedDate.getFullYear()
          );
        });
      }
      
      setFilteredNotes(filtered);
    }
  };

  const handleDateFilter = (date: Date) => {
    setSelectedDate(date);
    
    let filtered = notes;
    
    // Filter by date
    filtered = filtered.filter(note => {
      const noteDate = new Date(note.created_at);
      return (
        noteDate.getDate() === date.getDate() &&
        noteDate.getMonth() === date.getMonth() &&
        noteDate.getFullYear() === date.getFullYear()
      );
    });
    
    // Also apply tag filters if any
    if (selectedTags.length > 0) {
      filtered = filtered.filter(note =>
        selectedTags.some(tag => note.tags?.includes(tag))
      );
    }
    
    setFilteredNotes(filtered);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCurrentView('calendar');
  };

  const handleNoteEdit = (note: Note) => {
    setEditingNote(note);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'calendar':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CalendarView
              notes={notes}
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
              onNoteEdit={handleNoteEdit}
            />
          </motion.div>
        );
      case 'tasks':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TaskManager
              tasks={filteredTasks}
              onTaskCreate={createTask}
              onTaskUpdate={updateTask}
              onTaskDelete={deleteTask}
            />
          </motion.div>
        );
      case 'settings':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <SettingsPanel 
              isOpen={true}
              onClose={() => setCurrentView('notes')}
            />
          </motion.div>
        );
      default:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex gap-6"
          >
            <div className="flex-1">
              {filteredNotes.length === 0 && notes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16 glass-card rounded-2xl"
                >
                  <div className="text-6xl mb-6">📝</div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Welcome to TileNotes
                  </h2>
                  <p className="text-gray-300 text-lg mb-8 max-w-md mx-auto">
                    Your intelligent note-taking workspace is ready. 
                    Create your first note to get started.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      try {
                        console.log('Creating first note...');
                        console.log('User:', user);
                        console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
                        console.log('Supabase client:', supabase);
                        
                        // Test database connection first
                        const { data: testData, error: testError } = await supabase
                          .from('notes')
                          .select('count')
                          .eq('user_id', user?.id)
                          .limit(1);
                        
                        console.log('Database test result:', { testData, testError });
                        
                        if (testError) {
                          throw new Error(`Database connection failed: ${testError.message}`);
                        }
                        
                        const result = await createNote({ 
                          title: 'My First Note',
                          content: 'Start writing your thoughts here...',
                          note_type: 'text'
                        });
                        console.log('Note created successfully:', result);
                      } catch (error) {
                        console.error('Failed to create first note:', error);
                        alert(`Failed to create note: ${error instanceof Error ? error.message : 'Unknown error'}`);
                      }
                    }}
                    className="btn-primary"
                  >
                    Create Your First Note
                  </motion.button>
                </motion.div>
              ) : (
                <TileGrid 
                  notes={filteredNotes}
                  onUpdateNote={updateNote}
                  onDeleteNote={deleteNote}
                  onNoteEdit={handleNoteEdit}
                />
              )}
            </div>
            <div className="w-80">
              <TagSidebar
                tags={allTags}
                selectedTags={selectedTags}
                onTagSelect={handleTagFilter}
                notes={notes}
                onDateSelect={handleDateFilter}
              />
            </div>
          </motion.div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 rounded-2xl text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white font-medium">Loading TileNotes...</p>
          <p className="text-white text-sm opacity-75 mt-2">Preparing your intelligent workspace</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      theme === 'glassy' 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : theme === 'dark'
        ? 'bg-gray-900'
        : 'bg-gray-50'
    }`}>
      <Header
        user={user}
        onSignOut={handleSignOut}
        onOpenSettings={() => setCurrentView('settings')}
        notesCount={notes.length}
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      
      <main className="container mx-auto px-4 py-6">
        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 mr-4">
              <SearchAndFilter
                notes={notes}
                tasks={tasks}
                onNotesFiltered={setFilteredNotes}
                onTasksFiltered={setFilteredTasks}
                availableTags={allTags}
              />
            </div>
            <ThemeSelector onThemeChange={setTheme} />
          </div>
        </motion.div>
        
        <AnimatePresence mode="wait">
          {renderCurrentView()}
        </AnimatePresence>
      </main>

      {/* Floating Add Button */}
      <AnimatePresence>
        {currentView === 'notes' && (
          <FloatingAddButton onCreateNote={createNote} />
        )}
      </AnimatePresence>

      {/* Note Edit Modal */}
      <NoteEditModal
        note={editingNote}
        isOpen={!!editingNote}
        onClose={() => setEditingNote(null)}
        onSave={updateNote}
        onDelete={deleteNote}
        availableTags={allTags}
      />

      {/* AI Processor - Hidden for now */}
      {/* <AIProcessor
        note={editingNote || notes[0]}
        onProcessingComplete={(updatedNote) => {
          setNotes(prev => prev.map(note => 
            note.id === updatedNote.id ? updatedNote : note
          ))
        }}
      /> */}
    </div>
  );
}
