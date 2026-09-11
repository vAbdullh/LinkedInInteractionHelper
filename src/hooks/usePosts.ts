import { useState, useEffect } from 'react'
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Post } from '../types'

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'asc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Post[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Post, 'id'>),
      }))
      setPosts(data)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  return { posts, loading }
}
