import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, Button, Input, Textarea, Select, Badge, MultiSelect, LoadingSpinner } from '@/components/ui'
import { User, Mail, Phone, MapPin, Globe, Github, Linkedin, Briefcase, GraduationCap, Save, Plus, Trash2, CheckCircle2, Sparkles } from 'lucide-react'
import { BUILTIN_CATEGORIES, getAvailableCategories, getAvailableSkills } from '@/lib/categories'
import toast from 'react-hot-toast'
import type { Skill } from '@/types'

export default function StudentProfile() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [studentProfile, setStudentProfile] = useState<any>(null)
  const [allCategories, setAllCategories] = useState<any[]>(BUILTIN_CATEGORIES)
  const [allSkills, setAllSkills] = useState<any[]>([])

  const [form, setForm] = useState({
    headline: '',
    bio: '',
    location: '',
    phone: '',
    categoryId: 'cat-dev',
    categoryName: 'Software & Web Development',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    resumeUrl: '',
    experienceLevel: 'fresher',
    selectedSkillIds: [] as string[],
    preferredWorkMode: 'remote',
  })

  // Education list
  const [educationList, setEducationList] = useState<any[]>([])
  const [newEdu, setNewEdu] = useState({ institution: '', degree: '', field_of_study: '', end_year: '' })

  useEffect(() => {
    async function loadData() {
      if (!user) return
      try {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        const { data: sp } = await supabase
          .from('student_profiles')
          .select('*, primary_category:categories(name)')
          .eq('user_id', user.id)
          .maybeSingle()
        const { data: catData } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
        const { data: skillsData } = await supabase.from('skills').select('*').eq('is_active', true)

        setProfile(p)
        setStudentProfile(sp)

        if (catData && catData.length > 0) {
          setAllCategories(catData)
        } else {
          setAllCategories(BUILTIN_CATEGORIES)
        }

        if (skillsData && skillsData.length > 0) {
          setAllSkills(skillsData)
        }

        if (sp) {
          // Load student skills
          const { data: userSkills } = await supabase.from('student_skills').select('skill_id').eq('student_id', sp.id)
          const skillIds = (userSkills || []).map(s => s.skill_id)

          // Load education
          const { data: edu } = await supabase.from('student_education').select('*').eq('student_id', sp.id)
          setEducationList(edu || [])

          setForm({
            headline: sp.headline || '',
            bio: sp.bio || '',
            location: sp.location || '',
            phone: p?.phone || '',
            categoryId: sp.primary_category_id || 'cat-dev',
            categoryName: sp.primary_category?.name || 'Software & Web Development',
            githubUrl: sp.github_url || '',
            linkedinUrl: sp.linkedin_url || '',
            portfolioUrl: sp.portfolio_url || '',
            resumeUrl: sp.resume_url || '',
            experienceLevel: sp.experience_level || 'fresher',
            selectedSkillIds: skillIds.length > 0 ? skillIds : ['sk-react', 'sk-ts'],
            preferredWorkMode: 'remote',
          })
        }
      } catch (err) {
        console.error('Notice loading student profile:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  const categoryOptions = allCategories.map((c: any) => ({
    value: c.id || c.slug,
    label: `${c.icon || '💼'} ${c.name}`,
  }))

  const availableSkillsList = getAvailableSkills(form.categoryId, allSkills.length > 0 ? allSkills : undefined)
  const skillOptions = availableSkillsList.map((s: any) => ({
    value: s.id || s.slug || s.name,
    label: s.name,
  }))

  const handleAddEducation = async () => {
    if (!newEdu.institution || !studentProfile) {
      toast.error('Institution name is required')
      return
    }
    try {
      const { data, error } = await supabase.from('student_education').insert({
        student_id: studentProfile.id,
        institution: newEdu.institution,
        degree: newEdu.degree,
        field_of_study: newEdu.field_of_study,
        end_year: parseInt(newEdu.end_year) || undefined,
      } as any).select().single()

      if (error) throw error
      setEducationList([...educationList, data])
      setNewEdu({ institution: '', degree: '', field_of_study: '', end_year: '' })
      toast.success('Education added!')
    } catch (err) {
      toast.error('Failed to add education')
    }
  }

  const handleDeleteEducation = async (id: string) => {
    try {
      await supabase.from('student_education').delete().eq('id', id)
      setEducationList(educationList.filter(e => e.id !== id))
      toast.success('Education removed')
    } catch (err) {
      toast.error('Failed to remove education')
    }
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      await supabase.from('profiles').update({ phone: form.phone } as any).eq('id', user.id)

      const isDbUuid = form.categoryId && form.categoryId.includes('-') && form.categoryId.length > 30

      const updatePayload: any = {
        headline: form.headline,
        bio: form.bio,
        location: form.location,
        github_url: form.githubUrl,
        linkedin_url: form.linkedinUrl,
        portfolio_url: form.portfolioUrl,
        resume_url: form.resumeUrl,
        experience_level: form.experienceLevel as any,
      }

      if (isDbUuid) {
        updatePayload.primary_category_id = form.categoryId
      }

      await supabase.from('student_profiles').upsert({
        user_id: user.id,
        ...updatePayload,
      } as any)

      // Sync skills
      if (studentProfile?.id && form.selectedSkillIds.length > 0) {
        const validDbSkills = form.selectedSkillIds.filter(id => id.length > 30)
        if (validDbSkills.length > 0) {
          await supabase.from('student_skills').delete().eq('student_id', studentProfile.id)
          const studentSkills = validDbSkills.map(skId => ({
            student_id: studentProfile.id,
            skill_id: skId,
            proficiency: 'intermediate' as const,
          }))
          await supabase.from('student_skills').insert(studentSkills as any)
        }
      }

      toast.success('Profile updated successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner size="lg" text="Loading student profile..." />

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Profile & Domain</h1>
          <p className="text-sm text-gray-500">Manage your domain category, technical skills, portfolio, and education</p>
        </div>
        <Button onClick={handleSave} isLoading={saving} leftIcon={<Save size={16} />}>
          Save Changes
        </Button>
      </div>

      {/* Header Card */}
      <Card padding="lg" className="space-y-6">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
          <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-xs">
            {profile?.full_name?.[0] || 'S'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{profile?.full_name}</h2>
            <p className="text-xs text-gray-500">{profile?.email}</p>
            <Badge variant="blue" className="mt-1">
              {form.categoryName || 'Software & Web Development'}
            </Badge>
          </div>
        </div>

        {/* Primary Domain Category Selector */}
        <div className="bg-primary-50/50 border border-primary-100 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-primary-950 flex items-center gap-1.5">
              <Sparkles size={16} className="text-primary-600" /> Primary Domain Category:
            </span>
          </div>
          <Select
            options={categoryOptions}
            value={form.categoryId}
            onChange={e => {
              const selectedVal = e.target.value
              const matchedCat = allCategories.find((c: any) => c.id === selectedVal || c.slug === selectedVal)
              setForm({
                ...form,
                categoryId: selectedVal,
                categoryName: matchedCat?.name || form.categoryName,
              })
            }}
          />
          <p className="text-xs text-primary-700">
            Selecting your domain helps companies filter and discover your profile in the Talent Directory.
          </p>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <Input
            label="Professional Headline"
            value={form.headline}
            onChange={e => setForm({ ...form, headline: e.target.value })}
            placeholder="e.g. Full Stack Developer | React & Node.js Specialist"
          />

          <Textarea
            label="About Me / Bio"
            value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })}
            placeholder="Write a short summary about your skills, passion, and career aspirations..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Location"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              leftIcon={<MapPin size={16} />}
              placeholder="e.g. Mumbai, India / Remote"
            />
            <Input
              label="Phone Number"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              leftIcon={<Phone size={16} />}
              placeholder="+91 98765 43210"
            />
          </div>

          <Select
            label="Experience Level"
            options={[
              { value: 'fresher', label: 'Fresher / Student (No prior experience)' },
              { value: 'less_than_1_year', label: 'Less than 1 year (Projects / Internships)' },
              { value: '1_2_years', label: '1 - 2 years' },
              { value: '2_5_years', label: '2 - 5 years' },
              { value: '5_plus_years', label: '5+ years' },
            ]}
            value={form.experienceLevel}
            onChange={e => setForm({ ...form, experienceLevel: e.target.value })}
          />
        </div>
      </Card>

      {/* Skills Card */}
      <Card padding="lg" className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Technical Skills & Tools</h2>
          <p className="text-xs text-gray-500">Pick the key tools and frameworks you know well.</p>
        </div>

        {/* Quick pill selector */}
        <div className="flex flex-wrap gap-2 pt-1">
          {availableSkillsList.map((sk: any) => {
            const val = sk.id || sk.slug || sk.name
            const isSelected = form.selectedSkillIds.includes(val)
            return (
              <button
                key={val}
                type="button"
                onClick={() => {
                  const updated = isSelected
                    ? form.selectedSkillIds.filter(x => x !== val)
                    : [...form.selectedSkillIds, val]
                  setForm({ ...form, selectedSkillIds: updated })
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400 hover:bg-primary-50'
                }`}
              >
                {isSelected ? `✓ ${sk.name}` : `+ ${sk.name}`}
              </button>
            )
          })}
        </div>

        <div className="pt-2">
          <MultiSelect
            label="Search or Add More Skills"
            options={skillOptions}
            value={form.selectedSkillIds}
            onChange={ids => setForm({ ...form, selectedSkillIds: ids })}
            placeholder="Type to filter skills..."
          />
        </div>
      </Card>

      {/* Education Card */}
      <Card padding="lg" className="space-y-4">
        <h2 className="text-base font-bold text-gray-900">Education Details</h2>

        {educationList.length > 0 && (
          <div className="space-y-3 mb-4">
            {educationList.map(edu => (
              <div key={edu.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50/50">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{edu.institution}</p>
                  <p className="text-xs text-gray-500">{edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ''} {edu.end_year ? `(${edu.end_year})` : ''}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteEducation(edu.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Input
            placeholder="College / Institution"
            value={newEdu.institution}
            onChange={e => setNewEdu({ ...newEdu, institution: e.target.value })}
          />
          <Input
            placeholder="Degree (e.g. B.Tech)"
            value={newEdu.degree}
            onChange={e => setNewEdu({ ...newEdu, degree: e.target.value })}
          />
          <Input
            placeholder="Field of Study (e.g. CS)"
            value={newEdu.field_of_study}
            onChange={e => setNewEdu({ ...newEdu, field_of_study: e.target.value })}
          />
          <Input
            placeholder="Graduation Year"
            type="number"
            value={newEdu.end_year}
            onChange={e => setNewEdu({ ...newEdu, end_year: e.target.value })}
          />
        </div>
        <Button variant="outline" size="sm" onClick={handleAddEducation} leftIcon={<Plus size={14} />}>
          Add Education Entry
        </Button>
      </Card>

      {/* Portfolio & Social Links Card */}
      <Card padding="lg" className="space-y-4">
        <h2 className="text-base font-bold text-gray-900">Portfolio & Social Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="GitHub Profile URL"
            value={form.githubUrl}
            onChange={e => setForm({ ...form, githubUrl: e.target.value })}
            leftIcon={<Github size={16} />}
            placeholder="https://github.com/username"
          />
          <Input
            label="LinkedIn Profile URL"
            value={form.linkedinUrl}
            onChange={e => setForm({ ...form, linkedinUrl: e.target.value })}
            leftIcon={<Linkedin size={16} />}
            placeholder="https://linkedin.com/in/username"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Portfolio Website URL"
            value={form.portfolioUrl}
            onChange={e => setForm({ ...form, portfolioUrl: e.target.value })}
            leftIcon={<Globe size={16} />}
            placeholder="https://yourportfolio.com"
          />
          <Input
            label="Resume URL (PDF / Cloud drive link)"
            value={form.resumeUrl}
            onChange={e => setForm({ ...form, resumeUrl: e.target.value })}
            placeholder="https://drive.google.com/..."
          />
        </div>
      </Card>
    </div>
  )
}
