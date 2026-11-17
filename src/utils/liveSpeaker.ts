import { openSpeechStream } from '../services/interviewApi'
import { collapseCodeBlocks, isSpeechSynthesisSupported, takeSentences, toSpeakableText } from './speech'

const sampleRate = 24_000
/** Group tiny network chunks into ~0.2 s buffers for smooth, gapless playback. */
const minScheduleSamples = 4_800

let audioContext: AudioContext | null = null
function getContext() {
  if (typeof window === 'undefined') return null
  const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Context) return null
  audioContext ??= new Context()
  return audioContext
}

/** True once audio can play without another tap (the audio context is running). */
export function isAudioUnlocked() {
  return audioContext?.state === 'running'
}

/** Call from a click/tap handler before voice starts: browsers only allow audio after a user gesture. */
export function unlockAudio() {
  const context = getContext()
  if (context) {
    void context.resume().catch(() => undefined)
    // A one-sample silent buffer fully unlocks audio on iOS.
    const source = context.createBufferSource()
    source.buffer = context.createBuffer(1, 1, sampleRate)
    source.connect(context.destination)
    source.start()
  }
  if (isSpeechSynthesisSupported()) window.speechSynthesis.resume()
}

/**
 * One interviewer, one voice: once the natural voice fails (after a retry), the rest of the visit uses the browser
 * voice, so sentences never switch between a natural and a robotic voice.
 */
let naturalDisabled = false
/** Fetch audio for the current sentence and the next one only, to stay under the TTS rate limit. */
const prefetchAhead = 2
const retryDelayMs = 900

type SpeakerOptions = {
  sessionId: string
  /** Browser voice used when the natural voice is unavailable. */
  getFallbackVoice?: () => SpeechSynthesisVoice | null
  onStart?: () => void
  /** Everything queued has been spoken (not called after stop()). */
  onIdle?: () => void
}

/** One sentence: its audio streams in from the server (prefetched while earlier sentences play). */
type QueueItem = {
  text: string
  samples: Float32Array[]
  done: boolean
  failed: boolean
  abort: AbortController
  notify: (() => void) | null
  started: boolean
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function startAudioStream(sessionId: string, item: QueueItem) {
  item.started = true
  const finish = (failed: boolean) => {
    item.done = true
    item.failed = failed
    item.notify?.()
  }
  if (naturalDisabled) return finish(true)

  void (async () => {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        await streamOnce()
        return finish(false)
      } catch {
        if (item.abort.signal.aborted) return
        if (item.samples.length) return finish(false)
        if (attempt === 0) await sleep(retryDelayMs)
      }
    }
    naturalDisabled = true
    finish(true)
  })()

  async function streamOnce() {
    const response = await openSpeechStream(sessionId, item.text, item.abort.signal)
    if (!response.ok || !response.body) throw new Error('Natural voice unavailable.')
    const reader = response.body.getReader()
    let leftover: Uint8Array | null = null
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      // 16-bit little-endian samples can be split across network chunks.
      const bytes: Uint8Array = leftover ? new Uint8Array([...leftover, ...value]) : value
      const usable = bytes.length - (bytes.length % 2)
      leftover = usable < bytes.length ? bytes.slice(usable) : null
      const view = new DataView(bytes.buffer, bytes.byteOffset, usable)
      const floats = new Float32Array(usable / 2)
      for (let index = 0; index < floats.length; index += 1) floats[index] = view.getInt16(index * 2, true) / 32768
      if (floats.length) {
        item.samples.push(floats)
        item.notify?.()
      }
    }
    // An empty stream means the server failed after starting (e.g. quota).
    if (!item.samples.length) throw new Error('Natural voice returned no audio.')
  }
}

/**
 * Speaks interviewer text sentence by sentence in a natural Indian-English voice. Each sentence's audio streams
 * from the server and starts playing on the first chunk; later sentences are fetched while earlier ones play.
 * Falls back to the browser's voice if the natural voice or Web Audio is unavailable.
 */
