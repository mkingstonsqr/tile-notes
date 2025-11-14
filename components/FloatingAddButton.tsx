import { useState } from 'react'
import { Plus, FileText, Mic, Image, Link, X } from 'lucide-react'
import type { Note } from '../lib/supabase'

interface FloatingAddButtonProps {
  onCreateNote: (noteData: Partial<Note>) => Promise<Note | undefined>
}

export default function FloatingAddButton({ onCreateNote }: FloatingAddButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const noteTypes = [
    {
      type: 'text' as const,
      icon: FileText,
      label: 'Text Note',
      color: '#FFFACD',
      description: 'Write your thoughts'
    },
    {
      type: 'voice' as const,
      icon: Mic,
      label: 'Voice Note',
      color: '#FFE4E1',
      description: 'Record audio'
    },
    {
      type: 'image' as const,
      icon: Image,
      label: 'Image Note',
      color: '#E6F3FF',
      description: 'Add photos'
    },
    {
      type: 'link' as const,
      icon: Link,
      label: 'Link Note',
      color: '#F0FFF0',
      description: 'Save URLs'
    }
  ]

  const handleCreateNote = async (type: 'text' | 'voice' | 'image' | 'link') => {
    setLoading(true)
    
    try {
      const noteData: Partial<Note> = {
        title: '',
        content: type === 'text' ? 'Start writing...' : `New ${type} note`,
        note_type: type,
        color: noteTypes.find(nt => nt.type === type)?.color || '#FFFACD'
      }

      await onCreateNote(noteData)
      setIsOpen(false)
    } catch (error) {
      console.error('Error creating note:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Menu */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Note Type Options */}
        {isOpen && (
          <div className="mb-4 space-y-3">
            {noteTypes.map((noteType) => {
              const Icon = noteType.icon
              return (
                <button
                  key={noteType.type}
                  onClick={() => handleCreateNote(noteType.type)}
                  disabled={loading}
                  className="flex items-center space-x-3 bg-white border-2 border-black p-4 hover:bg-black hover:text-white transition-colors duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 min-w-[200px]"
                  style={{ backgroundColor: isOpen ? 'white' : noteType.color }}
                >
                  <Icon size={20} />
                  <div className="text-left">
                    <div className="font-bold">{noteType.label}</div>
                    <div className="text-sm opacity-70">{noteType.description}</div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Main Add Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={loading}
          className={`w-16 h-16 bg-black text-white border-2 border-black hover:bg-gray-800 transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 ${
            isOpen ? 'rotate-45' : ''
          }`}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
          ) : isOpen ? (
            <X size={24} />
          ) : (
            <Plus size={24} />
          )}
        </button>
      </div>
    </>
  )
}
