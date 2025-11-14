import { useState } from 'react'
import Head from 'next/head'
import TileGrid from '../components/TileGrid'
import Header from '../components/Header'

export default function Home() {
  const [notes, setNotes] = useState([
    {
      id: '1',
      title: 'Welcome to Tile Notes',
      content: 'This is your first note! Click to edit or drag to rearrange.',
      color: '#FFE4B5',
      position: { x: 0, y: 0 }
    },
    {
      id: '2', 
      title: 'Getting Started',
      content: 'Create new notes by clicking the + button. Organize them however you like!',
      color: '#E6F3FF',
      position: { x: 1, y: 0 }
    },
    {
      id: '3',
      title: 'Features',
      content: '• Drag and drop tiles\n• Rich text editing\n• Color coding\n• Auto-save\n• Sync across devices',
      color: '#F0FFF0',
      position: { x: 0, y: 1 }
    }
  ])

  const addNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: 'New Note',
      content: 'Start typing...',
      color: '#FFFACD',
      position: { x: 0, y: 0 }
    }
    setNotes([...notes, newNote])
  }

  const updateNote = (id: string, updates: Partial<typeof notes[0]>) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, ...updates } : note
    ))
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id))
  }

  return (
    <>
      <Head>
        <title>Tile Notes - Visual Note Taking</title>
        <meta name="description" content="Organize your thoughts with visual tile-based notes" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header onAddNote={addNote} />
        <main className="container mx-auto px-4 py-8">
          <TileGrid 
            notes={notes}
            onUpdateNote={updateNote}
            onDeleteNote={deleteNote}
          />
        </main>
      </div>
    </>
  )
}
