import { addInterviewMessage, HttpError } from '../../../server/src/services/interviewSessionService.js'

type ApiRequest = {
  method?: string
  query?: {
    sessionId?: string | string[]
  }
  body?: {
    message?: string
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
    const payload = await addInterviewMessage(getParam(req.query?.sessionId), req.body?.message)
    return res.status(200).json(payload)
  } catch (error) {
    return sendError(res, error)
  }
}
