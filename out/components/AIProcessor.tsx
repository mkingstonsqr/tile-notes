import { useState, useEffect } from 'react'
import { Brain, Tag, FileText, Mic, Loader, CheckCircle, AlertCircle, Image } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from './auth/AuthGuard'
import { processNoteWithAI, transcribeAudio, generateImageDescription } from '../lib/openai'
import type { Note } from '../lib/supabase'

interface AIProcessorProps {
  note: Note
  onProcessingComplete?: (updatedNote: Note) => void
}

export default function AIProcessor({ note, onProcessingComplete }: AIProcessorProps) {
  const { user } = useAuth()
  const [processing, setProcessing] = useState(false)
  const [status, setStatus] = useState<'idle' | 'processing' | 'complete' | 'error'>('idle')
  const [results, setResults] = useState<{
    tags?: string[]
    summary?: string
    tasks?: string[]
    transcription?: string
  }>({})

  // Real AI processing using OpenAI
  const processNote = async () => {
    if (!user || processing) return

    setProcessing(true)
    setStatus('processing')

    try {
      let processedResults: any = {}

      // Process different note types with OpenAI
      if (note.note_type === 'voice') {
        // For voice notes, we would transcribe first, then process
        processedResults.transcription = "Voice transcription requires audio file - using OpenAI Whisper API"
        // In real implementation: const transcription = await transcribeAudio(audioBlob)
        processedResults = await processNoteWithAI(note.content, note.note_type)
      } else if (note.note_type === 'image' && note.content.startsWith('data:image')) {
        // For image notes, generate description first
        try {
          const description = await generateImageDescription(note.content)
          processedResults = await processNoteWithAI(description, 'image')
          processedResults.summary = description
        } catch (error) {
          console.error('Image processing error:', error)
          processedResults = await processNoteWithAI('Image content', note.note_type)
        }
      } else {
        // For text and link notes, process content directly
        processedResults = await processNoteWithAI(note.content, note.note_type)
      }

      setResults(processedResults)

      // Update note in database
      const updates: Partial<Note> = {
        ai_tags: processedResults.tags,
        ai_summary: processedResults.summary,
        ai_processed_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', note.id)

      if (error) throw error

      // Create tasks if extracted
      if (processedResults.tasks && processedResults.tasks.length > 0) {
        const taskInserts = processedResults.tasks.map((taskTitle: string) => ({
          user_id: user.id,
          note_id: note.id,
          title: taskTitle,
          is_completed: false,
          priority: 1
        }))

        await supabase
          .from('tasks')
          .insert(taskInserts)
      }

      setStatus('complete')
      onProcessingComplete?.({ ...note, ...updates })

    } catch (error) {
      console.error('AI processing error:', error)
      setStatus('error')
    } finally {
      setProcessing(false)
    }
  }

  // Auto-process new notes
  useEffect(() => {
    if (!note.ai_processed_at && note.content.trim().length > 10) {
      // Auto-process after a short delay
      const timer = setTimeout(() => {
        processNote()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [note.id])

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader className="animate-spin" size={16} />
      case 'complete':
        return <CheckCircle className="text-green-500" size={16} />
      case 'error':
        return <AlertCircle className="text-red-500" size={16} />
      default:
        return <Brain size={16} />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'processing':
        return 'Processing with AI...'
      case 'complete':
        return 'AI processing complete'
      case 'error':
        return 'Processing failed'
      default:
        return 'Ready for AI processing'
    }
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-gray-700">
            AI Assistant
          </span>
        </div>
        
        {!note.ai_processed_at && status !== 'processing' && (
          <button
            onClick={processNote}
            disabled={processing}
            className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            Process Now
          </button>
        )}
      </div>

      <p className="text-xs text-gray-600 mb-3">{getStatusText()}</p>

      {/* Processing Results */}
      {(results.tags || results.summary || results.tasks || results.transcription) && (
        <div className="space-y-3">
          {/* Tags */}
          {results.tags && results.tags.length > 0 && (
            <div>
              <div className="flex items-center space-x-1 mb-1">
                <Tag size={12} />
                <span className="text-xs font-medium text-gray-700">Generated Tags</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {results.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {results.summary && (
            <div>
              <div className="flex items-center space-x-1 mb-1">
                <FileText size={12} />
                <span className="text-xs font-medium text-gray-700">AI Summary</span>
              </div>
              <p className="text-xs text-gray-600 bg-white/50 p-2 rounded">
                {results.summary}
              </p>
            </div>
          )}

          {/* Extracted Tasks */}
          {results.tasks && results.tasks.length > 0 && (
            <div>
              <div className="flex items-center space-x-1 mb-1">
                <CheckCircle size={12} />
                <span className="text-xs font-medium text-gray-700">Extracted Tasks</span>
              </div>
              <div className="space-y-1">
                {results.tasks.map((task, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">{task}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transcription */}
          {results.transcription && (
            <div>
              <div className="flex items-center space-x-1 mb-1">
                <Mic size={12} />
                <span className="text-xs font-medium text-gray-700">Transcription</span>
              </div>
              <p className="text-xs text-gray-600 bg-white/50 p-2 rounded">
                {results.transcription}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Already processed indicator */}
      {note.ai_processed_at && status === 'idle' && (
        <div className="flex items-center space-x-2 text-xs text-green-600">
          <CheckCircle size={12} />
          <span>Processed {new Date(note.ai_processed_at).toLocaleDateString()}</span>
        </div>
      )}
    </div>
  )
}

// Hook for batch AI processing
export function useAIProcessor() {
  const { user } = useAuth()
  const [processingQueue, setProcessingQueue] = useState<string[]>([])

  const addToQueue = (noteId: string) => {
    setProcessingQueue(prev => [...prev, noteId])
  }

  const processQueue = async () => {
    // Implementation for batch processing
    console.log('Processing queue:', processingQueue)
  }

  return {
    addToQueue,
    processQueue,
    queueLength: processingQueue.length
  }
}
