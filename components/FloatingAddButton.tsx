import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus,
  FileText, 
  Mic, 
  Image, 
  Link, 
  X,
  Upload
} from 'lucide-react';
import type { Note } from '../lib/supabase';
import RichTextEditor from './enhanced/RichTextEditor';

interface FloatingAddButtonProps {
  onCreateNote: (noteData: Partial<Note>) => Promise<Note | undefined>;
}

export default function FloatingAddButton({ onCreateNote }: FloatingAddButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'text' | 'voice' | 'image' | 'link' | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const noteTypes = [
    { 
      type: 'text', 
      icon: FileText, 
      label: 'Text Note', 
      color: 'from-blue-500 to-purple-600',
      description: 'Write your thoughts'
    },
    { 
      type: 'voice', 
      icon: Mic, 
      label: 'Voice Note', 
      color: 'from-red-500 to-pink-600',
      description: 'Record audio'
    },
    { 
      type: 'image', 
      icon: Image, 
      label: 'Image Note', 
      color: 'from-green-500 to-teal-600',
      description: 'Upload pictures'
    },
    { 
      type: 'link', 
      icon: Link, 
      label: 'Link Note', 
      color: 'from-orange-500 to-red-600',
      description: 'Save web links'
    },
  ];

  const openModal = (type: 'text' | 'voice' | 'image' | 'link') => {
    setModalType(type);
    setShowModal(true);
    setIsOpen(false);
    setNoteTitle('');
    setNoteContent('');
    setLinkUrl('');
    setRecordedBlob(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
    setNoteTitle('');
    setNoteContent('');
    setLinkUrl('');
    setRecordedBlob(null);
    if (isRecording) {
      stopRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedBlob(blob);
        setNoteContent('Voice recording captured');
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNoteContent(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchLinkPreview = async (url: string) => {
    try {
      new URL(url);
      setNoteContent(`Link: ${url}`);
      if (!noteTitle) {
        setNoteTitle(`Link to ${new URL(url).hostname}`);
      }
    } catch (error) {
      alert('Please enter a valid URL');
    }
  };

  const handleCreateNote = async () => {
    console.log('🚀 FloatingAddButton: handleCreateNote started');
    console.log('🔍 FloatingAddButton: modalType:', modalType);
    
    if (!modalType) {
      console.error('❌ FloatingAddButton: No modalType set');
      return;
    }

    setIsCreating(true);
    try {
      console.log('🔍 FloatingAddButton: Building noteData object...');
      const noteData: Partial<Note> = {
        title: noteTitle || `New ${modalType} note`,
        content: noteContent || `New ${modalType} note content`,
        note_type: modalType,
        tags: [],
        pinned: false,
      };

      if (modalType === 'link' && linkUrl) {
        noteData.content = `${noteContent}\n\nURL: ${linkUrl}`;
        console.log('🔍 FloatingAddButton: Added link URL to content');
      }

      console.log('🔍 FloatingAddButton: Final noteData:', JSON.stringify(noteData, null, 2));
      console.log('🔍 FloatingAddButton: onCreateNote function type:', typeof onCreateNote);
      console.log('🔍 FloatingAddButton: onCreateNote function:', onCreateNote);
      
      // Test if the function exists
      if (typeof onCreateNote !== 'function') {
        const error = new Error(`onCreateNote is not a function (type: ${typeof onCreateNote})`);
        console.error('❌ FloatingAddButton: Function validation failed:', error);
        throw error;
      }
      
      console.log('🔍 FloatingAddButton: Calling onCreateNote function...');
      const result = await onCreateNote(noteData);
      console.log('🔍 FloatingAddButton: onCreateNote returned:', result);
      console.log('🔍 FloatingAddButton: Result type:', typeof result);
      
      if (!result) {
        const error = new Error('Note creation returned no result (null/undefined)');
        console.error('❌ FloatingAddButton: No result returned:', error);
        throw error;
      }
      
      console.log('✅ FloatingAddButton: Note created successfully, closing modal');
      closeModal();
    } catch (error) {
      console.error('❌ FloatingAddButton: Caught error in handleCreateNote:', error);
      console.error('❌ FloatingAddButton: Error type:', typeof error);
      console.error('❌ FloatingAddButton: Error constructor:', error?.constructor?.name);
      
      if (error instanceof Error) {
        console.error('❌ FloatingAddButton: Error message:', error.message);
        console.error('❌ FloatingAddButton: Error stack:', error.stack);
      }
      
      // Create detailed error message
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        errorMessage = `Unexpected error type: ${typeof error}`;
      }
      
      console.error('❌ FloatingAddButton: Final error message:', errorMessage);
      alert(`Failed to create note: ${errorMessage}`);
    } finally {
      console.log('🔍 FloatingAddButton: Setting isCreating to false');
      setIsCreating(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-8 right-8 z-50"
      >
        {/* Note Type Options */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-20 right-0 space-y-3"
            >
              {noteTypes.map(({ type, icon: Icon, label, color, description }, index) => (
                <motion.button
                  key={type}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => openModal(type as any)}
                  className={`
                    flex items-center space-x-3 glass-card px-4 py-3 rounded-xl 
                    hover:shadow-xl transition-all duration-200 hover:scale-105 group
                    bg-gradient-to-r ${color} text-white
                  `}
                  whileHover={{ x: -5 }}
                >
                  <Icon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium whitespace-nowrap">{label}</div>
                    <div className="text-xs opacity-90">{description}</div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          disabled={isCreating}
          className={`
            w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full 
            shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center
            ${isCreating ? 'animate-pulse' : ''}
          `}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus className="h-8 w-8" />
          </motion.div>
        </motion.button>

        {/* Backdrop */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 -z-10"
              onClick={() => setIsOpen(false)}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Creation Modal */}
      <AnimatePresence>
        {showModal && modalType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card rounded-2xl max-w-4xl w-full h-[95vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white border-opacity-20">
                <div className="flex items-center space-x-3">
                  {(() => {
                    const noteType = noteTypes.find(t => t.type === modalType);
                    const Icon = noteType?.icon || FileText;
                    return <Icon className="h-6 w-6 text-white" />;
                  })()}
                  <h2 className="text-xl font-bold text-white">
                    Create {noteTypes.find(t => t.type === modalType)?.label}
                  </h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Title Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Enter note title..."
                    className="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-300"
                    autoFocus
                  />
                </div>

                {/* Type-specific content */}
                {modalType === 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Content
                    </label>
                    <div className="bg-white rounded-lg" style={{ minHeight: '60vh' }}>
                      <RichTextEditor
                        value={noteContent}
                        onChange={setNoteContent}
                        placeholder="Start writing your note..."
                        className="min-h-full"
                      />
                    </div>
                  </div>
                )}

                {modalType === 'voice' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Voice Recording
                    </label>
                    <div className="flex items-center space-x-3">
                      {!isRecording ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={startRecording}
                          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Mic className="h-4 w-4" />
                          <span>Start Recording</span>
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={stopRecording}
                          className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="w-3 h-3 bg-red-500 rounded-full"
                          />
                          <span>Stop Recording</span>
                        </motion.button>
                      )}
                    </div>
                    {recordedBlob && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 p-3 bg-green-500 bg-opacity-20 border border-green-400 rounded-lg"
                      >
                        <p className="text-sm text-green-300">✓ Recording completed</p>
                      </motion.div>
                    )}
                  </div>
                )}

                {modalType === 'image' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Image
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Choose Image</span>
                    </motion.button>
                    {noteContent && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-3"
                      >
                        <img
                          src={noteContent}
                          alt="Preview"
                          className="max-w-full h-32 object-cover rounded-lg border border-white border-opacity-30"
                        />
                      </motion.div>
                    )}
                  </div>
                )}

                {modalType === 'link' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      URL
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="flex-1 px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-300"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fetchLinkPreview(linkUrl)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Preview
                      </motion.button>
                    </div>
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Add notes about this link..."
                      rows={3}
                      className="w-full mt-3 px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-white placeholder-gray-300"
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-white border-opacity-20">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateNote}
                  disabled={
                    isCreating || 
                    (modalType === 'voice' && !recordedBlob) || 
                    (modalType === 'image' && !noteContent) || 
                    (modalType === 'link' && !linkUrl)
                  }
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Create Note'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
