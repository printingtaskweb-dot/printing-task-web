import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, Button, Input, Textarea, Select, MultiSelect } from '@/components/ui'
import { Briefcase } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Skill } from '@/types'

export default function PostJobPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [skills, setSkills] = useState<Skill[]>([])

  const [form, setForm] = useState({
    title: '',
    jobType: 'full_time',
    workMode: 'on_site',
    experienceLevel: 'fresher',
    location: '',
    description: '',
    responsibilities: '',
    requirements: '',
    benefits: '',
    salaryMin: '',
    salaryMax: '',
    duration: '',
    openings: '1',
    applicationDeadline: '',
    selectedSkillIds: [] as string[],
  })

  useEffect(() => {
    async function loadSkills() {
      const { data } = await supabase.from('skills').select('*').eq('is_active', true)
      setSkills(data || [])
    }
    loadSkills()
  }, [])

  const skillOptions = skills.map(s => ({ value: s.id, label: s.name }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.description) {
      toast.error('Title and description are required')
      return
    }
    if (!user) return

    setSubmitting(true)
    try {
      const { data: bp } = await supabase.from('business_profiles').select('id').eq('user_id', user.id).single()
      if (!bp) throw new Error('Business profile not found')

      const { data: job, error } = await supabase
        .from('jobs')
        .insert({
          business_id: bp.id,
          title: form.title,
          description: form.description,
          responsibilities: form.responsibilities,
          requirements: form.requirements,
          benefits: form.benefits,
          job_type: form.jobType as any,
          work_mode: form.workMode as any,
          experience_level: form.experienceLevel as any,
          location: form.location,
          salary_min: parseInt(form.salaryMin) || null,
          salary_max: parseInt(form.salaryMax) || null,
          duration: form.duration,
          openings: parseInt(form.openings) || 1,
          application_deadline: form.applicationDeadline || null,
          status: 'active',
        })
        .select()
        .single()

      if (error) throw error

      if (form.selectedSkillIds.length > 0 && job) {
        const jobSkills = form.selectedSkillIds.map(skId => ({
          job_id: job.id,
          skill_id: skId,
          is_required: true,
        }))
        await supabase.from('job_skills').insert(jobSkills)
      }

      toast.success('Opportunity published successfully!')
      navigate('/my-jobs')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to post job')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white">
          <Briefcase size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Post New Opportunity</h1>
          <p className="text-sm text-gray-500">Create a job, internship, or freelance project posting</p>
        </div>
      </div>

      <Card padding="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Opportunity Title"
            placeholder="e.g. Frontend Developer Intern / Junior Web Developer"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Opportunity Type"
              options={[
                { value: 'full_time', label: 'Full-time' },
                { value: 'part_time', label: 'Part-time' },
                { value: 'internship', label: 'Internship' },
                { value: 'freelance', label: 'Freelance' },
                { value: 'project', label: 'Project-based' },
              ]}
              value={form.jobType}
              onChange={e => setForm({ ...form, jobType: e.target.value })}
            />
            <Select
              label="Work Mode"
              options={[
                { value: 'remote', label: 'Remote' },
                { value: 'on_site', label: 'On-site' },
                { value: 'hybrid', label: 'Hybrid' },
              ]}
              value={form.workMode}
              onChange={e => setForm({ ...form, workMode: e.target.value })}
            />
            <Select
              label="Experience Level"
              options={[
                { value: 'fresher', label: 'Fresher' },
                { value: 'less_than_1_year', label: '< 1 Year' },
                { value: '1_2_years', label: '1 - 2 Years' },
                { value: '2_5_years', label: '2 - 5 Years' },
                { value: '5_plus_years', label: '5+ Years' },
              ]}
              value={form.experienceLevel}
              onChange={e => setForm({ ...form, experienceLevel: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Location"
              placeholder="e.g. Mumbai, India (or Remote)"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
            />
            <Input
              label="Duration / Commitment"
              placeholder="e.g. 3 Months / Permanent"
              value={form.duration}
              onChange={e => setForm({ ...form, duration: e.target.value })}
            />
          </div>

          <Textarea
            label="Job Description"
            placeholder="Describe the opportunity, company mission, and expectations..."
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            required
          />

          <MultiSelect
            label="Required Skills"
            options={skillOptions}
            value={form.selectedSkillIds}
            onChange={ids => setForm({ ...form, selectedSkillIds: ids })}
            placeholder="Select required skills..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Min Salary/Stipend (INR/mo)"
              type="number"
              placeholder="e.g. 15000"
              value={form.salaryMin}
              onChange={e => setForm({ ...form, salaryMin: e.target.value })}
            />
            <Input
              label="Max Salary/Stipend (INR/mo)"
              type="number"
              placeholder="e.g. 25000"
              value={form.salaryMax}
              onChange={e => setForm({ ...form, salaryMax: e.target.value })}
            />
            <Input
              label="Number of Openings"
              type="number"
              value={form.openings}
              onChange={e => setForm({ ...form, openings: e.target.value })}
            />
          </div>

          <Input
            label="Application Deadline"
            type="date"
            value={form.applicationDeadline}
            onChange={e => setForm({ ...form, applicationDeadline: e.target.value })}
          />

          <Button type="submit" fullWidth isLoading={submitting} size="lg">
            Publish Opportunity
          </Button>
        </form>
      </Card>
    </div>
  )
}
