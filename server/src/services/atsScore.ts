/**
 * Deterministic ATS score, modelled on how match-rate tools such as Jobscan and Resume Worded score a resume:
 * keywords from the job description are matched against the resume text, hard skills count far more than soft
 * skills, required skills more than preferred ones, and job title, years of experience, education and basic
 * searchability (contact details, standard headings, readable text) make up the rest.
 *
 * Claude only extracts facts (the resume text, the keyword list, years, degrees). Every point is computed here,
 * so the same resume and job description always get the same score, and every point can be explained.
 */
import type { ResumeCheck, ResumeSectionScore } from '../../../shared/resumeReview.js'

export type Keyword = { term: string; aliases: string[]; type: 'hard' | 'soft'; importance: 'required' | 'preferred' }
export type EducationLevel = 'none' | 'diploma' | 'bachelor' | 'master' | 'phd'

export type AtsFacts = {
  resumeText: string
  keywords: Keyword[]
  jobTitle: string
  titleAliases: string[]
  requiredYears: number
  candidateYears: number
  educationRequired: EducationLevel
  candidateEducation: EducationLevel
  parsingIssues: number
}

export const weights = { hard: 45, soft: 10, title: 10, experience: 10, education: 5, format: 20 } as const

const educationRank: Record<EducationLevel, number> = { none: 0, diploma: 1, bachelor: 2, master: 3, phd: 4 }

/** Lower-case, and turn everything except letters, digits and + # . into spaces ("CI/CD" → "ci cd"). */
export const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Whole-word match, allowing a plural "s" ("API" matches "APIs"); a trailing full stop does not block a match. */
export function containsTerm(normalizedText: string, term: string) {
  const t = normalize(term).replace(/\.+$/, '')
  if (!t) return false
  return new RegExp(`(?<![a-z0-9+#])${escape(t)}(?:e?s)?(?![a-z0-9+#])`).test(normalizedText)
}

export const keywordFound = (normalizedText: string, keyword: Keyword) =>
  [keyword.term, ...keyword.aliases].some((term) => containsTerm(normalizedText, term))

const keywordWeight = (k: Keyword) => (k.importance === 'required' ? 2 : 1)

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 100)

function keywordPart(name: string, text: string, keywords: Keyword[], max: number, noun: string): ResumeSectionScore & { found: Keyword[]; missing: Keyword[] } {
  const found = keywords.filter((k) => keywordFound(text, k))
  const missing = keywords.filter((k) => !found.includes(k))
  const total = keywords.reduce((sum, k) => sum + keywordWeight(k), 0)
  const got = found.reduce((sum, k) => sum + keywordWeight(k), 0)
  const score = pct(got, total)
  const requiredMissing = missing.filter((k) => k.importance === 'required').length
  const feedback = keywords.length
    ? `${found.length} of ${keywords.length} ${noun} found${requiredMissing ? `; ${requiredMissing} required one${requiredMissing > 1 ? 's are' : ' is'} missing` : ''}. Required skills count double.`
    : `No ${noun} to check.`
  return { name, score, feedback, points: round1((score / 100) * max), max, found, missing }
}

const round1 = (n: number) => Math.round(n * 10) / 10

const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i
const PHONE = /(\+?\d[\d\s().-]{8,}\d)/
const heading = (text: string, words: string[]) => words.some((w) => new RegExp(`(^|\\n)\\s*${w}\\b`, 'im').test(text))
const METRIC = /(\d+(\.\d+)?\s?(%|x\b|k\b|m\b|ms\b|s\b|\+|lakh|cr\b|users|bookings|customers))|(\b\d{2,}\b)/gi

export function formattingChecks(resumeText: string, parsingIssues: number): ResumeCheck[] {
  const words = resumeText.split(/\s+/).filter(Boolean).length
  const metrics = resumeText.match(METRIC)?.length ?? 0
  return [
    { label: 'Text can be read by a parser (not an image-only PDF)', ok: words >= 150 },
    { label: 'Email address found', ok: EMAIL.test(resumeText) },
    { label: 'Phone number found', ok: PHONE.test(resumeText) },
    { label: 'Standard "Experience" heading', ok: heading(resumeText, ['experience', 'work experience', 'professional experience', 'employment', 'work history']) },
    { label: 'Standard "Education" heading', ok: heading(resumeText, ['education', 'academic', 'qualifications']) },
    { label: 'Standard "Skills" heading', ok: heading(resumeText, ['skills', 'technical skills', 'core skills', 'tech stack', 'technologies']) },
    { label: 'No layout parsing problems (tables, columns, icons, headers)', ok: parsingIssues === 0 },
    { label: 'At least 5 measurable results (numbers, %)', ok: metrics >= 5 },
    { label: 'Length between 350 and 1,000 words', ok: words >= 350 && words <= 1000 },
  ]
}

