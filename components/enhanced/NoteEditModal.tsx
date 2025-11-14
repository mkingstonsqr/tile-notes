import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PaperClipIcon, TagIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { Note } from '../../lib/supabase';
import RichTextEditor from '../RichTextEditor';

interface NoteEditModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteId: string, updates: Partial<Note>) => void;
  onDelete: (noteId: string) => void;
  availableTags: string[];
}

const NoteEditModal: React.FC<NoteEditModalProps> = ({
  note,
  isOpen,
  onClose,
  onSave,
  onDelete,
  availableTags,
}) => {
  const [editedNote, setEditedNote] = useState<Partial<Note>>({});
  const [newTag, setNewTag] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (note) {
      setEditedNote({
        title: note.title || '',
        content: note.content || '',
        tags: note.tags || [],
        pinned: note.pinned || false,
      });
    }
  }, [note]);

  const handleSave = () => {
    if (!note) return;
    
    onSave(note.id, editedNote);
    onClose();
  };

  const handleDelete = () => {
    if (!note) return;
    
    onDelete(note.id);
    onClose();
    setShowDeleteConfirm(false);
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !editedNote.tags?.includes(trimmedTag)) {
      setEditedNote({
        ...editedNote,
        tags: [...(editedNote.tags || []), trimmedTag],
      });
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setEditedNote({
      ...editedNote,
      tags: editedNote.tags?.filter(tag => tag !== tagToRemove) || [],
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      addTag(newTag);
    }
  };

  if (!note) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white border-opacity-20">
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setEditedNote({ ...editedNote, pinned: !editedNote.pinned })}
                  className={`p-2 rounded-lg transition-colors ${
                    editedNote.pinned 
                      ? 'text-yellow-600 bg-yellow-100' 
                      : 'text-gray-400 hover:text-yellow-600'
                  }`}
                >
                  <BookmarkIcon className="h-5 w-5" />
                </motion.button>
                <h2 className="text-xl font-bold text-gray-800">Edit Note</h2>
              </div>
              
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="btn-primary"
                >
                  Save Changes
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <XMarkIcon className="h-6 w-6" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col h-full max-h-[calc(90vh-80px)] overflow-hidden">
              <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editedNote.title || ''}
                    onChange={(e) => setEditedNote({ ...editedNote, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
                    placeholder="Enter note title..."
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="space-y-3">
                    {/* Existing Tags */}
                    <div className="flex flex-wrap gap-2">
                      {editedNote.tags?.map((tag, index) => (
                        <motion.span
                          key={index}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          <TagIcon className="h-3 w-3 mr-1" />
                          {tag}
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.8 }}
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </motion.button>
                        </motion.span>
                      ))}
                    </div>

                    {/* Add New Tag */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Add a tag..."
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addTag(newTag)}
                        disabled={!newTag.trim()}
                        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add
                      </motion.button>
                    </div>

                    {/* Available Tags */}
                    {availableTags.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Quick add:</p>
                        <div className="flex flex-wrap gap-1">
                          {availableTags
                            .filter(tag => !editedNote.tags?.includes(tag))
                            .slice(0, 10)
                            .map((tag) => (
                              <motion.button
                                key={tag}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => addTag(tag)}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors"
                              >
                                {tag}
                              </motion.button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <div className="border border-gray-300 rounded-xl overflow-hidden">
                    <RichTextEditor
                      content={editedNote.content || ''}
                      onChange={(content) => setEditedNote({ ...editedNote, content })}
                      placeholder="Write your note content here..."
                    />
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-sm font-medium">
                      {new Date(note.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Modified</p>
                    <p className="text-sm font-medium">
                      {new Date(note.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-gray-50 bg-opacity-50 border-t border-white border-opacity-20">
                <div className="flex items-center justify-between">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-600 hover:text-red-800 font-medium transition-colors"
                  >
                    Delete Note
                  </motion.button>
                  
                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onClose}
                      className="btn-secondary"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                      className="btn-primary"
                    >
                      Save Changes
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center"
                onClick={() => setShowDeleteConfirm(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="glass-card p-6 rounded-2xl max-w-md mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Note</h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this note? This action cannot be undone.
                  </p>
                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDelete}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NoteEditModal;
