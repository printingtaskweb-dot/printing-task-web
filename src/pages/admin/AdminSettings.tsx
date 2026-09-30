import React, { useState, useEffect } from 'react'
import { Card, Button, Input } from '@/components/ui'
import { Sparkles, Key, Check, Shield } from 'lucide-react'
import { getGeminiApiKey, setGeminiApiKey } from '@/lib/gemini'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const [platformName, setPlatformName] = useState('SkillBridge')
  const [platformTagline, setPlatformTagline] = useState('Connect Skills With Opportunities')
  const [geminiKey, setGeminiKey] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setGeminiKey(getGeminiApiKey())
  }, [])

  const handleSaveSettings = () => {
    setGeminiApiKey(geminiKey)
    setSaved(true)
    toast.success('Platform and Gemini AI settings saved!')
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-sm text-gray-500">Configure global platform branding and AI Copilot services</p>
      </div>

      {/* AI Configuration Card */}
      <Card padding="lg" className="space-y-4 border-primary-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/30">
        <div className="flex items-center gap-2.5 text-primary-700">
          <Sparkles size={20} />
          <h2 className="text-base font-bold text-gray-900">Google Gemini AI Engine Configuration</h2>
        </div>
        <p className="text-xs text-gray-600">
          The Gemini API powers the floating AI Copilot on SkillBridge. It provides role-based assistance for Admins, Business Employers (candidate sourcing & job drafting), and Students (ATS resume generator & job matching).
        </p>

        <Input
          label="Google Gemini API Key"
          type="password"
          placeholder="AIzaSy..."
          value={geminiKey}
          onChange={e => setGeminiKey(e.target.value)}
          leftIcon={<Key size={16} />}
          hint="Get a free API key at aistudio.google.com"
        />

        <div className="flex items-center gap-2 pt-1 text-xs text-gray-500">
          <Shield size={14} className="text-emerald-600" />
          <span>Key is securely used client-side for generating AI responses.</span>
        </div>
      </Card>

      {/* Platform Branding */}
      <Card padding="lg" className="space-y-4">
        <h2 className="text-base font-bold text-gray-900">General Branding</h2>
        <Input
          label="Platform Display Name"
          value={platformName}
          onChange={e => setPlatformName(e.target.value)}
        />
        <Input
          label="Tagline"
          value={platformTagline}
          onChange={e => setPlatformTagline(e.target.value)}
        />
        <Button onClick={handleSaveSettings} leftIcon={saved ? <Check size={16} /> : undefined}>
          {saved ? 'Settings Saved' : 'Save Platform Settings'}
        </Button>
      </Card>
    </div>
  )
}
