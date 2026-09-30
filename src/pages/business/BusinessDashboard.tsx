import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, Button, Badge, LoadingSpinner } from '@/components/ui'
import { Briefcase, Users, CheckSquare, Plus, ArrowRight } from 'lucide-react'

export default function BusinessDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ activeJobs: 0, applicants: 0, hires: 0 })

  useEffect(() => {
    async function loadData() {
      if (!user) return
      try {
        const { data: bp } = await supabase.from('business_profiles').select('id').eq('user_id', user.id).single()
        if (bp) {
          const { count: jobCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('business_id', bp.id)
          const { count: appCount } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('business_id', bp.id)
          const { count: hireCount } = await supabase.from('hiring_records').select('*', { count: 'exact', head: true }).eq('business_id', bp.id)

          setStats({ activeJobs: jobCount || 0, applicants: appCount || 0, hires: hireCount || 0 })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  if (loading) return <LoadingSpinner size="lg" text="Loading business dashboard..." />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>
          <p className="text-sm text-gray-500">Manage hiring, job postings, and student applications</p>
        </div>
        <Link to="/post-job" className="btn-primary btn inline-flex items-center gap-2">
          <Plus size={16} /> Post New Opportunity
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Briefcase size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
            <p className="text-xs text-gray-500">Active Job Postings</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <Users size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.applicants}</p>
            <p className="text-xs text-gray-500">Total Applicants</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckSquare size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.hires}</p>
            <p className="text-xs text-gray-500">Total Hires Made</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="space-y-2">
            <Link to="/post-job" className="block p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <p className="font-semibold text-sm text-gray-900">Post a Job / Internship</p>
              <p className="text-xs text-gray-500">Specify skills, salary, and requirements</p>
            </Link>
            <Link to="/talent" className="block p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <p className="font-semibold text-sm text-gray-900">Discover Talent</p>
              <p className="text-xs text-gray-500">Search student profiles by skills & availability</p>
            </Link>
            <Link to="/applicants" className="block p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <p className="font-semibold text-sm text-gray-900">Review Applicants</p>
              <p className="text-xs text-gray-500">Shortlist or select candidates</p>
            </Link>
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-bold text-gray-900 mb-2">Hiring Overview</h2>
          <p className="text-sm text-gray-500 mb-4">
            SkillBridge automatically logs every student hired for transparent tracking and platform metrics.
          </p>
          <Link to="/hiring" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
            View Complete Hiring Records <ArrowRight size={14} />
          </Link>
        </Card>
      </div>
    </div>
  )
}
