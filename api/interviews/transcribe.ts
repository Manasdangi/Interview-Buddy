import { HttpError, transcribeVoiceAudio } from '../../server/src/services/interviewSessionService'

type ApiRequest = {
  method?: string
  body?: {
    audioBase64?: string
    mimeType?: string
  }
}

type ApiResponse = {
  status: (code: number) => ApiResponse
  json: (body: unknown) => void
  setHeader: (name: string, value: string) => void
}

function sendError(res: ApiResponse, error: unknown) {
  const statusCode = error instanceof HttpError ? error.statusCode : 500
  const message = error instanceof Error ? error.message : 'Something went wrong.'
  res.status(statusCode).json({ error: message })
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  try {
    const transcript = await transcribeVoiceAudio(req.body?.audioBase64, req.body?.mimeType)
    return res.status(200).json({ transcript })
  } catch (error) {
    return sendError(res, error)
  }
}
