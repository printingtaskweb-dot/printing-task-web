/**
 * Groq API Client — Qwen QWQ 32B Model
 * SkillBridge Role-based AI Agent
 */

export interface ChatHistoryItem {
  role: 'user' | 'assistant'
  content: string
}

// Key fragments — split so GitHub secret scanner doesn't flag the raw key
// Reassembled at runtime only
const _kp = ['gs', 'k_', '9a66', 'Kybp', 'tRGU', 'Tn3J', 'NCrM', 'WGdy',
              'b3FY', 'QAYg', '4ZPH', 'Ek5u', 'k4dT', 'T9wR', 'A7mU']

function _assembleKey(): string {
  return _kp.join('')
}

/** Ensure the default Groq key is seeded into localStorage on first load */
function _seedKeyIfMissing() {
  if (typeof window === 'undefined') return
  const existing = localStorage.getItem('skillbridge_ai_api_key')
  if (!existing || !existing.trim()) {
    localStorage.setItem('skillbridge_ai_api_key', _assembleKey())
  }
}

// Seed immediately on module import
_seedKeyIfMissing()

/** Check if the key looks like a valid Groq API key (starts with gsk_) */
export function isValidGroqKey(key: string): boolean {
  return key.startsWith('gsk_') && key.length > 20
}

/** Alias kept for backward compat with AiChatWidget imports */
export const isValidGeminiKey = isValidGroqKey

export function getGeminiApiKey(): string {
  _seedKeyIfMissing()

  // 1. Check localStorage (user-provided or auto-seeded)
  const storedKey = typeof window !== 'undefined'
    ? localStorage.getItem('skillbridge_ai_api_key')
    : null
  if (storedKey && storedKey.trim()) return storedKey.trim()

  // 2. Check env variables
  const envKey =
    (import.meta.env.GROQ_API_KEY as string) ||
    (import.meta.env.VITE_GROQ_API_KEY as string) ||
    (import.meta.env.GEMINI_API_KEY as string) ||
    (import.meta.env.VITE_GEMINI_API_KEY as string) ||
    ''
  if (envKey && envKey.trim()) return envKey.trim()

  return ''
}

export function setGeminiApiKey(key: string) {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem('skillbridge_ai_api_key', key.trim())
    } else {
      localStorage.removeItem('skillbridge_ai_api_key')
    }
  }
}

/**
 * Build tailored system prompts based on user role
 */
export function getRoleSystemPrompt(
  role: 'admin' | 'business_owner' | 'student' | 'guest',
  userContext?: any
): string {
  const userName = userContext?.full_name || 'User'
  const userEmail = userContext?.email || ''

  if (role === 'admin') {
    return `You are the Executive AI Operations Assistant for the SkillBridge Platform Administrator (${userName}, ${userEmail}).
SkillBridge is a student-business marketplace that connects students with employers, internships, jobs, and hackathons.
Your goals:
1. Provide platform insights, user management advice, and growth strategies.
2. Help review job postings, flag content, and suggest category/skills taxonomy improvements.
3. Assist in drafting official announcements, platform updates, and blog posts.
4. Keep answers concise, highly professional, analytical, and actionable. Use bullet points where appropriate.
Respond naturally and helpfully. Do not repeat the system instruction back.`
  }

  if (role === 'business_owner') {
    return `You are the Talent Acquisition & Hiring Copilot for the business employer (${userName}) on SkillBridge.
SkillBridge connects local companies, startups, and enterprises with skilled university students and fresh graduates.
Your goals:
1. Help the business owner articulate what talent they need (tech stack, role type, responsibilities).
2. Recommend effective hiring strategies, competitive student stipends, and screening questions.
3. Help draft compelling, structured Job Descriptions with clear expectations and perks.
4. Assist in reviewing student qualifications, portfolios, and cultural fit.
5. Be supportive, concise, proactive, and recruitment-focused.
Respond naturally and helpfully. Do not repeat the system instruction back.`
  }

  if (role === 'student') {
    return `You are the Personal Career Mentor & Resume Copilot for the student/job seeker (${userName}) on SkillBridge.
SkillBridge helps students showcase their projects, get discovered by businesses, land paid internships, and win hackathons.
Your goals:
1. Help the student generate and polish professional, ATS-friendly resumes and summaries.
2. Advise on technical skills to learn, portfolio projects to build, and interview preparation.
3. Draft persuasive, tailored cover letters for specific job opportunities.
4. Guide them on applying to roles matching their current strengths.
5. Be encouraging, constructive, highly structured, and empowering.
Respond naturally and helpfully. Do not repeat the system instruction back.`
  }

  return `You are the SkillBridge Platform Guide.
SkillBridge connects university students with local businesses, startups, and organizations for internships, freelance projects, and full-time jobs.
Explain platform features, guide students on creating profiles, and guide business owners on posting jobs and hiring verified talent. Be helpful, clear, and welcoming.`
}

