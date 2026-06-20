import type {
  DailyQuestionVariant,
  Difficulty,
  InterviewMessage,
  InterviewSession,
  InterviewType,
  QuestionSet,
} from '../types/interview.js'

const questionCounts = {
  ROUND_1: 5,
  ROUND_2: 5,
  SYSTEM_DESIGN: 5,
}

function formatTopicPath(variant: DailyQuestionVariant) {
  return variant.topicPath.map((topic, index) => `${index + 1}. ${topic}`).join('\n')
}

function compactText(text: string, limit: number) {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= limit) return normalized
  return `${normalized.slice(0, limit - 1).trimEnd()}...`
}

function getLatestInterviewerQuestion(chatHistory: InterviewMessage[]) {
  for (let index = chatHistory.length - 1; index >= 0; index -= 1) {
    if (chatHistory[index]?.role === 'AI') {
      return compactText(chatHistory[index].content, 280)
    }
  }

  return 'No interviewer question has been asked yet.'
}

function getLatestCandidateAnswer(chatHistory: InterviewMessage[]) {
  for (let index = chatHistory.length - 1; index >= 0; index -= 1) {
    if (chatHistory[index]?.role === 'USER') {
      return compactText(chatHistory[index].content, 280)
    }
  }

  return 'No candidate answer yet.'
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
  "lastAnswerQuality": "${state.lastAnswerQuality}"
}`
}

export function createInterviewPrompt(
  session: InterviewSession,
  questionSet: QuestionSet,
  dailyVariant: DailyQuestionVariant,
) {
  const maxQuestions = questionCounts[session.interviewType]
  const setInstruction = `Question set: ${questionSet} of 5.
Daily variant date: ${dailyVariant.questionDate}.
Daily variant key: ${dailyVariant.dailySeed}.
Today's topic path:
${formatTopicPath(dailyVariant)}

Use the topic path as the source of today's questions. The same track, difficulty, set, and date should follow this same path. A different date should produce a different path. Ask one topic at a time in order, adapt follow-ups to the candidate, and do not mention the set number, variant key, or daily path to the candidate.`

  const compactExchange = `Latest exchange:
- Latest interviewer question: ${getLatestInterviewerQuestion(session.messages)}
- Latest candidate answer: ${getLatestCandidateAnswer(session.messages)}`

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

Return only the next interviewer message.
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
- Keep the interviewer reply concise: 2-5 sentences unless a code snippet is necessary.
- Maximum questions: ${maxQuestions}.

Interview difficulty: ${session.difficulty}

${setInstruction}

${formatStructuredState(session)}

${compactExchange}

Return only the next interviewer message.
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

Return only the next interviewer message.
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

  return `You are an expert frontend interview evaluator.

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
  "finalFeedback": ""
}

Scoring rules:
- Score from 0 to 10.
- Be honest but constructive.
- Keep string fields concise.
- Keep strengths, weaknesses, improvements, and recommendedTopics to 2-4 short items each.
- Keep finalFeedback to 1-2 short sentences.
- Mention specific examples from the interview briefly.
- Recommend what the user should study next.
- Output raw JSON only.
`
}
