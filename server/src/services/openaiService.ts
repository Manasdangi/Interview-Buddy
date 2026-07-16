const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent'
const CACHE_DURATION_SECONDS = 3600 // 1 hour

export class GeminiServiceError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
  }
}

type GeminiContentPart = {
  text?: string
}

type GeminiContent =
  | string
  | GeminiContentPart[]
  | {
      parts?: GeminiContentPart[]
    }

type GeminiResponse = {
  candidates?: Array<{ content?: GeminiContent }>
  output?: Array<{ content?: GeminiContent }>
  usageMetadata?: {
    cacheCreationTokenCount?: number
    cacheReadTokens?: number
    inputTokens?: number
    outputTokens?: number
  }
}

type GeminiPayload = {
  contents: Array<{ parts: Array<{ text?: string; inline_data?: unknown }> }>
  systemInstruction?: { parts: Array<{ text: string }> }
  cachedContent?: {
    expireTime: string
    ttl?: string
  }
}

function getApiKey() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new GeminiServiceError(500, 'GEMINI_API_KEY is required. Add it to server/.env and restart the backend.')
  }
  return apiKey
}

function buildCacheExpireTime(durationSeconds: number = CACHE_DURATION_SECONDS): string {
  const futureDate = new Date(Date.now() + durationSeconds * 1000)
  return futureDate.toISOString()
}

async function readGeminiError(response: Response, fallback: string) {
  let message: string
  const errorText = await response.text().catch(() => '')

  try {
    const payload = JSON.parse(errorText) as { error?: { message?: string; status?: string } }

    if (response.status === 429 || payload.error?.status === 'RESOURCE_EXHAUSTED') {
      return new GeminiServiceError(
        429,
        'Gemini quota is exhausted for this API key. Please wait for the quota reset or add billing/upgrade the Gemini plan, then click Send answer again.',
      )
    }

    message = payload.error?.message ?? fallback
  } catch {
    message = errorText || fallback
  }

  return new GeminiServiceError(response.status, message)
}

export async function createAiResponse(systemPrompt: string, userPrompt: string, useCache: boolean = true) {
  const apiKey = getApiKey()

  const payload: GeminiPayload = {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        parts: [
          {
            text: userPrompt,
          },
        ],
      },
    ],
  }

  // Add cache control for frequently used system prompts
  if (useCache) {
    payload.cachedContent = {
      expireTime: buildCacheExpireTime(),
    }
  }

  const response = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey as string,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw await readGeminiError(response, 'Gemini could not generate a response.')
  }

  const data = (await response.json()) as GeminiResponse
  const content = data?.candidates?.[0]?.content ?? data?.output?.[0]?.content
  if (!content) {
    throw new GeminiServiceError(502, 'Gemini returned an invalid response. Please retry.')
  }

  if (typeof content === 'string') {
    return content.trim()
  }

  if (Array.isArray(content)) {
    return content.map((item) => item.text ?? '').join('').trim()
  }

  if (typeof content === 'object' && Array.isArray(content.parts)) {
    return content.parts.map((item) => item.text ?? '').join('').trim()
  }

  return String(content).trim()
}

export async function transcribeAudio(audioBase64: string, mimeType: string) {
  const apiKey = getApiKey()

  const payload: GeminiPayload = {
    systemInstruction: {
      parts: [{ text: 'Transcribe this interview answer audio. Return only the spoken words, with no commentary.' }],
    },
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: audioBase64,
            },
          },
        ],
      },
    ],
  }

  const response = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw await readGeminiError(response, 'Gemini could not transcribe the voice recording.')
  }

  const data = (await response.json()) as GeminiResponse
  const content = data?.candidates?.[0]?.content ?? data?.output?.[0]?.content
  if (!content) {
    throw new GeminiServiceError(502, 'Gemini returned an invalid transcription response. Please retry.')
  }

  if (typeof content === 'string') {
    return content.trim()
  }

  if (Array.isArray(content)) {
    return content.map((item) => item.text ?? '').join('').trim()
  }

  if (typeof content === 'object' && Array.isArray(content.parts)) {
    return content.parts.map((item) => item.text ?? '').join('').trim()
  }

  return String(content).trim()
}
