import type {
  DailyQuestionVariant,
  Difficulty,
  InterviewMessage,
  InterviewSession,
  InterviewType,
  QuestionSet,
} from '../types/interview.js'

function formatTopicPath(variant: DailyQuestionVariant) {
  return variant.topicPath.map((topic, index) => `${index + 1}. ${topic}`).join('\n')
}

function compactText(text: string, limit: number) {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= limit) return normalized
  return `${normalized.slice(0, limit - 1).trimEnd()}...`
}

const latestAnswerLimit = 6_000
const latestQuestionLimit = 1_200
const earlierMessageLimit = 500
const earlierMessageCount = 4

export const maxFollowUpsPerTopic = 2

function findLastMessage(chatHistory: InterviewMessage[], role: InterviewMessage['role']) {
  for (let index = chatHistory.length - 1; index >= 0; index -= 1) {
    if (chatHistory[index]?.role === role) return index
  }
  return -1
}

function clampText(text: string, limit: number) {
  const trimmed = text.trim()
  return trimmed.length <= limit ? trimmed : `${trimmed.slice(0, limit - 1).trimEnd()}... [truncated]`
}

/**
 * Gives the interviewer the candidate's full latest answer (code included) plus a short window of earlier
 * turns, so follow-ups can target what was actually said instead of a 280-character digest.
 */
function buildConversationContext(session: InterviewSession) {
  const history = session.messages
  const answerIndex = findLastMessage(history, 'USER')
  const questionIndex = findLastMessage(history, 'AI')

  if (answerIndex < 0 || questionIndex < 0) {
    return 'Conversation so far: no candidate answer yet.'
  }

  const earlier = history
    .slice(Math.max(0, Math.min(answerIndex, questionIndex) - earlierMessageCount), Math.min(answerIndex, questionIndex))
    .map((message) => `${message.role === 'AI' ? 'Interviewer' : 'Candidate'}: ${compactText(message.content, earlierMessageLimit)}`)
    .join('\n')

  return `Conversation so far${earlier ? ' (earlier turns, shortened)' : ''}:
${earlier || '(this is the start of the conversation)'}

Your latest question:
${clampText(history[questionIndex].content, latestQuestionLimit)}

Candidate's latest answer (full text; may contain code, and spoken answers may contain transcription errors, so judge the meaning):
"""
${clampText(history[answerIndex].content, latestAnswerLimit)}
"""`
}

function getTopicAt(variant: DailyQuestionVariant, index: number) {
  return variant.topicPath[Math.max(0, Math.min(variant.topicPath.length - 1, index))] ?? 'the current topic'
}

function buildFollowUpPlaybook(session: InterviewSession, dailyVariant: DailyQuestionVariant) {
  const state = session.interviewState
  const currentTopic = getTopicAt(dailyVariant, state.topicIndex)
  const nextTopic = getTopicAt(dailyVariant, state.topicIndex + 1)
  const mustMoveOn = state.followUpsOnTopic >= maxFollowUpsPerTopic

  return `How to follow up (this is what makes you a real interviewer, not a question list):
1. First assess the candidate's latest answer on its merits: what is correct, what is wrong, and what reasoning is missing.
2. Pick exactly one "nextMove":
   - HINT: the answer is WEAK or wrong. Give a small nudge toward the idea without revealing it.
   - PROBE_WHY: the answer is MODERATE. Ask "why" or "how does that work under the hood" about one specific claim they made.
   - EDGE_CASE: ask what happens with an edge case their answer ignored (empty data, errors, race conditions, slow network, accessibility).
   - SCALE: the answer is STRONG. Ask what breaks at 10x or 100x (large lists, many users, big bundles, frequent updates) and how they would fix it.
   - CHANGE_REQUIREMENT: the answer is STRONG. Change a requirement ("what if X changes?") and see whether their design bends or breaks.
   - NEXT_TOPIC: the topic is covered well enough, or you have already probed it enough. Ask a fresh question about: ${nextTopic}.
3. Current topic: ${currentTopic}. Follow-ups already asked on it: ${state.followUpsOnTopic} of at most ${maxFollowUpsPerTopic}.${
    mustMoveOn ? ' You have reached the limit, so nextMove MUST be NEXT_TOPIC.' : ''
  }${state.lastMove ? ` Your previous move was ${state.lastMove}; choose a different move if another fits.` : ''}
4. A follow-up must refer to something the candidate actually said or wrote (quote a few of their words, or name the specific line of their code). Never repeat or rephrase an earlier question.
5. If the candidate's answer includes code, review it like a code reviewer would: bugs, missing cleanup, unnecessary re-renders, accessibility, naming. Ask about the most important issue only.
6. Never reveal the full answer. Keep any acknowledgement to a few words, then ask.
7. "gaps": list up to 3 short phrases naming concepts the candidate missed or got wrong in this answer (empty if the answer was complete).${
    state.openGaps.length ? ` Gaps already noticed on this topic: ${state.openGaps.join('; ')}.` : ''
  }`
}

