import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Post } from '../types'

interface Props {
  posts: Post[]
}

export function Queue({ posts }: Props) {
  const pending = posts.filter((p) => p.status === 'pending')
  const [index, setIndex] = useState(0)
  const [copied, setCopied] = useState(false)

  // Keep index in bounds when posts change
  const safeIndex = Math.min(index, Math.max(0, pending.length - 1))
  const post = pending[safeIndex] ?? null

  const updateStatus = async (status: 'completed' | 'skipped') => {
    if (!post) return
    await updateDoc(doc(db, 'posts', post.id), {
      status,
      updatedAt: Date.now(),
    })
    // Move to next — index stays, next pending fills in
    setIndex((i) => Math.min(i, pending.length - 2))
  }

  const copyComment = async () => {
    if (!post?.comment) return
    await navigator.clipboard.writeText(post.comment)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (pending.length === 0) {
    return (
      <div className="border border-neutral-800 p-6">
        <p className="text-neutral-500 text-sm">No pending posts.</p>
      </div>
    )
  }

  if (!post) return null

  return (
    <div className="border border-neutral-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <span className="text-neutral-500 text-xs font-mono">
          {safeIndex + 1} / {pending.length} pending
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={safeIndex === 0}
            className="text-xs px-3 py-1 border border-neutral-700 text-neutral-300 hover:border-neutral-500 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <button
            onClick={() => setIndex((i) => Math.min(pending.length - 1, i + 1))}
            disabled={safeIndex === pending.length - 1}
            className="text-xs px-3 py-1 border border-neutral-700 text-neutral-300 hover:border-neutral-500 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Name */}
        <div>
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Name</p>
          <p className="text-white text-sm">{post.name || <span className="text-neutral-600">—</span>}</p>
        </div>

        {/* Link */}
        <div>
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Link</p>
          <p className="text-sm font-mono text-neutral-300 break-all">{post.link}</p>
        </div>

        {/* Comment */}
        <div>
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Comment</p>
          <p className="text-sm text-neutral-300 whitespace-pre-wrap">
            {post.comment || <span className="text-neutral-600">No comment</span>}
          </p>
        </div>

        {/* Notes */}
        {post.notes && (
          <div>
            <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Notes</p>
            <p className="text-sm text-neutral-400">{post.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex flex-wrap gap-2">
        <button
          onClick={copyComment}
          className="text-xs px-3 py-1.5 border border-neutral-700 text-neutral-300 hover:border-neutral-500"
        >
          {copied ? 'Copied' : 'Copy Comment'}
        </button>
        <a
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-1.5 border border-neutral-700 text-neutral-300 hover:border-neutral-500"
        >
          Open LinkedIn
        </a>
        <button
          onClick={() => updateStatus('completed')}
          className="text-xs px-3 py-1.5 bg-white text-black hover:bg-neutral-200"
        >
          Done
        </button>
        <button
          onClick={() => updateStatus('skipped')}
          className="text-xs px-3 py-1.5 border border-neutral-700 text-neutral-500 hover:border-neutral-500 hover:text-neutral-300"
        >
          Skip
        </button>
      </div>
    </div>
  )
}
