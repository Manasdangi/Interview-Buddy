import { describe, expect, it } from 'vitest'
import { containsTerm, formattingChecks, normalize, yearsForLevel } from './atsScore.js'
import { parseResumeReview, validateResumeReviewInput } from './resumeReviewService.js'

const pdf = Buffer.from('%PDF-1.4 fake').toString('base64')
const base = { role: 'Frontend Engineer', experience: 'Mid-level (3–5 yrs)', resumeBase64: pdf }

describe('validateResumeReviewInput', () => {
  it('accepts a PDF with a known role and level', () => {
    expect(validateResumeReviewInput(base).role).toBe('Frontend Engineer')
  })
  it('strips a data URL prefix', () => {
    expect(validateResumeReviewInput({ ...base, resumeBase64: `data:application/pdf;base64,${pdf}` }).resumeBase64).toBe(pdf)
  })
  it('rejects unknown roles, missing files and non-PDFs', () => {
    expect(() => validateResumeReviewInput({ ...base, role: 'Astronaut' })).toThrow(/target role/)
    expect(() => validateResumeReviewInput({ ...base, resumeBase64: '' })).toThrow(/PDF/)
    expect(() => validateResumeReviewInput({ ...base, resumeBase64: Buffer.from('hello').toString('base64') })).toThrow(/not a PDF/)
  })
  it('rejects an over-long job description', () => {
    expect(() => validateResumeReviewInput({ ...base, jobDescription: 'x'.repeat(12_001) })).toThrow(/too long/)
  })
})

const resume = `Manas Raj
manas@example.com | +91 98765 43210
Frontend Engineer
EXPERIENCE
Spinny — SDE-II Frontend (2025–present)
- Built a React + TypeScript booking flow used for 2,500 bookings a month
- Cut page load by 40% with code splitting; worked with design and backend teams
EDUCATION
B.Tech, MNIT Jaipur, 2023
SKILLS
React, TypeScript, JS, Next.js, Redux, CI/CD, REST APIs
` + ' filler'.repeat(300)

const facts = {
  isResume: true,
  resumeText: resume,
  jobTitle: 'Frontend Engineer',
  titleAliases: ['Frontend Developer'],
  keywords: [
    { term: 'React', aliases: [], type: 'hard', importance: 'required' },
    { term: 'JavaScript', aliases: ['JS'], type: 'hard', importance: 'required' },
    { term: 'GraphQL', aliases: [], type: 'hard', importance: 'required' },
    { term: 'CI/CD', aliases: [], type: 'hard', importance: 'preferred' },
    { term: 'API', aliases: [], type: 'hard', importance: 'preferred' },
    { term: 'Collaboration', aliases: ['worked with'], type: 'soft', importance: 'preferred' },
    { term: 'react', aliases: [], type: 'hard', importance: 'required' },
  ],
  requiredYears: 3,
  candidateYears: 2.5,
  educationRequired: 'bachelor',
  candidateEducation: 'bachelor',
  atsIssues: [],
  summary: 'ok',
  strengths: ['Clear layout'],
  improvements: [{ priority: 'urgent', issue: 'No GraphQL', fix: 'Add it if true' }],
  rewrites: [{ before: 'Worked on UI', after: 'Built [N] React screens' }, { before: 'only before' }],
}

describe('ATS score formula', () => {
  it('matches whole words, aliases and plurals but not substrings', () => {
    const t = normalize('Built REST APIs in Node.js with CI/CD; JS and C++.')
    expect(containsTerm(t, 'API')).toBe(true)
    expect(containsTerm(t, 'node.js')).toBe(true)
    expect(containsTerm(t, 'CI/CD')).toBe(true)
    expect(containsTerm(t, 'C++')).toBe(true)
    expect(containsTerm(t, 'C')).toBe(false)
    expect(containsTerm(t, 'Java')).toBe(false)
  })

  it('reads years from the level', () => {
    expect(yearsForLevel('Fresher / Intern (0–1 yrs)')).toBe(0)
    expect(yearsForLevel('Mid-level (3–5 yrs)')).toBe(3)
    expect(yearsForLevel('Staff / Lead (8+ yrs)')).toBe(8)
  })

  it('computes the same score every time and explains each part', () => {
    const ctx = { experience: 'Mid-level (3–5 yrs)', hasJobDescription: true }
    const a = parseResumeReview(JSON.stringify(facts), ctx)
    const b = parseResumeReview(JSON.stringify(facts), ctx)
    expect(a).toEqual(b)
    expect(a.missingKeywords).toEqual(['GraphQL'])
    expect(a.matchedKeywords).toContain('JavaScript')
    // hard: 6 of 8 weight -> 75% of 45 = 33.75; soft 10; title 10; exp 2.5/3 -> 8.3; edu 5; format 20 - length(1)
    const hard = a.sections.find((s) => s.name === 'Hard skills')!
    expect(hard.points).toBeCloseTo(33.8, 1)
    expect(a.sections.find((s) => s.name === 'Job title')!.points).toBe(10)
    expect(a.atsScore).toBe(Math.round(a.sections.reduce((n, s) => n + (s.points ?? 0), 0)))
    expect(a.jdMatch).toBe(80)
    expect(a.keywordSource).toBe('job description')
    expect(a.improvements[0].priority).toBe('medium')
    expect(a.rewrites).toHaveLength(1)
  })

  it('flags missing contact info and headings', () => {
    const checks = formattingChecks('just some words', 2)
    expect(checks.every((c) => !c.ok || c.label.startsWith('Length'))).toBe(true)
  })

  it('scores a non-resume as 0 and ignores JD education without a JD', () => {
    const ctx = { experience: 'Junior (1–3 yrs)', hasJobDescription: false }
    expect(parseResumeReview(JSON.stringify({ ...facts, isResume: false }), ctx).atsScore).toBe(0)
    const r = parseResumeReview(JSON.stringify({ ...facts, candidateEducation: 'none', requiredYears: null }), ctx)
    expect(r.sections.find((s) => s.name === 'Education')!.points).toBe(5)
    expect(r.jdMatch).toBeNull()
  })

  it('throws on unreadable output', () => {
    expect(() => parseResumeReview('no json here', { experience: '', hasJobDescription: false })).toThrow(/Could not read/)
  })
})
