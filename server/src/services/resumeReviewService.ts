import {
  maxJobDescriptionLength,
  maxResumeBytes,
  resumeExperienceLevels,
  resumeRoles,
  type ResumeImprovement,
  type ResumeReview,
} from '../../../shared/resumeReview.js'
import { HttpError } from '../utils/httpError.js'
import { parseJsonObject } from './aiResponseParsing.js'
import { computeAtsScore, normalize, verdictFor, yearsForLevel, type EducationLevel, type Keyword } from './atsScore.js'
import { generateJsonFromPdf, type JsonSchema } from './claudeService.js'

const str = { type: 'string' }
const strList = { type: 'array', items: str }
const eduEnum = { type: 'string', enum: ['none', 'diploma', 'bachelor', 'master', 'phd'] }

/**
 * Claude extracts facts and writes advice; it does NOT score. The score is computed in atsScore.ts.
 */
export const resumeReviewSchema: JsonSchema = {
  type: 'object',
  properties: {
    isResume: { type: 'boolean', description: 'False if the document is clearly not a resume.' },
    resumeText: {
      ...str,
      description:
        'The full text of the resume, copied word for word in reading order, one line per line of the resume (keep section headings on their own line). Do not summarise, fix or add anything. If a part is only an image, leave it out.',
    },
    jobTitle: { ...str, description: 'The job title being hired for: from the job description if given, else the target role in its most common form, e.g. "Frontend Engineer".' },
    titleAliases: { ...strList, description: 'Up to 4 common variants of the job title, e.g. "Frontend Developer", "UI Engineer".' },
    keywords: {
      type: 'array',
      description:
        'The skills an ATS would search for. With a job description: ONLY skills written in it (12–25), marked required if the JD says required/must/minimum or lists it under requirements, else preferred. Without one: the 15–20 skills most often required for this role and level. One entry per skill; use the specific name (e.g. "Golang", not "Go"). Do not look at the resume when choosing these.',
      items: {
        type: 'object',
        properties: {
          term: str,
          aliases: { ...strList, description: 'Other spellings that mean the same skill, e.g. ["JS", "ECMAScript"] for JavaScript, ["Node", "NodeJS"] for Node.js.' },
          type: { type: 'string', enum: ['hard', 'soft'] },
          importance: { type: 'string', enum: ['required', 'preferred'] },
        },
        required: ['term', 'aliases', 'type', 'importance'],
      },
    },
    requiredYears: { type: ['number', 'null'], description: 'Minimum years of experience the job description asks for, or null if it does not say or there is no job description.' },
    candidateYears: { type: 'number', description: 'Total years of full-time professional experience from the dates on the resume (internships count half). Round to one decimal.' },
    educationRequired: { ...eduEnum, description: 'Minimum degree the job description asks for; "none" if not stated or no job description.' },
    candidateEducation: { ...eduEnum, description: 'Highest degree on the resume.' },
    atsIssues: { ...strList, description: 'Real layout problems an ATS parser would trip on: tables, multiple columns, text in images, icons for contact info, text in headers/footers, unusual section headings. Empty if none.' },
    summary: { ...str, description: '2–3 sentences on how a recruiter would see this resume for this job.' },
    strengths: { ...strList, description: '3–5 concrete strengths.' },
    improvements: {
      type: 'array',
      description: '4–6 actionable fixes, most important first.',
      items: {
        type: 'object',
        properties: { priority: { type: 'string', enum: ['high', 'medium', 'low'] }, issue: str, fix: str },
        required: ['priority', 'issue', 'fix'],
      },
    },
    rewrites: {
      type: 'array',
      description: '2–3 weak bullets from the resume rewritten with action + scope + result. Never invent numbers: use placeholders like [X%].',
      items: { type: 'object', properties: { before: str, after: str }, required: ['before', 'after'] },
    },
  },
  required: [
    'isResume',
    'resumeText',
    'jobTitle',
    'titleAliases',
    'keywords',
    'requiredYears',
    'candidateYears',
    'educationRequired',
    'candidateEducation',
    'atsIssues',
    'summary',
    'strengths',
    'improvements',
    'rewrites',
  ],
}

const SYSTEM_PROMPT = `You are an ATS (applicant tracking system) parser and an expert technical recruiter.
Your job is to extract facts from a resume PDF and a job description accurately; a separate program computes the score from your facts, so do not score anything.
Copy the resume text exactly. Choose keywords from the job description only (or, without one, from typical requirements for the role), never from the resume.
Be specific and honest in the advice: point to real lines, and never invent experience, employers, metrics or skills.`

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const list = (value: unknown, max: number) => (Array.isArray(value) ? value.map(text).filter(Boolean).slice(0, max) : [])
const num = (value: unknown) => {
  const n = typeof value === 'string' ? Number(value) : value
  return typeof n === 'number' && Number.isFinite(n) && n >= 0 ? n : null
}
const edu = (value: unknown): EducationLevel => (['none', 'diploma', 'bachelor', 'master', 'phd'].includes(String(value)) ? (value as EducationLevel) : 'none')
const objects = (value: unknown) => (Array.isArray(value) ? value.map((s) => (s && typeof s === 'object' ? (s as Record<string, unknown>) : {})) : [])

