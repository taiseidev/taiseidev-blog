import type { CollectionPosts, PostKey } from '@/types'
import { getCollection } from 'astro:content'

export function sortPostsByDate(itemA: CollectionPosts, itemB: CollectionPosts) {
  return new Date(itemB.data.date).getTime() - new Date(itemA.data.date).getTime()
}

export async function getPosts(path?: string, collection: PostKey = 'blog') {
  return (await getCollection(collection, (post) => {
    return (import.meta.env.PROD ? post.data.draft !== true : true) && (path ? post.slug.includes(path) : true)
  })).sort(sortPostsByDate)
}

export function calculateReadingTime(body: string | undefined): string {
  const stripped = (body ?? '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/[#>*_~\-]/g, '')
    .replace(/\s+/g, '')

  const cjk = (stripped.match(/[\u3000-\u9FFF\uFF00-\uFFEF]/g) || []).length
  const other = stripped.length - cjk
  const minutes = Math.max(1, Math.round(cjk / 500 + other / 1000))
  return `${minutes} min read`
}

export function getRelatedPosts(
  posts: CollectionPosts[],
  current: CollectionPosts,
  limit = 3,
): CollectionPosts[] {
  return posts
    .filter(p => p.slug !== current.slug && p.data.category === current.data.category)
    .slice(0, limit)
}
