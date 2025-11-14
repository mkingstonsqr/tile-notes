#!/usr/bin/env node

/**
 * TileNotes Supabase Setup Script
 * Automatically creates the database schema and configuration
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function setupSupabase() {
  log('🚀 TileNotes Supabase Setup', 'green');
  log('================================', 'blue');

  // Check for environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    log('❌ Missing required environment variables:', 'red');
    log('Please set:', 'yellow');
    log('  SUPABASE_URL=https://your-project-id.supabase.co', 'yellow');
    log('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key', 'yellow');
    log('', 'reset');
    log('You can find these in your Supabase project dashboard:', 'blue');
    log('  Settings → API → Project URL & Service Role Key', 'blue');
    process.exit(1);
  }

  log(`📡 Connecting to: ${supabaseUrl}`, 'blue');

  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error('Schema file not found: database/schema.sql');
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    log('📋 Schema file loaded', 'green');

    // Execute schema using Supabase REST API
    log('🔧 Creating database tables...', 'yellow');
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: schema
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Database setup failed: ${response.status} - ${error}`);
    }

    log('✅ Database schema created successfully', 'green');

    // Create storage bucket
    log('📁 Setting up file storage...', 'yellow');
    
    const bucketResponse = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: 'attachments',
        name: 'attachments',
        public: true,
        file_size_limit: 52428800, // 50MB
        allowed_mime_types: ['image/*', 'audio/*', 'application/pdf', 'text/*']
      })
    });

    if (bucketResponse.ok) {
      log('✅ Storage bucket created', 'green');
    } else if (bucketResponse.status === 409) {
      log('⚠️  Storage bucket already exists', 'yellow');
    } else {
      const bucketError = await bucketResponse.text();
      log(`⚠️  Storage bucket creation failed: ${bucketError}`, 'yellow');
    }

    // Verify setup
    log('🔍 Verifying database setup...', 'yellow');
    
    const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?select=count`, {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      }
    });

    if (verifyResponse.ok) {
      log('✅ Database verification successful', 'green');
    } else {
      throw new Error('Database verification failed');
    }

    // Success message
    log('', 'reset');
    log('🎉 TileNotes Supabase setup completed!', 'green');
    log('', 'reset');
    log('Next steps:', 'blue');
    log('1. Create .env.local with your Supabase credentials', 'yellow');
    log('2. Run: npm install', 'yellow');
    log('3. Run: npm run dev', 'yellow');
    log('', 'reset');
    log('Your TileNotes database is ready! 🚀', 'green');

  } catch (error) {
    log(`❌ Setup failed: ${error.message}`, 'red');
    log('', 'reset');
    log('Troubleshooting:', 'blue');
    log('1. Check your Supabase URL and Service Role Key', 'yellow');
    log('2. Ensure your Supabase project is active', 'yellow');
    log('3. Verify you have admin access to the project', 'yellow');
    process.exit(1);
  }
}

// Run the setup
setupSupabase().catch(console.error);
