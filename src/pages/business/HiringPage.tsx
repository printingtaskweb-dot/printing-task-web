import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, Badge, LoadingSpinner, EmptyState } from '@/components/ui'
import { formatDate } from '@/lib/utils'

export default function HiringPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [hiringRecords, setHiringRecords] = useState<any[]>([])

  useEffect(() => {
    async function loadHires() {
      if (!user) return
      try {
        const { data: bp } = await supabase.from('business_profiles').select('id').eq('user_id', user.id).single()
        if (bp) {
          const { data } = await supabase
            .from('hiring_records')
            .select('*, jobs(title), student_profiles(profiles(full_name, email))')
            .eq('business_id', bp.id)
            .order('hired_at', { ascending: false })

          setHiringRecords(data || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadHires()
  }, [user])

  if (loading) return <LoadingSpinner size="lg" text="Loading hiring records..." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hiring History & Analytics</h1>
        <p className="text-sm text-gray-500">Official log of candidates hired by your business</p>
      </div>

      {hiringRecords.length === 0 ? (
        <EmptyState title="No hires recorded yet" description="Select candidates as 'Selected (Hired)' in Applicants to log hires here." />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Hired Student</TableHeader>
              <TableHeader>Position</TableHeader>
              <TableHeader>Hired Date</TableHeader>
              <TableHeader>Status</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {hiringRecords.map(hr => (
              <TableRow key={hr.id}>
                <TableCell className="font-semibold text-gray-900">
                  {hr.student_profiles?.profiles?.full_name || 'Student'}
                  <span className="block text-xs text-gray-400">{hr.student_profiles?.profiles?.email}</span>
                </TableCell>
                <TableCell>{hr.jobs?.title || 'Position'}</TableCell>
                <TableCell>{formatDate(hr.hired_at)}</TableCell>
                <TableCell><Badge variant="green">Hired & Active</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
