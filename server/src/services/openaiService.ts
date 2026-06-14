const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent'

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
}

function getApiKey() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is required. Add it to server/.env and restart the backend.')
  }
  return apiKey
}

export async function createAiResponse(systemPrompt: string, userPrompt: string) {
  const apiKey = getApiKey()
  const payload = {
    contents: [
      {
        parts: [
          {
            text: `${systemPrompt}\n\nUser: ${userPrompt}`,
          },
        ],
      },
    ],
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
    const errorText = await response.text()
    throw new Error(`Gemini API error: ${response.status} ${errorText}`)
  }

  const data = (await response.json()) as GeminiResponse
  const content = data?.candidates?.[0]?.content ?? data?.output?.[0]?.content
  if (!content) {
    throw new Error('Invalid Gemini response format')
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
  const payload = {
    contents: [
      {
        parts: [
          {
            text: 'Transcribe this interview answer audio. Return only the spoken words, with no commentary.',
          },
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
    const errorText = await response.text()
    throw new Error(`Gemini transcription error: ${response.status} ${errorText}`)
  }

  const data = (await response.json()) as GeminiResponse
  const content = data?.candidates?.[0]?.content ?? data?.output?.[0]?.content
  if (!content) {
    throw new Error('Invalid Gemini transcription response format')
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
