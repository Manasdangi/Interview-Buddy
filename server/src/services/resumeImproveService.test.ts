import { describe, expect, it, vi } from 'vitest'

vi.mock('./claudeService.js', () => ({ generateJson: vi.fn(), generateJsonFromPdf: vi.fn() }))

const claude = await import('./claudeService.js')
const { improveResume, parseImprovedResume } = await import('./resumeImproveService.js')

const source = `Asha Verma
Software Development Engineer
asha@example.com | +91 90000 00000 | LinkedIn
EXPERIENCE
Software Development Engineer - Acme Labs, Indore, Jan 2024 - Dec 2024
- Built screens in React Native and APIs in Node.js for 1,200 users
PROJECTS
Notes App (ReactJS)
EDUCATION
MCA, State University, 2023
SKILLS
React Native, ReactJS, Node.js, MongoDB, Git`

const rewrite = {
  name: 'Asha Verma',
  headline: 'Software Development Engineer',
  contact: ['asha@example.com', '+91 90000 00000', 'LinkedIn', 'github.com/invented'],
  summary: 'Engineer who builds React Native and Node.js products.',
  experience: [
    {
      title: 'Software Development Engineer',
      company: 'Acme Labs',
      location: 'Indore',
      dates: 'Jan 2024 - Dec 2024',
      bullets: ['Built React Native screens used by 1200 users', 'Cut load time by 40%', 'Shipped [N] features'],
    },
    { title: 'Engineer', company: 'Invented Corp', location: '', dates: '', bullets: [] },
  ],
  projects: [{ name: 'Notes App', tech: 'ReactJS', bullets: ['Built a notes app'] }],
  skills: [{ category: 'Mobile', items: ['React Native', 'TypeScript', 'Swift'] }],
  education: [{ degree: 'MCA', school: 'State University', dates: '2023', detail: '' }],
  extras: [],
  todo: ['Add a result to your Acme Labs work.'],
}

describe('parseImprovedResume', () => {
  it('keeps facts from the resume and removes anything it cannot trace back', () => {
    const { resume, todo } = parseImprovedResume(JSON.stringify(rewrite), source)

    expect(resume.contact).toEqual(['asha@example.com', '+91 90000 00000'])
    expect(resume.experience).toHaveLength(1)
    expect(resume.experience[0].bullets).toEqual(['Built React Native screens used by 1200 users'])
    expect(resume.experience[0].dates).toBe('Jan 2024 - Dec 2024')
    expect(resume.skills).toEqual([{ category: 'Mobile', items: ['React Native'] }])
    expect(todo[0]).toContain('left out 2 lines')
    expect(todo[1]).toContain('LinkedIn')
  })

  it('drops a headline the resume does not support and rejects unusable output', () => {
    expect(parseImprovedResume(JSON.stringify({ ...rewrite, headline: 'Senior iOS Architect' }), source).resume.headline).toBe('')
    expect(() => parseImprovedResume('nonsense', source)).toThrow(/Could not build/)
    expect(() => parseImprovedResume(JSON.stringify({ ...rewrite, name: 'Someone Else' }), source)).toThrow(/Could not build/)
  })
})

describe('improveResume', () => {
  const input = { role: 'Frontend Engineer', resumeText: `${source}\n${'detail '.repeat(30)}`, fixes: ['Tighten bullets.'] }

  it('validates input before calling the model', async () => {
    await expect(improveResume({ ...input, role: 'Astronaut' })).rejects.toMatchObject({ statusCode: 400 })
    await expect(improveResume({ ...input, resumeText: 'short' })).rejects.toMatchObject({ statusCode: 400 })
    await expect(improveResume({ ...input, resumeText: 'x'.repeat(20_001) })).rejects.toMatchObject({ statusCode: 413 })
    expect(claude.generateJson).not.toHaveBeenCalled()
  })

  it('sends the resume and the review fixes to the model', async () => {
    vi.mocked(claude.generateJson).mockResolvedValue(JSON.stringify(rewrite))
    await expect(improveResume(input)).resolves.toMatchObject({ resume: { name: 'Asha Verma' } })
    expect(vi.mocked(claude.generateJson).mock.calls[0][1]).toContain('Tighten bullets.')
  })
})
