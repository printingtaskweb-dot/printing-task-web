import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, LoadingSpinner } from '@/components/ui'
import { Users, Building2, Briefcase, FileText, CheckSquare, Trophy, Code2, BookOpen, Star } from 'lucide-react'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>({})

  useEffect(() => {
    async function loadStats() {
      try {
        const { data } = await supabase.from('platform_stats').select('*').single()
        setStats(data || {})
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading) return <LoadingSpinner size="lg" text="Loading admin analytics..." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Admin Overview</h1>
        <p className="text-sm text-gray-500">Monitor overall users, businesses, hiring, jobs, and platform updates</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{stats.total_students || 0}</p>
            <p className="text-xs text-gray-500">Students</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
            <Building2 size={20} />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{stats.total_businesses || 0}</p>
            <p className="text-xs text-gray-500">Businesses</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
            <Briefcase size={20} />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{stats.active_jobs || 0}</p>
            <p className="text-xs text-gray-500">Active Jobs</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <CheckSquare size={20} />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{stats.total_hires || 0}</p>
            <p className="text-xs text-gray-500">Verified Hires</p>
          </div>
        </Card>
      </div>

      {/* Admin Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/admin/hiring" className="card-hover p-5 block">
          <CheckSquare className="text-emerald-600 mb-2" size={24} />
          <h3 className="font-bold text-gray-900 text-sm">Hiring Analytics</h3>
          <p className="text-xs text-gray-500 mt-1">Answer &quot;Which business hired which student?&quot;</p>
        </Link>

        <Link to="/admin/dev-tracker" className="card-hover p-5 block">
          <Code2 className="text-blue-600 mb-2" size={24} />
          <h3 className="font-bold text-gray-900 text-sm">Dev & Operations Panel</h3>
          <p className="text-xs text-gray-500 mt-1">Track planned, testing, and completed platform updates</p>
        </Link>

        <Link to="/admin/categories" className="card-hover p-5 block">
          <Star className="text-purple-600 mb-2 font-bold" size={24} />
          <h3 className="font-bold text-gray-900 text-sm">Categories & Skills</h3>
          <p className="text-xs text-gray-500 mt-1">Manage database-driven skills hierarchy</p>
        </Link>
      </div>
    </div>
  )
}
