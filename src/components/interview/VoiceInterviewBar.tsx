import { Headphones, Mic, RotateCcw, SkipForward, Square } from 'lucide-react'
import type { VoicePhase } from '../../hooks/useVoiceInterview'
import { cn } from '../../utils/cn'
import { Button } from '../ui/Button'

type VoiceInterviewBarProps = {
  phase: VoicePhase
  level: number
  error: string | null
  voices: SpeechSynthesisVoice[]
  voiceName: string | null
  canRetrySend: boolean
  onVoiceChange: (name: string) => void
  onSkipSpeaking: () => void
  onFinishAnswer: () => void
  onAnswerNow: () => void
  onRetrySend: () => void
  onStop: () => void
}

const statusText: Record<VoicePhase, string> = {
  off: '',
  speaking: 'Interviewer is speaking...',
  listening: 'Listening. Speak your answer; I will send it when you pause.',
  transcribing: 'Turning your answer into text...',
  sending: 'Sending your answer...',
  waiting: 'Interviewer is thinking...',
  idle: 'Paused.',
}

const meterBars = 14

function LevelMeter({ level, active }: { level: number; active: boolean }) {
  const lit = Math.round(level * meterBars)

  return (
    <div className="flex h-6 items-end gap-0.5" aria-hidden="true">
      {Array.from({ length: meterBars }, (_, index) => (
        <span
          key={index}
          className={cn('w-1 rounded-full transition-all duration-100', active && index < lit ? 'bg-emerald-400' : 'bg-slate-700')}
          style={{ height: `${30 + (index / meterBars) * 70}%` }}
        />
      ))}
    </div>
  )
}

export function VoiceInterviewBar({
  phase,
  level,
  error,
  voices,
  voiceName,
  canRetrySend,
  onVoiceChange,
  onSkipSpeaking,
  onFinishAnswer,
  onAnswerNow,
  onRetrySend,
  onStop,
}: VoiceInterviewBarProps) {
  const listening = phase === 'listening'

  return (
    <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-4" role="region" aria-label="Voice interview">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={cn('flex h-10 w-10 items-center justify-center rounded-full', listening ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-emerald-300')}>
            {listening ? <Mic className="h-5 w-5" /> : <Headphones className="h-5 w-5" />}
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Voice interview</p>
            <p className="text-sm text-slate-300" aria-live="polite">{statusText[phase]}</p>
          </div>
        </div>
        <LevelMeter level={level} active={listening} />
      </div>

      {error ? <p className="mt-3 text-sm text-amber-300">{error}</p> : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {phase === 'speaking' ? (
          <Button type="button" variant="secondary" className="gap-2 px-4 py-2" onClick={onSkipSpeaking}>
            <SkipForward className="h-4 w-4" />
            Skip and answer
          </Button>
        ) : null}
        {listening ? (
          <Button type="button" className="gap-2 px-4 py-2" onClick={onFinishAnswer}>
            <Square className="h-4 w-4" />
            I&apos;m done answering
          </Button>
        ) : null}
        {phase === 'idle' ? (
          <Button type="button" className="gap-2 px-4 py-2" onClick={onAnswerNow}>
            <Mic className="h-4 w-4" />
            Answer
          </Button>
        ) : null}
        {canRetrySend ? (
          <Button type="button" variant="secondary" className="gap-2 px-4 py-2" onClick={onRetrySend}>
            <RotateCcw className="h-4 w-4" />
            Send again
          </Button>
        ) : null}
        <Button type="button" variant="ghost" className="px-4 py-2" onClick={onStop}>
          Stop voice mode
        </Button>

        {voices.length > 1 ? (
          <label className="ml-auto flex items-center gap-2 text-xs text-slate-400">
            Interviewer voice
            <select
              value={voiceName ?? ''}
              onChange={(event) => onVoiceChange(event.target.value)}
              className="max-w-[200px] rounded-xl border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200"
            >
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
    </div>
  )
}
