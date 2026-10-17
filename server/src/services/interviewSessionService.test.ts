import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./geminiService.js', () => ({
  generateText: vi.fn(async () => 'Question 1: what is a closure?'),
  generateJson: vi.fn(),
  transcribeAudio: vi.fn(async () => 'spoken answer'),
}))

vi.mock('./firebaseAdmin.js', () => ({
  getFirestoreDb: () => null,
  getFirebaseAuth: async () => null,
}))

const gemini = await import('./geminiService.js')
const {
  addInterviewMessage,
  completeInterviewSession,
  getAuthorizedSession,
  getDifficultyTrend,
  startInterviewSession,
  toPublicSession,
} = await import('./interviewSessionService.js')

const scorecardJson = JSON.stringify({
  overallScore: 6,
  technicalScore: 6,
  communicationScore: 7,
  problemSolvingScore: 5,
  depthScore: 6,
  strengths: ['a'],
  weaknesses: ['b'],
  improvements: ['c'],
  recommendedTopics: ['d'],
  finalFeedback: 'ok',
})

const generateJson = vi.mocked(gemini.generateJson)

function mockModel() {
  generateJson.mockImplementation(async (_system, user) =>
    user.startsWith('Generate the scorecard')
      ? scorecardJson
      : JSON.stringify({ answerQuality: 'STRONG', message: 'Next question?' }),
  )
}

async function startGuestSession() {
  return startInterviewSession({ interviewType: 'ROUND_1', difficulty: 'BEGINNER', questionSet: 2 }, null)
}

describe('interview session ownership', () => {
  beforeEach(() => mockModel())

  it('never exposes server-only fields', async () => {
    const { session } = await startGuestSession()
    const publicSession = toPublicSession(session) as Record<string, unknown>
    expect(publicSession.accessKeyHash).toBeUndefined()
    expect(publicSession.uid).toBeUndefined()
    expect(publicSession.version).toBeUndefined()
  })

  it('allows the creating browser via its access key and hides the session from everyone else', async () => {
    const { session, accessKey } = await startGuestSession()

    await expect(getAuthorizedSession(session.id, { uid: null, sessionKey: accessKey })).resolves.toMatchObject({ id: session.id })
    await expect(getAuthorizedSession(session.id, { uid: null })).rejects.toMatchObject({ statusCode: 404 })
    await expect(getAuthorizedSession(session.id, { uid: 'someone-else', sessionKey: 'wrong' })).rejects.toMatchObject({ statusCode: 404 })
  })

  it('allows a signed-in owner without the access key', async () => {
    const { session } = await startInterviewSession({ interviewType: 'ROUND_2', difficulty: 'ADVANCED' }, 'user-1')

    await expect(getAuthorizedSession(session.id, { uid: 'user-1' })).resolves.toMatchObject({ id: session.id })
    await expect(getAuthorizedSession(session.id, { uid: 'user-2' })).rejects.toMatchObject({ statusCode: 404 })
  })

  it('rejects unknown interview types', async () => {
    await expect(startInterviewSession({ interviewType: 'HACK', difficulty: 'BEGINNER' }, null)).rejects.toMatchObject({ statusCode: 400 })
  })
})

describe('interview flow', () => {
  beforeEach(() => mockModel())

  it('uses the model answer quality and auto-completes after the final question', async () => {
    const { session, accessKey } = await startGuestSession()
    const access = { uid: null, sessionKey: accessKey }

    let latest = session
    for (let answer = 1; answer < session.maxQuestions; answer += 1) {
      const result = await addInterviewMessage(session.id, `answer ${answer}`, access)
      expect(result.aiMessage?.content).toBe('Next question?')
      latest = result.session
    }
    expect(latest.currentQuestionCount).toBe(session.maxQuestions)
    expect(latest.interviewState.lastAnswerQuality).toBe('STRONG')

    const final = await addInterviewMessage(session.id, 'final answer', access)
    expect(final.aiMessage).toBeNull()
    expect(final.session.status).toBe('COMPLETED')
    expect(final.session.scorecard?.overallScore).toBe(6)
    expect(final.session.messages.filter((message) => message.role === 'AI')).toHaveLength(session.maxQuestions)
  })

  it('fails instead of inventing a scorecard when the model output is unusable', async () => {
    const { session, accessKey } = await startGuestSession()
    generateJson.mockResolvedValue('not json')

    await expect(completeInterviewSession(session.id, { uid: null, sessionKey: accessKey })).rejects.toMatchObject({ statusCode: 502 })
    const stored = await getAuthorizedSession(session.id, { uid: null, sessionKey: accessKey })
    expect(stored.status).toBe('ACTIVE')
    expect(stored.pendingTurnAt).toBeUndefined()
  })

  it('rejects an overlapping answer instead of losing one', async () => {
    const { session, accessKey } = await startGuestSession()
    const access = { uid: null, sessionKey: accessKey }

    let releaseModel = () => {}
    generateJson.mockImplementationOnce(
      () => new Promise((resolve) => {
        releaseModel = () => resolve(JSON.stringify({ answerQuality: 'MODERATE', message: 'Q2' }))
      }),
    )

    const first = addInterviewMessage(session.id, 'first', access)
    await vi.waitFor(() => expect(generateJson).toHaveBeenCalled())
    await expect(addInterviewMessage(session.id, 'second', access)).rejects.toMatchObject({ statusCode: 409 })

    releaseModel()
    const result = await first
    expect(result.session.messages.map((message) => message.content)).toEqual(['Question 1: what is a closure?', 'first', 'Q2'])
  })
})

describe('getDifficultyTrend', () => {
  it('rises on strong answers, eases on weak ones, ignores unknown', () => {
    expect(getDifficultyTrend(['STRONG', 'STRONG'])).toBe('RISING')
    expect(getDifficultyTrend(['WEAK', 'WEAK', 'MODERATE'])).toBe('EASING')
    expect(getDifficultyTrend(['UNKNOWN'])).toBe('STEADY')
  })
})
