import { useState, useRef, useEffect } from 'react'
import { Trash2, Edit3, Palette, GripVertical } from 'lucide-react'
import { Note } from '../lib/supabase'

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

      {/* Content */}
      <div className="p-4 pt-8">
        {isEditing ? (
          <div className="space-y-3">
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full font-semibold text-lg bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none"
              placeholder="Note title..."
            />
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent resize-none outline-none min-h-[100px]"
              placeholder="Start typing..."
            />
            <div className="flex space-x-2 pt-2">
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            <h3 className="font-semibold text-lg mb-2 text-gray-800 line-clamp-2">
              {note.title}
            </h3>
            <p className="text-gray-600 text-sm whitespace-pre-wrap line-clamp-6">
              {note.content}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
