import type { InterviewMessage } from '../../types/interview'
import { User, Bot, Volume2 } from 'lucide-react'
import { Button } from '../ui/Button'

type ChatMessageProps = {
  message: InterviewMessage
}

type Segment = { kind: 'text' | 'code'; value: string }

/** Shows ISO timestamps as a local time; placeholders such as "Sending..." pass through unchanged. */
function formatMessageTime(createdAt: string) {
  const time = Date.parse(createdAt)
  return Number.isNaN(time) ? createdAt : new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/** Splits ``` fenced blocks out of a message so code renders in a monospace block. */
function splitSegments(content: string): Segment[] {
  const segments: Segment[] = []
  const pattern = /```[a-zA-Z0-9]*\n?([\s\S]*?)```/g
  let cursor = 0

  for (const match of content.matchAll(pattern)) {
    if (match.index > cursor) segments.push({ kind: 'text', value: content.slice(cursor, match.index) })
    segments.push({ kind: 'code', value: match[1].replace(/\n$/, '') })
    cursor = match.index + match[0].length
  }

  if (cursor < content.length) segments.push({ kind: 'text', value: content.slice(cursor) })
  return segments.filter((segment) => segment.value.trim().length > 0)
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
          <span className="truncate text-xs uppercase tracking-[0.24em] text-slate-500">{formatMessageTime(message.createdAt)}</span>
        </div>
        {isAi ? (
          <Button type="button" variant="ghost" className="h-10 w-10 shrink-0 rounded-full p-0" onClick={speakMessage} title="Read aloud" aria-label="Read aloud">
            <Volume2 className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
      <div className="space-y-3">
        {splitSegments(message.content).map((segment, index) =>
          segment.kind === 'code' ? (
            <pre key={index} className="max-h-80 overflow-auto rounded-2xl border border-slate-800 bg-slate-900 p-4 text-xs leading-6 text-slate-200">
              <code>{segment.value}</code>
            </pre>
          ) : (
            <p key={index} className="whitespace-pre-wrap leading-7">{segment.value.trim()}</p>
          ),
        )}
      </div>
    </div>
  )
}
