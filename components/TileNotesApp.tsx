import { useState, useEffect } from 'react'
import { createSupabaseClient } from '../lib/supabase'
import { useAuth } from './auth/AuthGuard'
import type { Note } from '../lib/supabase'
import Header from './Header'
import TileGrid from './TileGrid'
import FloatingAddButton from './FloatingAddButton'

export default function TileNotesApp() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  // Load user's notes
  useEffect(() => {
    if (!user) return

    const loadNotes = async () => {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_archived', false)
          .order('created_at', { ascending: false })

        if (error) throw error
        setNotes(data || [])
      } catch (error) {
        console.error('Error loading notes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadNotes()

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('notes_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notes',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('Real-time update:', payload)
          // Reload notes on any change
          loadNotes()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, supabase])

  const createNote = async (noteData: Partial<Note>) => {
    if (!user) return

    try {
      const newNote: Partial<Note> = {
        user_id: user.id,
        title: noteData.title || '',
        content: noteData.content || '',
        note_type: noteData.note_type || 'text',
        color: noteData.color || '#FFFACD',
        position_x: noteData.position_x || 0,
        position_y: noteData.position_y || 0,
        is_archived: false
      }

      const { data, error } = await supabase
        .from('notes')
        .insert([newNote])
        .select()
        .single()

      if (error) throw error
      
      setNotes(prev => [data, ...prev])
      return data
    } catch (error) {
      console.error('Error creating note:', error)
      throw error
    }
  }

  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      setNotes(prev => prev.map(note => 
        note.id === id ? { ...note, ...updates } : note
      ))
    } catch (error) {
      console.error('Error updating note:', error)
      throw error
    }
  }

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)

      if (error) throw error

      setNotes(prev => prev.filter(note => note.id !== id))
    } catch (error) {
      console.error('Error deleting note:', error)
      throw error
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-black">Loading your notes...</h2>
          <p className="text-gray-600 mt-2">Please wait while we sync your workspace.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        user={user}
        onSignOut={handleSignOut}
        notesCount={notes.length}
      />
      
      <main className="container mx-auto px-4 py-8">
        {notes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">📝</div>
            <h2 className="text-3xl font-bold text-black mb-4">
              Welcome to TileNotes
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Your intelligent note-taking workspace is ready. 
              Create your first note to get started.
            </p>
            <button
              onClick={() => createNote({ 
                title: 'My First Note',
                content: 'Start writing your thoughts here...',
                note_type: 'text'
              })}
              className="bg-black text-white px-8 py-3 font-bold hover:bg-gray-800 transition-colors"
            >
              Create Your First Note
            </button>
          </div>
        ) : (
          <TileGrid 
            notes={notes}
            onUpdateNote={updateNote}
            onDeleteNote={deleteNote}
          />
        )}
      </main>

      <FloatingAddButton onCreateNote={createNote} />
    </div>
  )
}
