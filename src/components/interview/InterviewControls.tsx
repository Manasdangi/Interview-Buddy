import { Mic, MicOff, Radio, RotateCcw, Send, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { transcribeVoice } from '../../services/interviewApi'
import { cn } from '../../utils/cn'
import { Button } from '../ui/Button'

type InterviewControlsProps = {
  onSubmit: (value: string) => Promise<boolean>
  onComplete: () => Promise<void>
  onVoiceStart?: () => void
  onVoiceTranscript?: (value: string | null) => void
  loading: boolean
  disabled: boolean
}

function getPreferredMimeType() {
  const options = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
  return options.find((type) => MediaRecorder.isTypeSupported(type)) ?? ''
}

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      resolve(result.split(',')[1] ?? '')
    }
    reader.onerror = () => reject(new Error('Unable to read voice recording.'))
    reader.readAsDataURL(blob)
  })
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop())
}

export function InterviewControls({ onSubmit, onComplete, onVoiceStart, onVoiceTranscript, loading, disabled }: InterviewControlsProps) {
  const [input, setInput] = useState('')
  const [processingVoice, setProcessingVoice] = useState(false)
  const [recording, setRecording] = useState(false)
  const [liveMode, setLiveMode] = useState(false)
  const [retryTranscript, setRetryTranscript] = useState<string | null>(null)
  const [voiceStatus, setVoiceStatus] = useState('Voice recording ready.')
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordingModeRef = useRef<'dictate' | 'live' | null>(null)
  const loadingRef = useRef(loading)
  const disabledRef = useRef(disabled)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const onSubmitRef = useRef(onSubmit)
  const onVoiceStartRef = useRef(onVoiceStart)
  const onVoiceTranscriptRef = useRef(onVoiceTranscript)
  const streamRef = useRef<MediaStream | null>(null)

  const supportsVoice = useMemo(() => {
    return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== 'undefined'
  }, [])

  useEffect(() => {
    loadingRef.current = loading
    disabledRef.current = disabled
    onSubmitRef.current = onSubmit
    onVoiceStartRef.current = onVoiceStart
    onVoiceTranscriptRef.current = onVoiceTranscript
  }, [disabled, loading, onSubmit, onVoiceStart, onVoiceTranscript])

  const submitAnswer = useCallback(async (value: string) => {
    const trimmed = value.trim()
    if (!trimmed || loadingRef.current || disabledRef.current) return false
    const sent = await onSubmitRef.current(trimmed)
    if (sent) {
      setInput('')
    }
    return sent
  }, [])

  const transcribeBlob = useCallback(
    async (blob: Blob, shouldAutoSend: boolean) => {
      if (blob.size < 800) {
        setVoiceStatus('No speech captured. Try again.')
        return
      }

      setVoiceStatus('Transcribing voice...')
      setVoiceError(null)
      setProcessingVoice(true)

      try {
        const audioBase64 = await blobToBase64(blob)
        const transcript = (await transcribeVoice(audioBase64, blob.type || 'audio/webm')).trim()

        if (!transcript) {
          setVoiceStatus('No speech detected. Try again.')
          return
        }

        if (shouldAutoSend) {
          setRetryTranscript(transcript)
          onVoiceTranscriptRef.current?.(transcript)
          setVoiceStatus('Sending voice question...')
          const sent = await submitAnswer(transcript)
          onVoiceTranscriptRef.current?.(null)

          if (sent) {
            setRetryTranscript(null)
            setVoiceStatus('Voice question sent. Waiting for interviewer.')
          } else {
            setInput(transcript)
            setVoiceStatus('Voice question was transcribed but not sent.')
            setVoiceError('The message call failed. Click Retry voice or Send answer to try again.')
          }
        } else {
          setInput((current) => `${current}${current ? ' ' : ''}${transcript}`.trim())
          setVoiceStatus('Voice transcribed.')
        }
      } catch (error) {
        setVoiceStatus('Voice recording ready.')
        setVoiceError(`${(error as Error).message || 'Unable to transcribe voice.'} Please click Dictate or Live and try again.`)
      } finally {
        setProcessingVoice(false)
      }
    },
    [submitAnswer],
  )

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
    }
  }, [])

  const startRecording = useCallback(
    async (mode: 'dictate' | 'live') => {
      if (!supportsVoice) {
        setVoiceError('Voice recording is not supported in this browser.')
        return
      }

      if (disabledRef.current || loadingRef.current || processingVoice) return

      stopRecording()
      chunksRef.current = []
      recordingModeRef.current = mode
      setLiveMode(mode === 'live')
      setRecording(true)
      setVoiceError(null)
      setRetryTranscript(null)
      setVoiceStatus(mode === 'live' ? 'Live voice is recording. Click Finish when you are done asking.' : 'Recording. Click Dictate again to stop.')
      onVoiceStartRef.current?.()

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mimeType = getPreferredMimeType()
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
        streamRef.current = stream
        mediaRecorderRef.current = recorder

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data)
          }
        }

        recorder.onerror = () => {
          setVoiceError('Voice recording failed.')
          setVoiceStatus('Voice recording ready.')
          setRecording(false)
          setLiveMode(false)
          recordingModeRef.current = null
          stopStream(streamRef.current)
          streamRef.current = null
        }

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
          const autoSend = recordingModeRef.current === 'live'
          chunksRef.current = []
          recordingModeRef.current = null
          setRecording(false)
          setLiveMode(false)
          stopStream(streamRef.current)
          streamRef.current = null
          void transcribeBlob(blob, autoSend)
        }

        recorder.start()
      } catch (error) {
        setRecording(false)
        setLiveMode(false)
        recordingModeRef.current = null
        setVoiceStatus('Voice recording ready.')
        setVoiceError((error as Error).message || 'Microphone permission was denied.')
        stopStream(streamRef.current)
        streamRef.current = null
      }
    },
    [processingVoice, stopRecording, supportsVoice, transcribeBlob],
  )

  const stopLiveMode = useCallback(() => {
    recordingModeRef.current = null
    setLiveMode(false)
    stopRecording()
  }, [stopRecording])

  const retryVoiceAnswer = useCallback(async () => {
    if (!retryTranscript || loadingRef.current || disabledRef.current || processingVoice) return

    setProcessingVoice(true)
    setVoiceError(null)
    setVoiceStatus('Retrying voice question...')
    onVoiceTranscriptRef.current?.(retryTranscript)
    const sent = await submitAnswer(retryTranscript)
    onVoiceTranscriptRef.current?.(null)

    if (sent) {
      setRetryTranscript(null)
      setVoiceStatus('Voice question sent. Waiting for interviewer.')
    } else {
      setInput(retryTranscript)
      setVoiceStatus('Voice question was not sent.')
      setVoiceError('Retry failed. Check the API error above, then click Retry voice again.')
    }

    setProcessingVoice(false)
  }, [processingVoice, retryTranscript, submitAnswer])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await submitAnswer(input)
  }

  useEffect(() => {
    if (disabled || loading) {
      recordingModeRef.current = null
      stopRecording()
    }
  }, [disabled, loading, stopRecording])

  useEffect(() => {
    return () => {
      recordingModeRef.current = null
      stopRecording()
      stopStream(streamRef.current)
    }
  }, [stopRecording])

  return (
    <div className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-5 shadow-soft">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="block text-sm font-semibold text-slate-200">Your answer</label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={recording && !liveMode ? 'primary' : 'secondary'}
              className="gap-2 px-4 py-2"
              onClick={() => (recording && !liveMode ? stopRecording() : startRecording('dictate'))}
              disabled={!supportsVoice || loading || disabled || liveMode || processingVoice}
            >
              {recording && !liveMode ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              Dictate
            </Button>
            <Button
              type="button"
              variant={liveMode ? 'primary' : 'secondary'}
              className="gap-2 px-4 py-2"
              onClick={() => (liveMode ? stopLiveMode() : startRecording('live'))}
              disabled={!supportsVoice || loading || disabled || (recording && !liveMode) || processingVoice}
            >
              {liveMode ? <MicOff className="h-4 w-4" /> : <Radio className="h-4 w-4" />}
              {liveMode ? 'Finish' : 'Live'}
            </Button>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="min-h-[140px] w-full resize-none rounded-3xl border border-slate-700 bg-slate-900 px-4 py-4 text-sm text-slate-100 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          placeholder={liveMode ? 'Speak your question. Click Finish when done.' : 'Type or dictate your answer'}
          disabled={disabled}
        />
        <div className="min-h-6 text-sm">
          <p className={cn('text-slate-500', recording && 'text-emerald-300')}>{supportsVoice ? voiceStatus : 'Voice recording is not supported in this browser.'}</p>
          {voiceError ? <p className="mt-2 text-rose-300">{voiceError}</p> : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <Button type="submit" className="gap-2" disabled={loading || disabled || !input.trim()}>
              <Send className="h-4 w-4" />
              {loading ? 'Sending...' : 'Send answer'}
            </Button>
            {retryTranscript ? (
              <Button type="button" variant="secondary" className="gap-2" onClick={retryVoiceAnswer} disabled={loading || disabled || processingVoice}>
                <RotateCcw className="h-4 w-4" />
                Retry voice
              </Button>
            ) : null}
            <Button type="button" variant="secondary" className="gap-2" onClick={() => setInput('')} disabled={loading || disabled || !input}>
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          </div>
          <Button type="button" variant="secondary" onClick={onComplete} disabled={disabled || loading}>
            Complete interview
          </Button>
        </div>
      </form>
    </div>
  )
}
