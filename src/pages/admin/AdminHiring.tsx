import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, Badge, LoadingSpinner } from '@/components/ui'
import { formatDate } from '@/lib/utils'

export default function AdminHiring() {
  const [loading, setLoading] = useState(true)
  const [hires, setHires] = useState<any[]>([])

  useEffect(() => {
    async function loadHires() {
      try {
        const { data } = await supabase
          .from('hiring_records')
          .select('*, jobs(title), business_profiles(business_name), student_profiles(profiles(full_name, email))')
          .order('hired_at', { ascending: false })

        setHires(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadHires()
  }, [])

  if (loading) return <LoadingSpinner size="lg" text="Loading hiring analytics..." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Hiring Overview</h1>
        <p className="text-sm text-gray-500">Traceable records answering &quot;Which business hired which student?&quot;</p>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Hired Student</TableHeader>
            <TableHeader>Business / Employer</TableHeader>
            <TableHeader>Job Title</TableHeader>
            <TableHeader>Hired Date</TableHeader>
            <TableHeader>Outcome</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {hires.map(h => (
            <TableRow key={h.id}>
              <TableCell className="font-semibold text-gray-900">
                {h.student_profiles?.profiles?.full_name || 'Student'}
                <span className="block text-xs text-gray-400">{h.student_profiles?.profiles?.email}</span>
              </TableCell>
              <TableCell className="font-medium text-gray-800">{h.business_profiles?.business_name || 'Business'}</TableCell>
              <TableCell>{h.jobs?.title || 'Position'}</TableCell>
              <TableCell>{formatDate(h.hired_at)}</TableCell>
              <TableCell><Badge variant="green">Verified Hire ✓</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
