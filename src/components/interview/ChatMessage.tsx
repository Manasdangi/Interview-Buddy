import type { InterviewMessage } from '../../types/interview'
import { User, Bot, Volume2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { formatMessageTime } from '../../utils/formatTime'
import { speakText } from '../../utils/speechText'
import { MarkdownContent } from './MarkdownContent'

type ChatMessageProps = {
  message: InterviewMessage
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAi = message.role === 'AI'
  const timestamp = new Date(message.createdAt)
  const hasValidTime = !Number.isNaN(timestamp.getTime())

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-4 text-sm text-slate-200 shadow-soft sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3 text-slate-400">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-slate-200">
            {isAi ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
          </div>
          <span className="font-semibold text-slate-100">{isAi ? 'Interviewer' : 'You'}</span>
          {hasValidTime ? (
            <time dateTime={message.createdAt} title={timestamp.toLocaleString()} className="truncate text-xs text-slate-500">
              {formatMessageTime(message.createdAt)}
            </time>
          ) : (
            <span className="truncate text-xs text-slate-500">{message.createdAt}</span>
          )}
        </div>
        {isAi ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => speakText(message.content)}
            title="Read aloud"
            aria-label="Read this message aloud"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
      <MarkdownContent>{message.content}</MarkdownContent>
    </div>
  )
}
