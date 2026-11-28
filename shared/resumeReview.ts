// Shared between the resume ATS page and the API, so both agree on options and the report shape.

export const resumeRoles = [
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Engineer',
  'Mobile Engineer (React Native / Android / iOS)',
  'Software Engineer (General / SDE)',
  'DevOps / SRE',
  'Data Engineer',
  'Data Scientist / ML Engineer',
  'QA / SDET',
  'UI / UX Designer',
  'Product Manager',
] as const

export const resumeExperienceLevels = [
  'Fresher / Intern (0–1 yrs)',
  'Junior (1–3 yrs)',
  'Mid-level (3–5 yrs)',
  'Senior (5–8 yrs)',
  'Staff / Lead (8+ yrs)',
] as const

/** Base64 of a 3 MB PDF is ~4 MB, which stays below Vercel's 4.5 MB request cap. */
export const maxResumeBytes = 3 * 1024 * 1024
export const maxJobDescriptionLength = 12_000

/** One part of the score. `score` is 0–100 within the part; `points` out of `max` is what it adds to the total. */
export type ResumeSectionScore = { name: string; score: number; feedback: string; points?: number; max?: number }
export type ResumeCheck = { label: string; ok: boolean }
export type ResumeImprovement = { priority: 'high' | 'medium' | 'low'; issue: string; fix: string }
export type ResumeRewrite = { before: string; after: string }

export type ResumeReview = {
  atsScore: number
  verdict: string
  summary: string
  jdMatch: number | null
  sections: ResumeSectionScore[]
  matchedKeywords: string[]
  missingKeywords: string[]
  atsIssues: string[]
  strengths: string[]
  improvements: ResumeImprovement[]
  rewrites: ResumeRewrite[]
  /** Formatting and searchability checks run in code on the resume text. */
  checks?: ResumeCheck[]
  /** Where the keywords came from. */
  keywordSource?: 'job description' | 'role'
}
