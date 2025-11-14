#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting TileNotes deployment...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: package.json not found. Please run this from the project root.');
  process.exit(1);
}

// Check if git is clean
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  if (gitStatus.trim()) {
    console.log('📝 Uncommitted changes detected. Committing...');
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Pre-deployment commit"', { stdio: 'inherit' });
  }
} catch (error) {
  console.log('⚠️  Git status check failed, continuing...');
}

// Create deployment directory structure
console.log('📁 Creating deployment structure...');
const deployDir = 'deploy';
if (fs.existsSync(deployDir)) {
  execSync(`rm -rf ${deployDir}`, { stdio: 'inherit' });
}
fs.mkdirSync(deployDir);

// Copy necessary files for static deployment
console.log('📋 Copying files...');
const filesToCopy = [
  'pages',
  'components', 
  'lib',
  'styles',
  'public',
  'package.json',
  'next.config.js',
  'tailwind.config.js',
  'postcss.config.js',
  '.env.local'
];

filesToCopy.forEach(file => {
  if (fs.existsSync(file)) {
    if (fs.statSync(file).isDirectory()) {
      execSync(`cp -r ${file} ${deployDir}/`, { stdio: 'inherit' });
    } else {
      execSync(`cp ${file} ${deployDir}/`, { stdio: 'inherit' });
    }
  }
});

// Create a simple HTML index for static hosting
console.log('🏗️  Creating static deployment files...');
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TileNotes - The Future of Note-Taking</title>
    <meta name="description" content="Capture, organize, and discover your thoughts with AI-powered intelligence. Beautiful, fast, and incredibly smart.">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        
        .container {
            text-align: center;
            max-width: 600px;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        }
        
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            background: linear-gradient(45deg, #fff, #e0e7ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
            line-height: 1.6;
        }
        
        .btn {
            display: inline-block;
            padding: 1rem 2rem;
            background: linear-gradient(45deg, #4f46e5, #7c3aed);
            color: white;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }
        
        .features {
            margin-top: 3rem;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
        }
        
        .feature {
            padding: 1.5rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .feature h3 {
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
        }
        
        .feature p {
            font-size: 0.9rem;
            margin: 0;
            opacity: 0.8;
        }
        
        .emoji {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        @media (max-width: 768px) {
            h1 {
                font-size: 2rem;
            }
            
            .container {
                margin: 1rem;
                padding: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>TileNotes</h1>
        <p>The future of intelligent note-taking. Capture, organize, and discover your thoughts with AI-powered intelligence.</p>
        
        <a href="#" class="btn" onclick="alert('TileNotes is being deployed! Check back soon for the full experience.')">
            Launch TileNotes
        </a>
        
        <div class="features">
            <div class="feature">
                <div class="emoji">🧠</div>
                <h3>AI-Powered</h3>
                <p>Smart tagging and task extraction with ChatGPT integration</p>
            </div>
            
            <div class="feature">
                <div class="emoji">📅</div>
                <h3>Visual Organization</h3>
                <p>Beautiful calendar views and tile-based note layout</p>
            </div>
            
            <div class="feature">
                <div class="emoji">🔍</div>
                <h3>Instant Search</h3>
                <p>Find anything instantly with intelligent filtering</p>
            </div>
            
            <div class="feature">
                <div class="emoji">✨</div>
                <h3>Apple Design</h3>
                <p>Glassmorphism aesthetics with smooth animations</p>
            </div>
        </div>
    </div>
</body>
</html>`;

fs.writeFileSync(path.join(deployDir, 'index.html'), indexHtml);

// Create deployment package
console.log('📦 Creating deployment package...');
const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
const packageName = `tilenotes-${timestamp}.zip`;

execSync(`cd ${deployDir} && zip -r ../${packageName} .`, { stdio: 'inherit' });

// Clean up
execSync(`rm -rf ${deployDir}`, { stdio: 'inherit' });

console.log(`\n✅ Deployment package created: ${packageName}`);
console.log('\n🚀 Deployment options:');
console.log('1. Upload to Netlify: https://app.netlify.com/drop');
console.log('2. Upload to Vercel: https://vercel.com/new');
console.log('3. Upload to GitHub Pages');
console.log('4. Upload to any static hosting service');

console.log('\n📝 Instructions:');
console.log('1. Extract the zip file');
console.log('2. Upload the contents to your hosting service');
console.log('3. Set up environment variables for Supabase and OpenAI');
console.log('4. Configure your domain');

console.log('\n🎉 TileNotes is ready for deployment!');
