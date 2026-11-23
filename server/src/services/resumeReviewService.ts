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
import { generateJsonFromPdf, type JsonSchema } from './claudeService.js'

const str = { type: 'string' }
const strList = { type: 'array', items: str }
const score = { type: 'integer', minimum: 0, maximum: 100 }

export const resumeReviewSchema: JsonSchema = {
  type: 'object',
  properties: {
    atsScore: { ...score, description: 'Overall ATS readiness for this role and level, 0–100.' },
    verdict: { ...str, description: 'One short line, e.g. "Strong match — fix 3 things before applying".' },
    summary: { ...str, description: '2–3 sentences on how a recruiter and an ATS would see this resume.' },
    jdMatch: { type: ['integer', 'null'], minimum: 0, maximum: 100, description: 'Match with the job description, or null if none was given.' },
    sections: {
      type: 'array',
      description: 'Exactly these six, in this order: ATS formatting, Keywords & skills, Impact & metrics, Experience relevance, Structure & sections, Clarity & language.',
      items: { type: 'object', properties: { name: str, score, feedback: { ...str, description: 'One or two specific sentences.' } }, required: ['name', 'score', 'feedback'] },
    },
    matchedKeywords: { ...strList, description: 'Important role/JD keywords the resume already has (max 15).' },
    missingKeywords: { ...strList, description: 'Important keywords that are missing and would be honest to add if true (max 15).' },
    atsIssues: { ...strList, description: 'Parsing problems: tables, columns, images, icons, headers/footers, unusual headings, file issues. Empty if none.' },
    strengths: { ...strList, description: '3–5 concrete strengths.' },
    improvements: {
      type: 'array',
      description: '4–8 actionable fixes, most important first.',
      items: {
        type: 'object',
        properties: { priority: { type: 'string', enum: ['high', 'medium', 'low'] }, issue: str, fix: str },
        required: ['priority', 'issue', 'fix'],
      },
    },
    rewrites: {
      type: 'array',
      description: '2–4 weak bullets from the resume rewritten with action + scope + result. Never invent numbers: use placeholders like [X%] where a metric is needed.',
      items: { type: 'object', properties: { before: str, after: str }, required: ['before', 'after'] },
    },
  },
  required: ['atsScore', 'verdict', 'summary', 'jdMatch', 'sections', 'matchedKeywords', 'missingKeywords', 'atsIssues', 'strengths', 'improvements', 'rewrites'],
}

const SYSTEM_PROMPT = `You are an expert technical recruiter and ATS (applicant tracking system) specialist reviewing a resume PDF.
Judge it for the given target role and experience level, the way an ATS parser and a busy recruiter would.
Be specific and honest: quote or point to real lines from the resume, and never invent experience, employers, metrics or skills.
Scores: 85+ = ready to send, 70–84 = good with fixes, 50–69 = needs work, below 50 = major rework.
If a job description is given, weigh keyword and requirement overlap with it heavily and fill jdMatch; otherwise set jdMatch to null and use typical requirements for the role.
If the document is clearly not a resume, give atsScore 0 and say so in the verdict.`

const clamp = (value: unknown) => {
  const n = typeof value === 'string' ? Number(value) : value
  return typeof n === 'number' && Number.isFinite(n) ? Math.round(Math.min(100, Math.max(0, n))) : 0
}
const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const list = (value: unknown, max: number) => (Array.isArray(value) ? value.map(text).filter(Boolean).slice(0, max) : [])

export function parseResumeReview(raw: string): ResumeReview {
  const data = parseJsonObject(raw)
  if (!data) throw new HttpError(502, 'Could not read the review. Please try again.')
  const sections = Array.isArray(data.sections)
    ? data.sections
        .map((s) => (s && typeof s === 'object' ? (s as Record<string, unknown>) : {}))
        .map((s) => ({ name: text(s.name), score: clamp(s.score), feedback: text(s.feedback) }))
        .filter((s) => s.name)
        .slice(0, 8)
    : []
  const improvements: ResumeImprovement[] = Array.isArray(data.improvements)
    ? data.improvements
        .map((s) => (s && typeof s === 'object' ? (s as Record<string, unknown>) : {}))
        .map((s) => ({
          priority: (['high', 'medium', 'low'].includes(String(s.priority)) ? s.priority : 'medium') as ResumeImprovement['priority'],
          issue: text(s.issue),
          fix: text(s.fix),
        }))
        .filter((s) => s.issue || s.fix)
        .slice(0, 10)
    : []
  const rewrites = Array.isArray(data.rewrites)
    ? data.rewrites
        .map((s) => (s && typeof s === 'object' ? (s as Record<string, unknown>) : {}))
        .map((s) => ({ before: text(s.before), after: text(s.after) }))
        .filter((s) => s.before && s.after)
        .slice(0, 5)
    : []
  return {
    atsScore: clamp(data.atsScore),
    verdict: text(data.verdict),
    summary: text(data.summary),
    jdMatch: data.jdMatch === null || data.jdMatch === undefined ? null : clamp(data.jdMatch),
    sections,
    matchedKeywords: list(data.matchedKeywords, 20),
    missingKeywords: list(data.missingKeywords, 20),
    atsIssues: list(data.atsIssues, 10),
    strengths: list(data.strengths, 6),
    improvements,
    rewrites,
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
    'Review the attached resume and return the report.',
  ].join('\n\n')
  return parseResumeReview(await generateJsonFromPdf(SYSTEM_PROMPT, resumeBase64, prompt, resumeReviewSchema))
}
