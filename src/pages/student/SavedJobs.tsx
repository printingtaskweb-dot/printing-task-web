import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, Badge, Button, LoadingSpinner, EmptyState } from '@/components/ui'
import { Building2, MapPin, Trash2 } from 'lucide-react'
import { formatSalary, formatWorkMode } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function SavedJobs() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [savedJobs, setSavedJobs] = useState<any[]>([])

  useEffect(() => {
    async function loadSaved() {
      if (!user) return
      try {
        const { data: sp } = await supabase.from('student_profiles').select('id').eq('user_id', user.id).single()
        if (sp) {
          const { data } = await supabase
            .from('saved_jobs')
            .select('id, jobs(*, business_profiles(*))')
            .eq('student_id', sp.id)

          setSavedJobs(data || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadSaved()
  }, [user])

  const handleRemove = async (savedId: string) => {
    try {
      await supabase.from('saved_jobs').delete().eq('id', savedId)
      setSavedJobs(prev => prev.filter(s => s.id !== savedId))
      toast.success('Removed from saved')
    } catch (err) {
      toast.error('Failed to remove')
    }
  }

  if (loading) return <LoadingSpinner size="lg" text="Loading saved jobs..." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Saved Opportunities</h1>
        <p className="text-sm text-gray-500">Bookmarked opportunities to review or apply later</p>
      </div>

      {savedJobs.length === 0 ? (
        <EmptyState title="No saved jobs" description="Save jobs while browsing opportunities to view them here." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedJobs.map(item => {
            const job = item.jobs
            if (!job) return null
            return (
              <Card key={item.id} className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{job.title}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Building2 size={12} /> {job.business_profiles?.business_name || 'Business'}
                      </p>
                    </div>
                    <Badge variant="blue">{job.job_type.replace('_', ' ')}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 my-3">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {job.location || 'Remote'}</span>
                    <span>•</span>
                    <span>{formatWorkMode(job.work_mode)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                  <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleRemove(item.id)}>
                    <Trash2 size={14} /> Remove
                  </Button>
                  <Link to={`/opportunities/${job.slug}`} className="font-semibold text-primary-600 hover:text-primary-700">
                    Apply Now →
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
