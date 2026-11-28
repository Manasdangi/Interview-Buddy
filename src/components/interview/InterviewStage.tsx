import { useEffect, useRef } from 'react'
import { Camera, CameraOff, Mic } from 'lucide-react'
import { cn } from '../../utils/cn'
import type { WebcamState } from '../../hooks/useWebcam'
import { InterviewerAvatar } from './InterviewerAvatar'

type Props = {
  interviewerName: string
  interviewerRole: string
  interviewerSpeaking: boolean
  /** The candidate is talking (microphone level is up). */
  candidateSpeaking: boolean
  camera: { state: WebcamState; stream: MediaStream | null; start: () => void; stop: () => void }
  compact?: boolean
}

function Tile({ label, active, className, children }: { label: string; active: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('iv-tile relative overflow-hidden rounded-3xl border bg-slate-900 transition', active ? 'border-emerald-400/70 shadow-[0_0_0_3px_rgba(52,211,153,0.25)]' : 'border-slate-800', className)}>
      {children}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-slate-950/75 px-2.5 py-1 text-xs font-medium text-slate-100 backdrop-blur">
        {active ? <span className="iv-wave" aria-hidden="true"><i /><i /><i /></span> : <Mic className="h-3 w-3 text-slate-400" aria-hidden="true" />}
        {label}
      </div>
    </div>
  )
}

/** Video-call style stage: the interviewer on one side, the candidate's own camera on the other. */
export function InterviewStage({ interviewerName, interviewerRole, interviewerSpeaking, candidateSpeaking, camera, compact }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.srcObject = camera.stream
    if (camera.stream) void video.play().catch(() => undefined)
  }, [camera.stream])

  return (
    <section aria-label="Interview call" className={cn('grid gap-3', compact ? 'grid-cols-2' : 'sm:grid-cols-2')}>
      <Tile label={`${interviewerName} · ${interviewerRole}`} active={interviewerSpeaking} className="aspect-[4/3]">
        <InterviewerAvatar speaking={interviewerSpeaking} className="h-full w-full" />
      </Tile>
      <Tile label="You" active={candidateSpeaking} className="aspect-[4/3]">
        {camera.state === 'on' ? (
          <video ref={videoRef} muted playsInline autoPlay className="h-full w-full -scale-x-100 object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-900 px-4 text-center">
            <CameraOff className="h-7 w-7 text-slate-500" aria-hidden="true" />
            <p className="text-xs text-slate-400">
              {camera.state === 'denied'
                ? 'Camera is blocked. Allow it in the address bar to see yourself.'
                : camera.state === 'unsupported'
                  ? 'Camera is not available on this device.'
                  : 'Camera is off'}
            </p>
            {camera.state !== 'unsupported' ? (
              <button
                type="button"
                onClick={camera.start}
                disabled={camera.state === 'starting'}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-200 transition hover:border-slate-500 disabled:opacity-60"
              >
                <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                {camera.state === 'starting' ? 'Starting…' : 'Turn on camera'}
              </button>
            ) : null}
          </div>
        )}
        {camera.state === 'on' ? (
          <button
            type="button"
            onClick={camera.stop}
            aria-label="Turn camera off"
            className="absolute right-2 top-2 rounded-full bg-slate-950/70 p-1.5 text-slate-200 backdrop-blur transition hover:bg-slate-950"
          >
            <CameraOff className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </Tile>
    </section>
  )
}
