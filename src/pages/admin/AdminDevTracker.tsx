import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, Button, Input, Textarea, Select, Badge, Table, TableHead, TableBody, TableRow, TableHeader, TableCell, Modal, LoadingSpinner } from '@/components/ui'
import { Code2, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminDevTracker() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [updates, setUpdates] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'feature',
    status: 'planned',
    priority: '2',
    notes: '',
  })

  useEffect(() => {
    loadUpdates()
  }, [])

  async function loadUpdates() {
    try {
      const { data } = await supabase.from('website_updates').select('*').order('created_at', { ascending: false })
      setUpdates(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!form.title || !user) return
    setSubmitting(true)
    try {
      await supabase.from('website_updates').insert({
        title: form.title,
        description: form.description,
        type: form.type as any,
        status: form.status as any,
        priority: parseInt(form.priority) || 2,
        notes: form.notes,
        created_by: user.id,
      })

      toast.success('Dev update logged!')
      setModalOpen(false)
      loadUpdates()
    } catch (err: any) {
      toast.error('Failed to log update')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner size="lg" text="Loading dev updates..." />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Internal Development & Operations Tracker</h1>
          <p className="text-sm text-gray-500">Record and track feature progress, bugs, releases, and deployment notes</p>
        </div>
        <Button onClick={() => setModalOpen(true)} leftIcon={<Plus size={16} />}>Log Dev Update</Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Feature / Update</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Priority</TableHeader>
            <TableHeader>Logged Date</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {updates.map(u => (
            <TableRow key={u.id}>
              <TableCell className="font-semibold text-gray-900">
                {u.title}
                {u.description && <span className="block text-xs text-gray-400">{u.description}</span>}
              </TableCell>
              <TableCell><Badge variant="blue">{u.type}</Badge></TableCell>
              <TableCell>
                <Badge variant={u.status === 'completed' ? 'green' : u.status === 'in_progress' ? 'yellow' : 'gray'}>
                  {u.status}
                </Badge>
              </TableCell>
              <TableCell>P{u.priority}</TableCell>
              <TableCell>{formatDate(u.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Log Development Update"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button isLoading={submitting} onClick={handleCreate}>Save Update</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Title / Feature" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Description / Notes" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Type"
              options={[
                { value: 'feature', label: 'Feature' },
                { value: 'bug', label: 'Bug' },
                { value: 'improvement', label: 'Improvement' },
                { value: 'release', label: 'Release' },
              ]}
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
            />
            <Select
              label="Status"
              options={[
                { value: 'planned', label: 'Planned' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'testing', label: 'Testing' },
                { value: 'completed', label: 'Completed' },
                { value: 'blocked', label: 'Blocked' },
              ]}
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
