import { HttpError } from '../utils/httpError.js'

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash'
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
const TEXT_TIMEOUT_MS = 25_000
const AUDIO_TIMEOUT_MS = 40_000
const MAX_RETRIES = 1
const RETRYABLE_STATUSES = new Set([500, 502, 503, 504])

type GeminiPart = {
  text?: string
  inline_data?: { mime_type: string; data: string }
}

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: GeminiPart[] } }>
  usageMetadata?: {
    promptTokenCount?: number
    cachedContentTokenCount?: number
    candidatesTokenCount?: number
    thoughtsTokenCount?: number
    totalTokenCount?: number
  }
}

type GeminiPayload = {
  systemInstruction: { parts: Array<{ text: string }> }
  contents: Array<{ parts: GeminiPart[] }>
  generationConfig?: {
    responseMimeType?: string
    responseSchema?: unknown
  }
}

export type GeminiSchema = Record<string, unknown>

function getApiKey() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new HttpError(500, 'GEMINI_API_KEY is required. Add it to server/.env and restart the backend.')
  }
  return apiKey
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function readGeminiError(response: Response, fallback: string) {
  const errorText = await response.text().catch(() => '')

  try {
    const payload = JSON.parse(errorText) as { error?: { message?: string; status?: string } }

    if (response.status === 429 || payload.error?.status === 'RESOURCE_EXHAUSTED') {
      return new HttpError(
        429,
        'Gemini quota is exhausted for this API key. Please wait for the quota reset or add billing/upgrade the Gemini plan, then try again.',
      )
    }

    return new HttpError(response.status, payload.error?.message ?? fallback)
  } catch {
    return new HttpError(response.status, errorText || fallback)
  }
}

function extractText(data: GeminiResponse) {
  const parts = data.candidates?.[0]?.content?.parts ?? []
  return parts.map((part) => part.text ?? '').join('').trim()
}

async function callGemini(payload: GeminiPayload, fallbackMessage: string, timeoutMs: number) {
  const apiKey = getApiKey()

  for (let attempt = 0; ; attempt += 1) {
    let response: Response
    try {
      response = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(timeoutMs),
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new HttpError(504, 'Gemini took too long to respond. Please try again.')
      }
      if (attempt < MAX_RETRIES) {
        await sleep(500 * (attempt + 1))
        continue
      }
      throw new HttpError(502, 'Unable to reach Gemini. Please try again.')
    }

    if (!response.ok) {
      if (RETRYABLE_STATUSES.has(response.status) && attempt < MAX_RETRIES) {
        await sleep(500 * (attempt + 1))
        continue
      }
      throw await readGeminiError(response, fallbackMessage)
    }

    const data = (await response.json()) as GeminiResponse
    if (process.env.NODE_ENV === 'development' && data.usageMetadata) {
      console.log('Gemini usage', data.usageMetadata)
    }

    const text = extractText(data)
    if (!text) {
      throw new HttpError(502, 'Gemini returned an empty response. Please retry.')
    }
    return text
  }
}

function buildTextPayload(systemPrompt: string, userPrompt: string, responseSchema?: GeminiSchema): GeminiPayload {
  return {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ parts: [{ text: userPrompt }] }],
    ...(responseSchema
      ? { generationConfig: { responseMimeType: 'application/json', responseSchema } }
      : {}),
  }
}

export function generateText(systemPrompt: string, userPrompt: string) {
  return callGemini(buildTextPayload(systemPrompt, userPrompt), 'Gemini could not generate a response.', TEXT_TIMEOUT_MS)
}

/** Returns raw JSON text constrained by `responseSchema`; callers still validate the shape. */
export function generateJson(systemPrompt: string, userPrompt: string, responseSchema: GeminiSchema) {
  return callGemini(buildTextPayload(systemPrompt, userPrompt, responseSchema), 'Gemini could not generate a response.', TEXT_TIMEOUT_MS)
}

export function transcribeAudio(audioBase64: string, mimeType: string) {
  return callGemini(
    {
      systemInstruction: {
        parts: [{ text: 'Transcribe this interview answer audio. Return only the spoken words, with no commentary.' }],
      },
      contents: [{ parts: [{ inline_data: { mime_type: mimeType, data: audioBase64 } }] }],
    },
    'Gemini could not transcribe the voice recording.',
    AUDIO_TIMEOUT_MS,
  )
}
