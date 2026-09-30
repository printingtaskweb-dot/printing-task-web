import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, Card } from '@/components/ui'
import { Mail, Lock, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, setDemoUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)

    if (error) {
      toast.error(error.message || 'Invalid email or password')
    } else {
      toast.success('Welcome back!')
      navigate('/dashboard')
    }
  }

  const handleDemoLogin = (role: 'student' | 'business_owner' | 'admin') => {
    setDemoUser(role)
    toast.success(`Signed in as Demo ${role.replace('_', ' ')}!`)
    if (role === 'admin') navigate('/admin')
    else navigate('/dashboard')
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex w-12 h-12 bg-primary-600 rounded-xl items-center justify-center mb-4 text-white">
            <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
              <path d="M2 7h4l2 5 2-8 2 3h4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sign in to SkillBridge</h1>
          <p className="text-sm text-gray-500 mt-1">Access your account and opportunities</p>
        </div>

        {/* Quick Demo Sign-in Box for testing */}
        <Card padding="md" className="bg-primary-50/60 border-primary-200 text-center">
          <p className="text-xs font-semibold text-primary-700 uppercase tracking-wider mb-2.5 flex items-center justify-center gap-1">
            <Sparkles size={13} /> Quick Test Sign-in
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => handleDemoLogin('student')}>
              Student
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => handleDemoLogin('business_owner')}>
              Business
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => handleDemoLogin('admin')}>
              Admin
            </Button>
          </div>
        </Card>

        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
              required
            />

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-xs font-medium text-primary-600 hover:text-primary-700">
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                leftIcon={<Lock size={16} />}
                required
              />
            </div>

            <Button type="submit" fullWidth isLoading={loading} size="lg">
              Sign In with Supabase
            </Button>
          </form>

          <div className="mt-6 text-center border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
                Create one now
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
