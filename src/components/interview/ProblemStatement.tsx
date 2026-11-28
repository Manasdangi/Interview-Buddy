import type { InterviewSession } from '../../types/interview'

type ProblemStatementProps = {
  session: InterviewSession
}

export function ProblemStatement({ session }: ProblemStatementProps) {
  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-5 shadow-soft">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Session info</p>
      <div className="mt-4 space-y-3 text-slate-300">
        {session.company ? (
          <>
            <p>
              <span className="font-semibold text-white">Company:</span> {session.company.companyName}
            </p>
            <p>
              <span className="font-semibold text-white">Role:</span> {session.company.roleLabel}
            </p>
            <p>
              <span className="font-semibold text-white">Round:</span> {session.company.roundTitle}
            </p>
          </>
        ) : null}
        <p>
          <span className="font-semibold text-white">Interview:</span> {session.interviewType.replace('_', ' ')}
        </p>
        <p>
          <span className="font-semibold text-white">Difficulty:</span> {session.difficulty.toLowerCase()}
        </p>
        {session.company ? null : (
          <p>
            <span className="font-semibold text-white">Set:</span> {session.questionSet ?? 1}
          </p>
        )}
        {session.dailyQuestionVariant ? (
          <p>
            <span className="font-semibold text-white">Daily variant:</span> {session.dailyQuestionVariant.questionDate}
          </p>
        ) : null}
        {session.projectChain && !session.projectChain.done && session.status === 'ACTIVE' ? (
          <p>
            <span className="font-semibold text-white">Now:</span>{' '}
            {session.projectChain.fromResume ? 'Resume deep-dive' : 'Project deep-dive'}
          </p>
        ) : null}
        <p>
          <span className="font-semibold text-white">Questions asked:</span> {session.currentQuestionCount}/{session.maxQuestions}
        </p>
        <p>
          <span className="font-semibold text-white">Started at:</span> {new Date(session.startedAt).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
