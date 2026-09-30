import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, Badge, Button, Input, Modal, LoadingSpinner } from '@/components/ui'
import toast from 'react-hot-toast'

export default function AdminCategories() {
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [skills, setSkills] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [newCatName, setNewCatName] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const { data: c } = await supabase.from('categories').select('*').order('sort_order')
      const { data: s } = await supabase.from('skills').select('*, categories(name)').limit(50)
      setCategories(c || [])
      setSkills(s || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCatName) return
    try {
      const slug = newCatName.toLowerCase().replace(/[^a-z0-9]/g, '-')
      await supabase.from('categories').insert({ name: newCatName, slug })
      toast.success('Category created!')
      setModalOpen(false)
      loadData()
    } catch (err) {
      toast.error('Failed to create category')
    }
  }

  if (loading) return <LoadingSpinner size="lg" text="Loading categories & skills..." />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Database Categories & Skills</h1>
          <p className="text-sm text-gray-500">Database-driven hierarchy used across student profiles, jobs, and matching</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>Add Category</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card padding="md">
          <h2 className="font-bold text-gray-900 mb-3">Categories ({categories.length})</h2>
          <div className="space-y-2">
            {categories.map(c => (
              <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 bg-gray-50 text-sm">
                <span className="font-semibold text-gray-800">{c.name}</span>
                <Badge variant="blue">{c.slug}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="md">
          <h2 className="font-bold text-gray-900 mb-3">Skills Sample ({skills.length})</h2>
          <div className="flex flex-wrap gap-1.5">
            {skills.map(s => (
              <Badge key={s.id} variant="purple">{s.name}</Badge>
            ))}
          </div>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Category" footer={<Button onClick={handleAddCategory}>Add</Button>}>
        <Input label="Category Name" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="e.g. Robotics" />
      </Modal>
    </div>
  )
}
