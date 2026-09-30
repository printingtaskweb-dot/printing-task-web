import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button, Input, Textarea, Select, Card, MultiSelect } from '@/components/ui'
import { Check, ChevronRight, ChevronLeft, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Category, Skill } from '@/types'

const steps = [
  'Basic Info',
  'Category',
  'Skills',
  'Experience',
  'Education',
  'Availability',
  'Profile',
]

const expLevels = [
  { value: 'fresher', label: 'Fresher / Entry Level' },
  { value: 'less_than_1_year', label: 'Less than 1 year' },
  { value: '1_2_years', label: '1 - 2 years' },
  { value: '2_5_years', label: '2 - 5 years' },
  { value: '5_plus_years', label: '5+ years' },
]

const availabilityTypes = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'project_based', label: 'Project-based' },
]

export default function StudentOnboarding() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)

  // DB Data
  const [categories, setCategories] = useState<Category[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [loadingDb, setLoadingDb] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    phone: '',
    location: '',
    categoryId: '',
    selectedSkillIds: [] as string[],
    experienceLevel: 'fresher',
    institution: '',
    degree: '',
    fieldOfStudy: '',
    graduationYear: new Date().getFullYear().toString(),
    availabilityTypes: ['full_time', 'internship'] as string[],
    preferredWorkMode: 'remote',
    headline: '',
    bio: '',
    resumeUrl: '',
    portfolioUrl: '',
    githubUrl: '',
    linkedinUrl: '',
  })

  useEffect(() => {
    async function loadData() {
      try {
        const { data: catData } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
        const { data: skillData } = await supabase.from('skills').select('*').eq('is_active', true)
        setCategories(catData || [])
        setSkills(skillData || [])
      } catch (err) {
        console.error('Failed to load categories/skills:', err)
      } finally {
        setLoadingDb(false)
      }
    }
    loadData()
  }, [])

  const filteredSkills = skills.filter(s => !formData.categoryId || s.category_id === formData.categoryId)
  const skillOptions = filteredSkills.map(s => ({ value: s.id, label: s.name }))

  const handleNext = () => {
    if (currentStep === 0 && !formData.fullName) {
      toast.error('Full name is required')
      return
    }
    if (currentStep === 1 && !formData.categoryId) {
      toast.error('Please select a primary category')
      return
    }
    if (currentStep === 2 && formData.selectedSkillIds.length === 0) {
      toast.error('Please select at least one skill')
      return
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!user) return
    setSubmitting(true)

    try {
      // 1. Update Profile
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
          onboarding_completed: true,
        })
        .eq('id', user.id)

      if (profileErr) throw profileErr

      // 2. Create Student Profile
      const { data: spData, error: spErr } = await supabase
        .from('student_profiles')
        .upsert({
          user_id: user.id,
          headline: formData.headline || `${categories.find(c => c.id === formData.categoryId)?.name || 'Student'} Enthusiast`,
          bio: formData.bio,
          location: formData.location,
          experience_level: formData.experienceLevel as any,
          primary_category_id: formData.categoryId,
          resume_url: formData.resumeUrl,
          portfolio_url: formData.portfolioUrl,
          github_url: formData.githubUrl,
          linkedin_url: formData.linkedinUrl,
          profile_completion: 85,
        })
        .select()
        .single()

      if (spErr) throw spErr

      // 3. Add Skills
      if (formData.selectedSkillIds.length > 0 && spData) {
        await supabase.from('student_skills').delete().eq('student_id', spData.id)
        const studentSkills = formData.selectedSkillIds.map(skId => ({
          student_id: spData.id,
          skill_id: skId,
          proficiency: 'intermediate' as const,
        }))
        await supabase.from('student_skills').insert(studentSkills)
      }

      // 4. Add Education if entered
      if (formData.institution && spData) {
        await supabase.from('student_education').insert({
          student_id: spData.id,
          institution: formData.institution,
          degree: formData.degree,
          field_of_study: formData.fieldOfStudy,
          end_year: parseInt(formData.graduationYear) || undefined,
        })
      }

      // 5. Add Availability
      if (spData) {
        await supabase.from('student_availability').upsert({
          student_id: spData.id,
          types: formData.availabilityTypes,
          preferred_work_mode: formData.preferredWorkMode,
        })
      }

      await refreshUser()
      toast.success('Onboarding completed! Welcome to SkillBridge.')
      navigate('/dashboard')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to complete onboarding')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3 text-white">
            <GraduationCap size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Build Your Student Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Step {currentStep + 1} of {steps.length}: {steps[currentStep]}</p>
        </div>

        {/* Stepper Header */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {steps.map((label, idx) => (
            <div key={label} className="flex items-center flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                idx < currentStep
                  ? 'bg-emerald-500 text-white'
                  : idx === currentStep
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {idx < currentStep ? <Check size={14} /> : idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-8 sm:w-12 h-0.5 mx-1 ${idx < currentStep ? 'bg-emerald-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <Card padding="lg">
          {/* Step 1: Basic Info */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Step 1 — Basic Information</h2>
              <Input
                label="Full Name"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
              <Input
                label="Phone Number"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="Location (City, Country)"
                placeholder="Mumbai, India"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          )}

          {/* Step 2: Category */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Step 2 — Student Category</h2>
              <p className="text-sm text-gray-500">Select your primary domain of expertise.</p>
              
              {loadingDb ? (
                <div className="py-8 text-center text-sm text-gray-400">Loading categories...</div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, categoryId: cat.id, selectedSkillIds: [] })}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        formData.categoryId === cat.id
                          ? 'border-primary-600 bg-primary-50 text-primary-700 ring-2 ring-primary-500/20 font-medium'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-sm block font-semibold">{cat.name}</span>
                      {cat.description && <span className="text-xs text-gray-500 line-clamp-1 mt-0.5">{cat.description}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Skills */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Step 3 — Select Your Skills</h2>
              <p className="text-sm text-gray-500">Pick the key tools and skills you master.</p>
              
              <MultiSelect
                options={skillOptions}
                value={formData.selectedSkillIds}
                onChange={ids => setFormData({ ...formData, selectedSkillIds: ids })}
                placeholder="Choose skills..."
              />

              {formData.selectedSkillIds.length > 0 && (
                <p className="text-xs text-emerald-600 font-medium">
                  ✓ {formData.selectedSkillIds.length} skills selected
                </p>
              )}
            </div>
          )}

          {/* Step 4: Experience */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Step 4 — Experience Level</h2>
              <p className="text-sm text-gray-500">How long have you been working or building in this domain?</p>

              <Select
                label="Total Experience"
                options={expLevels}
                value={formData.experienceLevel}
                onChange={e => setFormData({ ...formData, experienceLevel: e.target.value })}
              />
            </div>
          )}

          {/* Step 5: Education */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Step 5 — Education Details</h2>
              <Input
                label="College / Institution"
                placeholder="e.g. IIT Bombay / Delhi University"
                value={formData.institution}
                onChange={e => setFormData({ ...formData, institution: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Degree"
                  placeholder="e.g. B.Tech / B.Sc / BCA"
                  value={formData.degree}
                  onChange={e => setFormData({ ...formData, degree: e.target.value })}
                />
                <Input
                  label="Field of Study"
                  placeholder="e.g. Computer Science"
                  value={formData.fieldOfStudy}
                  onChange={e => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                />
              </div>
              <Input
                label="Graduation Year"
                type="number"
                value={formData.graduationYear}
                onChange={e => setFormData({ ...formData, graduationYear: e.target.value })}
              />
            </div>
          )}

          {/* Step 6: Availability */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Step 6 — Preferred Work & Availability</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Types You are Open To</label>
                <div className="grid grid-cols-2 gap-2">
                  {availabilityTypes.map(t => {
                    const isChecked = formData.availabilityTypes.includes(t.value)
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => {
                          const updated = isChecked
                            ? formData.availabilityTypes.filter(x => x !== t.value)
                            : [...formData.availabilityTypes, t.value]
                          setFormData({ ...formData, availabilityTypes: updated })
                        }}
                        className={`p-2.5 rounded-lg border text-sm text-left transition-all ${
                          isChecked
                            ? 'border-primary-600 bg-primary-50 text-primary-700 font-medium'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {t.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <Select
                label="Preferred Work Mode"
                options={[
                  { value: 'remote', label: 'Remote' },
                  { value: 'on_site', label: 'On-site' },
                  { value: 'hybrid', label: 'Hybrid' },
                ]}
                value={formData.preferredWorkMode}
                onChange={e => setFormData({ ...formData, preferredWorkMode: e.target.value })}
              />
            </div>
          )}

          {/* Step 7: Profile links & Bio */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Step 7 — Portfolio & Social Links</h2>
              
              <Input
                label="Headline"
                placeholder="e.g. Full Stack Developer | React & Node.js Enthusiast"
                value={formData.headline}
                onChange={e => setFormData({ ...formData, headline: e.target.value })}
              />

              <Textarea
                label="Short Bio"
                placeholder="Tell businesses about yourself, your passion, and what projects you have built..."
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="GitHub Profile URL"
                  placeholder="https://github.com/username"
                  value={formData.githubUrl}
                  onChange={e => setFormData({ ...formData, githubUrl: e.target.value })}
                />
                <Input
                  label="LinkedIn Profile URL"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.linkedinUrl}
                  onChange={e => setFormData({ ...formData, linkedinUrl: e.target.value })}
                />
              </div>

              <Input
                label="Portfolio Website URL"
                placeholder="https://yourportfolio.com"
                value={formData.portfolioUrl}
                onChange={e => setFormData({ ...formData, portfolioUrl: e.target.value })}
              />

              <Input
                label="Resume URL (PDF)"
                placeholder="https://drive.google.com/..."
                value={formData.resumeUrl}
                onChange={e => setFormData({ ...formData, resumeUrl: e.target.value })}
              />
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between mt-8 border-t border-gray-100 pt-5">
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              disabled={currentStep === 0}
              leftIcon={<ChevronLeft size={16} />}
            >
              Back
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button type="button" onClick={handleNext} rightIcon={<ChevronRight size={16} />}>
                Next Step
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} isLoading={submitting}>
                Complete Profile
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
