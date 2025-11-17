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
import { processNoteWithAI, transcribeAudio, generateImageDescription } from '../lib/openai';

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
  const [theme, setTheme] = useState<'dark' | 'glassy' | 'afternoon'>('glassy');

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
    console.log('🔍 createNote: Starting note creation process');
    console.log('🔍 createNote: Input noteData:', JSON.stringify(noteData, null, 2));
    console.log('🔍 createNote: User object:', user);
    console.log('🔍 createNote: User ID:', user?.id);
    
    if (!user) {
      const error = new Error('No authenticated user found');
      console.error('❌ createNote: No user authenticated');
      throw error;
    }

    try {
      console.log('🔍 createNote: Building newNote object...');
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
      
      console.log('🔍 createNote: Final newNote object:', JSON.stringify(newNote, null, 2));
      console.log('🔍 createNote: Supabase client:', supabase);
      console.log('🔍 createNote: About to call supabase.from("notes").insert()...');

      const { data, error } = await supabase
        .from('notes')
        .insert([newNote])
        .select()
        .single();

      console.log('🔍 createNote: Supabase response - data:', data);
      console.log('🔍 createNote: Supabase response - error:', error);
      
      if (error) {
        console.error('❌ createNote: Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Database error: ${error.message} (Code: ${error.code})`);
      }
      
      if (!data) {
        console.error('❌ createNote: No data returned from Supabase');
        throw new Error('No data returned from database insert');
      }
      
      console.log('✅ createNote: Note created successfully, updating state...');
      
      // Insert at the beginning, but after pinned notes
      setNotes(prev => {
        const pinnedNotes = prev.filter(note => note.pinned);
        const unpinnedNotes = prev.filter(note => !note.pinned);
        const newNotes = data.pinned ? [data, ...pinnedNotes, ...unpinnedNotes] : [...pinnedNotes, data, ...unpinnedNotes];
        console.log('🔍 createNote: Updated notes array length:', newNotes.length);
        return newNotes;
      });
      
      // Update filtered notes as well
      setFilteredNotes(prev => {
        const pinnedNotes = prev.filter(note => note.pinned);
        const unpinnedNotes = prev.filter(note => !note.pinned);
        const newNotes = data.pinned ? [data, ...pinnedNotes, ...unpinnedNotes] : [...pinnedNotes, data, ...unpinnedNotes];
        return newNotes;
      });
      
      // Trigger AI processing in the background for new notes
      if (data.content && data.content.trim().length > 10) {
        console.log('🤖 createNote: Triggering AI analysis for new note...');
        setTimeout(() => {
          processNoteInBackground(data);
        }, 2000); // Start processing after 2 seconds
      }
      
      console.log('✅ createNote: Process completed successfully');
      return data;
    } catch (error) {
      console.error('❌ createNote: Caught error:', error);
      console.error('❌ createNote: Error type:', typeof error);
      console.error('❌ createNote: Error constructor:', error?.constructor?.name);
      
      if (error instanceof Error) {
        console.error('❌ createNote: Error message:', error.message);
        console.error('❌ createNote: Error stack:', error.stack);
      }
      
      // Re-throw with more context
      const enhancedError = new Error(`Note creation failed: ${error instanceof Error ? error.message : String(error)}`);
      enhancedError.cause = error;
      throw enhancedError;
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

  // Background AI processing function
  const processNoteInBackground = async (note: Note) => {
    if (!user) return;

    try {
      console.log('🤖 Starting background AI processing for note:', note.id);
      
      let aiResults: any = {};

      // Process different note types
      if (note.note_type === 'voice') {
        // For voice notes, we would transcribe first, then process
        // In a real implementation, you'd pass the actual audio blob
        console.log('🎤 Processing voice note...');
        aiResults.transcription = "Voice transcription would go here (requires audio file)";
        aiResults = await processNoteWithAI(note.content, note.note_type);
      } else if (note.note_type === 'image' && note.content.startsWith('data:image')) {
        // For image notes, generate description first
        console.log('🖼️ Processing image note...');
        try {
          const description = await generateImageDescription(note.content);
          aiResults = await processNoteWithAI(description, 'image');
          aiResults.summary = description;
        } catch (error) {
          console.error('Image processing error:', error);
          aiResults = await processNoteWithAI('Image content', note.note_type);
        }
      } else {
        // For text and link notes, process content directly
        console.log('📝 Processing text/link note...');
        aiResults = await processNoteWithAI(note.content, note.note_type);
      }

      console.log('🤖 AI processing results:', aiResults);

      // Update note in database with AI results
      const updates: Partial<Note> = {
        ai_tags: aiResults.tags || [],
        ai_summary: aiResults.summary || null,
        ai_processed_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', note.id);

      if (error) throw error;

      // Update local state
      setNotes(prev => prev.map(n => 
        n.id === note.id 
          ? { ...n, ...updates }
          : n
      ));

      setFilteredNotes(prev => prev.map(n => 
        n.id === note.id 
          ? { ...n, ...updates }
          : n
      ));

      // Create tasks if extracted
      if (aiResults.tasks && aiResults.tasks.length > 0) {
        console.log('✅ Creating tasks from AI analysis:', aiResults.tasks);
        const taskInserts = aiResults.tasks.map((taskTitle: string) => ({
          user_id: user.id,
          note_id: note.id,
          title: taskTitle,
          is_completed: false,
          priority: 'medium'
        }));

        const { error: taskError } = await supabase
          .from('tasks')
          .insert(taskInserts);

        if (taskError) {
          console.error('Error creating tasks:', taskError);
        } else {
          // Reload tasks to show new ones
          loadTasks();
        }
      }

      console.log('✅ Background AI processing completed for note:', note.id);

    } catch (error) {
      console.error('❌ Background AI processing failed:', error);
      
      // Still mark as processed to avoid infinite retries
      const { error: updateError } = await supabase
        .from('notes')
        .update({ ai_processed_at: new Date().toISOString() })
        .eq('id', note.id);

      if (updateError) {
        console.error('Error marking note as processed:', updateError);
      }
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

  const handleDateFilter = (date: Date | null) => {
    setSelectedDate(date);
    
    let filtered = notes;
    
    if (date) {
      // Filter by date
      filtered = filtered.filter(note => {
        const noteDate = new Date(note.created_at);
        return (
          noteDate.getDate() === date.getDate() &&
          noteDate.getMonth() === date.getMonth() &&
          noteDate.getFullYear() === date.getFullYear()
        );
      });
    }
    
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
        ? 'bg-gradient-to-br from-slate-800 via-purple-800 to-indigo-800' 
        : theme === 'dark'
        ? 'bg-gray-900'
        : 'bg-gradient-to-br from-orange-50 via-white to-yellow-50'
    }`}>
      {/* Background Effects - Lighter and more airy */}
      {theme === 'glassy' && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-10 opacity-15">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '4s'}}></div>
            <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '3s'}}></div>
          </div>
        </div>
      )}
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

      {/* AI Processor */}
      {editingNote && (
        <AIProcessor
          note={editingNote}
          onProcessingComplete={(updatedNote) => {
            setNotes(prev => prev.map(note => 
              note.id === updatedNote.id ? updatedNote : note
            ));
            setEditingNote(updatedNote);
          }}
        />
      )}
    </div>
  );
}
