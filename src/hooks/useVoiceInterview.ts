import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { transcribeVoice } from '../services/interviewApi'
import { getEnglishVoices, isSpeechSynthesisSupported, pickDefaultVoice, speak, voiceStorageKey } from '../utils/speech'

export type VoicePhase = 'off' | 'speaking' | 'listening' | 'transcribing' | 'sending' | 'waiting' | 'idle'

type LatestInterviewerMessage = { id: string; content: string } | null

type UseVoiceInterviewOptions = {
  enabled: boolean
  sessionId: string
  /** The interviewer's newest message when it is waiting for an answer; null while the interviewer is thinking. */
  pendingQuestion: LatestInterviewerMessage
  /** Sends the transcribed answer; resolves to false when it could not be sent. */
  onSubmit: (answer: string) => Promise<boolean>
  onTranscript?: (transcript: string | null) => void
}

/** How long the candidate must stay quiet, after speaking, before the answer counts as finished. */
const silenceMs = 2400
/** Give up listening if nothing is said at all. */
const noSpeechMs = 15_000
/** Keep each recording under the server's upload limit (about 3 minutes). */
const maxRecordingMs = 150_000
const calibrationMs = 600
const minSpeechLevel = 0.015
/** Even in a noisy room the speech threshold stays below this, so an answer that starts during calibration is still heard. */
const maxSpeechThreshold = 0.04
const minBlobBytes = 800

function getRecorderMimeType() {
  const options = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
  return options.find((type) => MediaRecorder.isTypeSupported(type)) ?? ''
}

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve((typeof reader.result === 'string' ? reader.result : '').split(',')[1] ?? '')
    reader.onerror = () => reject(new Error('Unable to read voice recording.'))
    reader.readAsDataURL(blob)
  })
}

