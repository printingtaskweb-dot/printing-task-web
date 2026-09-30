export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          role: 'student' | 'business_owner' | 'admin'
          avatar_url: string | null
          status: 'active' | 'suspended' | 'pending' | 'deleted'
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      student_profiles: {
        Row: {
          id: string
          user_id: string
          headline: string | null
          bio: string | null
          location: string | null
          experience_level: 'fresher' | 'less_than_1_year' | '1_2_years' | '2_5_years' | '5_plus_years'
          primary_category_id: string | null
          resume_url: string | null
          portfolio_url: string | null
          github_url: string | null
          linkedin_url: string | null
          other_links: Json
          profile_completion: number
          is_available: boolean
          is_open_to_work: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['student_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['student_profiles']['Insert']>
      }
      business_profiles: {
        Row: {
          id: string
          user_id: string
          business_name: string
          owner_name: string
          slug: string | null
          industry: string | null
          category: string | null
          description: string | null
          short_description: string | null
          location: string | null
          website_url: string | null
          logo_url: string | null
          cover_image_url: string | null
          company_size: string | null
          founded_year: number | null
          social_links: Json
          contact_email: string | null
          contact_phone: string | null
          verification_status: 'unverified' | 'pending' | 'verified' | 'rejected'
          is_featured: boolean
          looking_for: string[]
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['business_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['business_profiles']['Insert']>
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          color: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      subcategories: {
        Row: {
          id: string
          category_id: string
          name: string
          slug: string
          description: string | null
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['subcategories']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['subcategories']['Insert']>
      }
      skills: {
        Row: {
          id: string
          subcategory_id: string | null
          category_id: string
          name: string
          slug: string
          description: string | null
          is_active: boolean
          usage_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['skills']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['skills']['Insert']>
      }
      student_skills: {
        Row: {
          id: string
          student_id: string
          skill_id: string
          proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null
          years_of_experience: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['student_skills']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['student_skills']['Insert']>
      }
      jobs: {
        Row: {
          id: string
          business_id: string
          title: string
          slug: string | null
          description: string
          responsibilities: string | null
          requirements: string | null
          benefits: string | null
          job_type: 'full_time' | 'part_time' | 'internship' | 'freelance' | 'project' | 'temporary'
          work_mode: 'remote' | 'on_site' | 'hybrid'
          experience_level: 'fresher' | 'less_than_1_year' | '1_2_years' | '2_5_years' | '5_plus_years' | null
          location: string | null
          salary_min: number | null
          salary_max: number | null
          salary_currency: string
          is_salary_visible: boolean
          duration: string | null
          openings: number
          application_deadline: string | null
          status: 'draft' | 'active' | 'paused' | 'closed' | 'expired'
          is_featured: boolean
          views_count: number
          applications_count: number
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['jobs']['Row'], 'id' | 'slug' | 'created_at' | 'updated_at' | 'views_count' | 'applications_count'>
        Update: Partial<Database['public']['Tables']['jobs']['Insert']>
      }
      applications: {
        Row: {
          id: string
          job_id: string
          student_id: string
          business_id: string
          cover_letter: string | null
          resume_url: string | null
          status: 'applied' | 'under_review' | 'shortlisted' | 'interview' | 'selected' | 'rejected' | 'withdrawn'
          match_score: number
          notes: string | null
          reviewed_at: string | null
          shortlisted_at: string | null
          rejected_at: string | null
          withdrawn_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['applications']['Row'], 'id' | 'created_at' | 'updated_at' | 'match_score'>
        Update: Partial<Database['public']['Tables']['applications']['Insert']>
      }
      saved_jobs: {
        Row: {
          id: string
          student_id: string
          job_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['saved_jobs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['saved_jobs']['Insert']>
      }
      hiring_records: {
        Row: {
          id: string
          application_id: string
          student_id: string
          business_id: string
          job_id: string
          hired_at: string
          start_date: string | null
          end_date: string | null
          salary: number | null
          salary_currency: string
          notes: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['hiring_records']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['hiring_records']['Insert']>
      }
      hackathons: {
        Row: {
          id: string
          title: string
          slug: string
          description: string
          short_description: string | null
          theme: string | null
          cover_image_url: string | null
          banner_image_url: string | null
          status: 'draft' | 'upcoming' | 'registration_open' | 'ongoing' | 'completed' | 'cancelled'
          registration_deadline: string | null
          start_date: string
          end_date: string
          min_team_size: number
          max_team_size: number
          max_participants: number | null
          eligibility: string | null
          rules: string | null
          prizes: Json
          sponsors: Json
          judges: Json
          resources: Json
          faqs: Json
          categories: string[]
          tags: string[]
          is_featured: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['hackathons']['Row'], 'id' | 'slug' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['hackathons']['Insert']>
      }
      blogs: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          excerpt: string | null
          featured_image_url: string | null
          author_id: string
          category_id: string | null
          status: 'draft' | 'published' | 'archived'
          meta_title: string | null
          meta_description: string | null
          canonical_url: string | null
          og_image_url: string | null
          read_time_minutes: number | null
          views_count: number
          published_at: string | null
          scheduled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['blogs']['Row'], 'id' | 'created_at' | 'updated_at' | 'views_count'>
        Update: Partial<Database['public']['Tables']['blogs']['Insert']>
      }
      blog_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['blog_categories']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['blog_categories']['Insert']>
      }
      website_updates: {
        Row: {
          id: string
          title: string
          description: string | null
          type: 'feature' | 'bug' | 'improvement' | 'release' | 'deployment' | 'task' | 'note'
          status: 'planned' | 'in_progress' | 'testing' | 'completed' | 'blocked'
          priority: number
          assigned_to: string | null
          tags: string[]
          target_date: string | null
          completed_date: string | null
          notes: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['website_updates']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['website_updates']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: Json
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      hackathon_registrations: {
        Row: {
          id: string
          hackathon_id: string
          student_id: string
          team_id: string | null
          registration_data: Json
          is_confirmed: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['hackathon_registrations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['hackathon_registrations']['Insert']>
      }
      student_education: {
        Row: {
          id: string
          student_id: string
          institution: string
          degree: string | null
          field_of_study: string | null
          start_year: number | null
          end_year: number | null
          is_current: boolean
          grade: string | null
          description: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['student_education']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['student_education']['Insert']>
      }
      student_availability: {
        Row: {
          id: string
          student_id: string
          types: string[]
          hours_per_week: number | null
          available_from: string | null
          preferred_work_mode: string | null
          preferred_location: string | null
          expected_salary_min: number | null
          expected_salary_max: number | null
          salary_currency: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['student_availability']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['student_availability']['Insert']>
      }
      job_skills: {
        Row: {
          id: string
          job_id: string
          skill_id: string
          is_required: boolean
        }
        Insert: Omit<Database['public']['Tables']['job_skills']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['job_skills']['Insert']>
      }
    }
    Views: {
      platform_stats: {
        Row: {
          total_students: number
          total_businesses: number
          active_jobs: number
          total_applications: number
          total_shortlisted: number
          total_hires: number
          total_hackathons: number
          total_hackathon_registrations: number
        }
      }
    }
    Functions: {}
    Enums: {}
  }
}

// Utility types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type Profile = Tables<'profiles'>
export type StudentProfile = Tables<'student_profiles'>
export type BusinessProfile = Tables<'business_profiles'>
export type Category = Tables<'categories'>
export type Subcategory = Tables<'subcategories'>
export type Skill = Tables<'skills'>
export type Job = Tables<'jobs'>
export type Application = Tables<'applications'>
export type HiringRecord = Tables<'hiring_records'>
export type Hackathon = Tables<'hackathons'>
export type Blog = Tables<'blogs'>
export type BlogCategory = Tables<'blog_categories'>
export type WebsiteUpdate = Tables<'website_updates'>
export type Notification = Tables<'notifications'>
export type StudentEducation = Tables<'student_education'>
export type StudentAvailability = Tables<'student_availability'>
export type PlatformStats = Database['public']['Views']['platform_stats']['Row']
