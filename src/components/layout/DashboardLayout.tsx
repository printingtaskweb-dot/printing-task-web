import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Briefcase, FileText, BookmarkCheck,
  Trophy, User, Building2, Users, Settings, Menu, X,
  LogOut, Bell, ChevronRight, BarChart3, PenSquare,
  Code2, Star, Search, CheckSquare
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/ui'
import { cn } from '@/lib/utils'

const studentSidebar = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Search, label: 'Opportunities', href: '/opportunities' },
  { icon: FileText, label: 'Applications', href: '/applications' },
  { icon: BookmarkCheck, label: 'Saved Jobs', href: '/saved' },
  { icon: Trophy, label: 'Hackathons', href: '/hackathons' },
  { icon: User, label: 'My Profile', href: '/profile' },
]

const businessSidebar = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: PenSquare, label: 'Post Opportunity', href: '/post-job' },
  { icon: FileText, label: 'My Postings', href: '/my-jobs' },
  { icon: Users, label: 'Applicants', href: '/applicants' },
  { icon: Search, label: 'Find Talent', href: '/talent' },
  { icon: CheckSquare, label: 'Hiring History', href: '/hiring' },
  { icon: Building2, label: 'Business Profile', href: '/business-profile' },
]

const adminSidebar = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: Building2, label: 'Businesses', href: '/admin/businesses' },
  { icon: Briefcase, label: 'Jobs', href: '/admin/jobs' },
  { icon: FileText, label: 'Applications', href: '/admin/applications' },
  { icon: BarChart3, label: 'Hiring Analytics', href: '/admin/hiring' },
  { icon: Trophy, label: 'Hackathons', href: '/admin/hackathons' },
  { icon: Star, label: 'Categories & Skills', href: '/admin/categories' },
  { icon: PenSquare, label: 'Blog CMS', href: '/admin/blog' },
  { icon: Code2, label: 'Dev Tracker', href: '/admin/dev-tracker' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const sidebar = user?.role === 'student' ? studentSidebar
    : user?.role === 'business_owner' ? businessSidebar
    : adminSidebar

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
              <path d="M2 7h4l2 5 2-8 2 3h4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-sm font-bold text-gray-900">SkillBridge</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-0.5">
          {sidebar.map(item => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/admin' && item.href !== '/dashboard' && location.pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors group',
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon size={17} className={cn(
                    'flex-shrink-0',
                    isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                  )} />
                  {item.label}
                  {isActive && <ChevronRight size={14} className="ml-auto text-primary-400" />}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar src={user?.avatar_url} name={user?.full_name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50/50 overflow-hidden">
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200 flex-shrink-0">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-white border-r border-gray-200 flex flex-col z-10">
            <div className="absolute top-4 right-4">
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-4 sm:px-6 h-14 bg-white border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Link
              to="/notifications"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Bell size={18} />
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
