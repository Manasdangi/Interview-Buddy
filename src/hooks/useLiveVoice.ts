import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LiveSpeaker } from '../utils/liveSpeaker'
import { getEnglishVoices, pickDefaultVoice } from '../utils/speech'
import type { VoicePhase } from './useVoiceInterview'

type SpeechRecognitionResultLike = { isFinal: boolean; 0: { transcript: string } }
type SpeechRecognitionEventLike = { resultIndex: number; results: ArrayLike<SpeechRecognitionResultLike> }
type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

function getRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

/**
 * Live voice needs the browser's own streaming speech recognition (Chrome, Edge). Brave exposes the API but its
 * recognition service does not work, so it uses the record-and-transcribe voice mode instead.
 */
export function isLiveVoiceSupported() {
  if (typeof navigator === 'undefined') return false
  const isBrave = Boolean((navigator as Navigator & { brave?: unknown }).brave)
  return Boolean(getRecognitionConstructor()) && !isBrave
}

/** Pause after the candidate stops talking before the answer is sent. */
const endOfAnswerMs = 1800
/** Recognition errors that mean live voice cannot work here; fall back to the other voice mode. */
const fatalErrors = new Set(['network', 'not-allowed', 'service-not-allowed', 'audio-capture', 'language-not-supported'])

