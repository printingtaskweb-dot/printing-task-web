import React from 'react'
import { Card, Button, Input } from '@/components/ui'

export default function AdminSettings() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
      <Card padding="lg" className="space-y-4">
        <Input label="Platform Display Name" defaultValue="SkillBridge" />
        <Input label="Tagline" defaultValue="Connect Skills With Opportunities" />
        <Button>Save Platform Settings</Button>
      </Card>
    </div>
  )
}
