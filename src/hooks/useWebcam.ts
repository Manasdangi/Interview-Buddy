import { useCallback, useEffect, useRef, useState } from 'react'

export type WebcamState = 'idle' | 'starting' | 'on' | 'denied' | 'unsupported'

/**
 * Candidate camera for the interview stage. Video only (the voice interview owns the microphone) and
 * nothing is recorded or uploaded: the stream just feeds a <video> element.
 */
export function useWebcam() {
  const supported = typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia)
  const [state, setState] = useState<WebcamState>(supported ? 'idle' : 'unsupported')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setStream(null)
    setState(supported ? 'idle' : 'unsupported')
  }, [supported])

  const start = useCallback(async () => {
    if (!supported || streamRef.current) return
    setState('starting')
    try {
      const next = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      })
      streamRef.current = next
      setStream(next)
      setState('on')
    } catch {
      setState('denied')
    }
  }, [supported])

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
    },
    [],
  )

  return { state, stream, start, stop }
}
