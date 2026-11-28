import { beforeEach, describe, expect, it, vi } from 'vitest'
import { findCompany, findCompanyRound } from '../../../shared/companyCatalog.js'
import { maxResumeBytes } from '../../../shared/resumeReview.js'

vi.mock('./claudeService.js', () => ({
  generateText: vi.fn(async () => 'Tell me about a project you built.'),
  generateJson: vi.fn(),
  generateJsonFromPdf: vi.fn(),
}))
vi.mock('./transcriptionService.js', () => ({ transcribeAudio: vi.fn() }))
vi.mock('./firebaseAdmin.js', () => ({ getFirestoreDb: () => null }))

const claude = await import('./claudeService.js')
const { addInterviewMessage, completeInterviewSession, startInterviewSession, toPublicSession } = await import('./interviewSessionService.js')
const { parseResumeStart } = await import('./projectChainService.js')

const generateJson = vi.mocked(claude.generateJson)
const generateJsonFromPdf = vi.mocked(claude.generateJsonFromPdf)
const pdf = Buffer.from('%PDF-1.4 test').toString('base64')

const resumeReply = {
  isResume: true,
  focus: 'Checkout flow in React Native',
  message: 'Hi! Tell me about the checkout flow.',
  profile: {
    yearsExperience: 3,
    domains: ['payments'],
    skills: ['React Native'],
    projects: [{ name: 'Checkout', summary: 'Mail me at a.b@example.com or +91 98765 43210', claims: ['Cut 2,000 retries'] }],
  },
}

const turn = (extra: Record<string, unknown> = {}) =>
  JSON.stringify({ answerQuality: 'MODERATE', couldNotAnswer: false, gaps: [], anchor: 'x', closeThread: false, nextMove: 'NEXT_TOPIC', message: 'Next?', ...extra })

function mockModel(extra: Record<string, unknown> = {}) {
  generateJson.mockImplementation(async (_system, user) =>
    user.startsWith('Generate the scorecard')
      ? JSON.stringify({
          overallScore: 6, technicalScore: 6, communicationScore: 6, problemSolvingScore: 6, depthScore: 6,
          strengths: ['a'], weaknesses: ['b'], improvements: ['c'], recommendedTopics: ['d'], finalFeedback: 'ok',
          projectReview: [{ claim: 'Cut retries', verdict: 'SHAKY', feedback: 'Vague.', howToImprove: 'Give numbers.' }, { claim: 'x', verdict: 'BAD', feedback: 'y' }],
        })
      : turn(extra),
  )
}

async function start(input: Record<string, unknown> = {}) {
  const { session, accessKey } = await startInterviewSession({ interviewType: 'ROUND_1', difficulty: 'BEGINNER', ...input }, null)
  const access = { uid: null, sessionKey: accessKey }
  return { session, answer: async (text = 'my answer') => (await addInterviewMessage(session.id, text, access)).session, access }
}

const lastPrompt = () => generateJson.mock.calls.at(-1)![0]

describe('resume start', () => {
  beforeEach(() => {
    mockModel()
    generateJsonFromPdf.mockReset()
    generateJsonFromPdf.mockResolvedValue(JSON.stringify(resumeReply))
  })

  it('asks the first question from the resume and keeps only a redacted, server-side profile', async () => {
    const { session, answer } = await start({ resumeBase64: pdf })
    expect(session.messages[0].content).toBe(resumeReply.message)
    expect(session.projectChain).toEqual({ asked: 1, done: false, struggles: 0, fromResume: true, focus: resumeReply.focus })
    expect(session.interviewState.lastQuestionTopic).toBe(resumeReply.focus)
    expect(session.resumeProfile?.projects[0].summary).toBe('Mail me at [removed] or [removed]')
    expect(session.resumeProfile?.projects[0].claims).toEqual(['Cut 2,000 retries'])
    expect(JSON.stringify(session)).not.toContain(pdf)
    expect(toPublicSession(session)).not.toHaveProperty('resumeProfile')

    await answer('I used a payment state machine')
    expect(lastPrompt()).toContain('I used a payment state machine')
    expect(lastPrompt()).toContain('<resume_data>')
    expect(lastPrompt()).toContain('about 3 years')
  })

  it('rejects non-PDF files, oversized files and documents that are not resumes', async () => {
    await expect(start({ resumeBase64: Buffer.from('hello').toString('base64') })).rejects.toMatchObject({ statusCode: 400 })
    await expect(start({ resumeBase64: Buffer.concat([Buffer.from('%PDF'), Buffer.alloc(maxResumeBytes)]).toString('base64') })).rejects.toMatchObject({ statusCode: 413 })
    expect(generateJsonFromPdf).not.toHaveBeenCalled()
    expect(() => parseResumeStart(JSON.stringify({ ...resumeReply, isResume: false }))).toThrow(/does not look like a resume/)
    expect(() => parseResumeStart('nonsense')).toThrow(/Could not read/)
  })
})

describe('linked project questions', () => {
  beforeEach(() => mockModel())

  it('asks six linked questions, then moves to the first round topic without skipping it', async () => {
    const { session, answer } = await start()
    expect(session.maxQuestions).toBe(10)
    let latest: Awaited<ReturnType<typeof answer>>
    for (let step = 2; step <= 6; step += 1) {
      latest = await answer(`answer ${step}`)
      expect(lastPrompt()).toContain(`Ask question ${step} of up to 6`)
      expect(lastPrompt()).toContain(`answer ${step}`)
      expect(latest.projectChain).toMatchObject({ asked: step, done: false })
    }

    latest = await answer()
    expect(lastPrompt()).toContain('deep-dive has just finished')
    expect(latest.projectChain).toMatchObject({ asked: 6, done: true })
    expect(latest.interviewState.topicIndex).toBe(0)
    expect(latest.interviewState.lastQuestionTopic).toBe(latest.dailyQuestionVariant!.topicPath[0])

    await answer()
    expect(lastPrompt()).toContain('How to follow up')
  })

  it('ends the thread after two answers the candidate could not attempt', async () => {
    const { answer } = await start()
    mockModel({ couldNotAnswer: true })
    expect((await answer("I don't know")).projectChain).toMatchObject({ struggles: 1, done: false })
    expect((await answer("I don't know")).projectChain).toMatchObject({ struggles: 2 })
    expect(lastPrompt()).toContain('set closeThread to true')
    const latest = await answer()
    expect(latest.projectChain!.done).toBe(true)
  })

  it('moves on when the interviewer closes the thread', async () => {
    const { answer } = await start()
    mockModel({ closeThread: true })
    const latest = await answer()
    expect(latest.projectChain).toMatchObject({ asked: 1, done: true })
    expect(latest.interviewState.topicIndex).toBe(0)
  })

  it('still ends a company round on the behavioural question', async () => {
    const round = findCompanyRound(findCompany('amazon')!, 'ROUND_1')!
    const { session, answer } = await start({ companyId: 'amazon', role: 'FE1' })
    const sessions = []
    for (let count = 1; count < session.maxQuestions; count += 1) sessions.push(await answer())
    expect(sessions.at(-1)!.interviewState.lastQuestionTopic).toBe(round.behavioralTopic)
  })

  it('adds a project review to the report', async () => {
    const { session, answer, access } = await start()
    await answer()
    const completed = await completeInterviewSession(session.id, access)
    expect(lastPrompt()).toContain('"projectReview"')
    expect(completed.scorecard?.projectReview).toEqual([{ claim: 'Cut retries', verdict: 'SHAKY', feedback: 'Vague.', howToImprove: 'Give numbers.' }])
  })
})
