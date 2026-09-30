import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, Badge, LoadingSpinner, EmptyState, Button } from '@/components/ui'
import { getApplicationStatusColor, getApplicationStatusLabel, timeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function MyApplications() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<any[]>([])

  useEffect(() => {
    async function loadApps() {
      if (!user) return
      try {
        const { data: sp } = await supabase.from('student_profiles').select('id').eq('user_id', user.id).single()
        if (sp) {
          const { data } = await supabase
            .from('applications')
            .select('*, jobs(title, job_type, business_profiles(business_name))')
            .eq('student_id', sp.id)
            .order('created_at', { ascending: false })

          setApplications(data || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadApps()
  }, [user])

  const handleWithdraw = async (appId: string) => {
    try {
      await supabase.from('applications').update({ status: 'withdrawn' }).eq('id', appId)
      toast.success('Application withdrawn')
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'withdrawn' } : a))
    } catch (err) {
      toast.error('Failed to withdraw application')
    }
  }

  if (loading) return <LoadingSpinner size="lg" text="Loading applications..." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Track Applications</h1>
        <p className="text-sm text-gray-500">Monitor the status of your submitted job & internship applications</p>
      </div>

      {applications.length === 0 ? (
        <EmptyState title="No applications submitted yet" description="Start exploring opportunities and apply today!" />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Opportunity</TableHeader>
              <TableHeader>Company</TableHeader>
              <TableHeader>Applied Date</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Action</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map(app => (
              <TableRow key={app.id}>
                <TableCell className="font-semibold text-gray-900">{app.jobs?.title || 'Job'}</TableCell>
                <TableCell>{app.jobs?.business_profiles?.business_name || 'Business'}</TableCell>
                <TableCell>{timeAgo(app.created_at)}</TableCell>
                <TableCell>
                  <Badge variant={getApplicationStatusColor(app.status) as any}>
                    {getApplicationStatusLabel(app.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {app.status !== 'withdrawn' && app.status !== 'rejected' && app.status !== 'selected' && (
                    <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => handleWithdraw(app.id)}>
                      Withdraw
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
