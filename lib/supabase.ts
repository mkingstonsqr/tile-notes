import { createClient } from '@supabase/supabase-js'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Debug logging for environment variables
console.log('🔍 Supabase Configuration:');
console.log('🔍 NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'MISSING');
console.log('🔍 NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING');
console.log('🔍 URL length:', supabaseUrl?.length || 0);
console.log('🔍 Key length:', supabaseAnonKey?.length || 0);

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is missing!');
}
if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing!');
}

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test the client creation
console.log('🔍 Supabase client created:', !!supabase);
console.log('🔍 Supabase client methods:', Object.keys(supabase));

// Database types
export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  preferences?: any
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  user_id: string
  title?: string
  content: string
  note_type: 'text' | 'voice' | 'image' | 'link'
  ai_summary?: string
  ai_tags?: string[]
  ai_processed_at?: string
  tags?: string[]
  pinned?: boolean
  color: string
  position_x: number
  position_y: number
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  note_id?: string
  title: string
  description?: string
  is_completed: boolean
  completed_at?: string
  due_date?: string
  reminder_time?: string
  priority: 'low' | 'medium' | 'high'
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  user_id: string
  name: string
  color: string
  is_ai_generated: boolean
  usage_count: number
  created_at: string
}

export interface UserSettings {
  user_id: string
  daily_task_summary: boolean
  email_time: string
  timezone: string
  default_note_color: string
  auto_ai_processing: boolean
  created_at: string
  updated_at: string
}
