import { Plus, Settings, User, LogOut } from 'lucide-react'
import { User as SupabaseUser } from '@supabase/supabase-js'

interface HeaderProps {
  onAddNote?: () => void
  user?: SupabaseUser
  onSignOut?: () => Promise<void>
  notesCount?: number
}

export default function Header({ onAddNote, user, onSignOut, notesCount }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              📝 Tile Notes
            </h1>
            <span className="text-sm text-gray-500">
              Visual note organization
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            {onAddNote && (
              <button
                onClick={onAddNote}
                className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus size={18} />
                <span>New Note</span>
              </button>
            )}
            
            {user && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {user.email} {notesCount !== undefined && `(${notesCount} notes)`}
                </span>
                
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Settings size={20} />
                </button>
                
                {onSignOut && (
                  <button 
                    onClick={onSignOut}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Sign Out"
                  >
                    <LogOut size={20} />
                  </button>
                )}
              </div>
            )}
            
            {!user && (
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <User size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
