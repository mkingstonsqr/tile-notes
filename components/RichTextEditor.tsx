import { useState, useRef, useEffect } from 'react'
import { Bold, Italic, Underline, List, ListOrdered, Link, Quote, Hash, Save, X } from 'lucide-react'

interface RichTextEditorProps {
  initialContent: string
  onSave: (content: string) => void
  onCancel: () => void
  placeholder?: string
}

export default function RichTextEditor({ 
  initialContent, 
  onSave, 
  onCancel, 
  placeholder = "Start writing..." 
}: RichTextEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isPreview, setIsPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
      // Auto-resize textarea
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [content])

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    const newContent = 
      content.substring(0, start) + 
      before + selectedText + after + 
      content.substring(end)
    
    setContent(newContent)
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length, 
        start + before.length + selectedText.length
      )
    }, 0)
  }

  const formatButtons = [
    { icon: Bold, label: 'Bold', action: () => insertFormatting('**', '**') },
    { icon: Italic, label: 'Italic', action: () => insertFormatting('*', '*') },
    { icon: Underline, label: 'Underline', action: () => insertFormatting('<u>', '</u>') },
    { icon: Hash, label: 'Heading', action: () => insertFormatting('# ') },
    { icon: List, label: 'Bullet List', action: () => insertFormatting('- ') },
    { icon: ListOrdered, label: 'Numbered List', action: () => insertFormatting('1. ') },
    { icon: Quote, label: 'Quote', action: () => insertFormatting('> ') },
    { icon: Link, label: 'Link', action: () => insertFormatting('[', '](url)') },
  ]

  const renderPreview = (text: string) => {
    // Simple markdown-like rendering
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-2">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mb-2">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mb-2">$1</h3>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic">$1</blockquote>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 underline" target="_blank">$1</a>')
      .replace(/\n/g, '<br>')
  }

  const extractTasks = (text: string) => {
    const taskRegex = /\*\*(.*?)\*\*/g
    const tasks = []
    let match
    
    while ((match = taskRegex.exec(text)) !== null) {
      tasks.push(match[1])
    }
    
    return tasks
  }

  const handleSave = () => {
    const tasks = extractTasks(content)
    if (tasks.length > 0) {
      // Could trigger AI processing for task extraction here
      console.log('Extracted tasks:', tasks)
    }
    onSave(content)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave()
    } else if (e.key === 'Escape') {
      onCancel()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      insertFormatting('  ')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {formatButtons.map(({ icon: Icon, label, action }) => (
              <button
                key={label}
                onClick={action}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title={label}
              >
                <Icon size={16} />
              </button>
            ))}
            
            <div className="w-px h-6 bg-gray-300 mx-2" />
            
            <button
              onClick={() => setIsPreview(!isPreview)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                isPreview 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isPreview ? 'Edit' : 'Preview'}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onCancel}
              className="flex items-center space-x-1 px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-1 bg-black text-white px-3 py-1 rounded hover:bg-gray-800 transition-colors"
            >
              <Save size={16} />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor/Preview */}
      <div className="p-4">
        {isPreview ? (
          <div 
            className="prose prose-sm max-w-none min-h-[200px]"
            dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full min-h-[200px] resize-none outline-none text-gray-800 placeholder-gray-400"
            style={{ height: 'auto' }}
          />
        )}
      </div>

      {/* Footer with tips */}
      <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 text-xs text-gray-500">
        <div className="flex justify-between items-center">
          <span>
            **Bold text** will be extracted as tasks • Use Cmd/Ctrl+Enter to save
          </span>
          <span>
            {content.length} characters
          </span>
        </div>
      </div>
    </div>
  )
}
