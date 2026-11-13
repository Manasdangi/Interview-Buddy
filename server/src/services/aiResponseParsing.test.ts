import { describe, expect, it } from 'vitest'
import { parseInterviewTurn, parseJsonObject, parseScorecard } from './aiResponseParsing.js'

const validScorecard = {
  overallScore: 7.5,
  technicalScore: 8,
  communicationScore: 7,
  problemSolvingScore: 6,
  depthScore: 7,
  strengths: ['Clear closures explanation'],
  weaknesses: ['Skipped edge cases'],
  improvements: ['Discuss trade-offs'],
  recommendedTopics: ['Event loop'],
  finalFeedback: 'Solid fundamentals.',
}

describe('parseJsonObject', () => {
  it('parses plain, fenced, and prose-wrapped JSON', () => {
    expect(parseJsonObject('{"a":1}')).toEqual({ a: 1 })
    expect(parseJsonObject('```json\n{"a":1}\n```')).toEqual({ a: 1 })
    expect(parseJsonObject('Here you go: {"a":1} thanks')).toEqual({ a: 1 })
  })

  it('rejects non-objects', () => {
    expect(parseJsonObject('not json')).toBeNull()
    expect(parseJsonObject('[1,2]')).toBeNull()
  })
})

describe('parseScorecard', () => {
  it('accepts a complete scorecard', () => {
    expect(parseScorecard(JSON.stringify(validScorecard))).toEqual(validScorecard)
  })

  it('clamps scores into 0-10 and accepts numeric strings', () => {
    const scorecard = parseScorecard(JSON.stringify({ ...validScorecard, overallScore: 14, depthScore: '-2', technicalScore: '8' }))
    expect(scorecard?.overallScore).toBe(10)
    expect(scorecard?.depthScore).toBe(0)
    expect(scorecard?.technicalScore).toBe(8)
  })

  it('returns null instead of inventing values when fields are missing', () => {
    const missingFeedback: Partial<typeof validScorecard> = { ...validScorecard }
    delete missingFeedback.finalFeedback
    expect(parseScorecard(JSON.stringify(missingFeedback))).toBeNull()
    expect(parseScorecard(JSON.stringify({ ...validScorecard, overallScore: 'great' }))).toBeNull()
    expect(parseScorecard('Sorry, I cannot do that.')).toBeNull()
  })
})

describe('parseInterviewTurn', () => {
  it('reads the message and answer quality', () => {
    expect(parseInterviewTurn('{"answerQuality":"STRONG","message":"Next question?"}')).toEqual({
      answerQuality: 'STRONG',
      message: 'Next question?',
      gaps: [],
      nextMove: null,
    })
  })

  it('treats an unknown quality as UNKNOWN', () => {
    expect(parseInterviewTurn('{"answerQuality":"EXCELLENT","message":"Next?"}').answerQuality).toBe('UNKNOWN')
  })

  it('falls back to the raw text when the reply is not JSON', () => {
    expect(parseInterviewTurn('What is a closure?')).toEqual({ answerQuality: 'UNKNOWN', message: 'What is a closure?', gaps: [], nextMove: null })
  })

  it('reads the follow-up move and the gaps the candidate left', () => {
    const turn = parseInterviewTurn(
      JSON.stringify({ answerQuality: 'MODERATE', nextMove: 'EDGE_CASE', gaps: ['stale closure', 'cleanup', 'deps', 'extra'], message: 'What if the id changes mid-flight?' }),
    )
    expect(turn.nextMove).toBe('EDGE_CASE')
    expect(turn.gaps).toEqual(['stale closure', 'cleanup', 'deps'])
  })

  it('ignores an unknown move', () => {
    expect(parseInterviewTurn('{"answerQuality":"STRONG","nextMove":"RANT","message":"Next?"}').nextMove).toBeNull()
  })
})

describe('parseScorecard rubric and question reviews', () => {
  const rubric = { correctness: 7, depth: 6, communication: 8, edgeCases: 4, tradeOffs: 5 }
  const review = { question: 'What is a closure?', answerSummary: 'Said it captures variables.', score: 6, feedback: 'Good start, missed stale closures.', idealAnswer: 'A function plus its lexical environment.' }

  it('keeps a valid rubric and reviews', () => {
    const scorecard = parseScorecard(JSON.stringify({ ...validScorecard, rubric, questionReviews: [review] }))
    expect(scorecard?.rubric).toEqual(rubric)
    expect(scorecard?.questionReviews).toEqual([review])
  })

  it('drops a malformed rubric or reviews instead of failing the whole report', () => {
    const scorecard = parseScorecard(JSON.stringify({
      ...validScorecard,
      rubric: { correctness: 7 },
      questionReviews: [{ question: 'x' }, 'nope', { ...review, score: 'high' }],
    }))
    expect(scorecard).not.toBeNull()
    expect(scorecard?.rubric).toBeUndefined()
    expect(scorecard?.questionReviews).toBeUndefined()
  })
})
