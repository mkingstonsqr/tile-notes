import Head from 'next/head'
import AuthGuard from '../components/auth/AuthGuard'
import TileNotesApp from '../components/TileNotesApp'

export default function Home() {
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
