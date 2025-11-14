-- Create a function that can set up the TileNotes schema
-- This can be called via the REST API

CREATE OR REPLACE FUNCTION setup_tilenotes_database()
RETURNS TEXT AS $main$
BEGIN
  -- Enable extensions
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  
  -- Create profiles table
  CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create notes table
  CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    note_type TEXT CHECK (note_type IN ('text', 'voice', 'image', 'link')) DEFAULT 'text',
    ai_summary TEXT,
    ai_tags TEXT[],
    ai_processed_at TIMESTAMP WITH TIME ZONE,
    color TEXT DEFAULT '#FFFACD',
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create tasks table
  CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    due_date TIMESTAMP WITH TIME ZONE,
    reminder_date TIMESTAMP WITH TIME ZONE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
  );

  -- Create other tables
  CREATE TABLE IF NOT EXISTS attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    storage_path TEXT NOT NULL,
    transcription TEXT,
    alt_text TEXT,
    ai_processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    is_ai_generated BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
  );

  CREATE TABLE IF NOT EXISTS note_tags (
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (note_id, tag_id)
  );

  CREATE TABLE IF NOT EXISTS ai_processing_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    processing_type TEXT CHECK (processing_type IN ('summarize', 'extract_tags', 'extract_tasks', 'transcribe')) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    result JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
  );

  CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
    daily_task_summary BOOLEAN DEFAULT TRUE,
    email_time TIME DEFAULT '09:00:00',
    timezone TEXT DEFAULT 'UTC',
    default_note_color TEXT DEFAULT '#FFFACD',
    auto_ai_processing BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
  CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
  CREATE INDEX IF NOT EXISTS idx_attachments_note_id ON attachments(note_id);

  -- Enable RLS
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
  ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
  ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
  ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;
  ALTER TABLE ai_processing_queue ENABLE ROW LEVEL SECURITY;
  ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

  -- Create policies
  DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
  CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
  
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

  DROP POLICY IF EXISTS "Users can manage own notes" ON notes;
  CREATE POLICY "Users can manage own notes" ON notes FOR ALL USING (auth.uid() = user_id);
  
  DROP POLICY IF EXISTS "Users can manage own tasks" ON tasks;
  CREATE POLICY "Users can manage own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);
  
  DROP POLICY IF EXISTS "Users can manage own attachments" ON attachments;
  CREATE POLICY "Users can manage own attachments" ON attachments FOR ALL USING (auth.uid() = user_id);
  
  DROP POLICY IF EXISTS "Users can manage own tags" ON tags;
  CREATE POLICY "Users can manage own tags" ON tags FOR ALL USING (auth.uid() = user_id);
  
  DROP POLICY IF EXISTS "Users can manage own note_tags" ON note_tags;
  CREATE POLICY "Users can manage own note_tags" ON note_tags FOR ALL USING (
    EXISTS (SELECT 1 FROM notes WHERE notes.id = note_tags.note_id AND notes.user_id = auth.uid())
  );
  
  DROP POLICY IF EXISTS "Users can view own ai_processing_queue" ON ai_processing_queue;
  CREATE POLICY "Users can view own ai_processing_queue" ON ai_processing_queue FOR ALL USING (auth.uid() = user_id);
  
  DROP POLICY IF EXISTS "Users can manage own settings" ON user_settings;
  CREATE POLICY "Users can manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

  -- Create functions
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $func$
  BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
  END;
  $func$ language 'plpgsql';

  -- Create triggers
  DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
  CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
  DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
  CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
  DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
  CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
  DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
  CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  -- Create user signup function
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER AS $user_func$
  BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
    ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
  END;
  $user_func$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Create user signup trigger
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

  RETURN 'TileNotes database setup completed successfully!';
END;
$main$ LANGUAGE plpgsql SECURITY DEFINER;
