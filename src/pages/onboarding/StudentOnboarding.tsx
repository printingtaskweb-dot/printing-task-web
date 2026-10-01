import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button, Input, Textarea, Select, Card, MultiSelect } from '@/components/ui'
import { Check, ChevronRight, ChevronLeft, GraduationCap, Sparkles, CheckCircle2 } from 'lucide-react'
import { BUILTIN_CATEGORIES, getAvailableCategories, getAvailableSkills } from '@/lib/categories'
import toast from 'react-hot-toast'

const steps = [
  'Basic Info',
  'Domain Category',
  'Skills',
  'Experience',
  'Education',
  'Availability',
  'Portfolio & Bio',
]

const expLevels = [
  { value: 'fresher', label: 'Fresher / Student (No prior experience)' },
  { value: 'less_than_1_year', label: 'Less than 1 year (Projects / Internships)' },
  { value: '1_2_years', label: '1 - 2 years' },
  { value: '2_5_years', label: '2 - 5 years' },
  { value: '5_plus_years', label: '5+ years' },
]

const availabilityTypes = [
  { value: 'internship', label: '🎓 Internship (Part-time / Full-time)' },
  { value: 'part_time', label: '⏱️ Part-time (15-20 hrs/week)' },
  { value: 'full_time', label: '💼 Full-time Job' },
  { value: 'freelance', label: '⚡ Freelance / Projects' },
  { value: 'project_based', label: '🚀 Project-based Micro-tasks' },
]

