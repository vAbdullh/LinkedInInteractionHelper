import { useAuth } from './hooks/useAuth'
import { usePosts } from './hooks/usePosts'
import { LoginPage, SignOutButton } from './components/Auth'
import { Dashboard } from './components/Dashboard'
import { Queue } from './components/Queue'
import { CsvImport } from './components/CsvImport'

function App() {
  const { user, loading: authLoading } = useAuth()
  const { posts, loading: postsLoading } = usePosts()

  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <p className="text-neutral-500 text-sm">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <LoginPage loading={authLoading} />
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-semibold text-base">LinkedIn Interaction Helper</h1>
            <p className="text-neutral-500 text-xs mt-0.5">{user.email}</p>
          </div>
          <SignOutButton />
        </div>

        {/* Dashboard */}
        {postsLoading ? (
          <p className="text-neutral-600 text-sm">Loading posts...</p>
        ) : (
          <>
            <Dashboard posts={posts} />
            <Queue posts={posts} />
          </>
        )}

        {/* CSV Import */}
        <CsvImport />
      </div>
    </div>
  )
}

export default App
