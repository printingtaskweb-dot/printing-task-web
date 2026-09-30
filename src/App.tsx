import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PageLoader } from '@/components/ui'
import { AiChatWidget } from '@/components/ai'

// Lazy loaded pages
const HomePage = lazy(() => import('@/pages/home/HomePage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))

// Student onboarding
const StudentOnboarding = lazy(() => import('@/pages/onboarding/StudentOnboarding'))
const BusinessOnboarding = lazy(() => import('@/pages/onboarding/BusinessOnboarding'))

// Student pages
const StudentDashboard = lazy(() => import('@/pages/student/StudentDashboard'))
const StudentProfile = lazy(() => import('@/pages/student/StudentProfile'))
const MyApplications = lazy(() => import('@/pages/student/MyApplications'))
const SavedJobs = lazy(() => import('@/pages/student/SavedJobs'))

// Business pages
const BusinessDashboard = lazy(() => import('@/pages/business/BusinessDashboard'))
const BusinessProfile = lazy(() => import('@/pages/business/BusinessProfilePage'))
const PostJobPage = lazy(() => import('@/pages/business/PostJobPage'))
const MyJobsPage = lazy(() => import('@/pages/business/MyJobsPage'))
const ApplicantsPage = lazy(() => import('@/pages/business/ApplicantsPage'))
const HiringPage = lazy(() => import('@/pages/business/HiringPage'))

// Shared pages
const OpportunitiesPage = lazy(() => import('@/pages/opportunities/OpportunitiesPage'))
const JobDetailPage = lazy(() => import('@/pages/opportunities/JobDetailPage'))
const TalentPage = lazy(() => import('@/pages/talent/TalentPage'))
const StudentPublicProfile = lazy(() => import('@/pages/talent/StudentPublicProfile'))
const BusinessesPage = lazy(() => import('@/pages/businesses/BusinessesPage'))
const HackathonsPage = lazy(() => import('@/pages/hackathons/HackathonsPage'))
const HackathonDetailPage = lazy(() => import('@/pages/hackathons/HackathonDetailPage'))
const NotificationsPage = lazy(() => import('@/pages/notifications/NotificationsPage'))

// Blog
const BlogPage = lazy(() => import('@/pages/blog/BlogPage'))
const BlogPostPage = lazy(() => import('@/pages/blog/BlogPostPage'))

// Admin pages
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'))
const AdminBusinesses = lazy(() => import('@/pages/admin/AdminBusinesses'))
const AdminJobs = lazy(() => import('@/pages/admin/AdminJobs'))
const AdminApplications = lazy(() => import('@/pages/admin/AdminApplications'))
const AdminHiring = lazy(() => import('@/pages/admin/AdminHiring'))
const AdminHackathons = lazy(() => import('@/pages/admin/AdminHackathons'))
const AdminHackathonDetail = lazy(() => import('@/pages/admin/AdminHackathonDetail'))
const AdminCategories = lazy(() => import('@/pages/admin/AdminCategories'))
const AdminBlog = lazy(() => import('@/pages/admin/AdminBlog'))
const AdminBlogEditor = lazy(() => import('@/pages/admin/AdminBlogEditor'))
const AdminDevTracker = lazy(() => import('@/pages/admin/AdminDevTracker'))
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'))

// Protected route wrapper
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles?: Array<'student' | 'business_owner' | 'admin'>
}) {
  const { user, isLoading } = useAuth()

  if (isLoading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />

  // Only restrict if role is not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

// Public layout wrapper
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

// Dashboard route wrapper
function DashboardRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: Array<'student' | 'business_owner' | 'admin'> }) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  )
}

// Helper to route /dashboard based on role
function RouterDashboard() {
  const { user } = useAuth()
  if (user?.role === 'student') return <StudentDashboard />
  if (user?.role === 'business_owner') return <BusinessDashboard />
  return <Navigate to="/admin" replace />
}

