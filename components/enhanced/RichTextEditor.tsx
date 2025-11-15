import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link2, 
  Type,
  Palette,
  CheckSquare,
  AlignLeft,
  AlignCenter,
  AlignRight
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
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [selectedSize, setSelectedSize] = useState('16');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000'
  ];

  const fontSizes = ['12', '14', '16', '18', '20', '24', '28', '32'];

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

  const insertSizedText = () => {
    insertFormatting(`<span style="font-size: ${selectedSize}px">`, '</span>');
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
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-2">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mb-2">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mb-2">$1</h3>')
      .replace(/^• (.*$)/gm, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
      .replace(/☐ (.*$)/gm, '<label class="flex items-center space-x-2"><input type="checkbox" class="rounded"> <span>$1</span></label>')
      .replace(/☑ (.*$)/gm, '<label class="flex items-center space-x-2"><input type="checkbox" checked class="rounded"> <span class="line-through text-gray-500">$1</span></label>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 underline hover:text-blue-800" target="_blank">$1</a>')
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
    <div className={`bg-white rounded-lg border border-gray-300 overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-3 bg-gray-50">
        <div className="flex flex-wrap items-center gap-2">
          {/* Format Buttons */}
          <div className="flex items-center space-x-1">
            {formatButtons.map(({ icon: Icon, label, action, shortcut }) => (
              <motion.button
                key={label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={action}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title={`${label} (${shortcut})`}
              >
                <Icon size={16} />
              </motion.button>
            ))}
          </div>

          <div className="w-px h-6 bg-gray-300" />

          {/* Alignment Buttons */}
          <div className="flex items-center space-x-1">
            {alignButtons.map(({ icon: Icon, label, action }) => (
              <motion.button
                key={label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={action}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title={label}
              >
                <Icon size={16} />
              </motion.button>
            ))}
          </div>

          <div className="w-px h-6 bg-gray-300" />

          {/* Color Picker */}
          <div className="flex items-center space-x-2">
            <Palette size={16} className="text-gray-600" />
            <div className="flex space-x-1">
              {colors.map((color) => (
                <motion.button
                  key={color}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setSelectedColor(color);
                    insertColoredText();
                  }}
                  className={`w-6 h-6 rounded border-2 transition-all ${
                    selectedColor === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Text color: ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="w-px h-6 bg-gray-300" />

          {/* Font Size */}
          <div className="flex items-center space-x-2">
            <Type size={16} className="text-gray-600" />
            <select
              value={selectedSize}
              onChange={(e) => {
                setSelectedSize(e.target.value);
                insertSizedText();
              }}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              {fontSizes.map(size => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
          </div>

          <div className="w-px h-6 bg-gray-300" />

          {/* Preview Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsPreview(!isPreview)}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              isPreview 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isPreview ? 'Edit' : 'Preview'}
          </motion.button>
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div className="min-h-[200px]">
        {isPreview ? (
          <div 
            className="p-4 prose prose-sm max-w-none min-h-[200px] overflow-auto"
            dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full min-h-[200px] p-4 resize-none outline-none text-gray-800 placeholder-gray-400 border-0"
            style={{ minHeight: '200px' }}
          />
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 text-xs text-gray-500">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <div>**Bold** • *Italic* • <u>Underline</u> • • Bullets • 1. Numbers • ☐ Checkboxes</div>
            <div>Shortcuts: Ctrl+B (Bold), Ctrl+I (Italic), Ctrl+U (Underline), Ctrl+K (Link)</div>
          </div>
          <span>{value.length} characters</span>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
