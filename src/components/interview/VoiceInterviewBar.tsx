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
}: VoiceInterviewBarProps) {
  const view = describe(phase, liveMode)

  return (
    <section
      className={cn(
        'rounded-[2rem] border p-6 shadow-soft transition-colors',
        view.tone === 'you' ? 'border-emerald-500/40 bg-emerald-500/5' : view.tone === 'interviewer' ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-slate-800/80 bg-slate-950/90',
      )}
      aria-label="Voice interview"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <span
          className={cn(
            'grid h-14 w-14 place-items-center rounded-full',
            view.tone === 'you' ? 'bg-emerald-500 text-pure' : view.tone === 'interviewer' ? 'bg-primary text-pure' : 'bg-slate-800 text-slate-300',
          )}
        >
          {view.tone === 'you' ? <Mic className="h-6 w-6" aria-hidden="true" /> : <Volume2 className="h-6 w-6" aria-hidden="true" />}
        </span>
        <div aria-live="polite">
          <p className="text-lg font-semibold text-white">{view.title}</p>
          {view.detail ? <p className="mt-1 text-sm text-slate-400">{view.detail}</p> : null}
        </div>
        <Waveform level={level} tone={view.tone} />
        {error ? <p className="text-sm text-amber-300">{error}</p> : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
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
