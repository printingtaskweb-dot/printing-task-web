import React from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple' | 'orange'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
  dot?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  blue: 'bg-primary-50 text-primary-700 border-primary-100',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  yellow: 'bg-amber-50 text-amber-700 border-amber-100',
  red: 'bg-red-50 text-red-700 border-red-100',
  gray: 'bg-gray-100 text-gray-600 border-gray-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-100',
  orange: 'bg-orange-50 text-orange-700 border-orange-100',
}

const dotStyles: Record<BadgeVariant, string> = {
  blue: 'bg-primary-500',
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  red: 'bg-red-500',
  gray: 'bg-gray-400',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
}

export function Badge({ variant = 'gray', children, className, dot }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-md border',
      variantStyles[variant],
      className
    )}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotStyles[variant])} />}
      {children}
    </span>
  )
}
