import React, { createContext, useContext } from 'react'
import { cn } from '@/lib/utils'

interface TabsContextType {
  active: string
  onChange: (val: string) => void
}

const TabsContext = createContext<TabsContextType>({ active: '', onChange: () => {} })

interface TabsProps {
  value: string
  onChange: (val: string) => void
  children: React.ReactNode
  className?: string
}

export function Tabs({ value, onChange, children, className }: TabsProps) {
  return (
    <TabsContext.Provider value={{ active: value, onChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      'flex items-center border-b border-gray-200 gap-0',
      className
    )}>
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { active, onChange } = useContext(TabsContext)
  const isActive = active === value

  return (
    <button
      onClick={() => onChange(value)}
      className={cn(
        'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
        isActive
          ? 'border-primary-600 text-primary-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { active } = useContext(TabsContext)
  if (active !== value) return null
  return <div className={cn('pt-5', className)}>{children}</div>
}
