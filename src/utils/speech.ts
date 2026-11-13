/** Text-to-speech helpers for the interviewer's voice (browser SpeechSynthesis). */

export const voiceStorageKey = 'interview-buddy:voice'

export function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'
}

export function getEnglishVoices() {
  if (!isSpeechSynthesisSupported()) return []
  return window.speechSynthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith('en'))
}

const preferredLanguages = ['en-in', 'en-gb', 'en-us']
const preferredNames = /natural|neural|google|samantha|daniel|google uk|aria|jenny/i

/** Picks a pleasant English voice, preferring Indian/British/US English and "natural" sounding ones. */
export function pickDefaultVoice(voices: SpeechSynthesisVoice[], savedName?: string | null) {
  const saved = savedName ? voices.find((voice) => voice.name === savedName) : undefined
  if (saved) return saved

  const ranked = [...voices].sort((a, b) => {
    const score = (voice: SpeechSynthesisVoice) => {
      const language = preferredLanguages.indexOf(voice.lang.toLowerCase().replace('_', '-'))
      return (language === -1 ? 10 : language) - (preferredNames.test(voice.name) ? 5 : 0)
    }
    return score(a) - score(b)
  })
  return ranked[0] ?? null
}

/** Turns an interviewer message into something pleasant to hear: no markdown symbols, code replaced by a spoken note. */
export function toSpeakableText(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, ' (the code is on your screen) ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*_#>]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Browsers cut off long utterances (Chrome stops around 15 seconds), so speak sentence by sentence. */
export function splitIntoChunks(text: string, maxLength = 220) {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean)
  const chunks: string[] = []

  for (const sentence of sentences) {
    if (sentence.length <= maxLength) {
      chunks.push(sentence)
      continue
    }
    let rest = sentence
    while (rest.length > maxLength) {
      const cut = rest.lastIndexOf(' ', maxLength)
      const at = cut > 40 ? cut : maxLength
      chunks.push(rest.slice(0, at).trim())
      rest = rest.slice(at).trim()
    }
    if (rest) chunks.push(rest)
  }

  return chunks
}

type SpeakOptions = {
  voice?: SpeechSynthesisVoice | null
  rate?: number
  onEnd?: () => void
}

/** Speaks the text and returns a cancel function. `onEnd` runs once when speech finishes or fails, but not when cancelled. */
export function speak(text: string, { voice, rate = 1, onEnd }: SpeakOptions = {}) {
  if (!isSpeechSynthesisSupported()) {
    onEnd?.()
    return () => {}
  }

  const chunks = splitIntoChunks(toSpeakableText(text))
  let cancelled = false
  let finished = false
  const timers: { watchdog?: number } = {}

  const finish = () => {
    if (finished || cancelled) return
    finished = true
    window.clearTimeout(timers.watchdog)
    onEnd?.()
  }

  if (!chunks.length) {
    finish()
    return () => {}
  }

  window.speechSynthesis.cancel()
  chunks.forEach((chunk, index) => {
    const utterance = new SpeechSynthesisUtterance(chunk)
    utterance.rate = rate
    if (voice) {
      utterance.voice = voice
      utterance.lang = voice.lang
    }
    if (index === chunks.length - 1) {
      utterance.onend = finish
    }
    utterance.onerror = (event) => {
      // "canceled"/"interrupted" come from our own cancel(); anything else should not leave the interview stuck.
      if (event.error !== 'canceled' && event.error !== 'interrupted') finish()
    }
    window.speechSynthesis.speak(utterance)
  })

  // Some browsers never fire `end`; do not leave the interview waiting forever.
  timers.watchdog = window.setTimeout(finish, text.length * 110 + 6000)

  return () => {
    cancelled = true
    window.clearTimeout(timers.watchdog)
    window.speechSynthesis.cancel()
  }
}
