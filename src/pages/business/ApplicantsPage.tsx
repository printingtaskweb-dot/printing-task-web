import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, Badge, Button, LoadingSpinner, EmptyState, Modal, Select } from '@/components/ui'
import { getApplicationStatusColor, getApplicationStatusLabel } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ApplicantsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [applicants, setApplicants] = useState<any[]>([])
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [newStatus, setNewStatus] = useState('')
  const [statusModalOpen, setStatusModalOpen] = useState(false)

  useEffect(() => {
    async function loadApplicants() {
      if (!user) return
      try {
        const { data: bp } = await supabase.from('business_profiles').select('id').eq('user_id', user.id).single()
        if (bp) {
          const { data } = await supabase
            .from('applications')
            .select('*, jobs(title), student_profiles(*, profiles(full_name, email))')
            .eq('business_id', bp.id)
            .order('created_at', { ascending: false })

          setApplicants(data || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadApplicants()
  }, [user])

  const handleUpdateStatus = async () => {
    if (!selectedApp || !newStatus) return

    try {
      // 1. Update application status
      await supabase.from('applications').update({ status: newStatus as any }).eq('id', selectedApp.id)

      // 2. If status is 'selected', create a hiring record!
      if (newStatus === 'selected') {
        await supabase.from('hiring_records').insert({
          application_id: selectedApp.id,
          student_id: selectedApp.student_id,
          business_id: selectedApp.business_id,
          job_id: selectedApp.job_id,
          hired_at: new Date().toISOString(),
        })
        toast.success('Candidate selected & hiring record created!')
      } else {
        toast.success(`Status updated to ${newStatus}`)
      }

      setApplicants(prev => prev.map(a => a.id === selectedApp.id ? { ...a, status: newStatus } : a))
      setStatusModalOpen(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status')
    }
  }

  if (loading) return <LoadingSpinner size="lg" text="Loading applicants..." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Applicants</h1>
        <p className="text-sm text-gray-500">Review student applications, update status, and record hires</p>
      </div>

      {applicants.length === 0 ? (
        <EmptyState title="No applicants yet" description="Applications for your posted jobs will appear here." />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Applicant Name</TableHeader>
              <TableHeader>Job Applied</TableHeader>
              <TableHeader>Current Status</TableHeader>
              <TableHeader>Action</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {applicants.map(app => (
              <TableRow key={app.id}>
                <TableCell className="font-semibold text-gray-900">
                  {app.student_profiles?.profiles?.full_name || 'Student'}
                  <span className="block text-xs text-gray-400">{app.student_profiles?.profiles?.email}</span>
                </TableCell>
                <TableCell>{app.jobs?.title || 'Job'}</TableCell>
                <TableCell>
                  <Badge variant={getApplicationStatusColor(app.status) as any}>
                    {getApplicationStatusLabel(app.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedApp(app)
                      setNewStatus(app.status)
                      setStatusModalOpen(true)
                    }}
                  >
                    Update Status
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Status Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Application Status"
        footer={
          <>
            <Button variant="secondary" onClick={() => setStatusModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateStatus}>Save Status</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Updating status for <strong>{selectedApp?.student_profiles?.profiles?.full_name}</strong> for <strong>{selectedApp?.jobs?.title}</strong>.
          </p>
          <Select
            label="Select Status"
            options={[
              { value: 'applied', label: 'Applied' },
              { value: 'under_review', label: 'Under Review' },
              { value: 'shortlisted', label: 'Shortlisted' },
              { value: 'interview', label: 'Interview' },
              { value: 'selected', label: 'Selected (Hired)' },
              { value: 'rejected', label: 'Rejected' },
            ]}
            value={newStatus}
            onChange={e => setNewStatus(e.target.value)}
          />
          {newStatus === 'selected' && (
            <p className="text-xs text-emerald-600 font-medium">
              ★ Selecting &apos;Selected&apos; will permanently record this hiring outcome in platform hiring analytics.
            </p>
          )}
        </div>
      </Modal>
    </div>
  )
}
