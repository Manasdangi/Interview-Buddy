import type { Difficulty, InterviewType } from '../../server/src/types/interview'
import { HttpError, startInterviewSession } from '../../server/src/services/interviewSessionService'

type ApiRequest = {
  method?: string
  body?: {
    interviewType?: InterviewType
    difficulty?: Difficulty
  }
}

type ApiResponse = {
  status: (code: number) => ApiResponse
  json: (body: unknown) => void
  setHeader: (name: string, value: string) => void
}

function sendError(res: ApiResponse, error: unknown) {
  const statusCode = error instanceof HttpError ? error.statusCode : error instanceof Error && 'statusCode' in error && typeof error.statusCode === 'number' ? error.statusCode : 500
  const message = error instanceof Error ? error.message : 'Something went wrong.'
  res.status(statusCode).json({ error: message })
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  try {
    const session = await startInterviewSession(req.body?.interviewType, req.body?.difficulty)
    return res.status(201).json({ session })
  } catch (error) {
    return sendError(res, error)
  }
}
