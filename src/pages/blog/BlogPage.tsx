import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, Badge, LoadingSpinner, EmptyState } from '@/components/ui'
import { BookOpen, Calendar, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function BlogPage() {
  const [loading, setLoading] = useState(true)
  const [blogs, setBlogs] = useState<any[]>([])

  useEffect(() => {
    async function loadBlogs() {
      try {
        const { data } = await supabase
          .from('blogs')
          .select('*, blog_categories(name)')
          .eq('status', 'published')
          .order('published_at', { ascending: false })

        setBlogs(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadBlogs()
  }, [])

  if (loading) return <LoadingSpinner size="lg" text="Loading articles..." />

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SkillBridge Blog & Articles</h1>
        <p className="text-sm text-gray-500">Career advice, hiring guides, and student development insights</p>
      </div>

      {blogs.length === 0 ? (
        <EmptyState title="No articles published yet" description="Check back soon for career insights and blog posts!" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map(blog => (
            <Card key={blog.id} hover className="flex flex-col justify-between">
              <div>
                {blog.blog_categories?.name && (
                  <Badge variant="blue" className="mb-2">{blog.blog_categories.name}</Badge>
                )}
                <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2">{blog.title}</h3>
                <p className="text-xs text-gray-600 line-clamp-3 mb-4">{blog.excerpt || blog.content}</p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
                <span>{blog.published_at ? formatDate(blog.published_at) : 'Recent'}</span>
                <Link to={`/blog/${blog.slug}`} className="font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                  Read Article <ArrowRight size={14} />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