function formatStructuredState(session: InterviewSession) {
  const state = session.interviewState

  return `Structured interview state:
{
  "interviewType": "${session.interviewType}",
  "difficulty": "${session.difficulty}",
  "questionSet": ${session.questionSet ?? 1},
  "questionNumber": ${state.questionNumber},
  "askedTopics": ${JSON.stringify(state.askedTopics)},
  "candidateStrengths": ${JSON.stringify(state.candidateStrengths)},
  "candidateWeakAreas": ${JSON.stringify(state.candidateWeakAreas)},
  "difficultyTrend": "${state.difficultyTrend}",
  "lastQuestionTopic": ${JSON.stringify(state.lastQuestionTopic)},
  "previousAnswerQuality": "${state.lastAnswerQuality}",
  "followUpsOnCurrentTopic": ${state.followUpsOnTopic},
  "openGaps": ${JSON.stringify(state.openGaps)}
}`
}

export type InterviewPromptMode = 'FIRST_QUESTION' | 'FOLLOW_UP'

export function createInterviewPrompt(
  session: InterviewSession,
  questionSet: QuestionSet,
  dailyVariant: DailyQuestionVariant,
  mode: InterviewPromptMode,
) {
  const maxQuestions = session.maxQuestions
  const nextQuestionNumber = mode === 'FIRST_QUESTION' ? 1 : session.currentQuestionCount + 1
  const finalQuestionNote = nextQuestionNumber >= maxQuestions
    ? `\nThe next question is question ${nextQuestionNumber} of ${maxQuestions}, the final question. Do not promise further questions.`
    : `\nThe next question is question ${nextQuestionNumber} of ${maxQuestions}.`
  const responseInstruction = mode === 'FIRST_QUESTION'
    ? `Return only the next interviewer message.${finalQuestionNote}`
    : `Respond with JSON containing:
- "answerQuality": your assessment of the latest candidate answer. WEAK = incorrect, vague, or "I don't know". MODERATE = partially correct or missing reasoning. STRONG = correct with clear reasoning, trade-offs, or examples.
- "gaps": up to 3 short phrases naming what the candidate missed or got wrong (empty array if nothing).
- "nextMove": one of HINT, PROBE_WHY, EDGE_CASE, SCALE, CHANGE_REQUIREMENT, NEXT_TOPIC.
- "message": the next interviewer message only, consistent with nextMove.${finalQuestionNote}`
  const setInstruction = `Question set: ${questionSet} of 5.
Daily variant date: ${dailyVariant.questionDate}.
Daily variant key: ${dailyVariant.dailySeed}.
Today's topic path:
${formatTopicPath(dailyVariant)}

Use the topic path as the source of today's topics. The same track, difficulty, set, and date should follow this same path, and a different date should produce a different path. Cover the topics in order, but stay on a topic for follow-ups while the candidate's answers give you something worth probing. Do not mention the set number, variant key, or daily path to the candidate.`

  const compactExchange = mode === 'FIRST_QUESTION'
    ? 'Conversation so far: none yet.'
    : `${buildConversationContext(session)}

${buildFollowUpPlaybook(session, dailyVariant)}`

  const basePrompt = {
    ROUND_1: `You are a senior frontend interviewer conducting Round 1 for a frontend developer.

Focus areas:
- JavaScript fundamentals
- React fundamentals
- HTML/CSS basics
- Browser behavior
- Simple coding logic

Rules:
- Ask one question at a time.
- Do not reveal the answer.
- Ask follow-up questions based on candidate response.
- Keep questions practical.
- Keep tone professional.
- If answer is weak, ask a hint-based follow-up.
- If answer is strong, ask a deeper follow-up.
- Keep the interviewer reply concise: 2-5 sentences unless a code snippet is necessary.
- Maximum questions: ${maxQuestions}.

Interview difficulty: ${session.difficulty}

${setInstruction}

${formatStructuredState(session)}

${compactExchange}

${responseInstruction}
`,
    ROUND_2: `You are a senior frontend interviewer conducting Round 2.

Focus areas:
- Advanced React
- Component architecture
- Machine coding discussion
- State management
- Performance optimization
- API handling
- Accessibility
- Error handling
- Testing

Rules:
- Ask one question at a time.
- Prefer scenario-based questions.
- Ask follow-ups.
- Do not give complete answers.
- Challenge assumptions.
- Evaluate trade-offs.
- Machine coding: the candidate has an in-browser code editor (React + TypeScript with a live preview) next to this chat, and their code is attached to their answer as a fenced code block. When a topic lends itself to building (a component, hook, form, list, widget, data-fetching flow), pose a small build task that fits in about 10-15 minutes, tell them to implement it in the editor and then explain their approach, and review the code they send in your follow-ups. For purely conceptual topics, just ask the question.
- Keep the interviewer reply concise: 2-5 sentences unless a code snippet is necessary.
- Maximum questions: ${maxQuestions}.

Interview difficulty: ${session.difficulty}

${setInstruction}

${formatStructuredState(session)}

${compactExchange}

${responseInstruction}
`,
    SYSTEM_DESIGN: `You are a staff frontend engineer conducting a system design interview.

Focus areas:
- Frontend architecture
- Component design
- State management
- Data fetching
- Caching
- Real-time updates
- Performance
- Scalability
- Design systems
- Observability
- Error boundaries
- Security

Example problems:
- Design a frontend for YouTube
- Design a frontend for Google Docs
- Design a frontend for Swiggy
- Design a frontend for Uber
- Design a design system
- Design a dashboard builder

Rules:
- Ask one question at a time.
- Start with requirements.
- Then move to architecture.
- Then data model/API.
- Then performance.
- Then edge cases.
- Do not reveal full solution.
- Ask follow-ups based on user answer.
- Keep the interviewer reply concise: 2-5 sentences unless a diagram substitute or bullet list is necessary.
- Maximum questions: ${maxQuestions}.

Interview difficulty: ${session.difficulty}

${setInstruction}

${formatStructuredState(session)}

${compactExchange}

${responseInstruction}
`,
  }

  return basePrompt[session.interviewType]
}

