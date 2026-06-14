import { listInterviewSessions } from '../../server/src/services/interviewSessionService'

type ApiRequest = {
  method?: string
}

type ApiResponse = {
  status: (code: number) => ApiResponse
  json: (body: unknown) => void
  setHeader: (name: string, value: string) => void
}

export default function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  return res.status(200).json({ sessions: listInterviewSessions() })
}
