import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, Button, Badge, LoadingSpinner, EmptyState } from '@/components/ui'
import { Briefcase, FileText, BookmarkCheck, Trophy, Sparkles, ArrowRight, MapPin, Building2, UserCheck, Bot } from 'lucide-react'
import { formatSalary, formatWorkMode, timeAgo } from '@/lib/utils'
import { ResumeGeneratorModal } from '@/components/ai/ResumeGeneratorModal'
import type { JobWithDetails, ApplicationWithDetails } from '@/types'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ applications: 0, saved: 0, shortlisted: 0 })
  const [recentApplications, setRecentApplications] = useState<ApplicationWithDetails[]>([])
  const [recommendedJobs, setRecommendedJobs] = useState<JobWithDetails[]>([])
  const [studentProfile, setStudentProfile] = useState<any>(null)
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false)

  useEffect(() => {
    async function loadStudentData() {
      if (!user) {
        setLoading(false)
        return
      }
      try {
        // 1. Get or self-heal student profile
        let { data: sp } = await supabase
          .from('student_profiles')
          .select('*, primary_category:categories(name)')
          .eq('user_id', user.id)
          .maybeSingle()

        // Auto-create student profile if missing
        if (!sp) {
          const { data: newSp } = await supabase
            .from('student_profiles')
            .upsert({
              user_id: user.id,
              headline: 'Aspiring Professional',
              bio: '',
              experience_level: 'fresher',
            })
            .select('*, primary_category:categories(name)')
            .maybeSingle()
          sp = newSp
        }

        setStudentProfile(sp)

        if (sp?.id) {
          // Stats
          const { count: appCount } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('student_id', sp.id)
          const { count: savedCount } = await supabase.from('saved_jobs').select('*', { count: 'exact', head: true }).eq('student_id', sp.id)
          const { count: shortCount } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('student_id', sp.id).eq('status', 'shortlisted')

          setStats({ applications: appCount || 0, saved: savedCount || 0, shortlisted: shortCount || 0 })

          // Recent apps
          const { data: apps } = await supabase
            .from('applications')
            .select('*, jobs(*, business_profiles(*))')
            .eq('student_id', sp.id)
            .order('created_at', { ascending: false })
            .limit(4)

          setRecentApplications(apps || [])
        }

        // Recommended jobs
        const { data: jobs } = await supabase
          .from('jobs')
          .select('*, business_profiles(*), job_skills(*, skills(*))')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(4)

        setRecommendedJobs(jobs || [])
      } catch (err) {
        console.error('Student dashboard loading notice:', err)
      } finally {
        setLoading(false)
      }
    }
    loadStudentData()
  }, [user])

  if (loading) return <LoadingSpinner size="lg" text="Loading your student dashboard..." />

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-xs mb-3">
            <Sparkles size={13} className="text-amber-300" /> Student Career Dashboard
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">Welcome back, {user?.full_name || 'Student'}! 👋</h1>
          <p className="text-primary-100 text-sm mt-1 max-w-xl">
            Track your applications, generate ATS-ready resumes with AI, and apply to top internships and full-time opportunities.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResumeModalOpen(true)}
              className="bg-white text-primary-700 hover:bg-primary-50 border-white font-semibold"
              leftIcon={<Sparkles size={15} className="text-primary-600" />}
            >
              Generate AI Resume
            </Button>
            <Link to="/opportunities" className="bg-primary-800/80 hover:bg-primary-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-primary-500/30 inline-flex items-center gap-1.5">
              <Briefcase size={15} /> Browse Jobs
            </Link>
            <Link to="/profile" className="bg-primary-800/40 hover:bg-primary-800/70 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-primary-500/20 inline-flex items-center gap-1.5">
              <UserCheck size={15} /> Edit Profile
            </Link>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-8 -bottom-10 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />
      </div>

      {/* AI Quick Actions Bar */}
      <Card className="bg-gradient-to-r from-blue-50/60 to-indigo-50/40 border-primary-100 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Bot size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Need help landing your dream role?</h2>
              <p className="text-xs text-gray-600">Use our AI Copilot to generate your resume, draft cover letters, or match relevant openings.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setIsResumeModalOpen(true)} leftIcon={<Sparkles size={14} />}>
              Open Resume Builder
            </Button>
          </div>
        </div>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <FileText size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.applications}</p>
            <p className="text-xs text-gray-500">Total Applications</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <BookmarkCheck size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.saved}</p>
            <p className="text-xs text-gray-500">Saved Opportunities</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.shortlisted}</p>
            <p className="text-xs text-gray-500">Shortlisted for Review</p>
          </div>
        </Card>
      </div>

      {/* Recommended Jobs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recommended Opportunities</h2>
            <p className="text-xs text-gray-500">Curated opportunities matching fresh talent and student profiles</p>
          </div>
          <Link to="/opportunities" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recommendedJobs.length === 0 ? (
          <EmptyState title="No opportunities available yet" description="Check back soon for new postings from verified companies!" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedJobs.map(job => (
              <Card key={job.id} hover className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{job.title}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Building2 size={12} /> {job.business_profiles?.business_name || 'Verified Company'}
                      </p>
                    </div>
                    <Badge variant="blue">{job.job_type.replace('_', ' ')}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 my-3">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {job.location || 'Remote'}</span>
                    <span>•</span>
                    <span>{formatWorkMode(job.work_mode)}</span>
                    <span>•</span>
                    <span className="font-medium text-gray-700">{formatSalary(job.salary_min, job.salary_max)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                  <span className="text-gray-400">{timeAgo(job.created_at)}</span>
                  <Link to={`/opportunities/${job.slug}`} className="font-semibold text-primary-600 hover:text-primary-700">
                    Apply Now →
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Resume Generator Modal */}
      <ResumeGeneratorModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
      />
    </div>
  )
}