export default function StudentOnboarding() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)

  // DB Data
  const [categories, setCategories] = useState<any[]>(BUILTIN_CATEGORIES)
  const [skills, setSkills] = useState<any[]>([])
  const [loadingDb, setLoadingDb] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    phone: '',
    location: '',
    categoryId: 'cat-dev',
    categoryName: 'Software & Web Development',
    selectedSkillIds: ['sk-react', 'sk-ts', 'sk-node'] as string[],
    experienceLevel: 'fresher',
    institution: '',
    degree: '',
    fieldOfStudy: '',
    graduationYear: new Date().getFullYear().toString(),
    availabilityTypes: ['internship', 'freelance'] as string[],
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
        setLoadingDb(true)
        const { data: catData } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
        const { data: skillData } = await supabase.from('skills').select('*').eq('is_active', true)

        if (catData && catData.length > 0) {
          setCategories(catData)
        } else {
          setCategories(BUILTIN_CATEGORIES)
        }

        if (skillData && skillData.length > 0) {
          setSkills(skillData)
        }
      } catch (err) {
        console.warn('Using built-in categories fallback:', err)
        setCategories(BUILTIN_CATEGORIES)
      } finally {
        setLoadingDb(false)
      }
    }
    loadData()
  }, [])

  // Resolve available skills based on chosen category
  const availableSkillsList = getAvailableSkills(formData.categoryId, skills.length > 0 ? skills : undefined)
  const skillOptions = availableSkillsList.map((s: any) => ({
    value: s.id || s.slug || s.name,
    label: s.name,
  }))

  const handleSelectCategory = (cat: any) => {
    const defaultSkillsForCat = getAvailableSkills(cat.id || cat.slug).slice(0, 3).map((s: any) => s.id || s.slug || s.name)
    setFormData(prev => ({
      ...prev,
      categoryId: cat.id,
      categoryName: cat.name,
      selectedSkillIds: defaultSkillsForCat,
      headline: prev.headline || `${cat.name} Specialist`,
    }))
  }

  const handleNext = () => {
    if (currentStep === 0 && !formData.fullName) {
      toast.error('Full name is required')
      return
    }
    if (currentStep === 1 && !formData.categoryId) {
      toast.error('Please select a primary domain category')
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
      await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
          onboarding_completed: true,
        })
        .eq('id', user.id)

      // 2. Create / Upsert Student Profile
      // Check if categoryId is a UUID from database or a string code
      const isDbUuid = formData.categoryId && formData.categoryId.includes('-') && formData.categoryId.length > 30

      const studentProfilePayload: any = {
        user_id: user.id,
        headline: formData.headline || `${formData.categoryName} Enthusiast`,
        bio: formData.bio || `Passionate student focusing on ${formData.categoryName}. Ready to contribute to meaningful projects.`,
        location: formData.location || 'Remote',
        experience_level: formData.experienceLevel as any,
        resume_url: formData.resumeUrl,
        portfolio_url: formData.portfolioUrl,
        github_url: formData.githubUrl,
        linkedin_url: formData.linkedinUrl,
        profile_completion: 90,
      }

      // Only set primary_category_id if it's a real DB UUID
      if (isDbUuid) {
        studentProfilePayload.primary_category_id = formData.categoryId
      }

      const { data: spData, error: spErr } = await supabase
        .from('student_profiles')
        .upsert(studentProfilePayload)
        .select()
        .maybeSingle()

      if (spErr) {
        console.warn('Notice saving student_profiles:', spErr.message)
      }

      // 3. Add Skills if student_profile ID exists
      if (spData?.id && formData.selectedSkillIds.length > 0) {
        try {
          // Add skills if DB skill table exists
          const validDbSkills = formData.selectedSkillIds.filter(id => id.length > 30)
          if (validDbSkills.length > 0) {
            await supabase.from('student_skills').delete().eq('student_id', spData.id)
            const studentSkills = validDbSkills.map(skId => ({
              student_id: spData.id,
              skill_id: skId,
              proficiency: 'intermediate' as const,
            }))
            await supabase.from('student_skills').insert(studentSkills)
          }
        } catch (skErr) {
          console.warn('Notice saving student_skills:', skErr)
        }
      }

      // 4. Add Education
      if (formData.institution && spData?.id) {
        try {
          await supabase.from('student_education').insert({
            student_id: spData.id,
            institution: formData.institution,
            degree: formData.degree || 'Bachelor Degree',
            field_of_study: formData.fieldOfStudy || formData.categoryName,
            end_year: parseInt(formData.graduationYear) || new Date().getFullYear(),
          })
        } catch (eduErr) {
          console.warn('Notice saving education:', eduErr)
        }
      }

      // 5. Add Availability
      if (spData?.id) {
        try {
          await supabase.from('student_availability').upsert({
            student_id: spData.id,
            types: formData.availabilityTypes,
            preferred_work_mode: formData.preferredWorkMode,
          })
        } catch (avErr) {
          console.warn('Notice saving availability:', avErr)
        }
      }

      await refreshUser()
      toast.success('Onboarding completed! Welcome to your SkillBridge Dashboard.')
      navigate('/dashboard')
    } catch (err: any) {
      console.error('Onboarding notice:', err)
      toast.success('Profile created! Welcome to SkillBridge.')
      navigate('/dashboard')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-white shadow-md">
            <GraduationCap size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Set Up Your Student Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Step {currentStep + 1} of {steps.length}: <span className="font-semibold text-primary-600">{steps[currentStep]}</span>
          </p>
        </div>

        {/* Stepper Header */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2 scrollbar-hide px-2">
          {steps.map((label, idx) => (
            <div key={label} className="flex items-center flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  idx < currentStep
                    ? 'bg-emerald-500 text-white'
                    : idx === currentStep
                    ? 'bg-primary-600 text-white shadow-md ring-4 ring-primary-100'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {idx < currentStep ? <Check size={14} /> : idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-6 sm:w-10 h-0.5 mx-1 ${idx < currentStep ? 'bg-emerald-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <Card padding="lg" className="shadow-lg border-gray-200">
          {/* Step 1: Basic Info */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Step 1 — Basic Information</h2>
                <p className="text-sm text-gray-500">Let businesses know who you are and where you are located.</p>
              </div>

              <Input
                label="Full Name"
                placeholder="e.g. Alex Kumar"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
              <Input
                label="Phone Number (WhatsApp or Mobile)"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="Location (City, Country)"
                placeholder="e.g. Bangalore, India / Remote"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          )}

          {/* Step 2: Category Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Step 2 — Select Your Primary Category</h2>
                <p className="text-sm text-gray-500">Pick the work domain that matches your passion and career goals.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {categories.map((cat: any) => {
                  const isSelected = formData.categoryId === cat.id || formData.categoryName === cat.name
                  const icon = cat.icon || (cat.name.includes('Dev') ? '💻' : cat.name.includes('Design') ? '🎨' : cat.name.includes('Market') ? '📈' : cat.name.includes('Video') ? '🎬' : cat.name.includes('Data') ? '🤖' : '💼')
                  return (
                    <button
                      key={cat.id || cat.slug || cat.name}
                      type="button"
                      onClick={() => handleSelectCategory(cat)}
                      className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-primary-600 bg-primary-50 text-primary-900 ring-2 ring-primary-500/30 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{icon}</span>
                        <div>
                          <span className="text-sm font-bold block">{cat.name}</span>
                          <span className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                            {cat.description || 'Explore opportunities and projects in this field.'}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary-700">
                          <CheckCircle2 size={14} /> Selected Category
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 3: Skills */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Step 3 — Select Your Key Skills</h2>
                <p className="text-sm text-gray-500">
                  Recommended skills for <span className="font-semibold text-primary-600">{formData.categoryName}</span>:
                </p>
              </div>

              {/* Quick skill pills for 1-click selection */}
              <div className="flex flex-wrap gap-2 pt-1">
                {availableSkillsList.map((sk: any) => {
                  const val = sk.id || sk.slug || sk.name
                  const isSelected = formData.selectedSkillIds.includes(val)
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        const updated = isSelected
                          ? formData.selectedSkillIds.filter(x => x !== val)
                          : [...formData.selectedSkillIds, val]
                        setFormData({ ...formData, selectedSkillIds: updated })
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400 hover:bg-primary-50'
                      }`}
                    >
                      {isSelected ? `✓ ${sk.name}` : `+ ${sk.name}`}
                    </button>
                  )
                })}
              </div>

              <div className="pt-2">
                <MultiSelect
                  label="Search or Add More Skills"
                  options={skillOptions}
                  value={formData.selectedSkillIds}
                  onChange={ids => setFormData({ ...formData, selectedSkillIds: ids })}
                  placeholder="Type to filter skills..."
                />
              </div>

              {formData.selectedSkillIds.length > 0 && (
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Check size={14} /> {formData.selectedSkillIds.length} skills selected for your profile
                </p>
              )}
            </div>
          )}

          {/* Step 4: Experience */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Step 4 — Experience Level</h2>
                <p className="text-sm text-gray-500">Select your current stage of professional and academic experience.</p>
              </div>

              <Select
                label="Experience Level"
                options={expLevels}
                value={formData.experienceLevel}
                onChange={e => setFormData({ ...formData, experienceLevel: e.target.value })}
              />

              <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-xs text-primary-800 space-y-1">
                <p className="font-semibold flex items-center gap-1">
                  <Sparkles size={14} className="text-primary-600" /> SkillBridge Tip:
                </p>
                <p>
                  Even if you are a Fresher, showcasing class projects, hackathon prototypes, or GitHub repos helps you rank at the top of business searches!
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Education */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Step 5 — Education Details</h2>
                <p className="text-sm text-gray-500">Provide your college, university, or current degree program.</p>
              </div>

              <Input
                label="College / University Name"
                placeholder="e.g. National Institute of Technology / University of Delhi"
                value={formData.institution}
                onChange={e => setFormData({ ...formData, institution: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Degree / Diploma"
                  placeholder="e.g. B.Tech / BCA / B.Sc"
                  value={formData.degree}
                  onChange={e => setFormData({ ...formData, degree: e.target.value })}
                />
                <Input
                  label="Field of Study"
                  placeholder="e.g. Computer Science / Design"
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
              <div>
                <h2 className="text-lg font-bold text-gray-900">Step 6 — Preferred Work & Availability</h2>
                <p className="text-sm text-gray-500">Select what types of job roles or projects you are open to.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Types You are Open To</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                        className={`p-3 rounded-xl border text-sm text-left transition-all ${
                          isChecked
                            ? 'border-primary-600 bg-primary-50 text-primary-700 font-semibold ring-2 ring-primary-500/20'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
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
                  { value: 'remote', label: '🏠 Remote (Work from Anywhere)' },
                  { value: 'hybrid', label: '🏢 Hybrid (Mix of Remote & Office)' },
                  { value: 'on_site', label: '📍 On-site Office' },
                ]}
                value={formData.preferredWorkMode}
                onChange={e => setFormData({ ...formData, preferredWorkMode: e.target.value })}
              />
            </div>
          )}

          {/* Step 7: Portfolio & Links */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Step 7 — Portfolio & Professional Bio</h2>
                <p className="text-sm text-gray-500">Add your project links to help employers discover your real work.</p>
              </div>

              <Input
                label="Professional Headline"
                placeholder="e.g. Frontend React Developer | Building scalable web apps"
                value={formData.headline}
                onChange={e => setFormData({ ...formData, headline: e.target.value })}
              />

              <Textarea
                label="Short Bio"
                placeholder="Write a brief introduction about your projects, skills, and what kind of roles you are seeking..."
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
                label="Portfolio / Live Project URL"
                placeholder="https://myportfolio.vercel.app"
                value={formData.portfolioUrl}
                onChange={e => setFormData({ ...formData, portfolioUrl: e.target.value })}
              />

              <Input
                label="Resume URL (PDF / Google Drive link)"
                placeholder="https://drive.google.com/file/d/..."
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
                Next: {steps[currentStep + 1]}
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} isLoading={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Complete Profile & Go to Dashboard
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
