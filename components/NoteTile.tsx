import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  Edit3, 
  Palette, 
  GripVertical,
  FileText,
  Mic,
  Image,
  Link,
  Calendar,
  Tag,
  Bookmark
} from 'lucide-react';
import { Note } from '../lib/supabase';
import RichTextEditor from './RichTextEditor';

interface NoteTileProps {
  note: Note;
  onUpdate: (updates: Partial<Note>) => void;
  onDelete: () => void;
  onEdit: () => void;
  isDragging: boolean;
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
];

export default function NoteTile({ note, onUpdate, onDelete, onEdit, isDragging }: NoteTileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content);
  
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onUpdate({ title, content });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(note.title || '');
    setContent(note.content);
    setIsEditing(false);
  };

  const handleColorChange = (color: string) => {
    onUpdate({ color });
    setShowColorPicker(false);
  };

  const handlePinToggle = () => {
    onUpdate({ pinned: !note.pinned });
  };

  const getNoteTypeIcon = () => {
    switch (note.note_type) {
      case 'voice':
        return <Mic className="h-4 w-4 text-blue-500" />;
      case 'image':
        return <Image className="h-4 w-4 text-green-500" />;
      case 'link':
        return <Link className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      className={`note-tile glass-card rounded-2xl overflow-hidden transition-all duration-300 ${
        isDragging ? 'shadow-2xl ring-2 ring-blue-400 scale-105 rotate-2' : 'hover:shadow-xl'
      } ${note.pinned ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}`}
      style={{ 
        backgroundColor: note.color ? `${note.color}40` : 'rgba(255, 255, 255, 0.1)',
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header */}
      <div className="relative p-4 pb-2">
        {/* Drag Handle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showActions ? 1 : 0 }}
          className="absolute top-2 left-2"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </motion.div>

        {/* Note Type Icon */}
        <div className="absolute top-2 left-8">
          {getNoteTypeIcon()}
        </div>

        {/* Pin Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePinToggle}
          className={`absolute top-2 right-12 p-1 rounded-lg transition-colors ${
            note.pinned 
              ? 'text-yellow-500 bg-yellow-100 bg-opacity-50' 
              : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-100 hover:bg-opacity-30'
          }`}
        >
          <Bookmark className={`h-4 w-4 ${note.pinned ? 'fill-current' : ''}`} />
        </motion.button>

        {/* Action Buttons */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute top-2 right-2 flex space-x-1"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-white hover:bg-opacity-30 rounded-lg transition-colors"
              >
                <Palette className="h-4 w-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onEdit}
                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-100 hover:bg-opacity-30 rounded-lg transition-colors"
              >
                <Edit3 className="h-4 w-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onDelete}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 hover:bg-opacity-30 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Color Picker */}
        <AnimatePresence>
          {showColorPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="absolute top-10 right-2 glass-card p-3 rounded-xl z-10 shadow-lg"
            >
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((color) => (
                  <motion.button
                    key={color}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleColorChange(color)}
                    className="w-6 h-6 rounded-full border-2 border-white border-opacity-50 hover:border-opacity-100 transition-all duration-200 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <motion.div
          layout
          onClick={onEdit}
          className="cursor-pointer"
        >
          {/* Title */}
          <h3 className="font-semibold text-lg text-white mb-2 line-clamp-2">
            {note.title || 'Untitled Note'}
          </h3>

          {/* Content Preview */}
          <div className="text-gray-200 text-sm mb-3">
            {note.note_type === 'image' && note.content.startsWith('data:image') ? (
              <motion.img 
                whileHover={{ scale: 1.02 }}
                src={note.content} 
                alt="Note content" 
                className="w-full h-32 object-cover rounded-lg mb-2"
              />
            ) : note.note_type === 'voice' ? (
              <div className="flex items-center space-x-2 p-3 bg-blue-500 bg-opacity-20 rounded-lg">
                <Mic className="h-4 w-4 text-blue-400" />
                <span className="text-blue-300">Voice recording</span>
              </div>
            ) : note.note_type === 'link' ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-purple-400">
                  <Link className="h-3 w-3" />
                  <span className="text-xs">Link Note</span>
                </div>
                <p className="line-clamp-4">{note.content}</p>
              </div>
            ) : (
              <p className="whitespace-pre-wrap line-clamp-6">{note.content}</p>
            )}
          </div>

          {/* User Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {note.tags.slice(0, 3).map((tag, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="px-3 py-1.5 bg-white bg-opacity-20 text-white text-xs rounded-full font-medium"
                >
                  #{tag}
                </motion.span>
              ))}
              {note.tags.length > 3 && (
                <span className="text-xs text-gray-300">+{note.tags.length - 3}</span>
              )}
            </div>
          )}

          {/* AI-Generated Tags */}
          {note.ai_tags && note.ai_tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {note.ai_tags.slice(0, 4).map((tag, index) => (
                <motion.span
                  key={`ai-${index}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="px-3 py-1.5 bg-blue-500 bg-opacity-30 text-blue-200 text-xs rounded-full font-medium border border-blue-400 border-opacity-30"
                >
                  🤖 {tag}
                </motion.span>
              ))}
              {note.ai_tags.length > 4 && (
                <span className="text-xs text-blue-300">+{note.ai_tags.length - 4} AI</span>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(note.created_at).toLocaleDateString()}</span>
              </div>
              {note.tags && note.tags.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Tag className="h-3 w-3" />
                  <span>{note.tags.length} tags</span>
                </div>
              )}
            </div>
            {note.ai_summary && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-blue-400 text-xs font-medium bg-blue-500 bg-opacity-20 px-2 py-1 rounded-full"
              >
                AI
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
