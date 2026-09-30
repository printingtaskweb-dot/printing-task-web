import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare, X, Send, Sparkles, Bot, User, ArrowRight,
  Briefcase, GraduationCap, Building2, Copy, Check, RefreshCw, FileText,
  Key, ShieldCheck, ChevronDown
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button, Input } from '@/components/ui'
import { ResumeGeneratorModal } from './ResumeGeneratorModal'
import { askGeminiAgent, getGeminiApiKey, setGeminiApiKey } from '@/lib/gemini'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  sender: 'ai' | 'user'
  text: string
  timestamp: string
  source?: 'gemini' | 'fallback'
  action?: {
    type: 'open_resume_modal' | 'view_jobs' | 'view_talent' | 'post_job'
    label: string
    link?: string
  }
}

export function AiChatWidget() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false)
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [hasKey, setHasKey] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const role: 'admin' | 'business_owner' | 'student' | 'guest' =
    user?.role === 'admin' ? 'admin' :
    user?.role === 'business_owner' ? 'business_owner' :
    user?.role === 'student' ? 'student' : 'guest'

  useEffect(() => {
    const key = getGeminiApiKey()
    setHasKey(!!key)
    setApiKeyInput(key)
  }, [showKeyModal, isOpen])

  // Initialize role-specific welcome message
  useEffect(() => {
    let initialGreeting = ''

    if (role === 'admin') {
      initialGreeting = `👋 Greetings Admin ${user?.full_name || ''}! I'm your **Gemini AI Operations Assistant**.\n\nI can help you:\n• Summarize platform metrics & application volumes\n• Review and moderate job listings and business approvals\n• Draft announcements, release notes, and blog articles\n\nWhat platform task would you like to review?`
    } else if (role === 'business_owner') {
      initialGreeting = `👋 Hi ${user?.full_name || 'there'}! I'm your **Gemini Talent & Hiring Assistant**.\n\nI can help you:\n• Discuss what skills or roles you need and find the best student employees\n• Draft structured, compelling job descriptions in seconds\n• Suggest competitive intern stipends and screening criteria\n\nWhat kind of employee or intern are you looking for today?`
    } else if (role === 'student') {
      initialGreeting = `👋 Hi ${user?.full_name || 'there'}! I'm your **Gemini AI Career & Resume Assistant**.\n\nI can help you:\n• **Generate an ATS-ready professional resume** for your domain\n• Find and match live jobs tailored to your skills & projects\n• Craft engaging cover letters and interview prep tips\n\nWhat would you like to build or apply for today?`
    } else {
      initialGreeting = `👋 Welcome to **SkillBridge**! I'm your AI Platform Copilot.\n\nAre you looking to **hire top student talent** or **discover student jobs & internships**? Ask me anything about how SkillBridge works!`
    }

    setMessages([
      {
        id: 'welcome-1',
        sender: 'ai',
        text: initialGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'gemini',
      },
    ])
  }, [role, user?.full_name])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping, isOpen])

  // Quick Action Pills based on role
  const quickActions = role === 'admin' ? [
    { label: '📊 Platform Metrics', prompt: 'Summarize platform health, active jobs, and student engagement statistics.' },
    { label: '📢 Draft Announcement', prompt: 'Draft a professional announcement for businesses about our new AI talent matching feature.' },
    { label: '🛡️ Audit Job Listings', prompt: 'What are the quality guidelines and verification steps for approving business job postings?' },
  ] : role === 'business_owner' ? [
    { label: '🔍 Find React & Node Interns', prompt: 'I need a full-stack student intern with React and Node.js skills for 3 months. Help me find candidates.' },
    { label: '📝 Draft Job Description', prompt: 'Draft a compelling Job Description for a Junior Web Developer Intern role with responsibilities and perks.' },
    { label: '💡 Recommend Stipend Range', prompt: 'What is a competitive stipend range for student software development interns?' },
  ] : role === 'student' ? [
    { label: '📄 Generate My Resume', prompt: 'Generate an ATS-optimized resume for a student applying for web development internships.' },
    { label: '🎯 Match Live Opportunities', prompt: 'What active job openings match my skills and how can I apply with my resume?' },
    { label: '✉️ Draft Cover Letter', prompt: 'Write a persuasive cover letter template for applying to tech startups on SkillBridge.' },
  ] : [
    { label: '🚀 How does SkillBridge work?', prompt: 'Explain how SkillBridge connects students with businesses.' },
    { label: '🎓 Join as a Student', prompt: 'How do I register as a student and start applying for jobs?' },
    { label: '🏢 Post a Job as Business', prompt: 'How can a business hire student interns and employees here?' },
  ]

  const handleSaveApiKey = () => {
    setGeminiApiKey(apiKeyInput)
    setHasKey(!!apiKeyInput.trim())
    setShowKeyModal(false)
    toast.success(apiKeyInput.trim() ? 'Google Gemini API key saved successfully!' : 'API key removed.')
  }

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input
    if (!query.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages(prev => [...prev, userMessage])
    if (!textToSend) setInput('')
    setIsTyping(true)

    try {
      // 1. Ask Gemini Agent with role prompt and context
      const geminiResult = await askGeminiAgent(query, role, user, messages)

      let action: ChatMessage['action'] = undefined
      const lower = query.toLowerCase()

      // Determine smart interactive UI action button
      if (lower.includes('resume') || lower.includes('cv')) {
        action = {
          type: 'open_resume_modal',
          label: 'Launch Visual Resume Builder',
        }
      } else if (lower.includes('candidate') || lower.includes('hire') || lower.includes('talent') || lower.includes('find') || lower.includes('developer')) {
        if (role === 'business_owner' || role === 'admin') {
          action = {
            type: 'view_talent',
            label: 'Search Student Talent Directory',
            link: '/talent',
          }
        }
      } else if (lower.includes('job') || lower.includes('internship') || lower.includes('match') || lower.includes('opening')) {
        if (role === 'student' || role === 'guest') {
          action = {
            type: 'view_jobs',
            label: 'Browse Live Opportunities',
            link: '/opportunities',
          }
        }
      } else if (lower.includes('post') || lower.includes('draft')) {
        if (role === 'business_owner') {
          action = {
            type: 'post_job',
            label: 'Post an Opportunity Now',
            link: '/post-job',
          }
        }
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: geminiResult.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: geminiResult.source,
        action,
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (err) {
      console.error(err)
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'I encountered a brief connection issue. Please check your query or Gemini API key setting.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleActionClick = (action: ChatMessage['action']) => {
    if (!action) return
    if (action.type === 'open_resume_modal') {
      setIsResumeModalOpen(true)
    }
  }

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white px-4 py-3.5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-primary-500/30"
            aria-label="Open AI Assistant"
          >
            <div className="relative">
              <Sparkles size={20} className="animate-pulse text-amber-300" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-primary-600 rounded-full" />
            </div>
            <span className="text-sm font-semibold tracking-wide pr-1">
              Gemini AI Copilot
            </span>
          </button>
        )}

        {/* Chat Window */}
        {isOpen && (
          <div className="w-[92vw] sm:w-[420px] h-[590px] max-h-[85vh] bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-700 text-white px-4 py-3.5 flex items-center justify-between flex-shrink-0 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white backdrop-blur-xs">
                  <Bot size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold tracking-tight">Gemini AI Copilot</h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {hasKey && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-primary-100">
                    {role === 'admin'
                      ? 'Admin Operations Assistant'
                      : role === 'business_owner'
                      ? 'Talent & Hiring Assistant'
                      : role === 'student'
                      ? 'Resume & Career Mentor'
                      : 'SkillBridge Assistant'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowKeyModal(!showKeyModal)}
                  title="Configure Gemini API Key"
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    hasKey ? "text-amber-300 hover:bg-white/10" : "text-primary-100 hover:text-white hover:bg-white/10"
                  )}
                >
                  <Key size={15} />
                </button>
                <button
                  onClick={() => setMessages(prev => prev.slice(0, 1))}
                  title="Restart conversation"
                  className="p-1.5 rounded-lg text-primary-100 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-primary-100 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* API Key Drawer / Configuration Bar */}
            {showKeyModal && (
              <div className="p-3 bg-amber-50/90 border-b border-amber-200 text-xs space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-900 flex items-center gap-1">
                    <Key size={13} /> Gemini API Key Setting:
                  </span>
                  <button onClick={() => setShowKeyModal(false)} className="text-amber-700 hover:text-amber-900">
                    <X size={13} />
                  </button>
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={e => setApiKeyInput(e.target.value)}
                    placeholder="AIzaSy... (Paste Gemini Key)"
                    className="flex-1 px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                  <Button size="sm" onClick={handleSaveApiKey} className="h-7 text-xs px-2.5 bg-amber-600 hover:bg-amber-700 text-white">
                    Save
                  </Button>
                </div>
                <p className="text-[10px] text-amber-700">
                  Key is saved securely in your browser session. If left empty, SkillBridge uses built-in smart assistant mode.
                </p>
              </div>
            )}

            {/* Quick Action Suggestion Bar */}
            <div className="bg-gray-50 border-b border-gray-100 px-3 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-shrink-0">
              {quickActions.map((qa, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(qa.prompt)}
                  className="text-[11px] whitespace-nowrap bg-white border border-gray-200 hover:border-primary-400 hover:text-primary-700 text-gray-600 px-2.5 py-1 rounded-full shadow-2xs transition-colors flex-shrink-0"
                >
                  {qa.label}
                </button>
              ))}
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gray-50/40 text-xs sm:text-sm">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex flex-col',
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[86%] rounded-2xl px-3.5 py-2.5 shadow-2xs leading-relaxed whitespace-pre-wrap',
                      msg.sender === 'user'
                        ? 'bg-primary-600 text-white rounded-br-xs'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-xs'
                    )}
                  >
                    {msg.text}

                    {msg.action && (
                      <div className="mt-2.5 pt-2 border-t border-gray-100">
                        {msg.action.link ? (
                          <Link
                            to={msg.action.link}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 px-2.5 py-1.5 rounded-lg border border-primary-100 hover:bg-primary-100 transition-colors"
                          >
                            {msg.action.label} <ArrowRight size={12} />
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleActionClick(msg.action)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 px-2.5 py-1.5 rounded-lg border border-primary-100 hover:bg-primary-100 transition-colors"
                          >
                            <Sparkles size={13} className="text-amber-500" /> {msg.action.label}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 text-gray-500 bg-white border border-gray-200 w-fit px-3 py-2 rounded-2xl text-xs rounded-bl-xs">
                  <Bot size={13} className="text-primary-600 animate-spin" />
                  <span>Gemini AI is formulating response...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-3 bg-white border-t border-gray-200 flex-shrink-0">
              <form
                onSubmit={e => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={
                    role === 'admin'
                      ? 'Ask about platform metrics, user moderation...'
                      : role === 'business_owner'
                      ? 'Describe who you want to hire or job to draft...'
                      : role === 'student'
                      ? 'Ask to generate resume, match jobs, or prep...'
                      : 'Ask anything about SkillBridge...'
                  }
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all placeholder-gray-400"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!input.trim()}
                  className="rounded-xl px-3.5 h-9 flex items-center justify-center bg-primary-600 hover:bg-primary-700"
                >
                  <Send size={15} />
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Reusable Resume Generator Modal */}
      <ResumeGeneratorModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
      />
    </>
  )
}