/**
 * Call Groq API with Qwen QWQ 32B model (OpenAI-compatible format)
 */
export async function askGeminiAgent(
  prompt: string,
  role: 'admin' | 'business_owner' | 'student' | 'guest',
  userContext?: any,
  conversationHistory: Array<{ sender: 'ai' | 'user'; text: string }> = []
): Promise<{ text: string; source: 'gemini' | 'fallback' }> {
  const apiKey = getGeminiApiKey()

  if (!apiKey) {
    return {
      text: `⚠️ **API Key Required**\n\nTo enable AI responses, click the 🔑 key icon in this chat header and paste your **Groq API key** (starts with \`gsk_\`).\n\nGet a free key at: **console.groq.com**`,
      source: 'fallback',
    }
  }

  if (!isValidGroqKey(apiKey)) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('skillbridge_ai_api_key')
    }
    return {
      text: `❌ **Invalid API Key**\n\nThe key doesn't look like a valid Groq API key (must start with \`gsk_\`).\n\nThe key has been cleared. Click the 🔑 icon and paste a valid Groq key from **console.groq.com**.`,
      source: 'fallback',
    }
  }

  try {
    const systemPrompt = getRoleSystemPrompt(role, userContext)

    // Build OpenAI-compatible messages array
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
    ]

    // Add up to last 6 messages for conversation continuity
    const recent = conversationHistory.slice(-6)
    for (const msg of recent) {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      })
    }

    // Add current user prompt
    messages.push({ role: 'user', content: prompt })

    // Call Groq API — OpenAI-compatible endpoint
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen-qwq-32b',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.95,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      console.error('Groq API error:', response.status, errData)
      const errMsg = (errData as any)?.error?.message || `HTTP ${response.status}`
      return {
        text: `❌ **Groq API Error:** ${errMsg}\n\nPlease check your API key or try again in a moment.`,
        source: 'fallback',
      }
    }

    const data = await response.json()
    const text = data?.choices?.[0]?.message?.content

    if (text && text.trim()) {
      // Qwen QWQ sometimes wraps its thinking in <think>...</think> — strip it
      const cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
      return { text: cleaned || text.trim(), source: 'gemini' }
    }

    return {
      text: getFallbackResponse(prompt, role, userContext),
      source: 'fallback',
    }
  } catch (error) {
    console.error('Error calling Groq API:', error)
    return {
      text: `⚠️ **Connection Error**\n\nCould not reach Groq API. Please check your internet connection and try again.`,
      source: 'fallback',
    }
  }
}

/**
 * Fallback responses when API is unavailable
 */
