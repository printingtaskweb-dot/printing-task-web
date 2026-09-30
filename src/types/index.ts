export * from './database'

export interface AuthUser {
  id: string
  email: string
  role: 'student' | 'business_owner' | 'admin'
  full_name: string
  avatar_url?: string | null
  onboarding_completed: boolean
}

export interface MatchScore {
  total: number
  skill_match: number
  category_match: number
  experience_match: number
  location_match: number
  breakdown: {
    matched_skills: string[]
    matched_categories: string[]
  }
}

export interface JobWithDetails extends import('./database').Job {
  business_profiles?: import('./database').BusinessProfile & { profiles?: import('./database').Profile }
  job_skills?: Array<{ skill_id: string; is_required: boolean; skills?: import('./database').Skill }>
  match_score?: MatchScore
  is_saved?: boolean
  has_applied?: boolean
}

export interface StudentWithDetails extends import('./database').StudentProfile {
  profiles?: import('./database').Profile
  student_skills?: Array<{ skill_id: string; proficiency?: string; skills?: import('./database').Skill & { categories?: import('./database').Category } }>
  student_education?: import('./database').StudentEducation[]
  student_availability?: import('./database').StudentAvailability
  primary_category?: import('./database').Category
  match_score?: MatchScore
}

export interface ApplicationWithDetails extends import('./database').Application {
  jobs?: JobWithDetails
  student_profiles?: StudentWithDetails
  business_profiles?: import('./database').BusinessProfile
}

export interface HackathonWithDetails extends import('./database').Hackathon {
  registration_count?: number
  is_registered?: boolean
}

export interface BlogWithDetails extends import('./database').Blog {
  profiles?: import('./database').Profile
  blog_categories?: import('./database').BlogCategory
  tags?: Array<{ name: string; slug: string }>
}

export type SortOrder = 'asc' | 'desc'

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface FilterState {
  search?: string
  category?: string
  skills?: string[]
  experience?: string
  jobType?: string
  workMode?: string
  location?: string
  availability?: string
  sort?: string
  page?: number
}
