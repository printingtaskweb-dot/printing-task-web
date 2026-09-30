import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, Badge, LoadingSpinner, EmptyState } from '@/components/ui'
import { Trophy, Calendar, Users, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function HackathonsPage() {
  const [loading, setLoading] = useState(true)
  const [hackathons, setHackathons] = useState<any[]>([])

  useEffect(() => {
    async function loadHackathons() {
      try {
        const { data } = await supabase
          .from('hackathons')
          .select('*')
          .neq('status', 'draft')
          .order('start_date', { ascending: true })

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
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Hackathons & Competitions</h1>
        <p className="text-sm text-gray-500">Participate in platform hackathons, build projects, win prizes, and get noticed by businesses</p>
      </div>

      {hackathons.length === 0 ? (
        <EmptyState title="No upcoming hackathons" description="Check back soon for new hackathons and coding challenges!" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hackathons.map(h => (
            <Card key={h.id} hover className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <Badge variant="purple">{h.status.replace('_', ' ')}</Badge>
                  <span className="text-xs font-semibold text-emerald-600">Prize Pool: ₹50,000+</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{h.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-4">{h.description}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-600">
                <span className="flex items-center gap-1"><Calendar size={14} /> Starts {formatDate(h.start_date)}</span>
                <Link to={`/hackathons/${h.slug}`} className="font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                  View Details <ArrowRight size={14} />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
