import { useEffect, useRef } from 'react'
import { Bot } from 'lucide-react'
import type { InterviewMessage } from '../../types/interview'
import { ChatMessage } from './ChatMessage'

type ChatPanelProps = {
  messages: InterviewMessage[]
  /** The answer currently being sent, shown before the server confirms it. */
  pendingAnswer?: string | null
  /** Shown as an interviewer "typing" bubble while the AI works, e.g. "Thinking". */
  thinkingLabel?: string | null
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

function ThinkingIndicator({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 rounded-3xl border border-slate-800/80 bg-slate-950/90 p-4 text-sm text-slate-400 shadow-soft">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-slate-200">
        <Bot className="h-5 w-5" />
      </div>
      <span>{label}</span>
      <span className="flex gap-1" aria-hidden="true">
        {[0, 150, 300].map((delay) => (
          <span key={delay} className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400" style={{ animationDelay: `${delay}ms` }} />
        ))}
      </span>
    </div>
  )
}

export function ChatPanel({ messages, pendingAnswer, thinkingLabel }: ChatPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const lastItemRef = useRef<HTMLDivElement | null>(null)
  const lastMessageId = messages.at(-1)?.id
  const latestIsAi = !pendingAnswer && !thinkingLabel && messages.at(-1)?.role === 'AI'

  useEffect(() => {
    const container = containerRef.current
    const lastItem = lastItemRef.current
    if (!container || !lastItem) return

    // Show the start of a new question so it can be read top-down; otherwise stick to the bottom.
    const top = latestIsAi ? lastItem.offsetTop - 8 : container.scrollHeight
    container.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }, [lastMessageId, latestIsAi, pendingAnswer, thinkingLabel])

  const items = [
    ...messages.map((message) => <ChatMessage key={message.id} message={message} />),
    ...(pendingAnswer
      ? [<ChatMessage key="pending-answer" message={{ id: 'pending-answer', role: 'USER', content: pendingAnswer, createdAt: 'Sending...' }} />]
      : []),
    ...(thinkingLabel ? [<ThinkingIndicator key="thinking" label={thinkingLabel} />] : []),
  ]

  return (
    <div
      ref={containerRef}
      className="relative max-h-[max(16rem,calc(100dvh-31rem))] space-y-4 overflow-y-auto pr-1"
      aria-label="Interview conversation"
      role="log"
    >
      {items.map((item, index) => (
        <div key={item.key} ref={index === items.length - 1 ? lastItemRef : undefined}>
          {item}
        </div>
      ))}
    </div>
  )
}
