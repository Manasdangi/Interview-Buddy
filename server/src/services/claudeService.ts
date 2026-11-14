import { HttpError } from '../utils/httpError.js'

// Plain fetch instead of the SDK keeps the serverless bundle small and avoids ESM/CJS interop surprises.
const ANTHROPIC_ENDPOINT = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'
const DEFAULT_MODEL = 'claude-sonnet-5-5'
const TEXT_TIMEOUT_MS = 25_000
// The report writes an ideal answer per question, which takes noticeably longer than a chat turn.
const REPORT_TIMEOUT_MS = 50_000
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
  messages: Array<{ role: 'user'; content: string }>
  tools?: Array<{ name: string; description: string; input_schema: JsonSchema }>
  tool_choice?: { type: 'auto' }
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

/** Returns raw JSON text shaped by `schema`; callers still validate the shape. */
export async function generateJson(systemPrompt: string, userPrompt: string, schema: JsonSchema, options?: { long?: boolean }) {
  const long = options?.long ?? false
  const data = await callClaude(
    buildPayload(systemPrompt, userPrompt, long ? REPORT_MAX_TOKENS : TEXT_MAX_TOKENS, schema),
    'Claude could not generate a response.',
    long ? REPORT_TIMEOUT_MS : TEXT_TIMEOUT_MS,
  )

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
