import { Post } from '../types'

interface Props {
  posts: Post[]
}

export function Dashboard({ posts }: Props) {
  const total = posts.length
  const pending = posts.filter((p) => p.status === 'pending').length
  const completed = posts.filter((p) => p.status === 'completed').length
  const skipped = posts.filter((p) => p.status === 'skipped').length
  const progress = total > 0 ? Math.round(((completed + skipped) / total) * 100) : 0

  const stats = [
    { label: 'Total', value: total },
    { label: 'Pending', value: pending },
    { label: 'Completed', value: completed },
    { label: 'Skipped', value: skipped },
    { label: 'Progress', value: `${progress}%` },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-neutral-800 border border-neutral-800">
      {stats.map((s) => (
        <div key={s.label} className="bg-neutral-950 px-4 py-4">
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">{s.label}</p>
          <p className="text-white text-2xl font-mono font-semibold">{s.value}</p>
        </div>
      ))}
    </div>
  )
}
