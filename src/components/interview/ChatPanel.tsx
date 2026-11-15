import type { InterviewMessage } from '../../types/interview'
import { ChatMessage } from './ChatMessage'

type ChatPanelProps = {
  messages: InterviewMessage[]
  pendingVoiceTranscript?: string | null
  /** Interviewer reply text streaming in. */
  streamingReply?: string | null
}

export function ChatPanel({ messages, pendingVoiceTranscript, streamingReply }: ChatPanelProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {pendingVoiceTranscript ? (
        <ChatMessage
          message={{
            id: 'pending-voice-transcript',
            role: 'USER',
            content: pendingVoiceTranscript,
            createdAt: 'Sending...',
          }}
        />
      ) : null}
      {streamingReply ? (
        <ChatMessage message={{ id: 'streaming-reply', role: 'AI', content: streamingReply, createdAt: 'Speaking...' }} />
      ) : null}
    </div>
  )
}
