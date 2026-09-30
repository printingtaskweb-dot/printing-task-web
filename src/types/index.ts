import type {
  Job,
  BusinessProfile,
  Profile,
  Skill,
  StudentProfile,
  Application,
  Hackathon,
  Blog,
  BlogCategory,
  Category,
  StudentEducation,
  StudentAvailability,
} from './database'

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

export interface JobWithDetails extends Job {
  business_profiles?: BusinessProfile & { profiles?: Profile }
  job_skills?: Array<{ skill_id: string; is_required: boolean; skills?: Skill }>
  match_score?: MatchScore
  is_saved?: boolean
  has_applied?: boolean
}

export interface StudentWithDetails extends StudentProfile {
  profiles?: Profile
  student_skills?: Array<{
    skill_id: string
    proficiency?: string
    skills?: Skill & { categories?: Category }
  }>
  student_education?: StudentEducation[]
  student_availability?: StudentAvailability
  primary_category?: Category
  match_score?: MatchScore
}

export interface ApplicationWithDetails extends Application {
  jobs?: JobWithDetails
  student_profiles?: StudentWithDetails
  business_profiles?: BusinessProfile
}

export interface HackathonWithDetails extends Hackathon {
  registration_count?: number
  is_registered?: boolean
}

export interface BlogWithDetails extends Blog {
  profiles?: Profile
  blog_categories?: BlogCategory
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
