export type InterviewType = 'ROUND_1' | 'ROUND_2' | 'SYSTEM_DESIGN'

export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export type QuestionSet = 1 | 2 | 3 | 4 | 5

export type MessageRole = 'AI' | 'USER'

export type InterviewStatus = 'ACTIVE' | 'COMPLETED'

export type InterviewMessage = {
  id: string
  role: MessageRole
  content: string
  createdAt: string
}

export type InterviewScorecard = {
  overallScore: number
  technicalScore: number
  communicationScore: number
  problemSolvingScore: number
  depthScore: number
  strengths: string[]
  weaknesses: string[]
  improvements: string[]
  recommendedTopics: string[]
  finalFeedback: string
}

export type DailyQuestionVariant = {
  questionDate: string
  dailySeed: string
  topicPath: string[]
}

export type InterviewSession = {
  id: string
  interviewType: InterviewType
  difficulty: Difficulty
  questionSet?: QuestionSet
  dailyQuestionVariant?: DailyQuestionVariant
  status: InterviewStatus
  messages: InterviewMessage[]
  currentQuestionCount: number
  maxQuestions: number
  startedAt: string
  completedAt?: string
  scorecard?: InterviewScorecard
}

export type InterviewExitReason = 'COMPLETED' | 'QUIT'

export type InterviewSummary = {
  sessionId: string
  uid: string
  interviewType: InterviewType
  difficulty: Difficulty
  questionSet?: QuestionSet
  status: InterviewStatus
  exitReason: InterviewExitReason
  questionsAsked: number
  questionsAnswered: number
  maxQuestions: number
  startedAt: string
  endedAt: string
  durationSeconds: number
  overallScore?: number
  createdAt: string
  updatedAt: string
}
