import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, Select, Card } from '@/components/ui'
import { Mail, Lock, User, GraduationCap, Building2, Briefcase, Sparkles, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const studentCategories = [
  { value: 'Development', label: '💻 Software & Web Development' },
  { value: 'Design', label: '🎨 UI/UX & Graphic Design' },
  { value: 'Marketing', label: '📈 Digital Marketing & Social Media' },
  { value: 'Media', label: '🎬 Video Editing & Content Creation' },
  { value: 'Data & AI', label: '🤖 Data Science & AI/ML' },
  { value: 'Operations', label: '⌨️ Computer Operations & Office' },
  { value: 'Business', label: '💼 Sales, Finance & Business' },
  { value: 'Support', label: '🎧 Customer Support & Communications' },
  { value: 'Other', label: '✨ Other / Multiple Skills' },
]

const businessIndustries = [
  { value: 'Technology & Software', label: '💻 Technology & Software' },
  { value: 'Digital Marketing & Agency', label: '🚀 Digital Marketing & Creative Agency' },
  { value: 'E-commerce & Retail', label: '🛍️ E-commerce & Retail' },
  { value: 'Media, Film & Entertainment', label: '🎬 Media, Film & Entertainment' },
  { value: 'Education & EdTech', label: '🎓 Education & Training' },
  { value: 'Finance & Banking', label: '💳 Finance & FinTech' },
  { value: 'Healthcare & Wellness', label: '🏥 Healthcare & Wellness' },
  { value: 'Local Business & Services', label: '🏢 Local Business & Services' },
  { value: 'Other', label: '✨ Other Industry' },
]

export default function RegisterPage() {
  const [role, setRole] = useState<'student' | 'business_owner'>('student')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Work & Category specific fields
  const [category, setCategory] = useState('Development')
  const [headline, setHeadline] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [lookingFor, setLookingFor] = useState('')

  const [loading, setLoading] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

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

    if (role === 'business_owner' && !businessName) {
      toast.error('Please enter your business or company name')
      return
    }

    setLoading(true)
    const result = await signUp(email, password, fullName, role, {
      category,
      headline,
      businessName,
      lookingFor,
    })
    setLoading(false)

    if (result.error) {
      // Provide clear feedback if Supabase threw a trigger error or network error
      const msg = result.error.message || 'Failed to create account'
      if (msg.toLowerCase().includes('database error')) {
        toast.error('Database connection notice. Please run the setup schema in Supabase SQL editor.', { duration: 6000 })
      } else {
        toast.error(msg)
      }
      return
    }

    if (result.emailConfirmationRequired) {
      setRegisteredEmail(email)
      setNeedsConfirmation(true)
      toast.success('Registration successful! Please verify your email.')
    } else {
      toast.success('Account created! Welcome to SkillBridge.')
      navigate(role === 'student' ? '/onboarding/student' : '/onboarding/business')
    }
  }

  // Confirmation banner if Supabase email confirmation is enabled
  if (needsConfirmation) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card padding="lg" className="text-center space-y-5">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">Check Your Email</h2>
              <p className="text-sm text-gray-600 mt-2">
                We sent a confirmation link to <span className="font-semibold text-gray-900">{registeredEmail}</span>.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Click the link in the email to activate your account and get started. (Be sure to check your spam/junk folder).
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-left">
              <p className="text-xs font-semibold text-amber-800">Admin Tip:</p>
              <p className="text-xs text-amber-700 mt-0.5">
                If emails are not arriving (Supabase free tier rate limits to 3 emails/hour), go to your <strong>Supabase Dashboard &gt; Authentication &gt; Providers &gt; Email</strong> and turn OFF <strong>&quot;Confirm email&quot;</strong> to allow immediate instant sign-ins.
              </p>
            </div>

            <div className="pt-2">
              <Link to="/login" className="btn btn-primary w-full">
                Go to Sign In
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 bg-primary-600 rounded-xl items-center justify-center mb-4 text-white shadow-xs">
            <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
              <path d="M2 7h4l2 5 2-8 2 3h4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Join SkillBridge</h1>
          <p className="text-sm text-gray-500 mt-1">Connect your skills with real opportunities</p>
        </div>

        <Card padding="lg">
          {/* Role selector */}
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            1. Select Account Type
          </label>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => {
                setRole('student')
                setCategory('Development')
              }}
              className={cn(
                'flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all',
                role === 'student'
                  ? 'border-primary-600 bg-primary-50/60 text-primary-700 ring-2 ring-primary-500/20 font-medium'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <GraduationCap size={22} className={role === 'student' ? 'text-primary-600' : 'text-gray-400'} />
              <span className="text-xs font-semibold mt-1.5">Student / Talent</span>
              <span className="text-[11px] text-gray-400 mt-0.5">Find jobs & internships</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('business_owner')
                setCategory('Technology & Software')
              }}
              className={cn(
                'flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all',
                role === 'business_owner'
                  ? 'border-primary-600 bg-primary-50/60 text-primary-700 ring-2 ring-primary-500/20 font-medium'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <Building2 size={22} className={role === 'business_owner' ? 'text-primary-600' : 'text-gray-400'} />
              <span className="text-xs font-semibold mt-1.5">Business / Employer</span>
              <span className="text-[11px] text-gray-400 mt-0.5">Hire students & talent</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Credentials */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                2. Basic Credentials
              </label>
              <div className="space-y-3">
                <Input
                  label={role === 'student' ? 'Full Name' : 'Contact Person / Owner Name'}
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  leftIcon={<User size={16} />}
                  required
                />

                <Input
                  label="Email Address"
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
              </div>
            </div>

            {/* Work & Category Details */}
            <div className="pt-2 border-t border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles size={13} className="text-primary-600" />
                3. Work & Specialization Category
              </label>

              {role === 'student' ? (
                <div className="space-y-3 bg-gray-50/60 p-3.5 rounded-xl border border-gray-100">
                  <Select
                    label="What work category are you working in?"
                    options={studentCategories}
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                  />

                  <Input
                    label="Your Primary Skill / Headline"
                    placeholder="e.g. Frontend Developer, Video Editor, UI Designer"
                    value={headline}
                    onChange={e => setHeadline(e.target.value)}
                    leftIcon={<Briefcase size={16} />}
                    hint="Helps businesses find you for relevant opportunities"
                  />
                </div>
              ) : (
                <div className="space-y-3 bg-gray-50/60 p-3.5 rounded-xl border border-gray-100">
                  <Input
                    label="Company / Business Name"
                    placeholder="e.g. Acme Media Solutions"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    leftIcon={<Building2 size={16} />}
                    required
                  />

                  <Select
                    label="Industry / Domain"
                    options={businessIndustries}
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                  />

                  <Input
                    label="What kind of talent/work are you looking for?"
                    placeholder="e.g. React Developers, Video Editors, Content Writers"
                    value={lookingFor}
                    onChange={e => setLookingFor(e.target.value)}
                    leftIcon={<Briefcase size={16} />}
                    hint="We will recommend top matched student profiles"
                  />
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button type="submit" fullWidth isLoading={loading} size="lg">
                Create {role === 'student' ? 'Student' : 'Business'} Account
              </Button>
            </div>
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
