import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Bell, ChevronDown, LogOut, User, Settings, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/ui'
import { cn } from '@/lib/utils'

const publicNav = [
  { label: 'Opportunities', href: '/opportunities' },
  { label: 'Talent', href: '/talent' },
  { label: 'Businesses', href: '/businesses' },
  { label: 'Hackathons', href: '/hackathons' },
  { label: 'Blog', href: '/blog' },
]

const studentNav = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Opportunities', href: '/opportunities' },
  { label: 'Applications', href: '/applications' },
  { label: 'Saved', href: '/saved' },
  { label: 'Hackathons', href: '/hackathons' },
]

const businessNav = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Post Opportunity', href: '/post-job' },
  { label: 'Applicants', href: '/applicants' },
  { label: 'Find Talent', href: '/talent' },
  { label: 'Hiring', href: '/hiring' },
]

const adminNav = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Jobs', href: '/admin/jobs' },
  { label: 'Hackathons', href: '/admin/hackathons' },
  { label: 'Blog', href: '/admin/blog' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  const navLinks = user?.role === 'student' ? studentNav
    : user?.role === 'business_owner' ? businessNav
    : user?.role === 'admin' ? adminNav
    : publicNav

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin'
    return '/dashboard'
  }

  return (
    <header className={cn(
      'sticky top-0 z-40 bg-white transition-shadow duration-200',
      scrolled ? 'shadow-sm border-b border-gray-200' : 'border-b border-gray-100'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 7h4l2 5 2-8 2 3h4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-base font-bold text-gray-900">SkillBridge</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'px-3 py-2 text-sm rounded-lg transition-colors',
                  location.pathname === link.href || (link.href !== '/' && location.pathname.startsWith(link.href))
                    ? 'text-primary-600 bg-primary-50 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/notifications"
                  className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <Bell size={18} />
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors"
                  >
                    <Avatar src={user.avatar_url} name={user.full_name} size="sm" />
                    <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">{user.full_name}</span>
                    <ChevronDown size={14} className={cn('text-gray-400 transition-transform', userMenuOpen && 'rotate-180')} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        to={getDashboardLink()}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LayoutDashboard size={15} />
                        Dashboard
                      </Link>
                      <Link
                        to={user.role === 'student' ? '/profile' : user.role === 'business_owner' ? '/business-profile' : '/admin/settings'}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User size={15} />
                        Profile
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin/settings"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Settings size={15} />
                          Settings
                        </Link>
                      )}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={15} />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-xs"
                >
                  Get started
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors',
                  location.pathname === link.href
                    ? 'text-primary-600 bg-primary-50 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {!user && (
            <div className="px-4 pb-4 pt-2 border-t border-gray-100 flex flex-col gap-2">
              <Link to="/login" className="btn-secondary btn text-center">Sign in</Link>
              <Link to="/register" className="btn-primary btn text-center">Get started</Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
