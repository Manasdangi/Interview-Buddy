import { HttpError } from '../utils/httpError.js'
import { createJsonStringFieldStreamer } from './jsonFieldStreamer.js'

// Plain fetch instead of the SDK keeps the serverless bundle small and avoids ESM/CJS interop surprises.
const ANTHROPIC_ENDPOINT = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'
const DEFAULT_MODEL = 'claude-sonnet-5-5'
const TEXT_TIMEOUT_MS = 25_000
// The report writes an ideal answer per question, which takes noticeably longer than a chat turn.
const REPORT_TIMEOUT_MS = 50_000
/** The resume call returns the resume text too, so it gets most of Vercel's 60 s function limit. */
const PDF_TIMEOUT_MS = 56_000
const TEXT_MAX_TOKENS = 1_024
const REPORT_MAX_TOKENS = 6_000
const MAX_RETRIES = 1
// 529 is Anthropic's "overloaded" status.
const RETRYABLE_STATUSES = new Set([500, 502, 503, 504, 529])
const JSON_TOOL_NAME = 'respond'

type ContentBlock = { type: string; text?: string; input?: unknown }

type ClaudeResponse = {
  content?: ContentBlock[]
  stop_reason?: string
  usage?: { input_tokens?: number; output_tokens?: number }
}

type ClaudePayload = {
  model: string
  max_tokens: number
  system: string
  messages: Array<{ role: 'user'; content: string | Array<Record<string, unknown>> }>
  tools?: Array<{ name: string; description: string; input_schema: JsonSchema; eager_input_streaming?: boolean }>
  tool_choice?: { type: 'auto' }
  stream?: boolean
}

type StreamEvent = {
  type?: string
  index?: number
  content_block?: { type?: string; text?: string }
  delta?: { type?: string; text?: string; partial_json?: string; stop_reason?: string }
  error?: { message?: string }
}

/** Standard JSON Schema (lowercase types) describing the object Claude must return. */
export type JsonSchema = Record<string, unknown>

function getApiKey() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new HttpError(500, 'ANTHROPIC_API_KEY is required. Add it to server/.env (or the Vercel environment variables) and restart the backend.')
  }
  return apiKey
}

