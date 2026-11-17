import { lazy, Suspense, useCallback, useEffect, useEffectEvent, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronDown, Code2, Mic } from 'lucide-react'
import { useInterviewStore } from '../store/interviewStore'
import { ChatPanel } from '../components/interview/ChatPanel'
import { InterviewControls } from '../components/interview/InterviewControls'
import { InterviewTimer } from '../components/interview/InterviewTimer'
import { ProblemStatement } from '../components/interview/ProblemStatement'
import { VoiceInterviewBar } from '../components/interview/VoiceInterviewBar'
import { useVoiceInterview } from '../hooks/useVoiceInterview'
import { isLiveVoiceSupported, useLiveVoice } from '../hooks/useLiveVoice'
import { isAudioUnlocked, LiveSpeaker, unlockAudio } from '../utils/liveSpeaker'
import { starterCode } from '../utils/starterCode'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Loader } from '../components/ui/Loader'
import { saveQuitSummary as saveQuitSummaryApi } from '../services/interviewApi'
import { cn } from '../utils/cn'

// The editor pulls in the Sandpack bundler, so it only loads when the interview actually uses it.
const CodeEditorPanel = lazy(() => import('../components/interview/CodeEditorPanel'))
const maxMessageLength = 12_000

export default function InterviewRoomPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { currentSession, loadingSession, sending, completing, error, streamingReply, loadSession, sendAnswer, completeInterview, resetInterview } = useInterviewStore()
  const [pendingVoiceTranscript, setPendingVoiceTranscript] = useState<string | null>(null)
  // The interview is a spoken conversation by default; typing is the fallback.
  const [voiceInterview, setVoiceInterview] = useState(true)
  // Browsers only play audio after a tap. Starting a round from the company page counts; a reload needs one tap.
  const [audioReady, setAudioReady] = useState(isAudioUnlocked)
  const [liveUnavailable, setLiveUnavailable] = useState<string | null>(null)
  const typedSpeakerRef = useRef<LiveSpeaker | null>(null)
  const [showEditor, setShowEditor] = useState<boolean | null>(null)
  const [attachCode, setAttachCode] = useState(true)
  const [attachError, setAttachError] = useState<string | null>(null)
  const [codeEdited, setCodeEdited] = useState(false)
  const editorCodeRef = useRef('')
  const controlsRef = useRef<HTMLDivElement | null>(null)
  const chatScrollRef = useRef<HTMLDivElement | null>(null)
  const [sessionInfoOpen, setSessionInfoOpen] = useState(false)
  const lastAutoScrolledMessageIdRef = useRef<string | null>(null)
  const lastSpokenMessageIdRef = useRef<string | null>(null)
  const allowBrowserBackRef = useRef(false)
  const exitInProgressRef = useRef(false)
  const historyGuardArmedRef = useRef(false)
  const quitSummarySavedForRef = useRef<string | null>(null)
  const hasActiveInterview = currentSession?.status === 'ACTIVE'
  const micSupported = typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia)
  const latestMessage = currentSession?.messages.at(-1)
  const pendingQuestion = hasActiveInterview && latestMessage?.role === 'AI' ? { id: latestMessage.id, content: latestMessage.content } : null

  // Machine-coding rounds open the editor by default; other rounds can still turn it on.
  const editorOpen = showEditor ?? currentSession?.interviewType === 'ROUND_2'

  const handleCodeChange = useCallback((code: string) => {
    editorCodeRef.current = code
    const edited = code.trim().length > 0 && code.trim() !== starterCode.trim()
    setCodeEdited((current) => (current === edited ? current : edited))
  }, [])

  // Typed and spoken answers both carry the editor code once the candidate has edited it.
  const handleSend = useCallback(
    async (message: string, onDelta?: (text: string) => void) => {
      const shouldAttach = editorOpen && attachCode && codeEdited
      const fullMessage = shouldAttach ? `${message}\n\n\`\`\`tsx\n${editorCodeRef.current.trim()}\n\`\`\`` : message

      if (fullMessage.length > maxMessageLength) {
        setAttachError(`Your answer plus code is ${fullMessage.length - maxMessageLength} characters over the ${maxMessageLength} limit. Shorten the code or untick "Attach my code".`)
        return false
      }

      setAttachError(null)
      setPendingVoiceTranscript(message)
      const ok = await sendAnswer(fullMessage, onDelta)
      setPendingVoiceTranscript(null)
      return ok
    },
    [attachCode, codeEdited, editorOpen, sendAnswer],
  )

  // Chrome/Edge get ChatGPT-style live voice; other browsers use record-and-transcribe voice mode.
  const voiceMode = voiceInterview && micSupported
  const useLive = voiceMode && isLiveVoiceSupported() && !liveUnavailable
  const live = useLiveVoice({
    enabled: useLive && audioReady && hasActiveInterview,
    sessionId: sessionId ?? '',
    pendingQuestion,
    submit: handleSend,
    onTranscript: setPendingVoiceTranscript,
    onUnavailable: setLiveUnavailable,
  })

  const voice = useVoiceInterview({
    enabled: voiceMode && !useLive && audioReady && hasActiveInterview,
    sessionId: sessionId ?? '',
    pendingQuestion,
    onSubmit: handleSend,
    onTranscript: setPendingVoiceTranscript,
  })

  const activeVoice = useLive ? live : voice

  const saveQuitSummary = async () => {
    if (!currentSession || currentSession.status !== 'ACTIVE') return
    if (quitSummarySavedForRef.current === currentSession.id) return
    quitSummarySavedForRef.current = currentSession.id
    await saveQuitSummaryApi(currentSession.id, { keepalive: true })
  }

  const stopSpeech = () => {
    typedSpeakerRef.current?.stop()
    window.speechSynthesis?.cancel()
  }

  // The interviewer always reads questions aloud (there is no mute), as in a real interview.
  const speakQuestion = (message: { id: string; content: string }) => {
    if (!sessionId) return
    lastSpokenMessageIdRef.current = message.id
    typedSpeakerRef.current ??= new LiveSpeaker({ sessionId })
    typedSpeakerRef.current.speakAll(message.content)
  }
  const onNewQuestion = useEffectEvent(speakQuestion)

  const confirmExitInterview = async () => {
    if (!hasActiveInterview) return true

    const shouldLeave = window.confirm('If you leave this screen, you will lose your interview progress.')
    if (!shouldLeave) return false

    exitInProgressRef.current = true
    stopSpeech()
    await saveQuitSummary()
    resetInterview()
    return true
  }

  // Effect events always see the latest session without re-subscribing the listeners below.
  const onPageHide = useEffectEvent(() => {
    void saveQuitSummary()
  })
  const onConfirmExit = useEffectEvent(() => confirmExitInterview())

  useEffect(() => {
    if (!sessionId) return
    if (exitInProgressRef.current) return
    if (!currentSession || currentSession.id !== sessionId) {
      loadSession(sessionId)
    }
  }, [currentSession, loadSession, sessionId])

  useEffect(() => {
    if (currentSession?.status === 'COMPLETED') {
      navigate(`/results/${currentSession.id}`)
    }
  }, [currentSession?.id, currentSession?.status, navigate])

  useEffect(() => {
    // Voice mode reads the questions itself; when typing, the interviewer still speaks every question.
    if (voiceMode || !audioReady) return

    const newest = currentSession?.messages.at(-1)
    if (!newest || newest.role !== 'AI' || newest.id === lastSpokenMessageIdRef.current) return
    onNewQuestion(newest)
  }, [currentSession?.messages, voiceMode, audioReady])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const newest = currentSession?.messages.at(-1)
    if (!newest || newest.role !== 'AI' || newest.id === lastAutoScrolledMessageIdRef.current) return

    lastAutoScrolledMessageIdRef.current = newest.id
    const frameId = window.requestAnimationFrame(() => {
      controlsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [currentSession?.messages])

  // In the coding layout the chat scrolls inside its card; keep the newest message (and streaming reply) in view.
  useEffect(() => {
    const container = chatScrollRef.current
    if (container && editorOpen) container.scrollTop = container.scrollHeight
  }, [currentSession?.messages.length, streamingReply, pendingVoiceTranscript, editorOpen])

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel()
    }
  }, [])

  useEffect(() => {
    if (!hasActiveInterview) return undefined

    // Only prompt here; the user may still cancel. The summary is saved on pagehide, once the page is really leaving.
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    const handlePageHide = () => {
      onPageHide()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handlePageHide)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [hasActiveInterview])

  useEffect(() => {
    if (!hasActiveInterview || typeof window === 'undefined') return undefined

    if (!historyGuardArmedRef.current) {
      window.history.pushState({ interviewGuard: true }, '', window.location.href)
      historyGuardArmedRef.current = true
    }

    const handlePopState = async () => {
      if (allowBrowserBackRef.current) {
        allowBrowserBackRef.current = false
        return
      }

      if (!(await onConfirmExit())) {
        window.history.pushState({ interviewGuard: true }, '', window.location.href)
        return
      }

      allowBrowserBackRef.current = true
      window.history.back()
    }

    const handleDocumentClick = async (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const target = event.target
      if (!(target instanceof Element)) return

      const link = target.closest('a[href]')
      if (!(link instanceof HTMLAnchorElement)) return
      if (link.target && link.target !== '_self') return
      if (link.hasAttribute('download')) return

      const nextUrl = new URL(link.href, window.location.href)
      const currentUrl = new URL(window.location.href)
      if (nextUrl.origin !== currentUrl.origin) return

      const nextPath = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
      const currentPath = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`
      if (nextPath === currentPath) return

      event.preventDefault()

      if (await onConfirmExit()) {
        navigate(nextPath)
      }
    }

    window.addEventListener('popstate', handlePopState)
    document.addEventListener('click', handleDocumentClick, true)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      document.removeEventListener('click', handleDocumentClick, true)
      historyGuardArmedRef.current = false
      allowBrowserBackRef.current = false
    }
  }, [hasActiveInterview, navigate])

  if (!sessionId) {
    return <p className="text-slate-300">Invalid interview session.</p>
  }

  if (loadingSession && !currentSession) {
    return <Loader />
  }

  if (error && !currentSession) {
    return (
      <Card className="rounded-[2rem] border-rose-700/40 bg-rose-950/70 p-6 text-rose-100 shadow-soft">
        <div className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-rose-300/80">Interview unavailable</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">We couldn&apos;t load this interview session.</h1>
          </div>
          <p className="text-sm text-rose-100/90">{error}</p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={() => {
                navigate('/dashboard')
              }}
            >
              Go to dashboard
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (sessionId) {
                  void loadSession(sessionId)
                }
              }}
            >
              Retry loading
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  if (!currentSession) {
    return <p className="text-slate-300">Preparing interview session...</p>
  }

  const handleComplete = async () => {
    await completeInterview()
  }

  // The time limit ends the interview like a real round: whatever was answered so far gets scored.
  const handleTimeUp = () => {
    if (currentSession.status === 'ACTIVE' && !completing) {
      void completeInterview()
    }
  }

  const maxDurationSeconds = currentSession.company ? currentSession.company.durationMinutes * 60 : undefined
  // One timer owns the time limit; the popover copy below is display-only.
  const timer = (
    <InterviewTimer
      startedAt={currentSession.startedAt}
      completedAt={currentSession.completedAt}
      messages={currentSession.messages}
      maxDurationSeconds={maxDurationSeconds}
      onTimeUp={handleTimeUp}
      variant={editorOpen ? 'compact' : 'full'}
    />
  )

  const notices = (
    <>
      {error ? <div className="rounded-3xl border border-rose-700/40 bg-rose-950/80 p-4 text-sm text-rose-200">{error}</div> : null}
      {hasActiveInterview && !audioReady ? (
        <Card className="rounded-[2rem] border-indigo-500/40 bg-indigo-950/40 p-6 text-center shadow-soft">
          <h2 className="text-2xl font-semibold text-white">Your interviewer is ready</h2>
          <p className="mt-2 text-slate-300">The interviewer will ask each question out loud. Answer by speaking, just like a real interview.</p>
          <Button
            className="mt-5 gap-2"
            onClick={() => {
              unlockAudio()
              setAudioReady(true)
            }}
          >
            <Mic className="h-4 w-4" />
            Start interview
          </Button>
        </Card>
      ) : null}
    </>
  )

  const chatCard = (
    <Card className={cn('rounded-[2rem] border-slate-800/80 bg-slate-950/90 shadow-soft', editorOpen ? 'p-5' : 'p-6')}>
      <div className={cn('flex items-center justify-between gap-4', editorOpen ? 'mb-4' : 'mb-6')}>
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Live interviewer</p>
          <h2 className={cn('mt-2 font-semibold text-white', editorOpen ? 'text-xl' : 'text-2xl')}>AI Interview Chat</h2>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant={editorOpen ? 'primary' : 'secondary'} className="gap-2" onClick={() => setShowEditor(!editorOpen)}>
            <Code2 className="h-4 w-4" />
            {editorOpen ? 'Close editor' : 'Code editor'}
          </Button>
          {editorOpen ? null : (
            <Button
              variant="ghost"
              onClick={async () => {
                if (await confirmExitInterview()) {
                  navigate('/dashboard')
                }
              }}
            >
              Back to dashboard
            </Button>
          )}
        </div>
      </div>

      {/* Beside the editor the chat scrolls on its own so the voice panel stays in view. */}
      <div ref={chatScrollRef} className={cn('space-y-4', editorOpen && 'max-h-[calc(100vh-460px)] min-h-[200px] overflow-y-auto pr-1')}>
        <ChatPanel messages={currentSession.messages} pendingVoiceTranscript={pendingVoiceTranscript} streamingReply={streamingReply} />
      </div>
    </Card>
  )

  const editorCard = editorOpen ? (
    <Card className="space-y-4 rounded-[2rem] border-slate-800/80 bg-slate-950/90 p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Code editor</h2>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={attachCode}
            onChange={(event) => setAttachCode(event.target.checked)}
            className="h-4 w-4 rounded border-slate-600 bg-slate-900"
          />
          Attach my code to my answer{attachCode && !codeEdited ? ' (once you edit it)' : ''}
        </label>
      </div>
      <Suspense fallback={<Loader />}>
        <CodeEditorPanel sessionId={currentSession.id} onCodeChange={handleCodeChange} side />
      </Suspense>
      {attachError ? <p className="text-sm text-rose-300">{attachError}</p> : null}
    </Card>
  ) : null

  const controls = (
    <div ref={controlsRef}>
      {voiceMode && hasActiveInterview && audioReady ? (
        <VoiceInterviewBar
          phase={activeVoice.phase}
          level={activeVoice.level}
          error={activeVoice.error ?? (useLive ? null : liveUnavailable)}
          canRetrySend={activeVoice.canRetrySend}
          onFinishAnswer={activeVoice.finishAnswer}
          onAnswerNow={activeVoice.answerNow}
          onRetrySend={activeVoice.retrySend}
          onTypeInstead={() => {
            // The current question was already read aloud; do not read it again in typing mode.
            lastSpokenMessageIdRef.current = pendingQuestion?.id ?? lastSpokenMessageIdRef.current
            setVoiceInterview(false)
          }}
          onEndInterview={handleComplete}
          ending={completing}
          liveMode={useLive}
          compact={editorOpen}
        />
      ) : (
        <InterviewControls
          onSubmit={handleSend}
          onComplete={handleComplete}
          onSwitchToVoice={
            micSupported
              ? () => {
                  stopSpeech()
                  unlockAudio()
                  setAudioReady(true)
                  setVoiceInterview(true)
                }
              : undefined
          }
          loading={sending || completing}
          disabled={currentSession.status === 'COMPLETED'}
        />
      )}
    </div>
  )

  // Coding layout: chat and voice on the left, the editor on the right, session details tucked into a popover.
  if (editorOpen) {
    const sessionLabel = currentSession.company
      ? `${currentSession.company.companyName} · ${currentSession.company.roundTitle}`
      : `${currentSession.interviewType.replace('_', ' ')} · ${currentSession.difficulty.toLowerCase()}`

    return (
      <div className="space-y-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setSessionInfoOpen((open) => !open)}
            aria-expanded={sessionInfoOpen}
            className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-950/90 px-4 py-2 text-sm text-slate-200 shadow-soft transition hover:border-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="font-medium text-white">{sessionLabel}</span>
            <span className="text-slate-600">|</span>
            {timer}
            <ChevronDown className={cn('h-4 w-4 text-slate-400 transition', sessionInfoOpen && 'rotate-180')} aria-hidden="true" />
          </button>
          {sessionInfoOpen ? (
            <>
              <button type="button" aria-label="Close session details" className="fixed inset-0 z-30 cursor-default" onClick={() => setSessionInfoOpen(false)} />
              <div className="absolute left-0 top-12 z-40 w-[min(360px,90vw)] space-y-4 rounded-[2rem] border border-slate-800 bg-slate-950 p-4 shadow-soft">
                <ProblemStatement session={currentSession} />
                <InterviewTimer
                  startedAt={currentSession.startedAt}
                  completedAt={currentSession.completedAt}
                  messages={currentSession.messages}
                  maxDurationSeconds={maxDurationSeconds}
                />
              </div>
            </>
          ) : null}
        </div>
        {notices}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="space-y-4">
            {chatCard}
            {controls}
          </div>
          <div className="xl:sticky xl:top-24 xl:self-start">{editorCard}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[320px_1fr]">
      <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        <ProblemStatement session={currentSession} />
        <Card className="rounded-[2rem] border-slate-800/80 bg-slate-950/90 p-6 shadow-soft">
          {timer}
          <div className="mt-6 space-y-3 text-slate-400">
            <p className="text-sm font-medium text-white">How it works</p>
            <p>The interviewer asks each question out loud. When it&apos;s your turn, answer by speaking; pause for a moment and your answer is sent.</p>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        {notices}
        {chatCard}
        {controls}
      </div>
    </div>
  )
}
