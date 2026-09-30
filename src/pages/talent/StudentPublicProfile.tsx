import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, Badge, LoadingSpinner } from '@/components/ui'
import { MapPin, Mail, Github, Linkedin, Globe } from 'lucide-react'

export default function StudentPublicProfile() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<any>(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data } = await supabase
          .from('student_profiles')
          .select('*, profiles(full_name, email, avatar_url), primary_category:categories(name), student_skills(*, skills(name))')
          .eq('id', id)
          .single()
        setStudent(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [id])

  if (loading) return <LoadingSpinner size="lg" text="Loading student profile..." />
  if (!student) return <div className="text-center py-12 text-gray-500">Profile not found.</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      <Card padding="lg" className="space-y-6">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
          <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-2xl">
            {student.profiles?.full_name?.[0] || 'S'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{student.profiles?.full_name}</h1>
            <p className="text-xs text-gray-500">{student.headline || 'Student'}</p>
            <Badge variant="blue" className="mt-1">{student.primary_category?.name || 'Domain'}</Badge>
          </div>
        </div>

        {student.bio && (
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-1">About</h2>
            <p className="text-sm text-gray-600">{student.bio}</p>
          </div>
        )}

        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-2">Skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {student.student_skills?.map((ss: any) => (
              <Badge key={ss.id} variant="purple">{ss.skills?.name}</Badge>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
