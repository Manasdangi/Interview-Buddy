import { ArrowLeft, Flag, Square, Volume2, VolumeX } from 'lucide-react'
import type { InterviewSession, InterviewType } from '../../types/interview'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'
import { InterviewTimer } from './InterviewTimer'
import { QuestionProgress } from './QuestionProgress'

const trackLabels: Record<InterviewType, string> = {
  ROUND_1: 'Round 1',
  ROUND_2: 'Round 2',
  SYSTEM_DESIGN: 'System Design',
}

type InterviewTopBarProps = {
  session: InterviewSession
  voiceReplies: boolean
  endDisabled: boolean
  onToggleVoiceReplies: () => void
  onStopSpeech: () => void
  onBack: () => void
  onEnd: () => void
}

const iconButtonClass = 'h-9 w-9 shrink-0'

export function InterviewTopBar({ session, voiceReplies, endDisabled, onToggleVoiceReplies, onStopSpeech, onBack, onEnd }: InterviewTopBarProps) {
  const answered = session.messages.filter((message) => message.role === 'USER').length
  const difficulty = session.difficulty.charAt(0) + session.difficulty.slice(1).toLowerCase()

  return (
    <div className="sticky top-0 z-20 -mx-4 border-b border-slate-800/80 bg-slate-950/95 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-3xl sm:border">
      {/* Phone: title + End on row one, progress + voice on row two. Wider screens: a single row. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-x-5">
        <div className="order-1 flex min-w-0 items-center gap-2">
          <Button type="button" variant="ghost" size="icon" className={iconButtonClass} onClick={onBack} title="Back to dashboard" aria-label="Back to dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <p className="truncate text-sm font-semibold text-white">
            {trackLabels[session.interviewType]}
            <span className="text-slate-500"> · </span>
            <span className="text-slate-300">{difficulty}</span>
            <span className="hidden text-slate-500 md:inline"> · Set {session.questionSet ?? 1}</span>
          </p>
        </div>

        <div className="order-3 flex items-center gap-4 sm:order-2">
          <QuestionProgress current={session.currentQuestionCount} total={session.maxQuestions} answered={answered} />
          <InterviewTimer startedAt={session.startedAt} completedAt={session.completedAt} />
        </div>

        <div className="order-4 ml-auto flex items-center gap-1 sm:order-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(iconButtonClass, voiceReplies && 'text-indigo-300')}
            onClick={onToggleVoiceReplies}
            aria-pressed={voiceReplies}
            title={voiceReplies ? 'Voice replies on' : 'Voice replies off'}
            aria-label="Read interviewer replies aloud"
          >
            {voiceReplies ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Button type="button" variant="ghost" size="icon" className={iconButtonClass} onClick={onStopSpeech} title="Stop speech" aria-label="Stop speech">
            <Square className="h-3.5 w-3.5" />
          </Button>
          <span className="ml-2 hidden h-6 w-px bg-slate-800 sm:block" aria-hidden="true" />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="order-2 ml-auto gap-2 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 sm:order-4 sm:ml-0"
          onClick={onEnd}
          disabled={endDisabled}
        >
          <Flag className="h-4 w-4" />
          <span>
            End<span className="hidden sm:inline"> interview</span>
          </span>
        </Button>
      </div>
    </div>
  )
}
