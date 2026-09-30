import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, Button, Input, Textarea, Badge, LoadingSpinner } from '@/components/ui'
import { User, Mail, Phone, MapPin, Globe, Github, Linkedin, Briefcase, GraduationCap, Edit3, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StudentProfile() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [studentProfile, setStudentProfile] = useState<any>(null)

  const [form, setForm] = useState({
    headline: '',
    bio: '',
    location: '',
    phone: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    resumeUrl: '',
  })

  useEffect(() => {
    async function loadData() {
      if (!user) return
      try {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        const { data: sp } = await supabase.from('student_profiles').select('*, primary_category:categories(name)').eq('user_id', user.id).single()

        setProfile(p)
        setStudentProfile(sp)

        if (sp) {
          setForm({
            headline: sp.headline || '',
            bio: sp.bio || '',
            location: sp.location || '',
            phone: p?.phone || '',
            githubUrl: sp.github_url || '',
            linkedinUrl: sp.linkedin_url || '',
            portfolioUrl: sp.portfolio_url || '',
            resumeUrl: sp.resume_url || '',
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
      await supabase.from('profiles').update({ phone: form.phone }).eq('id', user.id)
      await supabase.from('student_profiles').update({
        headline: form.headline,
        bio: form.bio,
        location: form.location,
        github_url: form.githubUrl,
        linkedin_url: form.linkedinUrl,
        portfolio_url: form.portfolioUrl,
        resume_url: form.resumeUrl,
      }).eq('user_id', user.id)

      toast.success('Profile updated successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner size="lg" text="Loading profile..." />

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
          <p className="text-sm text-gray-500">Manage your personal info, portfolio, and experience</p>
        </div>
        <Button onClick={handleSave} isLoading={saving} leftIcon={<Save size={16} />}>
          Save Changes
        </Button>
      </div>

      <Card padding="lg" className="space-y-6">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
          <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-2xl">
            {profile?.full_name?.[0] || 'S'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{profile?.full_name}</h2>
            <p className="text-xs text-gray-500">{profile?.email}</p>
            {studentProfile?.primary_category?.name && (
              <Badge variant="blue" className="mt-1">{studentProfile.primary_category.name}</Badge>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Professional Headline"
            value={form.headline}
            onChange={e => setForm({ ...form, headline: e.target.value })}
            placeholder="e.g. Full Stack Developer | React & Node.js"
          />

          <Textarea
            label="About Me / Bio"
            value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })}
            placeholder="Write a brief introduction..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Location"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              leftIcon={<MapPin size={16} />}
            />
            <Input
              label="Phone Number"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              leftIcon={<Phone size={16} />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="GitHub URL"
              value={form.githubUrl}
              onChange={e => setForm({ ...form, githubUrl: e.target.value })}
              leftIcon={<Github size={16} />}
            />
            <Input
              label="LinkedIn URL"
              value={form.linkedinUrl}
              onChange={e => setForm({ ...form, linkedinUrl: e.target.value })}
              leftIcon={<Linkedin size={16} />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Portfolio URL"
              value={form.portfolioUrl}
              onChange={e => setForm({ ...form, portfolioUrl: e.target.value })}
              leftIcon={<Globe size={16} />}
            />
            <Input
              label="Resume URL (PDF)"
              value={form.resumeUrl}
              onChange={e => setForm({ ...form, resumeUrl: e.target.value })}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
