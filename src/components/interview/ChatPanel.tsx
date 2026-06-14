import type { InterviewMessage } from '../../types/interview'
import { ChatMessage } from './ChatMessage'

type ChatPanelProps = {
  messages: InterviewMessage[]
  pendingVoiceTranscript?: string | null
}

export function ChatPanel({ messages, pendingVoiceTranscript }: ChatPanelProps) {
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
    </div>
  )
}
