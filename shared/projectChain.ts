// Shared between the interview pages and the API: the linked project/resume questions that open every interview.

/** The most linked questions asked about one project before the round's own topics start. */
export const projectChainLength = 6
/** The thread may close from this many questions once there is nothing more to learn. */
export const projectChainMinLength = 5
/** Total questions in an interview: the chain plus the round's topics. */
export const interviewQuestionCount = 10

export type ProjectChain = {
  /** Chain questions asked so far. */
  asked: number
  /** True once the interviewer has moved on to the round's topics. */
  done: boolean
  /** Answers in a row the candidate could not attempt; two end the chain. */
  struggles: number
  fromResume: boolean
  /** The project or claim the questions are about, when it came from a resume. */
  focus: string
}

export type ProjectVerdict = 'SOLID' | 'SHAKY' | 'NOT_DEFENDED'

export type ProjectReview = {
  claim: string
  verdict: ProjectVerdict
  feedback: string
  howToImprove: string
}
