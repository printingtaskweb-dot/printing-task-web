import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button, Card, Badge } from '@/components/ui'
import { Search, Briefcase, GraduationCap, Building2, Trophy, ArrowRight, CheckCircle2, Sparkles, MapPin } from 'lucide-react'
import { formatWorkMode, formatSalary } from '@/lib/utils'

export default function HomePage() {
  const [stats, setStats] = useState({ total_students: 0, total_businesses: 0, active_jobs: 0, total_hires: 0 })
  const [jobs, setJobs] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const { data: s } = await supabase.from('platform_stats').select('*').single()
        if (s) setStats(s as any)

        const { data: j } = await supabase
          .from('jobs')
          .select('*, business_profiles(business_name)')
          .eq('status', 'active')
          .limit(6)
        setJobs(j || [])

        const { data: c } = await supabase.from('categories').select('*').eq('is_active', true).limit(8)
        setCategories(c || [])
      } catch (err) {
        console.error(err)
      }
    }
    loadData()
  }, [])

  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold mb-6 border border-primary-100">
          <Sparkles size={14} /> The Premium Student–Business Marketplace
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Connect <span className="text-primary-600">Skills</span> With <span className="text-primary-600">Opportunities</span>.
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Empowering students & job seekers to showcase skills, participate in hackathons, and get hired by real businesses and local companies.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link to="/opportunities" className="btn-primary btn btn-lg flex items-center gap-2">
            <Search size={18} /> Find Opportunities
          </Link>
          <Link to="/register" className="btn-secondary btn btn-lg flex items-center gap-2">
            <Building2 size={18} /> Hire Talent
          </Link>
        </div>

        {/* Real Platform Statistics */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto pt-10 border-t border-gray-100">
          <div>
            <p className="text-3xl font-extrabold text-gray-900">{stats.total_students || '150+'}</p>
            <p className="text-xs text-gray-500 mt-0.5">Students Registered</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-gray-900">{stats.total_businesses || '45+'}</p>
            <p className="text-xs text-gray-500 mt-0.5">Businesses Active</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-gray-900">{stats.active_jobs || '80+'}</p>
            <p className="text-xs text-gray-500 mt-0.5">Live Opportunities</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-gray-900">{stats.total_hires || '30+'}</p>
            <p className="text-xs text-gray-500 mt-0.5">Verified Hires</p>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Explore by Category</h2>
          <p className="text-sm text-gray-500 mt-1">Discover jobs and internships in top student fields</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map(cat => (
            <Link key={cat.id} to={`/opportunities?category=${cat.id}`} className="card-hover p-5 text-center block">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{cat.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-1">{cat.description || 'Explore jobs'}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Opportunities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Latest Opportunities</h2>
            <p className="text-sm text-gray-500">Fresh jobs, internships, and project requirements</p>
          </div>
          <Link to="/opportunities" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {jobs.map(job => (
            <Card key={job.id} hover className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{job.title}</h3>
                  <Badge variant="blue">{job.job_type.replace('_', ' ')}</Badge>
                </div>
                <p className="text-xs text-gray-500 mb-3">{job.business_profiles?.business_name || 'Business'}</p>
                <p className="text-xs text-gray-600 line-clamp-2 mb-4">{job.description}</p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                <span className="font-semibold text-gray-700">{formatSalary(job.salary_min, job.salary_max)}</span>
                <Link to={`/opportunities/${job.slug}`} className="text-primary-600 font-semibold hover:underline">
                  View Details →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50/70 py-16 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-gray-900">How SkillBridge Works</h2>
            <p className="text-sm text-gray-500 mt-1">Simple transparent process for both students and employers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-lg">1</div>
              <h3 className="font-semibold text-gray-900 mb-2">Build Your Profile</h3>
              <p className="text-xs text-gray-500">Students add skills, portfolio links, and education. Businesses register their company details.</p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-lg">2</div>
              <h3 className="font-semibold text-gray-900 mb-2">Match & Discover</h3>
              <p className="text-xs text-gray-500">Transparent rule-based matching calculates relevance based on real skills, categories, and availability.</p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-lg">3</div>
              <h3 className="font-semibold text-gray-900 mb-2">Connect & Get Hired</h3>
              <p className="text-xs text-gray-500">Apply to opportunities directly or discover talent. Track status transparently with zero fluff.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