export function useVoiceInterview({ enabled, sessionId, pendingQuestion, onSubmit, onTranscript }: UseVoiceInterviewOptions) {
  const [internalPhase, setPhase] = useState<VoicePhase>('off')
  const [activeQuestion, setActiveQuestion] = useState<LatestInterviewerMessage>(null)
  const [level, setLevel] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [retryTranscript, setRetryTranscript] = useState<string | null>(null)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => getEnglishVoices())
  const [voiceName, setVoiceNameState] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem(voiceStorageKey)
    } catch {
      return null
    }
  })

  const supported = useMemo(
    () => typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== 'undefined',
    [],
  )

  const onSubmitRef = useRef(onSubmit)
  const onTranscriptRef = useRef(onTranscript)
  const sessionIdRef = useRef(sessionId)
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const cancelSpeechRef = useRef<(() => void) | null>(null)
  const stopListeningRef = useRef<((transcribe: boolean) => void) | null>(null)
  const cleanupRecordingRef = useRef<(() => void) | null>(null)
  const generationRef = useRef(0)

  useEffect(() => {
    onSubmitRef.current = onSubmit
    onTranscriptRef.current = onTranscript
    sessionIdRef.current = sessionId
  }, [onSubmit, onTranscript, sessionId])

  const activeVoice = useMemo(() => pickDefaultVoice(voices, voiceName), [voices, voiceName])

  useEffect(() => {
    voiceRef.current = activeVoice
  }, [activeVoice])

  useEffect(() => {
    if (!isSpeechSynthesisSupported()) return undefined
    const refresh = () => setVoices(getEnglishVoices())
    refresh()
    window.speechSynthesis.addEventListener('voiceschanged', refresh)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', refresh)
  }, [])

  const setVoiceName = useCallback((name: string) => {
    setVoiceNameState(name)
    try {
      window.localStorage.setItem(voiceStorageKey, name)
    } catch {
      // Remembering the voice is a convenience only.
    }
  }, [])

  const stopEverything = useCallback(() => {
    generationRef.current += 1
    cancelSpeechRef.current?.()
    cancelSpeechRef.current = null
    stopListeningRef.current?.(false)
    stopListeningRef.current = null
    cleanupRecordingRef.current?.()
    cleanupRecordingRef.current = null
  }, [])

  const submitTranscript = useCallback(async (transcript: string) => {
    setRetryTranscript(transcript)
    onTranscriptRef.current?.(transcript)
    setPhase('sending')
    const sent = await onSubmitRef.current(transcript)
    onTranscriptRef.current?.(null)

    if (sent) {
      setRetryTranscript(null)
      setPhase('waiting')
    } else {
      setPhase('idle')
      setError('Your answer was transcribed but could not be sent. Click "Send again" to retry.')
    }
  }, [])

  const listen = useCallback(async () => {
    if (!supported) {
      setError('Voice recording is not supported in this browser.')
      setPhase('idle')
      return
    }

    const generation = generationRef.current
    setError(null)
    setPhase('listening')

    let stream: MediaStream | null = null
    let audioContext: AudioContext | null = null
    let interval: number | undefined

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
      if (generation !== generationRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      const mimeType = getRecorderMimeType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      const chunks: Blob[] = []
      let shouldTranscribe = true
      let stopped = false

      audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 1024
      audioContext.createMediaStreamSource(stream).connect(analyser)
      const samples = new Float32Array(analyser.fftSize)

      const startedAt = Date.now()
      let lastVoiceAt = startedAt
      let speechDetected = false
      let noiseFloor = 0
      let calibrationSamples = 0

      const release = () => {
        window.clearInterval(interval)
        stream?.getTracks().forEach((track) => track.stop())
        void audioContext?.close().catch(() => undefined)
        setLevel(0)
      }

      const stop = (transcribe: boolean) => {
        if (stopped) return
        stopped = true
        shouldTranscribe = transcribe
        window.clearInterval(interval)
        if (recorder.state !== 'inactive') recorder.stop()
        else release()
      }

      stopListeningRef.current = stop
      cleanupRecordingRef.current = release

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data)
      }

      recorder.onstop = () => {
        release()
        if (stopListeningRef.current === stop) stopListeningRef.current = null
        if (generation !== generationRef.current) return

        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
        if (!shouldTranscribe || !speechDetected || blob.size < minBlobBytes) {
          setPhase('idle')
          setError("I didn't hear an answer. Click \"Answer\" when you are ready to speak.")
          return
        }

        setPhase('transcribing')
        void (async () => {
          try {
            const transcript = (await transcribeVoice(sessionIdRef.current, await blobToBase64(blob), blob.type || 'audio/webm')).trim()
            if (generation !== generationRef.current) return
            if (!transcript) {
              setPhase('idle')
              setError("I couldn't make out any words. Click \"Answer\" to try again.")
              return
            }
            await submitTranscript(transcript)
          } catch (transcribeError) {
            if (generation !== generationRef.current) return
            setPhase('idle')
            setError(`${(transcribeError as Error).message || 'Unable to transcribe voice.'} Click "Answer" to try again.`)
          }
        })()
      }

      recorder.start()

      interval = window.setInterval(() => {
        analyser.getFloatTimeDomainData(samples)
        let sum = 0
        for (const sample of samples) sum += sample * sample
        const rms = Math.sqrt(sum / samples.length)
        const now = Date.now()
        setLevel(Math.min(1, rms * 8))

        // Learn the room's background noise first, so a fan or keyboard is not mistaken for speech.
        if (now - startedAt < calibrationMs) {
          noiseFloor = (noiseFloor * calibrationSamples + rms) / (calibrationSamples + 1)
          calibrationSamples += 1
          return
        }

        if (rms > Math.min(maxSpeechThreshold, Math.max(minSpeechLevel, noiseFloor * 2.5))) {
          speechDetected = true
          lastVoiceAt = now
        }

        if (speechDetected && now - lastVoiceAt > silenceMs) stop(true)
        else if (!speechDetected && now - startedAt > noSpeechMs) stop(false)
        else if (now - startedAt > maxRecordingMs) stop(true)
      }, 100)
    } catch (listenError) {
      window.clearInterval(interval)
      stream?.getTracks().forEach((track) => track.stop())
      void audioContext?.close().catch(() => undefined)
      if (generation !== generationRef.current) return
      setPhase('idle')
      setError((listenError as Error).message || 'Microphone permission was denied.')
    }
  }, [submitTranscript, supported])

  // Track which interviewer message is being handled. This adjusts state while rendering (rather than in an
  // effect) so a new question immediately shows the "speaking" state.
  if (!enabled && activeQuestion) {
    setActiveQuestion(null)
    setPhase('off')
    setError(null)
    setRetryTranscript(null)
  } else if (enabled && pendingQuestion && pendingQuestion.id !== activeQuestion?.id) {
    setActiveQuestion(pendingQuestion)
    setPhase('speaking')
    setError(null)
    setRetryTranscript(null)
  }

  // Reads each new interviewer message aloud, then opens the microphone. The cleanup stops whatever the
  // previous question left running (speech or recording) when the next question arrives or voice mode ends.
  useEffect(() => {
    if (!activeQuestion) return undefined

    const generation = ++generationRef.current
    cancelSpeechRef.current = speak(activeQuestion.content, {
      voice: voiceRef.current,
      onEnd: () => {
        cancelSpeechRef.current = null
        if (generation === generationRef.current) void listen()
      },
    })

    return stopEverything
  }, [activeQuestion, listen, stopEverything])

  useEffect(() => stopEverything, [stopEverything])

  /** Ends the current recording and sends what was said, without waiting for the silence timer. */
  const finishAnswer = useCallback(() => stopListeningRef.current?.(true), [])

  /** Cuts the interviewer short and starts listening straight away. */
  const skipSpeaking = useCallback(() => {
    cancelSpeechRef.current?.()
    cancelSpeechRef.current = null
    void listen()
  }, [listen])

  const answerNow = useCallback(() => {
    stopEverything()
    void listen()
  }, [listen, stopEverything])

  const retrySend = useCallback(() => {
    if (retryTranscript) void submitTranscript(retryTranscript)
  }, [retryTranscript, submitTranscript])

  const showWaiting = enabled && !pendingQuestion && internalPhase !== 'sending' && internalPhase !== 'transcribing'
  const phase: VoicePhase = !enabled ? 'off' : showWaiting ? 'waiting' : internalPhase

  return {
    phase,
    level,
    error,
    supported,
    voices,
    voiceName: activeVoice?.name ?? null,
    setVoiceName,
    finishAnswer,
    skipSpeaking,
    answerNow,
    retrySend,
    canRetrySend: Boolean(retryTranscript) && phase === 'idle',
  }
}