function getModel() {
  return process.env.ANTHROPIC_MODEL || DEFAULT_MODEL
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function readClaudeError(response: Response, fallback: string) {
  const errorText = await response.text().catch(() => '')
  let message: string
  try {
    message = (JSON.parse(errorText) as { error?: { message?: string } }).error?.message ?? ''
  } catch {
    message = errorText
  }

  if (response.status === 401 || response.status === 403) {
    return new HttpError(500, 'The Claude API key was rejected. Check ANTHROPIC_API_KEY on the backend.')
  }
  if (response.status === 429) {
    return new HttpError(429, 'Claude rate limit or quota reached for this API key. Please wait a moment and try again, or check the usage limits in the Anthropic Console.')
  }
  if (response.status === 529) {
    return new HttpError(503, 'Claude is overloaded right now. Please try again in a moment.')
  }
  return new HttpError(response.status, message || fallback)
}

async function callClaude(payload: ClaudePayload, fallbackMessage: string, timeoutMs: number): Promise<ClaudeResponse> {
  const apiKey = getApiKey()

  for (let attempt = 0; ; attempt += 1) {
    let response: Response
    try {
      response = await fetch(ANTHROPIC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': ANTHROPIC_VERSION,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(timeoutMs),
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new HttpError(504, 'Claude took too long to respond. Please try again.')
      }
      if (attempt < MAX_RETRIES) {
        await sleep(500 * (attempt + 1))
        continue
      }
      throw new HttpError(502, 'Unable to reach Claude. Please try again.')
    }

    if (!response.ok) {
      if (RETRYABLE_STATUSES.has(response.status) && attempt < MAX_RETRIES) {
        await sleep(500 * (attempt + 1))
        continue
      }
      throw await readClaudeError(response, fallbackMessage)
    }

    const data = (await response.json()) as ClaudeResponse
    if (process.env.NODE_ENV === 'development' && data.usage) {
      console.log('Claude usage', data.usage)
    }
    return data
  }
}

function buildPayload(systemPrompt: string, userPrompt: string, maxTokens: number, schema?: JsonSchema): ClaudePayload {
  return {
    model: getModel(),
    max_tokens: maxTokens,
    system: schema
      ? `${systemPrompt}\n\nAlways give your final answer by calling the "${JSON_TOOL_NAME}" tool exactly once, with input that matches its schema. Do not answer in plain text.`
      : systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    // A tool whose input schema is ours makes Claude return a schema-shaped JSON object. tool_choice stays "auto"
    // because some models reject forced tool use ("tool"/"any"); the system prompt asks for the tool instead.
    ...(schema
      ? {
          tools: [{ name: JSON_TOOL_NAME, description: 'Return the final answer as structured data.', input_schema: schema }],
          tool_choice: { type: 'auto' as const },
        }
      : {}),
  }
}

export async function generateText(systemPrompt: string, userPrompt: string) {
  const data = await callClaude(buildPayload(systemPrompt, userPrompt, TEXT_MAX_TOKENS), 'Claude could not generate a response.', TEXT_TIMEOUT_MS)
  const text = (data.content ?? []).map((block) => (block.type === 'text' ? (block.text ?? '') : '')).join('').trim()
  if (!text) {
    throw new HttpError(502, 'Claude returned an empty response. Please retry.')
  }
  return text
}

/**
 * Streams a Claude response (server-sent events) and assembles it into the same shape as a normal response.
 * `onToolJson` receives the tool input JSON as it arrives. Retries once only if nothing has streamed yet.
 */
async function streamClaude(payload: ClaudePayload, timeoutMs: number, onToolJson: (chunk: string) => void): Promise<ClaudeResponse> {
  const apiKey = getApiKey()

  for (let attempt = 0; ; attempt += 1) {
    let response: Response
    try {
      response = await fetch(ANTHROPIC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': ANTHROPIC_VERSION },
        // eager_input_streaming sends the tool input as it is generated instead of buffering each value.
        body: JSON.stringify({
          ...payload,
          stream: true,
          tools: payload.tools?.map((tool) => ({ ...tool, eager_input_streaming: true })),
        }),
        signal: AbortSignal.timeout(timeoutMs),
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') throw new HttpError(504, 'Claude took too long to respond. Please try again.')
      if (attempt < MAX_RETRIES) {
        await sleep(500 * (attempt + 1))
        continue
      }
      throw new HttpError(502, 'Unable to reach Claude. Please try again.')
    }

    if (!response.ok || !response.body) {
      if (RETRYABLE_STATUSES.has(response.status) && attempt < MAX_RETRIES) {
        await sleep(500 * (attempt + 1))
        continue
      }
      throw await readClaudeError(response, 'Claude could not generate a response.')
    }

    const blocks: Array<{ type: string; text: string; json: string }> = []
    let stopReason: string | undefined
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let pending = ''

    const handle = (event: StreamEvent) => {
      if (event.type === 'content_block_start' && typeof event.index === 'number') {
        blocks[event.index] = { type: event.content_block?.type ?? 'text', text: event.content_block?.text ?? '', json: '' }
      } else if (event.type === 'content_block_delta' && typeof event.index === 'number') {
        const block = blocks[event.index] ?? (blocks[event.index] = { type: 'text', text: '', json: '' })
        if (event.delta?.type === 'input_json_delta' && event.delta.partial_json) {
          block.json += event.delta.partial_json
          onToolJson(event.delta.partial_json)
        } else if (event.delta?.type === 'text_delta' && event.delta.text) {
          block.text += event.delta.text
        }
      } else if (event.type === 'message_delta') {
        stopReason = event.delta?.stop_reason ?? stopReason
      } else if (event.type === 'error') {
        throw new HttpError(event.error?.message?.toLowerCase().includes('overload') ? 503 : 502, event.error?.message || 'Claude stopped unexpectedly. Please retry.')
      }
    }

    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      pending += decoder.decode(value, { stream: true })
      let boundary = pending.indexOf('\n\n')
      while (boundary !== -1) {
        const rawEvent = pending.slice(0, boundary)
        pending = pending.slice(boundary + 2)
        const data = rawEvent
          .split('\n')
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).trim())
          .join('')
        if (data) handle(JSON.parse(data) as StreamEvent)
        boundary = pending.indexOf('\n\n')
      }
    }

    return {
      stop_reason: stopReason,
      content: blocks.filter(Boolean).map((block) => {
        if (block.type !== 'tool_use') return { type: block.type, text: block.text }
        try {
          return { type: 'tool_use', input: block.json ? JSON.parse(block.json) : {} }
        } catch {
          return { type: 'text', text: block.json }
        }
      }),
    }
  }
}

