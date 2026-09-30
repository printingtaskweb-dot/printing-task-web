import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, X, Check } from 'lucide-react'

interface Option {
  value: string
  label: string
  group?: string
}

interface MultiSelectProps {
  options: Option[]
  value: string[]
  onChange: (values: string[]) => void
  label?: string
  placeholder?: string
  error?: string
  maxItems?: number
  searchable?: boolean
  className?: string
}

export function MultiSelect({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select options...',
  error,
  maxItems,
  searchable = true,
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  const toggle = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter(v => v !== val))
    } else {
      if (maxItems && value.length >= maxItems) return
      onChange([...value, val])
    }
  }

  const selectedLabels = value.map(v => options.find(o => o.value === v)?.label).filter(Boolean)

  return (
    <div className={cn('w-full', className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div
        className={cn(
          'relative w-full min-h-[42px] bg-white border rounded-lg cursor-pointer transition-colors',
          error ? 'border-red-300' : 'border-gray-300',
          isOpen && 'ring-2 ring-primary-500 border-transparent'
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1.5 p-2 pr-8">
          {selectedLabels.length === 0 ? (
            <span className="text-sm text-gray-400 py-0.5 px-1">{placeholder}</span>
          ) : (
            selectedLabels.map((label, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-md border border-primary-100"
              >
                {label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onChange(value.filter(v => options.find(o => o.value === v)?.label !== label))
                  }}
                  className="hover:text-primary-900"
                >
                  <X size={10} />
                </button>
              </span>
            ))
          )}
        </div>
        <ChevronDown
          size={16}
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-hidden flex flex-col">
          {searchable && (
            <div className="p-2 border-b border-gray-100">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onClick={e => e.stopPropagation()}
                placeholder="Search..."
                className="w-full text-sm px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                autoFocus
              />
            </div>
          )}
          <div className="overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No options found</p>
            ) : (
              filtered.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggle(opt.value) }}
                  className={cn(
                    'w-full text-left text-sm px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors',
                    value.includes(opt.value) && 'bg-primary-50 text-primary-700'
                  )}
                >
                  {opt.label}
                  {value.includes(opt.value) && <Check size={14} className="text-primary-600" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}
