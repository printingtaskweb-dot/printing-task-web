import React from 'react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  shape?: 'circle' | 'rounded'
}

const sizeStyles = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl',
}

export function Avatar({ src, alt, name, size = 'md', className, shape = 'circle' }: AvatarProps) {
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl'

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className={cn('object-cover bg-gray-100 flex-shrink-0', sizeStyles[size], shapeClass, className)}
      />
    )
  }

  return (
    <div className={cn(
      'bg-primary-100 text-primary-700 font-semibold flex items-center justify-center flex-shrink-0 select-none',
      sizeStyles[size],
      shapeClass,
      className
    )}>
      {name ? getInitials(name) : '?'}
    </div>
  )
}
