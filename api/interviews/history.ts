import { HttpError } from '../../server/src/services/interviewSessionService.js'
import { listSummariesForUser } from '../../server/src/services/interviewSummaryService.js'

type ApiRequest = {
  method?: string
  headers?: {
    authorization?: string
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
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  try {
    const summaries = await listSummariesForUser(req.headers?.authorization)
    return res.status(200).json({ summaries })
  } catch (error) {
    return sendError(res, error)
  }
}
