import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, Button, Badge, LoadingSpinner, EmptyState } from '@/components/ui'
import { Briefcase, FileText, BookmarkCheck, Trophy, Sparkles, ArrowRight, MapPin, Building2 } from 'lucide-react'
import { formatSalary, formatWorkMode, timeAgo } from '@/lib/utils'
import type { JobWithDetails, ApplicationWithDetails } from '@/types'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ applications: 0, saved: 0, shortlisted: 0 })
  const [recentApplications, setRecentApplications] = useState<ApplicationWithDetails[]>([])
  const [recommendedJobs, setRecommendedJobs] = useState<JobWithDetails[]>([])

  useEffect(() => {
    async function loadStudentData() {
      if (!user) return
      try {
        // Get student profile
        const { data: sp } = await supabase
          .from('student_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (sp) {
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
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadStudentData()
  }, [user])

  if (loading) return <LoadingSpinner size="lg" text="Loading dashboard..." />

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 sm:p-8 text-white shadow-sm">
        <h1 className="text-xl sm:text-2xl font-bold">Welcome back, {user?.full_name}! 👋</h1>
        <p className="text-primary-100 text-sm mt-1 max-w-xl">
          Discover relevant jobs, internships, and hackathons tailored to your skill set.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/opportunities" className="bg-white text-primary-700 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            Browse Opportunities
          </Link>
          <Link to="/hackathons" className="bg-primary-700/60 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-primary-500/30">
            Explore Hackathons
          </Link>
        </div>
      </div>

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
            <p className="text-xs text-gray-500">Shortlisted</p>
          </div>
        </Card>
      </div>

      {/* Recommended Jobs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recommended Opportunities</h2>
          <Link to="/opportunities" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recommendedJobs.length === 0 ? (
          <EmptyState title="No opportunities available yet" description="Check back soon for new postings!" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedJobs.map(job => (
              <Card key={job.id} hover className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{job.title}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Building2 size={12} /> {job.business_profiles?.business_name || 'Business'}
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
    </div>
  )
}
