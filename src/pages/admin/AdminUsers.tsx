import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, Badge, LoadingSpinner, SearchBar } from '@/components/ui'
import { formatDate } from '@/lib/utils'

export default function AdminUsers() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadUsers() {
      try {
        let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })
        if (search) query = query.ilike('full_name', `%${search}%`)
        const { data } = await query
        setUsers(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadUsers()
  }, [search])

  if (loading) return <LoadingSpinner size="lg" text="Loading users..." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500">View and manage registered students, business owners, and admins</p>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search users by name..." />

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Email</TableHeader>
            <TableHeader>Role</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Joined</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map(u => (
            <TableRow key={u.id}>
              <TableCell className="font-semibold text-gray-900">{u.full_name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell><Badge variant={u.role === 'admin' ? 'purple' : u.role === 'business_owner' ? 'orange' : 'blue'}>{u.role}</Badge></TableCell>
              <TableCell><Badge variant={u.status === 'active' ? 'green' : 'red'}>{u.status}</Badge></TableCell>
              <TableCell>{formatDate(u.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
