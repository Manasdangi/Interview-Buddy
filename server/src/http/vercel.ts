import { flattenValues, runHandler, type ApiHandler } from './handlers.js'

type VercelRequest = {
  method?: string
  query?: Record<string, string | string[] | undefined>
  body?: unknown
  headers: Record<string, string | string[] | undefined>
  socket?: { remoteAddress?: string }
}

type VercelResponse = {
  status: (code: number) => VercelResponse
  json: (body: unknown) => void
  setHeader: (name: string, value: string) => void
}

/** Wraps a shared handler as a Vercel serverless function that accepts a single HTTP method. */
export function createVercelHandler(method: 'GET' | 'POST', handler: ApiHandler) {
  return async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== method) {
      res.setHeader('Allow', method)
      return res.status(405).json({ error: 'Method not allowed.' })
    }

    const headers = flattenValues(req.headers, true)
    const result = await runHandler(handler, {
      params: flattenValues(req.query ?? {}),
      body: req.body,
      headers,
      ip: headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress,
    })
    return res.status(result.status).json(result.body)
  }
}
