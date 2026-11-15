import { flattenValues, runHandler, type ApiHandler, type ApiRequest, type MessageStreamEvent } from './handlers.js'

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
  write?: (chunk: string) => void
  end?: () => void
  flushHeaders?: () => void
}

function toApiRequest(req: VercelRequest): ApiRequest {
  const headers = flattenValues(req.headers, true)
  return {
    params: flattenValues(req.query ?? {}),
    body: req.body,
    headers,
    ip: headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress,
  }
}

/** Streams newline-delimited JSON events from a POST handler (used for live voice replies). */
export function createVercelStreamHandler(run: (req: ApiRequest, send: (event: MessageStreamEvent) => void) => Promise<void>) {
  return async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST')
      return res.status(405).json({ error: 'Method not allowed.' })
    }
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('X-Accel-Buffering', 'no')
    res.status(200)
    res.flushHeaders?.()
    await run(toApiRequest(req), (event) => res.write?.(`${JSON.stringify(event)}\n`))
    res.end?.()
  }
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

/**
 * Web-standard streaming handler (Request -> Response with a ReadableStream). Vercel streams these responses on
 * every plan, unlike the (req, res) style which can be buffered until the function finishes.
 */
export function createWebStreamHandler(
  run: (req: ApiRequest, send: (event: MessageStreamEvent) => void) => Promise<void>,
  getParams: (url: URL) => Record<string, string>,
) {
  return async (request: Request) => {
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value
    })
    const body: unknown = await request.json().catch(() => ({}))
    const apiRequest: ApiRequest = {
      params: getParams(new URL(request.url)),
      body,
      headers,
      ip: headers['x-forwarded-for']?.split(',')[0]?.trim(),
    }
    const encoder = new TextEncoder()
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        await run(apiRequest, (event) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`)))
        controller.close()
      },
    })
    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
      },
    })
  }
}