type GenerateJsonOptions = {
  long?: boolean
  /** Streams the reply and calls this with each new piece of the "message" field as Claude writes it. */
  onMessageDelta?: (text: string) => void
}

/** Returns raw JSON text shaped by `schema`; callers still validate the shape. */
export async function generateJson(systemPrompt: string, userPrompt: string, schema: JsonSchema, options?: GenerateJsonOptions) {
  const long = options?.long ?? false
  const payload = buildPayload(systemPrompt, userPrompt, long ? REPORT_MAX_TOKENS : TEXT_MAX_TOKENS, schema)
  const timeoutMs = long ? REPORT_TIMEOUT_MS : TEXT_TIMEOUT_MS
  const onMessageDelta = options?.onMessageDelta
  const data = onMessageDelta
    ? await (() => {
        const streamer = createJsonStringFieldStreamer('message', onMessageDelta)
        return streamClaude(payload, timeoutMs, (chunk) => streamer.push(chunk))
      })()
    : await callClaude(payload, 'Claude could not generate a response.', timeoutMs)

  const toolUse = (data.content ?? []).find((block) => block.type === 'tool_use')
  if (data.stop_reason === 'max_tokens') {
    throw new HttpError(502, 'Claude\'s response was cut off. Please retry.')
  }
  if (toolUse && toolUse.input !== undefined && toolUse.input !== null) {
    return JSON.stringify(toolUse.input)
  }

  // The model answered in text instead of calling the tool: hand back the text for the tolerant JSON parser.
  const text = (data.content ?? []).map((block) => (block.type === 'text' ? (block.text ?? '') : '')).join('').trim()
  if (!text) {
    throw new HttpError(502, 'Claude returned an empty response. Please retry.')
  }
  return text
}

/**
 * Like generateJson, but sends a PDF alongside the prompt; Claude reads the document natively
 * (text and layout), so no PDF parsing is needed on our side.
 */
export async function generateJsonFromPdf(systemPrompt: string, pdfBase64: string, userPrompt: string, schema: JsonSchema, maxTokens = REPORT_MAX_TOKENS) {
  const payload = buildPayload(systemPrompt, userPrompt, maxTokens, schema)
  payload.messages = [
    {
      role: 'user',
      content: [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
        { type: 'text', text: userPrompt },
      ],
    },
  ]
  const data = await callClaude(payload, 'Claude could not review the resume.', PDF_TIMEOUT_MS)
  if (data.stop_reason === 'max_tokens') {
    throw new HttpError(502, 'The review was cut off. Please retry.')
  }
  const toolUse = (data.content ?? []).find((block) => block.type === 'tool_use')
  if (toolUse && toolUse.input !== undefined && toolUse.input !== null) {
    return JSON.stringify(toolUse.input)
  }
  const text = (data.content ?? []).map((block) => (block.type === 'text' ? (block.text ?? '') : '')).join('').trim()
  if (!text) {
    throw new HttpError(502, 'Claude returned an empty response. Please retry.')
  }
  return text
}
