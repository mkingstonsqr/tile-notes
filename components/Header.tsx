import React from 'react';
import { motion } from 'framer-motion';
import { 
  Grid, 
  Calendar, 
  CheckSquare, 
  Settings,
  LogOut,
  User 
} from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';

type View = 'notes' | 'calendar' | 'tasks' | 'settings';

interface HeaderProps {
  user?: SupabaseUser;
  onSignOut?: () => Promise<void>;
  onOpenSettings?: () => void;
  notesCount?: number;
  currentView: View;
  onViewChange: (view: View) => void;
}

export default function Header({ 
  user, 
  onSignOut, 
  onOpenSettings, 
  notesCount, 
  currentView, 
  onViewChange 
}: HeaderProps) {
  const navItems = [
    { key: 'notes' as View, label: 'Notes', icon: Grid },
    { key: 'calendar' as View, label: 'Calendar', icon: Calendar },
    { key: 'tasks' as View, label: 'Tasks', icon: CheckSquare },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card border-b border-white border-opacity-20 sticky top-0 z-40"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center space-x-4"
          >
            <div className="text-3xl">📝</div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                TileNotes
              </h1>
              <p className="text-sm text-gray-300">
                Intelligent note-taking workspace
              </p>
            </div>
          </motion.div>
          
          {/* Navigation */}
          <div className="flex items-center space-x-1 bg-white bg-opacity-10 rounded-xl p-1">
            {navItems.map((item) => (
              <motion.button
                key={item.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onViewChange(item.key)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                  ${currentView === item.key 
                    ? 'bg-white text-gray-800 shadow-lg font-medium' 
                    : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }
                `}
              >
                <item.icon className="h-5 w-5" />
                <span className="hidden sm:inline">{item.label}</span>
              </motion.button>
            ))}
          </div>
          
          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {user && (
              <>
                <div className="hidden md:block text-right">
                  <p className="text-sm text-white font-medium">
                    {user.email?.split('@')[0]}
                  </p>
                  {notesCount !== undefined && (
                    <p className="text-xs text-gray-300">
                      {notesCount} notes
                    </p>
                  )}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onViewChange('settings')}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${currentView === 'settings'
                      ? 'bg-white text-gray-800'
                      : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-20'
                    }
                  `}
                  title="Settings"
                >
                  <Settings className="h-5 w-5" />
                </motion.button>
                
                {onSignOut && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onSignOut}
                    className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-500 hover:bg-opacity-20 rounded-lg transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="h-5 w-5" />
                  </motion.button>
                )}
              </>
            )}
            
            {!user && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <User className="h-5 w-5" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
