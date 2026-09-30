import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, Badge, LoadingSpinner, EmptyState } from '@/components/ui'
import { Building2, MapPin } from 'lucide-react'

export default function BusinessesPage() {
  const [loading, setLoading] = useState(true)
  const [businesses, setBusinesses] = useState<any[]>([])

  useEffect(() => {
    async function loadBusinesses() {
      try {
        const { data } = await supabase.from('business_profiles').select('*')
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
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Partner Businesses & Employers</h1>
        <p className="text-sm text-gray-500">Discover verified companies and organizations hiring student talent</p>
      </div>

      {businesses.length === 0 ? (
        <EmptyState title="No businesses listed yet" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {businesses.map(b => (
            <Card key={b.id} hover className="flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base mb-1">{b.business_name}</h3>
                <p className="text-xs text-gray-500 mb-2">{b.industry || 'Business'}</p>
                <p className="text-xs text-gray-600 line-clamp-2 mb-3">{b.description}</p>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                <span>{b.location || 'India'}</span>
                <Badge variant="green">Verified</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
