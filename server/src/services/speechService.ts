import { HttpError } from '../utils/httpError.js'

// Natural Indian-English interviewer voice via Gemini text-to-speech (returns 24 kHz mono 16-bit PCM).
const TTS_MODEL = process.env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview'
const TTS_VOICE = process.env.GEMINI_TTS_VOICE || 'Charon'
const TTS_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent`
const TTS_TIMEOUT_MS = 20_000
const SAMPLE_RATE = 24_000
export const maxSpeechTextLength = 600

const cache = new Map<string, string>()
const voiceDirection =
  'Read this aloud exactly as written, in a natural Indian English accent, like a calm, friendly senior software engineer from Bengaluru conducting a technical interview. Speak at a relaxed, conversational pace:'
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

  const prompt = `${voiceDirection}\n${text}`

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

const pcmCache = new Map<string, Buffer>()

/**
 * Streams the text as raw 24 kHz mono 16-bit PCM in a natural Indian English voice, calling `onAudio` with each
 * piece as soon as Gemini produces it (first audio usually arrives well under a second).
 */
export async function streamSpeech(text: string, onAudio: (pcm: Buffer) => void) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new HttpError(503, 'Natural voice needs GEMINI_API_KEY on the backend.')

  const cached = pcmCache.get(text)
  if (cached) {
    onAudio(cached)
    return
  }

  let response: Response
  try {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:streamGenerateContent?alt=sse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${voiceDirection}\n${text}` }] }],
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
  if (!response.ok || !response.body) {
    console.error('TTS stream failed', response.status, (await response.text().catch(() => '')).slice(0, 300))
    throw new HttpError(response.status === 429 ? 429 : 502, 'Natural voice is unavailable right now.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  const pieces: Buffer[] = []
  let pending = ''
  const handleEvent = (raw: string) => {
    const data = raw
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim())
      .join('')
    if (!data) return
    const parsed = JSON.parse(data) as TtsResponse
    for (const part of parsed.candidates?.[0]?.content?.parts ?? []) {
      if (!part.inlineData?.data) continue
      const pcm = Buffer.from(part.inlineData.data, 'base64')
      pieces.push(pcm)
      onAudio(pcm)
    }
  }
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    pending += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n')
    let boundary = pending.indexOf('\n\n')
    while (boundary !== -1) {
      handleEvent(pending.slice(0, boundary))
      pending = pending.slice(boundary + 2)
      boundary = pending.indexOf('\n\n')
    }
  }
  if (pending.trim()) handleEvent(pending)
  if (!pieces.length) throw new HttpError(502, 'Natural voice returned no audio.')

  if (pcmCache.size >= cacheLimit) pcmCache.delete(pcmCache.keys().next().value as string)
  pcmCache.set(text, Buffer.concat(pieces))
}
