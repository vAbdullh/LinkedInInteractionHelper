import { getAI, getGenerativeModel, VertexAIBackend } from 'firebase/ai'
import { app } from './firebase'

const ai = getAI(app, { backend: new VertexAIBackend() })

export interface PostContext {
  id: string
  link: string
}

interface GeneratedComment {
  id: string
  comment: string
}

function extractFromUrl(url: string): { firstName: string; keywords: string[] } {
  try {
    const u = new URL(url)
    const pathParts = u.pathname.split('/').filter(Boolean)
    let firstName = ''
    let keywords: string[] = []

    if (u.hostname.includes('linkedin.com')) {
      if (pathParts[0] === 'posts' && pathParts[1]) {
        // e.g. sultan-alaqili_kaustabracademy-oxforduniversity-...
        const slug = pathParts[1]
        const namePart = slug.split('_')[0]
        const nameWords = namePart.split('-')
        firstName = nameWords[0].charAt(0).toUpperCase() + nameWords[0].slice(1)
        const keywordPart = slug.split('_').slice(1).join('-')
        keywords = keywordPart
          .split('-')
          .filter((k) => k.length > 3)
          .slice(0, 5)
      } else if (pathParts[0] === 'in' && pathParts[1]) {
        const slug = pathParts[1].split('?')[0].split('-')
        firstName = slug[0].charAt(0).toUpperCase() + slug[0].slice(1)
      }
    }

    return { firstName, keywords }
  } catch {
    return { firstName: '', keywords: [] }
  }
}

export async function generateComments(
  posts: PostContext[]
): Promise<GeneratedComment[]> {
  const model = getGenerativeModel(ai, { model: 'gemini-2.0-flash' })

  const postDescriptions = posts.map((p, i) => {
    const { firstName, keywords } = extractFromUrl(p.link)
    const nameLabel = firstName ? `Name: ${firstName}` : 'Name: unknown'
    const contextLabel =
      keywords.length > 0 ? `, Context: ${keywords.join(', ')}` : ''
    return `${i + 1}. ${nameLabel}${contextLabel}`
  })

  const prompt = `Generate short, natural, one-sentence LinkedIn comments for these posts.
Rules:
- Use the person's first name if provided (e.g. "Congrats, Sultan!")
- Keep it warm, professional, genuine
- No hashtags, no emojis, no fluff
- Every comment must use DIFFERENT wording — never repeat the same phrase twice
- If name is unknown, write a generic but unique congratulatory comment

Return ONLY a valid JSON array of strings, one string per post, in the same order. No markdown, no explanation.

Posts:
${postDescriptions.join('\n')}`

  const result = await model.generateContent(prompt)
  const text = result.response.text().trim()
  const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
  const comments: string[] = JSON.parse(cleaned)

  return posts.map((p, i) => ({
    id: p.id,
    comment: comments[i] ?? '',
  }))
}
