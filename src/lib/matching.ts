import type { JobWithDetails, StudentWithDetails, MatchScore } from '@/types'

const WEIGHTS = {
  SKILL_MATCH: 50,
  CATEGORY_MATCH: 25,
  EXPERIENCE_MATCH: 15,
  LOCATION_MATCH: 10,
}

export function calculateJobMatchScore(
  student: StudentWithDetails,
  job: JobWithDetails
): MatchScore {
  const studentSkillIds = (student.student_skills || []).map(ss => ss.skill_id)
  const studentCategoryId = student.primary_category_id

  const jobSkillIds = (job.job_skills || []).filter(js => js.is_required).map(js => js.skill_id)
  const jobOptionalSkillIds = (job.job_skills || []).filter(js => !js.is_required).map(js => js.skill_id)

  // Skill matching
  const matchedRequiredSkills = jobSkillIds.filter(id => studentSkillIds.includes(id))
  const matchedOptionalSkills = jobOptionalSkillIds.filter(id => studentSkillIds.includes(id))
  const matchedSkillNames = (job.job_skills || [])
    .filter(js => studentSkillIds.includes(js.skill_id))
    .map(js => js.skills?.name || '')
    .filter(Boolean)

  let skillScore = 0
  if (jobSkillIds.length > 0) {
    skillScore = (matchedRequiredSkills.length / jobSkillIds.length) * 100
  } else if (matchedOptionalSkills.length > 0) {
    skillScore = Math.min((matchedOptionalSkills.length / Math.max(jobOptionalSkillIds.length, 1)) * 100, 100)
  }

  // Category matching
  const jobCategories = (job.job_skills || []).map(js => js.skills?.category_id).filter(Boolean)
  const studentSkillCategories = (student.student_skills || []).map(ss => {
    const skill = ss.skills as { category_id?: string } | undefined
    return skill?.category_id
  }).filter(Boolean)

  let categoryScore = 0
  const matchedCategories: string[] = []
  if (studentCategoryId && jobCategories.includes(studentCategoryId)) {
    categoryScore = 100
    matchedCategories.push(studentCategoryId)
  } else {
    const categoryOverlap = studentSkillCategories.filter(c => jobCategories.includes(c))
    if (categoryOverlap.length > 0) {
      categoryScore = 60
      matchedCategories.push(...categoryOverlap as string[])
    }
  }

  // Experience matching
  let experienceScore = 0
  if (job.experience_level && student.experience_level) {
    const levels = ['fresher', 'less_than_1_year', '1_2_years', '2_5_years', '5_plus_years']
    const studentIdx = levels.indexOf(student.experience_level)
    const jobIdx = levels.indexOf(job.experience_level)
    const diff = Math.abs(studentIdx - jobIdx)
    if (diff === 0) experienceScore = 100
    else if (diff === 1) experienceScore = 70
    else if (diff === 2) experienceScore = 40
    else experienceScore = 10
  } else {
    experienceScore = 50 // neutral if not specified
  }

  // Location matching
  let locationScore = 0
  if (job.work_mode === 'remote') {
    locationScore = 100
  } else if (student.location && job.location) {
    const studentLoc = student.location.toLowerCase()
    const jobLoc = job.location.toLowerCase()
    if (studentLoc === jobLoc) locationScore = 100
    else if (studentLoc.includes(jobLoc) || jobLoc.includes(studentLoc)) locationScore = 70
    else locationScore = 20
  } else {
    locationScore = 50
  }

  const total = Math.round(
    (skillScore * WEIGHTS.SKILL_MATCH +
    categoryScore * WEIGHTS.CATEGORY_MATCH +
    experienceScore * WEIGHTS.EXPERIENCE_MATCH +
    locationScore * WEIGHTS.LOCATION_MATCH) / 100
  )

  return {
    total: Math.min(total, 100),
    skill_match: Math.round(skillScore),
    category_match: Math.round(categoryScore),
    experience_match: Math.round(experienceScore),
    location_match: Math.round(locationScore),
    breakdown: {
      matched_skills: matchedSkillNames,
      matched_categories: matchedCategories as string[],
    },
  }
}

export function calculateStudentMatchScore(
  student: StudentWithDetails,
  jobSkillIds: string[],
  jobCategoryId?: string,
  requiredExperience?: string,
  workMode?: string,
  jobLocation?: string
): number {
  const mockJob = {
    job_skills: jobSkillIds.map(id => ({ skill_id: id, is_required: true, skills: undefined })),
    experience_level: requiredExperience as JobWithDetails['experience_level'],
    work_mode: (workMode || 'on_site') as JobWithDetails['work_mode'],
    location: jobLocation,
  } as JobWithDetails

  return calculateJobMatchScore(student, mockJob).total
}
