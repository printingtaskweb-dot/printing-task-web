import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, Button, Badge, LoadingSpinner, Textarea } from '@/components/ui'
import { Building2, MapPin, Calendar, Clock, CheckCircle2, Bookmark } from 'lucide-react'
import { formatSalary, formatWorkMode, formatDate, timeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function JobDetailPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState<any>(null)
  const [applied, setApplied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [applying, setApplying] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [showApplyBox, setShowApplyBox] = useState(false)

  useEffect(() => {
    async function loadJob() {
      try {
        const { data } = await supabase
          .from('jobs')
          .select('*, business_profiles(*), job_skills(*, skills(*))')
          .eq('slug', slug)
          .single()

        setJob(data)

        if (user && data) {
          const { data: sp } = await supabase.from('student_profiles').select('id').eq('user_id', user.id).single()
          if (sp) {
            const { data: app } = await supabase.from('applications').select('id').eq('job_id', data.id).eq('student_id', sp.id).single()
            if (app) setApplied(true)

            const { data: sj } = await supabase.from('saved_jobs').select('id').eq('job_id', data.id).eq('student_id', sp.id).single()
            if (sj) setSaved(true)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadJob()
  }, [slug, user])

  const handleApply = async () => {
    if (!user) {
      toast.error('Please sign in to apply')
      navigate('/login')
      return
    }

    setApplying(true)
    try {
      const { data: sp } = await supabase.from('student_profiles').select('id').eq('user_id', user.id).single()
      if (!sp) throw new Error('Student profile not found')

      const { error } = await supabase.from('applications').insert({
        job_id: job.id,
        student_id: sp.id,
        business_id: job.business_id,
        cover_letter: coverLetter,
        status: 'applied',
      })

      if (error) throw error

      setApplied(true)
      setShowApplyBox(false)
      toast.success('Application submitted successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit application')
    } finally {
      setApplying(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    try {
      const { data: sp } = await supabase.from('student_profiles').select('id').eq('user_id', user.id).single()
      if (!sp) return

      if (saved) {
        await supabase.from('saved_jobs').delete().eq('job_id', job.id).eq('student_id', sp.id)
        setSaved(false)
        toast.success('Removed from saved')
      } else {
        await supabase.from('saved_jobs').insert({ job_id: job.id, student_id: sp.id })
        setSaved(true)
        toast.success('Saved to bookmarks!')
      }
    } catch (err) {
      toast.error('Action failed')
    }
  }

  if (loading) return <LoadingSpinner size="lg" text="Loading job details..." />
  if (!job) return <div className="text-center py-12 text-gray-500">Opportunity not found.</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      <Card padding="lg" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <Badge variant="blue" className="mb-2">{job.job_type.replace('_', ' ')}</Badge>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-sm font-medium text-gray-600 flex items-center gap-1 mt-1">
              <Building2 size={16} /> {job.business_profiles?.business_name || 'Business'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {user?.role === 'student' && (
              <>
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved' : 'Save'}
                </Button>
                {applied ? (
                  <Badge variant="green" className="py-2 px-3 text-sm">Applied ✓</Badge>
                ) : (
                  <Button onClick={() => setShowApplyBox(true)}>Apply Now</Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Details bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl text-xs text-gray-600">
          <div>
            <p className="text-gray-400">Salary/Stipend</p>
            <p className="font-semibold text-gray-900 mt-0.5">{formatSalary(job.salary_min, job.salary_max)}</p>
          </div>
          <div>
            <p className="text-gray-400">Work Mode</p>
            <p className="font-semibold text-gray-900 mt-0.5">{formatWorkMode(job.work_mode)}</p>
          </div>
          <div>
            <p className="text-gray-400">Location</p>
            <p className="font-semibold text-gray-900 mt-0.5">{job.location || 'Remote'}</p>
          </div>
          <div>
            <p className="text-gray-400">Posted</p>
            <p className="font-semibold text-gray-900 mt-0.5">{timeAgo(job.created_at)}</p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-900">About the Role</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>

        {/* Skills */}
        {job.job_skills?.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-3">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.job_skills.map((js: any) => (
                <Badge key={js.id} variant="purple">{js.skills?.name || 'Skill'}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Application Modal/Box */}
        {showApplyBox && (
          <Card padding="md" className="bg-primary-50/50 border-primary-200 mt-6 space-y-4">
            <h3 className="font-bold text-gray-900">Submit Application</h3>
            <Textarea
              label="Cover Letter / Message to Employer"
              placeholder="Explain why you are a great fit for this role..."
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowApplyBox(false)}>Cancel</Button>
              <Button size="sm" isLoading={applying} onClick={handleApply}>Confirm Application</Button>
            </div>
          </Card>
        )}
      </Card>
    </div>
  )
}
