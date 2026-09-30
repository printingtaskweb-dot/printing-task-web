import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, Button, Input, Textarea, Select } from '@/components/ui'
import toast from 'react-hot-toast'

export default function AdminHackathonDetail() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    theme: '',
    startDate: '',
    endDate: '',
    status: 'registration_open',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.startDate || !user) return

    setSubmitting(true)
    try {
      await supabase.from('hackathons').insert({
        title: form.title,
        description: form.description,
        theme: form.theme,
        start_date: new Date(form.startDate).toISOString(),
        end_date: new Date(form.endDate || form.startDate).toISOString(),
        status: form.status as any,
        created_by: user.id,
      })

      toast.success('Hackathon created!')
      navigate('/admin/hackathons')
    } catch (err: any) {
      toast.error('Failed to create hackathon')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Create Hackathon</h1>
      <Card padding="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <Input label="Theme" value={form.theme} onChange={e => setForm({ ...form, theme: e.target.value })} placeholder="e.g. AI & Automation" />
          <Textarea label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
            <Input label="End Date" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required />
          </div>
          <Select
            label="Status"
            options={[
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'registration_open', label: 'Registration Open' },
              { value: 'ongoing', label: 'Ongoing' },
            ]}
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
          />
          <Button type="submit" fullWidth isLoading={submitting}>Save Hackathon</Button>
        </form>
      </Card>
    </div>
  )
}
