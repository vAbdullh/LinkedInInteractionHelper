import { useState } from 'react'
import { doc, writeBatch } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { generateComments } from '../lib/gemini'
import { Post } from '../types'

interface Props {
  posts: Post[]
}

export function GenerateComments({ posts }: Props) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Only generate for pending posts that have no comment yet
  const targets = posts.filter(
    (p) => p.status === 'pending' && !p.comment.trim()
  )

  const handleGenerate = async () => {
    if (targets.length === 0) {
      setResult('All pending posts already have comments.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const generated = await generateComments(
        targets.map((p) => ({ id: p.id, link: p.link }))
      )

      // Batch write all comments to Firestore
      const batchSize = 500
      for (let i = 0; i < generated.length; i += batchSize) {
        const batch = writeBatch(db)
        const chunk = generated.slice(i, i + batchSize)
        for (const { id, comment } of chunk) {
          batch.update(doc(db, 'posts', id), {
            comment,
            updatedAt: Date.now(),
          })
        }
        await batch.commit()
      }

      setResult(`Generated ${generated.length} comments.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-neutral-800 p-4">
      <p className="text-neutral-500 text-xs uppercase tracking-wider mb-3">
        AI Comment Generation
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="text-xs px-3 py-1.5 bg-white text-black hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? 'Generating...'
            : `Generate for ${targets.length} pending post${targets.length !== 1 ? 's' : ''}`}
        </button>

        {result && (
          <span className="text-xs text-neutral-400 font-mono">{result}</span>
        )}
        {error && (
          <span className="text-xs text-red-500">{error}</span>
        )}
      </div>
    </div>
  )
}
