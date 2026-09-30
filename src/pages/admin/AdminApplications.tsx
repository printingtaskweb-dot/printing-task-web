import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, Badge, LoadingSpinner } from '@/components/ui'

export default function AdminApplications() {
  const [loading, setLoading] = useState(true)
  const [apps, setApps] = useState<any[]>([])

  useEffect(() => {
    async function loadApps() {
      try {
        const { data } = await supabase
          .from('applications')
          .select('*, jobs(title), business_profiles(business_name), student_profiles(profiles(full_name))')
          .order('created_at', { ascending: false })
        setApps(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadApps()
  }, [])

  if (loading) return <LoadingSpinner size="lg" text="Loading applications..." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Monitor Applications</h1>
        <p className="text-sm text-gray-500">View real-time application activity across the platform</p>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Student</TableHeader>
            <TableHeader>Business</TableHeader>
            <TableHeader>Job Title</TableHeader>
            <TableHeader>Status</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {apps.map(a => (
            <TableRow key={a.id}>
              <TableCell className="font-semibold text-gray-900">{a.student_profiles?.profiles?.full_name}</TableCell>
              <TableCell>{a.business_profiles?.business_name}</TableCell>
              <TableCell>{a.jobs?.title}</TableCell>
              <TableCell><Badge variant="blue">{a.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
