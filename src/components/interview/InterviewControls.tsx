import { Mic, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button } from '../ui/Button'

type InterviewControlsProps = {
  onSubmit: (value: string) => Promise<boolean>
  onComplete: () => Promise<void>
  /** Return to the hands-free voice conversation. */
  onSwitchToVoice?: () => void
  loading: boolean
  disabled: boolean
}

/** Typed answers: the fallback when the candidate prefers typing (or has no microphone). */
export function InterviewControls({ onSubmit, onComplete, onSwitchToVoice, loading, disabled }: InterviewControlsProps) {
  const [input, setInput] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const answer = input.trim()
    if (!answer || loading || disabled) return
    if (await onSubmit(answer)) setInput('')
  }

  return (
    <div className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-5 shadow-soft">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="answer" className="block text-sm font-semibold text-slate-200">
            Your answer
          </label>
          {onSwitchToVoice ? (
            <Button type="button" variant="ghost" className="gap-2 px-3 py-1.5" onClick={onSwitchToVoice} disabled={disabled}>
              <Mic className="h-4 w-4" />
              Speak instead
            </Button>
          ) : null}
        </div>
        <textarea
          id="answer"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) event.currentTarget.form?.requestSubmit()
          }}
          className="min-h-[140px] w-full resize-none rounded-3xl border border-slate-700 bg-slate-900 px-4 py-4 text-sm text-slate-100 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          placeholder="Type your answer (Ctrl/⌘ + Enter to send)"
          disabled={disabled}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button type="submit" className="gap-2" disabled={loading || disabled || !input.trim()}>
            <Send className="h-4 w-4" />
            {loading ? 'Sending...' : 'Send answer'}
          </Button>
          <Button type="button" variant="secondary" onClick={onComplete} disabled={disabled || loading}>
            End interview
          </Button>
        </div>
      </form>
    </div>
  )
}
