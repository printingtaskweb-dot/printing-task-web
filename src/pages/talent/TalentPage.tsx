import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, SearchBar, Badge, LoadingSpinner, EmptyState } from '@/components/ui'
import { GraduationCap, MapPin, Briefcase } from 'lucide-react'

export default function TalentPage() {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadTalent() {
      setLoading(true)
      try {
        let query = supabase
          .from('student_profiles')
          .select('*, profiles!inner(full_name, email, avatar_url, status), primary_category:categories(name), student_skills(*, skills(name))')
          .eq('profiles.status', 'active')

        if (search) {
          query = query.ilike('profiles.full_name', `%${search}%`)
        }

        const { data } = await query
        setStudents(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadTalent()
  }, [search])

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Discover Student Talent</h1>
        <p className="text-sm text-gray-500">Find skilled students and candidates for your business</p>
      </div>

      <Card padding="md">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search students by name or skill..."
        />
      </Card>

      {loading ? (
        <LoadingSpinner size="lg" text="Searching student profiles..." />
      ) : students.length === 0 ? (
        <EmptyState title="No students found" description="Try broadening your search query." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {students.map(sp => (
            <Card key={sp.id} hover className="flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary-100 text-primary-700 font-bold rounded-full flex items-center justify-center">
                    {sp.profiles?.full_name?.[0] || 'S'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{sp.profiles?.full_name}</h3>
                    <p className="text-xs text-gray-500">{sp.primary_category?.name || 'Student'}</p>
                  </div>
                </div>

                {sp.headline && <p className="text-xs text-gray-600 line-clamp-2 mb-3">{sp.headline}</p>}

                <div className="flex flex-wrap gap-1 mb-3">
                  {sp.student_skills?.slice(0, 4).map((ss: any) => (
                    <Badge key={ss.id} variant="gray">{ss.skills?.name || 'Skill'}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                <span className="text-gray-400 flex items-center gap-1"><MapPin size={12} /> {sp.location || 'India'}</span>
                <Link to={`/talent/${sp.id}`} className="font-semibold text-primary-600 hover:text-primary-700">
                  View Profile →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
