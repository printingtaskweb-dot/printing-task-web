import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, Button, Input, Textarea, Select } from '@/components/ui'
import { Building2, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function BusinessProfilePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    businessName: '',
    ownerName: '',
    industry: '',
    description: '',
    companySize: '1-10 employees',
    location: '',
    websiteUrl: '',
    contactEmail: '',
    contactPhone: '',
  })

  useEffect(() => {
    async function loadData() {
      if (!user) return
      try {
        const { data: bp } = await supabase.from('business_profiles').select('*').eq('user_id', user.id).single()
        if (bp) {
          setForm({
            businessName: bp.business_name || '',
            ownerName: bp.owner_name || '',
            industry: bp.industry || '',
            description: bp.description || '',
            companySize: bp.company_size || '1-10 employees',
            location: bp.location || '',
            websiteUrl: bp.website_url || '',
            contactEmail: bp.contact_email || user.email || '',
            contactPhone: bp.contact_phone || '',
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      await supabase.from('business_profiles').update({
        business_name: form.businessName,
        owner_name: form.ownerName,
        industry: form.industry,
        description: form.description,
        company_size: form.companySize,
        location: form.location,
        website_url: form.websiteUrl,
        contact_email: form.contactEmail,
        contact_phone: form.contactPhone,
      }).eq('user_id', user.id)

      toast.success('Business profile updated!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update business profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Profile</h1>
          <p className="text-sm text-gray-500">Update company details visible to student candidates</p>
        </div>
        <Button onClick={handleSave} isLoading={saving} leftIcon={<Save size={16} />}>
          Save Profile
        </Button>
      </div>

      <Card padding="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Business Name"
              value={form.businessName}
              onChange={e => setForm({ ...form, businessName: e.target.value })}
            />
            <Input
              label="Owner / Contact Person"
              value={form.ownerName}
              onChange={e => setForm({ ...form, ownerName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Industry"
              value={form.industry}
              onChange={e => setForm({ ...form, industry: e.target.value })}
            />
            <Select
              label="Company Size"
              options={[
                { value: '1-10 employees', label: '1 - 10 employees' },
                { value: '11-50 employees', label: '11 - 50 employees' },
                { value: '51-200 employees', label: '51 - 200 employees' },
                { value: '201+ employees', label: '201+ employees' },
              ]}
              value={form.companySize}
              onChange={e => setForm({ ...form, companySize: e.target.value })}
            />
          </div>

          <Input
            label="Location"
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
          />

          <Textarea
            label="Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Website URL"
              value={form.websiteUrl}
              onChange={e => setForm({ ...form, websiteUrl: e.target.value })}
            />
            <Input
              label="Contact Phone"
              value={form.contactPhone}
              onChange={e => setForm({ ...form, contactPhone: e.target.value })}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
