import { getInterviewSession, HttpError } from '../../../server/src/services/interviewSessionService'

type ApiRequest = {
  method?: string
  query?: {
    sessionId?: string | string[]
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
  const statusCode = error instanceof HttpError ? error.statusCode : 500
  const message = error instanceof Error ? error.message : 'Something went wrong.'
  res.status(statusCode).json({ error: message })
}

export default function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  try {
    const session = getInterviewSession(getParam(req.query?.sessionId))
    return res.status(200).json({ session })
  } catch (error) {
    return sendError(res, error)
  }
}
