-- Migration: Add missing columns to existing tables
-- Run this in Supabase SQL Editor to update the database schema

-- Add missing columns to notes table
ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT FALSE;

-- Update tasks table to match interface
ALTER TABLE tasks 
ALTER COLUMN due_date TYPE TEXT,
ALTER COLUMN priority DROP DEFAULT,
ALTER COLUMN priority TYPE TEXT,
ADD CONSTRAINT tasks_priority_check CHECK (priority IN ('low', 'medium', 'high'));

-- Set default for priority
ALTER TABLE tasks ALTER COLUMN priority SET DEFAULT 'medium';

-- Add reminder_time column if it doesn't exist
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS reminder_time TEXT;

-- Update any existing tasks to have the correct priority format
UPDATE tasks SET priority = 'medium' WHERE priority IS NULL OR priority NOT IN ('low', 'medium', 'high');

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(pinned) WHERE pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN(tags);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
