import React from 'react'
import { Card } from '@/components/ui'
import { Bell } from 'lucide-react'

export default function NotificationsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
      <Card padding="lg" className="text-center py-12">
        <Bell size={32} className="mx-auto text-gray-400 mb-2" />
        <p className="text-sm font-semibold text-gray-700">No new notifications</p>
        <p className="text-xs text-gray-400">You are all caught up!</p>
      </Card>
    </div>
  )
}
