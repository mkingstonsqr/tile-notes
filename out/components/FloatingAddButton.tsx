import { useState, useRef } from 'react'
import { Plus, FileText, Mic, Image, Link, Camera, Upload, X } from 'lucide-react'
import type { Note } from '../lib/supabase'

interface FloatingAddButtonProps {
  onCreateNote: (noteData: Partial<Note>) => Promise<Note | undefined>
}

export default function FloatingAddButton({ onCreateNote }: FloatingAddButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'text' | 'voice' | 'image' | 'link' | null>(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)

  const noteTypes = [
    { type: 'text', icon: FileText, label: 'Text Note', color: '#FFFACD' },
    { type: 'voice', icon: Mic, label: 'Voice Note', color: '#E6F3FF' },
    { type: 'image', icon: Image, label: 'Image Note', color: '#F0FFF0' },
    { type: 'link', icon: Link, label: 'Link Note', color: '#FFE4E1' },
  ]

  const openModal = (type: 'text' | 'voice' | 'image' | 'link') => {
    setModalType(type)
    setShowModal(true)
    setIsOpen(false)
    setNoteTitle('')
    setNoteContent('')
    setLinkUrl('')
    setRecordedBlob(null)
  }

  const closeModal = () => {
    setShowModal(false)
    setModalType(null)
    setNoteTitle('')
    setNoteContent('')
    setLinkUrl('')
    setRecordedBlob(null)
    if (isRecording) {
      stopRecording()
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setRecordedBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setNoteContent(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const fetchLinkPreview = async (url: string) => {
    try {
      // Simple URL validation
      new URL(url)
      setNoteContent(`Link: ${url}`)
      if (!noteTitle) {
        setNoteTitle(`Link to ${new URL(url).hostname}`)
      }
    } catch (error) {
      alert('Please enter a valid URL')
    }
  }

  const handleCreateNote = async () => {
    if (!modalType) return

    setIsCreating(true)
    try {
      const noteData: Partial<Note> = {
        title: noteTitle || `New ${modalType} note`,
        content: noteContent || `New ${modalType} note content`,
        note_type: modalType,
        color: noteTypes.find(t => t.type === modalType)?.color || '#FFFACD',
      }

      if (modalType === 'link' && linkUrl) {
        noteData.content = `${noteContent}\n\nURL: ${linkUrl}`
      }

      await onCreateNote(noteData)
      closeModal()
    } catch (error) {
      console.error('Error creating note:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50">
        {/* Note Type Options */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 space-y-3 animate-in slide-in-from-bottom-2 duration-200">
            {noteTypes.map(({ type, icon: Icon, label, color }) => (
              <button
                key={type}
                onClick={() => openModal(type as any)}
                className="flex items-center space-x-3 bg-white/80 backdrop-blur-md border border-white/30 px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
                style={{ backgroundColor: `${color}80` }}
              >
                <Icon size={20} className="text-gray-700 group-hover:text-black transition-colors" />
                <span className="text-gray-700 group-hover:text-black font-medium whitespace-nowrap">
                  {label}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isCreating}
          className={`w-14 h-14 bg-black text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${
            isCreating ? 'animate-pulse' : 'hover:scale-110'
          } ${isOpen ? 'rotate-45' : ''}`}
        >
          <Plus size={24} className="transition-transform duration-300" />
        </button>

        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>

      {/* Creation Modal */}
      {showModal && modalType && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-black">
                Create {noteTypes.find(t => t.type === modalType)?.label}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Enter note title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              {/* Type-specific content */}
              {modalType === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Start writing your note..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                  />
                </div>
              )}

              {modalType === 'voice' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voice Recording
                  </label>
                  <div className="flex items-center space-x-3">
                    {!isRecording ? (
                      <button
                        onClick={startRecording}
                        className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Mic size={18} />
                        <span>Start Recording</span>
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors animate-pulse"
                      >
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span>Stop Recording</span>
                      </button>
                    )}
                  </div>
                  {recordedBlob && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">✓ Recording completed</p>
                    </div>
                  )}
                </div>
              )}

              {modalType === 'image' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Upload size={18} />
                    <span>Choose Image</span>
                  </button>
                  {noteContent && (
                    <div className="mt-3">
                      <img
                        src={noteContent}
                        alt="Preview"
                        className="max-w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}

              {modalType === 'link' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                    <button
                      onClick={() => fetchLinkPreview(linkUrl)}
                      className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Preview
                    </button>
                  </div>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Add notes about this link..."
                    rows={3}
                    className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNote}
                disabled={isCreating || (modalType === 'voice' && !recordedBlob) || (modalType === 'image' && !noteContent) || (modalType === 'link' && !linkUrl)}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Create Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
