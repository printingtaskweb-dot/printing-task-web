import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, Badge, Button, LoadingSpinner, EmptyState } from '@/components/ui'
import { formatWorkMode, timeAgo } from '@/lib/utils'

export default function MyJobsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState<any[]>([])

  useEffect(() => {
    async function loadJobs() {
      if (!user) return
      try {
        const { data: bp } = await supabase.from('business_profiles').select('id').eq('user_id', user.id).single()
        if (bp) {
          const { data } = await supabase
            .from('jobs')
            .select('*')
            .eq('business_id', bp.id)
            .order('created_at', { ascending: false })

          setJobs(data || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadJobs()
  }, [user])

  if (loading) return <LoadingSpinner size="lg" text="Loading opportunities..." />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Posted Opportunities</h1>
          <p className="text-sm text-gray-500">Manage your active, paused, and closed opportunity listings</p>
        </div>
        <Link to="/post-job" className="btn-primary btn">Post New Opportunity</Link>
      </div>

      {jobs.length === 0 ? (
        <EmptyState title="No opportunities posted yet" description="Post a job or internship to start receiving applications." />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Title</TableHeader>
              <TableHeader>Type</TableHeader>
              <TableHeader>Work Mode</TableHeader>
              <TableHeader>Applications</TableHeader>
              <TableHeader>Posted Date</TableHeader>
              <TableHeader>Status</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map(job => (
              <TableRow key={job.id}>
                <TableCell className="font-semibold text-gray-900">
                  <Link to={`/opportunities/${job.slug}`} className="hover:text-primary-600">
                    {job.title}
                  </Link>
                </TableCell>
                <TableCell><Badge variant="blue">{job.job_type.replace('_', ' ')}</Badge></TableCell>
                <TableCell>{formatWorkMode(job.work_mode)}</TableCell>
                <TableCell className="font-bold text-primary-700">{job.applications_count}</TableCell>
                <TableCell>{timeAgo(job.created_at)}</TableCell>
                <TableCell><Badge variant={job.status === 'active' ? 'green' : 'gray'}>{job.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
