import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, Card } from '@/components/ui'
import { Mail, Lock, User, GraduationCap, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const [role, setRole] = useState<'student' | 'business_owner'>('student')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email || !password) {
      toast.error('Please fill in all required fields')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    const { error } = await signUp(email, password, fullName, role)
    setLoading(false)

    if (error) {
      toast.error(error.message || 'Failed to create account')
    } else {
      toast.success('Account created! Let\'s complete your profile.')
      navigate(role === 'student' ? '/onboarding/student' : '/onboarding/business')
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 bg-primary-600 rounded-xl items-center justify-center mb-4 text-white">
            <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
              <path d="M2 7h4l2 5 2-8 2 3h4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Join SkillBridge</h1>
          <p className="text-sm text-gray-500 mt-1">Connect with opportunities or find talent</p>
        </div>

        <Card padding="lg">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={cn(
                'flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all',
                role === 'student'
                  ? 'border-primary-600 bg-primary-50/50 text-primary-700 ring-2 ring-primary-500/20'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <GraduationCap size={22} className={role === 'student' ? 'text-primary-600' : 'text-gray-400'} />
              <span className="text-xs font-semibold mt-1.5">Student / Job Seeker</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('business_owner')}
              className={cn(
                'flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all',
                role === 'business_owner'
                  ? 'border-primary-600 bg-primary-50/50 text-primary-700 ring-2 ring-primary-500/20'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <Building2 size={22} className={role === 'business_owner' ? 'text-primary-600' : 'text-gray-400'} />
              <span className="text-xs font-semibold mt-1.5">Business / Employer</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={role === 'student' ? 'Full Name' : 'Contact Person / Owner Name'}
              placeholder="John Doe"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              leftIcon={<User size={16} />}
              required
            />

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              required
            />

            <Button type="submit" fullWidth isLoading={loading} size="lg">
              Create {role === 'student' ? 'Student' : 'Business'} Account
            </Button>
          </form>

          <div className="mt-6 text-center border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