const checkPoints: number[] = [4, 2, 2, 2, 2, 2, 3, 2, 1] // sums to weights.format (20)

export function computeAtsScore(facts: AtsFacts) {
  const text = normalize(facts.resumeText)
  const hard = keywordPart('Hard skills', text, facts.keywords.filter((k) => k.type === 'hard'), weights.hard, 'hard skills')
  const soft = keywordPart('Soft skills', text, facts.keywords.filter((k) => k.type === 'soft'), weights.soft, 'soft skills')

  const titleHit = [facts.jobTitle, ...facts.titleAliases].some((t) => t.trim() && containsTerm(text, t))
  const title: ResumeSectionScore = {
    name: 'Job title',
    score: titleHit ? 100 : 0,
    feedback: titleHit ? `"${facts.jobTitle}" (or a close variant) appears on the resume.` : `"${facts.jobTitle}" does not appear; recruiters search by title, so use it in your headline if it is true.`,
    points: titleHit ? weights.title : 0,
    max: weights.title,
  }

  const req = Math.max(0, facts.requiredYears)
  const have = Math.max(0, facts.candidateYears)
  const expScore = req === 0 ? 100 : Math.min(100, Math.round((have / req) * 100))
  const experience: ResumeSectionScore = {
    name: 'Years of experience',
    score: expScore,
    feedback: req === 0 ? 'No minimum experience asked for.' : `About ${round1(have)} yrs on the resume vs ${req} yrs asked for.`,
    points: round1((expScore / 100) * weights.experience),
    max: weights.experience,
  }

  const eduOk = educationRank[facts.candidateEducation] >= educationRank[facts.educationRequired]
  const education: ResumeSectionScore = {
    name: 'Education',
    score: eduOk ? 100 : 0,
    feedback: facts.educationRequired === 'none' ? 'No degree requirement.' : eduOk ? `Meets the ${facts.educationRequired} requirement.` : `Asks for a ${facts.educationRequired} degree, which the resume does not show.`,
    points: eduOk ? weights.education : 0,
    max: weights.education,
  }

  const checks = formattingChecks(facts.resumeText, facts.parsingIssues)
  const formatPoints = checks.reduce((sum, c, i) => sum + (c.ok ? checkPoints[i] : 0), 0)
  const failed = checks.filter((c) => !c.ok).length
  const format: ResumeSectionScore = {
    name: 'Formatting & searchability',
    score: pct(formatPoints, weights.format),
    feedback: failed ? `${checks.length - failed} of ${checks.length} checks passed; see the checklist below.` : `All ${checks.length} checks passed.`,
    points: formatPoints,
    max: weights.format,
  }

  const parts = [hard, soft, title, experience, education, format]
  const total = Math.round(parts.reduce((sum, p) => sum + (p.points ?? 0), 0))
  // Keyword match alone, the number match-rate tools show as "match rate".
  const keywordMatch = Math.round(((hard.points ?? 0) + (soft.points ?? 0)) / ((weights.hard + weights.soft) / 100))

  const order = (list: Keyword[]) => [...list].sort((a, b) => keywordWeight(b) - keywordWeight(a) || (a.type === 'hard' ? -1 : 1)).map((k) => k.term)
  return {
    atsScore: Math.min(100, Math.max(0, total)),
    keywordMatch,
    sections: parts.map(({ name, score, feedback, points, max }) => ({ name, score, feedback, points, max })),
    matchedKeywords: order([...hard.found, ...soft.found]),
    missingKeywords: order([...hard.missing, ...soft.missing]),
    checks,
  }
}

export function verdictFor(score: number) {
  if (score >= 85) return 'Strong match: ready to send'
  if (score >= 70) return 'Good match: a few fixes will lift it'
  if (score >= 50) return 'Partial match: needs tailoring before you apply'
  return 'Weak match: major rework needed for this role'
}

/** Minimum years implied by the level picked in the form, used when there is no job description. */
export function yearsForLevel(level: string) {
  const m = level.match(/(\d+)\s*[–-]|(\d+)\+/)
  return m ? Number(m[1] ?? m[2]) : 0
}