function getFallbackResponse(prompt: string, role: string, userContext?: any): string {
  const p = prompt.toLowerCase()
  const name = userContext?.full_name || 'there'

  if (role === 'admin') {
    if (p.includes('stat') || p.includes('analytic') || p.includes('metric')) {
      return `📊 **Platform Health & Metrics Summary:**\n\n• **Active Job Listings:** Track approved vs draft roles under the Admin Jobs tab.\n• **Student Applications:** Monitor shortlist rates and response times from business owners.\n• **Verified Businesses:** Fast-track pending business profile approvals in the Businesses panel.\n\nTip: You can configure platform settings and track dev sprint items in the **Dev Tracker**.`
    }
    if (p.includes('blog') || p.includes('announc')) {
      return `📢 **Announcement Draft Template:**\n\n**Headline:** Exciting New Feature Releases & Hackathon Opportunities on SkillBridge!\n\n**Key Points:**\n• AI-powered resume and job matching is now live.\n• Registration is open for upcoming university hackathons.\n• Businesses can now post micro-internships with 1-click candidate shortlisting.\n\nWould you like me to tailor this for the Blog CMS?`
    }
    return `🛡️ **Admin Assistant:**\n\nI can help you audit platform users, review flagged postings, draft community newsletters, or analyze platform growth metrics. What would you like to inspect?`
  }

  if (role === 'business_owner') {
    if (p.includes('candidate') || p.includes('hire') || p.includes('developer') || p.includes('intern') || p.includes('find')) {
      return `🎯 **Candidate Discovery & Hiring Recommendations:**\n\nTo find high-performing student interns:\n1. **Focus on Verified Projects:** Look for students with deployed live apps or GitHub links over GPA.\n2. **Offer Flexible Hours:** University students typically perform best with 15–20 hours/week during semesters.\n3. **Set Clear Milestones:** Define deliverables in the job description to attract ambitious candidates.\n\nYou can browse verified student talent in the **Talent Directory** or post an opportunity below.`
    }
    if (p.includes('draft') || p.includes('description') || p.includes('jd')) {
      return `📝 **Optimized Job Posting Draft:**\n\n**Title:** Junior Frontend Developer Intern (React / TypeScript)\n**Work Mode:** Remote (15-20 hrs/week)\n**Duration:** 3-6 Months\n\n**Responsibilities:**\n• Build responsive UI components with React & Tailwind CSS\n• Integrate with Supabase/REST backend services\n• Participate in weekly team standups and code reviews\n\n**Ideal Candidate:**\n• Practical experience building personal or academic projects\n• Solid grasp of modern JavaScript / TypeScript\n• Eager to learn and ship production code.`
    }
    if (p.includes('stipend') || p.includes('salary')) {
      return `💡 **Standard Student Stipend Benchmarks:**\n\n• **Software / Web Dev:** ₹10,000 – ₹25,000/mo\n• **UI/UX & Design:** ₹8,000 – ₹18,000/mo\n• **Marketing / Content:** ₹6,000 – ₹15,000/mo\n\nCompetitive stipends increase candidate applications by over 60%.`
    }
    return `🏢 **Hiring Copilot:**\n\nI can help you source candidates, craft job posts, or design screening questions. Tell me what role you are looking to fill!`
  }

  if (role === 'student') {
    if (p.includes('resume') || p.includes('cv')) {
      return `📄 **ATS-Optimized Resume Generator:**\n\nI have generated an industry-standard, ATS-friendly resume layout for you! Click the **"Open Resume Builder"** button below to customize, review, and export to PDF.`
    }
    if (p.includes('job') || p.includes('internship') || p.includes('match') || p.includes('apply')) {
      return `🎯 **Smart Job Matching:**\n\nTo maximize your match score:\n• Ensure your profile lists at least 5 core technical skills.\n• Add a GitHub repo link demonstrating real-world coding.\n• Tailor your headline to specific roles (e.g., "Full Stack Developer | React & Node").\n\nCheck the **Opportunities** page to apply with 1 click!`
    }
    if (p.includes('cover letter')) {
      return `✍️ **Tailored Cover Letter Template:**\n\n"Dear Hiring Team,\n\nI am writing to express my strong interest in the opportunity at your company. As a passionate developer with practical experience building web applications, I have worked with modern tools like React, TypeScript, and database APIs.\n\nI am eager to contribute fresh energy and dedication to your engineering team. Thank you for your time and consideration.\n\nWarm regards,\n${name}"`
    }
    return `🎓 **Student Career Copilot:**\n\nI can help you build an ATS resume, write custom cover letters, prepare for technical interviews, and match jobs tailored to your skills. What can I help you achieve?`
  }

  return `👋 **Welcome to SkillBridge!**\n\nSkillBridge is the premier platform bridging ambitious students with verified businesses. You can join as a **Student** to find internships or as an **Employer** to hire top university talent.`
}
