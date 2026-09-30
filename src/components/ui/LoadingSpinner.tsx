import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
  fullPage?: boolean
}

export function LoadingSpinner({ size = 'md', className, text, fullPage }: LoadingSpinnerProps) {
  const sizes = { sm: 16, md: 24, lg: 32 }

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-primary-600" />
          {text && <p className="text-sm text-gray-500">{text}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-center py-12', className)}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={sizes[size]} className="animate-spin text-primary-600" />
        {text && <p className="text-sm text-gray-500">{text}</p>}
      </div>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  )
}
