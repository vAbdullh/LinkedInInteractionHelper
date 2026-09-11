import { signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

interface Props {
  loading: boolean
}

export function LoginPage({ loading }: Props) {
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      console.error('Sign in failed:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <p className="text-neutral-500 text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="w-full max-w-sm p-8 border border-neutral-800">
        <h1 className="text-white text-lg font-semibold mb-1">LinkedIn Interaction Helper</h1>
        <p className="text-neutral-500 text-sm mb-8">Sign in to access the dashboard.</p>
        <button
          onClick={handleSignIn}
          className="w-full bg-white text-black text-sm font-medium py-2 px-4 hover:bg-neutral-200 transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  )
}

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut(auth)}
      className="text-neutral-500 text-sm hover:text-white transition-colors"
    >
      Sign out
    </button>
  )
}
