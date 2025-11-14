# TileNotes Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Set project name: **TileNotes**
5. Set database password (save this!)
6. Choose region closest to your users
7. Click "Create new project"

## Step 2: Configure Database

### Run the Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the entire contents of `database/schema.sql`
4. Click "Run" to execute the schema

### Enable Storage
1. Go to **Storage** in the sidebar
2. Click "Create a new bucket"
3. Bucket name: `attachments`
4. Set to **Public** (for file access)
5. Click "Create bucket"

### Configure Storage Policies
```sql
-- Allow users to upload files to their own folder
CREATE POLICY "Users can upload own attachments" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'attachments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own files
CREATE POLICY "Users can view own attachments" ON storage.objects
FOR SELECT USING (
  bucket_id = 'attachments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own attachments" ON storage.objects
FOR DELETE USING (
  bucket_id = 'attachments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Step 3: Configure Authentication

### Email Settings
1. Go to **Authentication** → **Settings**
2. Set **Site URL** to your domain (e.g., `https://tilenotes.app`)
3. Add redirect URLs for development: `http://localhost:3000`

### Email Templates (Optional)
1. Go to **Authentication** → **Email Templates**
2. Customize the confirmation and reset password emails
3. Add your branding and styling

## Step 4: Get API Keys

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxx.supabase.co`)
   - **Project API Key** (anon/public key)
   - **Service Role Key** (for server-side operations)

## Step 5: Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Configuration (for background processing)
OPENAI_API_KEY=your_openai_key
# or
ANTHROPIC_API_KEY=your_anthropic_key

# Email Configuration (for daily summaries)
RESEND_API_KEY=your_resend_key
# or
SENDGRID_API_KEY=your_sendgrid_key
```

## Step 6: Test the Setup

### Verify Tables
Run this query in SQL Editor to check all tables were created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- attachments
- ai_processing_queue  
- note_tags
- notes
- profiles
- tags
- tasks
- user_settings

### Test RLS Policies
1. Create a test user through your app
2. Try inserting a note
3. Verify the user can only see their own data

## Step 7: Optional Configurations

### Real-time Subscriptions
Enable real-time for collaborative features:
```sql
-- Enable real-time on notes table
ALTER PUBLICATION supabase_realtime ADD TABLE notes;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
```

### Database Functions
The schema includes helpful functions:
- `handle_new_user()` - Automatically creates profile on signup
- `update_updated_at_column()` - Updates timestamps automatically

### Indexes
The schema includes optimized indexes for:
- User-specific queries
- Date-based searches  
- Tag-based filtering
- Task management

## Troubleshooting

### Common Issues

**1. RLS Policy Errors**
- Make sure you're authenticated when testing
- Check that `auth.uid()` returns the correct user ID

**2. Storage Upload Fails**
- Verify bucket policies are set correctly
- Check file size limits (default 50MB)
- Ensure bucket is public if serving files directly

**3. Function Errors**
- Check that extensions are enabled (`uuid-ossp`)
- Verify trigger functions are created properly

### Getting Help
- Check Supabase logs in the dashboard
- Use the SQL Editor to test queries
- Review the Supabase documentation for specific features

## Next Steps

Once your database is set up:
1. Install Supabase client in your app
2. Configure authentication
3. Test basic CRUD operations
4. Set up AI processing pipeline
5. Implement real-time features