export function buildScorecardPrompt(
  interviewType: InterviewType,
  difficulty: Difficulty,
  questionSet: QuestionSet,
  dailyVariant: DailyQuestionVariant,
  chatHistory: InterviewMessage[],
) {
  const history = chatHistory
    .map((message) => `${message.role === 'AI' ? 'Interviewer' : 'Candidate'}: ${message.content}`)
    .join('\n')

  return `You are an expert frontend interview evaluator writing a post-interview report for the candidate.

Evaluate this interview and return compact JSON only.

Interview type: ${interviewType}

Difficulty: ${difficulty}

Question set: ${questionSet}

Daily variant date: ${dailyVariant.questionDate}

Daily topic path:
${formatTopicPath(dailyVariant)}

Conversation:
${history}

Return valid JSON only in this exact shape. Do not add markdown, code fences, explanations, labels, or extra keys:
{
  "overallScore": 0,
  "technicalScore": 0,
  "communicationScore": 0,
  "problemSolvingScore": 0,
  "depthScore": 0,
  "strengths": [],
  "weaknesses": [],
  "improvements": [],
  "recommendedTopics": [],
  "finalFeedback": "",
  "rubric": { "correctness": 0, "depth": 0, "communication": 0, "edgeCases": 0, "tradeOffs": 0 },
  "questionReviews": [
    { "question": "", "topic": "", "answerSummary": "", "score": 0, "feedback": "", "idealAnswer": "" }
  ]
}

Scoring rules:
- Score from 0 to 10 and be honest but constructive. A candidate who said "I don't know" or skipped a question scores low on it.
- Rubric: correctness = was what they said technically right; depth = did they explain why and how it works under the hood; communication = was the answer structured, clear and concise; edgeCases = did they think about failures, empty/slow/large inputs, accessibility; tradeOffs = did they weigh alternatives and justify a choice.
- Keep strengths, weaknesses and recommendedTopics to 2-4 short items each. Mention specific examples from the interview briefly.
- "improvements" must be exactly the 3 highest-impact, concrete things to practise before the next interview, most important first. Each is one actionable sentence, not a generic tip.
- "questionReviews": one entry for each interviewer question that the candidate answered, in order (follow-up questions count as their own entry). "question" is the question in at most 25 words. "answerSummary" is what the candidate actually said in 1-2 sentences (say so if they did not answer). "feedback" is 1-2 sentences on what was good and what was missing. "idealAnswer" is what a strong candidate would say, in 2-5 sentences (or a short code snippet when the question is about code).
- Keep finalFeedback to 1-2 short sentences.
- Recommend what the user should study next.
- Output raw JSON only.
`
}
