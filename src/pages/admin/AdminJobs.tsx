import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, Badge, LoadingSpinner } from '@/components/ui'

export default function AdminJobs() {
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState<any[]>([])

  useEffect(() => {
    async function loadJobs() {
      try {
        const { data } = await supabase.from('jobs').select('*, business_profiles(business_name)').order('created_at', { ascending: false })
        setJobs(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadJobs()
  }, [])

  if (loading) return <LoadingSpinner size="lg" text="Loading jobs..." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Jobs & Opportunities</h1>
        <p className="text-sm text-gray-500">Overview of all platform job postings</p>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Title</TableHeader>
            <TableHeader>Business</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader>Applications</TableHeader>
            <TableHeader>Status</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {jobs.map(j => (
            <TableRow key={j.id}>
              <TableCell className="font-semibold text-gray-900">{j.title}</TableCell>
              <TableCell>{j.business_profiles?.business_name}</TableCell>
              <TableCell><Badge variant="blue">{j.job_type}</Badge></TableCell>
              <TableCell>{j.applications_count}</TableCell>
              <TableCell><Badge variant={j.status === 'active' ? 'green' : 'gray'}>{j.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
