import { describe, expect, it } from 'vitest'
import type { PdfParagraph } from '../../../shared/improvedResume.js'
import { isSafeEdit, parseResumeEdits, validateImproveInput } from './resumeImproveService.js'

const paragraph = (id: number, text: string): PdfParagraph => ({ id, text, maxChars: text.replace(/\*\*/g, '').length })

const bullet = paragraph(1, 'Was responsible for the development of **ReactJS** dashboards that are used by 40 internal teams.')
const school = paragraph(2, 'Higher Secondry School')
const facts = {
  resumeText: `Asha Verma\nAcme Labs\n${bullet.text}\n${school.text}\nSkills: ReactJS, Node.js, REST API`,
  missingKeywords: ['Kubernetes', 'React Native'],
  matchedKeywords: ['ReactJS'],
}
const safe = (rewrite: string, original = bullet) => isSafeEdit(original, rewrite, facts)

describe('isSafeEdit', () => {
  it('accepts a tighter rewrite of the same facts', () => {
    expect(safe('Developed **ReactJS** dashboards used by 40 internal teams across Acme Labs.')).toBe(true)
  })

  it('accepts a spelling fix', () => {
    expect(safe('Higher Secondary School', school)).toBe(true)
  })

  it.each([
    ['a new number', 'Developed ReactJS dashboards used by 40 internal teams, cutting load time by 30%.'],
    ['a dropped number', 'Developed ReactJS dashboards that are used by many of the internal teams.'],
    ['a missing keyword', 'Developed ReactJS dashboards on kubernetes that are used by 40 internal teams.'],
    ['a new tool', 'Developed ReactJS and GraphQL dashboards that are used by 40 internal teams.'],
    ['a dropped keyword', 'Developed web dashboards that are used every day by 40 internal teams.'],
    ['a placeholder', 'Developed ReactJS dashboards used by 40 internal teams, improving [metric].'],
    ['text that does not fit', `Developed ReactJS dashboards used by 40 internal teams${' and more teams'.repeat(5)}.`],
    ['lost content', 'Built ReactJS for 40.'],
  ])('rejects %s', (_label, rewrite) => {
    expect(safe(rewrite)).toBe(false)
  })
})

describe('parseResumeEdits', () => {
  it('keeps safe edits, ignores unknown or unchanged ones and reports rejections', () => {
    const raw = JSON.stringify({
      edits: [
        { id: 1, text: '• Developed **ReactJS** dashboards used by 40 internal teams across Acme Labs.' },
        { id: 1, text: 'A second rewrite of the same paragraph that is ignored.' },
        { id: 2, text: 'Higher Secondary School, Delhi' },
        { id: 99, text: 'Invented paragraph.' },
      ],
      todo: ['Add your GitHub link.'],
    })
    const result = parseResumeEdits(raw, [bullet, school], facts)
    expect(result.edits).toEqual([{ id: 1, text: 'Developed **ReactJS** dashboards used by 40 internal teams across Acme Labs.' }])
    expect(result.todo).toHaveLength(2)
  })

  it('removes bold markers that the original did not have', () => {
    const raw = JSON.stringify({ edits: [{ id: 2, text: '**Higher Secondary School**' }], todo: [] })
    expect(parseResumeEdits(raw, [school], facts).edits).toEqual([{ id: 2, text: 'Higher Secondary School' }])
  })

  it('fails clearly on an unreadable reply', () => {
    expect(() => parseResumeEdits('nonsense', [bullet], facts)).toThrow('Could not improve the resume')
  })
})

describe('validateImproveInput', () => {
  const input = { role: 'Frontend Engineer', resumeText: 'x'.repeat(300), paragraphs: [bullet] }

  it('accepts a normal request', () => {
    expect(validateImproveInput(input).paragraphs).toEqual([bullet])
  })

  it('rejects a resume with no editable text and malformed paragraphs', () => {
    expect(() => validateImproveInput({ ...input, paragraphs: [] })).toThrow('could not read enough text')
    expect(() => validateImproveInput({ ...input, paragraphs: [{ id: 'a', text: 'hello' }] })).toThrow('upload it again')
  })
})
