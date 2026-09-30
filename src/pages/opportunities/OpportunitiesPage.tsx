import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, Button, Input, SearchBar, Select, Badge, LoadingSpinner, EmptyState } from '@/components/ui'
import { Building2, MapPin, Search, Filter } from 'lucide-react'
import { formatSalary, formatWorkMode, timeAgo } from '@/lib/utils'

export default function OpportunitiesPage() {
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [jobType, setJobType] = useState('')
  const [workMode, setWorkMode] = useState('')

  useEffect(() => {
    async function loadJobs() {
      setLoading(true)
      try {
        let query = supabase.from('jobs').select('*, business_profiles(business_name, logo_url)').eq('status', 'active')

        if (search) query = query.ilike('title', `%${search}%`)
        if (jobType) query = query.eq('job_type', jobType as any)
        if (workMode) query = query.eq('work_mode', workMode as any)

        const { data } = await query.order('created_at', { ascending: false })
        setJobs(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadJobs()
  }, [search, jobType, workMode])

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Explore Opportunities</h1>
        <p className="text-sm text-gray-500">Search and filter active jobs, internships, and project requirements</p>
      </div>

      {/* Search & Filters */}
      <Card padding="md" className="flex flex-col sm:flex-row gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by job title or keyword..."
          className="flex-1"
        />
        <div className="flex gap-2">
          <Select
            options={[
              { value: '', label: 'All Types' },
              { value: 'full_time', label: 'Full-time' },
              { value: 'internship', label: 'Internship' },
              { value: 'part_time', label: 'Part-time' },
              { value: 'freelance', label: 'Freelance' },
            ]}
            value={jobType}
            onChange={e => setJobType(e.target.value)}
          />
          <Select
            options={[
              { value: '', label: 'All Modes' },
              { value: 'remote', label: 'Remote' },
              { value: 'on_site', label: 'On-site' },
              { value: 'hybrid', label: 'Hybrid' },
            ]}
            value={workMode}
            onChange={e => setWorkMode(e.target.value)}
          />
        </div>
      </Card>

      {/* Job List */}
      {loading ? (
        <LoadingSpinner size="lg" text="Searching opportunities..." />
      ) : jobs.length === 0 ? (
        <EmptyState title="No opportunities found" description="Try adjusting your search query or filters." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map(job => (
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

                <p className="text-xs text-gray-600 line-clamp-2 my-3">{job.description}</p>

                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {job.location || 'Remote'}</span>
                  <span>•</span>
                  <span>{formatWorkMode(job.work_mode)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                <span className="font-semibold text-gray-700">{formatSalary(job.salary_min, job.salary_max)}</span>
                <Link to={`/opportunities/${job.slug}`} className="font-semibold text-primary-600 hover:text-primary-700">
                  View & Apply →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
