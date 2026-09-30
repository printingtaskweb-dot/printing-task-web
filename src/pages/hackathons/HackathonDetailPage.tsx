import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, Button, Badge, LoadingSpinner } from '@/components/ui'
import { Trophy, Calendar, Users, CheckCircle2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function HackathonDetailPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [hackathon, setHackathon] = useState<any>(null)
  const [registered, setRegistered] = useState(false)
  const [registering, setRegistering] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const { data } = await supabase.from('hackathons').select('*').eq('slug', slug).single()
        setHackathon(data)

        if (user && data) {
          const { data: sp } = await supabase.from('student_profiles').select('id').eq('user_id', user.id).single()
          if (sp) {
            const { data: reg } = await supabase.from('hackathon_registrations').select('id').eq('hackathon_id', data.id).eq('student_id', sp.id).single()
            if (reg) setRegistered(true)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [slug, user])

  const handleRegister = async () => {
    if (!user) {
      toast.error('Please sign in to register')
      return
    }

    setRegistering(true)
    try {
      const { data: sp } = await supabase.from('student_profiles').select('id').eq('user_id', user.id).single()
      if (!sp) throw new Error('Student profile not found')

      await supabase.from('hackathon_registrations').insert({
        hackathon_id: hackathon.id,
        student_id: sp.id,
        is_confirmed: true,
      })

      setRegistered(true)
      toast.success('Successfully registered for hackathon!')
    } catch (err: any) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setRegistering(false)
    }
  }

  if (loading) return <LoadingSpinner size="lg" text="Loading hackathon details..." />
  if (!hackathon) return <div className="text-center py-12 text-gray-500">Hackathon not found.</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      <Card padding="lg" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <Badge variant="purple" className="mb-2">{hackathon.status}</Badge>
            <h1 className="text-2xl font-bold text-gray-900">{hackathon.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{hackathon.theme || 'Open Track Innovation'}</p>
          </div>

          <div>
            {registered ? (
              <Badge variant="green" className="py-2 px-3 text-sm">Registered ✓</Badge>
            ) : (
              <Button isLoading={registering} onClick={handleRegister}>
                Register Now
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-900">About the Hackathon</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{hackathon.description}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl text-xs space-y-2 text-gray-600">
          <p>📅 <strong>Start Date:</strong> {formatDate(hackathon.start_date)}</p>
          <p>🏁 <strong>End Date:</strong> {formatDate(hackathon.end_date)}</p>
          <p>👥 <strong>Team Size:</strong> {hackathon.min_team_size} - {hackathon.max_team_size} Members</p>
        </div>
      </Card>
    </div>
  )
}
