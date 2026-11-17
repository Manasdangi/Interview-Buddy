import { Keyboard, Mic, RotateCcw, Square, Volume2 } from 'lucide-react'
import type { VoicePhase } from '../../hooks/useVoiceInterview'
import { cn } from '../../utils/cn'
import { Button } from '../ui/Button'

type VoiceInterviewBarProps = {
  phase: VoicePhase
  level: number
  error: string | null
  canRetrySend: boolean
  onFinishAnswer: () => void
  onAnswerNow: () => void
  onRetrySend: () => void
  /** Switch to typing answers. */
  onTypeInstead: () => void
  onEndInterview: () => void
  ending?: boolean
  /** ChatGPT-style live mode: the candidate can talk over the interviewer. */
  liveMode?: boolean
  /** Smaller panel for the coding layout. */
  compact?: boolean
}

type PhaseView = { title: string; detail: string; tone: 'interviewer' | 'you' | 'wait' }

function describe(phase: VoicePhase, liveMode: boolean): PhaseView {
  switch (phase) {
    case 'speaking':
      return {
        title: 'Interviewer is speaking',
        detail: liveMode ? 'Listen, then answer. You can also cut in any time, like a real call.' : 'Listen. Your turn starts when the question ends.',
        tone: 'interviewer',
      }
    case 'listening':
      return { title: 'Your turn — speak now', detail: 'Answer out loud. When you pause, your answer is sent.', tone: 'you' }
    case 'transcribing':
    case 'sending':
    case 'waiting':
      return { title: 'Interviewer is thinking…', detail: 'Got your answer.', tone: 'wait' }
    case 'idle':
      return { title: 'Paused', detail: 'Tap “Answer” when you are ready to speak.', tone: 'wait' }
    default:
      return { title: 'Connecting…', detail: '', tone: 'wait' }
  }
}

const meterBars = 18

/** The candidate's mic level while it is their turn, and a gentle pulse while the interviewer speaks. */
function Waveform({ level, tone }: { level: number; tone: PhaseView['tone'] }) {
  return (
    <div className="flex h-10 items-center justify-center gap-1" aria-hidden="true">
      {Array.from({ length: meterBars }, (_, index) => {
        const centre = 1 - Math.abs(index - meterBars / 2) / (meterBars / 2)
        const height = tone === 'you' ? 20 + Math.min(1, level * 1.6) * 80 * centre : tone === 'interviewer' ? 30 + 40 * centre : 15
        return (
          <span
            key={index}
            className={cn(
              'w-1.5 rounded-full transition-all duration-150',
              tone === 'you' ? 'bg-emerald-500' : tone === 'interviewer' ? 'animate-pulse bg-indigo-400' : 'bg-slate-700',
            )}
            style={{ height: `${height}%`, animationDelay: `${index * 60}ms` }}
          />
        )
      })}
    </div>
  )
}

/** The hands-free conversation panel: who is talking now, plus the few controls a real call needs. */
export function VoiceInterviewBar({
  phase,
  level,
  error,
  canRetrySend,
  onFinishAnswer,
  onAnswerNow,
  onRetrySend,
  onTypeInstead,
  onEndInterview,
  ending = false,
  liveMode = false,
  compact = false,
}: VoiceInterviewBarProps) {
  const view = describe(phase, liveMode)

  return (
    <section
      className={cn(
        'rounded-[2rem] border shadow-soft transition-colors',
        compact ? 'p-4' : 'p-6',
        view.tone === 'you' ? 'border-emerald-500/40 bg-emerald-500/5' : view.tone === 'interviewer' ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-slate-800/80 bg-slate-950/90',
      )}
      aria-label="Voice interview"
    >
      <div className={cn('flex items-center gap-3', compact ? 'flex-row text-left' : 'flex-col text-center')}>
        <span
          className={cn(
            'grid shrink-0 place-items-center rounded-full',
            compact ? 'h-10 w-10' : 'h-14 w-14',
            view.tone === 'you' ? 'bg-emerald-500 text-pure' : view.tone === 'interviewer' ? 'bg-primary text-pure' : 'bg-slate-800 text-slate-300',
          )}
        >
          {view.tone === 'you' ? <Mic className="h-6 w-6" aria-hidden="true" /> : <Volume2 className="h-6 w-6" aria-hidden="true" />}
        </span>
        <div aria-live="polite" className={compact ? 'min-w-0 flex-1' : undefined}>
          <p className={cn('font-semibold text-white', compact ? 'text-base' : 'text-lg')}>{view.title}</p>
          {view.detail ? <p className="mt-1 text-sm text-slate-400">{view.detail}</p> : null}
        </div>
        {compact ? null : <Waveform level={level} tone={view.tone} />}
        {error && !compact ? <p className="text-sm text-amber-300">{error}</p> : null}
      </div>
      {error && compact ? <p className="mt-2 text-sm text-amber-300">{error}</p> : null}

      <div className={cn('flex flex-wrap items-center gap-2', compact ? 'mt-3 justify-start' : 'mt-5 justify-center')}>
        {phase === 'listening' ? (
          <Button type="button" className="gap-2 px-4 py-2" onClick={onFinishAnswer}>
            <Square className="h-4 w-4" />
            I&apos;m done
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
        <Button type="button" variant="ghost" className="gap-2 px-4 py-2" onClick={onTypeInstead}>
          <Keyboard className="h-4 w-4" />
          Type instead
        </Button>
        <Button type="button" variant="secondary" className="px-4 py-2" onClick={onEndInterview} disabled={ending}>
          {ending ? 'Ending…' : 'End interview'}
        </Button>
      </div>
    </section>
  )
}
