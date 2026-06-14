import type { InterviewScorecard } from '../../types/interview'
import { Card } from '../ui/Card'

type ScoreCardProps = {
  scorecard: InterviewScorecard
}

export function ScoreCard({ scorecard }: ScoreCardProps) {
  return (
    <Card className="space-y-6 border-slate-800/80">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Scorecard</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Interview evaluation</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: 'Overall', value: scorecard.overallScore },
          { label: 'Technical', value: scorecard.technicalScore },
          { label: 'Communication', value: scorecard.communicationScore },
          { label: 'Problem solving', value: scorecard.problemSolvingScore },
          { label: 'Depth', value: scorecard.depthScore },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-800/80 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{item.value}/10</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm text-slate-400">Strengths</p>
          <ul className="mt-3 space-y-2 text-slate-200">
            {scorecard.strengths.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm text-slate-400">Weaknesses</p>
          <ul className="mt-3 space-y-2 text-slate-200">
            {scorecard.weaknesses.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">Final feedback</h3>
        <p className="mt-2 text-slate-300">{scorecard.finalFeedback}</p>
      </div>
    </Card>
  )
}
