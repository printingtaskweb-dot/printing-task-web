import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button, Input, Textarea, Select, Card } from '@/components/ui'
import { Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

const lookingForOptions = [
  'Intern', 'Full-time employee', 'Part-time employee', 'Freelancer',
  'Project worker', 'Computer operator', 'Developer', 'Designer',
  'Video editor', 'Sales person', 'Marketing person', 'Other'
]

export default function BusinessOnboarding() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    businessName: '',
    ownerName: user?.full_name || '',
    industry: '',
    description: '',
    companySize: '1-10 employees',
    location: '',
    websiteUrl: '',
    contactEmail: user?.email || '',
    contactPhone: '',
    lookingFor: [] as string[],
  })

  const toggleLookingFor = (item: string) => {
    if (form.lookingFor.includes(item)) {
      setForm({ ...form, lookingFor: form.lookingFor.filter(i => i !== item) })
    } else {
      setForm({ ...form, lookingFor: [...form.lookingFor, item] })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.businessName || !form.ownerName) {
      toast.error('Business name and owner name are required')
      return
    }
    if (!user) return

    setSubmitting(true)
    try {
      // Update profile
      await supabase.from('profiles').update({
        full_name: form.ownerName,
        phone: form.contactPhone,
        onboarding_completed: true,
      }).eq('id', user.id)

      // Create Business Profile
      const slug = form.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6)

      const { error } = await supabase.from('business_profiles').upsert({
        user_id: user.id,
        business_name: form.businessName,
        owner_name: form.ownerName,
        slug,
        industry: form.industry,
        description: form.description,
        company_size: form.companySize,
        location: form.location,
        website_url: form.websiteUrl,
        contact_email: form.contactEmail,
        contact_phone: form.contactPhone,
        looking_for: form.lookingFor,
        verification_status: 'verified', // Auto verify for prototype
      })

      if (error) throw error

      await refreshUser()
      toast.success('Business profile created successfully!')
      navigate('/dashboard')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to complete business setup')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3 text-white">
            <Building2 size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Setup Your Business Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Start posting opportunities and discovering student talent</p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Business Name"
                placeholder="Acme Technologies"
                value={form.businessName}
                onChange={e => setForm({ ...form, businessName: e.target.value })}
                required
              />
              <Input
                label="Owner / Contact Person Name"
                value={form.ownerName}
                onChange={e => setForm({ ...form, ownerName: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Industry"
                placeholder="e.g. IT, E-commerce, Marketing"
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
              label="Business Location"
              placeholder="e.g. Bangalore, India"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
            />

            <Textarea
              label="Business Description"
              placeholder="Tell students about your company, mission, and culture..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Website URL"
                placeholder="https://example.com"
                value={form.websiteUrl}
                onChange={e => setForm({ ...form, websiteUrl: e.target.value })}
              />
              <Input
                label="Contact Phone"
                placeholder="+91 98765 43210"
                value={form.contactPhone}
                onChange={e => setForm({ ...form, contactPhone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What are you looking for?</label>
              <div className="flex flex-wrap gap-2">
                {lookingForOptions.map(item => {
                  const selected = form.lookingFor.includes(item)
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleLookingFor(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        selected
                          ? 'bg-primary-50 text-primary-700 border-primary-300 font-semibold'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {item}
                    </button>
                  )
                })}
              </div>
            </div>

            <Button type="submit" fullWidth isLoading={submitting} size="lg" className="mt-6">
              Save & Complete Setup
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
