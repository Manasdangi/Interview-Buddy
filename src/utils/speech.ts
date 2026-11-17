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
/** Stands in for a fenced code block while text is split into sentences (code lines must not be spoken). */
export const codeBlockMarker = '\u27E6code\u27E7'

/** Replaces complete fenced code blocks with a marker that has no newlines. */
export function collapseCodeBlocks(text: string) {
  return text.replace(/```[\s\S]*?```/g, ` ${codeBlockMarker} `)
}

const spokenOperators: Record<string, string> = {
  '===': 'triple equals',
  '==': 'double equals',
  '!==': 'strict not-equals',
  '!=': 'not-equals',
  '=>': 'arrow function',
  '&&': 'and',
  '||': 'or',
  '??': 'nullish coalescing',
  '?.': 'optional chaining',
  '...': 'spread',
}

/** Turns an identifier into words: "mergeIntervals" -> "merge intervals", "Promise.allSettled" -> "Promise all settled". */
function identifierToWords(name: string) {
  return name
    .split('.')
    .map((part) => part.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/_/g, ' '))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * How an interviewer would say inline code out loud: names are read as words, simple field lists as words,
 * and anything literal-heavy (numbers, nested brackets, strings, operators) is pointed to on screen instead.
 */
export function speakInlineCode(code: string): string | null {
  const trimmed = code.trim()
  const call = /^([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)(?:\(.*\))?$/.exec(trimmed)
  if (call && trimmed.length <= 40) return identifierToWords(call[1])

  // e.g. [start, end] or { value, next }
  if (/^[[{(]\s*[A-Za-z_$][\w$]*(\s*,\s*[A-Za-z_$][\w$]*)*\s*[\]})]$/.test(trimmed)) {
    const words = trimmed.match(/[A-Za-z_$][\w$]*/g)?.map(identifierToWords) ?? []
    return words.length > 1 ? `${words.slice(0, -1).join(', ')} and ${words.at(-1)}` : (words[0] ?? null)
  }

  if (/^[A-Za-z]+$/.test(trimmed)) return trimmed
  return spokenOperators[trimmed] ?? null
}

/**
 * What the interviewer says out loud for a message: code is referred to like a person on a call would
 * ("take a look at the code on your screen") instead of being read symbol by symbol, and markdown is dropped.
 */
export function toSpeakableText(text: string) {
  const collapsed = collapseCodeBlocks(text)
  let spoken = ''
  let rest = collapsed
  let markerIndex = rest.indexOf(codeBlockMarker)
  while (markerIndex !== -1) {
    const before = rest.slice(0, markerIndex)
    const lead = `${spoken}${before}`.trim()
    // If the sentence already introduces the code ("...in this snippet:"), a short pointer is enough.
    const introduced = /(snippet|code|below|following|this|here)\W*$/i.test(lead)
    spoken += `${before} ${introduced ? 'Take a moment to read it on your screen.' : 'Take a look at the code on your screen.'} `
    rest = rest.slice(markerIndex + codeBlockMarker.length)
    markerIndex = rest.indexOf(codeBlockMarker)
  }
  spoken += rest

  return spoken
    .replace(/(for example|e\.g\.|like|such as|here)(\s*,?\s*)`([^`]+)`/gi, (_match: string, lead: string, gap: string, code: string) =>
      speakInlineCode(code) === null ? `${lead}, as shown on your screen` : `${lead}${gap}${speakInlineCode(code)}`,
    )
    .replace(/`([^`]+)`/g, (_match, code: string) => speakInlineCode(code) ?? 'the example on your screen')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/[*_#>]+/g, '')
    .replace(/\s+([,.?!:;])/g, '$1')
    .replace(/:\s*(Take a)/g, '. $1')
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

/** Splits off complete sentences from streamed text; very short ones are merged with the next. */
export function takeSentences(buffer: string, minLength = 24) {
  const sentences: string[] = []
  let rest = buffer
  const boundary = /[.!?](?=\s)|\n/g
  let start = 0
  let match: RegExpExecArray | null
  while ((match = boundary.exec(rest))) {
    const end = match.index + 1
    const sentence = rest.slice(start, end).trim()
    if (sentence.length >= minLength) {
      sentences.push(sentence)
      start = end
    }
  }
  rest = rest.slice(start)
  return { sentences, rest }
}

