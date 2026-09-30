import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, Badge, LoadingSpinner } from '@/components/ui'
import { Plus } from 'lucide-react'

export default function AdminHackathons() {
  const [loading, setLoading] = useState(true)
  const [hackathons, setHackathons] = useState<any[]>([])

  useEffect(() => {
    async function loadHackathons() {
      try {
        const { data } = await supabase.from('hackathons').select('*').order('created_at', { ascending: false })
        setHackathons(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadHackathons()
  }, [])

  if (loading) return <LoadingSpinner size="lg" text="Loading hackathons..." />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Hackathons</h1>
          <p className="text-sm text-gray-500">Create and host student hackathons and competitions</p>
        </div>
        <Link to="/admin/hackathons/new" className="btn-primary btn inline-flex items-center gap-1">
          <Plus size={16} /> Create Hackathon
        </Link>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Hackathon Title</TableHeader>
            <TableHeader>Theme</TableHeader>
            <TableHeader>Status</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {hackathons.map(h => (
            <TableRow key={h.id}>
              <TableCell className="font-semibold text-gray-900">{h.title}</TableCell>
              <TableCell>{h.theme || '—'}</TableCell>
              <TableCell><Badge variant="purple">{h.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
