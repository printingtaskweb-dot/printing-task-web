import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, Button, Input, Textarea } from '@/components/ui'
import toast from 'react-hot-toast'

export default function AdminBlogEditor() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    title: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    status: 'published',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.content || !user) return

    setSubmitting(true)
    try {
      const slug = form.title.toLowerCase().replace(/[^a-z0-9]/g, '-')
      await supabase.from('blogs').insert({
        title: form.title,
        slug,
        content: form.content,
        meta_title: form.metaTitle || form.title,
        meta_description: form.metaDescription,
        status: form.status as any,
        author_id: user.id,
        published_at: new Date().toISOString(),
      })

      toast.success('Blog article published!')
      navigate('/admin/blog')
    } catch (err: any) {
      toast.error('Failed to publish article')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Create Blog Article</h1>
      <Card padding="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Article Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Content (Markdown/Text)" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required className="min-h-[200px]" />
          <Input label="Meta SEO Title" value={form.metaTitle} onChange={e => setForm({ ...form, metaTitle: e.target.value })} />
          <Input label="Meta Description" value={form.metaDescription} onChange={e => setForm({ ...form, metaDescription: e.target.value })} />
          <Button type="submit" fullWidth isLoading={submitting}>Publish Article</Button>
        </form>
      </Card>
    </div>
  )
}
