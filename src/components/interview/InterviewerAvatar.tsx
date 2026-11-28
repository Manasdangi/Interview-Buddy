import { cn } from '../../utils/cn'

/** A calm, friendly illustrated interviewer. The mouth moves while `speaking`; eyes blink all the time. */
export function InterviewerAvatar({ speaking, className }: { speaking: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label={speaking ? 'Interviewer is speaking' : 'Interviewer is listening'} className={cn('iv-avatar', speaking && 'is-speaking', className)}>
      <defs>
        <linearGradient id="iv-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#312e81" />
          <stop offset="1" stopColor="#0f172a" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#iv-bg)" />
      <g className="iv-body">
        {/* shoulders and shirt */}
        <path d="M22 200c0-38 30-58 78-58s78 20 78 58z" fill="#1e293b" />
        <path d="M84 144l16 22 16-22z" fill="#f1f5f9" />
        {/* neck */}
        <rect x="88" y="118" width="24" height="30" rx="10" fill="#c98f6b" />
        {/* hair back, head, hair top */}
        <ellipse cx="100" cy="82" rx="43" ry="46" fill="#1f1b24" />
        <ellipse cx="100" cy="90" rx="35" ry="40" fill="#d9a07a" />
        <path d="M63 78c4-26 24-36 40-34 18 1 32 14 34 36-10-12-22-17-37-17-14 0-27 5-37 15z" fill="#1f1b24" />
        {/* ears */}
        <ellipse cx="65" cy="92" rx="5" ry="9" fill="#cf9570" />
        <ellipse cx="135" cy="92" rx="5" ry="9" fill="#cf9570" />
        {/* eyebrows */}
        <path d="M78 79q8-5 15-1" stroke="#1f1b24" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M107 78q7-4 15 1" stroke="#1f1b24" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* eyes */}
        <g className="iv-eyes">
          <ellipse cx="86" cy="92" rx="4.2" ry="4.6" fill="#0f172a" />
          <ellipse cx="114" cy="92" rx="4.2" ry="4.6" fill="#0f172a" />
        </g>
        {/* nose */}
        <path d="M100 96q-4 10 0 13" stroke="#b97d58" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        {/* mouth */}
        <g className="iv-mouth">
          <ellipse cx="100" cy="116" rx="11" ry="5" fill="#7c2d2d" />
          <path d="M91 114q9 4 18 0" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".85" />
        </g>
      </g>
    </svg>
  )
}
