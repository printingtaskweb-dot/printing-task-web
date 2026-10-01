/**
 * Standard Categories and Skills taxonomy for SkillBridge
 * Provides robust fallbacks and self-healing when DB tables are empty
 */

export interface BuiltinCategory {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  sort_order: number
  skills: Array<{ id: string; name: string; slug: string }>
}

export const BUILTIN_CATEGORIES: BuiltinCategory[] = [
  {
    id: 'cat-dev',
    name: 'Software & Web Development',
    slug: 'software-web-development',
    description: 'Frontend, Backend, Full Stack, Mobile Apps & Cloud Engineering',
    icon: '💻',
    color: '#2563eb',
    sort_order: 1,
    skills: [
      { id: 'sk-react', name: 'React.js', slug: 'react-js' },
      { id: 'sk-ts', name: 'TypeScript', slug: 'typescript' },
      { id: 'sk-node', name: 'Node.js', slug: 'node-js' },
      { id: 'sk-py', name: 'Python', slug: 'python' },
      { id: 'sk-next', name: 'Next.js', slug: 'next-js' },
      { id: 'sk-tailwind', name: 'Tailwind CSS', slug: 'tailwind-css' },
      { id: 'sk-sql', name: 'PostgreSQL / SQL', slug: 'postgresql-sql' },
      { id: 'sk-flutter', name: 'Flutter / React Native', slug: 'flutter-react-native' },
      { id: 'sk-git', name: 'Git & GitHub', slug: 'git-github' },
      { id: 'sk-docker', name: 'Docker & DevOps', slug: 'docker-devops' },
    ],
  },
  {
    id: 'cat-design',
    name: 'UI/UX & Graphic Design',
    slug: 'ui-ux-design',
    description: 'User Interfaces, Mobile Design, Prototyping, Branding & 3D',
    icon: '🎨',
    color: '#8b5cf6',
    sort_order: 2,
    skills: [
      { id: 'sk-figma', name: 'Figma', slug: 'figma' },
      { id: 'sk-wireframing', name: 'Wireframing & Prototyping', slug: 'wireframing' },
      { id: 'sk-photoshop', name: 'Adobe Photoshop', slug: 'adobe-photoshop' },
      { id: 'sk-illustrator', name: 'Adobe Illustrator', slug: 'adobe-illustrator' },
      { id: 'sk-designsystems', name: 'Design Systems', slug: 'design-systems' },
      { id: 'sk-uxresearch', name: 'User Research', slug: 'user-research' },
      { id: 'sk-3d', name: 'Blender / 3D Design', slug: 'blender-3d' },
    ],
  },
  {
    id: 'cat-marketing',
    name: 'Digital Marketing & Growth',
    slug: 'digital-marketing-growth',
    description: 'Social Media Management, SEO, Content Marketing & Paid Ads',
    icon: '📈',
    color: '#10b981',
    sort_order: 3,
    skills: [
      { id: 'sk-socialmedia', name: 'Social Media Marketing', slug: 'social-media' },
      { id: 'sk-seo', name: 'SEO & Keyword Strategy', slug: 'seo' },
      { id: 'sk-copywriting', name: 'Copywriting & Content', slug: 'copywriting' },
      { id: 'sk-googleads', name: 'Google & Meta Ads', slug: 'google-meta-ads' },
      { id: 'sk-emailmktg', name: 'Email Campaigns & Funnels', slug: 'email-campaigns' },
      { id: 'sk-growth', name: 'Growth Hacking', slug: 'growth-hacking' },
    ],
  },
  {
    id: 'cat-video',
    name: 'Video Editing & Media Creation',
    slug: 'video-editing-media',
    description: 'Shorts, Reels, YouTube Videos, Motion Graphics & Podcasting',
    icon: '🎬',
    color: '#ef4444',
    sort_order: 4,
    skills: [
      { id: 'sk-premiere', name: 'Adobe Premiere Pro', slug: 'adobe-premiere' },
      { id: 'sk-aftereffects', name: 'Adobe After Effects', slug: 'after-effects' },
      { id: 'sk-capcut', name: 'CapCut / Reels Editing', slug: 'capcut-reels' },
      { id: 'sk-colorgrading', name: 'Color Grading & Sound', slug: 'color-grading' },
      { id: 'sk-motiongraphics', name: 'Motion Graphics', slug: 'motion-graphics' },
      { id: 'sk-thumbnail', name: 'Thumbnail Design', slug: 'thumbnail-design' },
    ],
  },
  {
    id: 'cat-ai-data',
    name: 'Data Science & AI / ML',
    slug: 'data-science-ai-ml',
    description: 'Data Analytics, LLM Prompt Engineering, Python, Machine Learning',
    icon: '🤖',
    color: '#06b6d4',
    sort_order: 5,
    skills: [
      { id: 'sk-pandas', name: 'Python & Pandas', slug: 'python-pandas' },
      { id: 'sk-dataviz', name: 'Data Visualization & PowerBI', slug: 'data-visualization' },
      { id: 'sk-prompteng', name: 'Prompt Engineering & LLMs', slug: 'prompt-engineering' },
      { id: 'sk-ml', name: 'Machine Learning Basics', slug: 'machine-learning' },
      { id: 'sk-scikit', name: 'Scikit-Learn / PyTorch', slug: 'scikit-learn' },
      { id: 'sk-webscraping', name: 'Web Scraping & APIs', slug: 'web-scraping' },
    ],
  },
  {
    id: 'cat-business',
    name: 'Finance, Sales & Business Dev',
    slug: 'finance-sales-business',
    description: 'Financial Modeling, Pitch Decks, B2B Sales & Lead Generation',
    icon: '💼',
    color: '#f59e0b',
    sort_order: 6,
    skills: [
      { id: 'sk-b2bsales', name: 'B2B Sales & Outreach', slug: 'b2b-sales' },
      { id: 'sk-financialmod', name: 'Financial Modeling & Excel', slug: 'financial-modeling' },
      { id: 'sk-marketresearch', name: 'Market & Competitive Research', slug: 'market-research' },
      { id: 'sk-crm', name: 'CRM (HubSpot / Salesforce)', slug: 'crm-hubspot' },
      { id: 'sk-pitchdeck', name: 'Pitch Decks & Presentations', slug: 'pitch-decks' },
    ],
  },
  {
    id: 'cat-writing',
    name: 'Content & Technical Writing',
    slug: 'content-technical-writing',
    description: 'Tech Articles, Documentation, Research & Academic Papers',
    icon: '✍️',
    color: '#6366f1',
    sort_order: 7,
    skills: [
      { id: 'sk-techwriting', name: 'Technical Documentation', slug: 'technical-doc' },
      { id: 'sk-blogging', name: 'SEO Article & Blog Writing', slug: 'blog-writing' },
      { id: 'sk-researchpaper', name: 'Research Paper Formatting', slug: 'research-papers' },
      { id: 'sk-ghostwriting', name: 'Ghostwriting & Newsletters', slug: 'ghostwriting' },
    ],
  },
  {
    id: 'cat-admin',
    name: 'Computer Operations & Admin',
    slug: 'computer-operations-admin',
    description: 'Advanced Excel, Virtual Assistance, Data Management & Operations',
    icon: '⌨️',
    color: '#64748b',
    sort_order: 8,
    skills: [
      { id: 'sk-exceladv', name: 'Advanced MS Excel & Sheets', slug: 'advanced-excel' },
      { id: 'sk-dataentry', name: 'Data Management & Entry', slug: 'data-entry' },
      { id: 'sk-va', name: 'Virtual Assistance', slug: 'virtual-assistance' },
      { id: 'sk-notion', name: 'Notion & Workspace Organization', slug: 'notion-setup' },
    ],
  },
]

/**
 * Returns all built-in categories formatted for select boxes and grid views
 */
export function getAvailableCategories(dbCategories?: any[]) {
  if (dbCategories && dbCategories.length > 0) {
    return dbCategories
  }
  return BUILTIN_CATEGORIES
}

/**
 * Returns all skills for a specific category or all categories
 */
export function getAvailableSkills(categoryId?: string, dbSkills?: any[]) {
  if (dbSkills && dbSkills.length > 0) {
    if (!categoryId) return dbSkills
    return dbSkills.filter(s => s.category_id === categoryId)
  }

  if (categoryId) {
    const found = BUILTIN_CATEGORIES.find(c => c.id === categoryId || c.slug === categoryId || c.name.toLowerCase().includes(categoryId.toLowerCase()))
    return found ? found.skills : BUILTIN_CATEGORIES.flatMap(c => c.skills)
  }

  return BUILTIN_CATEGORIES.flatMap(c => c.skills)
}
