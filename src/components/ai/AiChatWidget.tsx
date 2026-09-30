import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare, X, Send, Sparkles, Bot, User, ArrowRight,
  Briefcase, GraduationCap, Building2, Copy, Check, RefreshCw, FileText
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui'
import { ResumeGeneratorModal } from './ResumeGeneratorModal'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  sender: 'ai' | 'user'
  text: string
  timestamp: string
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const role = user?.role || 'guest'

  // Initialize role-specific welcome message
  useEffect(() => {
    let initialGreeting = ''

    if (role === 'business_owner') {
      initialGreeting = `👋 Hi ${user?.full_name || 'there'}! I'm your **SkillBridge Hiring Copilot**.\n\nI can help you:\n• Find top student candidates & interns for your company\n• Draft a compelling job or internship description\n• Suggest required tech stacks & competitive stipends\n\nWhat role or talent are you looking to hire today?`
    } else if (role === 'student') {
      initialGreeting = `👋 Hi ${user?.full_name || 'there'}! I'm your **SkillBridge Career & Resume Copilot**.\n\nI can help you:\n• **Generate a professional resume** tailored to your domain\n• Match your skills with active jobs & internships\n• Write tailored cover letters for business applications\n\nHow can I help you take the next step in your career?`
    } else {
      initialGreeting = `👋 Welcome to **SkillBridge**! I'm your AI platform guide.\n\nAre you looking to **hire student talent** or **find jobs & internships**? Ask me anything about our platform, matching algorithms, or opportunities!`
    }

    setMessages([
      {
        id: 'welcome-1',
        sender: 'ai',
        text: initialGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
  const quickActions = role === 'business_owner' ? [
    { label: '🔍 Find React Developer Interns', prompt: 'Help me find student candidates skilled in React, TypeScript, and modern frontend.' },
    { label: '📝 Draft a Job Description', prompt: 'Can you draft a comprehensive Job Description for a Junior Web Developer internship?' },
    { label: '💡 What stipend should I offer?', prompt: 'What is the standard competitive stipend range for student software interns?' },
  ] : role === 'student' ? [
    { label: '📄 Generate My Resume', prompt: 'I want to generate a clean ATS-friendly resume for my job applications.' },
    { label: '🎯 Match Jobs For My Skills', prompt: 'What are the top active job opportunities right now that match my background?' },
    { label: '✍️ Write Cover Letter Template', prompt: 'Write me an engaging cover letter template for a web development internship.' },
  ] : [
    { label: '🚀 How does SkillBridge work?', prompt: 'Explain how SkillBridge connects students with businesses.' },
    { label: '🎓 Join as a Student', prompt: 'How do I register as a student and start applying for jobs?' },
    { label: '🏢 Post a Job as Business', prompt: 'How can a business hire student interns and employees here?' },
  ]

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

    // AI Response generation logic
    setTimeout(async () => {
      const lower = query.toLowerCase()
      let aiResponseText = ''
      let action: ChatMessage['action'] = undefined

      if (lower.includes('resume') || lower.includes('cv')) {
        aiResponseText = `📄 **AI Resume Generator:**\n\nI have prepared an ATS-optimized, high-impact resume template for you! Click the button below to preview, customize, and export it as text or print to PDF.`
        action = {
          type: 'open_resume_modal',
          label: 'Open Resume Builder & Preview',
        }
      } else if (lower.includes('find') && (lower.includes('candidate') || lower.includes('developer') || lower.includes('intern') || lower.includes('employee') || lower.includes('hire'))) {
        try {
          const { data: students } = await supabase
            .from('student_profiles')
            .select('*, profiles(full_name, avatar_url), student_skills(*, skills(name))')
            .limit(3)

          if (students && students.length > 0) {
            const list = students.map((s: any) => {
              const skillsStr = (s.student_skills || []).map((sk: any) => sk.skills?.name).filter(Boolean).slice(0, 3).join(', ')
              return `• **${s.profiles?.full_name || 'Student Candidate'}** — *${s.headline || 'Talent'}*\n  Skills: ${skillsStr || 'Full Stack, React'}`
            }).join('\n\n')

            aiResponseText = `🎯 **Top Recommended Student Candidates:**\n\n${list}\n\nYou can browse verified talent profiles and view detailed portfolios directly.`
            action = {
              type: 'view_talent',
              label: 'Browse Verified Talent Directory',
              link: '/talent',
            }
          } else {
            aiResponseText = `🔍 **Candidate Matching Recommendations:**\n\nFor roles requiring modern web tech (React, Node, UI/UX):\n• Look for students with verified project repositories and hackathon participation.\n• Freshers with 1-2 practical projects typically adapt within 1-2 weeks.\n• Check their match score against your job requirements.`
            action = {
              type: 'view_talent',
              label: 'Explore Talent Directory',
              link: '/talent',
            }
          }
        } catch {
          aiResponseText = `🔍 I can help you filter candidate profiles by category, verified skills, and availability mode (remote or on-site). Check our talent directory!`
          action = { type: 'view_talent', label: 'View Talent Directory', link: '/talent' }
        }
      } else if (lower.includes('job') || lower.includes('opportunity') || lower.includes('internship') || lower.includes('match')) {
        try {
          const { data: jobs } = await supabase
            .from('jobs')
            .select('title, job_type, work_mode, business_profiles(business_name)')
            .eq('status', 'active')
            .limit(3)

          if (jobs && jobs.length > 0) {
            const jobList = jobs.map((j: any) => `• **${j.title}** at *${j.business_profiles?.business_name || 'Verified Business'}* (${j.work_mode})`).join('\n')
            aiResponseText = `🎯 **Live Matching Opportunities:**\n\n${jobList}\n\nYou can view full compensation, requirements, and apply with 1 click.`
          } else {
            aiResponseText = `🎯 **Opportunity Matching:**\n\nWe have verified openings across Software Development, UI/UX Design, Digital Marketing, and Video Creation. Check out the latest listings!`
          }
          action = {
            type: 'view_jobs',
            label: 'Browse All Live Opportunities',
            link: '/opportunities',
          }
        } catch {
          aiResponseText = `🎯 Check our live opportunities board to view all verified openings and apply directly!`
          action = { type: 'view_jobs', label: 'Browse Jobs', link: '/opportunities' }
        }
      } else if (lower.includes('draft') || lower.includes('description') || lower.includes('jd')) {
        aiResponseText = `📝 **Job Description Draft:**\n\n**Title:** Junior Web Developer Intern\n**Role Type:** Internship / Project (3-6 Months)\n**Work Mode:** Remote / Hybrid\n\n**Key Responsibilities:**\n• Develop and maintain responsive user interfaces\n• Collaborate on REST APIs and Supabase/Postgres queries\n• Write clean, testable, and documented code\n\n**Requirements:**\n• Solid fundamentals in JavaScript/TypeScript, React, and CSS\n• Experience with Git and version control\n• High enthusiasm to learn and ship features\n\nWould you like to publish this opportunity right away?`
        action = {
          type: 'post_job',
          label: 'Post This Opportunity',
          link: '/post-job',
        }
      } else if (lower.includes('cover letter')) {
        aiResponseText = `✍️ **Engaging Cover Letter Template:**\n\n"Dear Hiring Team,\n\nI am excited to apply for the role at your esteemed company. With a strong foundation in modern development and a passion for crafting responsive, user-friendly solutions, I have built full-stack applications solving real-world challenges.\n\nI would love the opportunity to contribute to your team's mission. Thank you for your consideration.\n\nSincerely,\n${user?.full_name || 'Candidate'}"`
      } else if (lower.includes('stipend') || lower.includes('salary')) {
        aiResponseText = `💡 **Recommended Stipend Benchmark:**\n\n• **Software / Web Dev Interns:** ₹8,000 – ₹25,000 / month ($200 – $600/mo remote)\n• **UI/UX & Graphic Designers:** ₹6,000 – ₹18,000 / month\n• **Digital Marketing / Media:** ₹5,000 – ₹15,000 / month\n\nOffering competitive stipends with flexible work hours attracts top student talent!`
      } else {
        aiResponseText = `💡 **SkillBridge AI:**\n\nI understand your query regarding "${query}". SkillBridge connects high-skill students with ambitious businesses through automated skill matching, transparent hiring history, and live hackathons.\n\nFeel free to ask me to **generate a resume**, **find talent**, or **draft a job post**!`
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action,
      }

      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 700)
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
            className="group relative flex items-center gap-2.5 bg-primary-600 hover:bg-primary-700 text-white px-4 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-primary-500/30"
            aria-label="Open AI Assistant"
          >
            <div className="relative">
              <Sparkles size={20} className="animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-primary-600 rounded-full" />
            </div>
            <span className="text-sm font-semibold tracking-wide pr-1">
              AI Copilot
            </span>
          </button>
        )}

        {/* Chat Window */}
        {isOpen && (
          <div className="w-[92vw] sm:w-[410px] h-[580px] max-h-[85vh] bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
            {/* Header */}
            <div className="bg-primary-600 text-white px-4 py-3.5 flex items-center justify-between flex-shrink-0 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white backdrop-blur-xs">
                  <Bot size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold tracking-tight">SkillBridge AI Copilot</h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-[11px] text-primary-100">
                    {role === 'business_owner' ? 'Hiring & Candidate Assistant' : role === 'student' ? 'Resume & Career Assistant' : 'Platform Assistant'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setMessages(prev => prev.slice(0, 1))
                  }}
                  title="Clear conversation"
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
                      'max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-2xs leading-relaxed whitespace-pre-wrap',
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
                            <Sparkles size={13} /> {msg.action.label}
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
                <div className="flex items-center gap-1.5 text-gray-400 bg-white border border-gray-200 w-fit px-3 py-2 rounded-2xl text-xs rounded-bl-xs">
                  <Bot size={13} className="text-primary-600 animate-spin" />
                  <span>AI Copilot is thinking...</span>
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
                    role === 'business_owner'
                      ? 'Describe role, skills, or candidate need...'
                      : role === 'student'
                      ? 'Ask for resume, job match, or interview prep...'
                      : 'Ask anything about SkillBridge...'
                  }
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all placeholder-gray-400"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!input.trim()}
                  className="rounded-xl px-3.5 h-9 flex items-center justify-center"
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
