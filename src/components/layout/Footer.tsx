import React from 'react'
import { Link } from 'react-router-dom'

const links = {
  Platform: [
    { label: 'Opportunities', href: '/opportunities' },
    { label: 'Find Talent', href: '/talent' },
    { label: 'Businesses', href: '/businesses' },
    { label: 'Hackathons', href: '/hackathons' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Blog & Articles', href: '/blog' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M2 7h4l2 5 2-8 2 3h4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-base font-bold text-gray-900">SkillBridge</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Connecting students and job seekers with businesses, local companies, and organizations.
            </p>
          </div>

          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{category}</p>
              <ul className="space-y-2">
                {items.map(item => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} SkillBridge. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            Built for students and businesses to connect, grow, and succeed.
          </p>
        </div>
      </div>
    </footer>
  )
}