export default function App() {
  const { isLoading } = useAuth()

  if (isLoading) return <PageLoader />

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
        <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
        <Route path="/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />
        <Route path="/opportunities" element={<PublicLayout><OpportunitiesPage /></PublicLayout>} />
        <Route path="/opportunities/:slug" element={<PublicLayout><JobDetailPage /></PublicLayout>} />
        <Route path="/talent" element={<PublicLayout><TalentPage /></PublicLayout>} />
        <Route path="/talent/:id" element={<PublicLayout><StudentPublicProfile /></PublicLayout>} />
        <Route path="/businesses" element={<PublicLayout><BusinessesPage /></PublicLayout>} />
        <Route path="/hackathons" element={<PublicLayout><HackathonsPage /></PublicLayout>} />
        <Route path="/hackathons/:slug" element={<PublicLayout><HackathonDetailPage /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout><BlogPage /></PublicLayout>} />
        <Route path="/blog/:slug" element={<PublicLayout><BlogPostPage /></PublicLayout>} />

        {/* Onboarding routes */}
        <Route path="/onboarding/student" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentOnboarding />
          </ProtectedRoute>
        } />
        <Route path="/onboarding/business" element={
          <ProtectedRoute allowedRoles={['business_owner']}>
            <BusinessOnboarding />
          </ProtectedRoute>
        } />

        {/* Student dashboard routes */}
        <Route path="/dashboard" element={<DashboardRoute allowedRoles={['student', 'business_owner', 'admin']}><RouterDashboard /></DashboardRoute>} />
        <Route path="/profile" element={<DashboardRoute allowedRoles={['student']}><StudentProfile /></DashboardRoute>} />
        <Route path="/applications" element={<DashboardRoute allowedRoles={['student']}><MyApplications /></DashboardRoute>} />
        <Route path="/saved" element={<DashboardRoute allowedRoles={['student']}><SavedJobs /></DashboardRoute>} />

        {/* Business dashboard routes */}
        <Route path="/post-job" element={<DashboardRoute allowedRoles={['business_owner']}><PostJobPage /></DashboardRoute>} />
        <Route path="/post-job/:id" element={<DashboardRoute allowedRoles={['business_owner']}><PostJobPage /></DashboardRoute>} />
        <Route path="/my-jobs" element={<DashboardRoute allowedRoles={['business_owner']}><MyJobsPage /></DashboardRoute>} />
        <Route path="/applicants" element={<DashboardRoute allowedRoles={['business_owner']}><ApplicantsPage /></DashboardRoute>} />
        <Route path="/hiring" element={<DashboardRoute allowedRoles={['business_owner']}><HiringPage /></DashboardRoute>} />
        <Route path="/business-profile" element={<DashboardRoute allowedRoles={['business_owner']}><BusinessProfile /></DashboardRoute>} />

        {/* Shared dashboard routes */}
        <Route path="/notifications" element={<DashboardRoute><NotificationsPage /></DashboardRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<DashboardRoute allowedRoles={['admin']}><AdminDashboard /></DashboardRoute>} />
        <Route path="/admin/users" element={<DashboardRoute allowedRoles={['admin']}><AdminUsers /></DashboardRoute>} />
        <Route path="/admin/businesses" element={<DashboardRoute allowedRoles={['admin']}><AdminBusinesses /></DashboardRoute>} />
        <Route path="/admin/jobs" element={<DashboardRoute allowedRoles={['admin']}><AdminJobs /></DashboardRoute>} />
        <Route path="/admin/applications" element={<DashboardRoute allowedRoles={['admin']}><AdminApplications /></DashboardRoute>} />
        <Route path="/admin/hiring" element={<DashboardRoute allowedRoles={['admin']}><AdminHiring /></DashboardRoute>} />
        <Route path="/admin/hackathons" element={<DashboardRoute allowedRoles={['admin']}><AdminHackathons /></DashboardRoute>} />
        <Route path="/admin/hackathons/:id" element={<DashboardRoute allowedRoles={['admin']}><AdminHackathonDetail /></DashboardRoute>} />
        <Route path="/admin/hackathons/new" element={<DashboardRoute allowedRoles={['admin']}><AdminHackathonDetail /></DashboardRoute>} />
        <Route path="/admin/categories" element={<DashboardRoute allowedRoles={['admin']}><AdminCategories /></DashboardRoute>} />
        <Route path="/admin/blog" element={<DashboardRoute allowedRoles={['admin']}><AdminBlog /></DashboardRoute>} />
        <Route path="/admin/blog/new" element={<DashboardRoute allowedRoles={['admin']}><AdminBlogEditor /></DashboardRoute>} />
        <Route path="/admin/blog/:id" element={<DashboardRoute allowedRoles={['admin']}><AdminBlogEditor /></DashboardRoute>} />
        <Route path="/admin/dev-tracker" element={<DashboardRoute allowedRoles={['admin']}><AdminDevTracker /></DashboardRoute>} />
        <Route path="/admin/settings" element={<DashboardRoute allowedRoles={['admin']}><AdminSettings /></DashboardRoute>} />

        {/* Catch-all */}
        <Route path="*" element={
          <PublicLayout>
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
              <h1 className="text-6xl font-bold text-gray-100 mb-4">404</h1>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Page not found</h2>
              <p className="text-gray-500 mb-6">The page you are looking for doesn&apos;t exist.</p>
              <a href="/" className="btn-primary btn">Back to home</a>
            </div>
          </PublicLayout>
        } />
      </Routes>

      {/* Global Floating AI Copilot Widget */}
      <AiChatWidget />
    </Suspense>
  )
}