export function parseKeywords(value: unknown): Keyword[] {
  const seen = new Set<string>()
  return objects(value)
    .map((k) => ({
      term: text(k.term),
      aliases: list(k.aliases, 6),
      type: (k.type === 'soft' ? 'soft' : 'hard') as Keyword['type'],
      importance: (k.importance === 'preferred' ? 'preferred' : 'required') as Keyword['importance'],
    }))
    .filter((k) => {
      const key = normalize(k.term)
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 30)
}

export function parseResumeReview(raw: string, context: { experience: string; hasJobDescription: boolean }): ResumeReview {
  const data = parseJsonObject(raw)
  if (!data) throw new HttpError(502, 'Could not read the review. Please try again.')

  const improvements: ResumeImprovement[] = objects(data.improvements)
    .map((s) => ({
      priority: (['high', 'medium', 'low'].includes(String(s.priority)) ? s.priority : 'medium') as ResumeImprovement['priority'],
      issue: text(s.issue),
      fix: text(s.fix),
    }))
    .filter((s) => s.issue || s.fix)
    .slice(0, 8)
  const rewrites = objects(data.rewrites)
    .map((s) => ({ before: text(s.before), after: text(s.after) }))
    .filter((s) => s.before && s.after)
    .slice(0, 4)
  const atsIssues = list(data.atsIssues, 10)
  const resumeText = typeof data.resumeText === 'string' ? data.resumeText : ''

  const result = computeAtsScore({
    resumeText,
    keywords: parseKeywords(data.keywords),
    jobTitle: text(data.jobTitle),
    titleAliases: list(data.titleAliases, 4),
    requiredYears: num(data.requiredYears) ?? yearsForLevel(context.experience),
    candidateYears: num(data.candidateYears) ?? 0,
    educationRequired: context.hasJobDescription ? edu(data.educationRequired) : 'none',
    candidateEducation: edu(data.candidateEducation),
    parsingIssues: atsIssues.length,
  })

  const notResume = data.isResume === false
  return {
    atsScore: notResume ? 0 : result.atsScore,
    verdict: notResume ? 'This does not look like a resume' : verdictFor(result.atsScore),
    summary: text(data.summary),
    jdMatch: context.hasJobDescription && !notResume ? result.keywordMatch : null,
    sections: result.sections,
    matchedKeywords: result.matchedKeywords,
    missingKeywords: result.missingKeywords,
    atsIssues,
    strengths: list(data.strengths, 6),
    improvements,
    rewrites,
    checks: result.checks,
    keywordSource: context.hasJobDescription ? 'job description' : 'role',
  }
}

export type ResumeReviewInput = { role?: unknown; experience?: unknown; jobDescription?: unknown; resumeBase64?: unknown }

export function validateResumeReviewInput(input: ResumeReviewInput) {
  const role = text(input.role)
  const experience = text(input.experience)
  const jobDescription = text(input.jobDescription)
  const resumeBase64 = typeof input.resumeBase64 === 'string' ? input.resumeBase64.replace(/^data:application\/pdf;base64,/, '') : ''

  if (!(resumeRoles as readonly string[]).includes(role)) throw new HttpError(400, 'Choose a target role.')
  if (!(resumeExperienceLevels as readonly string[]).includes(experience)) throw new HttpError(400, 'Choose an experience level.')
  if (jobDescription.length > maxJobDescriptionLength) throw new HttpError(400, `The job description is too long (max ${maxJobDescriptionLength} characters).`)
  if (!resumeBase64) throw new HttpError(400, 'Upload your resume as a PDF.')
  // "%PDF" encodes to "JVBER" in base64.
  if (!resumeBase64.startsWith('JVBER')) throw new HttpError(400, 'That file is not a PDF. Please upload your resume as a PDF.')
  if (Math.floor((resumeBase64.length * 3) / 4) > maxResumeBytes) throw new HttpError(413, 'The PDF is too large (max 3 MB).')

  return { role, experience, jobDescription, resumeBase64 }
}

export async function reviewResume(input: ResumeReviewInput): Promise<ResumeReview> {
  const { role, experience, jobDescription, resumeBase64 } = validateResumeReviewInput(input)
  const prompt = [
    `Target role: ${role}`,
    `Experience level: ${experience}`,
    jobDescription ? `Job description:\n"""\n${jobDescription}\n"""` : 'No job description was given.',
    'Extract the facts from the attached resume and return them with your advice.',
  ].join('\n\n')
  const raw = await generateJsonFromPdf(SYSTEM_PROMPT, resumeBase64, prompt, resumeReviewSchema, 10_000)
  return parseResumeReview(raw, { experience, hasJobDescription: Boolean(jobDescription) })
}
