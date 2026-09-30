import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, Badge, LoadingSpinner } from '@/components/ui'
import { formatDate } from '@/lib/utils'

export default function BlogPostPage() {
  const { slug } = useParams()
  const [loading, setLoading] = useState(true)
  const [blog, setBlog] = useState<any>(null)

  useEffect(() => {
    async function loadBlog() {
      try {
        const { data } = await supabase.from('blogs').select('*, blog_categories(name)').eq('slug', slug).single()
        setBlog(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadBlog()
  }, [slug])

  if (loading) return <LoadingSpinner size="lg" text="Loading article..." />
  if (!blog) return <div className="text-center py-12 text-gray-500">Article not found.</div>

  return (
    <article className="max-w-3xl mx-auto space-y-6 py-8">
      {blog.blog_categories?.name && <Badge variant="blue">{blog.blog_categories.name}</Badge>}
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{blog.title}</h1>
      <p className="text-xs text-gray-400">Published on {blog.published_at ? formatDate(blog.published_at) : 'Recent'}</p>

      <Card padding="lg" className="prose prose-blue max-w-none text-gray-700 leading-relaxed space-y-4">
        <p className="whitespace-pre-line text-base">{blog.content}</p>
      </Card>
    </article>
  )
}
