import { HttpError } from '../utils/httpError.js'

// Claude's API does not accept audio, so voice answers are still transcribed by a dedicated speech model.
const TRANSCRIPTION_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash'
const TRANSCRIPTION_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${TRANSCRIPTION_MODEL}:generateContent`
const AUDIO_TIMEOUT_MS = 40_000
const MAX_RETRIES = 1
const RETRYABLE_STATUSES = new Set([500, 502, 503, 504])

type TranscriptionResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function transcribeAudio(audioBase64: string, mimeType: string) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new HttpError(500, 'Voice answers need GEMINI_API_KEY for speech-to-text. Add it to the backend environment variables, or type your answer instead.')
  }

  for (let attempt = 0; ; attempt += 1) {
    let response: Response
    try {
      response = await fetch(TRANSCRIPTION_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: 'Transcribe this interview answer audio. Return only the spoken words, with no commentary.' }] },
          contents: [{ parts: [{ inline_data: { mime_type: mimeType, data: audioBase64 } }] }],
        }),
        signal: AbortSignal.timeout(AUDIO_TIMEOUT_MS),
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new HttpError(504, 'Transcription took too long. Please try again.')
      }
      if (attempt < MAX_RETRIES) {
        await sleep(500 * (attempt + 1))
        continue
      }
      throw new HttpError(502, 'Unable to reach the transcription service. Please try again.')
    }

    if (!response.ok) {
      if (RETRYABLE_STATUSES.has(response.status) && attempt < MAX_RETRIES) {
        await sleep(500 * (attempt + 1))
        continue
      }
      throw new HttpError(response.status === 429 ? 429 : 502, 'Could not transcribe the voice recording. Please try again or type your answer.')
    }

    const data = (await response.json()) as TranscriptionResponse
    const text = (data.candidates?.[0]?.content?.parts ?? []).map((part) => part.text ?? '').join('').trim()
    if (!text) {
      throw new HttpError(502, 'The transcription came back empty. Please try again.')
    }
    return text
  }
}
