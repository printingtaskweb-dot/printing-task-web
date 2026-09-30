import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO } from 'date-fns'

export type BadgeVariant = 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple' | 'orange'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, fmt = 'dd MMM yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt)
}

export function timeAgo(date: string | Date) {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function formatSalary(min?: number | null, max?: number | null, currency = 'INR'): string {
  if (!min && !max) return 'Salary not disclosed'
  const fmtNum = (n: number) => {
    if (n >= 100000) return `${(n / 100000).toFixed(1)}L`
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
    return n.toString()
  }
  const symbol = currency === 'INR' ? '₹' : '$'
  if (min && max) return `${symbol}${fmtNum(min)} - ${symbol}${fmtNum(max)}`
  if (min) return `${symbol}${fmtNum(min)}+`
  if (max) return `Up to ${symbol}${fmtNum(max)}`
  return 'Salary not disclosed'
}

export function formatJobType(type: string): string {
  const map: Record<string, string> = {
    full_time: 'Full-time',
    part_time: 'Part-time',
    internship: 'Internship',
    freelance: 'Freelance',
    project: 'Project',
    temporary: 'Temporary',
  }
  return map[type] || type
}

export function formatWorkMode(mode: string): string {
  const map: Record<string, string> = {
    remote: 'Remote',
    on_site: 'On-site',
    hybrid: 'Hybrid',
  }
  return map[mode] || mode
}

export function formatExperienceLevel(level: string): string {
  const map: Record<string, string> = {
    fresher: 'Fresher',
    less_than_1_year: 'Less than 1 year',
    '1_2_years': '1-2 years',
    '2_5_years': '2-5 years',
    '5_plus_years': '5+ years',
  }
  return map[level] || level
}

export function formatAvailability(types: string[]): string {
  const map: Record<string, string> = {
    full_time: 'Full-time',
    part_time: 'Part-time',
    internship: 'Internship',
    freelance: 'Freelance',
    project_based: 'Project-based',
  }
  return types.map(t => map[t] || t).join(', ')
}

export function getApplicationStatusColor(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    applied: 'blue',
    under_review: 'yellow',
    shortlisted: 'purple',
    interview: 'blue',
    selected: 'green',
    rejected: 'red',
    withdrawn: 'gray',
  }
  return map[status] || 'gray'
}

export function getApplicationStatusLabel(status: string): string {
  const map: Record<string, string> = {
    applied: 'Applied',
    under_review: 'Under Review',
    shortlisted: 'Shortlisted',
    interview: 'Interview',
    selected: 'Selected',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
  }
  return map[status] || status
}

export function getHackathonStatusColor(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    draft: 'gray',
    upcoming: 'blue',
    registration_open: 'green',
    ongoing: 'purple',
    completed: 'gray',
    cancelled: 'red',
  }
  return map[status] || 'gray'
}

export function getHackathonStatusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: 'Draft',
    upcoming: 'Upcoming',
    registration_open: 'Registration Open',
    ongoing: 'Ongoing',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }
  return map[status] || status
}

export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

export function generateSlug(text: string): string {
  return slugify(text)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
