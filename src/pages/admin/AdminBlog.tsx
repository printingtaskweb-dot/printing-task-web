import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, Badge, LoadingSpinner } from '@/components/ui'

export default function AdminBlog() {
  const [loading, setLoading] = useState(true)
  const [blogs, setBlogs] = useState<any[]>([])

  useEffect(() => {
    async function loadBlogs() {
      const { data } = await supabase.from('blogs').select('*').order('created_at', { ascending: false })
      setBlogs(data || [])
      setLoading(false)
    }
    loadBlogs()
  }, [])

  if (loading) return <LoadingSpinner size="lg" text="Loading blogs..." />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog CMS & SEO</h1>
          <p className="text-sm text-gray-500">Publish articles and manage SEO metadata</p>
        </div>
        <Link to="/admin/blog/new" className="btn-primary btn">Create New Post</Link>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Title</TableHeader>
            <TableHeader>Slug</TableHeader>
            <TableHeader>Status</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {blogs.map(b => (
            <TableRow key={b.id}>
              <TableCell className="font-semibold text-gray-900">{b.title}</TableCell>
              <TableCell>{b.slug}</TableCell>
              <TableCell><Badge variant={b.status === 'published' ? 'green' : 'gray'}>{b.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
