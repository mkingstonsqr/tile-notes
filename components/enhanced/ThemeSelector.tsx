import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sparkles, Sun } from 'lucide-react';

type Theme = 'dark' | 'glassy' | 'afternoon';

interface ThemeSelectorProps {
  onThemeChange: (theme: Theme) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onThemeChange }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>('glassy');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('tilenotes-theme') as Theme;
    if (savedTheme && ['dark', 'glassy', 'afternoon'].includes(savedTheme)) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to glassy
      setCurrentTheme('glassy');
      applyTheme('glassy');
    }
  }, []);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-glassy', 'theme-afternoon');
    
    // Apply new theme
    root.classList.add(`theme-${theme}`);
    
    // Update CSS custom properties
    switch (theme) {
      case 'dark':
        root.style.setProperty('--bg-primary', '#111827');
        root.style.setProperty('--bg-secondary', '#1f2937');
        root.style.setProperty('--text-primary', '#f9fafb');
        root.style.setProperty('--text-secondary', '#d1d5db');
        root.style.setProperty('--glass-bg', 'rgba(0, 0, 0, 0.4)');
        root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.1)');
        break;
      case 'glassy':
        root.style.setProperty('--bg-primary', 'transparent');
        root.style.setProperty('--bg-secondary', 'rgba(255, 255, 255, 0.05)');
        root.style.setProperty('--text-primary', '#ffffff');
        root.style.setProperty('--text-secondary', '#e5e7eb');
        root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.1)');
        root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.2)');
        break;
      case 'afternoon':
        root.style.setProperty('--bg-primary', '#fafbfc');
        root.style.setProperty('--bg-secondary', '#ffffff');
        root.style.setProperty('--text-primary', '#1d1d1f');
        root.style.setProperty('--text-secondary', '#6e6e73');
        root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.8)');
        root.style.setProperty('--glass-border', 'rgba(0, 0, 0, 0.1)');
        break;
    }
    
    onThemeChange(theme);
  };

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    localStorage.setItem('tilenotes-theme', theme);
    setIsOpen(false);
  };

  const themes = [
    {
      key: 'dark' as Theme,
      name: 'Dark',
      icon: Moon,
      description: 'Easy on the eyes',
      preview: 'bg-gray-900 border-gray-700',
    },
    {
      key: 'glassy' as Theme,
      name: 'Glassy',
      icon: Sparkles,
      description: 'Translucent beauty',
      preview: 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-white/30',
    },
    {
      key: 'afternoon' as Theme,
      name: 'Afternoon',
      icon: Sun,
      description: 'Clean & bright',
      preview: 'bg-gradient-to-br from-orange-100 to-yellow-100 border-orange-200',
    },
  ];

  const currentThemeData = themes.find(t => t.key === currentTheme);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 backdrop-blur-lg rounded-xl border border-white border-opacity-30 hover:bg-opacity-30 transition-all duration-200"
      >
        {currentThemeData && (
          <>
            <currentThemeData.icon className="h-5 w-5" />
            <span className="text-sm font-medium">{currentThemeData.name}</span>
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Theme Selector Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full mt-2 right-0 z-50 w-64 glass-card rounded-2xl p-4 shadow-xl"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Choose Theme</h3>
              
              <div className="space-y-2">
                {themes.map((theme) => (
                  <motion.button
                    key={theme.key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleThemeChange(theme.key)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                      currentTheme === theme.key
                        ? 'bg-blue-500 bg-opacity-20 border-2 border-blue-400'
                        : 'hover:bg-white hover:bg-opacity-10 border-2 border-transparent'
                    }`}
                  >
                    {/* Theme Preview */}
                    <div className={`w-8 h-8 rounded-lg border-2 ${theme.preview}`} />
                    
                    {/* Theme Info */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center space-x-2">
                        <theme.icon className="h-4 w-4" />
                        <span className="font-medium">{theme.name}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{theme.description}</p>
                    </div>
                    
                    {/* Selected Indicator */}
                    {currentTheme === theme.key && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-blue-500 rounded-full"
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Theme Effects Note */}
              <div className="mt-4 p-3 bg-blue-50 bg-opacity-50 rounded-xl">
                <p className="text-xs text-blue-800">
                  <Sparkles className="h-3 w-3 inline mr-1" />
                  Themes affect the entire app appearance and are saved automatically.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSelector;
