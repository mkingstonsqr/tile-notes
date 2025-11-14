import { useState, useRef, useEffect } from 'react'
import { Trash2, Edit3, Palette, GripVertical, FileText, Mic, Image, Link, Calendar, Tag, Brain } from 'lucide-react'
import { Note } from '../lib/supabase'
import RichTextEditor from './RichTextEditor'
import AIProcessor from './AIProcessor'

interface NoteTileProps {
  note: Note
  onUpdate: (updates: Partial<Note>) => void
  onDelete: () => void
  isDragging: boolean
}

const colorOptions = [
  '#FFE4B5', // Moccasin
  '#E6F3FF', // Light Blue
  '#F0FFF0', // Honeydew
  '#FFFACD', // Lemon Chiffon
  '#FFE4E1', // Misty Rose
  '#F0F8FF', // Alice Blue
  '#FFF8DC', // Cornsilk
  '#E0E6FF', // Lavender
]

export default function NoteTile({ note, onUpdate, onDelete, isDragging }: NoteTileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [title, setTitle] = useState(note.title || '')
  const [content, setContent] = useState(note.content)
  
  const titleRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && titleRef.current) {
      titleRef.current.focus()
    }
  }, [isEditing])

  const handleSave = () => {
    onUpdate({ title, content })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTitle(note.title || '')
    setContent(note.content)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const handleColorChange = (color: string) => {
    onUpdate({ color })
    setShowColorPicker(false)
  }

  return (
    <div
      className={`relative backdrop-blur-sm bg-white/70 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-white/20 ${
        isDragging ? 'shadow-2xl ring-2 ring-blue-400/50 scale-105' : 'hover:scale-102'
      }`}
      style={{ 
        backgroundColor: `${note.color}80`, // 50% opacity
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
    >
      {/* Drag Handle */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical size={16} className="text-gray-400" />
      </div>

      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded"
        >
          <Palette size={14} />
        </button>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded"
        >
          <Edit3 size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-1 text-red-500 hover:text-red-700 hover:bg-white/50 rounded"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Color Picker */}
      {showColorPicker && (
        <div className="absolute top-8 right-2 bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-2 z-10 border border-white/30">
          <div className="grid grid-cols-4 gap-1">
            {colorOptions.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className="w-6 h-6 rounded-full border-2 border-white/50 hover:border-white/80 transition-all duration-200 hover:scale-110 shadow-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Note Type Icon */}
      <div className="absolute top-2 left-8">
        {note.note_type === 'text' && <FileText size={16} className="text-gray-500" />}
        {note.note_type === 'voice' && <Mic size={16} className="text-blue-500" />}
        {note.note_type === 'image' && <Image size={16} className="text-green-500" />}
        {note.note_type === 'link' && <Link size={16} className="text-purple-500" />}
      </div>

      {/* Content */}
      <div className="p-4 pt-8">
        {isEditing ? (
          <RichTextEditor
            initialContent={content}
            onSave={(newContent) => {
              setContent(newContent)
              onUpdate({ title, content: newContent })
              setIsEditing(false)
            }}
            onCancel={handleCancel}
            placeholder="Start writing your note..."
          />
        ) : (
          <div 
            className="cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            {/* Title */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg text-gray-800 line-clamp-2 flex-1">
                {note.title || 'Untitled Note'}
              </h3>
            </div>

            {/* Content Preview */}
            <div className="text-gray-600 text-sm mb-3">
              {note.note_type === 'image' && note.content.startsWith('data:image') ? (
                <img 
                  src={note.content} 
                  alt="Note content" 
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
              ) : note.note_type === 'voice' ? (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <Mic size={16} className="text-blue-500" />
                  <span className="text-blue-700">Voice recording</span>
                </div>
              ) : note.note_type === 'link' ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-purple-600">
                    <Link size={14} />
                    <span className="text-xs">Link Note</span>
                  </div>
                  <p className="line-clamp-4">{note.content}</p>
                </div>
              ) : (
                <p className="whitespace-pre-wrap line-clamp-6">{note.content}</p>
              )}
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Calendar size={12} />
                  <span>{new Date(note.created_at).toLocaleDateString()}</span>
                </div>
                {note.ai_tags && note.ai_tags.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <Tag size={12} />
                    <span>{note.ai_tags.slice(0, 2).join(', ')}</span>
                  </div>
                )}
              </div>
              {note.ai_summary && (
                <div className="text-blue-500 text-xs">AI</div>
              )}
            </div>

            {/* AI Tags */}
            {note.ai_tags && note.ai_tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {note.ai_tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-black/10 text-gray-700 text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
                {note.ai_tags.length > 3 && (
                  <span className="text-xs text-gray-500">+{note.ai_tags.length - 3}</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* AI Processing Component */}
        {!isEditing && note.content.trim().length > 10 && (
          <div className="mt-3">
            <AIProcessor 
              note={note} 
              onProcessingComplete={(updatedNote) => {
                onUpdate(updatedNote)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
