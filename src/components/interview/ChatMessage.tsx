import type { InterviewMessage } from '../../types/interview'
import { User, Bot, Volume2 } from 'lucide-react'
import { Button } from '../ui/Button'

type ChatMessageProps = {
  message: InterviewMessage
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAi = message.role === 'AI'

  const speakMessage = () => {
    if (!isAi || typeof window === 'undefined' || !window.speechSynthesis) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(message.content)
    utterance.rate = 0.95
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-5 text-sm text-slate-200 shadow-soft">
      <div className="mb-3 flex items-center justify-between gap-3 text-slate-400">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-3xl bg-slate-900 text-slate-200">
            {isAi ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
          </div>
          <span className="font-semibold text-slate-100">{isAi ? 'Interviewer' : 'You'}</span>
          <span className="truncate text-xs uppercase tracking-[0.24em] text-slate-500">{message.createdAt}</span>
        </div>
        {isAi ? (
          <Button type="button" variant="ghost" className="h-10 w-10 shrink-0 rounded-full p-0" onClick={speakMessage} title="Read aloud" aria-label="Read aloud">
            <Volume2 className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
      <p className="whitespace-pre-wrap leading-7">{message.content}</p>
    </div>
  )
}
