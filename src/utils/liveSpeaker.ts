import { synthesizeSpeech } from '../services/interviewApi'
import { isSpeechSynthesisSupported, takeSentences, toSpeakableText } from './speech'

/** A tiny silent WAV, played during a click so later (non-click) playback is allowed on mobile browsers. */
const silentWav = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA='

let sharedAudio: HTMLAudioElement | null = null
function getAudio() {
  if (!sharedAudio && typeof Audio !== 'undefined') sharedAudio = new Audio()
  return sharedAudio
}

/** Call from a click/tap handler before live voice starts. */
export function unlockAudio() {
  const audio = getAudio()
  if (!audio) return
  audio.src = silentWav
  void audio.play().catch(() => undefined)
  if (isSpeechSynthesisSupported()) window.speechSynthesis.resume()
}

/** After a couple of failures, stop asking the server for the natural voice for the rest of the visit. */
let naturalFailures = 0
const maxNaturalFailures = 2

type SpeakerOptions = {
  sessionId: string
  /** Browser voice used when the natural voice is unavailable. */
  getFallbackVoice?: () => SpeechSynthesisVoice | null
  onStart?: () => void
  /** Everything queued has been spoken (not called after stop()). */
  onIdle?: () => void
}

type QueueItem = { text: string; audio: Promise<string | null> }

/**
 * Speaks interviewer text sentence by sentence in a natural Indian-English voice (server TTS), fetching the next
 * sentence while the current one plays. Falls back to the browser's voice if the natural voice is unavailable.
 */
export class LiveSpeaker {
  private queue: QueueItem[] = []
  private buffer = ''
  private ended = false
  private playing = false
  private generation = 0
  private stopCurrent: (() => void) | null = null
  /** Everything spoken in the current turn, used to recognise the interviewer's own voice as echo. */
  spokenText = ''

  private readonly options: SpeakerOptions

  constructor(options: SpeakerOptions) {
    this.options = options
  }

  get speaking() {
    return this.playing || this.queue.length > 0
  }

  /** Adds streamed reply text; complete sentences start speaking straight away. */
  feed(delta: string) {
    this.ended = false
    this.buffer += delta
    const { sentences, rest } = takeSentences(this.buffer)
    this.buffer = rest
    sentences.forEach((sentence) => this.enqueue(sentence))
  }

  /** The reply is complete: speak whatever is left. */
  finish() {
    const rest = this.buffer.trim()
    this.buffer = ''
    this.ended = true
    if (rest) this.enqueue(rest)
    else this.checkIdle()
  }

  speakAll(text: string) {
    this.stop()
    this.feed(text)
    this.finish()
  }

  stop() {
    this.generation += 1
    this.queue = []
    this.buffer = ''
    this.ended = true
    this.playing = false
    this.spokenText = ''
    this.stopCurrent?.()
    this.stopCurrent = null
  }

  private enqueue(raw: string) {
    const text = toSpeakableText(raw)
    if (!text) return
    this.spokenText += ` ${text}`
    this.queue.push({ text, audio: this.fetchAudio(text) })
    void this.pump()
  }

  private async fetchAudio(text: string) {
    if (naturalFailures >= maxNaturalFailures) return null
    try {
      const { audioBase64, mimeType } = await synthesizeSpeech(this.options.sessionId, text)
      naturalFailures = 0
      const bytes = Uint8Array.from(atob(audioBase64), (char) => char.charCodeAt(0))
      return URL.createObjectURL(new Blob([bytes], { type: mimeType }))
    } catch {
      naturalFailures += 1
      return null
    }
  }

  private checkIdle() {
    if (!this.playing && !this.queue.length && this.ended) this.options.onIdle?.()
  }

  private async pump() {
    if (this.playing) return
    const item = this.queue[0]
    if (!item) return this.checkIdle()

    const generation = this.generation
    this.playing = true
    this.options.onStart?.()
    const url = await item.audio
    if (generation !== this.generation) {
      if (url) URL.revokeObjectURL(url)
      return
    }

    const next = () => {
      if (generation !== this.generation) return
      if (url) URL.revokeObjectURL(url)
      this.stopCurrent = null
      this.queue.shift()
      this.playing = false
      void this.pump()
    }

    if (url && (await this.playAudio(url, next))) return
    this.speakWithBrowser(item.text, next)
  }

  /** Resolves false if the browser refused to play (autoplay rules), so the caller can fall back. */
  private async playAudio(url: string, onDone: () => void) {
    const audio = getAudio()
    if (!audio) return false
    audio.onended = onDone
    audio.onerror = onDone
    audio.src = url
    this.stopCurrent = () => {
      audio.onended = null
      audio.onerror = null
      audio.pause()
    }
    try {
      await audio.play()
      return true
    } catch {
      this.stopCurrent = null
      return false
    }
  }

  private speakWithBrowser(text: string, onDone: () => void) {
    if (!isSpeechSynthesisSupported()) return onDone()
    const utterance = new SpeechSynthesisUtterance(text)
    const voice = this.options.getFallbackVoice?.() ?? null
    if (voice) {
      utterance.voice = voice
      utterance.lang = voice.lang
    } else {
      utterance.lang = 'en-IN'
    }
    let done = false
    const finish = () => {
      if (done) return
      done = true
      window.clearTimeout(watchdog)
      onDone()
    }
    utterance.onend = finish
    utterance.onerror = finish
    // Some browsers never fire "end"; never leave the interview stuck.
    const watchdog = window.setTimeout(finish, text.length * 110 + 4000)
    this.stopCurrent = () => {
      done = true
      window.clearTimeout(watchdog)
      window.speechSynthesis.cancel()
    }
    window.speechSynthesis.speak(utterance)
  }
}

/** Speaks a whole message in the natural voice; returns a cancel function. `onEnd` is not called when cancelled. */
export function speakNatural(
  sessionId: string,
  text: string,
  options: { getFallbackVoice?: () => SpeechSynthesisVoice | null; onEnd?: () => void } = {},
) {
  const speaker = new LiveSpeaker({ sessionId, getFallbackVoice: options.getFallbackVoice, onIdle: options.onEnd })
  speaker.speakAll(text)
  return () => speaker.stop()
}
