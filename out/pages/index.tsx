import { useState } from 'react'
import Head from 'next/head'
import { useUser } from '@supabase/auth-helpers-react'
import AuthGuard from '../components/auth/AuthGuard'
import TileNotesApp from '../components/TileNotesApp'
import LandingPage from '../components/LandingPage'

export default function Home() {
  const user = useUser()
  const [showApp, setShowApp] = useState(false)

  // If user is logged in or they clicked "Get Started", show the app
  if (user || showApp) {
    return (
      <>
        <Head>
          <title>TileNotes - The Future of Note-Taking</title>
          <meta name="description" content="Fast, clean, and deeply intelligent note-taking with AI assistance" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <AuthGuard>
          <TileNotesApp />
        </AuthGuard>
      </>
    )
  }

  // Show landing page for non-authenticated users
  return (
    <>
      <Head>
        <title>TileNotes - The Future of Note-Taking</title>
        <meta name="description" content="Capture, organize, and discover your thoughts with AI-powered intelligence. Beautiful, fast, and incredibly smart." />
        <meta name="keywords" content="notes, note-taking, AI, productivity, organization, tasks, calendar" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Open Graph */}
        <meta property="og:title" content="TileNotes - The Future of Note-Taking" />
        <meta property="og:description" content="Capture, organize, and discover your thoughts with AI-powered intelligence." />
        <meta property="og:type" content="website" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TileNotes - The Future of Note-Taking" />
        <meta name="twitter:description" content="Capture, organize, and discover your thoughts with AI-powered intelligence." />
      </Head>

      <LandingPage onGetStarted={() => setShowApp(true)} />
    </>
  )
}
