import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link2, 
  CheckSquare,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  EyeOff
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing...",
  className = ""
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#3B3B3B');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const colors = [
    { color: '#3B3B3B', name: 'Dark Gray' },
    { color: '#FF5757', name: 'Red' }
  ];

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newValue = 
      value.substring(0, start) + 
      before + selectedText + after + 
      value.substring(end);
    
    onChange(newValue);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length, 
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const insertColoredText = () => {
    insertFormatting(`<span style="color: ${selectedColor}">`, '</span>');
  };

  const insertCheckbox = () => {
    insertFormatting('☐ ');
  };

  const formatButtons = [
    { 
      icon: Bold, 
      label: 'Bold', 
      action: () => insertFormatting('**', '**'),
      shortcut: 'Ctrl+B'
    },
    { 
      icon: Italic, 
      label: 'Italic', 
      action: () => insertFormatting('*', '*'),
      shortcut: 'Ctrl+I'
    },
    { 
      icon: Underline, 
      label: 'Underline', 
      action: () => insertFormatting('<u>', '</u>'),
      shortcut: 'Ctrl+U'
    },
    { 
      icon: List, 
      label: 'Bullet List', 
      action: () => insertFormatting('• '),
      shortcut: 'Ctrl+Shift+8'
    },
    { 
      icon: ListOrdered, 
      label: 'Numbered List', 
      action: () => insertFormatting('1. '),
      shortcut: 'Ctrl+Shift+7'
    },
    { 
      icon: CheckSquare, 
      label: 'Checkbox', 
      action: insertCheckbox,
      shortcut: 'Ctrl+Shift+C'
    },
    { 
      icon: Link2, 
      label: 'Link', 
      action: () => insertFormatting('[', '](url)'),
      shortcut: 'Ctrl+K'
    },
  ];

  const alignButtons = [
    { icon: AlignLeft, label: 'Align Left', action: () => insertFormatting('<div style="text-align: left">', '</div>') },
    { icon: AlignCenter, label: 'Align Center', action: () => insertFormatting('<div style="text-align: center">', '</div>') },
    { icon: AlignRight, label: 'Align Right', action: () => insertFormatting('<div style="text-align: right">', '</div>') },
  ];

  const renderPreview = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong style="font-family: Roboto, sans-serif;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="font-family: Roboto, sans-serif;">$1</em>')
      .replace(/<u>(.*?)<\/u>/g, '<u style="font-family: Roboto, sans-serif;">$1</u>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-2" style="font-family: Roboto, sans-serif;">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mb-2" style="font-family: Roboto, sans-serif;">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mb-2" style="font-family: Roboto, sans-serif;">$1</h3>')
      .replace(/^• (.*$)/gm, '<li class="ml-4" style="font-family: Roboto, sans-serif;">• $1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal" style="font-family: Roboto, sans-serif;">$1</li>')
      .replace(/☐ (.*$)/gm, '<label class="flex items-center space-x-2"><input type="checkbox" class="rounded"> <span style="font-family: Roboto, sans-serif;">$1</span></label>')
      .replace(/☑ (.*$)/gm, '<label class="flex items-center space-x-2"><input type="checkbox" checked class="rounded"> <span class="line-through text-gray-500" style="font-family: Roboto, sans-serif;">$1</span></label>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 underline hover:text-blue-800" target="_blank" style="font-family: Roboto, sans-serif;">$1</a>')
      .replace(/\n/g, '<br>');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          insertFormatting('**', '**');
          break;
        case 'i':
          e.preventDefault();
          insertFormatting('*', '*');
          break;
        case 'u':
          e.preventDefault();
          insertFormatting('<u>', '</u>');
          break;
        case 'k':
          e.preventDefault();
          insertFormatting('[', '](url)');
          break;
      }
    }
    
    if (e.ctrlKey && e.shiftKey) {
      switch (e.key) {
        case '8':
          e.preventDefault();
          insertFormatting('• ');
          break;
        case '7':
          e.preventDefault();
          insertFormatting('1. ');
          break;
        case 'C':
          e.preventDefault();
          insertCheckbox();
          break;
      }
    }
  };

  return (
    <div className={`bg-white bg-opacity-90 backdrop-blur-sm rounded-xl border border-gray-200 overflow-hidden shadow-lg ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-4 bg-white bg-opacity-50 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Format Buttons */}
          <div className="flex items-center space-x-2">
            {formatButtons.map(({ icon: Icon, label, action, shortcut }) => (
              <motion.button
                key={label}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={action}
                className="p-2.5 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-md hover:shadow-lg transition-all duration-200 text-gray-700 hover:text-gray-900 border border-gray-200"
                title={`${label} (${shortcut})`}
              >
                <Icon size={16} />
              </motion.button>
            ))}
          </div>

          <div className="w-px h-8 bg-gray-300 opacity-50" />

          {/* Alignment Buttons */}
          <div className="flex items-center space-x-2">
            {alignButtons.map(({ icon: Icon, label, action }) => (
              <motion.button
                key={label}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={action}
                className="p-2.5 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-md hover:shadow-lg transition-all duration-200 text-gray-700 hover:text-gray-900 border border-gray-200"
                title={label}
              >
                <Icon size={16} />
              </motion.button>
            ))}
          </div>

          <div className="w-px h-8 bg-gray-300 opacity-50" />

          {/* Color Picker */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Color:</span>
            <div className="flex space-x-2">
              {colors.map(({ color, name }) => (
                <motion.button
                  key={color}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setSelectedColor(color);
                    insertColoredText();
                  }}
                  className={`w-8 h-8 rounded-full shadow-md hover:shadow-lg transition-all duration-200 border-2 ${
                    selectedColor === color 
                      ? 'border-gray-800 ring-2 ring-gray-300' 
                      : 'border-white hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Text color: ${name}`}
                />
              ))}
            </div>
          </div>

          <div className="w-px h-8 bg-gray-300 opacity-50" />

          {/* Preview Toggle */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsPreview(!isPreview)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 border ${
              isPreview 
                ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200' 
                : 'bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-700 hover:text-gray-900 border-gray-200'
            }`}
          >
            {isPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            <span className="text-sm font-medium">
              {isPreview ? 'Edit' : 'Preview'}
            </span>
          </motion.button>
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div className="min-h-[200px] bg-white bg-opacity-90 backdrop-blur-sm">
        {isPreview ? (
          <div 
            className="p-6 prose prose-sm max-w-none min-h-[200px] overflow-auto"
            style={{ fontFamily: 'Roboto, sans-serif' }}
            dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full min-h-[200px] p-6 resize-none outline-none text-gray-800 placeholder-gray-400 border-0 bg-transparent"
            style={{ 
              minHeight: '200px',
              fontFamily: 'Roboto, sans-serif',
              fontSize: '16px',
              lineHeight: '1.6'
            }}
          />
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-3 bg-white bg-opacity-50 backdrop-blur-sm text-xs text-gray-500">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <div style={{ fontFamily: 'Roboto, sans-serif' }}>
              <strong>**Bold**</strong> • <em>*Italic*</em> • <u>Underline</u> • • Bullets • 1. Numbers • ☐ Checkboxes
            </div>
            <div style={{ fontFamily: 'Roboto, sans-serif' }}>
              Shortcuts: Ctrl+B (Bold), Ctrl+I (Italic), Ctrl+U (Underline), Ctrl+K (Link)
            </div>
          </div>
          <span style={{ fontFamily: 'Roboto, sans-serif' }}>
            {value.length} characters
          </span>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
