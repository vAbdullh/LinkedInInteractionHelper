export type PostStatus = 'pending' | 'completed' | 'skipped'

export interface Post {
  id: string
  link: string
  name: string
  comment: string
  status: PostStatus
  notes: string
  createdAt: number
  updatedAt: number
}
