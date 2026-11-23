import { describe, expect, it } from 'vitest'
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

describe('parseResumeReview', () => {
  it('clamps scores and fills defaults', () => {
    const review = parseResumeReview(
      JSON.stringify({
        atsScore: 140,
        verdict: ' Good ',
        summary: 'ok',
        jdMatch: null,
        sections: [{ name: 'Keywords & skills', score: '72', feedback: 'Add TypeScript.' }],
        matchedKeywords: ['React', ''],
        missingKeywords: ['GraphQL'],
        atsIssues: [],
        strengths: ['Clear layout'],
        improvements: [{ priority: 'urgent', issue: 'No metrics', fix: 'Add [X%]' }],
        rewrites: [{ before: 'Worked on UI', after: 'Built [N] React screens…' }, { before: 'only before' }],
      }),
    )
    expect(review.atsScore).toBe(100)
    expect(review.verdict).toBe('Good')
    expect(review.jdMatch).toBeNull()
    expect(review.sections[0].score).toBe(72)
    expect(review.matchedKeywords).toEqual(['React'])
    expect(review.improvements[0].priority).toBe('medium')
    expect(review.rewrites).toHaveLength(1)
  })
  it('throws on unreadable output', () => {
    expect(() => parseResumeReview('no json here')).toThrow(/Could not read/)
  })
})
