#!/usr/bin/env node

/**
 * TileNotes Environment Setup Helper
 * Guides you through setting up your .env.local file
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEnvironment() {
  log('🔧 TileNotes Environment Setup', 'green');
  log('===============================', 'blue');
  log('', 'reset');
  
  log('This will help you create your .env.local file with Supabase credentials.', 'cyan');
  log('', 'reset');
  
  log('First, you need to create a Supabase project:', 'yellow');
  log('1. Go to https://supabase.com and sign in', 'blue');
  log('2. Click "New Project"', 'blue');
  log('3. Name it "TileNotes"', 'blue');
  log('4. Set a database password and save it!', 'blue');
  log('5. Choose your region', 'blue');
  log('6. Wait for the project to be created', 'blue');
  log('', 'reset');
  
  const hasProject = await question('Have you created your Supabase project? (y/n): ');
  
  if (hasProject.toLowerCase() !== 'y') {
    log('Please create your Supabase project first, then run this script again.', 'yellow');
    rl.close();
    return;
  }
  
  log('', 'reset');
  log('Now, let\'s get your API credentials:', 'yellow');
  log('1. In your Supabase dashboard, go to Settings → API', 'blue');
  log('2. Copy the values below:', 'blue');
  log('', 'reset');
  
  const supabaseUrl = await question('Enter your Project URL (https://xxx.supabase.co): ');
  const anonKey = await question('Enter your Project API Key (anon/public): ');
  const serviceRoleKey = await question('Enter your Service Role Key: ');
  
  log('', 'reset');
  log('Optional: AI Integration (for smart features)', 'yellow');
  const openaiKey = await question('Enter your OpenAI API Key (optional, press Enter to skip): ');
  
  // Create .env.local content
  const envContent = `# TileNotes Environment Configuration
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}
SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}

# AI Configuration (Optional)
${openaiKey ? `OPENAI_API_KEY=${openaiKey}` : '# OPENAI_API_KEY=your_openai_key_here'}

# Email Configuration (Optional - for daily task summaries)
# RESEND_API_KEY=your_resend_key_here
# SENDGRID_API_KEY=your_sendgrid_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
`;

  // Write .env.local file
  const envPath = path.join(process.cwd(), '.env.local');
  fs.writeFileSync(envPath, envContent);
  
  log('', 'reset');
  log('✅ .env.local file created successfully!', 'green');
  log('', 'reset');
  
  log('Next steps:', 'blue');
  log('1. Run: npm run setup:supabase', 'yellow');
  log('   This will create all database tables automatically', 'cyan');
  log('2. Run: npm install', 'yellow');
  log('3. Run: npm run dev', 'yellow');
  log('', 'reset');
  
  log('🎉 Environment setup complete!', 'green');
  
  rl.close();
}

setupEnvironment().catch(console.error);
