import { beforeEach, describe, expect, it, vi } from 'vitest'
import { companies, findCompany, findCompanyRound } from '../../../shared/companyCatalog.js'

vi.mock('./claudeService.js', () => ({
  generateText: vi.fn(async () => 'Welcome to the mock round. First question?'),
  generateJson: vi.fn(),
}))
vi.mock('./transcriptionService.js', () => ({ transcribeAudio: vi.fn() }))
vi.mock('./firebaseAdmin.js', () => ({ getFirestoreDb: () => null }))

const claude = await import('./claudeService.js')
const { startInterviewSession } = await import('./interviewSessionService.js')
const { getCompanyQuestionVariant } = await import('./dailyQuestionVariantService.js')
const { buildScorecardPrompt } = await import('./interviewPromptService.js')
const { parseScorecard } = await import('./aiResponseParsing.js')

describe('company catalog', () => {
  it('has unique ids and every round has enough distinct topics for varied attempts', () => {
    expect(companies.length).toBeGreaterThanOrEqual(100)
    expect(new Set(companies.map((company) => company.id)).size).toBe(companies.length)
    expect(new Set(companies.map((company) => company.name)).size).toBe(companies.length)
    for (const company of companies) {
      expect(company.rounds.map((round) => round.type).sort()).toEqual(['ROUND_1', 'ROUND_2', 'SYSTEM_DESIGN'])
      for (const round of company.rounds) {
        expect(new Set(round.topics).size, `${company.id} ${round.type}`).toBeGreaterThanOrEqual(6)
      }
    }
  })
})

describe('company question variant', () => {
  const amazon = findCompany('amazon')!
  const round = findCompanyRound(amazon, 'ROUND_1')!

  it('is deterministic per seed, varies across sets, and ends with the behavioural topic', () => {
    const date = new Date('2026-11-15T06:00:00Z')
    const first = getCompanyQuestionVariant('amazon', round, 'FE1', 1, date)
    expect(getCompanyQuestionVariant('amazon', round, 'FE1', 1, date)).toEqual(first)
    expect(first.topicPath).toHaveLength(5)
    expect(first.topicPath.at(-1)).toBe(round.behavioralTopic)
    expect(new Set(first.topicPath).size).toBe(5)

    const paths = [1, 2, 3, 4, 5].map((set) => getCompanyQuestionVariant('amazon', round, 'FE1', set as 1, date).topicPath.join('|'))
    expect(new Set(paths).size).toBeGreaterThan(1)
  })
})

describe('starting a company round', () => {
  beforeEach(() => vi.mocked(claude.generateText).mockClear())

  it('sets company context, derives difficulty from the role and briefs the interviewer', async () => {
    const { session } = await startInterviewSession({ interviewType: 'ROUND_2', companyId: 'flipkart', role: 'FE2' }, null)

    expect(session.difficulty).toBe('ADVANCED')
    expect(session.company).toMatchObject({ companyId: 'flipkart', companyName: 'Flipkart', role: 'FE2', roundTitle: 'Machine coding', durationMinutes: 90 })
    expect(session.dailyQuestionVariant?.dailySeed).toContain('flipkart:ROUND_2:FE2')

    const [systemPrompt] = vi.mocked(claude.generateText).mock.calls[0]
    expect(systemPrompt).toContain('COMPANY MOCK ROUND')
    expect(systemPrompt).toContain('Flipkart')
    expect(systemPrompt).toContain('Never claim a question is a real')
    expect(systemPrompt).toContain('Opening:')
  })

  it('rejects unknown companies and missing roles', async () => {
    await expect(startInterviewSession({ interviewType: 'ROUND_1', companyId: 'nope', role: 'FE1' }, null)).rejects.toMatchObject({ statusCode: 400 })
    await expect(startInterviewSession({ interviewType: 'ROUND_1', companyId: 'amazon' }, null)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('keeps the generic flow working without a company', async () => {
    const { session } = await startInterviewSession({ interviewType: 'ROUND_1', difficulty: 'BEGINNER', questionSet: 3 }, null)
    expect(session.company).toBeUndefined()
    expect(vi.mocked(claude.generateText).mock.calls[0][0]).not.toContain('COMPANY MOCK ROUND')
  })
})

describe('hiring signal', () => {
  it('asks for a company-calibrated signal and parses it', () => {
    const prompt = buildScorecardPrompt('ROUND_1', 'INTERMEDIATE', 1, { questionDate: 'd', dailySeed: 's', topicPath: ['t'] }, [], {
      companyId: 'amazon',
      companyName: 'Amazon',
      role: 'FE1',
      roleLabel: 'Frontend Engineer 1 (SDE-1)',
      roundTitle: 'Problem solving in JavaScript',
      durationMinutes: 60,
    })
    expect(prompt).toContain('clear the Amazon Frontend Engineer 1 bar')

    const base = {
      overallScore: 6, technicalScore: 6, communicationScore: 6, problemSolvingScore: 6, depthScore: 6,
      strengths: ['a'], weaknesses: ['b'], improvements: ['c'], recommendedTopics: ['d'], finalFeedback: 'ok',
    }
    expect(parseScorecard(JSON.stringify({ ...base, hiringSignal: 'LEAN_NO_HIRE', hiringSignalReason: 'Missed edge cases.' })))
      .toMatchObject({ hiringSignal: 'LEAN_NO_HIRE', hiringSignalReason: 'Missed edge cases.' })
    expect(parseScorecard(JSON.stringify({ ...base, hiringSignal: 'MAYBE' }))?.hiringSignal).toBeUndefined()
  })
})
