import { findCompany, findCompanyRound, roleDefinitions } from '../../../shared/companyCatalog.js'
import type {
  CompanyInterviewContext,
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

function buildTransitionPlaybook(dailyVariant: DailyQuestionVariant) {
  return `The opening project deep-dive has just finished. Assess the latest answer, thank them in a few words, then ask a fresh question about: ${getTopicAt(dailyVariant, 0)}. "nextMove" MUST be NEXT_TOPIC.`
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

export type InterviewPromptMode = 'FIRST_QUESTION' | 'FOLLOW_UP' | 'TRANSITION'

/**
 * Company mock-round brief. It takes priority over the generic focus areas so the round feels like that
 * company's loop, while making clear these are practice themes, not real or leaked company questions.
 */
export function buildCompanyBrief(session: InterviewSession, mode: InterviewPromptMode) {
  const context = session.company
  if (!context) return ''

  const company = findCompany(context.companyId)
  const round = company ? findCompanyRound(company, session.interviewType) : undefined
  if (!company || !round) return ''

  const role = roleDefinitions[context.role]
  const opening = mode === 'FIRST_QUESTION'
    ? `\nOpening: start with one short line welcoming the candidate to this mock ${company.name} "${round.title}" round for ${role.shortLabel} and saying in a few words how it will run, then ask the first question.`
    : ''

  return `COMPANY MOCK ROUND (this brief takes priority over the generic focus areas below):
- Company: ${company.name}
- Role: ${role.label}, ${role.experience} of experience. Calibrate expectations: ${role.expectations}
- Round: ${round.title} (${round.durationMinutes} minutes). Format: ${round.format}
- Interviewer style for this company: ${round.interviewerStyle}
- Hiring bar and culture: ${company.bar}
- Make the questions feel like this company's round: use product scenarios that fit ${company.name}, and follow the round format above.
- This is a practice interview modeled on publicly reported interview patterns. Never claim a question is a real, leaked or confidential ${company.name} question, never claim to work at ${company.name}, and never invent internal details about the company.${
    round.behavioralTopic ? `\n- The final topic is behavioural ("${round.behavioralTopic}"). Ask it as a normal interviewer would, expect a structured STAR-style story, and probe for specifics and measurable impact.` : ''
  }${opening}`
}

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

${mode === 'TRANSITION' ? buildTransitionPlaybook(dailyVariant) : buildFollowUpPlaybook(session, dailyVariant)}`

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
- Your message is shown on screen and also read aloud. Put any code, data or examples in markdown (inline \`code\` or a fenced code block), never spell out syntax in prose, and refer to it the way a person on a call would ("In the snippet on your screen, notice how count is captured...").
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
- Your message is shown on screen and also read aloud. Put any code, data or examples in markdown (inline \`code\` or a fenced code block), never spell out syntax in prose, and refer to it the way a person on a call would ("In the snippet on your screen, notice how count is captured...").
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
- Your message is shown on screen and also read aloud. Put any code, data or examples in markdown (inline \`code\` or a fenced code block), never spell out syntax in prose, and refer to it the way a person on a call would ("In the snippet on your screen, notice how count is captured...").
- Maximum questions: ${maxQuestions}.

Interview difficulty: ${session.difficulty}

${setInstruction}

${formatStructuredState(session)}

${compactExchange}

${responseInstruction}
`,
  }

  const companyBrief = buildCompanyBrief(session, mode)
  return companyBrief ? `${companyBrief}\n\n${basePrompt[session.interviewType]}` : basePrompt[session.interviewType]
}

function formatScorecardCompany(company: CompanyInterviewContext | undefined, difficulty: Difficulty) {
  if (!company) {
    return `Hiring signal: estimate the decision for a frontend candidate at the ${difficulty.toLowerCase()} level.`
  }
  const role = roleDefinitions[company.role]
  return `Company mock round: ${company.companyName}, "${company.roundTitle}" round for ${role.label} (${role.experience}).
Hiring signal: estimate whether this performance would clear the ${company.companyName} ${role.shortLabel} bar for this round, based on publicly reported expectations. Expectations for the role: ${role.expectations}`
}

export function buildScorecardPrompt(
  interviewType: InterviewType,
  difficulty: Difficulty,
  questionSet: QuestionSet,
  dailyVariant: DailyQuestionVariant,
  chatHistory: InterviewMessage[],
  company?: CompanyInterviewContext,
  project?: { questions: number; resumeData: string },
) {
  const history = chatHistory
    .map((message) => `${message.role === 'AI' ? 'Interviewer' : 'Candidate'}: ${message.content}`)
    .join('\n')

  const projectSection = project
    ? `
The first ${project.questions} interviewer questions were a linked deep-dive into one project. Also return "projectReview": 1-4 entries, one per claim the candidate made or listed that was actually probed. Each has "claim" (at most 20 words), "verdict" (SOLID = explained it with convincing detail; SHAKY = partly explained; NOT_DEFENDED = could not back it up), "feedback" (1-2 sentences) and "howToImprove" (1-2 sentences on how to answer it better). Do not review claims that were never discussed.
${project.resumeData}
`
    : ''

  return `You are an expert frontend interview evaluator writing a post-interview report for the candidate.

Evaluate this interview and return compact JSON only.

Interview type: ${interviewType}

Difficulty: ${difficulty}

${formatScorecardCompany(company, difficulty)}

Question set: ${questionSet}

Daily variant date: ${dailyVariant.questionDate}

Daily topic path:
${formatTopicPath(dailyVariant)}

Conversation:
${history}

${projectSection}
Return valid JSON only in this exact shape. Do not add markdown, code fences, explanations, labels, or extra keys${project ? ' other than "projectReview"' : ''}:
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
  ],
  "hiringSignal": "HIRE",
  "hiringSignalReason": ""
}

Scoring rules:
- Score from 0 to 10 and be honest but constructive. A candidate who said "I don't know" or skipped a question scores low on it.
- Rubric: correctness = was what they said technically right; depth = did they explain why and how it works under the hood; communication = was the answer structured, clear and concise; edgeCases = did they think about failures, empty/slow/large inputs, accessibility; tradeOffs = did they weigh alternatives and justify a choice.
- Keep strengths, weaknesses and recommendedTopics to 2-4 short items each. Mention specific examples from the interview briefly.
- "improvements" must be exactly the 3 highest-impact, concrete things to practise before the next interview, most important first. Each is one actionable sentence, not a generic tip.
- "questionReviews": one entry for each interviewer question that the candidate answered, in order (follow-up questions count as their own entry). "question" is the question in at most 25 words. "answerSummary" is what the candidate actually said in 1-2 sentences (say so if they did not answer). "feedback" is 1-2 sentences on what was good and what was missing. "idealAnswer" is what a strong candidate would say, in 2-5 sentences (or a short code snippet when the question is about code).
- "hiringSignal" is one of STRONG_HIRE, HIRE, LEAN_NO_HIRE, NO_HIRE for this round only, judged against the role's bar. Be realistic: most candidates who skip or fumble several questions are LEAN_NO_HIRE or NO_HIRE. "hiringSignalReason" is one sentence explaining the decision.
- Keep finalFeedback to 1-2 short sentences.
- Recommend what the user should study next.
- Output raw JSON only.
`
}