export class LiveSpeaker {
  private queue: QueueItem[] = []
  private buffer = ''
  private ended = false
  private playing = false
  private generation = 0
  private stopCurrent: (() => void) | null = null
  private readonly options: SpeakerOptions
  /** Everything spoken in the current turn, used to recognise the interviewer's own voice as echo. */
  spokenText = ''

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
    // Never split inside a code block that is still streaming; finished blocks become one marker (no newlines).
    const fences = this.buffer.match(/```/g)?.length ?? 0
    const openFenceAt = fences % 2 === 1 ? this.buffer.lastIndexOf('```') : this.buffer.length
    const { sentences, rest } = takeSentences(collapseCodeBlocks(this.buffer.slice(0, openFenceAt)))
    this.buffer = rest + this.buffer.slice(openFenceAt)
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
    this.queue.forEach((item) => item.abort.abort())
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
    const item: QueueItem = { text, samples: [], done: false, failed: false, abort: new AbortController(), notify: null, started: false }
    this.queue.push(item)
    this.prefetch()
    this.pump()
  }

  private prefetch() {
    this.queue.slice(0, prefetchAhead).forEach((item) => {
      if (!item.started) startAudioStream(this.options.sessionId, item)
    })
  }

  private checkIdle() {
    if (!this.playing && !this.queue.length && this.ended) this.options.onIdle?.()
  }

  private pump() {
    if (this.playing) return
    const item = this.queue[0]
    if (!item) return this.checkIdle()

    const generation = this.generation
    this.playing = true
    this.options.onStart?.()

    const next = () => {
      if (generation !== this.generation) return
      this.stopCurrent = null
      this.queue.shift()
      this.playing = false
      this.prefetch()
      this.pump()
    }

    const context = getContext()
    const begin = () => {
      if (generation !== this.generation) return
      item.notify = null
      // naturalDisabled: keep the whole conversation in one voice once the natural voice has failed.
      if (item.failed || naturalDisabled || !context || context.state !== 'running') {
        this.speakWithBrowser(item.text, next)
        return
      }
      this.playStream(context, item, next)
    }

    // Wait for the first audio (or a failure) before deciding how to speak this sentence.
    if (item.samples.length || item.done) begin()
    else
      item.notify = () => {
        if (item.samples.length || item.done) begin()
      }
  }

  private playStream(context: AudioContext, item: QueueItem, onDone: () => void) {
    const gain = context.createGain()
    gain.connect(context.destination)
    let nextStart = context.currentTime + 0.03
    let scheduled = 0
    let finishTimer: number | undefined

    const finishAfter = () => {
      window.clearTimeout(finishTimer)
      const remaining = Math.max(0, nextStart - context.currentTime)
      finishTimer = window.setTimeout(() => {
        item.notify = null
        gain.disconnect()
        onDone()
      }, remaining * 1000 + 60)
    }

    const schedule = () => {
      const pending = item.samples.slice(scheduled)
      const total = pending.reduce((sum, chunk) => sum + chunk.length, 0)
      if (!total || (total < minScheduleSamples && !item.done)) {
        if (item.done && !total) finishAfter()
        return
      }
      scheduled = item.samples.length
      const merged = new Float32Array(total)
      let offset = 0
      for (const chunk of pending) {
        merged.set(chunk, offset)
        offset += chunk.length
      }
      const audioBuffer = context.createBuffer(1, merged.length, sampleRate)
      audioBuffer.getChannelData(0).set(merged)
      const source = context.createBufferSource()
      source.buffer = audioBuffer
      source.connect(gain)
      if (nextStart < context.currentTime) nextStart = context.currentTime + 0.02
      source.start(nextStart)
      nextStart += audioBuffer.duration
      if (item.done) finishAfter()
    }

    item.notify = schedule
    this.stopCurrent = () => {
      item.notify = null
      window.clearTimeout(finishTimer)
      item.abort.abort()
      gain.disconnect()
    }
    schedule()
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
