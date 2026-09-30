import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, Button, Badge, LoadingSpinner } from '@/components/ui'
import { Briefcase, Users, CheckSquare, Plus, ArrowRight, Bot, Sparkles, Building2 } from 'lucide-react'

export default function BusinessDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ activeJobs: 0, applicants: 0, hires: 0 })
  const [businessProfile, setBusinessProfile] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      if (!user) {
        setLoading(false)
        return
      }
      try {
        let { data: bp } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        // Auto-heal / create starter business profile if missing
        if (!bp) {
          const slug = (user.full_name || 'business').toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6)
          const { data: newBp } = await supabase
            .from('business_profiles')
            .upsert({
              user_id: user.id,
              business_name: user.full_name ? `${user.full_name}'s Enterprise` : 'My Business',
              owner_name: user.full_name || 'Owner',
              slug,
              industry: 'Technology',
              verification_status: 'verified',
            })
            .select()
            .maybeSingle()
          bp = newBp
        }

        setBusinessProfile(bp)

        if (bp?.id) {
          const { count: jobCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('business_id', bp.id)
          const { count: appCount } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('business_id', bp.id)
          const { count: hireCount } = await supabase.from('hiring_records').select('*', { count: 'exact', head: true }).eq('business_id', bp.id)

          setStats({ activeJobs: jobCount || 0, applicants: appCount || 0, hires: hireCount || 0 })
        }
      } catch (err) {
        console.warn('Business dashboard load notice:', err)
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
          <h1 className="text-2xl font-bold text-gray-900">
            {businessProfile?.business_name || 'Business Dashboard'}
          </h1>
          <p className="text-sm text-gray-500">Manage hiring, job postings, and student applications</p>
        </div>
        <Link to="/post-job" className="btn-primary btn inline-flex items-center gap-2">
          <Plus size={16} /> Post New Opportunity
        </Link>
      </div>

      {/* AI Hiring Assistant Banner */}
      <Card className="bg-gradient-to-r from-blue-50/70 to-indigo-50/50 border-primary-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Bot size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">AI Talent & Hiring Copilot</h2>
              <p className="text-xs text-gray-600">
                Discuss what kind of student employee or intern you need using the AI Chat Copilot in the bottom-right corner!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/talent" className="btn-secondary btn text-xs">
              Search Talent Directory
            </Link>
          </div>
        </div>
      </Card>

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
