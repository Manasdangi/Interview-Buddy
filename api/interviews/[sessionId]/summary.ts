import type { InterviewExitReason, InterviewSession } from '../../../server/src/types/interview.js'
import { HttpError } from '../../../server/src/services/interviewSessionService.js'
import { saveSummaryForSessionSnapshot } from '../../../server/src/services/interviewSummaryService.js'

type ApiRequest = {
  method?: string
  query?: {
    sessionId?: string | string[]
  }
  headers?: {
    authorization?: string
  }
  body?: {
    exitReason?: InterviewExitReason
    session?: InterviewSession
  }
}

type ApiResponse = {
  status: (code: number) => ApiResponse
  json: (body: unknown) => void
  setHeader: (name: string, value: string) => void
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
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
    const summary = await saveSummaryForSessionSnapshot(
      getParam(req.query?.sessionId),
      req.headers?.authorization,
      req.body?.exitReason ?? 'QUIT',
      req.body?.session,
    )
    return res.status(200).json({ summary })
  } catch (error) {
    return sendError(res, error)
  }
}