const words = (text: string) => text.toLowerCase().match(/[a-z0-9']+/g) ?? []

type UseLiveVoiceOptions = {
  enabled: boolean
  sessionId: string
  /** The interviewer's newest message when it is waiting for an answer; null while the interviewer is thinking. */
  pendingQuestion: { id: string; content: string } | null
  /** Sends the answer, streaming the interviewer's reply into `onDelta`. Resolves false if it failed. */
  submit: (answer: string, onDelta: (text: string) => void) => Promise<boolean>
  onTranscript?: (transcript: string | null) => void
  /** Live voice cannot run in this browser (e.g. recognition service blocked). */
  onUnavailable?: (reason: string) => void
}

/**
 * ChatGPT-style live voice for Chrome: the candidate's words appear as they speak, the answer is sent when they
 * pause, the interviewer's reply is spoken sentence by sentence while it streams, and talking over the
 * interviewer interrupts it.
 */
export function useLiveVoice({ enabled, sessionId, pendingQuestion, submit, onTranscript, onUnavailable }: UseLiveVoiceOptions) {
  const [phase, setPhase] = useState<VoicePhase>('off')
  const [error, setError] = useState<string | null>(null)
  const [level, setLevel] = useState(0)
  const [retryAnswer, setRetryAnswer] = useState<string | null>(null)

  const phaseRef = useRef<VoicePhase>('off')
  const finalTextRef = useRef('')
  const interimTextRef = useRef('')
  const silenceTimerRef = useRef<number | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const enabledRef = useRef(enabled)
  const spokenIdsRef = useRef(new Set<string>())
  const streamedRef = useRef(false)
  const callbacksRef = useRef({ submit, onTranscript, onUnavailable })
  const speakerRef = useRef<LiveSpeaker | null>(null)

  useEffect(() => {
    callbacksRef.current = { submit, onTranscript, onUnavailable }
    enabledRef.current = enabled
  }, [enabled, onTranscript, onUnavailable, submit])

  const fallbackVoice = useMemo(() => {
    const voices = getEnglishVoices()
    return voices.find((voice) => voice.lang.toLowerCase().replace('_', '-') === 'en-in') ?? pickDefaultVoice(voices)
  }, [])

  const setPhaseBoth = useCallback((next: VoicePhase) => {
    phaseRef.current = next
    setPhase(next)
  }, [])

  const clearAnswer = useCallback(() => {
    finalTextRef.current = ''
    interimTextRef.current = ''
    if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current)
    silenceTimerRef.current = null
  }, [])

  const getSpeaker = useCallback(() => {
    if (!speakerRef.current) {
      speakerRef.current = new LiveSpeaker({
        sessionId,
        getFallbackVoice: () => fallbackVoice,
        onIdle: () => {
          // Interviewer finished speaking: the candidate's turn.
          if (!enabledRef.current || phaseRef.current !== 'speaking') return
          clearAnswer()
          setPhaseBoth('listening')
        },
      })
    }
    return speakerRef.current
  }, [clearAnswer, fallbackVoice, sessionId, setPhaseBoth])

  const sendAnswer = useCallback(
    async (answer: string) => {
      const text = answer.trim()
      clearAnswer()
      if (!text) return
      setPhaseBoth('sending')
      setError(null)
      setRetryAnswer(null)
      callbacksRef.current.onTranscript?.(text)
      streamedRef.current = false
      const speaker = getSpeaker()
      speaker.stop()

      let streamed = false
      const ok = await callbacksRef.current.submit(text, (delta) => {
        if (!enabledRef.current) return
        if (!streamed) {
          streamed = true
          streamedRef.current = true
          setPhaseBoth('speaking')
        }
        speaker.feed(delta)
      })
      callbacksRef.current.onTranscript?.(null)
      if (!ok) {
        speaker.stop()
        setRetryAnswer(text)
        setError('Your answer could not be sent. Retry, or answer again.')
        setPhaseBoth('idle')
        return
      }
      if (streamed) speaker.finish()
    },
    [clearAnswer, getSpeaker, setPhaseBoth],
  )

  // Speak interviewer messages that did not arrive as a stream (the first question, or a non-streamed reply).
  useEffect(() => {
    if (!enabled || !pendingQuestion || spokenIdsRef.current.has(pendingQuestion.id)) return
    spokenIdsRef.current.add(pendingQuestion.id)
    if (streamedRef.current) {
      streamedRef.current = false
      return
    }
    clearAnswer()
    setPhaseBoth('speaking')
    getSpeaker().speakAll(pendingQuestion.content)
  }, [clearAnswer, enabled, getSpeaker, pendingQuestion, setPhaseBoth])

  // Run speech recognition for the whole live session; it restarts itself whenever the browser ends it.
  useEffect(() => {
    if (!enabled) return undefined
    const Recognition = getRecognitionConstructor()
    if (!Recognition) {
      callbacksRef.current.onUnavailable?.('Live voice is not supported in this browser.')
      return undefined
    }

    let active = true
    const recognition = new Recognition()
    recognition.lang = 'en-IN'
    recognition.continuous = true
    recognition.interimResults = true
    recognitionRef.current = recognition

    recognition.onresult = (event) => {
      let finalText = ''
      let interim = ''
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        if (result.isFinal) finalText += result[0].transcript
        else interim += result[0].transcript
      }

      const current = phaseRef.current
      if (current === 'sending' || current === 'waiting' || current === 'off') return

      if (current === 'speaking') {
        // Ignore the interviewer's own voice coming back through the speakers; real talking interrupts it.
        const heard = words(`${finalText} ${interim}`)
        const spoken = new Set(words(speakerRef.current?.spokenText ?? ''))
        const fresh = heard.filter((word) => !spoken.has(word))
        if (heard.length < 3 || fresh.length < 2) return
        speakerRef.current?.stop()
        setPhaseBoth('listening')
      }

      if (finalText) finalTextRef.current = `${finalTextRef.current} ${finalText}`.trim()
      interimTextRef.current = interim
      const combined = `${finalTextRef.current} ${interim}`.trim()
      if (phaseRef.current === 'idle') setPhaseBoth('listening')
      callbacksRef.current.onTranscript?.(combined || null)
      setLevel(0.6)
      window.setTimeout(() => setLevel(0), 180)

      if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = window.setTimeout(() => {
        const answer = `${finalTextRef.current} ${interimTextRef.current}`.trim()
        if (phaseRef.current === 'listening' && answer) void sendAnswer(answer)
      }, endOfAnswerMs)
    }

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return
      if (fatalErrors.has(event.error)) {
        active = false
        callbacksRef.current.onUnavailable?.(
          event.error === 'not-allowed' || event.error === 'service-not-allowed'
            ? 'Microphone permission was denied.'
            : 'Live voice is not available in this browser.',
        )
      }
    }

    recognition.onend = () => {
      if (!active) return
      try {
        recognition.start()
      } catch {
        // Already started.
      }
    }

    try {
      recognition.start()
    } catch {
      // Already started.
    }

    return () => {
      active = false
      recognition.onend = null
      recognition.abort()
      recognitionRef.current = null
    }
  }, [enabled, sendAnswer, setPhaseBoth])

  // Turning live voice off stops speaking; turning it back on reads the current question again.
  useEffect(() => {
    if (enabled) return undefined
    speakerRef.current?.stop()
    spokenIdsRef.current.clear()
    streamedRef.current = false
    phaseRef.current = 'off'
    return undefined
  }, [enabled])

  useEffect(() => () => speakerRef.current?.stop(), [])

  const finishAnswer = useCallback(() => {
    void sendAnswer(`${finalTextRef.current} ${interimTextRef.current}`)
  }, [sendAnswer])

  const answerNow = useCallback(() => {
    speakerRef.current?.stop()
    clearAnswer()
    setError(null)
    setPhaseBoth('listening')
  }, [clearAnswer, setPhaseBoth])

  const retrySend = useCallback(() => {
    if (retryAnswer) void sendAnswer(retryAnswer)
  }, [retryAnswer, sendAnswer])

  const visiblePhase: VoicePhase = !enabled ? 'off' : !pendingQuestion && phase !== 'sending' && phase !== 'speaking' ? 'waiting' : phase

  return {
    phase: visiblePhase,
    level,
    error,
    finishAnswer,
    answerNow,
    retrySend,
    canRetrySend: Boolean(retryAnswer) && visiblePhase === 'idle',
  }
}
