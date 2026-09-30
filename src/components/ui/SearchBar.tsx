import React, { useState, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { debounce } from '@/lib/utils'

interface SearchBarProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  debounceMs?: number
}

export function SearchBar({
  value: externalValue,
  onChange,
  placeholder = 'Search...',
  className,
  size = 'md',
  debounceMs = 300,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(externalValue || '')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnChange = useCallback(debounce(onChange, debounceMs), [onChange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value)
    debouncedOnChange(e.target.value)
  }

  const handleClear = () => {
    setLocalValue('')
    onChange('')
  }

  const sizeStyles = {
    sm: 'h-8 text-xs',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  }

  const iconSizes = { sm: 14, md: 16, lg: 18 }

  return (
    <div className={cn('relative', className)}>
      <Search
        size={iconSizes[size]}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          'w-full bg-white border border-gray-300 rounded-lg pl-9 pr-8 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          sizeStyles[size]
        )}
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
