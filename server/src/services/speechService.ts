import { HttpError } from '../utils/httpError.js'

// Natural Indian-English interviewer voice via Gemini text-to-speech (returns 24 kHz mono 16-bit PCM).
const TTS_MODEL = process.env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview'
const TTS_VOICE = process.env.GEMINI_TTS_VOICE || 'Charon'
const TTS_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent`
const TTS_TIMEOUT_MS = 20_000
const SAMPLE_RATE = 24_000
export const maxSpeechTextLength = 600

const cache = new Map<string, string>()
const cacheLimit = 200

type TtsResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> } }>
}

/** Wraps raw 16-bit mono PCM in a WAV header so browsers can play it. */
export function pcmToWav(pcm: Buffer, sampleRate = SAMPLE_RATE) {
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + pcm.length, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(1, 22)
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(sampleRate * 2, 28)
  header.writeUInt16LE(2, 32)
  header.writeUInt16LE(16, 34)
  header.write('data', 36)
  header.writeUInt32LE(pcm.length, 40)
  return Buffer.concat([header, pcm])
}

/** Returns base64 WAV audio of the text spoken in a natural Indian English interviewer voice. */
export async function synthesizeSpeech(text: string) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new HttpError(503, 'Natural voice needs GEMINI_API_KEY on the backend.')

  const cached = cache.get(text)
  if (cached) return cached

  const prompt = `Read this aloud exactly as written, in a natural Indian English accent, like a calm, friendly senior software engineer from Bengaluru conducting a technical interview. Speak at a relaxed, conversational pace:\n${text}`

  let response: Response
  try {
    response = await fetch(TTS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { languageCode: 'en-IN', voiceConfig: { prebuiltVoiceConfig: { voiceName: TTS_VOICE } } },
        },
      }),
      signal: AbortSignal.timeout(TTS_TIMEOUT_MS),
    })
  } catch {
    throw new HttpError(502, 'Natural voice is unavailable right now.')
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    console.error('TTS failed', response.status, detail.slice(0, 300))
    throw new HttpError(response.status === 429 ? 429 : 502, 'Natural voice is unavailable right now.')
  }

  const data = (await response.json()) as TtsResponse
  const pcmBase64 = data.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data)?.inlineData?.data
  if (!pcmBase64) throw new HttpError(502, 'Natural voice returned no audio.')

  const wavBase64 = pcmToWav(Buffer.from(pcmBase64, 'base64')).toString('base64')
  if (cache.size >= cacheLimit) cache.delete(cache.keys().next().value as string)
  cache.set(text, wavBase64)
  return wavBase64
}

/** Diagnostics only: time to first audio chunk with Gemini's streaming endpoint. */
export async function probeStreamingSpeech(text: string) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new HttpError(503, 'No GEMINI_API_KEY.')
  const started = Date.now()
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:streamGenerateContent?alt=sse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `Read this aloud in a natural Indian English accent:\n${text}` }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: { languageCode: 'en-IN', voiceConfig: { prebuiltVoiceConfig: { voiceName: TTS_VOICE } } },
      },
    }),
  })
  if (!response.ok || !response.body) return { status: response.status, error: (await response.text()).slice(0, 300) }
  const reader = response.body.getReader()
  let firstChunkMs: number | null = null
  let chunks = 0
  let bytes = 0
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    if (firstChunkMs === null) firstChunkMs = Date.now() - started
    chunks += 1
    bytes += value.length
  }
  return { status: response.status, firstChunkMs, totalMs: Date.now() - started, chunks, bytes }
}
