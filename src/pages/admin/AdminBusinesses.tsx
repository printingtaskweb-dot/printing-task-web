import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, Badge, LoadingSpinner } from '@/components/ui'

export default function AdminBusinesses() {
  const [loading, setLoading] = useState(true)
  const [businesses, setBusinesses] = useState<any[]>([])

  useEffect(() => {
    async function loadBusinesses() {
      try {
        const { data } = await supabase.from('business_profiles').select('*, profiles(email)').order('created_at', { ascending: false })
        setBusinesses(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadBusinesses()
  }, [])

  if (loading) return <LoadingSpinner size="lg" text="Loading businesses..." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Businesses</h1>
        <p className="text-sm text-gray-500">Monitor registered business profiles and verification status</p>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Business Name</TableHeader>
            <TableHeader>Owner</TableHeader>
            <TableHeader>Industry</TableHeader>
            <TableHeader>Location</TableHeader>
            <TableHeader>Verification</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {businesses.map(b => (
            <TableRow key={b.id}>
              <TableCell className="font-semibold text-gray-900">{b.business_name}</TableCell>
              <TableCell>{b.owner_name}</TableCell>
              <TableCell>{b.industry || '—'}</TableCell>
              <TableCell>{b.location || '—'}</TableCell>
              <TableCell><Badge variant="green">{b.verification_status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
